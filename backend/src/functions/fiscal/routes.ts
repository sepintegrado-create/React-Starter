import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticate, requireCompany } from '../../utils/auth.middleware';
import tegraService from '../../services/tegra.service';
import taxService from '../../services/tax.service';
import fiscalQueueService from '../../services/fiscal-queue.service';
import s3Service from '../../services/s3.service';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// ============================================
// INVOICE ROUTES
// ============================================

/**
 * POST /api/fiscal/invoices/nfe
 * Issue NF-e (Nota Fiscal Eletrônica)
 */
router.post('/invoices/nfe', requireCompany, async (req: AuthRequest, res: Response) => {
    try {
        const { transactionId, recipientData } = req.body;

        // Get transaction
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                company: {
                    include: {
                        fiscalConfig: true,
                    },
                },
                customer: true,
            },
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Calculate taxes
        const taxes = taxService.calculateTotalTax(
            transaction.items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
            })),
            transaction.company,
            recipientData.address.state
        );

        // Create fiscal document
        const fiscalDoc = await prisma.fiscalDocument.create({
            data: {
                companyId: transaction.companyId,
                type: 'NFE',
                number: transaction.company.fiscalConfig!.nfeNextNumber.toString(),
                series: transaction.company.fiscalConfig!.nfeSeries,
                transactionId: transaction.id,
                status: 'PENDING',
                recipientName: recipientData.name,
                recipientCpfCnpj: recipientData.cpfCnpj,
                recipientEmail: recipientData.email,
                recipientPhone: recipientData.phone,
                recipientStreet: recipientData.address.street,
                recipientNumber: recipientData.address.number,
                recipientCity: recipientData.address.city,
                recipientState: recipientData.address.state,
                recipientZipCode: recipientData.address.zipCode,
                totalValue: transaction.amount,
                taxValue: taxes.total,
                environment: transaction.company.fiscalConfig!.environment,
                items: {
                    create: transaction.items.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        ncm: item.product.ncm,
                        cfop: item.product.cfop || '5102',
                        cst: item.product.cst,
                    })),
                },
            },
        });

        // Increment next number
        await prisma.fiscalConfig.update({
            where: { companyId: transaction.companyId },
            data: {
                nfeNextNumber: {
                    increment: 1,
                },
            },
        });

        // Enqueue for processing
        await fiscalQueueService.enqueueInvoice({
            invoiceId: fiscalDoc.id,
            companyId: transaction.companyId,
            type: 'NFE',
            action: 'ISSUE',
            payload: fiscalDoc,
        });

        res.status(201).json({
            message: 'NF-e queued for processing',
            invoiceId: fiscalDoc.id,
            status: 'PENDING',
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to issue NF-e', message: error.message });
    }
});

/**
 * GET /api/fiscal/invoices/:id
 * Get invoice details
 */
router.get('/invoices/:id', async (req: AuthRequest, res: Response) => {
    try {
        const invoice = await prisma.fiscalDocument.findUnique({
            where: { id: req.params.id },
            include: {
                items: true,
                events: true,
                company: true,
            },
        });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Check access
        if (invoice.companyId !== req.companyId && req.user!.role !== 'PLATFORM_ADMIN') {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(invoice);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to get invoice', message: error.message });
    }
});

/**
 * POST /api/fiscal/invoices/:id/cancel
 * Cancel invoice
 */
router.post('/invoices/:id/cancel', requireCompany, async (req: AuthRequest, res: Response) => {
    try {
        const { reason } = req.body;

        if (!reason || reason.length < 15) {
            return res.status(400).json({ error: 'Cancellation reason must be at least 15 characters' });
        }

        const invoice = await prisma.fiscalDocument.findUnique({
            where: { id: req.params.id },
        });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (invoice.status !== 'AUTHORIZED') {
            return res.status(400).json({ error: 'Only authorized invoices can be cancelled' });
        }

        // Enqueue cancellation
        await fiscalQueueService.enqueueInvoice({
            invoiceId: invoice.id,
            companyId: invoice.companyId,
            type: invoice.type as any,
            action: 'CANCEL',
            payload: { reason },
        });

        res.json({
            message: 'Cancellation queued for processing',
            invoiceId: invoice.id,
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to cancel invoice', message: error.message });
    }
});

/**
 * GET /api/fiscal/invoices/:id/xml
 * Download XML
 */
router.get('/invoices/:id/xml', async (req: AuthRequest, res: Response) => {
    try {
        const invoice = await prisma.fiscalDocument.findUnique({
            where: { id: req.params.id },
        });

        if (!invoice || !invoice.xmlS3Key) {
            return res.status(404).json({ error: 'XML not found' });
        }

        const xml = await s3Service.getFile(invoice.xmlS3Key);

        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename="NFe-${invoice.accessKey}.xml"`);
        res.send(xml);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to download XML', message: error.message });
    }
});

/**
 * GET /api/fiscal/invoices/:id/danfe
 * Download DANFE (PDF)
 */
router.get('/invoices/:id/danfe', async (req: AuthRequest, res: Response) => {
    try {
        const invoice = await prisma.fiscalDocument.findUnique({
            where: { id: req.params.id },
        });

        if (!invoice || !invoice.danfeS3Key) {
            return res.status(404).json({ error: 'DANFE not found' });
        }

        const pdf = await s3Service.getFile(invoice.danfeS3Key);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="DANFE-${invoice.accessKey}.pdf"`);
        res.send(pdf);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to download DANFE', message: error.message });
    }
});

/**
 * GET /api/fiscal/companies/:companyId/invoices
 * List company invoices
 */
router.get('/companies/:companyId/invoices', requireCompany, async (req: AuthRequest, res: Response) => {
    try {
        const { status, type, startDate, endDate, page = 1, limit = 50 } = req.query;

        const where: any = {
            companyId: req.params.companyId,
        };

        if (status) where.status = status;
        if (type) where.type = type;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate as string);
            if (endDate) where.createdAt.lte = new Date(endDate as string);
        }

        const [invoices, total] = await Promise.all([
            prisma.fiscalDocument.findMany({
                where,
                include: {
                    items: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
            }),
            prisma.fiscalDocument.count({ where }),
        ]);

        res.json({
            invoices,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to list invoices', message: error.message });
    }
});

module.exports = router;
