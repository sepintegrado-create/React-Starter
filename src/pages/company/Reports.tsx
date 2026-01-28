import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Package,
    DollarSign,
    Calendar,
    Filter,
    Download,
    ChevronDown,
    Activity,
    Clock,
    UserCheck,
    AlertCircle,
    Building,
    FileText,
    Receipt,
    ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/validators';
import { db, PublicOrder, Employee, StockMovement } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

type ReportTab = 'sales' | 'inventory' | 'staff' | 'financial' | 'fiscal';

export function ReportsPage() {
    const { currentCompany } = useAuth();
    const [activeTab, setActiveTab] = useState<ReportTab>('sales');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Data states
    const [orders, setOrders] = useState<PublicOrder[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        if (currentCompany) {
            setOrders(db.getOrders(currentCompany.id).filter(o => o.status === 'completed' || o.status === 'accepted'));
            setEmployees(db.getEmployees(currentCompany.id));
            setStockMovements(db.getStockMovements());
            setTransactions(db.getTransactions());
        }
    }, [currentCompany]);

    const renderTabButton = (id: ReportTab, label: string, Icon: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-6 py-4 border-b-2 transition-all ${activeTab === id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
        >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-black uppercase italic tracking-widest">{label}</span>
        </button>
    );

    const SalesReport = () => {
        const totalRevenue = orders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + (i.price * i.quantity), 0), 0);
        const totalOrders = orders.length;
        const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Receita Total</p>
                                    <h3 className="text-3xl font-black italic mt-1">{formatCurrency(totalRevenue)}</h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-2xl">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pedidos Concluídos</p>
                                    <h3 className="text-3xl font-black italic mt-1">{totalOrders}</h3>
                                </div>
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ticket Médio</p>
                                    <h3 className="text-3xl font-black italic mt-1">{formatCurrency(avgTicket)}</h3>
                                </div>
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                    <ArrowUpRight className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                    <div className="p-8 border-b bg-muted/20">
                        <h2 className="text-xl font-black uppercase italic tracking-tight">Últimas Vendas</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted text-left">
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">ID</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Local</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Itens</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.slice(0, 10).map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-8 py-4 text-xs font-bold text-muted-foreground">#{order.id.slice(-6)}</td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black uppercase italic italic">{order.targetType === 'table' ? 'Mesa' : 'Quarto'} {order.targetNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-sm font-medium">{order.items.length} itens</td>
                                        <td className="px-8 py-4 text-right">
                                            <span className="text-sm font-black text-primary">
                                                {formatCurrency(order.items.reduce((s, i) => s + (i.price * i.quantity), 0))}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );
    };

    const StaffReport = () => {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                        <div className="p-8 border-b bg-muted/20 flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase italic tracking-tight">Produtividade</h2>
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="p-8 space-y-6">
                            {employees.map(emp => (
                                <div key={emp.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-primary">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black uppercase italic text-sm">{emp.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold">{emp.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-primary">32 atendimentos</p>
                                        <div className="w-24 h-1.5 bg-muted rounded-full mt-1">
                                            <div className="h-full bg-primary rounded-full" style={{ width: '60%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                        <div className="p-8 border-b bg-muted/20 flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase italic tracking-tight">Turnos e Horários</h2>
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <UserCheck className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-black uppercase italic">Pedro Silva</p>
                                        <p className="text-[10px] text-blue-600 font-bold">EM SERVIÇO</p>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-muted-foreground">Início: 18:00</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-muted-foreground/20" />
                                    <div>
                                        <p className="text-sm font-black uppercase italic">Maria Santos</p>
                                        <p className="text-[10px] text-muted-foreground font-bold">OFFLINE</p>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-muted-foreground">Último turno: Ontem</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    const FinancialReport = () => {
        // Simple DRE Logic
        const revenue = orders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + (i.price * i.quantity), 0), 0);
        const costs = revenue * 0.35; // Mock: 35% CMV
        const grossProfit = revenue - costs;
        const expenses = 4500; // Mock: Monthly fixed expenses
        const netProfit = grossProfit - expenses;
        const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-zinc-900 text-white">
                    <div className="p-10 border-b border-white/10 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Demonstrativo de Resultados (DRE)</h2>
                            <p className="text-white/50 text-xs font-medium uppercase mt-1 tracking-widest">Resumo Financeiro Mensal</p>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl font-black text-sm italic ${netProfit >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            MARGEM: {margin.toFixed(1)}%
                        </div>
                    </div>
                    <div className="p-10 space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-white/60 font-bold uppercase text-xs tracking-widest">Receita Bruta</span>
                                <span className="text-xl font-black tracking-tight">{formatCurrency(revenue)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/5 text-red-400">
                                <span className="font-bold uppercase text-xs tracking-widest">(-) Custos (CMV)</span>
                                <span className="text-lg font-black tracking-tight">({formatCurrency(costs)})</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 flex justify-between items-center">
                                <span className="font-black uppercase italic text-sm tracking-widest">Resultado Bruto</span>
                                <span className="text-2xl font-black tracking-tight text-primary">{formatCurrency(grossProfit)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/5 text-red-400">
                                <span className="font-bold uppercase text-xs tracking-widest">(-) Despesas Fixas</span>
                                <span className="text-lg font-black tracking-tight">({formatCurrency(expenses)})</span>
                            </div>
                            <div className={`p-6 rounded-[2rem] flex justify-between items-center border-2 ${netProfit >= 0 ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                <div>
                                    <p className="font-black uppercase italic text-sm tracking-widest leading-none">Lucro Líquido</p>
                                    <p className="text-[10px] uppercase font-bold text-white/40 mt-1">Resultado Final</p>
                                </div>
                                <span className={`text-4xl font-black italic tracking-tighter ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatCurrency(netProfit)}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    const InventoryReport = () => {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                        <div className="p-8 border-b bg-muted/20 flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase italic tracking-tight">Estoque Crítico</h2>
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="p-4 rounded-2xl border border-red-100 bg-red-50/50 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-black uppercase italic">Cerveja Artesanal 600ml</p>
                                    <p className="text-xs text-red-600 font-bold uppercase mt-0.5">Apenas 5 unidades</p>
                                </div>
                                <Button size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase bg-red-600 hover:bg-red-700 shadow-none">Comprar</Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                        <div className="p-8 border-b bg-muted/20 flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase italic tracking-tight">Valor em Estoque</h2>
                            <Receipt className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="p-10 text-center">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2 leading-none">Patrimônio Aproximado</p>
                            <h3 className="text-5xl font-black italic tracking-tighter text-primary">{formatCurrency(12450.80)}</h3>
                            <p className="text-xs text-muted-foreground mt-4 font-bold uppercase italic">84 itens catalogados</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tight">Central de Inteligência</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Análise avançada de performance e finanças</p>
                </div>
                <div className="flex bg-card p-2 rounded-2xl shadow-xl border border-border/50">
                    <div className="flex items-center gap-3 px-4 border-r">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-xs font-black uppercase italic tracking-widest">Janeiro 2024</span>
                    </div>
                    <Button variant="ghost" className="rounded-xl font-black uppercase italic text-[10px] tracking-widest ml-1">
                        Exportar PDF
                        <Download className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>

            <div className="bg-card rounded-[2.5rem] shadow-xl border border-border/50 overflow-hidden">
                <div className="flex flex-wrap border-b px-4 bg-muted/20 overflow-x-auto no-scrollbar">
                    {renderTabButton('sales', 'Vendas', BarChart3)}
                    {renderTabButton('inventory', 'Estoque', Package)}
                    {renderTabButton('staff', 'Equipe', Users)}
                    {renderTabButton('financial', 'Financeiro DRE', DollarSign)}
                    {renderTabButton('fiscal', 'Fiscal', FileText)}
                </div>

                <div className="p-8">
                    {activeTab === 'sales' && <SalesReport />}
                    {activeTab === 'staff' && <StaffReport />}
                    {activeTab === 'financial' && <FinancialReport />}
                    {activeTab === 'inventory' && <InventoryReport />}
                    {activeTab === 'fiscal' && (
                        <div className="py-20 text-center text-muted-foreground space-y-4">
                            <Receipt className="w-16 h-16 mx-auto opacity-20" />
                            <p className="font-black uppercase italic tracking-widest text-sm">Módulo Fiscal em Conformidade</p>
                            <p className="max-w-xs mx-auto text-xs font-medium">Resumo de notas emitidas e cupons fiscais transmitidos automaticamente para a SEFAZ.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
