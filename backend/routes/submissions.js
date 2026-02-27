const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const { getCodeFeedback, getCodeFeedbackStream } = require('../services/aiService');

const router = express.Router();

// Validation schema for submission
const submissionSchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
    challengeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid challenge ID'),
    code: z.string().min(1, 'Code cannot be empty'),
    language: z.string().optional().default('javascript'),
    durationMs: z.number().int().optional().nullable(),
    timezoneOffset: z.number().int().optional().nullable() // client's exact timezone offset in minutes
});

// POST /api/submissions — submit code for AI feedback
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log("Submission body:", req.body);
        const { userId, challengeId, code, language, durationMs, timezoneOffset } = submissionSchema.parse(req.body);

        // Verify user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Verify challenge exists
        const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found.' });
        }

        // Get AI feedback
        const feedback = await getCodeFeedback(code, challenge.description, challenge.rubric);
        const score = feedback.score || 0;

        // Save submission
        const submission = await prisma.submission.create({
            data: {
                userId,
                challengeId,
                code,
                language,
                durationMs,
                aiFeedback: JSON.stringify(feedback),
                score,
            },
        });

        // Compute streak safely using local timezone (if provided) or fallback to UTC
        const now = new Date();
        const { calculateStreak } = require('../lib/streak');

        let currentStreak = user.currentStreak || 0;
        if (score > 0) {
            currentStreak = calculateStreak(currentStreak, user.lastActiveDate ? new Date(user.lastActiveDate) : null, now, timezoneOffset);
        }

        // Update fastest solve time
        let newFastestTime = user.fastestSolveTime;
        if (score > 0 && durationMs) {
            if (!newFastestTime || durationMs < newFastestTime) {
                newFastestTime = durationMs;
            }
        }

        // Update user stats
        await prisma.user.update({
            where: { id: userId },
            data: {
                totalScore: { increment: score },
                currentStreak,
                lastActiveDate: score > 0 ? now : user.lastActiveDate,
                fastestSolveTime: newFastestTime
            }
        });

        // Auto-difficulty scaling: check if user's last 3 scores at their current level are all ≥ 70
        await checkAndScaleLevel(userId, user.level);

        res.status(201).json({
            submission: {
                id: submission.id,
                score: submission.score,
                submittedAt: submission.submittedAt,
            },
            feedback,
        });
    } catch (err) {
        if (err.issues) {
            return res.status(400).json({ error: err.issues[0].message });
        }
        console.error('Create submission error:', err);
        res.status(500).json({ error: 'Failed to submit code. Please try again.' });
    }
});

// POST /api/submissions/stream — submit code for AI feedback using Server-Sent Events
router.post('/stream', authMiddleware, async (req, res) => {
    try {
        const { userId, challengeId, code, language, durationMs, timezoneOffset } = submissionSchema.parse(req.body);

        // Verify user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Verify challenge exists
        const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found.' });
        }

        // Setup Server-Sent Events (SSE) Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Start Streaming from Groq
        const stream = await getCodeFeedbackStream(code, challenge.description, challenge.rubric);

        let fullResponse = "";

        // Pipe chunks immediately
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }

        // Parse fullResponse to save submission and calculate score
        let feedback;
        try {
            feedback = JSON.parse(fullResponse);
        } catch (e) {
            console.error('Failed to parse final streamed JSON feedback:', e.message);
            feedback = {
                score: 0,
                summary: 'AI evaluation stream finished but produced invalid feedback format. Please try again.',
                line_comments: [],
                next_steps: ['Check if code syntax is fundamentally broken or resubmit.']
            };
        }

        const score = feedback.score || 0;

        // Save submission
        const submission = await prisma.submission.create({
            data: {
                userId,
                challengeId,
                code,
                language,
                durationMs,
                aiFeedback: JSON.stringify(feedback),
                score,
            },
        });

        // Compute streak safely
        const now = new Date();
        const { calculateStreak } = require('../lib/streak');
        let currentStreak = user.currentStreak || 0;
        if (score > 0) {
            currentStreak = calculateStreak(currentStreak, user.lastActiveDate ? new Date(user.lastActiveDate) : null, now, timezoneOffset);
        }

        // Update fastest solve time
        let newFastestTime = user.fastestSolveTime;
        if (score > 0 && durationMs) {
            if (!newFastestTime || durationMs < newFastestTime) {
                newFastestTime = durationMs;
            }
        }

        // Update user stats
        await prisma.user.update({
            where: { id: userId },
            data: {
                totalScore: { increment: score },
                currentStreak,
                lastActiveDate: score > 0 ? now : user.lastActiveDate,
                fastestSolveTime: newFastestTime
            }
        });

        // Auto-difficulty scaling
        await checkAndScaleLevel(userId, user.level);

        res.write(`data: ${JSON.stringify({ done: true, feedback, submission: { id: submission.id, score, submittedAt: submission.submittedAt } })}\n\n`);
        res.end();
    } catch (err) {
        if (err.issues) {
            res.write(`data: ${JSON.stringify({ error: err.issues[0].message })}\n\n`);
        } else {
            console.error('Create stream submission error:', err);
            res.write(`data: ${JSON.stringify({ error: err.message || 'Failed to submit code stream' })}\n\n`);
        }
        res.end();
    }
});

// GET /api/submissions/history — Get current user's submission history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await prisma.submission.findMany({
            where: { userId },
            orderBy: { submittedAt: 'desc' },
            include: {
                challenge: {
                    select: { title: true, difficulty: true, language: true }
                }
            }
        });
        res.json(history);
    } catch (err) {
        console.error('Submission history error:', err);
        res.status(500).json({ error: 'Failed to fetch submission history.' });
    }
});

// GET /api/submissions/:userId — user submission history
router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        const submissions = await prisma.submission.findMany({
            where: { userId },
            orderBy: { submittedAt: 'desc' },
            include: {
                challenge: {
                    select: { title: true, difficulty: true, language: true },
                },
            },
        });

        res.json(submissions);
    } catch (err) {
        console.error('Get submissions error:', err);
        res.status(500).json({ error: 'Failed to fetch submissions.' });
    }
});

/**
 * Auto-difficulty scaling: if the user's last 3 scores at their current level
 * are all ≥ 70, increment their level by 1 (max 5).
 */
async function checkAndScaleLevel(userId, currentLevel) {
    if (currentLevel >= 5) return;

    try {
        const recentSubmissions = await prisma.submission.findMany({
            where: {
                userId,
                challenge: { difficulty: currentLevel },
                score: { not: null },
            },
            orderBy: { submittedAt: 'desc' },
            take: 3,
            select: { score: true },
        });

        if (recentSubmissions.length >= 3) {
            const allAbove70 = recentSubmissions.every((s) => s.score >= 70);
            if (allAbove70) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { level: currentLevel + 1 },
                });
                console.log(`User ${userId} leveled up from ${currentLevel} to ${currentLevel + 1}`);
            }
        }
    } catch (err) {
        console.error('Auto-scale level error:', err);
        // Don't throw — this is a non-critical operation
    }
}

module.exports = router;
