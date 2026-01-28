import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticate, requireCompany } from '../../utils/auth.middleware';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createProductSchema = z.object({
    companyId: z.string(),
    type: z.enum(['PRODUCT', 'SERVICE']),
    name: z.string().min(3),
    description: z.string().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    categoryId: z.string(),
    price: z.number().positive(),
    costPrice: z.number().positive().optional(),
    stock: z.number().int().optional(),
    minStock: z.number().int().optional(),
    requiresPreparation: z.boolean().default(false),
    // Fiscal data
    ncm: z.string().optional(),
    cfop: z.string().optional(),
    cst: z.string().optional(),
});

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/products
 * Create new product
 */
router.post('/', requireCompany, async (req: AuthRequest, res: Response) => {
    try {
        const data = createProductSchema.parse(req.body);

        const product = await prisma.product.create({
            data: {
                ...data,
                images: [],
            },
            include: {
                category: true,
            },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: req.user!.id,
                action: 'CREATE_PRODUCT',
                resource: 'products',
                resourceId: product.id,
            },
        });

        res.status(201).json(product);
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to create product', message: error.message });
    }
});

/**
 * GET /api/products
 * List products (with filters)
 */
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { companyId, categoryId, type, isActive, search, page = 1, limit = 50 } = req.query;

        const where: any = {};

        if (companyId) where.companyId = companyId;
        if (categoryId) where.categoryId = categoryId;
        if (type) where.type = type;
        if (isActive !== undefined) where.isActive = isActive === 'true';
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { sku: { contains: search as string, mode: 'insensitive' } },
                { barcode: { contains: search as string } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                },
                orderBy: {
                    name: 'asc',
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to list products', message: error.message });
    }
});

/**
 * GET /api/products/:id
 * Get product details
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: {
                category: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        tradeName: true,
                    },
                },
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to get product', message: error.message });
    }
});

/**
 * PUT /api/products/:id
 * Update product
 */
router.put('/:id', requireCompany, async (req: AuthRequest, res: Response) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Verify company access
        if (product.companyId !== req.companyId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updated = await prisma.product.update({
            where: { id: req.params.id },
            data: {
                ...req.body,
                updatedAt: new Date(),
            },
            include: {
                category: true,
            },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: req.user!.id,
                action: 'UPDATE_PRODUCT',
                resource: 'products',
                resourceId: product.id,
            },
        });

        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to update product', message: error.message });
    }
});

/**
 * DELETE /api/products/:id
 * Delete product (soft delete)
 */
router.delete('/:id', requireCompany, async (req: AuthRequest, res: Response) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Verify company access
        if (product.companyId !== req.companyId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Soft delete
        await prisma.product.update({
            where: { id: req.params.id },
            data: {
                isActive: false,
                updatedAt: new Date(),
            },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: req.user!.id,
                action: 'DELETE_PRODUCT',
                resource: 'products',
                resourceId: product.id,
            },
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to delete product', message: error.message });
    }
});

/**
 * POST /api/products/:id/upload-image
 * Upload product image
 */
router.post('/:id/upload-image', requireCompany, async (req: AuthRequest, res: Response) => {
    try {
        // This would integrate with S3 upload service
        // For now, return placeholder
        res.json({ message: 'Image upload endpoint - integrate with S3 service' });
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to upload image', message: error.message });
    }
});

/**
 * GET /api/products/company/:companyId/categories
 * Get categories for a company
 */
router.get('/company/:companyId/categories', async (req: AuthRequest, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            where: {
                companyId: req.params.companyId,
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to get categories', message: error.message });
    }
});

/**
 * POST /api/products/categories
 * Create category
 */
router.post('/categories', requireCompany, async (req: AuthRequest, res: Response) => {
    try {
        const { companyId, name, description } = req.body;

        const category = await prisma.category.create({
            data: {
                companyId,
                name,
                description,
            },
        });

        res.status(201).json(category);
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to create category', message: error.message });
    }
});

module.exports = router;
