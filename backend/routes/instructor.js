const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is instructor
const instructorMiddleware = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'instructor') {
            return res.status(403).json({ error: 'Access denied. Instructor role required.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: 'Server error authorizing instructor.' });
    }
};

// GET /api/instructor/analytics — overall platform analytics
router.get('/analytics', authMiddleware, instructorMiddleware, async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalSubmissions = await prisma.submission.count();
        const totalChallenges = await prisma.challenge.count();

        // Get average scores and average solve time
        const stats = await prisma.submission.aggregate({
            where: { score: { gte: 0 } },
            _avg: {
                score: true,
                durationMs: true
            }
        });

        res.json({
            totalUsers,
            totalSubmissions,
            totalChallenges,
            averageScore: Math.round(stats._avg.score || 0),
            averageSolveTimeMs: Math.round(stats._avg.durationMs || 0)
        });
    } catch (err) {
        console.error('Instructor analytics error:', err);
        res.status(500).json({ error: 'Failed to fetch analytics.' });
    }
});

// POST /api/instructor/challenges — Create challenge sets
const createChallengeSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    difficulty: z.number().int().min(1).max(5),
    language: z.string().min(1),
    rubric: z.string().min(10)
});

router.post('/challenges', authMiddleware, instructorMiddleware, async (req, res) => {
    try {
        const data = createChallengeSchema.parse(req.body);

        const challenge = await prisma.challenge.create({
            data: {
                ...data,
                createdBy: req.user.id
            }
        });

        res.status(201).json(challenge);
    } catch (err) {
        if (err.issues) {
            return res.status(400).json({ error: err.issues[0].message });
        }
        res.status(500).json({ error: 'Failed to create challenge.' });
    }
});

module.exports = router;
