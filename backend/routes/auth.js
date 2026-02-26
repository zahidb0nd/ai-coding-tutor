const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../lib/prisma');

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = registerSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: { name, email, passwordHash },
        });

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email, level: user.level },
        });
    } catch (err) {
        if (err.issues) {
            return res.status(400).json({ error: err.issues[0].message });
        }
        console.error('Register error:', err);
        res.status(500).json({ error: 'Failed to create account.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, level: user.level },
        });
    } catch (err) {
        if (err.issues) {
            return res.status(400).json({ error: err.issues[0].message });
        }
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed.' });
    }
});

module.exports = router;
