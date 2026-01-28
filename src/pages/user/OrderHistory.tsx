import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Calendar, MapPin, ChevronRight, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { db, PublicOrder } from '../../services/db';
import { formatCurrency } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';

export function UserOrderHistoryPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<PublicOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const allOrders = db.getOrders(undefined, user?.id);
        setOrders(allOrders.sort((a, b) => b.timestamp - a.timestamp));
    }, [user?.id]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-orange-100 text-orange-700';
            case 'accepted': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Concluído';
            case 'pending': return 'Pendente';
            case 'accepted': return 'Em Preparo';
            default: return status;
        }
    };

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.targetNumber.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
                    <p className="text-muted-foreground mt-1">Veja seu histórico de consumo em todas as empresas</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por ID ou Nº da Mesa/Quarto..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary outline-none font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:border-primary/30 transition-all group">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-center">
                                        <div className="p-6 border-b md:border-b-0 md:border-r border-border md:w-64 bg-muted/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    {new Date(order.timestamp).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                            <p className="text-lg font-black tracking-tight uppercase italic mb-1">
                                                {order.targetType === 'table' ? 'Mesa' : 'Quarto'} {order.targetNumber}
                                            </p>
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>

                                        <div className="flex-1 p-6">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {order.items.slice(0, 3).map((item, idx) => (
                                                    <span key={idx} className="text-xs bg-muted px-2 py-1 rounded-md font-medium">
                                                        {item.quantity}x {item.name}
                                                    </span>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <span className="text-xs text-muted-foreground font-medium pt-1">
                                                        + {order.items.length - 3} itens
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-lg font-black text-primary">
                                                    {formatCurrency(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                                                </div>
                                                <button
                                                    onClick={() => window.location.hash = `#/user/track-order?id=${order.id}`}
                                                    className="flex items-center gap-1 text-xs font-black uppercase text-primary hover:gap-2 transition-all"
                                                >
                                                    Detalhes <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center border-2 border-dashed rounded-2xl">
                        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold italic uppercase">Nenhum pedido</h3>
                        <p className="text-muted-foreground">Você ainda não realizou nenhum pedido em nossa rede.</p>
                        <Button className="mt-6" variant="outline" onClick={() => window.location.hash = '#/user/explore'}>
                            Explorar Empresas
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
