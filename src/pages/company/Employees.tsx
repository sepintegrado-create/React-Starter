import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Clock, CheckCircle, XCircle, MoreVertical, Edit2, Calendar as CalendarIcon, Briefcase, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { generateEmployeeCode } from '../../data/mockData';
import { Modal } from '../../components/ui/Modal';
import { db, Employee } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionDefinition } from '../../types/PermissionDefinition';

export function EmployeesPage() {
    const { currentCompany } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [functions, setFunctions] = useState<any[]>([]);
    const [permissionDefinitions, setPermissionDefinitions] = useState<PermissionDefinition[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        sellerCode: '',
        role: 'Atendente',
        status: 'active' as 'active' | 'inactive',
        permissions: [] as string[]
    });

    const refreshEmployees = () => {
        setEmployees(db.getEmployees(currentCompany?.id));
    };

    useEffect(() => {
        if (currentCompany) {
            refreshEmployees();
            setFunctions(db.getFunctions(currentCompany.id));
            setPermissionDefinitions(db.getPermissionDefinitions(currentCompany.id).filter(p => p.isActive));
        }
    }, [currentCompany]);

    const handleRoleChange = (roleName: string) => {
        setFormData(prev => ({
            ...prev,
            role: roleName
            // Removed automatic permission assignment: a role is just a label (nomenclature)
        }));
    };

    const handleGenerateCode = () => {
        const code = generateEmployeeCode();
        setGeneratedCode(code);
    };

    const handleCodeChange = (code: string) => {
        const upperCode = code.toUpperCase();
        setGeneratedCode(upperCode);

        // 1. Auto-fill if employee ALREADY exists in this company
        const existingEmployee = employees.find(e => e.code === upperCode);
        if (existingEmployee) {
            setFormData({
                name: existingEmployee.name,
                email: existingEmployee.email,
                phone: existingEmployee.phone,
                sellerCode: (existingEmployee as any).sellerCode || '',
                role: existingEmployee.role,
                status: existingEmployee.status,
                permissions: existingEmployee.permissions
            });
            return;
        }

        // 2. INTEGRATION: Search for external user who registered this code
        const registeredUser = db.getUsers().find(u => u.employeeCode === upperCode);
        if (registeredUser) {
            setFormData(prev => ({
                ...prev,
                name: registeredUser.name,
                email: registeredUser.email,
                phone: registeredUser.phone || '',
                status: 'active'
                // Removed default permissions: access should be explicitly granted via checkboxes
            }));
        }
    };

    const handleOpenAdd = () => {
        setEditingEmployee(null);
        // Don't add any default permissions - only checkboxes should control permissions
        setFormData({ name: '', email: '', phone: '', sellerCode: '', role: 'Atendente', status: 'active', permissions: [] });
        setGeneratedCode('');
        setShowAddModal(true);
    };

    const handleOpenEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            sellerCode: (employee as any).sellerCode || '',
            role: employee.role,
            status: employee.status,
            permissions: employee.permissions
        });
        setGeneratedCode(employee.code);
        setShowAddModal(true);
    };

    const handleTogglePermission = (perm: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    const handleSave = () => {
        // Validate that code is not empty
        if (!generatedCode || generatedCode.trim() === '') {
            alert('Por favor, digite ou gere um código para o funcionário.');
            return;
        }

        // Map permission IDs to Permission objects for user integration
        const mappedPermissions = formData.permissions
            .map(permId => {
                const permDef = permissionDefinitions.find(p => p.id === permId);
                if (!permDef) return null;
                return {
                    module: permDef.module,
                    actions: ['read', 'write'] as ('read' | 'write' | 'delete' | 'admin')[]
                };
            })
            .filter(Boolean) as { module: string; actions: ('read' | 'write' | 'delete' | 'admin')[] }[];

        const registeredUser = db.getUsers().find(u => u.employeeCode === generatedCode);

        if (editingEmployee) {
            db.updateEmployee({
                ...editingEmployee,
                ...formData,
                code: generatedCode
            });

            // INTEGRATION: Update user permissions if linked
            if (registeredUser) {
                const existingAssocIndex = (registeredUser.employeeOf || []).findIndex(
                    emp => emp.companyId === (currentCompany?.id || 'company-001')
                );

                let updatedEmployeeOf = [...(registeredUser.employeeOf || [])];

                if (existingAssocIndex !== -1) {
                    // Update existing association
                    updatedEmployeeOf[existingAssocIndex] = {
                        ...updatedEmployeeOf[existingAssocIndex],
                        employeeCode: generatedCode,
                        permissions: mappedPermissions
                    };
                } else {
                    // This shouldn't happen during "edit" if code matches, but for safety:
                    updatedEmployeeOf.push({
                        companyId: currentCompany?.id || 'company-001',
                        employeeCode: generatedCode,
                        isActive: true,
                        hiredAt: new Date().toISOString().split('T')[0],
                        permissions: mappedPermissions
                    });
                }

                db.saveUser({
                    ...registeredUser,
                    employeeOf: updatedEmployeeOf
                });
            }
        } else {
            db.addEmployee({
                id: `emp-${Date.now()}`,
                companyId: currentCompany?.id || 'company-001',
                ...formData,
                code: generatedCode,
                status: 'active',
                hiredAt: new Date().toISOString().split('T')[0]
            });

            // INTEGRATION: Link existing user if found
            if (registeredUser) {
                const existingAssocIndex = (registeredUser.employeeOf || []).findIndex(
                    emp => emp.companyId === (currentCompany?.id || 'company-001')
                );

                let updatedEmployeeOf = [...(registeredUser.employeeOf || [])];

                if (existingAssocIndex !== -1) {
                    // Replace existing association to prevent duplicates
                    updatedEmployeeOf[existingAssocIndex] = {
                        ...updatedEmployeeOf[existingAssocIndex],
                        employeeCode: generatedCode,
                        isActive: true,
                        permissions: mappedPermissions
                    };
                } else {
                    // Add new association
                    updatedEmployeeOf.push({
                        companyId: currentCompany?.id || 'company-001',
                        employeeCode: generatedCode,
                        isActive: true,
                        hiredAt: new Date().toISOString().split('T')[0],
                        permissions: mappedPermissions
                    });
                }

                const updatedUser = {
                    ...registeredUser,
                    role: 'EMPLOYEE',
                    employeeOf: updatedEmployeeOf
                };
                db.saveUser(updatedUser);
            }
        }
        refreshEmployees();
        setShowAddModal(false);
    };

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
                    <p className="text-muted-foreground mt-1">Gerencie sua equipe e permissões</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.hash = '#/company/permissions'}>
                        <Shield className="w-4 h-4 mr-2" />
                        Gerenciar Permissões
                    </Button>
                    <Button variant="outline" onClick={() => window.location.hash = '#/company/functions'}>
                        <Briefcase className="w-4 h-4 mr-2" />
                        Gerenciar Funções
                    </Button>
                    <Button onClick={handleOpenAdd}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Adicionar Funcionário
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total de Funcionários', value: employees.length, icon: UserPlus, color: 'text-blue-500' },
                    { label: 'Ativos', value: employees.filter(e => e.status === 'active').length, icon: CheckCircle, color: 'text-green-500' },
                    { label: 'Inativos', value: employees.filter(e => e.status === 'inactive').length, icon: XCircle, color: 'text-gray-500' },
                    { label: 'Em Turno Agora', value: 2, icon: Clock, color: 'text-orange-500' },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar funcionários..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Employees List */}
            <Card>
                <CardHeader>
                    <CardTitle>Equipe</CardTitle>
                    <CardDescription>Lista de todos os funcionários cadastrados</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredEmployees.map((employee, index) => (
                            <motion.div
                                key={employee.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-semibold text-lg">
                                            {employee.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{employee.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${employee.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span>{employee.email}</span>
                                            <span>•</span>
                                            <span className="font-mono font-semibold">{employee.code}</span>
                                            <span>•</span>
                                            <span>{employee.role}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {employee.permissions.map(permId => {
                                                const permDef = permissionDefinitions.find(p => p.id === permId);
                                                return (
                                                    <span key={permId} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">
                                                        {permDef?.name || permId}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right mr-4">
                                        <p className="text-sm text-muted-foreground">Desde</p>
                                        <p className="text-sm font-medium">{new Date(employee.hiredAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <button
                                        onClick={() => window.location.hash = `#/company/schedule?employeeId=${employee.id}`}
                                        className="p-2 rounded-lg hover:bg-muted transition-colors text-primary"
                                        title="Ver Agenda"
                                    >
                                        <CalendarIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleOpenEdit(employee)}
                                        className="p-2 rounded-lg hover:bg-muted transition-colors text-primary"
                                        title="Editar Funcionário"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Add Employee Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingEmployee ? "Editar Funcionário" : "Adicionar Funcionário"}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary/20">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                            Código do Funcionário {editingEmployee ? '(Não Editável)' : ''}
                        </p>
                        {editingEmployee ? (
                            <div>
                                <div className="flex items-center justify-between">
                                    <p className="text-3xl font-bold font-mono text-primary">{generatedCode}</p>
                                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generatedCode)}>Copiar</Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    O código de acesso não pode ser alterado por aqui.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-primary/30 bg-background text-3xl font-bold font-mono text-primary uppercase"
                                    placeholder="Digite o código (ex: AB1234)"
                                    value={generatedCode}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">
                                        Digite o código do funcionário. Se já existir, os dados serão preenchidos automaticamente.
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleGenerateCode}
                                        className="text-xs"
                                    >
                                        Gerar Código
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome Completo"
                            placeholder="João Silva"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="joao@email.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Telefone"
                            placeholder="(11) 99999-9999"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Cargo
                            </label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={formData.role}
                                onChange={(e) => handleRoleChange(e.target.value)}
                            >
                                {functions.map(f => (
                                    <option key={f.id} value={f.name}>{f.name}</option>
                                ))}
                                {!functions.some(f => f.name === 'Atendente') && <option>Atendente</option>}
                                <option>Outro</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <label className="block text-sm font-semibold text-blue-900 mb-1">Código do Vendedor (Opcional)</label>
                        <p className="text-xs text-blue-700 mb-3">Se este funcionário foi indicado por um vendedor SEPI, insira o código dele aqui.</p>
                        <input
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                            placeholder="Ex: VEND-TEST01"
                            value={formData.sellerCode}
                            onChange={(e) => setFormData({ ...formData, sellerCode: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Status da Conta
                            </label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                            >
                                <option value="active">Ativo (Acesso Liberado)</option>
                                <option value="inactive">Inativo (Acesso Bloqueado)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Permissões
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {permissionDefinitions.map(perm => (
                                <label key={perm.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${formData.permissions.includes(perm.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                                    <input
                                        type="checkbox"
                                        className="rounded text-primary focus:ring-primary"
                                        checked={formData.permissions.includes(perm.id)}
                                        onChange={() => handleTogglePermission(perm.id)}
                                    />
                                    <span className="text-sm font-medium">{perm.name}</span>
                                </label>
                            ))}
                        </div>
                        {permissionDefinitions.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhuma permissão disponível. <button onClick={() => window.location.hash = '#/company/permissions'} className="text-primary hover:underline">Criar permissões</button>
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1" onClick={handleSave}>{editingEmployee ? 'Salvar Alterações' : 'Cadastrar Funcionário'}</Button>
                        <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancelar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
