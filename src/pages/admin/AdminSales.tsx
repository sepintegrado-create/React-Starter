import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, ShoppingCart, Filter, Calendar, Download, Eye } from 'lucide-react';
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
    sellerCode?: string;
    sellerName?: string;
    commissionType?: 'percentage' | 'second_month';
    commissionValue: number;
    commissionStatus: 'pending' | 'paid';
    saleType: 'online' | 'seller';
}

export function AdminSalesPage() {
    const [sales, setSales] = useState<Sale[]>([
        { id: '1', date: '2024-01-24', companyName: 'Restaurante Bom Sabor', packageName: 'Plano Premium', packageValue: 299.90, sellerCode: 'VEND-TEST01', sellerName: 'Vendedor Teste', commissionType: 'percentage', commissionValue: 29.99, commissionStatus: 'pending', saleType: 'seller' },
        { id: '2', date: '2024-01-23', companyName: 'Loja Tech Store', packageName: 'Plano Básico', packageValue: 99.90, saleType: 'online', commissionValue: 0, commissionStatus: 'paid' },
        { id: '3', date: '2024-01-23', companyName: 'Padaria Central', packageName: 'Plano Intermediário', packageValue: 199.90, sellerCode: 'VEND-0001', sellerName: 'Carlos Vendedor', commissionType: 'percentage', commissionValue: 19.99, commissionStatus: 'paid', saleType: 'seller' },
        { id: '4', date: '2024-01-22', companyName: 'Farmácia Saúde', packageName: 'Plano Premium', packageValue: 299.90, sellerCode: 'VEND-0002', sellerName: 'Ana Comercial', commissionType: 'second_month', commissionValue: 199.90, commissionStatus: 'pending', saleType: 'seller' },
        { id: '5', date: '2024-01-22', companyName: 'Mercado do Bairro', packageName: 'Plano Básico', packageValue: 99.90, saleType: 'online', commissionValue: 0, commissionStatus: 'paid' },
        { id: '6', date: '2024-01-21', companyName: 'Academia Fitness', packageName: 'Plano Premium', packageValue: 299.90, sellerCode: 'VEND-TEST01', sellerName: 'Vendedor Teste', commissionType: 'percentage', commissionValue: 29.99, commissionStatus: 'paid', saleType: 'seller' },
        { id: '7', date: '2024-01-20', companyName: 'Salão de Beleza', packageName: 'Plano Intermediário', packageValue: 199.90, saleType: 'online', commissionValue: 0, commissionStatus: 'paid' },
        { id: '8', date: '2024-01-20', companyName: 'Pet Shop Amigo', packageName: 'Plano Básico', packageValue: 99.90, sellerCode: 'VEND-0001', sellerName: 'Carlos Vendedor', commissionType: 'percentage', commissionValue: 9.99, commissionStatus: 'pending', saleType: 'seller' },
    ]);

    const [filters, setFilters] = useState({
        seller: 'all',
        saleType: 'all',
        dateFrom: '',
        dateTo: '',
        search: ''
    });

    // Calculate statistics
    const stats = {
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, s) => sum + s.packageValue, 0),
        onlineSales: sales.filter(s => s.saleType === 'online').length,
        sellerSales: sales.filter(s => s.saleType === 'seller').length,
        totalCommissions: sales.reduce((sum, s) => sum + s.commissionValue, 0),
        pendingCommissions: sales.filter(s => s.commissionStatus === 'pending').reduce((sum, s) => sum + s.commissionValue, 0),
    };

    // Get unique sellers
    const sellers = Array.from(new Set(sales.filter(s => s.sellerCode).map(s => ({ code: s.sellerCode!, name: s.sellerName! })).map(s => JSON.stringify(s)))).map(s => JSON.parse(s));

    // Filter sales
    const filteredSales = sales.filter(sale => {
        if (filters.seller !== 'all' && sale.sellerCode !== filters.seller) return false;
        if (filters.saleType !== 'all' && sale.saleType !== filters.saleType) return false;
        if (filters.dateFrom && sale.date < filters.dateFrom) return false;
        if (filters.dateTo && sale.date > filters.dateTo) return false;
        if (filters.search && !sale.companyName.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    });

    const statsCards = [
        { label: 'Total de Vendas', value: stats.totalSales, icon: ShoppingCart, color: 'text-blue-500' },
        { label: 'Receita Total', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-green-500' },
        { label: 'Vendas Online', value: stats.onlineSales, icon: TrendingUp, color: 'text-purple-500' },
        { label: 'Vendas por Vendedor', value: stats.sellerSales, icon: Users, color: 'text-orange-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Acompanhamento de Vendas</h1>
                    <p className="text-muted-foreground mt-1">Visualize todas as vendas da plataforma e comissões</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => window.location.hash = '#/admin/commission-tracking'}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Comissões
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </div>
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

            {/* Commission Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-orange-200 bg-orange-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Comissões Pendentes</p>
                                <p className="text-3xl font-bold text-orange-900 mt-1">{formatCurrency(stats.pendingCommissions)}</p>
                            </div>
                            <DollarSign className="w-10 h-10 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Total de Comissões</p>
                                <p className="text-3xl font-bold text-green-900 mt-1">{formatCurrency(stats.totalCommissions)}</p>
                            </div>
                            <DollarSign className="w-10 h-10 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Vendedor</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={filters.seller}
                                onChange={(e) => setFilters({ ...filters, seller: e.target.value })}
                            >
                                <option value="all">Todos</option>
                                {sellers.map(seller => (
                                    <option key={seller.code} value={seller.code}>{seller.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de Venda</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={filters.saleType}
                                onChange={(e) => setFilters({ ...filters, saleType: e.target.value })}
                            >
                                <option value="all">Todas</option>
                                <option value="online">Online</option>
                                <option value="seller">Vendedor</option>
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
                    <CardTitle>Lista de Vendas</CardTitle>
                    <CardDescription>{filteredSales.length} vendas encontradas</CardDescription>
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
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sale.saleType === 'online' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                                        {sale.saleType === 'online' ? (
                                            <TrendingUp className="w-6 h-6 text-purple-600" />
                                        ) : (
                                            <Users className="w-6 h-6 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{sale.companyName}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sale.saleType === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {sale.saleType === 'online' ? 'Online' : 'Vendedor'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(sale.date).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span>•</span>
                                            <span>{sale.packageName}</span>
                                            {sale.sellerName && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-medium text-primary">{sale.sellerName} ({sale.sellerCode})</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">{formatCurrency(sale.packageValue)}</p>
                                    {sale.commissionValue > 0 && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-sm text-muted-foreground">
                                                Comissão: {formatCurrency(sale.commissionValue)}
                                            </p>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sale.commissionStatus === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                {sale.commissionStatus === 'pending' ? 'Pendente' : 'Pago'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {filteredSales.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhuma venda encontrada</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
