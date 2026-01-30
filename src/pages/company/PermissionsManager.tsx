import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, AlertCircle, Shield, Eye } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { db } from '../../services/db';
import { PermissionDefinition } from '../../types/PermissionDefinition';
import { useAuth } from '../../contexts/AuthContext';

export function PermissionsManager() {
    const { currentCompany } = useAuth();
    const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPermission, setEditingPermission] = useState<PermissionDefinition | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'Shield',
        route: '/employee/',
        module: ''
    });

    const refreshPermissions = () => {
        setPermissions(db.getPermissionDefinitions(currentCompany?.id));
    };

    useEffect(() => {
        refreshPermissions();
    }, [currentCompany]);

    const handleOpenAdd = () => {
        setEditingPermission(null);
        setFormData({ name: '', description: '', icon: 'Shield', route: '/employee/', module: '' });
        setShowAddModal(true);
    };

    const handleOpenEdit = (permission: PermissionDefinition) => {
        setEditingPermission(permission);
        setFormData({
            name: permission.name,
            description: permission.description || '',
            icon: permission.icon,
            route: permission.route,
            module: permission.module
        });
        setShowAddModal(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.route || !formData.module) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const permission: PermissionDefinition = {
            id: editingPermission?.id || `perm-${Date.now()}`,
            companyId: currentCompany?.id || 'all',
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            route: formData.route,
            module: formData.module,
            isActive: true,
            createdAt: editingPermission?.createdAt || new Date().toISOString()
        };

        db.savePermissionDefinition(permission);
        refreshPermissions();
        setShowAddModal(false);
    };

    const handleDelete = (permission: PermissionDefinition) => {
        if (permission.companyId === 'all') {
            alert('Não é possível excluir permissões padrão do sistema.');
            return;
        }

        if (db.isPermissionInUse(permission.id)) {
            alert('Esta permissão está em uso por funcionários. Remova-a dos funcionários antes de excluir.');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir a permissão "${permission.name}"?`)) {
            db.deletePermissionDefinition(permission.id);
            refreshPermissions();
        }
    };

    const handleToggleActive = (permission: PermissionDefinition) => {
        db.savePermissionDefinition({
            ...permission,
            isActive: !permission.isActive
        });
        refreshPermissions();
    };

    // Available Lucide icons for selection
    const availableIcons = [
        'Shield', 'ShoppingCart', 'Timer', 'Briefcase', 'QrCode', 'ShoppingBag',
        'DollarSign', 'Clock', 'MessageSquare', 'Boxes', 'Users', 'BarChart',
        'Package', 'FileText', 'Settings', 'Home', 'Calendar', 'Truck',
        'CreditCard', 'Phone', 'Mail', 'MapPin', 'Star', 'Heart'
    ];

    const getIconComponent = (iconName: string) => {
        const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Shield;
        return IconComponent;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciar Permissões</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure as permissões disponíveis para os funcionários
                    </p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Permissão
                </Button>
            </div>

            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">
                                Como funciona o sistema de permissões
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                Crie permissões personalizadas que aparecerão no menu dos funcionários.
                                Cada permissão está vinculada a uma rota específica do sistema.
                                Permissões padrão (globais) não podem ser excluídas, mas você pode criar suas próprias.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Permissions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Permissões Disponíveis</CardTitle>
                    <CardDescription>
                        {permissions.filter(p => p.isActive).length} permissões ativas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {permissions.map((permission, index) => {
                            const IconComponent = getIconComponent(permission.icon);
                            const isGlobal = permission.companyId === 'all';
                            const inUse = db.isPermissionInUse(permission.id);

                            return (
                                <motion.div
                                    key={permission.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center justify-between p-4 rounded-lg border ${permission.isActive ? 'bg-background' : 'bg-muted/50 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${permission.isActive ? 'bg-primary/10' : 'bg-muted'
                                            }`}>
                                            <IconComponent className={`w-6 h-6 ${permission.isActive ? 'text-primary' : 'text-muted-foreground'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{permission.name}</h3>
                                                {isGlobal && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                        Sistema
                                                    </span>
                                                )}
                                                {inUse && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        Em uso
                                                    </span>
                                                )}
                                                {!permission.isActive && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        Inativa
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {permission.description || 'Sem descrição'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                <span className="font-mono">{permission.route}</span>
                                                <span>•</span>
                                                <span>Módulo: {permission.module}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(permission)}
                                            className={`p-2 rounded-lg transition-colors ${permission.isActive
                                                ? 'hover:bg-muted text-green-600'
                                                : 'hover:bg-muted text-gray-400'
                                                }`}
                                            title={permission.isActive ? 'Desativar' : 'Ativar'}
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenEdit(permission)}
                                            className="p-2 rounded-lg hover:bg-muted transition-colors text-primary"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        {!isGlobal && (
                                            <button
                                                onClick={() => handleDelete(permission)}
                                                className="p-2 rounded-lg hover:bg-muted transition-colors text-red-600"
                                                title="Excluir"
                                                disabled={inUse}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingPermission ? 'Editar Permissão' : 'Nova Permissão'}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-primary" />
                            Preencher de um Modelo de Sistema
                        </label>
                        <select
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                            onChange={(e) => {
                                const selected = db.getDefaultPermissions().find(p => p.id === e.target.value);
                                if (selected) {
                                    setFormData({
                                        name: selected.name,
                                        description: selected.description || '',
                                        icon: selected.icon,
                                        route: selected.route,
                                        module: selected.module
                                    });
                                }
                            }}
                        >
                            <option value="">Selecione um módulo padrão...</option>
                            {db.getDefaultPermissions().map(perm => (
                                <option key={perm.id} value={perm.id}>
                                    {perm.name} ({perm.module})
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Nome da Permissão"
                        placeholder="Ex: Delivery, Caixa 2"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Descrição
                        </label>
                        <textarea
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none"
                            placeholder="Descreva o que esta permissão permite fazer"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Ícone
                            </label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            >
                                {availableIcons.map(icon => {
                                    const IconComp = getIconComponent(icon);
                                    return (
                                        <option key={icon} value={icon}>
                                            {icon}
                                        </option>
                                    );
                                })}
                            </select>
                            <div className="mt-2 p-3 rounded-lg bg-muted flex items-center gap-2">
                                {React.createElement(getIconComponent(formData.icon), { className: 'w-5 h-5' })}
                                <span className="text-sm">Preview do ícone</span>
                            </div>
                        </div>

                        <Input
                            label="Módulo"
                            placeholder="Ex: pdv, orders, inventory"
                            required
                            value={formData.module}
                            onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <Input
                            label="Rota"
                            placeholder="/employee/sua-rota"
                            required
                            value={formData.route}
                            onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => window.open(`#${formData.route}`, '_blank')}
                            className="absolute right-3 top-[34px] p-1.5 hover:bg-muted rounded-md text-primary transition-colors"
                            title="Testar Rota"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium">Atenção</p>
                                <p className="mt-1">
                                    Certifique-se de que a rota especificada existe no sistema.
                                    Rotas inválidas podem causar erros de navegação.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            {editingPermission ? 'Salvar Alterações' : 'Criar Permissão'}
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
