import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Calendar, QrCode, BarChart3, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/validators';

export function CompanyDashboard() {
    const { user, currentCompany } = useAuth();
    const [showValues, setShowValues] = React.useState(() => {
        return localStorage.getItem('sepi_dashboard_privacy') === 'true' ? false : true;
    });

    const togglePrivacy = () => {
        const newValue = !showValues;
        setShowValues(newValue);
        localStorage.setItem('sepi_dashboard_privacy', (!newValue).toString());
    };

    const maskValue = (value: string) => showValues ? value : '••••••';

    // Mock data - em produção viria da API
    const stats = [
        { label: 'Vendas Hoje', value: formatCurrency(2450.00), icon: DollarSign, color: 'text-green-500', trend: '+12%' },
        { label: 'Pedidos Ativos', value: '8', icon: ShoppingCart, color: 'text-blue-500', trend: '+3' },
        { label: 'Produtos Cadastrados', value: '156', icon: Package, color: 'text-purple-500', trend: '+5' },
        { label: 'Funcionários Ativos', value: '12', icon: Users, color: 'text-orange-500', trend: '0' }
    ];

    const recentOrders = [
        { id: '#001', customer: 'Carlos Mendes', amount: 145.90, status: 'Concluído', time: '10:30' },
        { id: '#002', customer: 'Ana Paula', amount: 89.50, status: 'Preparando', time: '10:45' },
        { id: '#003', customer: 'João Silva', amount: 234.00, status: 'Aguardando', time: '11:00' },
    ];

    const quickActions = [
        { title: 'Nova Venda', icon: ShoppingCart, description: 'Iniciar venda no PDV', path: '/company/pdv', color: 'bg-blue-500' },
        { title: 'Adicionar Produto', icon: Package, description: 'Cadastrar novo produto', path: '/company/products', color: 'bg-green-500' },
        { title: 'Gerar QR Code', icon: QrCode, description: 'QR Code de pagamento', path: '/company/qrcode', color: 'bg-purple-500' },
        { title: 'Ver Relatórios', icon: BarChart3, description: 'Análises e relatórios', path: '/company/reports', color: 'bg-orange-500' },
        { title: 'Agenda', icon: Calendar, description: 'Compromissos do dia', path: '/company/schedule', color: 'bg-pink-500' },
        { title: 'Funcionários', icon: Users, description: 'Gerenciar equipe', path: '/company/employees', color: 'bg-indigo-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {currentCompany?.tradeName || 'Dashboard'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Bem-vindo de volta, {user?.name?.split(' ')[0]}! Aqui está um resumo do seu negócio hoje.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={togglePrivacy}
                        className="flex items-center gap-2"
                    >
                        {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showValues ? 'Ocultar Valores' : 'Mostrar Valores'}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card hover>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <p className="text-2xl font-bold">
                                                {stat.label.toLowerCase().includes('venda') || stat.label.toLowerCase().includes('ticket')
                                                    ? maskValue(stat.value)
                                                    : stat.value}
                                            </p>
                                            <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-full bg-muted`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                    <CardDescription>Acesse rapidamente as funcionalidades mais usadas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <motion.button
                                key={action.title}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold group-hover:text-primary transition-colors">{action.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-0.5">{action.description}</p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Orders & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pedidos Recentes</CardTitle>
                        <CardDescription>Últimos pedidos do dia</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{order.id}</span>
                                            <span className="text-sm text-muted-foreground">•</span>
                                            <span className="text-sm">{order.customer}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'Concluído' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Preparando' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{order.time}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{maskValue(formatCurrency(order.amount))}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors">
                            Ver todos os pedidos →
                        </button>
                    </CardContent>
                </Card>

                {/* Today's Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resumo do Dia</CardTitle>
                        <CardDescription>Atividades e métricas de hoje</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Horário de Abertura</span>
                                <span className="text-sm font-medium">08:00</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Funcionários em Turno</span>
                                <span className="text-sm font-medium">8 de 12</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Ticket Médio</span>
                                <span className="text-sm font-medium">{maskValue(formatCurrency(156.25))}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Produtos Vendidos</span>
                                <span className="text-sm font-medium">47 unidades</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Taxa de Conversão</span>
                                <span className="text-sm font-medium">68%</span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Meta do Dia</span>
                                    <span className="font-semibold text-green-600">{maskValue(formatCurrency(5000.00))}</span>
                                </div>
                                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: '49%' }}></div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">49% da meta alcançada</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
