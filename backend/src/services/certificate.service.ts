import { KMS, S3 } from 'aws-sdk';
import * as forge from 'node-forge';

// ============================================
// TYPES
// ============================================

export interface CertificateMetadata {
    alias: string;
    issuer: string;
    subject: string;
    serialNumber: string;
    expiryDate: Date;
}

export interface UploadCertificateResult {
    certificateId: string;
    kmsKeyId: string;
    s3Bucket: string;
    s3Key: string;
    metadata: CertificateMetadata;
}

// ============================================
// CERTIFICATE SERVICE
// ============================================

export class CertificateService {
    private kms: KMS;
    private s3: S3;
    private certificatesBucket: string;

    constructor() {
        this.kms = new KMS({
            region: process.env.AWS_REGION || 'us-east-1',
        });

        this.s3 = new S3({
            region: process.env.AWS_REGION || 'us-east-1',
        });

        this.certificatesBucket = process.env.S3_CERTIFICATES_BUCKET || 'sepi-certificates';
    }

    /**
     * Upload and encrypt digital certificate (.pfx)
     */
    async uploadCertificate(
        companyId: string,
        fileBuffer: Buffer,
        password: string,
        alias: string
    ): Promise<UploadCertificateResult> {
        try {
            // 1. Validate certificate
            const metadata = await this.validateCertificate(fileBuffer, password);

            // 2. Generate unique key for this certificate
            const kmsKey = await this.createKMSKey(companyId, alias);

            // 3. Encrypt certificate file with KMS
            const encryptedCertificate = await this.encryptWithKMS(fileBuffer, kmsKey.KeyId!);

            // 4. Encrypt password with KMS
            const encryptedPassword = await this.encryptWithKMS(
                Buffer.from(password, 'utf-8'),
                kmsKey.KeyId!
            );

            // 5. Store encrypted certificate in S3
            const s3Key = `certificates/${companyId}/${Date.now()}.pfx.enc`;
            await this.s3.putObject({
                Bucket: this.certificatesBucket,
                Key: s3Key,
                Body: encryptedCertificate,
                ServerSideEncryption: 'AES256',
                Metadata: {
                    companyId,
                    alias,
                    expiryDate: metadata.expiryDate.toISOString(),
                },
            }).promise();

            // 6. Store encrypted password separately
            const passwordKey = `certificates/${companyId}/${Date.now()}.pwd.enc`;
            await this.s3.putObject({
                Bucket: this.certificatesBucket,
                Key: passwordKey,
                Body: encryptedPassword,
                ServerSideEncryption: 'AES256',
            }).promise();

            return {
                certificateId: s3Key,
                kmsKeyId: kmsKey.KeyId!,
                s3Bucket: this.certificatesBucket,
                s3Key,
                metadata,
            };
        } catch (error: any) {
            throw new Error(`Failed to upload certificate: ${error.message}`);
        }
    }

    /**
     * Retrieve and decrypt certificate for use
     */
    async getCertificate(s3Key: string, kmsKeyId: string): Promise<{
        certificate: Buffer;
        password: string;
    }> {
        try {
            // 1. Get encrypted certificate from S3
            const certObject = await this.s3.getObject({
                Bucket: this.certificatesBucket,
                Key: s3Key,
            }).promise();

            // 2. Get encrypted password from S3
            const passwordKey = s3Key.replace('.pfx.enc', '.pwd.enc');
            const passwordObject = await this.s3.getObject({
                Bucket: this.certificatesBucket,
                Key: passwordKey,
            }).promise();

            // 3. Decrypt certificate with KMS
            const certificate = await this.decryptWithKMS(
                certObject.Body as Buffer,
                kmsKeyId
            );

            // 4. Decrypt password with KMS
            const passwordBuffer = await this.decryptWithKMS(
                passwordObject.Body as Buffer,
                kmsKeyId
            );

            return {
                certificate,
                password: passwordBuffer.toString('utf-8'),
            };
        } catch (error: any) {
            throw new Error(`Failed to retrieve certificate: ${error.message}`);
        }
    }

