// User roles in the system
export enum UserRole {
    PLATFORM_ADMIN = 'PLATFORM_ADMIN',
    COMPANY_ADMIN = 'COMPANY_ADMIN',
    EMPLOYEE = 'EMPLOYEE',
    SELLER = 'SELLER',
    USER = 'USER'
}

// User interface
export interface User {
    id: string;
    cpf: string;
    name: string;
    email: string;
    phone: string;
    password: string; // Hashed in production
    role: UserRole;
    twoFactorEnabled: boolean;
    twoFactorVerified: boolean;
    acceptedTerms: boolean;
    acceptedTermsAt?: string;
    createdAt: string;
    updatedAt: string;
    companies?: string[]; // Company IDs user is associated with
    employeeOf?: EmployeeAssociation[]; // Companies where user is an employee
    sellerCode?: string; // If user is a seller
    employeeCode?: string; // If user is an employee (for linking)
}

// Employee association
export interface EmployeeAssociation {
    companyId: string;
    employeeCode: string; // XX0000 format
    permissions: Permission[];
    isActive: boolean;
    hiredAt: string;
}

// Company interface
export interface Company {
    id: string;
    cnpj: string;
    name: string;
    tradeName: string;
    email: string;
    phone: string;
    address: Address;
    ownerId: string; // User ID of company owner
    planId: string;
    planStatus: 'active' | 'suspended' | 'cancelled';
    settings: CompanySettings;
    createdAt: string;
    updatedAt: string;
}

// Address interface
export interface Address {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

// Company settings
export interface CompanySettings {
    businessType: string; // Ramo de atividade
    logo?: string;
    coverPhoto?: string;
    bio?: string;
    primaryColor?: string;
    fiscalRegime: 'simples' | 'presumido' | 'real';
    socialLinks?: {
        instagram?: string;
        facebook?: string;
        linkedin?: string;
        whatsapp?: string;
    };
    enablePDV: boolean;
    enableFiscal: boolean;
    enableQRCode: boolean;
    enableInventory: boolean;
    enableAppointments: boolean;
    enableMenu: boolean;
    enableDetailedTracking: boolean; // Global toggle for Received -> Preparing -> Ready flow
    fiscalConfig?: FiscalConfig;
    fiscalCertificate?: FiscalCertificate;
    hardware?: HardwareSettings;
}

export interface FiscalCertificate {
    id: string;
    alias: string;
    expiryDate: string;
    issuer: string;
    status: 'active' | 'expired' | 'revoked';
    passwordHash?: string; // Reference for simulation
    fileName: string;
}

export interface FiscalConfig {
    regime: 'simples' | 'presumido' | 'real';
    nfeSeries: string;
    nfceSeries: string;
    nfseSeries: string;
    cfopDefault: string;
    cscId?: string;
    cscToken?: string;
}

export interface HardwareSettings {
    printer?: {
        type: 'thermal' | 'fiscal' | 'none';
        model?: string;
        connection: 'usb' | 'network' | 'bluetooth';
        paperSize: '58mm' | '80mm';
        autoPrint: boolean;
    };
    fiscal?: {
        provider: 'nfc-e' | 'sat' | 'none';
        token?: string;
        signKey?: string;
    };
    scale?: {
        enabled: boolean;
        model?: string;
        port?: string;
        baudRate?: number;
        protocol?: 'toledo' | 'filizola' | 'none';
    };
    scanner?: {
        mode: 'keyboard' | 'serial';
        prefix?: string;
        suffix?: string;
    };
    keyboard?: {
        shortcutsEnabled: boolean;
        layout: 'br' | 'us';
    };
}

// Permission system
export interface Permission {
    module: string; // 'pdv', 'inventory', 'financial', etc.
    actions: ('read' | 'write' | 'delete' | 'admin')[];
}

// Subscription plans
export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    features: PlanFeature[];
    maxEmployees: number;
    maxProducts: number;
    maxLocations: number;
    storageGB: number;
    maxInvoices: number;
    maxCompanies: number;
    popular?: boolean;
}

export interface PlanFeature {
    name: string;
    enabled: boolean;
    limit?: number;
}

export interface PlatformTerms {
    content: string;
    updatedAt: string;
    version: string;
}

