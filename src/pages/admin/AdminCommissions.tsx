import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Percent, Calendar, Save, AlertCircle, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/validators';

type CommissionType = 'percentage' | 'second_month';

interface CommissionPayment {
    id: string;
    sellerName: string;
    sellerCode: string;
    companyName: string;
    commissionType: CommissionType;
    amount: number;
    status: 'pending' | 'paid';
    dueDate: string;
    paidDate?: string;
}

export function AdminCommissionsPage() {
    const [globalCommissionType, setGlobalCommissionType] = useState<CommissionType>('percentage');
    const [isSaving, setIsSaving] = useState(false);

    const [pendingPayments] = useState<CommissionPayment[]>([
        { id: '1', sellerName: 'Carlos Vendedor', sellerCode: 'VEND-0001', companyName: 'Café Premium', commissionType: 'percentage', amount: 9.99, status: 'pending', dueDate: '2024-04-15' },
        { id: '2', sellerName: 'Ana Comercial', sellerCode: 'VEND-0002', companyName: 'Loja Fashion', commissionType: 'second_month', amount: 99.90, status: 'pending', dueDate: '2024-04-20' },
        { id: '3', sellerName: 'Carlos Vendedor', sellerCode: 'VEND-0001', companyName: 'Pet Shop Amigo', commissionType: 'percentage', amount: 4.99, status: 'pending', dueDate: '2024-04-25' },
    ]);

    const [recentPayments] = useState<CommissionPayment[]>([
        { id: '4', sellerName: 'Carlos Vendedor', sellerCode: 'VEND-0001', companyName: 'Restaurante Sol', commissionType: 'percentage', amount: 19.99, status: 'paid', dueDate: '2024-03-10', paidDate: '2024-03-10' },
        { id: '5', sellerName: 'Ana Comercial', sellerCode: 'VEND-0002', companyName: 'Tech Store', commissionType: 'second_month', amount: 199.90, status: 'paid', dueDate: '2024-03-15', paidDate: '2024-03-15' },
    ]);

    const stats = [
        { label: 'Vendedores Ativos', value: 3, icon: Users, color: 'text-blue-500' },
        { label: 'Comissões Pendentes', value: formatCurrency(pendingPayments.reduce((sum, p) => sum + p.amount, 0)), icon: DollarSign, color: 'text-orange-500' },
        { label: 'Comissões Pagas (Mês)', value: formatCurrency(recentPayments.reduce((sum, p) => sum + p.amount, 0)), icon: CheckCircle, color: 'text-green-500' },
        { label: 'Média por Venda', value: formatCurrency(45.50), icon: TrendingUp, color: 'text-purple-500' },
    ];

    const handleSaveGlobalType = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
    };

    const markAsPaid = (paymentId: string) => {
        // In production, would update payment status
        console.log('Marking as paid:', paymentId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configurações de Comissão</h1>
                    <p className="text-muted-foreground mt-1">Gerencie o modelo de comissão dos vendedores</p>
                </div>
                <Button variant="outline" onClick={() => window.location.hash = '#/admin/sellers'}>
                    Ver Vendedores
                </Button>
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

            {/* Commission Type Selection */}
            <Card className="border-2 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Modelo de Comissão Padrão
                    </CardTitle>
                    <CardDescription>
                        Escolha o modelo de comissão que será aplicado aos novos vendedores.
                        <span className="font-bold text-foreground"> Apenas uma opção pode estar ativa.</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Option A: 10% */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <label className={`block p-6 rounded-2xl border-3 cursor-pointer transition-all ${globalCommissionType === 'percentage'
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                                : 'border-border hover:border-muted-foreground bg-card'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="radio"
                                        name="commissionType"
                                        className="mt-1 w-5 h-5"
                                        checked={globalCommissionType === 'percentage'}
                                        onChange={() => setGlobalCommissionType('percentage')}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`p-2 rounded-lg ${globalCommissionType === 'percentage' ? 'bg-primary text-white' : 'bg-muted'}`}>
                                                <Percent className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold">10% do Valor do Pacote</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            O vendedor recebe <span className="font-bold text-foreground">10%</span> do valor do pacote
                                            no momento em que a empresa realiza a primeira compra.
                                        </p>
                                        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs">
                                            <p className="font-bold text-muted-foreground mb-1">Exemplo:</p>
                                            <p>Pacote Profissional: R$ 99,90 → Comissão: <span className="text-green-600 font-bold">R$ 9,99</span></p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </motion.div>

                        {/* Option B: 100% Second Month */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <label className={`block p-6 rounded-2xl border-3 cursor-pointer transition-all ${globalCommissionType === 'second_month'
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                                : 'border-border hover:border-muted-foreground bg-card'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="radio"
                                        name="commissionType"
                                        className="mt-1 w-5 h-5"
                                        checked={globalCommissionType === 'second_month'}
                                        onChange={() => setGlobalCommissionType('second_month')}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`p-2 rounded-lg ${globalCommissionType === 'second_month' ? 'bg-primary text-white' : 'bg-muted'}`}>
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold">100% da 2ª Mensalidade</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            O vendedor recebe <span className="font-bold text-foreground">100%</span> do valor
                                            da segunda mensalidade paga pela empresa.
                                        </p>
                                        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs">
                                            <p className="font-bold text-muted-foreground mb-1">Exemplo:</p>
                                            <p>Pacote Profissional: R$ 99,90/mês → Comissão: <span className="text-green-600 font-bold">R$ 99,90</span></p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="w-4 h-4" />
                            <span>Esta configuração será aplicada apenas a novos vendedores</span>
                        </div>
                        <Button onClick={handleSaveGlobalType} isLoading={isSaving}>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Configuração
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Pending Commissions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-orange-600">Comissões Pendentes</CardTitle>
                    <CardDescription>Pagamentos de comissão aguardando processamento</CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingPayments.length > 0 ? (
                        <div className="space-y-3">
                            {pendingPayments.map((payment, index) => (
                                <motion.div
                                    key={payment.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{payment.sellerName}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="font-mono">{payment.sellerCode}</span>
                                                <span>•</span>
                                                <span>{payment.companyName}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-orange-600">{formatCurrency(payment.amount)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Vence em {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <Button size="sm" onClick={() => markAsPaid(payment.id)}>
                                            Pagar
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                            <p>Nenhuma comissão pendente</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-green-600">Pagamentos Recentes</CardTitle>
                    <CardDescription>Histórico de comissões pagas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentPayments.map((payment, index) => (
                            <motion.div
                                key={payment.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-lg border border-green-200 bg-green-50/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{payment.sellerName}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="font-mono">{payment.sellerCode}</span>
                                            <span>•</span>
                                            <span>{payment.companyName}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Pago em {new Date(payment.paidDate!).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
