import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken, generateRefreshToken, verifyToken } from '../../utils/auth.middleware';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const registerSchema = z.object({
    cpf: z.string().length(11),
    name: z.string().min(3),
    email: z.string().email(),
    phone: z.string(),
    password: z.string().min(8),
    acceptedTerms: z.boolean().refine(val => val === true),
});

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);

        // Check if user already exists
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { cpf: data.cpf },
                ],
            },
        });

        if (existing) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                cpf: data.cpf,
                name: data.name,
                email: data.email,
                phone: data.phone,
                passwordHash,
                role: 'USER',
                twoFactorEnabled: true,
                acceptedTerms: data.acceptedTerms,
                acceptedTermsAt: new Date(),
            },
        });

        res.status(201).json({
            message: 'User created successfully',
            userId: user.id,
        });
    } catch (error: any) {
        res.status(400).json({ error: 'Registration failed', message: error.message });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(data.password, user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate tokens
        const token = generateToken(user.id, user.email, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Create session
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                refreshToken,
                expiresAt,
                refreshExpiresAt,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            },
        });

        res.json({
            token,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error: any) {
        res.status(400).json({ error: 'Login failed', message: error.message });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        // Verify refresh token
        const decoded = verifyToken(refreshToken);

        // Find session
        const session = await prisma.session.findFirst({
            where: {
                refreshToken,
                refreshExpiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: true,
            },
        });

        if (!session) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        // Generate new tokens
        const newToken = generateToken(session.user.id, session.user.email, session.user.role);
        const newRefreshToken = generateRefreshToken(session.user.id);

        // Update session
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

        await prisma.session.update({
            where: { id: session.id },
            data: {
                token: newToken,
                refreshToken: newRefreshToken,
                expiresAt,
                refreshExpiresAt,
            },
        });

        res.json({
            token: newToken,
            refreshToken: newRefreshToken,
        });
    } catch (error: any) {
        res.status(401).json({ error: 'Token refresh failed', message: error.message });
    }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(400).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);

        // Delete session
        await prisma.session.deleteMany({
            where: { token },
        });

        res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
        res.status(400).json({ error: 'Logout failed', message: error.message });
    }
});

module.exports = router;
