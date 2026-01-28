import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, TrendingUp, DollarSign, Calendar, Building2, CheckCircle, Clock, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/validators';

interface Sale {
    id: string;
    companyName: string;
    packageName: string;
    packageValue: number;
    saleDate: string;
    commissionValue: number;
    commissionStatus: 'pending' | 'paid';
    paymentDate?: string;
}

export function AdminSellerProfilePage() {
    // In production, get seller ID from URL params
    const sellerId = window.location.hash.split('/').pop() || '1';

    const [seller] = useState({
        id: sellerId,
        code: 'VEND-0001',
        name: 'Carlos Vendedor',
        email: 'carlos@sepi.pro',
        phone: '(11) 99999-1111',
        status: 'active' as const,
        commissionType: 'percentage' as const,
        createdAt: '2024-01-15',
        totalSales: 15,
        totalCommission: 4500,
        pendingCommission: 450,
        paidCommission: 4050
    });

    const [sales] = useState<Sale[]>([
        { id: '1', companyName: 'Restaurante Bom Sabor', packageName: 'Profissional', packageValue: 99.90, saleDate: '2024-01-20', commissionValue: 9.99, commissionStatus: 'paid', paymentDate: '2024-02-20' },
        { id: '2', companyName: 'Tech Solutions', packageName: 'Enterprise', packageValue: 199.90, saleDate: '2024-01-25', commissionValue: 19.99, commissionStatus: 'paid', paymentDate: '2024-02-25' },
        { id: '3', companyName: 'Padaria Central', packageName: 'Básico', packageValue: 49.90, saleDate: '2024-02-01', commissionValue: 4.99, commissionStatus: 'paid', paymentDate: '2024-03-01' },
        { id: '4', companyName: 'Loja XYZ', packageName: 'Profissional', packageValue: 99.90, saleDate: '2024-02-10', commissionValue: 9.99, commissionStatus: 'paid', paymentDate: '2024-03-10' },
        { id: '5', companyName: 'Café Premium', packageName: 'Profissional', packageValue: 99.90, saleDate: '2024-03-15', commissionValue: 9.99, commissionStatus: 'pending' },
    ]);

    const stats = [
        { label: 'Vendas Totais', value: seller.totalSales, icon: TrendingUp, color: 'text-blue-500' },
        { label: 'Comissão Total', value: formatCurrency(seller.totalCommission), icon: DollarSign, color: 'text-green-500' },
        { label: 'Comissão Paga', value: formatCurrency(seller.paidCommission), icon: CheckCircle, color: 'text-emerald-500' },
        { label: 'Comissão Pendente', value: formatCurrency(seller.pendingCommission), icon: Clock, color: 'text-orange-500' },
    ];

    const copyCode = () => {
        navigator.clipboard.writeText(seller.code);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => window.location.hash = '#/admin/sellers'}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
            </div>

            {/* Profile Card */}
            <Card className="overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-primary to-primary/60" />
                <CardContent className="pt-0">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
                        <div className="w-24 h-24 rounded-2xl bg-white border-4 border-background shadow-xl flex items-center justify-center text-3xl font-black text-primary">
                            {seller.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 pb-4">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold">{seller.name}</h1>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${seller.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {seller.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <button
                                    onClick={copyCode}
                                    className="flex items-center gap-1 font-mono font-bold text-primary hover:underline"
                                >
                                    {seller.code}
                                    <Copy className="w-3 h-3" />
                                </button>
                                <span>{seller.email}</span>
                                <span>{seller.phone}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pb-4">
                            <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${seller.commissionType === 'percentage'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                                }`}>
                                {seller.commissionType === 'percentage' ? '10% do Pacote' : '100% da 2ª Mensalidade'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

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

            {/* Sales History */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Histórico de Vendas</CardTitle>
                        <CardDescription>Vendas realizadas com o código {seller.code}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sales.map((sale, index) => (
                            <motion.div
                                key={sale.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{sale.companyName}</h3>
                                        <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                                            <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium">{sale.packageName}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Pacote: {formatCurrency(sale.packageValue)}</p>
                                        <p className="text-lg font-bold text-green-600">Comissão: {formatCurrency(sale.commissionValue)}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${sale.commissionStatus === 'paid'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {sale.commissionStatus === 'paid' ? 'Pago' : 'Pendente'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Commission Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Resumo de Comissões</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 border border-green-200">
                                <span className="font-medium text-green-700">Total Pago</span>
                                <span className="text-xl font-bold text-green-700">{formatCurrency(seller.paidCommission)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50 border border-orange-200">
                                <span className="font-medium text-orange-700">Pendente</span>
                                <span className="text-xl font-bold text-orange-700">{formatCurrency(seller.pendingCommission)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <span className="font-medium text-primary">Total Geral</span>
                                <span className="text-xl font-bold text-primary">{formatCurrency(seller.totalCommission)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Informações do Vendedor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Código</span>
                                <span className="font-mono font-bold">{seller.code}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email</span>
                                <span>{seller.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Telefone</span>
                                <span>{seller.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tipo de Comissão</span>
                                <span className="font-medium">{seller.commissionType === 'percentage' ? '10% do Pacote' : '100% da 2ª Mensalidade'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cadastrado em</span>
                                <span>{new Date(seller.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
