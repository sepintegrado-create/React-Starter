#!/usr/bin/env tsx
/**
 * Generate Secure Secrets
 * Creates cryptographically secure random strings for JWT secrets
 */

import crypto from 'crypto';

function generateSecret(length: number = 64): string {
    return crypto.randomBytes(length).toString('base64url');
}

function generateUUID(): string {
    return crypto.randomUUID();
}

console.log('🔐 SEPI Secret Generator\n');
console.log('Copy these values to your .env.production file:\n');
console.log('='.repeat(60));

console.log('\n# JWT Secrets');
console.log(`JWT_SECRET=${generateSecret(64)}`);
console.log(`JWT_REFRESH_SECRET=${generateSecret(64)}`);
console.log(`SESSION_SECRET=${generateSecret(64)}`);

console.log('\n# Admin Credentials (CHANGE AFTER FIRST LOGIN!)');
console.log(`ADMIN_EMAIL=admin@sepi.pro`);
console.log(`ADMIN_PASSWORD=${generateSecret(32)}`);

console.log('\n# API Keys (Placeholders - replace with real values)');
console.log(`TEGRA_API_KEY=your-tegra-api-key-here`);
console.log(`STRIPE_SECRET_KEY=sk_live_your-stripe-key-here`);
console.log(`MERCADO_PAGO_ACCESS_TOKEN=APP_USR-your-mp-token-here`);

console.log('\n# AWS Configuration (Replace with your values)');
console.log(`AWS_ACCESS_KEY_ID=your-aws-access-key`);
console.log(`AWS_SECRET_ACCESS_KEY=your-aws-secret-key`);
console.log(`AWS_KMS_KEY_ID=${generateUUID()}`);

console.log('\n' + '='.repeat(60));
console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Never commit these secrets to version control');
console.log('2. Store them securely (AWS Secrets Manager recommended)');
console.log('3. Rotate secrets regularly (every 90 days)');
console.log('4. Use different secrets for dev/staging/prod');
console.log('5. Change the admin password immediately after first login\n');
