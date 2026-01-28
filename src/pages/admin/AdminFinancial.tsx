import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    ArrowUpRight,
    ArrowDownLeft,
    Filter,
    Download,
    TrendingUp,
    CreditCard,
    Wallet,
    Building2,
    MoreVertical,
    PiggyBank,
    Receipt
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/validators';

export function AdminFinancialPage() {
    const [dateRange, setDateRange] = useState('30d');

    // Platform financial data (mock)
    const platformStats = {
        totalRevenue: 45890.00,
        subscriptions: 38500.00,
        transactions: 7390.00,
        pendingPayouts: 2450.00
    };

    const recentTransactions = [
        { id: '1', type: 'income', description: 'Assinatura - Restaurante Bom Sabor', category: 'Assinatura', amount: 99.90, date: '2024-01-20', status: 'completed' },
        { id: '2', type: 'income', description: 'Assinatura - Tech Solutions', category: 'Assinatura', amount: 199.90, date: '2024-01-19', status: 'completed' },
        { id: '3', type: 'expense', description: 'Taxa Gateway de Pagamento', category: 'Taxas', amount: 450.00, date: '2024-01-18', status: 'completed' },
        { id: '4', type: 'income', description: 'Comissão sobre vendas - Jan', category: 'Comissão', amount: 1234.56, date: '2024-01-17', status: 'completed' },
        { id: '5', type: 'income', description: 'Assinatura - Padaria Central', category: 'Assinatura', amount: 49.90, date: '2024-01-16', status: 'pending' },
        { id: '6', type: 'expense', description: 'Infraestrutura AWS', category: 'Infraestrutura', amount: 890.00, date: '2024-01-15', status: 'completed' },
    ];

    const planBreakdown = [
        { plan: 'Enterprise', count: 12, revenue: 2398.80, color: 'bg-purple-500' },
        { plan: 'Profissional', count: 45, revenue: 4495.50, color: 'bg-blue-500' },
        { plan: 'Básico', count: 32, revenue: 1596.80, color: 'bg-green-500' },
    ];

    const totalPlanRevenue = planBreakdown.reduce((sum, p) => sum + p.revenue, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Financeiro da Plataforma</h1>
                    <p className="text-muted-foreground mt-1">Receitas, assinaturas e comissões do SEPI</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar Relatório
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-gradient-to-br from-primary/10 to-transparent">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Receita Total</p>
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Wallet className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                            <p className="text-3xl font-black mt-2 text-primary">
                                {formatCurrency(platformStats.totalRevenue)}
                            </p>
                            <div className="flex items-center mt-4 text-xs font-medium text-green-600">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                <span>+23.5% em relação ao mês anterior</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Assinaturas</p>
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Receipt className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-black mt-2 text-foreground">
                                {formatCurrency(platformStats.subscriptions)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">89 empresas ativas</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Comissões</p>
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <PiggyBank className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-black mt-2 text-foreground">
                                {formatCurrency(platformStats.transactions)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">2.5% sobre transações</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">A Receber</p>
                                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-black mt-2 text-foreground">
                                {formatCurrency(platformStats.pendingPayouts)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">Próximo repasse em 5 dias</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transactions List */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-lg font-bold">Movimentações Recentes</CardTitle>
                            <div className="flex items-center gap-2">
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="text-xs bg-muted border-none rounded-md px-2 py-1 outline-none"
                                >
                                    <option value="7d">Últimos 7 dias</option>
                                    <option value="30d">Últimos 30 dias</option>
                                    <option value="90d">Últimos 90 dias</option>
                                </select>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {recentTransactions.map((transaction, index) => (
                                    <motion.div
                                        key={transaction.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-destructive/10 text-destructive'
                                                }`}>
                                                {transaction.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{transaction.description}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                        {transaction.category}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">• {new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className={`text-sm font-black ${transaction.type === 'income' ? 'text-green-600' : 'text-destructive'
                                                    }`}>
                                                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{transaction.status === 'completed' ? 'Efetivado' : 'Pendente'}</p>
                                            </div>
                                            <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full mt-4 text-xs font-bold uppercase tracking-widest text-primary">
                                Ver todas as movimentações
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Analytics */}
                <div className="space-y-6">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b pb-4">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                Receita por Plano
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {planBreakdown.map((item) => (
                                    <div key={item.plan} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{item.plan}</span>
                                            <span className="text-muted-foreground">{item.count} empresas</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div className={`h-full ${item.color}`} style={{ width: `${(item.revenue / totalPlanRevenue) * 100}%` }}></div>
                                            </div>
                                            <span className="text-sm font-semibold min-w-[80px] text-right">{formatCurrency(item.revenue)}</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">Total Mensal</span>
                                        <span className="text-lg font-bold text-green-600">{formatCurrency(totalPlanRevenue)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b pb-4">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Métricas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground mb-2">
                                        <span>Meta de Receita</span>
                                        <span>76%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '76%' }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Ticket Médio</p>
                                        <p className="text-lg font-black mt-1">{formatCurrency(89.90)}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">MRR Projetado</p>
                                        <p className="text-lg font-black mt-1 text-primary">{formatCurrency(52000)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
