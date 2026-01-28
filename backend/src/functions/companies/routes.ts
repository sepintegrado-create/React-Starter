import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticate, authorize } from '../../utils/auth.middleware';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createCompanySchema = z.object({
    cnpj: z.string().length(14),
    name: z.string().min(3),
    tradeName: z.string().min(3),
    email: z.string().email(),
    phone: z.string(),
    addressStreet: z.string(),
    addressNumber: z.string(),
    addressCity: z.string(),
    addressState: z.string().length(2),
    addressZipCode: z.string(),
    planId: z.string(),
    businessType: z.string(),
    fiscalRegime: z.enum(['SIMPLES', 'PRESUMIDO', 'REAL']),
});

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/companies
 * Create new company
 */
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const data = createCompanySchema.parse(req.body);

        // Check if CNPJ already exists
        const existing = await prisma.company.findUnique({
            where: { cnpj: data.cnpj },
        });

        if (existing) {
            return res.status(400).json({ error: 'CNPJ already registered' });
        }

        // Create company
        const company = await prisma.company.create({
            data: {
                cnpj: data.cnpj,
                name: data.name,
                tradeName: data.tradeName,
                email: data.email,
                phone: data.phone,
                addressStreet: data.addressStreet,
                addressNumber: data.addressNumber,
                addressNeighborhood: '',
                addressCity: data.addressCity,
                addressState: data.addressState,
                addressZipCode: data.addressZipCode,
                addressCountry: 'Brasil',
                ownerId: req.user!.id,
                planId: data.planId,
                businessType: data.businessType,
                fiscalRegime: data.fiscalRegime,
            },
        });

        // Create fiscal config
        await prisma.fiscalConfig.create({
            data: {
                companyId: company.id,
                regime: data.fiscalRegime,
            },
        });

        // Update user role to COMPANY_ADMIN if USER
        if (req.user!.role === 'USER') {
            await prisma.user.update({
                where: { id: req.user!.id },
                data: { role: 'COMPANY_ADMIN' },
            });
        }

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: req.user!.id,
                action: 'CREATE_COMPANY',
                resource: 'companies',
                resourceId: company.id,
            },
        });

        res.status(201).json(company);
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to create company', message: error.message });
    }
});

/**
 * GET /api/companies
 * List user's companies
 */
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const companies = await prisma.company.findMany({
            where: {
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
            include: {
                plan: true,
                fiscalConfig: true,
                _count: {
                    select: {
                        products: true,
                        employees: true,
                        customers: true,
                    },
                },
            },
        });

        res.json(companies);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to list companies', message: error.message });
    }
});

/**
 * GET /api/companies/:id
 * Get company details
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const company = await prisma.company.findFirst({
            where: {
                id: req.params.id,
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
            include: {
                plan: true,
                fiscalConfig: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                        employees: true,
                        customers: true,
                        invoices: true,
                    },
                },
            },
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.json(company);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to get company', message: error.message });
    }
});

/**
 * PUT /api/companies/:id
 * Update company
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        // Verify ownership
        const company = await prisma.company.findFirst({
            where: {
                id: req.params.id,
                ownerId: req.user!.id,
            },
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found or access denied' });
        }

        const updated = await prisma.company.update({
            where: { id: req.params.id },
            data: {
                ...req.body,
                updatedAt: new Date(),
            },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: req.user!.id,
                action: 'UPDATE_COMPANY',
                resource: 'companies',
                resourceId: company.id,
            },
        });

        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to update company', message: error.message });
    }
});

/**
 * DELETE /api/companies/:id
 * Delete company (soft delete by setting status)
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        // Verify ownership
        const company = await prisma.company.findFirst({
            where: {
                id: req.params.id,
                ownerId: req.user!.id,
            },
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found or access denied' });
        }

        // Soft delete by setting plan status to CANCELLED
        await prisma.company.update({
            where: { id: req.params.id },
            data: {
                planStatus: 'CANCELLED',
                updatedAt: new Date(),
            },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: req.user!.id,
                action: 'DELETE_COMPANY',
                resource: 'companies',
                resourceId: company.id,
            },
        });

        res.json({ message: 'Company deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to delete company', message: error.message });
    }
});

/**
 * GET /api/companies/:id/dashboard
 * Get dashboard statistics
 */
router.get('/:id/dashboard', async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.params.id;

        // Verify access
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
            return res.status(404).json({ error: 'Company not found' });
        }

        // Get statistics
        const [
            totalProducts,
            totalEmployees,
            totalCustomers,
            totalInvoices,
            recentTransactions,
        ] = await Promise.all([
            prisma.product.count({ where: { companyId, isActive: true } }),
            prisma.employee.count({ where: { companyId, isActive: true } }),
            prisma.customer.count({ where: { companyId } }),
            prisma.fiscalDocument.count({ where: { companyId } }),
            prisma.transaction.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    customer: true,
                    items: true,
                },
            }),
        ]);

        // Calculate revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueResult = await prisma.transaction.aggregate({
            where: {
                companyId,
                createdAt: { gte: thirtyDaysAgo },
                status: { in: ['DELIVERED', 'READY'] },
            },
            _sum: {
                amount: true,
            },
        });

        res.json({
            totalProducts,
            totalEmployees,
            totalCustomers,
            totalInvoices,
            revenue30Days: revenueResult._sum.amount || 0,
            recentTransactions,
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to get dashboard data', message: error.message });
    }
});

module.exports = router;
