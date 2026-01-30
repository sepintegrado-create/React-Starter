export interface PermissionDefinition {
    id: string;
    companyId: string; // 'all' for global permissions
    name: string; // Ex: "PDV", "Cozinha"
    description?: string;
    icon: string; // Lucide icon name
    route: string; // Associated route, ex: "/employee/pdv"
    module: string; // Technical module for mapping
    isActive: boolean;
    createdAt: string;
}
