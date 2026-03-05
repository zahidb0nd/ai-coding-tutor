const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const { generateChallenge, generateChallengeFromSpec, getHint } = require('../services/aiService');

const router = express.Router();

// Validation schemas
const generateChallengeSchema = z.object({
    language: z.enum(['C', 'C++', 'Java', 'JavaScript', 'Python']).optional().default('JavaScript'),
    difficulty: z.enum(['Beginner', 'Easy', 'Medium', 'Hard', 'Expert']).optional().default('Beginner'),
    topic: z.string().optional().default('arrays'),
    problemStyle: z.enum(['Algorithmic', 'Real-world', 'Debugging', 'Code Completion', 'Optimization']).optional().default('Algorithmic'),
    outputLength: z.enum(['Short', 'Medium', 'Long']).optional().default('Medium'),
    includeHints: z.boolean().optional().default(true),
    includeTests: z.boolean().optional().default(true),
});

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

// The parameterized routes were moved to the bottom to avoid intercepting static routes

// GET /api/challenges/languages — return distinct languages from challenges
router.get('/languages', async (req, res) => {
    try {
        const results = await prisma.challenge.findMany({
            distinct: ['language'],
            select: { language: true },
        });

        const languages = results
            .map((r) => r.language)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        res.json(languages);
    } catch (err) {
        console.error('List languages error:', err);
        res.status(500).json({ error: 'Failed to fetch languages.' });
    }
});

// POST /api/challenges/generate — Generate a new challenge with AI (legacy endpoint)
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.id;

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

        // Generate challenge from AI (legacy method)
        const generated = await generateChallenge(level, requestedLanguage, []);

        // Save to DB with all new fields
        const challenge = await prisma.challenge.create({
            data: {
                title: generated.title,
                description: generated.problem_statement || generated.description,
                difficulty: generated.difficulty,
                language: generated.language,
                rubric: generated.rubric,
                difficultyExplanation: generated.difficultyExplanation,
                topic: generated.topic,
                problemStyle: generated.problem_style,
                inputFormat: generated.input_format,
                outputFormat: generated.output_format,
                constraints: generated.constraints ? JSON.stringify(generated.constraints) : null,
                examples: generated.examples ? JSON.stringify(generated.examples) : null,
                starterCode: generated.starter_code,
                referenceSolution: generated.reference_solution,
                timeComplexity: generated.time_complexity,
                spaceComplexity: generated.space_complexity,
                edgeCases: generated.edge_cases ? JSON.stringify(generated.edge_cases) : null,
                hints: generated.hints ? JSON.stringify(generated.hints) : null,
                testCases: generated.test_cases ? JSON.stringify(generated.test_cases) : null,
            }
        });

        res.status(201).json(challenge);
    } catch (err) {
        console.error('Generate challenge error:', err);
        res.status(500).json({ error: 'Failed to generate challenge. Please try again.' });
    }
});

// POST /api/challenges/generate-advanced — Generate challenge with full prompt.txt specification
router.post('/generate-advanced', authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.id;

        // Basic rate limit: 1 request per minute per user
        if (userId) {
            const lastReq = generationRates.get(userId);
            if (lastReq && Date.now() - lastReq < 60000) {
                return res.status(429).json({ error: 'Please wait a minute before generating another challenge.' });
            }
            generationRates.set(userId, Date.now());
        }

        // Validate input
        const validatedParams = generateChallengeSchema.parse(req.body);

        // Generate challenge using prompt.txt specification
        const generated = await generateChallengeFromSpec(validatedParams);

        // Map difficulty string to numeric value for DB
        const difficultyMap = {
            'Beginner': 1,
            'Easy': 2,
            'Medium': 3,
            'Hard': 4,
            'Expert': 5,
        };

        // Save to DB with all fields
        const challenge = await prisma.challenge.create({
            data: {
                title: generated.title,
                description: generated.problem_statement,
                difficulty: difficultyMap[generated.difficulty] || 1,
                language: generated.language,
                rubric: `Evaluate based on correctness, code quality, and efficiency. Expected complexity: ${generated.time_complexity}`,
                difficultyExplanation: `This is a ${generated.difficulty} level ${generated.problem_style} challenge focusing on ${generated.topic}.`,
                topic: generated.topic,
                problemStyle: generated.problem_style,
                inputFormat: generated.input_format,
                outputFormat: generated.output_format,
                constraints: JSON.stringify(generated.constraints),
                examples: JSON.stringify(generated.examples),
                starterCode: generated.starter_code,
                referenceSolution: generated.reference_solution,
                timeComplexity: generated.time_complexity,
                spaceComplexity: generated.space_complexity,
                edgeCases: JSON.stringify(generated.edge_cases),
                hints: JSON.stringify(generated.hints),
                testCases: JSON.stringify(generated.test_cases),
            }
        });

        res.status(201).json(challenge);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input parameters', details: err.errors });
        }
        console.error('Generate advanced challenge error:', err);
        res.status(500).json({ error: 'Failed to generate challenge. Please try again.' });
    }
});

// GET /api/challenges/:id — single challenge (Must be at the bottom)
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

// POST /api/challenges/:id/hint — Get a hint for a challenge (Must be at the bottom)
router.post('/:id/hint', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { code, level } = req.body;

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

        const hintRes = await getHint(code, challenge.description, level);

        res.json(hintRes);
    } catch (err) {
        console.error('Get hint error:', err);
        res.status(500).json({ error: 'Failed to generate hint.' });
    }
});

module.exports = router;
