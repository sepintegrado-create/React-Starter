import { User, Company, Employee, Product, Category, Customer, Supplier, SubscriptionPlan, UserRole } from '../types/user';

// Platform admin user
export const platformAdmin: User = {
    id: 'admin-001',
    cpf: '12345678909',
    name: 'Flavio Junior',
    email: 'flaviovjr@sepi.pro',
    phone: '11999999999',
    password: 'Admin@123', // In production, this would be hashed
    role: UserRole.PLATFORM_ADMIN,
    twoFactorEnabled: true,
    twoFactorVerified: true,
    acceptedTerms: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
};

// Sample users
export const mockUsers: User[] = [
    platformAdmin,
    {
        id: 'user-001',
        cpf: '98765432100',
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11988888888',
        password: 'User@123',
        role: UserRole.USER,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        acceptedTerms: true,
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-01-10T10:00:00Z'
    },
    {
        id: 'user-002',
        cpf: '11122233344',
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '11977777777',
        password: 'User@123',
        role: UserRole.COMPANY_ADMIN,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        acceptedTerms: true,
        companies: ['company-001'],
        createdAt: '2026-01-05T08:00:00Z',
        updatedAt: '2026-01-05T08:00:00Z'
    },
    {
        id: 'user-003',
        cpf: '55566677788',
        name: 'Pedro Oliveira',
        email: 'pedro@email.com',
        phone: '11966666666',
        password: 'User@123',
        role: UserRole.EMPLOYEE,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        acceptedTerms: true,
        employeeOf: [
            {
                companyId: 'company-001',
                employeeCode: 'AB1234',
                permissions: [
                    { module: 'pdv', actions: ['read', 'write'] },
                    { module: 'inventory', actions: ['read'] }
                ],
                isActive: true,
                hiredAt: '2026-01-15T09:00:00Z'
            }
        ],
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-01-15T09:00:00Z'
    },
    {
        id: 'user-frj',
        cpf: '12345678900',
        name: 'FRJ Banal',
        email: 'frjbanal@gmail.com',
        phone: '11900000000',
        password: 'User@123',
        role: UserRole.PLATFORM_ADMIN,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        acceptedTerms: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'emp-001',
        cpf: '00000000001',
        name: 'Funcionario Teste 1',
        email: 'emp1@test.com',
        phone: '11900000001',
        password: 'User@123',
        role: UserRole.EMPLOYEE,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        acceptedTerms: true,
        employeeOf: [{ companyId: 'company-001', employeeCode: 'TEST01', permissions: [], isActive: true, hiredAt: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'emp-002',
        cpf: '00000000002',
        name: 'Funcionario Teste 2',
        email: 'emp2@test.com',
        phone: '11900000002',
        password: 'User@123',
        role: UserRole.EMPLOYEE,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        acceptedTerms: true,
        employeeOf: [{ companyId: 'company-001', employeeCode: 'TEST02', permissions: [], isActive: true, hiredAt: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'emp-003',
        cpf: '00000000003',
        name: 'Funcionario Teste 3',
        email: 'emp3@test.com',
        phone: '11900000003',
        password: 'User@123',
        role: UserRole.EMPLOYEE,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        acceptedTerms: true,
        employeeOf: [{ companyId: 'company-001', employeeCode: 'TEST03', permissions: [], isActive: true, hiredAt: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'emp-004',
        cpf: '00000000004',
        name: 'Funcionario Teste 4',
        email: 'emp4@test.com',
        phone: '11900000004',
        password: 'User@123',
        role: UserRole.EMPLOYEE,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        acceptedTerms: true,
        employeeOf: [{ companyId: 'company-001', employeeCode: 'TEST04', permissions: [], isActive: true, hiredAt: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'emp-005',
        cpf: '00000000005',
        name: 'Funcionario Teste 5',
        email: 'emp5@test.com',
        phone: '11900000005',
        password: 'User@123',
        role: UserRole.EMPLOYEE,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        acceptedTerms: true,
        employeeOf: [{ companyId: 'company-001', employeeCode: 'TEST05', permissions: [], isActive: true, hiredAt: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'seller-test-001',
        cpf: '11111111111',
        name: 'Vendedor Teste',
        email: 'vendedor.teste@sepi.pro',
        phone: '11987654321',
        password: 'Vendedor123!',
        role: UserRole.SELLER,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        acceptedTerms: true,
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
    }
];

// Sample companies
export const mockCompanies: Company[] = [
    {
        id: 'company-001',
        cnpj: '12345678000190',
        name: 'Restaurante Bom Sabor LTDA',
        tradeName: 'Bom Sabor',
        email: 'contato@bomsabor.com.br',
        phone: '1133334444',
        address: {
            street: 'Rua das Flores',
            number: '123',
            complement: 'Loja 1',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
            country: 'Brasil'
        },
        ownerId: 'user-002',
        planId: 'plan-002',
        planStatus: 'active',
        settings: {
            businessType: 'Restaurante',
            primaryColor: '#FF6B35',
            fiscalRegime: 'simples',
            enablePDV: true,
            enableFiscal: true,
            enableQRCode: true,
            enableInventory: true,
            enableAppointments: true,
            enableMenu: true,
            enableDetailedTracking: true
        },
        createdAt: '2026-01-05T08:30:00Z',
        updatedAt: '2026-01-05T08:30:00Z'
    },
    {
        id: 'company-002',
        cnpj: '98765432000111',
        name: 'Tech Solutions LTDA',
        tradeName: 'Tech Solutions',
        email: 'contato@techsolutions.com.br',
        phone: '1144445555',
        address: {
            street: 'Av. Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100',
            country: 'Brasil'
        },
        ownerId: 'user-002',
        planId: 'plan-003',
        planStatus: 'active',
        settings: {
            businessType: 'Tecnologia',
            primaryColor: '#4A90E2',
            fiscalRegime: 'presumido',
            enablePDV: false,
            enableFiscal: true,
            enableQRCode: true,
            enableInventory: false,
            enableAppointments: true,
            enableMenu: true,
            enableDetailedTracking: true
        },
        createdAt: '2026-01-08T14:00:00Z',
        updatedAt: '2026-01-08T14:00:00Z'
    }
];

// Subscription plans
export const mockPlans: SubscriptionPlan[] = [
    {
        id: 'plan-001',
        name: 'Básico',
        description: 'Plano ideal para pequenos negócios',
        price: 49.90,
        billingCycle: 'monthly',
        features: [
            { name: 'PDV', enabled: true },
            { name: 'Controle de Estoque', enabled: true },
            { name: 'Emissão de NF-e', enabled: false },
            { name: 'QR Code Pagamento', enabled: true },
            { name: 'Relatórios Básicos', enabled: true },
            { name: 'Suporte por Email', enabled: true }
        ],
        maxEmployees: 5,
        maxProducts: 100,
        maxLocations: 1,
        storageGB: 2,
        maxInvoices: 50,
        maxCompanies: 1
    },
    {
        id: 'plan-002',
        name: 'Profissional',
        description: 'Plano completo para empresas em crescimento',
        price: 99.90,
        billingCycle: 'monthly',
        features: [
            { name: 'PDV', enabled: true },
            { name: 'Controle de Estoque', enabled: true },
            { name: 'Emissão de NF-e', enabled: true },
            { name: 'QR Code Pagamento', enabled: true },
            { name: 'Relatórios Avançados', enabled: true },
            { name: 'Gestão Financeira', enabled: true },
            { name: 'Suporte Prioritário', enabled: true }
        ],
        maxEmployees: 20,
        maxProducts: 1000,
        maxLocations: 3,
        storageGB: 10,
        maxInvoices: 500,
        maxCompanies: 5
    },
    {
        id: 'plan-003',
        name: 'Enterprise',
        description: 'Solução completa para grandes empresas',
        price: 199.90,
        billingCycle: 'monthly',
        features: [
            { name: 'PDV', enabled: true },
            { name: 'Controle de Estoque', enabled: true },
            { name: 'Emissão de NF-e/NFC-e', enabled: true },
            { name: 'QR Code Pagamento', enabled: true },
            { name: 'Relatórios Personalizados', enabled: true },
            { name: 'Gestão Financeira Completa', enabled: true },
            { name: 'API de Integração', enabled: true },
            { name: 'Suporte 24/7', enabled: true }
        ],
        maxEmployees: -1, // Unlimited
        maxProducts: -1, // Unlimited
        maxLocations: -1, // Unlimited
        storageGB: 100,
        maxInvoices: 10000,
        maxCompanies: 20
    }
];

// Sample categories
export const mockCategories: Category[] = [
    { id: 'cat-001', companyId: 'company-001', name: 'Pratos Principais', description: 'Pratos principais do cardápio' },
    { id: 'cat-002', companyId: 'company-001', name: 'Bebidas', description: 'Bebidas diversas' },
    { id: 'cat-003', companyId: 'company-001', name: 'Sobremesas', description: 'Sobremesas e doces' },
    { id: 'cat-004', companyId: 'company-002', name: 'Serviços de Consultoria', description: 'Consultoria em TI' },
    { id: 'cat-005', companyId: 'company-002', name: 'Desenvolvimento', description: 'Desenvolvimento de software' }
];

// Sample products
export const mockProducts: Product[] = [
    {
        id: 'prod-001',
        companyId: 'company-001',
        type: 'product',
        name: 'Feijoada Completa',
        description: 'Feijoada tradicional com acompanhamentos',
        sku: 'FEIJ001',
        barcode: '7891234567890',
        categoryId: 'cat-001',
        price: 45.90,
        costPrice: 25.00,
        stock: 50,
        minStock: 10,
        images: [],
        isActive: true,
        requiresPreparation: true,
        createdAt: '2026-01-05T09:00:00Z',
        updatedAt: '2026-01-05T09:00:00Z'
    },
    {
        id: 'prod-002',
        companyId: 'company-001',
        type: 'product',
        name: 'Refrigerante Lata',
        description: 'Refrigerante 350ml',
        sku: 'BEB001',
        barcode: '7891234567891',
        categoryId: 'cat-002',
        price: 5.00,
        costPrice: 2.50,
        stock: 200,
        minStock: 50,
        images: [],
        isActive: true,
        requiresPreparation: false,
        createdAt: '2026-01-05T09:00:00Z',
        updatedAt: '2026-01-05T09:00:00Z'
    },
    {
        id: 'prod-003',
        companyId: 'company-002',
        type: 'service',
        name: 'Consultoria em Cloud Computing',
        description: 'Consultoria especializada em migração para nuvem',
        categoryId: 'cat-004',
        price: 500.00,
        images: [],
        isActive: true,
        requiresPreparation: false,
        createdAt: '2026-01-08T14:30:00Z',
        updatedAt: '2026-01-08T14:30:00Z'
    }
];

// Sample customers
export const mockCustomers: Customer[] = [
    {
        id: 'cust-001',
        companyId: 'company-001',
        name: 'Carlos Mendes',
        email: 'carlos@email.com',
        phone: '11955555555',
        cpfCnpj: '12312312312',
        loyaltyPoints: 150,
        fiscalType: 'f',
        createdAt: '2026-01-10T12:00:00Z'
    },
    {
        id: 'cust-002',
        companyId: 'company-001',
        name: 'Ana Paula',
        email: 'ana@email.com',
        phone: '11944444444',
        cpfCnpj: '32132132132',
        loyaltyPoints: 75,
        fiscalType: 'f',
        createdAt: '2026-01-12T15:00:00Z'
    }
];

// Sample suppliers
export const mockSuppliers: Supplier[] = [
    {
        id: 'supp-001',
        companyId: 'company-001',
        name: 'Distribuidora de Alimentos XYZ',
        cnpj: '11222333000144',
        email: 'vendas@distribuidoraxyz.com.br',
        phone: '1122223333',
        address: {
            street: 'Rua dos Fornecedores',
            number: '500',
            neighborhood: 'Industrial',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '04567-890',
            country: 'Brasil'
        },
        rating: 4.5,
        createdAt: '2026-01-05T10:00:00Z'
    }
];

// Helper function to get user by email
export function getUserByEmail(email: string): User | undefined {
    return mockUsers.find(user => user.email === email);
}

// Helper function to get companies by user
export function getCompaniesByUser(userId: string): Company[] {
    return mockCompanies.filter(company => company.ownerId === userId);
}

// Helper function to get company by ID
export function getCompanyById(companyId: string): Company | undefined {
    return mockCompanies.find(company => company.id === companyId);
}

// Helper function to generate employee code
export function generateEmployeeCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter1 = letters[Math.floor(Math.random() * letters.length)];
    const letter2 = letters[Math.floor(Math.random() * letters.length)];
    const numbers = Math.floor(1000 + Math.random() * 9000);
    return `${letter1}${letter2}${numbers}`;
}
