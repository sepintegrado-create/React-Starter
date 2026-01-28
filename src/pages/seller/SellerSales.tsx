import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, Download, Package, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/validators';

interface Sale {
    id: string;
    date: string;
    companyName: string;
    packageName: string;
    packageValue: number;
    commissionType?: 'percentage' | 'second_month';
    commissionValue: number;
    commissionStatus: 'pending' | 'paid';
}

export function SellerSales() {
    // Get the current seller code from context/session (mock for now)
    const currentSellerCode = 'VEND-TEST01'; // This should come from auth context
    const currentSellerName = 'Vendedor Teste'; // This should come from auth context

    const [allSales] = useState<Sale[]>([
        { id: '1', date: '2024-01-24', companyName: 'Restaurante Bom Sabor', packageName: 'Plano Premium', packageValue: 299.90, commissionType: 'percentage', commissionValue: 29.99, commissionStatus: 'pending' },
        { id: '2', date: '2024-01-23', companyName: 'Academia Fitness', packageName: 'Plano Premium', packageValue: 299.90, commissionType: 'percentage', commissionValue: 29.99, commissionStatus: 'paid' },
        { id: '3', date: '2024-01-22', companyName: 'Loja de Roupas', packageName: 'Plano Intermediário', packageValue: 199.90, commissionType: 'percentage', commissionValue: 19.99, commissionStatus: 'paid' },
        { id: '4', date: '2024-01-21', companyName: 'Clínica Médica', packageName: 'Plano Premium', packageValue: 299.90, commissionType: 'second_month', commissionValue: 199.90, commissionStatus: 'pending' },
        { id: '5', date: '2024-01-20', companyName: 'Escritório Contábil', packageName: 'Plano Básico', packageValue: 99.90, commissionType: 'percentage', commissionValue: 9.99, commissionStatus: 'paid' },
    ]);

    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        status: 'all',
        search: ''
    });

    // Only show sales for this seller
    const mySales = allSales;

    // Calculate statistics for this seller only
    const stats = {
        totalSales: mySales.length,
        totalRevenue: mySales.reduce((sum, s) => sum + s.packageValue, 0),
        totalCommissions: mySales.reduce((sum, s) => sum + s.commissionValue, 0),
        pendingCommissions: mySales.filter(s => s.commissionStatus === 'pending').reduce((sum, s) => sum + s.commissionValue, 0),
        paidCommissions: mySales.filter(s => s.commissionStatus === 'paid').reduce((sum, s) => sum + s.commissionValue, 0),
    };

    // Filter sales
    const filteredSales = mySales.filter(sale => {
        if (filters.status !== 'all' && sale.commissionStatus !== filters.status) return false;
        if (filters.dateFrom && sale.date < filters.dateFrom) return false;
        if (filters.dateTo && sale.date > filters.dateTo) return false;
        if (filters.search && !sale.companyName.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    });

    const statsCards = [
        { label: 'Minhas Vendas', value: stats.totalSales, icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-50' },
        { label: 'Volume Total Vendido', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-50' },
        { label: 'Comissões Pagas', value: formatCurrency(stats.paidCommissions), icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
        { label: 'Comissões Pendentes', value: formatCurrency(stats.pendingCommissions), icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Minhas Vendas</h1>
                    <p className="text-muted-foreground mt-1">
                        Acompanhe suas vendas e comissões - Código: <span className="font-mono font-semibold text-primary">{currentSellerCode}</span>
                    </p>
                </div>
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Relatório
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`border-2 ${stat.bgColor}/50`}>
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

            {/* Total Commissions Highlight */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary mb-1">Total de Comissões</p>
                            <p className="text-4xl font-black text-primary">{formatCurrency(stats.totalCommissions)}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Próximo pagamento: {formatCurrency(stats.pendingCommissions)}
                            </p>
                        </div>
                        <DollarSign className="w-16 h-16 text-primary/20" />
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtrar Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="all">Todas</option>
                                <option value="pending">Comissão Pendente</option>
                                <option value="paid">Comissão Paga</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Data Inicial</label>
                            <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Data Final</label>
                            <Input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Buscar Empresa</label>
                            <Input
                                placeholder="Nome da empresa..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sales List */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Vendas</CardTitle>
                    <CardDescription>{filteredSales.length} vendas realizadas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredSales.map((sale, index) => (
                            <motion.div
                                key={sale.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{sale.companyName}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sale.commissionStatus === 'paid'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {sale.commissionStatus === 'paid' ? 'Paga' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(sale.date).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span>•</span>
                                            <span>{sale.packageName}</span>
                                            <span>•</span>
                                            <span className="font-medium">
                                                {sale.commissionType === 'percentage' ? '10% do pacote' : '100% do 2º mês'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold ">{formatCurrency(sale.packageValue)}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-sm font-semibold text-green-600">
                                            Comissão: {formatCurrency(sale.commissionValue)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {filteredSales.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhuma venda encontrada</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
