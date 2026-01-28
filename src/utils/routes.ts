import { UserRole } from '../types/user';

export interface Route {
    path: string;
    name: string;
    icon?: string;
    roles: UserRole[];
    children?: Route[];
}

// Platform Admin Routes
export const platformAdminRoutes: Route[] = [
    { path: '/admin', name: 'Início', icon: 'Home', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/users', name: 'Base de Usuários', icon: 'Users', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/contracts', name: 'Contratos', icon: 'FileSignature', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/sellers', name: 'Vendedores', icon: 'UserPlus', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/sales', name: 'Vendas', icon: 'TrendingUp', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/financial', name: 'Financeiro', icon: 'DollarSign', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/history', name: 'Históricos', icon: 'Clock', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/database', name: 'Banco de Dados', icon: 'Database', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/plans', name: 'Pacotes', icon: 'Package', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/fiscal', name: 'Fiscal', icon: 'FileText', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/employees', name: 'Funcionários', icon: 'UserCog', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/profile', name: 'Perfil Público', icon: 'Globe', roles: [UserRole.PLATFORM_ADMIN] },
    { path: '/admin/profile-settings', name: 'Meu Perfil', icon: 'User', roles: [UserRole.PLATFORM_ADMIN] },
];

// Company Admin Routes
export const companyAdminRoutes: Route[] = [
    { path: '/company', name: 'INÍCIO', icon: 'Home', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/schedule', name: 'AGENDA', icon: 'Calendar', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/pdv', name: 'PDV', icon: 'ShoppingCart', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/track-order', name: 'PEDIDOS', icon: 'ShoppingBag', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/products', name: 'PRODUTOS', icon: 'Package', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/inventory', name: 'ESTOQUE', icon: 'Boxes', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/customers', name: 'CLIENTES', icon: 'Users', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/suppliers', name: 'FORNECEDORES', icon: 'Truck', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/employees', name: 'EQUIPE', icon: 'Users', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/financial', name: 'FINANCEIRO', icon: 'DollarSign', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/reports', name: 'RELATÓRIOS', icon: 'BarChart', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/fiscal', name: 'FISCAL', icon: 'FileText', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/qrcode', name: 'QR CODE', icon: 'QrCode', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/history', name: 'HISTÓRICO', icon: 'Clock', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/contracts', name: 'CONTRATOS', icon: 'FileSignature', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/hardware', name: 'HARDWARE', icon: 'Cpu', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/public-profile', name: 'PERFIL PÚBLICO', icon: 'Globe', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/settings', name: 'CONFIGURAÇÕES', icon: 'Settings', roles: [UserRole.COMPANY_ADMIN] },
    { path: '/company/profile-settings', name: 'MEU PERFIL', icon: 'User', roles: [UserRole.COMPANY_ADMIN] },
];

// Employee Routes
export const employeeRoutes: Route[] = [
    { path: '/employee', name: 'INÍCIO', icon: 'Home', roles: [UserRole.EMPLOYEE] },
    { path: '/employee/shift', name: 'TURNO', icon: 'Timer', roles: [UserRole.EMPLOYEE] },
    { path: '/employee/pdv', name: 'PDV', icon: 'ShoppingCart', roles: [UserRole.EMPLOYEE] },
    { path: '/employee/track-order', name: 'PEDIDOS', icon: 'ShoppingBag', roles: [UserRole.EMPLOYEE] },
    { path: '/employee/orders', name: 'SERVIÇOS', icon: 'Briefcase', roles: [UserRole.EMPLOYEE] },
    { path: '/employee/qrcode', name: 'QR CODE', icon: 'QrCode', roles: [UserRole.EMPLOYEE] },
    { path: '/employee/history', name: 'HISTÓRICO', icon: 'Clock', roles: [UserRole.EMPLOYEE] },
    { path: '/employee/communication', name: 'COMUNICAÇÃO', icon: 'MessageSquare', roles: [UserRole.EMPLOYEE] },
    { path: '/employee/profile', name: 'MEU PERFIL', icon: 'User', roles: [UserRole.EMPLOYEE] },
];

// Seller Routes (Platform package sellers)
export const sellerRoutes: Route[] = [
    { path: '/seller', name: 'INÍCIO', icon: 'Home', roles: [UserRole.SELLER] },
    { path: '/seller/packages', name: 'PACOTES', icon: 'Package', roles: [UserRole.SELLER] },
    { path: '/seller/sales', name: 'VENDAS E COMISSÕES', icon: 'TrendingUp', roles: [UserRole.SELLER] },
    { path: '/seller/settings', name: 'CONFIGURAÇÕES', icon: 'Settings', roles: [UserRole.SELLER] },
    { path: '/seller/profile', name: 'MEU PERFIL', icon: 'User', roles: [UserRole.SELLER] },
];

// User Routes (no company association)
export const userRoutes: Route[] = [
    { path: '/user', name: 'Início', icon: 'Home', roles: [UserRole.USER] },
    { path: '/user/explore', name: 'Buscar', icon: 'Search', roles: [UserRole.USER] },
    { path: '/user/track-order', name: 'Pedidos', icon: 'ShoppingBag', roles: [UserRole.USER] },
    { path: '/user/orders', name: 'Histórico', icon: 'Clock', roles: [UserRole.USER] },
    { path: '/user/qrcode', name: 'QR Code', icon: 'QrCode', roles: [UserRole.USER] },
    { path: '/user/payments', name: 'Pagamentos', icon: 'CreditCard', roles: [UserRole.USER] },
    { path: '/user/profile', name: 'Meu Perfil', icon: 'User', roles: [UserRole.USER] },
];

// Get routes based on role
export function getRoutesByRole(role: UserRole): Route[] {
    switch (role) {
        case UserRole.PLATFORM_ADMIN:
            return platformAdminRoutes;
        case UserRole.COMPANY_ADMIN:
            return companyAdminRoutes;
        case UserRole.EMPLOYEE:
            return employeeRoutes;
        case UserRole.SELLER:
            return sellerRoutes;
        case UserRole.USER:
        default:
            return userRoutes;
    }
}

// Check if user has access to route
export function hasRouteAccess(route: string, role: UserRole): boolean {
    const routes = getRoutesByRole(role);
    return routes.some(r => route.startsWith(r.path));
}
