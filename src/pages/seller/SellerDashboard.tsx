import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Package, Calendar, CheckCircle, Clock, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/validators';

interface Client {
    id: string;
    companyName: string;
    packageName: string;
    status: 'active' | 'inactive';
    monthlyValue: number;
    signupDate: string;
    lastPayment?: string;
}

export function SellerDashboard() {
    const [clients, setClients] = useState<Client[]>([
        { id: '1', companyName: 'Restaurante Bom Sabor', packageName: 'Plano Premium', status: 'active', monthlyValue: 299.90, signupDate: '2024-01-24', lastPayment: '2024-01-24' },
        { id: '2', companyName: 'Loja Tech Store', packageName: 'Plano Básico', status: 'active', monthlyValue: 99.90, signupDate: '2024-01-23', lastPayment: '2024-01-23' },
        { id: '3', companyName: 'Academia Fitness', packageName: 'Plano Premium', status: 'active', monthlyValue: 299.90, signupDate: '2024-01-21', lastPayment: '2024-01-21' },
        { id: '4', companyName: 'Clínica Médica', packageName: 'Plano Intermediário', status: 'inactive', monthlyValue: 199.90, signupDate: '2024-01-18' },
    ]);

    const stats = {
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === 'active').length,
        inactiveClients: clients.filter(c => c.status === 'inactive').length,
        monthlyRecurring: clients.filter(c => c.status === 'active').reduce((sum, c) => sum + c.monthlyValue, 0),
        totalCommission: 2400,
        pendingCommission: 300,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard do Vendedor</h1>
                    <p className="text-muted-foreground mt-1">Acompanhe suas vendas e clientes</p>
                </div>
                <Button onClick={() => window.location.hash = '#/seller/sales'}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Comissões
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                                    <p className="text-2xl font-bold mt-1">{stats.totalClients}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-2 border-green-200 bg-green-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Clientes Ativos</p>
                                    <p className="text-2xl font-bold text-green-900 mt-1">{stats.activeClients}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-2 border-orange-200 bg-orange-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-700">Clientes Inativos</p>
                                    <p className="text-2xl font-bold text-orange-900 mt-1">{stats.inactiveClients}</p>
                                </div>
                                <Clock className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-2 border-purple-200 bg-purple-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-700">Receita Recorrente</p>
                                    <p className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(stats.monthlyRecurring)}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Commission Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-primary">Total de Comissões</p>
                                <p className="text-3xl font-bold text-primary mt-1">{formatCurrency(stats.totalCommission)}</p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-orange-200 bg-orange-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Comissões Pendentes</p>
                                <p className="text-3xl font-bold text-orange-900 mt-1">{formatCurrency(stats.pendingCommission)}</p>
                            </div>
                            <DollarSign className="w-10 h-10 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Clients List */}
            <Card>
                <CardHeader>
                    <CardTitle>Meus Clientes</CardTitle>
                    <CardDescription>Lista de empresas que você vendeu pacotes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {clients.map((client, index) => (
                            <motion.div
                                key={client.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${client.status === 'active' ? 'bg-green-100' : 'bg-orange-100'}`}>
                                        {client.status === 'active' ? (
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        ) : (
                                            <Clock className="w-6 h-6 text-orange-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{client.companyName}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {client.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Package className="w-3 h-3" />
                                                {client.packageName}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Cadastro: {new Date(client.signupDate).toLocaleDateString('pt-BR')}
                                            </span>
                                            {client.lastPayment && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-green-600 font-medium">
                                                        Último pagamento: {new Date(client.lastPayment).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">{formatCurrency(client.monthlyValue)}</p>
                                    <p className="text-xs text-muted-foreground">por mês</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
