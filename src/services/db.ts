import { Product, SubscriptionPlan } from '../types/user';
import { mockProducts } from '../data/mockData';

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
    type: 'table' | 'room';
    number: string;
    status: 'available' | 'occupied';
    history: HistoryItem[];
    // You could add openTime, customerName, etc.
}

export interface PublicOrder {
    id: string;
    companyId: string; // Every order belongs to a company
    userId?: string; // If made by a logged-in user
    targetType: 'table' | 'room';
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

export interface Appointment {
    id: string;
    clientId: string;
    clientName: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    description: string;
    status: 'scheduled' | 'completed' | 'cancelled';
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

export interface Employee {
    id: string;
    companyId: string;
    name: string;
    email: string;
    phone: string;
    code: string;
    role: string;
    status: 'active' | 'inactive';
    hiredAt: string;
    permissions: string[];
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
    TAB_HISTORY: 'app_tab_history',
    SUPPLIERS: 'sepi_suppliers',
    USERS: 'sepi_users'
};

class DatabaseService {
    // --- Products ---
    getProducts(): Product[] {
        const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (!stored) {
            // Initialize with mock data if empty
            const initialProducts = mockProducts.map(p => ({ ...p, requiresPreparation: false }));
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

    // --- Tabs (Tables & Rooms) ---
    private getTabs(): Record<string, TabData> {
        const stored = localStorage.getItem(STORAGE_KEYS.TABS);
        return stored ? JSON.parse(stored) : {};
    }

    private saveTabs(tabs: Record<string, TabData>) {
        localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
    }

    getTab(type: 'table' | 'room', number: string): TabData {
        const tabs = this.getTabs();
        const id = `${type}-${number}`;
        if (!tabs[id]) {
            // Return empty/new tab if not exists
            return {
                id,
                type,
                number,
                status: 'available',
                history: []
            };
        }
        return tabs[id];
    }

    addToTabHistory(type: 'table' | 'room', number: string, items: HistoryItem[]) {
        const tabs = this.getTabs();
        const id = `${type}-${number}`;

        const tab = tabs[id] || {
            id,
            type,
            number,
            status: 'occupied',
            history: []
        };

        tab.history = [...tab.history, ...items];
        tab.status = 'occupied';

        tabs[id] = tab;
        this.saveTabs(tabs);
    }

    clearTab(type: 'table' | 'room', number: string) {
        const tabs = this.getTabs();
        const id = `${type}-${number}`;
        if (tabs[id]) {
            tabs[id].history = [];
            tabs[id].status = 'available';
            this.saveTabs(tabs);
        }
    }

    // --- Orders (Public & Internal Tracking) ---
    getOrders(companyId?: string, userId?: string): PublicOrder[] {
        const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
        let orders: PublicOrder[] = [];

        if (!stored) {
            const initialOrders: PublicOrder[] = [
                {
                    id: 'ord-1234',
                    companyId: 'company-001',
                    targetType: 'table',
                    targetNumber: '5',
                    items: [
                        { productId: '1', name: 'Hambúrguer Gourmet', price: 45.90, quantity: 2, status: 'pending', requiresPreparation: true },
                        { productId: '2', name: 'Suco de Laranja Natural', price: 12.00, quantity: 1, status: 'delivered', requiresPreparation: false }
                    ],
                    status: 'accepted',
                    timestamp: Date.now() - 3600000,
                    source: 'public',
                    history: [
                        { status: 'Pedido criado', timestamp: Date.now() - 3610000 },
                        { status: 'Suco de Laranja Natural: delivered', timestamp: Date.now() - 3605000, employeeName: 'Garçom Pedro' }
                    ]
                },
                {
                    id: 'ord-5678',
                    companyId: 'company-001',
                    targetType: 'room',
                    targetNumber: '101',
                    items: [
                        { productId: '3', name: 'Café da Manhã Completo', price: 65.00, quantity: 1, status: 'pending', requiresPreparation: true }
                    ],
                    status: 'pending',
                    timestamp: Date.now() - 1800000,
                    source: 'internal',
                    history: [
                        { status: 'Pedido criado internamente', timestamp: Date.now() - 1810000, employeeName: 'Garçom Pedro' }
                    ]
                }
            ];
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
            orders = initialOrders;
        } else {
            orders = JSON.parse(stored);
        }

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

        this.addToTabHistory(order.targetType, order.targetNumber, historyItems);
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
        const orders = this.getOrders(); // Get all orders to find and archive
        orders.forEach(o => {
            if (o.companyId === companyId && o.status === 'completed') {
                o.isArchived = true;
            }
        });
        this.saveOrders(orders);
    }

    getAllTabs(companyId: string): { type: 'table' | 'room', number: string, status: 'available' | 'occupied' | 'ready_to_pay', total: number }[] {
        const orders = this.getOrders(companyId).filter(o => !o.isArchived);
        const tabs: Record<string, any> = {};

        // 1. Check current orders
        orders.forEach(order => {
            const key = `${order.targetType}-${order.targetNumber}`;
            if (!tabs[key]) {
                tabs[key] = {
                    type: order.targetType,
                    number: order.targetNumber,
                    status: order.status === 'completed' ? 'ready_to_pay' : 'occupied',
                    total: 0
                };
            }
            tabs[key].total += order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (order.status !== 'completed') tabs[key].status = 'occupied';
        });

        // 2. Check tab history (occupied but maybe no active "order" if just created internally)
        const historyStored = localStorage.getItem(STORAGE_KEYS.TAB_HISTORY); // Using new STORAGE_KEYS.TAB_HISTORY
        const histories: Record<string, any> = historyStored ? JSON.parse(historyStored) : {};

        Object.entries(histories).forEach(([key, items]: [string, any]) => {
            if (items.length > 0) {
                const [type, number] = key.split('-');
                if (!tabs[key]) {
                    tabs[key] = {
                        type,
                        number,
                        status: 'occupied',
                        total: 0
                    };
                }
                tabs[key].total += (items as any[]).reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
        if (!stored) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            const initial: Appointment[] = [
                { id: 'a1', clientId: 'c1', clientName: 'Carlos Mendes', date: tomorrowStr, time: '12:30', description: 'Almoço de Negócios', status: 'scheduled', notified: false },
                { id: 'a2', clientId: 'c2', clientName: 'Ana Paula', date: tomorrowStr, time: '19:00', description: 'Jantar de Aniversário', status: 'scheduled', notified: false }
            ];
            localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(stored);
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

    // --- Financial ---
    getTransactions(companyId?: string): any[] {
        const stored = localStorage.getItem('erp_transactions');
        let all: any[] = stored ? JSON.parse(stored) : [
            { id: '1', type: 'income', category: 'Venda de Produto', description: 'Venda PDV - #1234', amount: 45.90, date: '2026-01-20', status: 'completed' },
            { id: '2', type: 'expense', category: 'Fornecedores', description: 'Distribuidora XYZ - Carne', amount: 1200.00, date: '2026-01-19', status: 'pending' },
        ];

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
        let all: Employee[] = [];
        if (!stored) {
            all = [
                {
                    id: '1',
                    companyId: 'company-001',
                    name: 'Pedro Oliveira',
                    email: 'pedro@email.com',
                    phone: '11 99999-0001',
                    code: 'AB1234',
                    role: 'Atendente',
                    status: 'active',
                    hiredAt: '2026-01-15',
                    permissions: ['PDV', 'Estoque']
                },
                {
                    id: '2',
                    companyId: 'company-010', // Different company
                    name: 'Ana Silva',
                    email: 'ana.silva@email.com',
                    phone: '11 99999-0002',
                    code: 'CD5678',
                    role: 'Cozinheira',
                    status: 'active',
                    hiredAt: '2026-01-10',
                    permissions: ['Cozinha']
                }
            ];
            localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(all));
        } else {
            all = JSON.parse(stored);
        }

        if (companyId) {
            return all.filter(e => e.companyId === companyId);
        }
        return all;
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

    getCompanyById(id: string): any {
        const stored = localStorage.getItem(`${STORAGE_KEYS.COMPANIES}_${id}`);
        if (stored) return JSON.parse(stored);

        // For development, return a mock company with rich social data if it's the default one
        return {
            id,
            ownerId: 'user-002', // Associate with mock user Maria Santos
            tradeName: 'Restaurante Sabor & Arte',
            settings: {
                logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop',
                coverPhoto: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
                bio: 'O melhor da culinária contemporânea com um toque caseiro. Ingredientes frescos e amor em cada prato. 🍽️✨',
                primaryColor: '#F59E0B',
                socialLinks: {
                    instagram: 'https://instagram.com/saborearte',
                    facebook: 'https://facebook.com/saborearte',
                    whatsapp: '(11) 98888-7777'
                },
                enableDetailedTracking: true
            }
        };
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
}

export const db = new DatabaseService();
