import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

// ============================================
// TYPES
// ============================================

export interface UploadResult {
    url: string;
    key: string;
    bucket: string;
    size: number;
}

export type FileCategory = 'products' | 'logos' | 'certificates' | 'invoices' | 'documents';

// ============================================
// S3 UPLOAD SERVICE
// ============================================

export class S3Service {
    private s3: S3;
    private bucket: string;

    constructor() {
        this.s3 = new S3({
            region: process.env.AWS_REGION || 'us-east-1',
        });

        this.bucket = process.env.S3_BUCKET_NAME || 'sepi-storage';
    }

    /**
     * Upload file to S3
     */
    async uploadFile(
        file: Buffer,
        category: FileCategory,
        companyId: string,
        originalFilename: string,
        contentType?: string
    ): Promise<UploadResult> {
        try {
            const ext = path.extname(originalFilename);
            const filename = `${uuidv4()}${ext}`;
            const key = `${category}/${companyId}/${filename}`;

            const params: S3.PutObjectRequest = {
                Bucket: this.bucket,
                Key: key,
                Body: file,
                ContentType: contentType || this.getContentType(ext),
                ServerSideEncryption: 'AES256',
                Metadata: {
                    companyId,
                    originalFilename,
                    uploadedAt: new Date().toISOString(),
                },
            };

            await this.s3.putObject(params).promise();

            const url = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

            return {
                url,
                key,
                bucket: this.bucket,
                size: file.length,
            };
        } catch (error: any) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    /**
     * Upload image with optimization
     */
    async uploadImage(
        imageBuffer: Buffer,
        category: FileCategory,
        companyId: string,
        originalFilename: string
    ): Promise<UploadResult> {
        // In production, add image optimization here (resize, compress)
        // Using libraries like sharp

        return this.uploadFile(
            imageBuffer,
            category,
            companyId,
            originalFilename,
            'image/jpeg'
        );
    }

    /**
     * Get file from S3
     */
    async getFile(key: string): Promise<Buffer> {
        try {
            const result = await this.s3.getObject({
                Bucket: this.bucket,
                Key: key,
            }).promise();

            return result.Body as Buffer;
        } catch (error: any) {
            throw new Error(`Failed to get file: ${error.message}`);
        }
    }

    /**
     * Delete file from S3
     */
    async deleteFile(key: string): Promise<void> {
        try {
            await this.s3.deleteObject({
                Bucket: this.bucket,
                Key: key,
            }).promise();
        } catch (error: any) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * Generate presigned URL for temporary access
     */
    async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const url = await this.s3.getSignedUrlPromise('getObject', {
                Bucket: this.bucket,
                Key: key,
                Expires: expiresIn,
            });

            return url;
        } catch (error: any) {
            throw new Error(`Failed to generate presigned URL: ${error.message}`);
        }
    }

    /**
     * List files in a category
     */
    async listFiles(category: FileCategory, companyId: string): Promise<Array<{
        key: string;
        size: number;
        lastModified: Date;
    }>> {
        try {
            const result = await this.s3.listObjectsV2({
                Bucket: this.bucket,
                Prefix: `${category}/${companyId}/`,
            }).promise();

            return (result.Contents || []).map(obj => ({
                key: obj.Key!,
                size: obj.Size!,
                lastModified: obj.LastModified!,
            }));
        } catch (error: any) {
            throw new Error(`Failed to list files: ${error.message}`);
        }
    }

    /**
     * Get content type based on file extension
     */
    private getContentType(ext: string): string {
        const types: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
            '.xml': 'application/xml',
            '.json': 'application/json',
            '.pfx': 'application/x-pkcs12',
            '.p12': 'application/x-pkcs12',
        };

        return types[ext.toLowerCase()] || 'application/octet-stream';
    }

    /**
     * Copy file within S3
     */
    async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
        try {
            await this.s3.copyObject({
                Bucket: this.bucket,
                CopySource: `${this.bucket}/${sourceKey}`,
                Key: destinationKey,
            }).promise();
        } catch (error: any) {
            throw new Error(`Failed to copy file: ${error.message}`);
        }
    }
}

export default new S3Service();