    /**
     * Validate certificate and extract metadata
     */
    private async validateCertificate(
        fileBuffer: Buffer,
        password: string
    ): Promise<CertificateMetadata> {
        try {
            // Parse PKCS#12 (PFX) file
            const p12Der = fileBuffer.toString('binary');
            const p12Asn1 = forge.asn1.fromDer(p12Der);
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

            // Get certificate
            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            const certBag = certBags[forge.pki.oids.certBag]?.[0];

            if (!certBag || !certBag.cert) {
                throw new Error('No certificate found in PFX file');
            }

            const cert = certBag.cert;

            // Check if certificate is expired
            const now = new Date();
            if (cert.validity.notBefore > now || cert.validity.notAfter < now) {
                throw new Error('Certificate is expired or not yet valid');
            }

            // Extract metadata
            const metadata: CertificateMetadata = {
                alias: cert.subject.getField('CN')?.value || 'Unknown',
                issuer: cert.issuer.getField('CN')?.value || 'Unknown',
                subject: cert.subject.getField('CN')?.value || 'Unknown',
                serialNumber: cert.serialNumber,
                expiryDate: cert.validity.notAfter,
            };

            return metadata;
        } catch (error: any) {
            throw new Error(`Certificate validation failed: ${error.message}`);
        }
    }

    /**
     * Create KMS key for certificate encryption
     */
    private async createKMSKey(companyId: string, alias: string): Promise<KMS.CreateKeyResponse> {
        try {
            const key = await this.kms.createKey({
                Description: `Certificate key for company ${companyId} - ${alias}`,
                KeyUsage: 'ENCRYPT_DECRYPT',
                Origin: 'AWS_KMS',
                Tags: [
                    { TagKey: 'CompanyId', TagValue: companyId },
                    { TagKey: 'Purpose', TagValue: 'Certificate' },
                    { TagKey: 'Alias', TagValue: alias },
                ],
            }).promise();

            // Create alias for easier reference
            await this.kms.createAlias({
                AliasName: `alias/sepi-cert-${companyId}-${Date.now()}`,
                TargetKeyId: key.KeyMetadata!.KeyId!,
            }).promise();

            return key;
        } catch (error: any) {
            throw new Error(`Failed to create KMS key: ${error.message}`);
        }
    }

    /**
     * Encrypt data with KMS
     */
    private async encryptWithKMS(data: Buffer, keyId: string): Promise<Buffer> {
        try {
            const result = await this.kms.encrypt({
                KeyId: keyId,
                Plaintext: data,
            }).promise();

            return result.CiphertextBlob as Buffer;
        } catch (error: any) {
            throw new Error(`KMS encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypt data with KMS
     */
    private async decryptWithKMS(encryptedData: Buffer, keyId: string): Promise<Buffer> {
        try {
            const result = await this.kms.decrypt({
                KeyId: keyId,
                CiphertextBlob: encryptedData,
            }).promise();

            return result.Plaintext as Buffer;
        } catch (error: any) {
            throw new Error(`KMS decryption failed: ${error.message}`);
        }
    }

    /**
     * Check if certificate is expiring soon
     */
    async checkExpiry(expiryDate: Date, daysThreshold: number = 30): Promise<{
        isExpiring: boolean;
        daysRemaining: number;
    }> {
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
            isExpiring: daysRemaining <= daysThreshold,
            daysRemaining,
        };
    }

    /**
     * Revoke certificate (disable KMS key)
     */
    async revokeCertificate(kmsKeyId: string): Promise<void> {
        try {
            await this.kms.disableKey({
                KeyId: kmsKeyId,
            }).promise();

            // Schedule key deletion (minimum 7 days)
            await this.kms.scheduleKeyDeletion({
                KeyId: kmsKeyId,
                PendingWindowInDays: 7,
            }).promise();
        } catch (error: any) {
            throw new Error(`Failed to revoke certificate: ${error.message}`);
        }
    }

    /**
     * List certificates for a company
     */
    async listCertificates(companyId: string): Promise<Array<{
        key: string;
        metadata: any;
    }>> {
        try {
            const result = await this.s3.listObjectsV2({
                Bucket: this.certificatesBucket,
                Prefix: `certificates/${companyId}/`,
            }).promise();

            const certificates = (result.Contents || [])
                .filter(obj => obj.Key?.endsWith('.pfx.enc'))
                .map(obj => ({
                    key: obj.Key!,
                    metadata: obj,
                }));

            return certificates;
        } catch (error: any) {
            throw new Error(`Failed to list certificates: ${error.message}`);
        }
    }
}

export default new CertificateService();
