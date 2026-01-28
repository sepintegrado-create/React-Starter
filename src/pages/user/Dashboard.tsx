import React from 'react';
import { motion } from 'framer-motion';
import { Home, TrendingUp, DollarSign, Users, Building2, Briefcase, ShieldAlert, Globe, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/user';

export function UserDashboard() {
    const { user, switchRole } = useAuth();

    const [balance, setBalance] = React.useState(0);

    React.useEffect(() => {
        const stored = localStorage.getItem('sepi_user_balance');
        if (stored) setBalance(parseFloat(stored));
    }, []);

    const stats = [
        { label: 'Saldo Disponível', value: `R$ ${balance.toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
        { label: 'Pedidos Realizados', value: '12', icon: Home, color: 'text-blue-500' },
        { label: 'Empresas Favoritas', value: '4', icon: Users, color: 'text-orange-500' },
        { label: 'Serviços Ativos', value: '3', icon: TrendingUp, color: 'text-purple-500' }
    ];

    const hasCompany = user?.companies && user.companies.length > 0;
    const isEmployee = user?.employeeOf && user.employeeOf.length > 0;

    return (
        <div className="space-y-6">
            {user?.role === UserRole.PLATFORM_ADMIN && (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <ShieldAlert className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-primary">Você está na Visão Cliente</p>
                            <p className="text-xs text-primary/70">Algumas funcionalidades administrativas estão ocultas.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.hash = '#/user/profile'}
                            className="font-bold border-primary text-primary hover:bg-primary/10"
                        >
                            <Globe className="w-4 h-4 mr-2" />
                            Ver Meu Perfil Público
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => switchRole(UserRole.PLATFORM_ADMIN)}
                            className="font-bold shadow-lg shadow-primary/20"
                        >
                            Voltar ao Painel Admin
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight italic uppercase">Olá, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-muted-foreground mt-1">Bem-vindo ao seu painel pessoal</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => window.location.hash = '#/user/track-order'}
                        className="font-black italic uppercase italic text-xs"
                    >
                        <TrendingUp className="w-4 h-4 mr-2" /> Acompanhar Pedido
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card hover onClick={() => {
                            if (stat.label === 'Pedidos Realizados') window.location.hash = '#/user/orders';
                        }} className="cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground">{stat.label}</p>
                                        <p className="text-2xl font-black mt-1 italic uppercase">{stat.value}</p>
                                    </div>
                                    <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="italic font-black uppercase">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => window.location.hash = '#/user/explore'}
                        className="p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left bg-card group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Search className="w-5 h-5" />
                        </div>
                        <h3 className="font-black mb-1 italic uppercase text-sm font-bold">🔍 Buscar Empresas</h3>
                        <p className="text-xs text-muted-foreground">Encontre produtos e serviços próximos</p>
                    </button>

                    <button
                        onClick={() => window.location.hash = '#/user/payments'}
                        className="p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left bg-card group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <h3 className="font-black mb-1 italic uppercase text-sm font-bold">💳 Pagamentos</h3>
                        <p className="text-xs text-muted-foreground">Gerencie seus cartões e contas</p>
                    </button>

                    <button
                        onClick={() => window.location.hash = '#/user/profile'}
                        className="p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left bg-card group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="font-black mb-1 italic uppercase text-sm font-bold">👤 Meu Perfil</h3>
                        <p className="text-xs text-muted-foreground">Atualize seus dados pessoais</p>
                    </button>

                    <button className="p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left bg-card group">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h3 className="font-black mb-1 italic uppercase text-sm font-bold">🏢 Minhas Empresas</h3>
                        <p className="text-xs text-muted-foreground">Contrate ou gerencie assinaturas</p>
                    </button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico Recente</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhuma atividade recente</p>
                        <p className="text-sm mt-1">Comece explorando empresas e serviços!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
