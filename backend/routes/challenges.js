const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const { generateChallenge, getHint } = require('../services/aiService');

const router = express.Router();

// Rate limiting map for basic protection
const generationRates = new Map();
const hintRates = new Map();

// GET /api/challenges — list all challenges with optional filters
router.get('/', async (req, res) => {
    try {
        const { difficulty, language } = req.query;

        const where = {};
        if (difficulty) {
            const diffNum = parseInt(difficulty, 10);
            if (!isNaN(diffNum)) where.difficulty = diffNum;
        }
        if (language) {
            where.language = language.toLowerCase();
        }

        const challenges = await prisma.challenge.findMany({
            where,
            orderBy: [{ difficulty: 'asc' }, { title: 'asc' }],
            select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                language: true,
            },
        });

        res.json(challenges);
    } catch (err) {
        console.error('List challenges error:', err);
        res.status(500).json({ error: 'Failed to fetch challenges.' });
    }
});

// GET /api/challenges/:id — single challenge
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const challenge = await prisma.challenge.findUnique({ where: { id } });
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found.' });
        }

        res.json(challenge);
    } catch (err) {
        console.error('Get challenge error:', err);
        res.status(500).json({ error: 'Failed to fetch challenge.' });
    }
});

// POST /api/challenges/:id/hint — Get a hint for a challenge
router.post('/:id/hint', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { code } = req.body;

        // Rate limit: 1 hint per 30 seconds per user per challenge
        if (userId) {
            const rateKey = `${userId}-${id}`;
            const lastHint = hintRates.get(rateKey);
            if (lastHint && Date.now() - lastHint < 30000) {
                return res.status(429).json({ error: 'Please wait 30 seconds before requesting another hint.' });
            }
            hintRates.set(rateKey, Date.now());
        }

        const challenge = await prisma.challenge.findUnique({ where: { id } });
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found.' });
        }

        const hintRes = await getHint(code, challenge.description);

        // Optionally update hinting stats
        if (userId) {
            // In a real app we might grab the "Pending" submission or just update the user's total hints.
        }

        res.json(hintRes);
    } catch (err) {
        console.error('Get hint error:', err);
        res.status(500).json({ error: 'Failed to generate hint.' });
    }
});

// POST /api/challenges/generate — Generate a new challenge with AI
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.id; // from auth middleware, although req.user might be an object
        // Wait, auth middleware payload format in this repo: req.user = decoded token { id: string }

        // Basic rate limit: 1 request per minute per user
        if (userId) {
            const lastReq = generationRates.get(userId);
            if (lastReq && Date.now() - lastReq < 60000) {
                return res.status(429).json({ error: 'Please wait a minute before generating another challenge.' });
            }
            generationRates.set(userId, Date.now());
        }

        const { language } = req.body;
        const requestedLanguage = language || 'javascript';

        // Default level
        let level = 1;

        if (userId) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user) level = user.level;
        }

        // Generate challenge from AI
        // generateChallenge(level, language, recentTopics)
        const generated = await generateChallenge(level, requestedLanguage, []);

        // Save to DB
        const challenge = await prisma.challenge.create({
            data: {
                title: generated.title,
                description: generated.description,
                difficulty: generated.difficulty,
                language: generated.language,
                rubric: generated.rubric,
                difficultyExplanation: generated.difficultyExplanation,
            }
        });

        res.status(201).json(challenge);
    } catch (err) {
        console.error('Generate challenge error:', err);
        res.status(500).json({ error: 'Failed to generate challenge. Please try again.' });
    }
});

module.exports = router;
