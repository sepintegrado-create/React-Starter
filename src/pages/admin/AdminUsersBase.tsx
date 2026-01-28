import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Briefcase, Search, Filter, MoreVertical, Mail, Phone, Calendar, ChevronDown, UserCheck, UserX, UserPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { db } from '../../services/db';
import { mockUsers, platformAdmin } from '../../data/mockData';
import { UserRole, User } from '../../types/user';

type TabType = 'users' | 'companies' | 'employees';

const generateAdminCode = () => {
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `ADM-${num}`;
};

export function AdminUsersBasePage() {
    const [activeTab, setActiveTab] = useState<TabType>('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [adminCode, setAdminCode] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        companyName: '',
        status: 'active' as 'active' | 'inactive'
    });

    useEffect(() => {
        // Merge mockUsers from data file with current db users
        const dbUsers = db.getUsers();
        const allUsers = [...mockUsers];

        dbUsers.forEach(dbU => {
            const index = allUsers.findIndex(u => u.id === dbU.id || u.email === dbU.email);
            if (index !== -1) {
                allUsers[index] = { ...allUsers[index], ...dbU };
            } else {
                allUsers.push(dbU);
            }
        });

        // Map to the shape expected by the state (which includes ordersCount etc)
        const mappedUsers = allUsers.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            status: 'active',
            createdAt: u.createdAt || new Date().toISOString(),
            ordersCount: (u as any).ordersCount || 0,
            sellerCode: u.sellerCode,
            employeeCode: u.employeeCode
        }));

        setUsers(mappedUsers);

        // Mock companies - in production would fetch from API
        setCompanies([
            { id: '1', code: 'ADM-0001', tradeName: 'Restaurante Bom Sabor', adminName: 'Maria Oliveira', email: 'maria@email.com', phone: '(11) 98888-1111', plan: 'Profissional', status: 'active', employeesCount: 12, createdAt: '2024-01-10' },
            { id: '2', code: 'ADM-0002', tradeName: 'Tech Solutions', adminName: 'Pedro Santos', email: 'pedro@tech.com', phone: '(11) 98888-2222', plan: 'Enterprise', status: 'active', employeesCount: 45, createdAt: '2024-02-05' },
            { id: '3', code: 'ADM-0003', tradeName: 'Padaria Central', adminName: 'José Lima', email: 'jose@padaria.com', phone: '(11) 98888-3333', plan: 'Básico', status: 'suspended', employeesCount: 5, createdAt: '2024-03-15' },
        ]);
        setEmployees(db.getEmployees());
    }, []);

    const handleOpenAdd = () => {
        setAdminCode('');
        setFormData({ name: '', email: '', phone: '', cpf: '', companyName: '', status: 'active' });
        setShowAddModal(true);
    };

    const handleCodeChange = (code: string) => {
        const upperCode = code.toUpperCase();
        setAdminCode(upperCode);

        // Auto-fill if exists (for companies, users or employees)
        if (activeTab === 'companies') {
            const existingCompany = companies.find(c => c.code === upperCode);
            if (existingCompany) {
                setFormData({
                    name: existingCompany.adminName,
                    email: existingCompany.email,
                    phone: existingCompany.phone,
                    cpf: '',
                    companyName: existingCompany.tradeName,
                    status: existingCompany.status
                });
            }
        } else {
            // Check for users/employees by code (Check DB + Mock + Admin)
            const dbUsers = db.getUsers();
            const allPotential = [platformAdmin, ...mockUsers, ...dbUsers];

            const foundUser = allPotential.find(u => u.sellerCode === upperCode || u.employeeCode === upperCode);
            if (foundUser) {
                setFormData(prev => ({
                    ...prev,
                    name: foundUser.name,
                    email: foundUser.email,
                    phone: foundUser.phone || '',
                    status: 'active'
                }));
            }
        }
    };

    const handleGenerateCode = () => {
        const code = generateAdminCode();
        setAdminCode(code);
    };

    const handleSave = () => {
        if (activeTab === 'companies') {
            setCompanies(prev => [...prev, {
                id: `company-${Date.now()}`,
                code: adminCode,
                tradeName: formData.companyName,
                adminName: formData.name,
                email: formData.email,
                phone: formData.phone,
                plan: 'Básico',
                status: formData.status,
                employeesCount: 0,
                createdAt: new Date().toISOString().split('T')[0]
            }]);
        } else if (activeTab === 'users') {
            setUsers(prev => [...prev, {
                id: `user-${Date.now()}`,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                status: formData.status,
                createdAt: new Date().toISOString().split('T')[0],
                ordersCount: 0
            }]);
        }
        setShowAddModal(false);
    };

    const tabs = [
        { id: 'users' as TabType, label: 'Usuários', icon: Users, count: users.length },
        { id: 'companies' as TabType, label: 'Administradores de Empresas', icon: Building2, count: companies.length },
        { id: 'employees' as TabType, label: 'Funcionários', icon: Briefcase, count: employees.length },
    ];

    const stats = [
        { label: 'Total de Cadastros', value: users.length + companies.length + employees.length, icon: Users, color: 'text-blue-500' },
        { label: 'Usuários Ativos', value: users.filter(u => u.status === 'active').length, icon: UserCheck, color: 'text-green-500' },
        { label: 'Empresas Ativas', value: companies.filter(c => c.status === 'active').length, icon: Building2, color: 'text-purple-500' },
        { label: 'Contas Suspensas', value: users.filter(u => u.status === 'inactive').length + companies.filter(c => c.status === 'suspended').length, icon: UserX, color: 'text-orange-500' },
    ];

    const getFilteredData = () => {
        const term = searchTerm.toLowerCase();
        switch (activeTab) {
            case 'users':
                return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
            case 'companies':
                return companies.filter(c => c.tradeName.toLowerCase().includes(term) || c.adminName.toLowerCase().includes(term));
            case 'employees':
                return employees.filter(e => e.name.toLowerCase().includes(term) || e.email.toLowerCase().includes(term));
        }
    };

    const filteredData = getFilteredData();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Base de Usuários</h1>
                    <p className="text-muted-foreground mt-1">Gerencie todos os cadastros da plataforma</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                    </Button>
                    <Button size="sm" onClick={handleOpenAdd}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Adicionar {activeTab === 'users' ? 'Usuário' : activeTab === 'companies' ? 'Admin Empresa' : 'Funcionário'}
                    </Button>
                    <Button size="sm" variant="outline">
                        Exportar Dados
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
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

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-4 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-background'
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder={`Buscar ${activeTab === 'users' ? 'usuários' : activeTab === 'companies' ? 'empresas' : 'funcionários'}...`}
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {activeTab === 'users' && 'Usuários Cadastrados'}
                        {activeTab === 'companies' && 'Administradores de Empresas'}
                        {activeTab === 'employees' && 'Funcionários de Empresas'}
                    </CardTitle>
                    <CardDescription>
                        {activeTab === 'users' && 'Consumidores finais da plataforma'}
                        {activeTab === 'companies' && 'Proprietários e administradores de empresas'}
                        {activeTab === 'employees' && 'Funcionários vinculados às empresas'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {activeTab === 'users' && filteredData.map((user: any, index: number) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{user.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {user.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
                                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{user.ordersCount} pedidos</p>
                                        <p className="text-xs text-muted-foreground">Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {activeTab === 'companies' && filteredData.map((company: any, index: number) => (
                            <motion.div
                                key={company.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{company.tradeName}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${company.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {company.status === 'active' ? 'Ativo' : 'Suspenso'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {company.plan}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span>Admin: {company.adminName}</span>
                                            <span className="flex items-center gap-1 font-mono font-semibold"><Mail className="w-3 h-3" />{company.email}</span>
                                            <span className="font-mono font-semibold bg-primary/10 px-2 py-0.5 rounded text-primary">{company.code}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{company.employeesCount} funcionários</p>
                                        <p className="text-xs text-muted-foreground">Desde {new Date(company.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {activeTab === 'employees' && filteredData.map((employee: any, index: number) => (
                            <motion.div
                                key={employee.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Briefcase className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{employee.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1 font-mono font-semibold"><Mail className="w-3 h-3" />{employee.email}</span>
                                            <span>Cargo: {employee.role}</span>
                                            <span className="font-mono font-semibold bg-primary/10 px-2 py-0.5 rounded text-primary">{employee.code}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {employee.permissions?.map((perm: string) => (
                                                <span key={perm} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">
                                                    {perm}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Desde {new Date(employee.hiredAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {filteredData.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum registro encontrado</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Add Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={activeTab === 'users' ? 'Adicionar Usuário' : activeTab === 'companies' ? 'Adicionar Administrador de Empresa' : 'Vincular Funcionário'}
                maxWidth="max-w-xl"
            >
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary/20">
                        <p className="text-[10px] md:text-sm font-black uppercase text-muted-foreground mb-2">
                            {activeTab === 'companies' ? 'Código do Administrador:' : 'Código de Vínculo:'}
                        </p>
                        <div>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border-2 border-primary/30 bg-background text-2xl font-bold font-mono text-primary uppercase"
                                placeholder="Digite o código (ex: ADM-1234)"
                                value={adminCode}
                                onChange={(e) => handleCodeChange(e.target.value)}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">
                                    Digite o código. Se já existir, os dados serão preenchidos automaticamente.
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome Completo"
                            placeholder="Nome do administrador"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="email@exemplo.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Telefone"
                            placeholder="(11) 99999-9999"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        {activeTab === 'companies' && (
                            <Input
                                label="Nome da Empresa"
                                placeholder="Nome fantasia"
                                required
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />
                        )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1" onClick={handleSave}>
                            Cadastrar {activeTab === 'users' ? 'Usuário' : 'Administrador'}
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
