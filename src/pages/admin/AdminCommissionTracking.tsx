import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, CheckCircle, Clock, ArrowLeft, Calendar, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/validators';

interface SellerCommission {
    sellerId: string;
    sellerCode: string;
    sellerName: string;
    totalCommission: number;
    pendingCommission: number;
    paidCommission: number;
    commissionType: 'percentage' | 'second_month';
    sales: {
        id: string;
        date: string;
        companyName: string;
        packageValue: number;
        commissionValue: number;
        status: 'pending' | 'paid';
        paymentDate?: string;
    }[];
}

export function AdminCommissionTrackingPage() {
    const [commissions, setCommissions] = useState<SellerCommission[]>([
        {
            sellerId: 'test-seller',
            sellerCode: 'VEND-TEST01',
            sellerName: 'Vendedor Teste',
            totalCommission: 2400,
            pendingCommission: 300,
            paidCommission: 2100,
            commissionType: 'percentage',
            sales: [
                { id: '1', date: '2024-01-24', companyName: 'Restaurante Bom Sabor', packageValue: 299.90, commissionValue: 29.99, status: 'pending' },
                { id: '2', date: '2024-01-21', companyName: 'Academia Fitness', packageValue: 299.90, commissionValue: 29.99, status: 'paid', paymentDate: '2024-01-22' },
                { id: '3', date: '2024-01-18', companyName: 'Clínica Médica', packageValue: 199.90, commissionValue: 19.99, status: 'paid', paymentDate: '2024-01-19' },
                { id: '4', date: '2024-01-15', companyName: 'Loja de Roupas', packageValue: 299.90, commissionValue: 29.99, status: 'paid', paymentDate: '2024-01-16' },
            ]
        },
        {
            sellerId: '1',
            sellerCode: 'VEND-0001',
            sellerName: 'Carlos Vendedor',
            totalCommission: 4500,
            pendingCommission: 450,
            paidCommission: 4050,
            commissionType: 'percentage',
            sales: [
                { id: '5', date: '2024-01-23', companyName: 'Padaria Central', packageValue: 199.90, commissionValue: 19.99, status: 'paid', paymentDate: '2024-01-24' },
                { id: '6', date: '2024-01-20', companyName: 'Pet Shop Amigo', packageValue: 99.90, commissionValue: 9.99, status: 'pending' },
            ]
        },
        {
            sellerId: '2',
            sellerCode: 'VEND-0002',
            sellerName: 'Ana Comercial',
            totalCommission: 6600,
            pendingCommission: 199.90,
            paidCommission: 6400.10,
            commissionType: 'second_month',
            sales: [
                { id: '7', date: '2024-01-22', companyName: 'Farmácia Saúde', packageValue: 299.90, commissionValue: 199.90, status: 'pending' },
            ]
        },
    ]);

    const [selectedSeller, setSelectedSeller] = useState<string | null>(null);

    const totalStats = {
        totalCommissions: commissions.reduce((sum, c) => sum + c.totalCommission, 0),
        totalPending: commissions.reduce((sum, c) => sum + c.pendingCommission, 0),
        totalPaid: commissions.reduce((sum, c) => sum + c.paidCommission, 0),
    };

    const selectedSellerData = selectedSeller ? commissions.find(c => c.sellerId === selectedSeller) : null;

    const handleMarkAsPaid = (sellerId: string, saleId: string) => {
        setCommissions(prev => prev.map(seller => {
            if (seller.sellerId === sellerId) {
                const updatedSales = seller.sales.map(sale => {
                    if (sale.id === saleId && sale.status === 'pending') {
                        return {
                            ...sale,
                            status: 'paid' as const,
                            paymentDate: new Date().toISOString().split('T')[0]
                        };
                    }
                    return sale;
                });

                const pendingCommission = updatedSales.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.commissionValue, 0);
                const paidCommission = updatedSales.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.commissionValue, 0);

                return {
                    ...seller,
                    sales: updatedSales,
                    pendingCommission,
                    paidCommission
                };
            }
            return seller;
        }));
    };

    if (selectedSellerData) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setSelectedSeller(null)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Comissões - {selectedSellerData.sellerName}</h1>
                            <p className="text-muted-foreground mt-1">Código: {selectedSellerData.sellerCode}</p>
                        </div>
                    </div>
                </div>

                {/* Seller Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-blue-200 bg-blue-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Total de Comissões</p>
                                    <p className="text-3xl font-bold text-blue-900 mt-1">{formatCurrency(selectedSellerData.totalCommission)}</p>
                                </div>
                                <DollarSign className="w-10 h-10 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-2 border-orange-200 bg-orange-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-700">Pendente</p>
                                    <p className="text-3xl font-bold text-orange-900 mt-1">{formatCurrency(selectedSellerData.pendingCommission)}</p>
                                </div>
                                <Clock className="w-10 h-10 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-2 border-green-200 bg-green-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Pago</p>
                                    <p className="text-3xl font-bold text-green-900 mt-1">{formatCurrency(selectedSellerData.paidCommission)}</p>
                                </div>
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Commission Type */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-lg ${selectedSellerData.commissionType === 'percentage' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                <p className={`font-bold ${selectedSellerData.commissionType === 'percentage' ? 'text-blue-700' : 'text-purple-700'}`}>
                                    {selectedSellerData.commissionType === 'percentage' ? '10% do Pacote' : '100% da 2ª Mensalidade'}
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {selectedSellerData.commissionType === 'percentage'
                                    ? 'Recebe 10% do valor do pacote no momento da venda'
                                    : 'Recebe o valor integral da segunda mensalidade paga'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Vendas e Comissões</CardTitle>
                        <CardDescription>{selectedSellerData.sales.length} vendas realizadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {selectedSellerData.sales.map((sale, index) => (
                                <motion.div
                                    key={sale.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sale.status === 'paid' ? 'bg-green-100' : 'bg-orange-100'}`}>
                                            {sale.status === 'paid' ? (
                                                <CheckCircle className="w-6 h-6 text-green-600" />
                                            ) : (
                                                <Clock className="w-6 h-6 text-orange-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{sale.companyName}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Venda: {new Date(sale.date).toLocaleDateString('pt-BR')}
                                                </span>
                                                {sale.paymentDate && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-green-600 font-medium">
                                                            Pago em: {new Date(sale.paymentDate).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Valor do Pacote</p>
                                            <p className="text-lg font-bold">{formatCurrency(sale.packageValue)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Comissão</p>
                                            <p className="text-lg font-bold text-primary">{formatCurrency(sale.commissionValue)}</p>
                                        </div>
                                        {sale.status === 'pending' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleMarkAsPaid(selectedSellerData.sellerId, sale.id)}
                                            >
                                                Marcar como Pago
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Acompanhamento de Comissões</h1>
                    <p className="text-muted-foreground mt-1">Gerencie as comissões de todos os vendedores</p>
                </div>
                <Button variant="outline" onClick={() => window.location.hash = '#/admin/sales'}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Vendas
                </Button>
            </div>

            {/* Total Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Total de Comissões</p>
                                <p className="text-3xl font-bold text-blue-900 mt-1">{formatCurrency(totalStats.totalCommissions)}</p>
                            </div>
                            <DollarSign className="w-10 h-10 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-orange-200 bg-orange-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Pendente</p>
                                <p className="text-3xl font-bold text-orange-900 mt-1">{formatCurrency(totalStats.totalPending)}</p>
                            </div>
                            <Clock className="w-10 h-10 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Pago</p>
                                <p className="text-3xl font-bold text-green-900 mt-1">{formatCurrency(totalStats.totalPaid)}</p>
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sellers List */}
            <Card>
                <CardHeader>
                    <CardTitle>Comissões por Vendedor</CardTitle>
                    <CardDescription>Clique em um vendedor para ver detalhes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {commissions.map((seller, index) => (
                            <motion.div
                                key={seller.sellerId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedSeller(seller.sellerId)}
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{seller.sellerName}</h3>
                                            <span className="text-sm text-muted-foreground font-mono">({seller.sellerCode})</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${seller.commissionType === 'percentage' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {seller.commissionType === 'percentage' ? '10% do Pacote' : '100% da 2ª Mensalidade'}
                                            </span>
                                            <span className="text-sm text-muted-foreground">{seller.sales.length} vendas</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total</p>
                                        <p className="text-lg font-bold">{formatCurrency(seller.totalCommission)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-orange-600">Pendente</p>
                                        <p className="text-lg font-bold text-orange-600">{formatCurrency(seller.pendingCommission)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-green-600">Pago</p>
                                        <p className="text-lg font-bold text-green-600">{formatCurrency(seller.paidCommission)}</p>
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
