import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Clock, CheckCircle, XCircle, MoreVertical, Edit2, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { formatCPF, formatPhone } from '../../utils/validators';

interface PlatformEmployee {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf?: string;
    role: string;
    status: 'active' | 'inactive';
    permissions: string[];
    hiredAt: string;
    addressStreet?: string;
    addressNumber?: string;
    addressCity?: string;
    addressState?: string;
    addressZipCode?: string;
}

export function AdminEmployeesPage() {
    const [employees, setEmployees] = useState<PlatformEmployee[]>([
        {
            id: '1',
            name: 'Flávio V. Junior',
            email: 'flaviovjr@sepi.pro',
            phone: '(11) 99999-0001',
            cpf: '123.456.789-01',
            role: 'Administrador Master',
            status: 'active',
            permissions: ['Tudo'],
            hiredAt: '2024-01-01',
            addressStreet: 'Rua Principal',
            addressNumber: '100',
            addressCity: 'São Paulo',
            addressState: 'SP',
            addressZipCode: '01000-000'
        },
        {
            id: '2',
            name: 'Ana Suporte',
            email: 'ana@sepi.pro',
            phone: '(11) 99999-0002',
            cpf: '234.567.890-12',
            role: 'Suporte Técnico',
            status: 'active',
            permissions: ['Suporte', 'Usuários', 'Empresas'],
            hiredAt: '2024-02-15',
            addressStreet: 'Av. Tecnologia',
            addressNumber: '200',
            addressCity: 'São Paulo',
            addressState: 'SP',
            addressZipCode: '02000-000'
        },
        {
            id: '3',
            name: 'Carlos Dev',
            email: 'carlos@sepi.pro',
            phone: '(11) 99999-0003',
            cpf: '345.678.901-23',
            role: 'Desenvolvedor',
            status: 'active',
            permissions: ['Desenvolvimento', 'Database'],
            hiredAt: '2024-03-01',
            addressStreet: 'Rua dos Códigos',
            addressNumber: '300',
            addressCity: 'São Paulo',
            addressState: 'SP',
            addressZipCode: '03000-000'
        },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<PlatformEmployee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        role: 'Suporte Técnico',
        status: 'active' as 'active' | 'inactive',
        permissions: [] as string[],
        addressStreet: '',
        addressNumber: '',
        addressCity: '',
        addressState: '',
        addressZipCode: ''
    });

    const platformPermissions = [
        'Dashboard', 'Usuários', 'Empresas', 'Financeiro', 'Fiscal',
        'Planos', 'Contratos', 'Suporte', 'Desenvolvimento', 'Database', 'Tudo'
    ];

    const handleOpenAdd = () => {
        setEditingEmployee(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            cpf: '',
            role: 'Suporte Técnico',
            status: 'active',
            permissions: ['Dashboard'],
            addressStreet: '',
            addressNumber: '',
            addressCity: '',
            addressState: '',
            addressZipCode: ''
        });
        setShowAddModal(true);
    };

    const handleOpenEdit = (employee: PlatformEmployee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            cpf: employee.cpf || '',
            role: employee.role,
            status: employee.status,
            permissions: employee.permissions,
            addressStreet: employee.addressStreet || '',
            addressNumber: employee.addressNumber || '',
            addressCity: employee.addressCity || '',
            addressState: employee.addressState || '',
            addressZipCode: employee.addressZipCode || ''
        });
        setShowAddModal(true);
    };

    const handleTogglePermission = (perm: string) => {
        if (perm === 'Tudo') {
            setFormData(prev => ({
                ...prev,
                permissions: prev.permissions.includes('Tudo') ? [] : ['Tudo']
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                permissions: prev.permissions.includes(perm)
                    ? prev.permissions.filter(p => p !== perm)
                    : [...prev.permissions.filter(p => p !== 'Tudo'), perm]
            }));
        }
    };

    const handleSave = () => {
        if (editingEmployee) {
            setEmployees(prev => prev.map(e =>
                e.id === editingEmployee.id
                    ? { ...e, ...formData }
                    : e
            ));
        } else {
            setEmployees(prev => [...prev, {
                id: `emp-${Date.now()}`,
                ...formData,
                hiredAt: new Date().toISOString().split('T')[0]
            }]);
        }
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
                    <h1 className="text-3xl font-bold tracking-tight">Funcionários da Plataforma</h1>
                    <p className="text-muted-foreground mt-1">Equipe interna do SEPI e permissões administrativas</p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Funcionário
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total de Funcionários', value: employees.length, icon: UserPlus, color: 'text-blue-500' },
                    { label: 'Ativos', value: employees.filter(e => e.status === 'active').length, icon: CheckCircle, color: 'text-green-500' },
                    { label: 'Inativos', value: employees.filter(e => e.status === 'inactive').length, icon: XCircle, color: 'text-gray-500' },
                    { label: 'Admins Master', value: employees.filter(e => e.permissions.includes('Tudo')).length, icon: Shield, color: 'text-purple-500' },
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
                    <CardTitle>Equipe SEPI</CardTitle>
                    <CardDescription>Funcionários com acesso ao painel administrativo</CardDescription>
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
                                            {employee.permissions.includes('Tudo') && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                    Admin Master
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span>{employee.email}</span>
                                            <span>•</span>
                                            <span>{employee.role}</span>
                                            {employee.cpf && (
                                                <>
                                                    <span>•</span>
                                                    <span>CPF: {employee.cpf}</span>
                                                </>
                                            )}
                                            {employee.addressCity && (
                                                <>
                                                    <span>•</span>
                                                    <span>{employee.addressCity}/{employee.addressState}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {employee.permissions.slice(0, 4).map(perm => (
                                                <span key={perm} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">
                                                    {perm}
                                                </span>
                                            ))}
                                            {employee.permissions.length > 4 && (
                                                <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                                                    +{employee.permissions.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right mr-4">
                                        <p className="text-sm text-muted-foreground">Desde</p>
                                        <p className="text-sm font-medium">{new Date(employee.hiredAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
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

            {/* Add/Edit Employee Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingEmployee ? "Editar Funcionário" : "Adicionar Funcionário"}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome Completo"
                            placeholder="Nome do funcionário"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="email@sepi.pro"
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
                            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Cargo
                            </label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option>Administrador Master</option>
                                <option>Suporte Técnico</option>
                                <option>Desenvolvedor</option>
                                <option>Financeiro</option>
                                <option>Marketing</option>
                                <option>Outro</option>
                            </select>
                        </div>
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
                        <Input
                            label="CPF"
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <h4 className="font-bold mb-4">Endereço</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <Input
                                    label="Rua"
                                    placeholder="Rua Exemplo"
                                    value={formData.addressStreet}
                                    onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                                />
                            </div>
                            <Input
                                label="Número"
                                placeholder="123"
                                value={formData.addressNumber}
                                onChange={(e) => setFormData({ ...formData, addressNumber: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <Input
                                label="Cidade"
                                placeholder="São Paulo"
                                value={formData.addressCity}
                                onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                            />
                            <Input
                                label="Estado"
                                placeholder="SP"
                                maxLength={2}
                                value={formData.addressState}
                                onChange={(e) => setFormData({ ...formData, addressState: e.target.value.toUpperCase() })}
                            />
                            <Input
                                label="CEP"
                                placeholder="00000-000"
                                value={formData.addressZipCode}
                                onChange={(e) => setFormData({ ...formData, addressZipCode: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Permissões na Plataforma
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {platformPermissions.map(perm => (
                                <label key={perm} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${formData.permissions.includes(perm) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                                    <input
                                        type="checkbox"
                                        className="rounded text-primary focus:ring-primary"
                                        checked={formData.permissions.includes(perm)}
                                        onChange={() => handleTogglePermission(perm)}
                                    />
                                    <span className="text-sm font-medium">{perm}</span>
                                </label>
                            ))}
                        </div>
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
