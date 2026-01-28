import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES
// ============================================

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
    companyId?: string;
}

// ============================================
// JWT UTILITIES
// ============================================

export const generateToken = (userId: string, email: string, role: string): string => {
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
};

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        // Verify session exists
        const session = await prisma.session.findFirst({
            where: {
                token,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: true,
            },
        });

        if (!session) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        req.user = {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
        };

        next();
    } catch (error: any) {
        res.status(401).json({ error: 'Authentication failed', message: error.message });
    }
};

// ============================================
// AUTHORIZATION MIDDLEWARE
// ============================================

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
};

// ============================================
// COMPANY CONTEXT MIDDLEWARE
// ============================================

export const requireCompany = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const companyId = req.params.companyId || req.body.companyId;

        if (!companyId) {
            res.status(400).json({ error: 'Company ID required' });
            return;
        }

        // Verify user has access to this company
        const company = await prisma.company.findFirst({
            where: {
                id: companyId,
                OR: [
                    { ownerId: req.user!.id },
                    {
                        employees: {
                            some: {
                                userId: req.user!.id,
                                isActive: true,
                            },
                        },
                    },
                ],
            },
        });

        if (!company) {
            res.status(403).json({ error: 'Access denied to this company' });
            return;
        }

        req.companyId = companyId;
        next();
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to verify company access', message: error.message });
    }
};

// ============================================
// RATE LIMITING (Simple implementation)
// ============================================

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const identifier = req.ip || 'unknown';
        const now = Date.now();

        const record = requestCounts.get(identifier);

        if (!record || now > record.resetTime) {
            requestCounts.set(identifier, {
                count: 1,
                resetTime: now + windowMs,
            });
            next();
            return;
        }

        if (record.count >= maxRequests) {
            res.status(429).json({
                error: 'Too many requests',
                message: 'Please try again later',
            });
            return;
        }

        record.count++;
        next();
    };
};

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

export const validate = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error: any) {
            res.status(400).json({
                error: 'Validation failed',
                details: error.errors,
            });
        }
    };
};
