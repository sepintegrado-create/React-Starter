import { Product, SubscriptionPlan, Category, Company } from '../types/user';
import { mockProducts, mockCategories } from '../data/mockData';
import { PermissionDefinition } from '../types/PermissionDefinition';

// Types
export interface HistoryItem {
    id: string;
    productName: string;
    quantity: number;
    price: number;
    orderedAt: string;
    status: 'delivered' | 'pending' | 'preparing' | 'ready';
}

export interface TabData {
    id: string; // "table-1", "room-101"
    type: 'table' | 'room' | 'appointment';
    number: string;
    status: 'available' | 'occupied';
    history: HistoryItem[];
    companyId?: string;
    // You could add openTime, customerName, etc.
}

export interface PublicOrder {
    id: string;
    companyId: string; // Every order belongs to a company
    userId?: string; // If made by a logged-in user
    targetType: 'table' | 'room' | 'appointment';
    targetNumber: string;
    items: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
        status?: 'pending' | 'preparing' | 'ready' | 'delivered' | 'received';
        requiresPreparation?: boolean;
        assignedEmployee?: { id: string, name: string }; // Employee currently handling this item
    }[];
    status: 'pending' | 'accepted' | 'completed';
    timestamp: number;
    source: 'public' | 'internal';
    history: {
        status: string;
        timestamp: number;
        employeeName?: string;
        note?: string;
    }[];
    finalizedAt?: number;
    isArchived?: boolean; // To clear from active screens
    waiterId?: string; // ID of the employee who opened/handled the order
    customerName?: string; // Optional name of the customer
    finishedBy?: string; // ID of the employee who closed the sale
}

export interface Supplier {
    id: string;
    companyId: string;
    taxId: string; // CNPJ
    name: string;
    tradeName?: string;
    email?: string;
    phone?: string;
    address?: string;
    category?: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface ServiceHistoryItem {
    id: string;
    date: string;
    description: string;
    amount: number;
}

export interface Client {
    id: string;
    name: string;
    phone: string;
    email?: string;
    serviceHistory: ServiceHistoryItem[];
}

export interface ScheduledService {
    id: string;
    serviceId: string;
    serviceName: string;
    employeeId: string;
    employeeName: string;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    duration: number;  // minutes
    price: number;
}

export interface Appointment {
    id: string;
    clientId: string;
    clientName: string;
    date: string; // YYYY-MM-DD
    services: ScheduledService[];
    totalValue: number;
    status: 'scheduled' | 'inprogress' | 'completed' | 'cancelled';
    isForcedFit: boolean;
    notes?: string;
    notified: boolean;
}

export interface StockMovement {
    id: string;
    productId: string;
    productName: string;
    type: 'in' | 'out';
    quantity: number;
    reason: string;
    date: string;
}

export interface EmployeeFunction {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    defaultPermissions: string[];
}

// Employee tracking in db
export interface Employee {
    id: string;
    companyId: string;
    name: string;
    email: string;
    phone: string;
    code: string;
    role: string;
    status: 'active' | 'inactive';
    permissions: string[];
    hiredAt: string;
    blockedUntil?: string;
}

const STORAGE_KEYS = {
    PRODUCTS: 'app_products',
    TABS: 'app_tabs', // Stores state of all tables/rooms
    ORDERS: 'app_orders', // Incoming public orders
    CLIENTS: 'app_clients',
    APPOINTMENTS: 'app_appointments',
    MOVEMENTS: 'app_movements',
    EMPLOYEES: 'app_employees',
    PLANS: 'app_plans',
    PLATFORM_TERMS: 'app_platform_terms',
    PLATFORM_SETTINGS: 'app_platform_settings',
    COMPANIES: 'sepi_companies',
    FISCAL_DOCUMENTS: 'sepi_fiscal_docs',
    CERTIFICATES: 'sepi_certificates',
    SUPPLIERS: 'sepi_suppliers',
    USERS: 'sepi_users',
    CATEGORIES: 'app_categories',
    FUNCTIONS: 'app_functions',
    PERMISSION_DEFINITIONS: 'app_permission_definitions'
};

class DatabaseService {
    // --- Functions (Roles) ---
    getFunctions(companyId?: string): EmployeeFunction[] {
        const stored = localStorage.getItem(STORAGE_KEYS.FUNCTIONS);
        if (!stored) {
            const defaults: EmployeeFunction[] = [
                { id: 'f1', companyId: 'all', name: 'Atendente', defaultPermissions: [] },
                { id: 'f2', companyId: 'all', name: 'Cozinheiro(a)', defaultPermissions: [] },
                { id: 'f3', companyId: 'all', name: 'Gerente', defaultPermissions: [] },
                { id: 'f4', companyId: 'all', name: 'Caixa', defaultPermissions: [] },
                { id: 'f5', companyId: 'all', name: 'Garçom', defaultPermissions: [] },
            ];
            localStorage.setItem(STORAGE_KEYS.FUNCTIONS, JSON.stringify(defaults));
            return defaults;
        }
        const functions: EmployeeFunction[] = JSON.parse(stored);
        if (companyId) {
            return functions.filter(f => f.companyId === companyId || f.companyId === 'all');
        }
        return functions;
    }

