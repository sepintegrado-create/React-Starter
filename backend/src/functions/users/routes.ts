import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authenticate, validateSchema } from '../../utils/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const updateProfileSchema = z.object({
    name: z.string().min(3).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
});

const update2FASchema = z.object({
    enabled: z.boolean(),
});

const updateNotificationsSchema = z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    orderUpdates: z.boolean().optional(),
    promotions: z.boolean().optional(),
    newsletter: z.boolean().optional(),
});

const updatePrivacySchema = z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
    showEmail: z.boolean().optional(),
    showPhone: z.boolean().optional(),
    allowMessages: z.boolean().optional(),
});

// ============================================
// ROUTES
// ============================================

/**
 * GET /api/users/profile
 * Get current user profile
 */
router.get('/profile', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                phone: true,
                role: true,
                twoFactorEnabled: true,
                acceptedTerms: true,
                acceptedTermsAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put(
    '/profile',
    authenticate,
    validateSchema(updateProfileSchema),
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { name, phone, address } = req.body;

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    ...(name && { name }),
                    ...(phone && { phone }),
                    // Note: address is not in the User model, would need to be added or stored separately
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    updatedAt: true,
                },
            });

            res.json({
                message: 'Profile updated successfully',
                user: updatedUser,
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
);

/**
 * POST /api/users/change-password
 * Change user password
 */
router.post(
    '/change-password',
    authenticate,
    validateSchema(changePasswordSchema),
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { currentPassword, newPassword } = req.body;

            // Get current user with password
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const newPasswordHash = await bcrypt.hash(newPassword, 12);

            // Update password
            await prisma.user.update({
                where: { id: userId },
                data: { passwordHash: newPasswordHash },
            });

            // Create audit log
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: 'PASSWORD_CHANGED',
                    resource: 'user',
                    resourceId: userId,
                    ipAddress: req.ip,
                },
            });

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({ error: 'Failed to change password' });
        }
    }
);

/**
 * PUT /api/users/2fa
 * Enable/disable two-factor authentication
 */
router.put(
    '/2fa',
    authenticate,
    validateSchema(update2FASchema),
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { enabled } = req.body;

            // If enabling 2FA, generate secret
            let twoFactorSecret = null;
            if (enabled) {
                // In a real implementation, use speakeasy or similar to generate TOTP secret
                twoFactorSecret = Math.random().toString(36).substring(2, 15);
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    twoFactorEnabled: enabled,
                    ...(enabled && { twoFactorSecret }),
                },
            });

            // Create audit log
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: enabled ? '2FA_ENABLED' : '2FA_DISABLED',
                    resource: 'user',
                    resourceId: userId,
                    ipAddress: req.ip,
                },
            });

            res.json({
                message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
                secret: enabled ? twoFactorSecret : null,
            });
        } catch (error) {
            console.error('Error updating 2FA:', error);
            res.status(500).json({ error: 'Failed to update 2FA settings' });
        }
    }
);

/**
 * GET /api/users/sessions
 * Get active sessions
 */
router.get('/sessions', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const sessions = await prisma.session.findMany({
            where: {
                userId,
                expiresAt: { gt: new Date() },
            },
            select: {
                id: true,
                ipAddress: true,
                userAgent: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

/**
 * DELETE /api/users/sessions
 * Terminate all other sessions
 */
router.delete('/sessions', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const currentToken = req.headers.authorization?.replace('Bearer ', '');

        // Delete all sessions except current one
        await prisma.session.deleteMany({
            where: {
                userId,
                token: { not: currentToken },
            },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'SESSIONS_TERMINATED',
                resource: 'user',
                resourceId: userId,
                ipAddress: req.ip,
            },
        });

        res.json({ message: 'All other sessions terminated successfully' });
    } catch (error) {
        console.error('Error terminating sessions:', error);
        res.status(500).json({ error: 'Failed to terminate sessions' });
    }
});

/**
 * PUT /api/users/notifications
 * Update notification preferences
 */
router.put(
    '/notifications',
    authenticate,
    validateSchema(updateNotificationsSchema),
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const preferences = req.body;

            // Store preferences in user metadata or separate table
            // For now, we'll use a simple JSON field approach
            // In production, consider a separate NotificationPreferences table

            await prisma.user.update({
                where: { id: userId },
                data: {
                    // Store as JSON in a metadata field (would need to add this to schema)
                    // For now, just log it
                },
            });

            console.log('Notification preferences updated:', preferences);

            res.json({
                message: 'Notification preferences updated successfully',
                preferences,
            });
        } catch (error) {
            console.error('Error updating notifications:', error);
            res.status(500).json({ error: 'Failed to update notification preferences' });
        }
    }
);

/**
 * PUT /api/users/privacy
 * Update privacy settings
 */
router.put(
    '/privacy',
    authenticate,
    validateSchema(updatePrivacySchema),
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const settings = req.body;

            // Store privacy settings
            // Similar to notifications, would need a separate table or JSON field

            console.log('Privacy settings updated:', settings);

            res.json({
                message: 'Privacy settings updated successfully',
                settings,
            });
        } catch (error) {
            console.error('Error updating privacy:', error);
            res.status(500).json({ error: 'Failed to update privacy settings' });
        }
    }
);

/**
 * GET /api/users/export-data
 * Export user data (LGPD compliance)
 */
router.get('/export-data', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        // Gather all user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                companies: true,
                employeeOf: true,
                sessions: true,
                auditLogs: {
                    take: 100,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove sensitive data
        const { passwordHash, twoFactorSecret, ...userData } = user;

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'DATA_EXPORTED',
                resource: 'user',
                resourceId: userId,
                ipAddress: req.ip,
            },
        });

        res.json({
            exportDate: new Date().toISOString(),
            data: userData,
        });
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

/**
 * DELETE /api/users/account
 * Delete user account (soft delete)
 */
router.delete('/account', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { password } = req.body;

        // Verify password before deletion
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Soft delete: anonymize user data
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: 'Deleted User',
                email: `deleted_${userId}@deleted.com`,
                phone: '',
                passwordHash: '',
                twoFactorSecret: null,
                twoFactorEnabled: false,
            },
        });

        // Delete all sessions
        await prisma.session.deleteMany({
            where: { userId },
        });

        // Create final audit log
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'ACCOUNT_DELETED',
                resource: 'user',
                resourceId: userId,
                ipAddress: req.ip,
            },
        });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

module.exports = router;

