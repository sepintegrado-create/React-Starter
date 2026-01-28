import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, DollarSign, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/validators';

export function AdminDashboard() {
    const { user } = useAuth();

    const platformStats = [
        { label: 'Usuários Totais', value: '1,234', icon: Users, color: 'text-blue-500', trend: '+15%' },
        { label: 'Empresas Ativas', value: '89', icon: Building2, color: 'text-green-500', trend: '+8' },
        { label: 'Receita Mensal', value: formatCurrency(45890.00), icon: DollarSign, color: 'text-purple-500', trend: '+23%' },
        { label: 'Transações Hoje', value: '456', icon: Activity, color: 'text-orange-500', trend: '+12%' },
    ];

    const recentCompanies = [
        { name: 'Restaurante Bom Sabor', plan: 'Profissional', status: 'Ativo', users: 12, revenue: 99.90 },
        { name: 'Tech Solutions', plan: 'Enterprise', status: 'Ativo', users: 45, revenue: 199.90 },
        { name: 'Padaria Central', plan: 'Básico', status: 'Ativo', users: 5, revenue: 49.90 },
        { name: 'Loja de Roupas XYZ', plan: 'Profissional', status: 'Suspenso', users: 8, revenue: 0 },
    ];

    const systemAlerts = [
        { type: 'warning', message: '3 empresas com pagamento pendente', time: '2h atrás' },
        { type: 'info', message: '15 novos cadastros hoje', time: '4h atrás' },
        { type: 'error', message: '1 empresa solicitou cancelamento', time: '6h atrás' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Painel Administrativo da Plataforma
                </h1>
                <p className="text-muted-foreground mt-1">
                    Bem-vindo, {user?.name}! Visão geral da plataforma SEPI.
                </p>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {platformStats.map((stat, index) => (
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
                                            <p className="text-2xl font-bold">{stat.value}</p>
                                            <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-full bg-muted">
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* System Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle>Alertas do Sistema</CardTitle>
                    <CardDescription>Notificações importantes que requerem atenção</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {systemAlerts.map((alert, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-lg ${alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                                        alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                                            'bg-blue-50 border border-blue-200'
                                    }`}
                            >
                                <AlertCircle className={`w-5 h-5 mt-0.5 ${alert.type === 'error' ? 'text-red-600' :
                                        alert.type === 'warning' ? 'text-yellow-600' :
                                            'text-blue-600'
                                    }`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{alert.message}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{alert.time}</p>
                                </div>
                                <button className="text-xs text-primary hover:underline">Ver detalhes</button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Companies & Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Companies */}
                <Card>
                    <CardHeader>
                        <CardTitle>Empresas Recentes</CardTitle>
                        <CardDescription>Últimas empresas cadastradas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentCompanies.map((company, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{company.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                {company.plan}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${company.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {company.status}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{company.users} usuários</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(company.revenue)}</p>
                                        <p className="text-xs text-muted-foreground">mensal</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors">
                            Ver todas as empresas →
                        </button>
                    </CardContent>
                </Card>

                {/* Revenue Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Receita por Plano</CardTitle>
                        <CardDescription>Distribuição de receita mensal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { plan: 'Enterprise', count: 12, revenue: 2398.80, color: 'bg-purple-500' },
                                { plan: 'Profissional', count: 45, revenue: 4495.50, color: 'bg-blue-500' },
                                { plan: 'Básico', count: 32, revenue: 1596.80, color: 'bg-green-500' },
                            ].map((item) => (
                                <div key={item.plan} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{item.plan}</span>
                                        <span className="text-muted-foreground">{item.count} empresas</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color}`} style={{ width: `${(item.revenue / 8491.10) * 100}%` }}></div>
                                        </div>
                                        <span className="text-sm font-semibold min-w-[80px] text-right">{formatCurrency(item.revenue)}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">Total Mensal</span>
                                    <span className="text-lg font-bold text-green-600">{formatCurrency(8491.10)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Administração Rápida</CardTitle>
                    <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'Gerenciar Usuários', icon: '👥', description: 'Base de usuários' },
                            { title: 'Configurar Planos', icon: '📦', description: 'Planos e preços' },
                            { title: 'Relatórios Fiscais', icon: '📊', description: 'Configurações fiscais' },
                            { title: 'Banco de Dados', icon: '💾', description: 'Acesso ao BD' },
                        ].map((action) => (
                            <button
                                key={action.title}
                                className="p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                            >
                                <div className="text-2xl mb-2">{action.icon}</div>
                                <h3 className="font-semibold text-sm">{action.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
