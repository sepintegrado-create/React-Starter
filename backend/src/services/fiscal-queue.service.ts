import { SQS } from 'aws-sdk';

// ============================================
// TYPES
// ============================================

export interface InvoiceQueueMessage {
    invoiceId: string;
    companyId: string;
    type: 'NFE' | 'NFCE' | 'NFSE';
    action: 'ISSUE' | 'CANCEL' | 'CORRECT';
    payload: any;
    retryCount?: number;
}

// ============================================
// FISCAL QUEUE SERVICE
// ============================================

export class FiscalQueueService {
    private sqs: SQS;
    private queueUrl: string;
    private maxRetries: number = 3;

    constructor() {
        this.sqs = new SQS({
            region: process.env.AWS_REGION || 'us-east-1',
        });

        this.queueUrl = process.env.SQS_FISCAL_QUEUE_URL || '';
    }

    /**
     * Enqueue invoice for processing
     */
    async enqueueInvoice(message: InvoiceQueueMessage): Promise<string> {
        try {
            const result = await this.sqs.sendMessage({
                QueueUrl: this.queueUrl,
                MessageBody: JSON.stringify(message),
                MessageAttributes: {
                    invoiceId: {
                        DataType: 'String',
                        StringValue: message.invoiceId,
                    },
                    companyId: {
                        DataType: 'String',
                        StringValue: message.companyId,
                    },
                    type: {
                        DataType: 'String',
                        StringValue: message.type,
                    },
                    action: {
                        DataType: 'String',
                        StringValue: message.action,
                    },
                },
            }).promise();

            return result.MessageId!;
        } catch (error: any) {
            throw new Error(`Failed to enqueue invoice: ${error.message}`);
        }
    }

    /**
     * Process queue messages
     */
    async processQueue(
        handler: (message: InvoiceQueueMessage) => Promise<void>
    ): Promise<void> {
        try {
            const result = await this.sqs.receiveMessage({
                QueueUrl: this.queueUrl,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 20, // Long polling
                VisibilityTimeout: 300, // 5 minutes
            }).promise();

            if (!result.Messages || result.Messages.length === 0) {
                return;
            }

            for (const sqsMessage of result.Messages) {
                try {
                    const message: InvoiceQueueMessage = JSON.parse(sqsMessage.Body!);

                    // Process message
                    await handler(message);

                    // Delete message from queue on success
                    await this.deleteMessage(sqsMessage.ReceiptHandle!);
                } catch (error: any) {
                    console.error('Error processing message:', error);

                    // Check retry count
                    const message: InvoiceQueueMessage = JSON.parse(sqsMessage.Body!);
                    const retryCount = message.retryCount || 0;

                    if (retryCount < this.maxRetries) {
                        // Re-queue with incremented retry count
                        await this.enqueueInvoice({
                            ...message,
                            retryCount: retryCount + 1,
                        });

                        // Delete original message
                        await this.deleteMessage(sqsMessage.ReceiptHandle!);
                    } else {
                        // Max retries reached - move to DLQ or log
                        console.error('Max retries reached for invoice:', message.invoiceId);
                        await this.moveToDeadLetterQueue(sqsMessage);
                    }
                }
            }
        } catch (error: any) {
            throw new Error(`Failed to process queue: ${error.message}`);
        }
    }

    /**
     * Delete message from queue
     */
    private async deleteMessage(receiptHandle: string): Promise<void> {
        try {
            await this.sqs.deleteMessage({
                QueueUrl: this.queueUrl,
                ReceiptHandle: receiptHandle,
            }).promise();
        } catch (error: any) {
            console.error('Failed to delete message:', error);
        }
    }

    /**
     * Move message to dead letter queue
     */
    private async moveToDeadLetterQueue(message: SQS.Message): Promise<void> {
        try {
            // In production, configure a DLQ and move failed messages there
            console.error('Moving to DLQ:', message.Body);

            // Delete from main queue
            await this.deleteMessage(message.ReceiptHandle!);
        } catch (error: any) {
            console.error('Failed to move to DLQ:', error);
        }
    }

    /**
     * Get queue attributes
     */
    async getQueueStats(): Promise<{
        approximateMessages: number;
        approximateMessagesNotVisible: number;
        approximateMessagesDelayed: number;
    }> {
        try {
            const result = await this.sqs.getQueueAttributes({
                QueueUrl: this.queueUrl,
                AttributeNames: [
                    'ApproximateNumberOfMessages',
                    'ApproximateNumberOfMessagesNotVisible',
                    'ApproximateNumberOfMessagesDelayed',
                ],
            }).promise();

            return {
                approximateMessages: parseInt(result.Attributes?.ApproximateNumberOfMessages || '0'),
                approximateMessagesNotVisible: parseInt(result.Attributes?.ApproximateNumberOfMessagesNotVisible || '0'),
                approximateMessagesDelayed: parseInt(result.Attributes?.ApproximateNumberOfMessagesDelayed || '0'),
            };
        } catch (error: any) {
            throw new Error(`Failed to get queue stats: ${error.message}`);
        }
    }

    /**
     * Purge queue (use with caution!)
     */
    async purgeQueue(): Promise<void> {
        try {
            await this.sqs.purgeQueue({
                QueueUrl: this.queueUrl,
            }).promise();
        } catch (error: any) {
            throw new Error(`Failed to purge queue: ${error.message}`);
        }
    }
}

export default new FiscalQueueService();
