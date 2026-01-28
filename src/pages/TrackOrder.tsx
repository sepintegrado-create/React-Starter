import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    Clock,
    CheckCircle2,
    ChefHat,
    ChevronRight,
    Search,
    Timer,
    Bell,
    CheckCircle,
    Camera,
    Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { db, PublicOrder } from '../services/db';
import { formatCurrency } from '../utils/validators';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';
import QRCodeScanner from '../components/ui/QRCodeScanner';

export function TrackOrderPage() {
    const { user, currentCompany, currentRole } = useAuth();
    const [orders, setOrders] = useState<PublicOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastReadyItems, setLastReadyItems] = useState<string[]>([]);
    const [scannedReceipt, setScannedReceipt] = useState('');
    const [validationMessage, setValidationMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [showScanner, setShowScanner] = useState(false);

    const refreshOrders = () => {
        let allOrders: PublicOrder[] = [];

        if (currentRole === UserRole.USER) {
            // Customer only sees their own orders
            allOrders = db.getOrders(undefined, user?.id).filter(o => !o.isArchived);
        } else if (currentCompany) {
            // Employee/Admin only sees company orders that are not archived
            allOrders = db.getOrders(currentCompany.id).filter(o => !o.isArchived);
        }

        setOrders(allOrders);

        // Alert logic for Waiters
        if (currentRole === UserRole.EMPLOYEE || currentRole === UserRole.COMPANY_ADMIN) {
            const isDetailed = currentCompany?.settings?.enableDetailedTracking;
            const readyItems = allOrders.flatMap(o =>
                o.items.filter(i => i.status === 'ready' && (i.requiresPreparation || isDetailed))
                    .map(i => `${o.id}-${i.productId}`)
            );

            const newReady = readyItems.filter(id => !lastReadyItems.includes(id));
            if (newReady.length > 0) {
                // Play notification sound
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log('Audio play blocked'));
                setLastReadyItems(readyItems);
            }
        }
    };

    useEffect(() => {
        refreshOrders();
        const interval = setInterval(refreshOrders, 3000);
        return () => clearInterval(interval);
    }, [lastReadyItems, currentRole]);

    const handleUpdateStatus = (orderId: string, itemIdx: number, newStatus: any) => {
        const employee = (currentRole === UserRole.EMPLOYEE || currentRole === UserRole.COMPANY_ADMIN) && user
            ? { id: user.id, name: user.name }
            : undefined;
        db.updateOrderItemStatus(orderId, itemIdx, newStatus, employee);
        refreshOrders();
    };

    const handleConfirmReceipt = (orderId: string) => {
        db.confirmOrderReceipt(orderId);
        refreshOrders();
    };

    const handleScanComplete = (data: string) => {
        setScannedReceipt(data);
        setShowScanner(false);
        // Auto-validate after scan
        setTimeout(() => handleValidateReceipt(data), 100);
    };

    const handleValidateReceipt = (receiptCode?: string) => {
        const code = receiptCode || scannedReceipt;

        if (!code.startsWith('ORDER-RECEIPT-')) {
            setValidationMessage({ text: 'QR Code Inválido!', type: 'error' });
            return;
        }

        const orderId = code.replace('ORDER-RECEIPT-', '');
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            setValidationMessage({ text: 'Pedido não encontrado!', type: 'error' });
        } else {
            const order = orders[orderIndex];
            // Mark all items ready for delivery as delivered
            order.items.forEach((item, idx) => {
                if (item.status === 'ready' || item.status === 'pending') {
                    db.updateOrderItemStatus(orderId, idx, 'delivered');
                }
            });
            setValidationMessage({ text: `Pedido #${orderId.slice(-4)} validado e entregue!`, type: 'success' });
            refreshOrders();
        }
        setScannedReceipt('');
        setTimeout(() => setValidationMessage(null), 5000);
    };

    const filteredOrders = orders.filter(order =>
        order.targetNumber.includes(searchTerm) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'Aguardando', color: 'text-orange-500', bg: 'bg-orange-100', icon: Clock };
            case 'accepted':
                return { label: 'Em Preparo/Entrega', color: 'text-blue-500', bg: 'bg-blue-100', icon: ChefHat };
            case 'completed':
                return { label: 'Finalizado', color: 'text-green-500', bg: 'bg-green-100', icon: CheckCircle2 };
            default:
                return { label: 'Desconhecido', color: 'text-gray-500', bg: 'bg-gray-100', icon: ShoppingBag };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Acompanhar Pedidos</h1>
                    <p className="text-muted-foreground mt-1">Veja o status em tempo real dos seus pedidos</p>
                </div>
                {(currentRole === UserRole.EMPLOYEE || currentRole === UserRole.COMPANY_ADMIN) && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (currentCompany) {
                                db.archiveCompletedOrders(currentCompany.id);
                                refreshOrders();
                            }
                        }}
                        className="gap-2 text-xs font-black uppercase text-red-600 border-red-200 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        Limpar Tela (Arquivar Concluídos)
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por mesa, quarto ou produto..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {(currentRole === UserRole.EMPLOYEE || currentRole === UserRole.COMPANY_ADMIN) && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase text-primary italic">Validar Comprovante (Garçom)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <input
                                placeholder="Escaneie ou digite o código do comprovante..."
                                className="flex-1 p-3 rounded-xl border border-primary/20 bg-background font-mono text-sm"
                                value={scannedReceipt}
                                onChange={(e) => setScannedReceipt(e.target.value)}
                            />
                            <Button
                                onClick={() => setShowScanner(true)}
                                className="shadow-lg shadow-primary/20 gap-2"
                            >
                                <Camera className="w-4 h-4" />
                                Escanear
                            </Button>
                            <Button onClick={() => handleValidateReceipt()} className="shadow-lg shadow-primary/20">Validar</Button>
                        </div>
                        {validationMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-4 p-3 rounded-[1rem] border text-sm font-bold flex items-center gap-2 ${validationMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                            >
                                {validationMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Bell className="w-5 h-5 text-red-500" />}
                                {validationMessage.text}
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            )}

            {showScanner && (
                <QRCodeScanner
                    onScan={handleScanComplete}
                    onClose={() => setShowScanner(false)}
                    title="Escanear Comprovante"
                    description="Aponte a câmera para o QR Code do comprovante"
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                        const status = getStatusInfo(order.status);
                        const StatusIcon = status.icon;

                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="h-full hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg ${status.bg} ${status.color}`}>
                                                    <StatusIcon className="w-5 h-5" />
                                                </div>
                                                <span className={`text-sm font-bold ${status.color}`}>{status.label}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    #{order.id.slice(-4).toUpperCase()}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase mt-1 px-1.5 py-0.5 rounded ${order.source === 'internal' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {order.source === 'internal' ? 'Garçom' : 'Cliente'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-black">Local</p>
                                            <p className="text-lg font-bold">
                                                {order.targetType === 'table' ? 'Mesa' : 'Quarto'} {order.targetNumber}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-xs text-muted-foreground uppercase font-black">Itens e Status</p>
                                            {order.items.map((item, idx) => {
                                                const isDetailed = currentCompany?.settings?.enableDetailedTracking;
                                                const showKitchenControls = (currentRole === UserRole.EMPLOYEE || currentRole === UserRole.COMPANY_ADMIN) && (item.requiresPreparation || isDetailed);

                                                return (
                                                    <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="text-sm font-bold">{item.quantity}x {item.name}</p>
                                                                {(item.requiresPreparation || isDetailed) && (
                                                                    <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase font-black">
                                                                        {item.requiresPreparation ? 'Cozinha' : 'Operacional'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${item.status === 'ready' ? 'bg-green-100 text-green-700 animate-pulse' :
                                                                item.status === 'preparing' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                                                    item.status === 'delivered' ? 'bg-gray-100 text-gray-700' :
                                                                        'bg-orange-100 text-orange-700'
                                                                }`}>
                                                                {item.status === 'ready' ? 'Pronto (Chamando Garçom)' :
                                                                    item.status === 'preparing' ? 'Em Preparação...' :
                                                                        item.status === 'delivered' ? 'Entregue' :
                                                                            item.status === 'received' ? 'Recebido' : 'Aguardando'}
                                                            </span>
                                                        </div>

                                                        {/* Kitchen Logic (Visible to Employees and Admins) */}
                                                        {(item.requiresPreparation || isDetailed) && item.status === 'pending' && (currentRole === UserRole.EMPLOYEE || currentRole === UserRole.COMPANY_ADMIN) && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(order.id, idx, 'preparing')}
                                                                className="w-full mt-2 py-1.5 bg-blue-600 text-white text-xs font-black uppercase italic rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <ChefHat className="w-3.5 h-3.5" /> Em Preparação
                                                            </button>
                                                        )}
                                                        {item.status === 'preparing' && (currentRole === UserRole.EMPLOYEE || currentRole === UserRole.COMPANY_ADMIN) && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(order.id, idx, 'ready')}
                                                                className="w-full mt-2 py-1.5 bg-amber-500 text-white text-xs font-black uppercase italic rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Pronto para Entrega
                                                            </button>
                                                        )}

                                                        {/* Waiter Logic (Visible to Employees and Admins) */}
                                                        {item.status === 'ready' && (currentRole === UserRole.EMPLOYEE || currentRole === UserRole.COMPANY_ADMIN) && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(order.id, idx, 'delivered')}
                                                                className="w-full mt-2 py-1.5 bg-green-600 text-white text-xs font-bold rounded-md hover:bg-green-700 transition-all flex items-center justify-center gap-2 border-2 border-green-200 shadow-lg shadow-green-500/20"
                                                            >
                                                                <Bell className="w-3.5 h-3.5 animate-bounce" /> Confirmar Entrega
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-dashed border-border">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Histórico do Pedido</p>
                                            <div className="space-y-3">
                                                {order.history?.map((h, i) => (
                                                    <div key={i} className="flex gap-3 text-xs">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                                            {i < order.history.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                                                        </div>
                                                        <div className="flex-1 pb-1">
                                                            <p className="font-bold text-foreground">{h.status}</p>
                                                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                                                <span className="font-mono">{new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                {h.employeeName && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="font-black uppercase italic text-primary/70">{h.employeeName}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Timer className="w-3.5 h-3.5" />
                                                    {new Date(order.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground uppercase font-black leading-none">Total</p>
                                                    <p className="text-xl font-black text-primary">
                                                        {formatCurrency(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Client Final Confirmation */}
                                            {currentRole === UserRole.USER && order.status === 'accepted' && (
                                                <Button
                                                    onClick={() => handleConfirmReceipt(order.id)}
                                                    className="w-full h-12 gap-2 text-xs font-black uppercase italic shadow-xl shadow-green-500/20 bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    Confirmar Recebimento Final
                                                </Button>
                                            )}
                                        </div>

                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold">Nenhum pedido encontrado</h3>
                        <p className="text-muted-foreground">Pedidos feitos via QR Code ou no PDV aparecerão aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
