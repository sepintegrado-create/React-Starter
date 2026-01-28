import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get Mercado Pago configuration for a company
export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const companyId = event.pathParameters?.companyId;

        if (!companyId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Company ID is required' }),
            };
        }

        const config = await prisma.mercadoPagoConfig.findUnique({
            where: { companyId },
        });

        if (!config) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Mercado Pago configuration not found' }),
            };
        }

        // Don't expose sensitive data
        const safeConfig = {
            id: config.id,
            companyId: config.companyId,
            enabled: config.enabled,
            hasAccessToken: !!config.accessToken,
            hasPublicKey: !!config.publicKey,
            hasWebhookSecret: !!config.webhookSecret,
            updatedAt: config.updatedAt,
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(safeConfig),
        };
    } catch (error) {
        console.error('Error getting Mercado Pago config:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Failed to get Mercado Pago configuration' }),
        };
    }
};

// Create or update Mercado Pago configuration
export const upsert = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const companyId = event.pathParameters?.companyId;

        if (!companyId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Company ID is required' }),
            };
        }

        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Request body is required' }),
            };
        }

        const data = JSON.parse(event.body);

        // Validate required fields
        if (!data.accessToken || !data.publicKey) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Access token and public key are required' }),
            };
        }

        const config = await prisma.mercadoPagoConfig.upsert({
            where: { companyId },
            create: {
                companyId,
                accessToken: data.accessToken,
                publicKey: data.publicKey,
                webhookSecret: data.webhookSecret,
                enabled: data.enabled ?? false,
            },
            update: {
                ...(data.accessToken && { accessToken: data.accessToken }),
                ...(data.publicKey && { publicKey: data.publicKey }),
                ...(data.webhookSecret !== undefined && { webhookSecret: data.webhookSecret }),
                ...(data.enabled !== undefined && { enabled: data.enabled }),
            },
        });

        // Don't expose sensitive data
        const safeConfig = {
            id: config.id,
            companyId: config.companyId,
            enabled: config.enabled,
            hasAccessToken: !!config.accessToken,
            hasPublicKey: !!config.publicKey,
            hasWebhookSecret: !!config.webhookSecret,
            updatedAt: config.updatedAt,
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(safeConfig),
        };
    } catch (error) {
        console.error('Error upserting Mercado Pago config:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Failed to save Mercado Pago configuration' }),
        };
    }
};

// Webhook handler for Mercado Pago notifications
export const webhook = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Request body is required' }),
            };
        }

        const notification = JSON.parse(event.body);

        console.log('Mercado Pago webhook received:', notification);

        // Handle different notification types
        if (notification.type === 'payment') {
            const paymentId = notification.data?.id;

            if (paymentId) {
                // TODO: Fetch payment details from Mercado Pago API
                // TODO: Update payment status in database
                console.log('Processing payment notification:', paymentId);
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ received: true }),
        };
    } catch (error) {
        console.error('Error processing Mercado Pago webhook:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Failed to process webhook' }),
        };
    }
};
