// Health Check Endpoint
// Simple health check for monitoring

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { S3, SQS } from 'aws-sdk';

export const healthCheck = async (req: Request, res: Response) => {
    try {
        // Check database connection
        const dbStatus = await checkDatabase();

        // Check S3 connection
        const s3Status = await checkS3();

        // Check SQS connection
        const sqsStatus = await checkSQS();

        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            services: {
                database: dbStatus,
                s3: s3Status,
                sqs: sqsStatus,
            },
        };

        res.status(200).json(health);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

async function checkDatabase(): Promise<string> {
    try {
        const prisma = new PrismaClient();
        await prisma.$queryRaw`SELECT 1`;
        await prisma.$disconnect();
        return 'connected';
    } catch (error) {
        return 'disconnected';
    }
}

async function checkS3(): Promise<string> {
    try {
        const s3 = new S3();
        await s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET! }).promise();
        return 'connected';
    } catch (error) {
        return 'disconnected';
    }
}

async function checkSQS(): Promise<string> {
    try {
        const sqs = new SQS();
        await sqs.getQueueAttributes({
            QueueUrl: process.env.AWS_SQS_QUEUE_URL!,
            AttributeNames: ['ApproximateNumberOfMessages'],
        }).promise();
        return 'connected';
    } catch (error) {
        return 'disconnected';
    }
}
