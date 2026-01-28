import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, CheckCircle, XCircle, MoreVertical, Edit2, Copy, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/validators';
import { mockUsers, platformAdmin } from '../../data/mockData';
import { db } from '../../services/db';
import { UserRole } from '../../types/user';

interface Seller {
    id: string;
    code: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    commissionType: 'percentage' | 'second_month';
    createdAt: string;
    totalSales: number;
    totalCommission: number;
    pendingCommission: number;
}

const generateSellerCode = () => {
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `VEND-${num}`;
};

export function AdminSellersPage() {
    const [sellers, setSellers] = useState<Seller[]>([
        { id: 'test-seller', code: 'VEND-TEST01', name: 'Vendedor Teste', email: 'vendedor.teste@sepi.pro', phone: '(11) 98765-4321', status: 'active', commissionType: 'percentage', createdAt: '2024-01-10', totalSales: 8, totalCommission: 2400, pendingCommission: 300 },
        { id: '1', code: 'VEND-0001', name: 'Carlos Vendedor', email: 'carlos@sepi.pro', phone: '(11) 99999-1111', status: 'active', commissionType: 'percentage', createdAt: '2024-01-15', totalSales: 15, totalCommission: 4500, pendingCommission: 450 },
        { id: '2', code: 'VEND-0002', name: 'Ana Comercial', email: 'ana@sepi.pro', phone: '(11) 99999-2222', status: 'active', commissionType: 'second_month', createdAt: '2024-02-20', totalSales: 22, totalCommission: 6600, pendingCommission: 199.90 },
        { id: '3', code: 'VEND-0003', name: 'Pedro Parceiro', email: 'pedro@parceiro.com', phone: '(11) 99999-3333', status: 'inactive', commissionType: 'percentage', createdAt: '2024-03-10', totalSales: 5, totalCommission: 750, pendingCommission: 0 },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'active' as 'active' | 'inactive',
        commissionType: 'percentage' as 'percentage' | 'second_month'
    });

    const stats = [
        { label: 'Total de Vendedores', value: sellers.length, icon: Users, color: 'text-blue-500' },
        { label: 'Vendas Totais', value: sellers.reduce((sum, s) => sum + s.totalSales, 0), icon: TrendingUp, color: 'text-green-500' },
        { label: 'Comissões Totais', value: formatCurrency(sellers.reduce((sum, s) => sum + s.totalCommission, 0)), icon: DollarSign, color: 'text-purple-500' },
        { label: 'Comissões Pendentes', value: formatCurrency(sellers.reduce((sum, s) => sum + s.pendingCommission, 0)), icon: DollarSign, color: 'text-orange-500' },
    ];

    const handleOpenAdd = () => {
        setEditingSeller(null);
        setGeneratedCode('');
        setFormData({ name: '', email: '', phone: '', status: 'active', commissionType: 'percentage' });
        setShowAddModal(true);
    };

    const handleOpenEdit = (seller: Seller) => {
        setEditingSeller(seller);
        setGeneratedCode(seller.code);
        setFormData({
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            status: seller.status,
            commissionType: seller.commissionType
        });
        setShowAddModal(true);
    };

    const handleSave = () => {
        if (editingSeller) {
            setSellers(prev => prev.map(s =>
                s.id === editingSeller.id
                    ? { ...s, ...formData }
                    : s
            ));
        } else {
            setSellers(prev => [...prev, {
                id: `seller-${Date.now()}`,
                code: generatedCode,
                ...formData,
                createdAt: new Date().toISOString().split('T')[0],
                totalSales: 0,
                totalCommission: 0,
                pendingCommission: 0
            }]);
        }
        setShowAddModal(false);
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
    };

    const handleCodeChange = (code: string) => {
        const upperCode = code.toUpperCase();
        setGeneratedCode(upperCode);

        // 1. Auto-fill if seller exists in state (editing or already added)
        const existingInState = sellers.find(s => s.code === upperCode);
        if (existingInState) {
            setFormData({
                name: existingInState.name,
                email: existingInState.email,
                phone: existingInState.phone,
                status: existingInState.status,
                commissionType: existingInState.commissionType
            });
            return;
        }

        // 2. Auto-fill if user registered as seller in profile (has sellerCode)
        const dbUsers = db.getUsers();
        const allPotential = [platformAdmin, ...mockUsers, ...dbUsers];
        const userWithCode = allPotential.find(u => u.sellerCode === upperCode);

        if (userWithCode) {
            setFormData(prev => ({
                ...prev,
                name: userWithCode.name,
                email: userWithCode.email,
                phone: userWithCode.phone || ''
            }));
        }
    };

    const filteredSellers = sellers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vendedores</h1>
                    <p className="text-muted-foreground mt-1">Gerencie os vendedores de planos da plataforma</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => window.location.hash = '#/admin/commissions'}>
                        Configurar Comissões
                    </Button>
                    <Button onClick={handleOpenAdd}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Novo Vendedor
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
                                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
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
                            placeholder="Buscar por nome, email ou código..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Sellers List */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Vendedores</CardTitle>
                    <CardDescription>Vendedores cadastrados para venda de planos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredSellers.map((seller, index) => (
                            <motion.div
                                key={seller.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-semibold text-lg">
                                            {seller.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{seller.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${seller.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {seller.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <button
                                                onClick={() => copyCode(seller.code)}
                                                className="flex items-center gap-1 font-mono font-bold text-primary hover:underline"
                                                title="Clique para copiar"
                                            >
                                                {seller.code}
                                                <Copy className="w-3 h-3" />
                                            </button>
                                            <span>•</span>
                                            <span>{seller.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${seller.commissionType === 'percentage'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                {seller.commissionType === 'percentage' ? '10% do Pacote' : '100% da 2ª Mensalidade'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{seller.totalSales} vendas</p>
                                        <p className="text-xs text-muted-foreground">Total: {formatCurrency(seller.totalCommission)}</p>
                                        {seller.pendingCommission > 0 && (
                                            <p className="text-xs text-orange-600 font-medium">Pendente: {formatCurrency(seller.pendingCommission)}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.location.hash = `#/admin/seller/${seller.id}`}
                                        >
                                            Ver Perfil
                                        </Button>
                                        <button
                                            onClick={() => handleOpenEdit(seller)}
                                            className="p-2 rounded-lg hover:bg-muted transition-colors text-primary"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {filteredSellers.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum vendedor encontrado</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Seller Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingSeller ? "Editar Vendedor" : "Novo Vendedor"}
                maxWidth="max-w-xl"
            >
                <div className="space-y-4">
                    {/* Seller Code */}
                    <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary/20">
                        <p className="text-[10px] md:text-sm font-black uppercase text-muted-foreground mb-2">
                            Código do Vendedor {editingSeller ? '(Não Editável)' : ''}:
                        </p>
                        {editingSeller ? (
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-bold font-mono text-primary">{generatedCode}</p>
                                <Button variant="outline" size="sm" onClick={() => copyCode(generatedCode)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copiar
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-lg border-2 border-primary/30 bg-background text-lg font-bold font-mono text-primary uppercase"
                                    placeholder="Digite o código (ex: VEND-1234)"
                                    value={generatedCode}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Digite o código do vendedor. Se já existir, os dados serão preenchidos automaticamente.
                                </p>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                            Este código será usado para rastrear as vendas e calcular comissões
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome Completo"
                            placeholder="Nome do vendedor"
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
                        <div>
                            <label className="block text-[10px] md:text-sm font-black uppercase text-muted-foreground mb-1.5">
                                Status:
                            </label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                            >
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                            </select>
                        </div>
                    </div>

                    {/* Commission Type */}
                    <div>
                        <label className="block text-[10px] md:text-sm font-black uppercase text-muted-foreground mb-3">
                            Tipo de Comissão:
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.commissionType === 'percentage'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground'
                                }`}>
                                <input
                                    type="radio"
                                    name="commissionType"
                                    className="mt-1"
                                    checked={formData.commissionType === 'percentage'}
                                    onChange={() => setFormData({ ...formData, commissionType: 'percentage' })}
                                />
                                <div>
                                    <p className="font-bold text-sm">10% do Pacote</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Recebe 10% do valor do pacote no momento da venda
                                    </p>
                                </div>
                            </label>
                            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.commissionType === 'second_month'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground'
                                }`}>
                                <input
                                    type="radio"
                                    name="commissionType"
                                    className="mt-1"
                                    checked={formData.commissionType === 'second_month'}
                                    onChange={() => setFormData({ ...formData, commissionType: 'second_month' })}
                                />
                                <div>
                                    <p className="font-bold text-sm">100% da 2ª Mensalidade</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Recebe o valor integral da segunda mensalidade paga
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1" onClick={handleSave}>
                            {editingSeller ? 'Salvar Alterações' : 'Cadastrar Vendedor'}
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
