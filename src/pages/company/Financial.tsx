import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Filter,
    Download,
    Plus,
    MoreVertical,
    TrendingUp,
    CreditCard,
    Wallet
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/validators';
import { db } from '../../services/db';

export function FinancialPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState('7d');

    useEffect(() => {
        setTransactions(db.getTransactions());
    }, []);

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão Financeira</h1>
                    <p className="text-muted-foreground mt-1">Monitore seu fluxo de caixa e obrigações financeiras</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Transação
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-gradient-to-br from-primary/10 to-transparent">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Saldo Total</p>
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Wallet className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                            <p className={`text-3xl font-black mt-2 ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                {formatCurrency(balance)}
                            </p>
                            <div className="flex items-center mt-4 text-xs font-medium text-green-600">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                <span>+12.5% em relação ao mês anterior</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Entradas (Mês)</p>
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-black mt-2 text-foreground">
                                {formatCurrency(totalIncome)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">Previsão para o fim do mês: {formatCurrency(totalIncome * 1.5)}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Saídas (Mês)</p>
                                <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                                    <ArrowDownLeft className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-black mt-2 text-foreground">
                                {formatCurrency(totalExpense)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">Pendentes de pagamento: {formatCurrency(1200)}</p>
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
                            <CardTitle className="text-lg font-bold">Últimas Transações</CardTitle>
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
                                {transactions.map((transaction, index) => (
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
                                Ver todo o extrato
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Analytics */}
                <div className="space-y-6">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b pb-4">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Fluxo de Caixa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground mb-2">
                                        <span>Meta de Vendas</span>
                                        <span>72%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '72%' }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Ticket Médio</p>
                                        <p className="text-lg font-black mt-1">{formatCurrency(78.90)}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Projeção D+30</p>
                                        <p className="text-lg font-black mt-1 text-primary">{formatCurrency(15420)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                Contas Bancárias
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-background shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">IT</div>
                                    <div>
                                        <p className="text-xs font-bold">Itaú Empresas</p>
                                        <p className="text-[10px] text-muted-foreground">Ag 0001 • CC 12345-6</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold">{formatCurrency(450.23)}</p>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-background shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">NU</div>
                                    <div>
                                        <p className="text-xs font-bold">Nubank PJ</p>
                                        <p className="text-[10px] text-muted-foreground">Ag 0001 • CC 54321-0</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold">{formatCurrency(1234.56)}</p>
                            </div>
                            <Button variant="outline" className="w-full text-xs font-bold">
                                Conectar novo banco
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