    saveFunction(func: EmployeeFunction) {
        const functions = this.getFunctions();
        const index = functions.findIndex(f => f.id === func.id);
        if (index >= 0) {
            functions[index] = func;
        } else {
            functions.push(func);
        }
        localStorage.setItem(STORAGE_KEYS.FUNCTIONS, JSON.stringify(functions));
    }

    deleteFunction(id: string) {
        const functions = this.getFunctions().filter(f => f.id !== id);
        localStorage.setItem(STORAGE_KEYS.FUNCTIONS, JSON.stringify(functions));
    }

    // --- Permission Definitions ---
    getDefaultPermissions(): PermissionDefinition[] {
        return [
            {
                id: 'perm-schedule',
                companyId: 'all',
                name: 'AGENDA',
                description: 'Acesso à agenda e marcações',
                icon: 'Calendar',
                route: '/employee/schedule',
                module: 'schedule',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-pdv',
                companyId: 'all',
                name: 'PDV',
                description: 'Acesso ao Ponto de Venda',
                icon: 'ShoppingCart',
                route: '/employee/pdv',
                module: 'pdv',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-orders',
                companyId: 'all',
                name: 'PEDIDOS',
                description: 'Acompanhamento de pedidos',
                icon: 'ShoppingBag',
                route: '/employee/track-order',
                module: 'track-orders',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-products',
                companyId: 'all',
                name: 'PRODUTOS',
                description: 'Gerenciamento de produtos',
                icon: 'Package',
                route: '/employee/orders',
                module: 'products',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-categories',
                companyId: 'all',
                name: 'CATEGORIAS',
                description: 'Gerenciamento de categorias',
                icon: 'LayoutGrid',
                route: '/employee/categories',
                module: 'categories',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-inventory',
                companyId: 'all',
                name: 'ESTOQUE',
                description: 'Gerenciamento de estoque',
                icon: 'Boxes',
                route: '/employee/inventory',
                module: 'inventory',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-customers',
                companyId: 'all',
                name: 'CLIENTES',
                description: 'Gerenciamento de clientes',
                icon: 'Users',
                route: '/employee/customers',
                module: 'customers',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-suppliers',
                companyId: 'all',
                name: 'FORNECEDORES',
                description: 'Gerenciamento de fornecedores',
                icon: 'Truck',
                route: '/employee/suppliers',
                module: 'suppliers',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-team',
                companyId: 'all',
                name: 'EQUIPE',
                description: 'Gerenciamento da equipe',
                icon: 'Users',
                route: '/employee/team',
                module: 'team',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-functions',
                companyId: 'all',
                name: 'FUNÇÕES',
                description: 'Gerenciamento de funções/cargos',
                icon: 'Briefcase',
                route: '/employee/functions',
                module: 'functions',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-financial',
                companyId: 'all',
                name: 'FINANCEIRO',
                description: 'Acesso ao financeiro',
                icon: 'DollarSign',
                route: '/employee/financial',
                module: 'financial',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-reports',
                companyId: 'all',
                name: 'RELATÓRIOS',
                description: 'Acesso a relatórios e análises',
                icon: 'BarChart',
                route: '/employee/reports',
                module: 'reports',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-fiscal',
                companyId: 'all',
                name: 'FISCAL',
                description: 'Gerenciamento fiscal e NFe',
                icon: 'FileText',
                route: '/employee/fiscal',
                module: 'fiscal',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-qrcode',
                companyId: 'all',
                name: 'QR CODE',
                description: 'Gerenciamento de QR Codes',
                icon: 'QrCode',
                route: '/employee/qrcode',
                module: 'qrcode',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-history',
                companyId: 'all',
                name: 'HISTÓRICO',
                description: 'Histórico de vendas e logs',
                icon: 'Clock',
                route: '/employee/history',
                module: 'history',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-contracts',
                companyId: 'all',
                name: 'CONTRATOS',
                description: 'Gerenciamento de contratos',
                icon: 'FileSignature',
                route: '/employee/contracts',
                module: 'contracts',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-hardware',
                companyId: 'all',
                name: 'HARDWARE',
                description: 'Configuração de periféricos',
                icon: 'Cpu',
                route: '/employee/hardware',
                module: 'hardware',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-public-profile',
                companyId: 'all',
                name: 'PERFIL PÚBLICO',
                description: 'Edição do perfil público da empresa',
                icon: 'Globe',
                route: '/employee/public-profile',
                module: 'public-profile',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'perm-settings',
                companyId: 'all',
                name: 'CONFIGURAÇÕES',
                description: 'Configurações gerais da empresa',
                icon: 'Settings',
                route: '/employee/settings',
                module: 'settings',
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];
    }

    getPermissionDefinitions(companyId?: string): PermissionDefinition[] {
        const stored = localStorage.getItem(STORAGE_KEYS.PERMISSION_DEFINITIONS);
        if (!stored) {
            const defaults = this.getDefaultPermissions();
            localStorage.setItem(STORAGE_KEYS.PERMISSION_DEFINITIONS, JSON.stringify(defaults));
            return defaults;
        }
        const permissions: PermissionDefinition[] = JSON.parse(stored);
        if (companyId) {
            return permissions.filter(p => p.companyId === companyId || p.companyId === 'all');
        }
        return permissions;
    }

    savePermissionDefinition(permission: PermissionDefinition) {
        const permissions = this.getPermissionDefinitions();
        const index = permissions.findIndex(p => p.id === permission.id);
        if (index >= 0) {
            permissions[index] = permission;
        } else {
            permissions.push(permission);
        }
        localStorage.setItem(STORAGE_KEYS.PERMISSION_DEFINITIONS, JSON.stringify(permissions));
    }

    deletePermissionDefinition(id: string) {
        const permissions = this.getPermissionDefinitions().filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PERMISSION_DEFINITIONS, JSON.stringify(permissions));
    }

