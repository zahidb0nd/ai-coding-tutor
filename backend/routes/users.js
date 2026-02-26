const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/users/leaderboard — get paginated leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await prisma.user.findMany({
            where: {
                totalScore: { gt: 0 } // Only users who have scored points
            },
            orderBy: [
                { totalScore: 'desc' },
                { fastestSolveTime: 'asc' } // tie breaker
            ],
            select: {
                id: true,
                name: true,
                totalScore: true,
                currentStreak: true,
                level: true,
                fastestSolveTime: true
            },
            skip,
            take: limit
        });

        const totalUsers = await prisma.user.count({
            where: { totalScore: { gt: 0 } }
        });

        res.json({
            users,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        });
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
});

// GET /api/users/:id/progress — return stats for dashboard
router.get('/:id/progress', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Get user info
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, level: true, createdAt: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Get total submissions count
        const totalSubmissions = await prisma.submission.count({
            where: { userId: id },
        });

        // Get average score
        const scoreAgg = await prisma.submission.aggregate({
            where: { userId: id, score: { not: null } },
            _avg: { score: true },
            _max: { score: true },
            _min: { score: true },
        });

        // Get completed challenges (unique challenges with score >= 70)
        const completedChallenges = await prisma.submission.groupBy({
            by: ['challengeId'],
            where: { userId: id, score: { gte: 70 } },
        });

        // Total challenges available
        const totalChallenges = await prisma.challenge.count();

        // Get recent submissions with scores for chart data
        const recentScores = await prisma.submission.findMany({
            where: { userId: id, score: { not: null } },
            orderBy: { submittedAt: 'asc' },
            take: 30,
            select: {
                score: true,
                submittedAt: true,
                challenge: { select: { title: true } },
            },
        });

        // Submissions by difficulty
        const submissionsByDifficulty = await prisma.submission.groupBy({
            by: ['challengeId'],
            where: { userId: id },
            _count: { id: true },
        });

        res.json({
            user,
            stats: {
                totalSubmissions,
                averageScore: Math.round(scoreAgg._avg.score || 0),
                highestScore: scoreAgg._max.score || 0,
                lowestScore: scoreAgg._min.score || 0,
                completedChallenges: completedChallenges.length,
                totalChallenges,
            },
            recentScores: recentScores.map((s) => ({
                score: s.score,
                date: s.submittedAt,
                challenge: s.challenge.title,
            })),
        });
    } catch (err) {
        console.error('Get progress error:', err);
        res.status(500).json({ error: 'Failed to fetch progress data.' });
    }
});

module.exports = router;
