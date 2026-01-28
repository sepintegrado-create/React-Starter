#!/usr/bin/env tsx
/**
 * Pre-deployment Validation Script
 * Checks if all requirements are met before deploying
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { S3, KMS, SQS } from 'aws-sdk';

// Load environment variables
config({ path: '.env.production' });

interface CheckResult {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
}

const results: CheckResult[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'warn', message: string) {
    results.push({ name, status, message });
}

async function checkEnvironmentVariables() {
    console.log('🔍 Checking environment variables...\n');

    const required = [
        'DATABASE_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'AWS_REGION',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_S3_BUCKET',
        'AWS_KMS_KEY_ID',
        'AWS_SQS_QUEUE_URL',
        'TEGRA_API_KEY',
        'CORS_ORIGIN',
    ];

    for (const varName of required) {
        if (!process.env[varName]) {
            addResult('Environment Variables', 'fail', `Missing: ${varName}`);
        }
    }

    if (results.filter(r => r.name === 'Environment Variables').length === 0) {
        addResult('Environment Variables', 'pass', 'All required variables present');
    }

    // Check JWT secret strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        addResult('JWT Secret', 'warn', 'JWT_SECRET should be at least 32 characters');
    } else {
        addResult('JWT Secret', 'pass', 'JWT_SECRET length is adequate');
    }
}

async function checkDatabaseConnection() {
    console.log('🗄️  Checking database connection...\n');

    try {
        const prisma = new PrismaClient();
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        await prisma.$disconnect();

        addResult('Database', 'pass', 'Connection successful');
    } catch (error) {
        addResult('Database', 'fail', `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function checkAWSServices() {
    console.log('☁️  Checking AWS services...\n');

    // Check S3
    try {
        const s3 = new S3({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });

        await s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET! }).promise();
        addResult('AWS S3', 'pass', `Bucket ${process.env.AWS_S3_BUCKET} accessible`);
    } catch (error) {
        addResult('AWS S3', 'fail', `S3 check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check KMS
    try {
        const kms = new KMS({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });

        await kms.describeKey({ KeyId: process.env.AWS_KMS_KEY_ID! }).promise();
        addResult('AWS KMS', 'pass', 'KMS key accessible');
    } catch (error) {
        addResult('AWS KMS', 'fail', `KMS check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check SQS
    try {
        const sqs = new SQS({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });

        await sqs.getQueueAttributes({
            QueueUrl: process.env.AWS_SQS_QUEUE_URL!,
            AttributeNames: ['QueueArn'],
        }).promise();

        addResult('AWS SQS', 'pass', 'SQS queue accessible');
    } catch (error) {
        addResult('AWS SQS', 'fail', `SQS check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function checkTegraAPI() {
    console.log('📋 Checking Tegra API...\n');

    try {
        const axios = (await import('axios')).default;

        const response = await axios.get('https://api.nfe.io/v1/companies', {
            headers: {
                'Authorization': `Bearer ${process.env.TEGRA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        if (response.status === 200) {
            addResult('Tegra API', 'pass', 'API key valid');
        } else {
            addResult('Tegra API', 'warn', `Unexpected status: ${response.status}`);
        }
    } catch (error) {
        if (error instanceof Error && 'response' in error) {
            const axiosError = error as any;
            if (axiosError.response?.status === 401) {
                addResult('Tegra API', 'fail', 'Invalid API key');
            } else {
                addResult('Tegra API', 'warn', `API check failed: ${axiosError.message}`);
            }
        } else {
            addResult('Tegra API', 'warn', 'Could not verify API key');
        }
    }
}

function printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPLOYMENT READINESS REPORT');
    console.log('='.repeat(60) + '\n');

    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warned = results.filter(r => r.status === 'warn').length;

    results.forEach(result => {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
        console.log(`${icon} ${result.name}: ${result.message}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Summary: ${passed} passed, ${failed} failed, ${warned} warnings`);
    console.log('='.repeat(60) + '\n');

    if (failed > 0) {
        console.log('❌ Deployment is NOT ready. Please fix the failed checks.');
        process.exit(1);
    } else if (warned > 0) {
        console.log('⚠️  Deployment has warnings. Review before proceeding.');
        process.exit(0);
    } else {
        console.log('✅ All checks passed! Ready for deployment.');
        process.exit(0);
    }
}

async function main() {
    console.log('🚀 SEPI Deployment Readiness Check\n');
    console.log('This script validates that all requirements are met for deployment.\n');

    await checkEnvironmentVariables();
    await checkDatabaseConnection();
    await checkAWSServices();
    await checkTegraAPI();

    printResults();
}

main().catch((error) => {
    console.error('❌ Unexpected error during checks:');
    console.error(error);
    process.exit(1);
});