    isPermissionInUse(permissionId: string): boolean {
        const employees = this.getEmployees();
        return employees.some(emp => emp.permissions.includes(permissionId));
    }

    // Reset permissions to default (useful for fixing duplicates)
    resetPermissionDefinitions() {
        const defaults = this.getDefaultPermissions();
        localStorage.setItem(STORAGE_KEYS.PERMISSION_DEFINITIONS, JSON.stringify(defaults));
        return defaults;
    }


    // --- Products ---
    getProducts(): Product[] {
        const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (!stored) {
            // Initialize with mock data if empty
            const initialProducts = mockProducts.map(p => ({
                ...p,
                requiresPreparation: p.requiresPreparation || false,
                requiresReservation: p.requiresReservation || false,
                requiresAppointment: p.requiresAppointment || false,
                requiresDelivery: p.requiresDelivery || false
            }));
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
            return initialProducts;
        }
        return JSON.parse(stored);
    }

    saveProducts(products: Product[]) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }

    // --- Users ---
    getUsers(): any[] {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        return stored ? JSON.parse(stored) : [];
    }

    saveUser(user: any) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id || u.email === user.email);
        if (index !== -1) {
            users[index] = { ...users[index], ...user };
        } else {
            users.push(user);
        }
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    updateUserStatus(userId: string, status: 'active' | 'inactive') {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].status = status;
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
    }

    deleteUser(userId: string) {
        const users = this.getUsers().filter(u => u.id !== userId);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    blockUser(userId: string, blockedUntil: string | null) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].blockedUntil = blockedUntil;
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
    }

    updateCompanyStatus(companyId: string, status: 'active' | 'suspended') {
        const companies = this.getCompanies();
        const index = companies.findIndex(c => c.id === companyId);
        if (index !== -1) {
            companies[index].status = status;
            localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));

            // Also update single company store if it exists
            const stored = localStorage.getItem(`${STORAGE_KEYS.COMPANIES}_${companyId}`);
            if (stored) {
                const company = JSON.parse(stored);
                company.status = status;
                localStorage.setItem(`${STORAGE_KEYS.COMPANIES}_${companyId}`, JSON.stringify(company));
            }
        }
    }

    deleteCompany(companyId: string) {
        const companies = this.getCompanies().filter(c => c.id !== companyId);
        localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
        localStorage.removeItem(`${STORAGE_KEYS.COMPANIES}_${companyId}`);
    }

    // --- Tabs (Tables & Rooms) ---
    private getTabs(): Record<string, TabData> {
        const stored = localStorage.getItem(STORAGE_KEYS.TABS);
        return stored ? JSON.parse(stored) : {};
    }

    private saveTabs(tabs: Record<string, TabData>) {
        localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
    }

    getTab(type: 'table' | 'room' | 'appointment', number: string, companyId?: string): TabData {
        const tabs = this.getTabs();
        const id = companyId ? `${companyId}-${type}-${number}` : `${type}-${number}`;
        if (!tabs[id]) {
            // Return empty/new tab if not exists
            return {
                id,
                type,
                number,
                status: 'available',
                companyId,
                history: []
            };
        }
        return tabs[id];
    }

    addToTabHistory(type: 'table' | 'room' | 'appointment', number: string, items: HistoryItem[], companyId?: string) {
        const tabs = this.getTabs();
        const id = companyId ? `${companyId}-${type}-${number}` : `${type}-${number}`;

        const tab = tabs[id] || {
            id,
            type,
            number,
            status: 'occupied',
            companyId,
            history: []
        };

        if (companyId) tab.companyId = companyId;
        tab.history = [...tab.history, ...items];
        tab.status = 'occupied';

        tabs[id] = tab;
        this.saveTabs(tabs);
    }

    clearTab(type: 'table' | 'room' | 'appointment', number: string, companyId?: string) {
        const tabs = this.getTabs();
        const id = companyId ? `${companyId}-${type}-${number}` : `${type}-${number}`;
        if (tabs[id]) {
            tabs[id].history = [];
            tabs[id].status = 'available';
            this.saveTabs(tabs);
        }
    }

    // --- Orders (Public & Internal Tracking) ---
    getOrders(companyId?: string, userId?: string): PublicOrder[] {
        const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
        let orders: PublicOrder[] = stored ? JSON.parse(stored) : [];

        if (companyId) {
            orders = orders.filter(o => o.companyId === companyId);
        }

        if (userId) {
            orders = orders.filter(o => o.userId === userId);
        }

        return orders;
    }

    private saveOrders(orders: PublicOrder[]) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }

    createOrder(order: PublicOrder) {
        const orders = this.getOrders(); // Get all orders without filtering to add new one
        if (!order.history) order.history = [{ status: 'Pedido criado', timestamp: Date.now() }];
        orders.push(order);
        this.saveOrders(orders);

        // Also automatically add to Tab History so it shows in PDV
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        const historyItems: HistoryItem[] = order.items.map((item, idx) => ({
            id: `ord-${order.id}-${idx}`,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            orderedAt: timeString,
            status: item.requiresPreparation ? 'pending' : (order.source === 'internal' ? 'delivered' : 'pending')
        }));

        this.addToTabHistory(order.targetType, order.targetNumber, historyItems, order.companyId);
    }

    archiveOrder(orderId: string) {
        const orders = this.getOrders(); // Get all orders to find and archive
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].isArchived = true;
            this.saveOrders(orders);
        }
    }

    archiveCompletedOrders(companyId: string) {
        const orders = this.getOrders();
        orders.forEach(o => {
            if (o.companyId === companyId && o.status === 'completed') {
                o.isArchived = true;
            }
        });
        this.saveOrders(orders);
    }

    archiveOrdersByTarget(companyId: string, type: string, number: string) {
        const orders = this.getOrders();
        orders.forEach(o => {
            if (o.companyId === companyId && o.targetType === type && o.targetNumber === number) {
                o.isArchived = true;
            }
        });
        this.saveOrders(orders);
    }

    clearAllMonitorData(companyId: string) {
        // 1. Archive all active orders for this company or orphans
        const orders = this.getOrders(); // All from localStorage
        orders.forEach(o => {
            if (o.companyId === companyId || !o.companyId) {
                o.isArchived = true;
            }
        });
        this.saveOrders(orders);

        // 2. Clear all manual tabs for this company or orphans
        const tabs = this.getTabs();
        Object.keys(tabs).forEach(id => {
            if (tabs[id].companyId === companyId || !tabs[id].companyId) {
                tabs[id].history = [];
                tabs[id].status = 'available';
            }
        });
        // Clear legacy key just in case
        localStorage.removeItem('app_tab_history');
        this.saveTabs(tabs);
    }

    getAllTabs(companyId: string): { type: 'table' | 'room' | 'appointment', number: string, status: 'available' | 'occupied' | 'ready_to_pay', total: number, customerName?: string }[] {
        // 1. Get components from both active orders and manual tab history
        const activeOrders = this.getOrders(companyId).filter(o => !o.isArchived);
        const tabsState = this.getTabs();

        const tabs: Record<string, any> = {};

        // Process active orders first
        activeOrders.forEach(order => {
            const key = `${order.targetType}-${order.targetNumber}`;
            if (!tabs[key]) {
                tabs[key] = {
                    type: order.targetType,
                    number: order.targetNumber,
                    status: order.status === 'completed' ? 'ready_to_pay' : 'occupied',
                    total: 0,
                    customerName: order.customerName
                };
            }
            tabs[key].total += order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (order.status !== 'completed') tabs[key].status = 'occupied';
        });

        // Process manual tabs history (from PDV "Add to Tab")
        Object.entries(tabsState).forEach(([id, tab]: [string, any]) => {
            // STRICT FILTERING: Only show tabs that explicitly belong to this company
            if (tab.companyId !== companyId) return;

            if (tab.history && tab.history.length > 0) {
                if (!tabs[id]) {
                    tabs[id] = {
                        type: tab.type,
                        number: tab.number,
                        status: tab.status === 'available' ? 'occupied' : tab.status, // If has history, it's at least occupied
                        total: 0,
                        customerName: tab.customerName
                    };
                }
                const historyTotal = tab.history.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                tabs[id].total += historyTotal;

                // If it was already marked occupied by orders, keep it occupied. 
                // If it was available but has history, mark as occupied.
                if (tabs[id].status === 'available') tabs[id].status = 'occupied';
            }
        });

        return Object.values(tabs);
    }

    placePublicOrder(order: PublicOrder) {
        this.createOrder(order);
    }

    updateOrderItemStatus(
        orderId: string,
        itemIdx: number,
        status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'received',
        employee?: { id: string, name: string }
    ) {
        const orders = this.getOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].items[itemIdx].status = status;

            if (employee) {
                orders[orderIndex].items[itemIdx].assignedEmployee = employee;
            }

            // Record in history
            if (!orders[orderIndex].history) orders[orderIndex].history = [];
            orders[orderIndex].history.push({
                status: `${orders[orderIndex].items[itemIdx].name}: ${status}`,
                timestamp: Date.now(),
                employeeName: employee?.name,
            });

            // Auto update overall order status
            const allItems = orders[orderIndex].items;
            const hasPreparing = allItems.some(i => i.status === 'preparing' || i.status === 'ready');
            const allReceived = allItems.every(i => i.status === 'received' || i.status === 'delivered');

            if (allReceived) {
                orders[orderIndex].status = 'completed';
                orders[orderIndex].finalizedAt = Date.now();
            } else if (hasPreparing) {
                orders[orderIndex].status = 'accepted';
            }

            this.saveOrders(orders);
        }
    }

    confirmOrderReceipt(orderId: string) {
        const orders = this.getOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'completed';
            orders[orderIndex].finalizedAt = Date.now();

            // Mark all items as received
            orders[orderIndex].items.forEach(item => {
                item.status = 'received';
            });

            if (!orders[orderIndex].history) orders[orderIndex].history = [];
            orders[orderIndex].history.push({
                status: 'Pedido recebido e finalizado pelo cliente',
                timestamp: Date.now(),
            });

            this.saveOrders(orders);
        }
    }

    // --- Clients ---
    getClients(): Client[] {
        const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
        if (!stored) {
            const initial: Client[] = [
                {
                    id: 'c1', name: 'Carlos Mendes', phone: '11 95555-5555', email: 'carlos@email.com', serviceHistory: [
                        { id: 'h1', date: '2026-01-10', description: 'Almoço Executivo', amount: 45.90 },
                        { id: 'h2', date: '2026-01-15', description: 'Reserva Especial', amount: 150.00 }
                    ]
                },
                { id: 'c2', name: 'Ana Paula', phone: '11 94444-4444', email: 'ana@email.com', serviceHistory: [] }
            ];
            localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(stored);
    }

    addClient(client: Client) {
        const clients = this.getClients();
        clients.push(client);
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    }

    updateClient(updatedClient: Client) {
        const clients = this.getClients();
        const index = clients.findIndex(c => c.id === updatedClient.id);
        if (index !== -1) {
            clients[index] = updatedClient;
            localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
        }
    }

    // --- Appointments ---
    getAppointments(): Appointment[] {
        const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
        return stored ? JSON.parse(stored) : [];
    }

    addAppointment(appointment: Appointment) {
        const appointments = this.getAppointments();
        appointments.push(appointment);
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    }

    updateAppointment(updatedApp: Appointment) {
        const appointments = this.getAppointments();
        const index = appointments.findIndex(a => a.id === updatedApp.id);
        if (index !== -1) {
            appointments[index] = updatedApp;
            localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
        }
    }

    deleteAppointment(id: string) {
        const appointments = this.getAppointments();
        const filtered = appointments.filter(a => a.id !== id);
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(filtered));
    }

    deleteAppointmentsByDate(date: string) {
        const appointments = this.getAppointments();
        const filtered = appointments.filter(a => a.date !== date);
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(filtered));
    }

    sendAppointmentToPDV(appointment: Appointment) {
        // Create an internal order for the PDV
        const order: PublicOrder = {
            id: `app-ord-${appointment.id}`,
            companyId: 'company-001', // Should ideally come from auth context
            targetType: 'appointment',
            targetNumber: appointment.id,
            customerName: appointment.clientName,
            items: appointment.services.map(s => ({
                productId: s.serviceId,
                name: s.serviceName,
                price: s.price,
                quantity: 1,
                status: 'delivered'
            })),
            status: 'completed', // Ready to pay
            timestamp: Date.now(),
            source: 'internal',
            history: [{ status: 'Agendamento concluído e enviado ao PDV', timestamp: Date.now() }]
        };

        this.createOrder(order);
    }

    // --- Companies ---
    getCompanies(): Company[] {
        const stored = localStorage.getItem(STORAGE_KEYS.COMPANIES);
        return stored ? JSON.parse(stored) : [];
    }

    getCompanyById(id: string): Company | undefined {
        const companies = this.getCompanies();
        const found = companies.find(c => c.id === id);
        if (found) return found;

        // Check individual storage
        const stored = localStorage.getItem(`${STORAGE_KEYS.COMPANIES}_${id}`);
        if (stored) return JSON.parse(stored);

        // For development, return a mock company with rich social data if it's the default one
        if (id === 'company-001') {
            return {
                id,
                cnpj: '12.345.678/0001-90',
                name: 'Restaurante Sabor & Arte Ltda',
                tradeName: 'Restaurante Sabor & Arte',
                email: 'contato@saborearte.com.br',
                phone: '(11) 98888-7777',
                address: {
                    street: 'Rua das Flores',
                    number: '123',
                    neighborhood: 'Centro',
                    city: 'São Paulo',
                    state: 'SP',
                    zipCode: '01234-567',
                    country: 'Brasil'
                },
                ownerId: 'user-002',
                planId: 'pro',
                planStatus: 'active' as const,
                settings: {
                    businessType: 'Restaurante',
                    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop',
                    coverPhoto: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
                    bio: 'O melhor da culinária contemporânea com um toque caseiro. Ingredientes frescos e amor em cada prato. 🍽️✨',
                    primaryColor: '#F59E0B',
                    fiscalRegime: 'simples' as const,
                    socialLinks: {
                        instagram: 'https://instagram.com/saborearte',
                        facebook: 'https://facebook.com/saborearte',
                        whatsapp: '(11) 98888-7777'
                    },
                    enablePDV: true,
                    enableFiscal: true,
                    enableQRCode: true,
                    enableInventory: true,
                    enableAppointments: true,
                    enableMenu: true,
                    enableDetailedTracking: true
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as Company;
        }

        return undefined;
    }

    // --- Financial ---
    getTransactions(companyId?: string): any[] {
        const stored = localStorage.getItem('erp_transactions');
        const all: any[] = stored ? JSON.parse(stored) : [];

        if (companyId) {
            return all.filter(t => t.description?.includes(companyId) || t.id?.includes(companyId));
        }
        return all;
    }

    addTransaction(transaction: any) {
        const transactions = this.getTransactions();
        transactions.unshift(transaction);
        localStorage.setItem('erp_transactions', JSON.stringify(transactions));
    }

    // --- Inventory ---
    getStockMovements(): StockMovement[] {
        const stored = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
        return stored ? JSON.parse(stored) : [];
    }

    private recordStockMovement(movement: StockMovement) {
        const movements = this.getStockMovements();
        movements.unshift(movement);
        localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    }

    adjustStock(productId: string, delta: number, reason: string) {
        const products = this.getProducts();
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex !== -1) {
            const product = products[productIndex];
            const oldStock = product.stock || 0;
            const newStock = oldStock + delta;

            products[productIndex] = { ...product, stock: newStock };
            this.saveProducts(products);

            this.recordStockMovement({
                id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                productId,
                productName: product.name,
                type: delta > 0 ? 'in' : 'out',
                quantity: Math.abs(delta),
                reason,
                date: new Date().toLocaleString('pt-BR')
            });
        }
    }

    // --- Employees ---

    getEmployees(companyId?: string): Employee[] {
        const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
        const all: Employee[] = stored ? JSON.parse(stored) : [];
        return companyId ? all.filter(e => e.companyId === companyId) : all;
    }

    getEmployeeByCode(code: string): Employee | undefined {
        return this.getEmployees().find(e => e.code === code);
    }

    addEmployee(employee: Employee) {
        const employees = this.getEmployees();
        employees.push(employee);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    }

    updateEmployee(updatedEmployee: Employee) {
        const employees = this.getEmployees();
        const index = employees.findIndex(e => e.id === updatedEmployee.id);
        if (index !== -1) {
            employees[index] = updatedEmployee;
            localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
        }
    }

    deleteEmployee(id: string) {
        const employees = this.getEmployees().filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    }

    // --- Subscription Plans ---
    getPlans(): SubscriptionPlan[] {
        const stored = localStorage.getItem(STORAGE_KEYS.PLANS);
        if (!stored) {
            const initial: SubscriptionPlan[] = [
                {
                    id: 'basic',
                    name: 'Plano Básico',
                    description: 'Ideal para pequenos negócios',
                    price: 49.90,
                    billingCycle: 'monthly',
                    features: [
                        { name: 'PDV Completo', enabled: true },
                        { name: 'Controle de Estoque', enabled: true },
                        { name: 'QR Code Pagamento', enabled: true },
                        { name: 'Relatórios Básicos', enabled: true },
                        { name: 'Suporte por Email', enabled: true },
                        { name: 'Emissão de NF-e', enabled: false }
                    ],
                    maxEmployees: 5,
                    maxProducts: 100,
                    maxLocations: 1,
                    storageGB: 2,
                    maxInvoices: 50,
                    maxCompanies: 1
                },
                {
                    id: 'pro',
                    name: 'Plano Pro',
                    description: 'Para empresas em crescimento',
                    price: 99.90,
                    billingCycle: 'monthly',
                    features: [
                        { name: 'Tudo do Básico', enabled: true },
                        { name: 'Emissão de NF-e', enabled: true },
                        { name: 'Gestão Financeira', enabled: true },
                        { name: 'Relatórios Avançados', enabled: true },
                        { name: 'Suporte Prioritário', enabled: true },
                        { name: 'Até 20 funcionários', enabled: true }
                    ],
                    maxEmployees: 20,
                    maxProducts: 1000,
                    maxLocations: 3,
                    storageGB: 10,
                    maxInvoices: 500,
                    maxCompanies: 5,
                    popular: true
                },
                {
                    id: 'enterprise',
                    name: 'Plano Enterprise',
                    description: 'Solução completa para grandes empresas',
                    price: 199.90,
                    billingCycle: 'monthly',
                    features: [
                        { name: 'Tudo do Profissional', enabled: true },
                        { name: 'NF-e/NFC-e/NFS-e', enabled: true },
                        { name: 'API de Integração', enabled: true },
                        { name: 'Funcionários Ilimitados', enabled: true },
                        { name: 'Suporte 24/7', enabled: true },
                        { name: 'Gerente de Conta', enabled: true }
                    ],
                    maxEmployees: 100,
                    maxProducts: 10000,
                    maxLocations: 10,
                    storageGB: 50,
                    maxInvoices: 5000,
                    maxCompanies: 20
                }
            ];
            localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(stored);
    }

    savePlans(plans: SubscriptionPlan[]) {
        localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    }

    addPlan(plan: SubscriptionPlan) {
        const plans = this.getPlans();
        plans.push(plan);
        this.savePlans(plans);
    }

    deletePlan(planId: string) {
        const plans = this.getPlans();
        const filtered = plans.filter(p => p.id !== planId);
        this.savePlans(filtered);
    }

    updatePlan(updatedPlan: SubscriptionPlan) {
        const plans = this.getPlans();
        const index = plans.findIndex(p => p.id === updatedPlan.id);
        if (index !== -1) {
            plans[index] = updatedPlan;
            this.savePlans(plans);
        }
    }

    // --- Platform Settings ---
    getPlatformTerms(): { content: string, updatedAt: string, version: string } {
        const stored = localStorage.getItem(STORAGE_KEYS.PLATFORM_TERMS);
        if (!stored) {
            const initial = {
                content: '# Termos de Uso da Plataforma SEPI\n\nAo utilizar a plataforma SEPI, você concorda com os seguintes termos:\n\n1. **Uso do Sistema**: O SEPI é um sistema de gestão empresarial...\n2. **Privacidade**: Seus dados são protegidos conforme a LGPD...\n3. **Responsabilidades**: O usuário é responsável pela veracidade dos dados informados.',
                updatedAt: new Date().toISOString(),
                version: '1.0.0'
            };
            localStorage.setItem(STORAGE_KEYS.PLATFORM_TERMS, JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(stored);
    }

    savePlatformTerms(content: string) {
        const current = this.getPlatformTerms();
        const updated = {
            ...current,
            content,
            updatedAt: new Date().toISOString(),
            version: (parseFloat(current.version) + 0.1).toFixed(1) + '.0'
        };
        localStorage.setItem(STORAGE_KEYS.PLATFORM_TERMS, JSON.stringify(updated));
    }

    getPlatformSettings(): any {
        const stored = localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS);
        if (!stored) {
            const initial = {
                name: 'SEPI',
                email: 'suporte@sepi.pro',
                phone: '(11) 99999-9999',
                primaryColor: '#0F172A',
                welcomeMessage: 'O Sistema Empresarial Profissional Integrado para sua empresa.',
                socialLinks: {
                    instagram: 'https://instagram.com/sepi',
                    linkedin: 'https://linkedin.com/company/sepi'
                }
            };
            localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(stored);
    }

    savePlatformSettings(settings: any) {
        localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(settings));
    }

    saveCompanySettings(companyId: string, settings: any) {
        const company = this.getCompanyById(companyId);
        const updated = { ...company, settings: { ...company.settings, ...settings } };
        localStorage.setItem(`${STORAGE_KEYS.COMPANIES}_${companyId}`, JSON.stringify(updated));

        // Sync with current company if applicable
        const currentStored = localStorage.getItem('sepi_current_company');
        if (currentStored) {
            const current = JSON.parse(currentStored);
            if (current.id === companyId) {
                localStorage.setItem('sepi_current_company', JSON.stringify(updated));
            }
        }
    }

    // --- Fiscal Documents ---
    getFiscalDocuments(companyId?: string): any[] {
        const stored = localStorage.getItem(STORAGE_KEYS.FISCAL_DOCUMENTS);
        if (!stored) {
            const initialDocs = [
                {
                    id: 'doc-001',
                    companyId: 'company-001',
                    type: 'NF-e',
                    series: '1',
                    number: '1254',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    amount: 450.90,
                    status: 'authorized',
                    accessKey: '35240112345678000190550010000012541000012541'
                },
                {
                    id: 'doc-002',
                    companyId: 'company-001',
                    type: 'NFC-e',
                    series: '1',
                    number: '8842',
                    date: new Date(Date.now() - 3600000).toISOString(),
                    amount: 89.90,
                    status: 'authorized',
                    accessKey: '35240112345678000190650010000088421000088429'
                }
            ];
            localStorage.setItem(STORAGE_KEYS.FISCAL_DOCUMENTS, JSON.stringify(initialDocs));
            return companyId ? initialDocs.filter(d => d.companyId === companyId) : initialDocs;
        }

        const docs = JSON.parse(stored);
        if (companyId) {
            return docs.filter((d: any) => d.companyId === companyId);
        }
        return docs;
    }

    saveFiscalDocument(document: any) {
        const docs = this.getFiscalDocuments();
        docs.unshift(document);
        localStorage.setItem(STORAGE_KEYS.FISCAL_DOCUMENTS, JSON.stringify(docs));
    }

    updateFiscalDocumentStatus(docId: string, status: string, accessKey?: string) {
        const docs = this.getFiscalDocuments();
        const index = docs.findIndex((d: any) => d.id === docId);
        if (index !== -1) {
            docs[index].status = status;
            if (accessKey) docs[index].accessKey = accessKey;
            docs[index].updatedAt = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.FISCAL_DOCUMENTS, JSON.stringify(docs));
        }
    }

    // --- Suppliers ---
    getSuppliers(companyId: string): Supplier[] {
        const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
        const all: Supplier[] = stored ? JSON.parse(stored) : [];
        return all.filter(s => s.companyId === companyId);
    }

    saveSupplier(supplier: Supplier) {
        const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
        let all: Supplier[] = stored ? JSON.parse(stored) : [];
        const index = all.findIndex(s => s.id === supplier.id);

        if (index !== -1) {
            all[index] = supplier;
        } else {
            all.push(supplier);
        }

        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(all));
    }

    deleteSupplier(id: string) {
        const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
        if (!stored) return;
        let all: Supplier[] = JSON.parse(stored);
        all = all.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(all));
    }

    // --- Categories ---
    getCategories(companyId?: string): Category[] {
        const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        let all: Category[] = [];
        if (!stored) {
            all = mockCategories;
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(all));
        } else {
            all = JSON.parse(stored);
        }

        if (companyId) {
            return all.filter(c => c.companyId === companyId);
        }
        return all;
    }

    saveCategory(category: Category) {
        const categories = this.getCategories();
        const index = categories.findIndex(c => c.id === category.id);
        if (index !== -1) {
            categories[index] = category;
        } else {
            categories.push(category);
        }
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }

    deleteCategory(id: string) {
        const categories = this.getCategories();
        const filtered = categories.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    }
}

export const db = new DatabaseService();
