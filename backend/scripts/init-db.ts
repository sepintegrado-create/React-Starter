#!/usr/bin/env tsx
/**
 * Database Initialization Script
 * Creates initial data for production environment
 */

import { PrismaClient, UserRole, FiscalRegime, BillingCycle } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting database initialization...\n');

    // Create subscription plans
    console.log('📦 Creating subscription plans...');

    const basicPlan = await prisma.subscriptionPlan.upsert({
        where: { id: 'plan-basic' },
        update: {},
        create: {
            id: 'plan-basic',
            name: 'Básico',
            description: 'Plano ideal para pequenos negócios',
            price: 49.90,
            billingCycle: BillingCycle.MONTHLY,
            maxEmployees: 5,
            maxProducts: 100,
            maxLocations: 1,
            storageGB: 5,
            maxInvoices: 100,
            maxCompanies: 1,
            features: JSON.stringify([
                'PDV Completo',
                'Gestão de Produtos',
                'Relatórios Básicos',
                'Suporte por Email',
            ]),
        },
    });

    const proPlan = await prisma.subscriptionPlan.upsert({
        where: { id: 'plan-pro' },
        update: {},
        create: {
            id: 'plan-pro',
            name: 'Profissional',
            description: 'Plano completo para empresas em crescimento',
            price: 149.90,
            billingCycle: BillingCycle.MONTHLY,
            maxEmployees: 20,
            maxProducts: 1000,
            maxLocations: 3,
            storageGB: 50,
            maxInvoices: 1000,
            maxCompanies: 3,
            features: JSON.stringify([
                'Tudo do Básico',
                'Emissão de NF-e/NFC-e',
                'Múltiplas Empresas',
                'Relatórios Avançados',
                'Suporte Prioritário',
                'API Access',
            ]),
        },
    });

    const enterprisePlan = await prisma.subscriptionPlan.upsert({
        where: { id: 'plan-enterprise' },
        update: {},
        create: {
            id: 'plan-enterprise',
            name: 'Enterprise',
            description: 'Solução completa para grandes empresas',
            price: 499.90,
            billingCycle: BillingCycle.MONTHLY,
            maxEmployees: -1, // Unlimited
            maxProducts: -1,
            maxLocations: -1,
            storageGB: 500,
            maxInvoices: -1,
            maxCompanies: -1,
            features: JSON.stringify([
                'Tudo do Profissional',
                'Usuários Ilimitados',
                'Produtos Ilimitados',
                'Localizações Ilimitadas',
                'NFS-e (Serviços)',
                'Integração Personalizada',
                'Suporte 24/7',
                'Gerente de Conta Dedicado',
            ]),
        },
    });

    console.log('✅ Subscription plans created');
    console.log(`   - ${basicPlan.name}: R$ ${basicPlan.price}/mês`);
    console.log(`   - ${proPlan.name}: R$ ${proPlan.price}/mês`);
    console.log(`   - ${enterprisePlan.name}: R$ ${enterprisePlan.price}/mês\n`);

    // Create platform admin user (if not exists)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sepi.pro';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    console.log('👤 Creating platform admin user...');

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        const admin = await prisma.user.create({
            data: {
                cpf: '00000000000',
                name: 'Administrador SEPI',
                email: adminEmail,
                phone: '11999999999',
                passwordHash: hashedPassword,
                role: UserRole.PLATFORM_ADMIN,
                acceptedTerms: true,
                acceptedTermsAt: new Date(),
                twoFactorEnabled: false,
            },
        });

        console.log('✅ Platform admin created');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!\n');
    } else {
        console.log('ℹ️  Platform admin already exists\n');
    }

    // Create demo company (optional, only in dev)
    if (process.env.NODE_ENV === 'development') {
        console.log('🏢 Creating demo company...');

        const demoUser = await prisma.user.upsert({
            where: { email: 'demo@sepi.pro' },
            update: {},
            create: {
                cpf: '11111111111',
                name: 'Usuário Demo',
                email: 'demo@sepi.pro',
                phone: '11988888888',
                passwordHash: await bcrypt.hash('Demo@123', 12),
                role: UserRole.COMPANY_ADMIN,
                acceptedTerms: true,
                acceptedTermsAt: new Date(),
                twoFactorEnabled: false,
            },
        });

        const demoCompany = await prisma.company.upsert({
            where: { cnpj: '00000000000100' },
            update: {},
            create: {
                cnpj: '00000000000100',
                name: 'Empresa Demo LTDA',
                tradeName: 'Demo Store',
                email: 'contato@demo.sepi.pro',
                phone: '1133334444',
                addressStreet: 'Rua Demo',
                addressNumber: '100',
                addressNeighborhood: 'Centro',
                addressCity: 'São Paulo',
                addressState: 'SP',
                addressZipCode: '01000000',
                ownerId: demoUser.id,
                planId: proPlan.id,
                businessType: 'Varejo',
                fiscalRegime: FiscalRegime.SIMPLES,
            },
        });

        // Create demo fiscal config
        await prisma.fiscalConfig.upsert({
            where: { companyId: demoCompany.id },
            update: {},
            create: {
                companyId: demoCompany.id,
                regime: FiscalRegime.SIMPLES,
                environment: 'HOMOLOGACAO',
            },
        });

        // Create demo categories
        const category1 = await prisma.category.create({
            data: {
                companyId: demoCompany.id,
                name: 'Eletrônicos',
                description: 'Produtos eletrônicos',
            },
        });

        const category2 = await prisma.category.create({
            data: {
                companyId: demoCompany.id,
                name: 'Alimentos',
                description: 'Produtos alimentícios',
            },
        });

        // Create demo products
        await prisma.product.createMany({
            data: [
                {
                    companyId: demoCompany.id,
                    categoryId: category1.id,
                    type: 'PRODUCT',
                    name: 'Mouse Gamer',
                    description: 'Mouse gamer RGB',
                    sku: 'MOUSE-001',
                    barcode: '7891234567890',
                    price: 149.90,
                    costPrice: 80.00,
                    stock: 50,
                    minStock: 10,
                    ncm: '84716053',
                    origin: 0,
                },
                {
                    companyId: demoCompany.id,
                    categoryId: category1.id,
                    type: 'PRODUCT',
                    name: 'Teclado Mecânico',
                    description: 'Teclado mecânico RGB',
                    sku: 'TECLADO-001',
                    barcode: '7891234567891',
                    price: 299.90,
                    costPrice: 150.00,
                    stock: 30,
                    minStock: 5,
                    ncm: '84716053',
                    origin: 0,
                },
                {
                    companyId: demoCompany.id,
                    categoryId: category2.id,
                    type: 'PRODUCT',
                    name: 'Café Premium 500g',
                    description: 'Café torrado e moído',
                    sku: 'CAFE-001',
                    barcode: '7891234567892',
                    price: 24.90,
                    costPrice: 12.00,
                    stock: 100,
                    minStock: 20,
                    ncm: '09012100',
                    origin: 0,
                },
            ],
        });

        console.log('✅ Demo company created');
        console.log(`   CNPJ: ${demoCompany.cnpj}`);
        console.log(`   Email: demo@sepi.pro`);
        console.log(`   Password: Demo@123\n`);
    }

    console.log('✨ Database initialization completed!\n');
}

main()
    .catch((e) => {
        console.error('❌ Error during database initialization:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