export interface PlatformSettings {
    name: string;
    email: string;
    phone: string;
    logo?: string;
    primaryColor: string;
    welcomeMessage: string;
    supportUrl?: string;
    socialLinks?: {
        instagram?: string;
        facebook?: string;
        linkedin?: string;
    };
}

// Employee with full details
export interface Employee {
    id: string;
    userId: string;
    companyId: string;
    employeeCode: string; // XX0000
    permissions: Permission[];
    isActive: boolean;
    hiredAt: string;
    terminatedAt?: string;
    shifts: Shift[];
}

// Shift tracking
export interface Shift {
    id: string;
    employeeId: string;
    companyId: string;
    startTime: string;
    endTime?: string;
    location?: {
        lat: number;
        lng: number;
    };
    breaks: Break[];
    totalHours?: number;
}

export interface Break {
    startTime: string;
    endTime?: string;
}

// Product/Service
export interface Product {
    id: string;
    companyId: string;
    type: 'product' | 'service';
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    categoryId: string;
    price: number;
    costPrice?: number;
    stock?: number;
    minStock?: number;
    images: string[];
    isActive: boolean;
    requiresPreparation: boolean;
    fiscalData?: ProductFiscalData;
    createdAt: string;
    updatedAt: string;
}

export interface ProductFiscalData {
    ncm: string;
    cest?: string;
    cfop?: string;
    origin: number; // 0 - Nacional, etc.
    taxRates: {
        icms: number;
        pis: number;
        cofins: number;
        iss?: number;
    };
    cst: string;
}

// Category
export interface Category {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    parentId?: string;
}

// Transaction
export interface Transaction {
    id: string;
    companyId: string;
    type: 'sale' | 'purchase' | 'payment' | 'receipt';
    amount: number;
    status: 'pending' | 'delivered' | 'preparing' | 'ready' | 'cancelled' | 'refunded';
    paymentMethod: PaymentMethod;
    items?: TransactionItem[];
    customerId?: string;
    employeeId?: string;
    qrCodeId?: string;
    fiscalDocumentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status?: 'pending' | 'preparing' | 'ready' | 'delivered';
    requiresPreparation?: boolean;
}

// Payment methods
export type PaymentMethod =
    | 'cash'
    | 'credit_card'
    | 'debit_card'
    | 'pix'
    | 'bank_transfer'
    | 'check';

// QR Code
export interface QRCode {
    id: string;
    companyId: string;
    type: 'payment' | 'table' | 'room' | 'employee';
    code: string;
    pixKey?: string;
    amount?: number;
    metadata?: Record<string, any>;
    isActive: boolean;
    expiresAt?: string;
    createdAt: string;
    validations: QRCodeValidation[];
}

export interface QRCodeValidation {
    id: string;
    qrCodeId: string;
    validatedBy: string; // User or Employee ID
    validatedAt: string;
    transactionId?: string;
}

// Fiscal document
export interface FiscalDocument {
    id: string;
    companyId: string;
    type: 'nfe' | 'nfce' | 'nfse';
    number: string;
    series: string;
    transactionId: string;
    status: 'draft' | 'issued' | 'cancelled' | 'denied';
    xmlContent?: string;
    accessKey?: string;
    issuedAt?: string;
    cancelledAt?: string;
    createdAt: string;
}

// Customer
export interface Customer {
    id: string;
    companyId: string;
    name: string;
    email?: string;
    phone?: string;
    cpfCnpj?: string;
    address?: Address;
    loyaltyPoints?: number;
    fiscalType: 'f' | 'j'; // Person or Company
    createdAt: string;
}

// Supplier
export interface Supplier {
    id: string;
    companyId: string;
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    address: Address;
    rating?: number;
    createdAt: string;
}

// Financial account
export interface FinancialAccount {
    id: string;
    companyId: string;
    name: string;
    type: 'bank' | 'cash' | 'credit_card';
    balance: number;
    currency: string;
}

// Auth context types
export interface AuthContextType {
    user: User | null;
    currentCompany: Company | null;
    currentRole: UserRole;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (userData: Partial<User>) => Promise<void>;
    switchRole: (role: UserRole, companyId?: string) => void;
    updateUser: (userData: Partial<User>) => void;
    verify2FA: (code: string) => Promise<boolean>;
}
