import React, { useState, useEffect } from 'react';
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    Banknote,
    QrCode,
    User,
    ChevronRight,
    Package,
    X,
    Clock,
    History,
    Utensils,
    BedDouble,
    Maximize,
    Minimize,
    Keyboard as KeyboardIcon,
    LayoutDashboard,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/validators';
import { Product, UserRole } from '../../types/user';
import { db, HistoryItem } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { TableMonitor } from '../../components/company/TableMonitor';

interface CartItem extends Product {
    quantity: number;
}

export function PDVPage() {
    const { currentCompany, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'cash' | 'pix' | null>(null);
    const [showCheckout, setShowCheckout] = useState(false);

    // New Context State
    const [salesType, setSalesType] = useState<'counter' | 'table' | 'room' | 'appointment'>('counter');
    const [targetNumber, setTargetNumber] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    // Dynamic Data from DB
    const [products, setProducts] = useState<Product[]>([]);
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

    const [viewMode, setViewMode] = useState<'menu' | 'monitor'>('menu');
    const [allTabs, setAllTabs] = useState<any[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [isCartVisible, setIsCartVisible] = useState(true);

    // 1. Load Products & Tab Data
    useEffect(() => {
        setProducts(db.getProducts());
    }, []);

    // 2. Load History when Table/Room changes
    useEffect(() => {
        if (salesType !== 'counter' && targetNumber) {
            const tab = db.getTab(salesType as 'table' | 'room' | 'appointment', targetNumber, currentCompany?.id);
            setHistoryItems(tab.history);
        } else {
            setHistoryItems([]);
        }
    }, [salesType, targetNumber]);

    // 3. Auto-Sync: Listen for public orders & tabs
    useEffect(() => {
        const handleSync = () => {
            if (currentCompany) {
                setAllTabs(db.getAllTabs(currentCompany.id));
            }
            if (salesType !== 'counter' && targetNumber) {
                const tab = db.getTab(salesType as 'table' | 'room' | 'appointment', targetNumber, currentCompany?.id);
                setHistoryItems(tab.history);
            }
        };

        handleSync(); // Initial load
        const interval = setInterval(handleSync, 3000); // Check every 3s
        window.addEventListener('storage', handleSync); // Listen for cross-tab changes

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleSync);
        };
    }, [salesType, targetNumber, currentCompany]);

    // Barcode Scanning Support
    const barcodeBuffer = React.useRef<string>('');
    const lastKeyTime = React.useRef<number>(Date.now());

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();
            if (currentTime - lastKeyTime.current > 50) {
                barcodeBuffer.current = '';
            }
            lastKeyTime.current = currentTime;

            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 5) {
                    const code = barcodeBuffer.current;
                    const product = products.find(p =>
                        p.barcode === code ||
                        p.sku?.toLowerCase() === code.toLowerCase()
                    );

                    if (product) {
                        addToCart(product);
                        setSearchTerm('');
                        barcodeBuffer.current = '';
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
                barcodeBuffer.current = '';
            } else if (e.key.length === 1) {
                barcodeBuffer.current += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [products]);

    // Fullscreen Toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Cart logic
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleAddToTab = () => {
        if (!targetNumber && salesType !== 'counter') {
            alert('Por favor, informe o número da Mesa ou Quarto.');
            return;
        }
        if (salesType === 'counter') return;

        db.createOrder({
            id: `int-${Date.now()}`,
            companyId: currentCompany?.id || 'company-001',
            waiterId: user?.id,
            targetType: salesType as 'table' | 'room' | 'appointment',
            targetNumber: targetNumber,
            customerName: targetNumber ? `${salesType === 'table' ? 'Mesa' : 'Quarto'} ${targetNumber}` : 'Balcão',
            items: cart.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                requiresPreparation: item.requiresPreparation,
                status: item.requiresPreparation ? 'pending' : 'delivered'
            })),
            status: 'pending',
            timestamp: Date.now(),
            source: 'internal',
            history: [{ status: 'Pedido criado internamente', timestamp: Date.now(), employeeName: user?.name }]
        });

        setHistoryItems(db.getTab(salesType as 'table' | 'room' | 'appointment', targetNumber, currentCompany?.id).history);
        if (currentCompany) setAllTabs(db.getAllTabs(currentCompany.id));
        setCart([]);
        alert(`Pedido enviado para ${salesType === 'table' ? 'Mesa' : 'Quarto'} ${targetNumber}!`);
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const historyTotal = historyItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const grandTotal = (salesType !== 'counter') ? total + historyTotal : total;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.includes(searchTerm)
    );

    const handleCheckoutFromHistory = () => {
        setShowHistory(false);
        setShowCheckout(true);
    };

    const handleFinishPayment = () => {
        cart.forEach(item => db.adjustStock(item.id, -item.quantity, 'Venda PDV'));
        historyItems.forEach(item => {
            const product = products.find(p => p.name === item.productName);
            if (product) db.adjustStock(product.id, -item.quantity, 'Venda PDV (Consumo)');
        });

        const saleId = `sale-${Date.now()}`;
        const orderId = `ord-${Date.now()}`;

        db.addTransaction({
            id: `trans-${Date.now()}`,
            type: 'income',
            category: 'Venda de Produto',
            description: `Venda PDV - ${salesType === 'counter' ? 'Balcão' : (salesType === 'table' ? 'Mesa ' + targetNumber : (salesType === 'room' ? 'Quarto ' + targetNumber : 'Agendamento ' + targetNumber))}`,
            amount: grandTotal,
            date: new Date().toISOString().split('T')[0],
            status: 'completed',
            finishedBy: user?.id
        });

        // Archive any pending orders for this table/room BEFORE creating final order
        if (salesType !== 'counter' && targetNumber) {
            db.archiveOrdersByTarget(currentCompany?.id || 'company-001', salesType, targetNumber);
        }

        // INTEGRATION: Create an order record so it shows up in Reports
        db.createOrder({
            id: orderId,
            companyId: currentCompany?.id || 'company-001',
            userId: undefined, // Direct sale
            targetType: salesType === 'counter' ? 'table' : salesType as 'table' | 'room' | 'appointment',
            targetNumber: targetNumber || 'B',
            items: [
                ...cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    status: 'received' as const
                })),
                ...historyItems.map(item => ({
                    productId: 'external',
                    name: item.productName,
                    price: item.price,
                    quantity: item.quantity,
                    status: 'received' as const
                }))
            ],
            status: 'completed',
            timestamp: Date.now(),
            source: 'internal',
            history: [{ status: 'Venda finalizada no PDV', timestamp: Date.now(), employeeName: user?.name }],
            isArchived: true // Mark as archived so it doesn't show in active monitor
        });

        alert('Venda finalizada com sucesso!');
        if (salesType !== 'counter' && targetNumber) {
            db.clearTab(salesType as 'table' | 'room' | 'appointment', targetNumber, currentCompany?.id);
        }
        if (currentCompany) setAllTabs(db.getAllTabs(currentCompany.id));
        setCart([]);
        setHistoryItems([]);
        setShowCheckout(false);
        setPaymentMethod(null);
    };

    const handleSelectTabFromMonitor = (type: 'table' | 'room' | 'appointment', number: string) => {
        setSalesType(type);
        setTargetNumber(number);
        setViewMode('menu');
        if (currentCompany) {
            const tab = allTabs.find(t => t.type === type && t.number === number);
            if (tab?.status === 'ready_to_pay') {
                setShowHistory(true);
            }
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] gap-6">
            <div className="flex items-center justify-between">
                <div className="flex bg-muted rounded-xl p-1 gap-1">
                    <Button
                        variant={viewMode === 'menu' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('menu')}
                        className="rounded-lg font-black uppercase text-[10px] italic tracking-widest px-4"
                    >
                        <Utensils className="w-3.5 h-3.5 mr-2" />
                        Venda/Mesa
                    </Button>
                    <Button
                        variant={viewMode === 'monitor' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('monitor')}
                        className="rounded-lg font-black uppercase text-[10px] italic tracking-widest px-4"
                    >
                        <LayoutDashboard className="w-3.5 h-3.5 mr-2" />
                        Monitor Dashboard
                    </Button>
                </div>
            </div>

            {viewMode === 'monitor' ? (
                <div className="flex-1 overflow-auto bg-card rounded-3xl border border-border/50 shadow-xl">
                    <div className="p-6 border-b flex items-center justify-between bg-muted/20">
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight">Monitor de Atendimento</h2>
                            <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Visão geral de todas as mesas e quartos</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Ocupado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Fechar Conta</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Livre</span>
                            </div>
                            {user?.role === UserRole.COMPANY_ADMIN && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (currentCompany && window.confirm('Deseja limpar TODO o monitor? Isso arquivará todos os atendimentos ativos.')) {
                                            db.clearAllMonitorData(currentCompany.id);
                                            setAllTabs(db.getAllTabs(currentCompany.id));
                                        }
                                    }}
                                    className="ml-4 gap-2 text-[10px] font-black uppercase italic text-red-600 border-red-200 hover:bg-red-50 py-1 h-7"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Limpar Monitor
                                </Button>
                            )}
                        </div>
                    </div>
                    <TableMonitor
                        tabs={allTabs}
                        onSelectTab={handleSelectTabFromMonitor}
                    />
                </div>
            ) : (
                <div className="flex-1 flex gap-6 overflow-hidden">
                    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 bg-card p-2 rounded-xl border border-border">
                                <div className="flex bg-muted rounded-lg p-1">
                                    {['counter', 'table', 'room', 'appointment'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSalesType(type as any)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${salesType === type ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            {type === 'table' && <Utensils className="w-4 h-4" />}
                                            {type === 'room' && <BedDouble className="w-4 h-4" />}
                                            {type === 'appointment' && <Calendar className="w-4 h-4" />}
                                            {type === 'counter' ? 'Balcão' : type === 'table' ? 'Mesa' : type === 'room' ? 'Quarto' : 'Agenda'}
                                        </button>
                                    ))}
                                </div>

                                {salesType !== 'counter' && (
                                    <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-left-4">
                                        <span className="text-sm font-medium whitespace-nowrap">Nº {salesType === 'table' ? 'Mesa' : 'Quarto'}:</span>
                                        <input
                                            type="text"
                                            value={targetNumber}
                                            onChange={(e) => setTargetNumber(e.target.value)}
                                            className="w-20 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold"
                                            placeholder="00"
                                        />
                                        {targetNumber && (
                                            <button
                                                onClick={() => setShowHistory(true)}
                                                className="ml-auto flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                                            >
                                                <History className="w-4 h-4" /> Histórico
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar produto..."
                                        className="pl-12 h-12 rounded-2xl border-border/50 bg-card"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" onClick={toggleFullscreen} className="h-12 w-12 rounded-2xl">
                                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowShortcuts(!showShortcuts)}
                                    className={`h-12 w-12 rounded-2xl ${showShortcuts ? 'text-primary border-primary/20 bg-primary/5' : ''}`}
                                >
                                    <KeyboardIcon className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                                {filteredProducts.map((product) => (
                                    <motion.button
                                        key={product.id}
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => addToCart(product)}
                                        className="group relative bg-card border border-border rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                            {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground" />}
                                        </div>
                                        <h3 className="font-semibold text-sm line-clamp-2 h-8 leading-tight">{product.name}</h3>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-primary font-bold">{formatCurrency(product.price)}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{product.sku}</span>
                                        </div>
                                        {cart.find(i => i.id === product.id) && (
                                            <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">
                                                {cart.find(i => i.id === product.id)?.quantity}
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Floating Toggle Cart Button when hidden */}
                            {!isCartVisible && (
                                <button
                                    onClick={() => setIsCartVisible(true)}
                                    className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-primary text-white p-3 rounded-l-2xl shadow-2xl hover:-translate-x-1 transition-transform animate-in fade-in slide-in-from-right-4"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                            {itemCount}
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <motion.div
                        initial={false}
                        animate={{
                            width: isCartVisible ? 384 : 0,
                            opacity: isCartVisible ? 1 : 0,
                            x: isCartVisible ? 0 : 100
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="flex flex-col bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative"
                    >
                        {/* Toggle Button Inside Cart */}
                        <button
                            onClick={() => setIsCartVisible(false)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-primary/10 text-primary p-1 rounded-r-md hover:bg-primary hover:text-white transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-primary" />
                                <h2 className="font-bold">Carrinho</h2>
                            </div>
                            {salesType !== 'counter' && targetNumber && (
                                <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary uppercase">
                                    {salesType === 'table' ? 'Mesa' : 'Quarto'} {targetNumber}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {/* Consumed Items Section */}
                            {historyItems.length > 0 && (
                                <div className="space-y-3 pb-4 border-b border-dashed border-border/50">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground italic mb-1">
                                        <History className="w-3 h-3" />
                                        Consumo da {salesType === 'table' ? 'Mesa' : 'Quarto'} {targetNumber}
                                    </div>
                                    {historyItems.map((item, idx) => (
                                        <div key={`hist-${idx}`} className="flex flex-col gap-1 p-2.5 rounded-xl border border-border/50 bg-muted/10 opacity-75">
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium text-xs leading-tight flex-1">{item.productName}</span>
                                                <span className="text-[9px] font-black uppercase bg-green-100/50 text-green-700 px-1.5 py-0.5 rounded italic">Já Servido</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5">
                                                <span className="text-[10px] text-muted-foreground">{item.quantity}x {formatCurrency(item.price)}</span>
                                                <span className="font-bold text-xs text-muted-foreground">{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pending Cart Items Section */}
                            {cart.length === 0 && historyItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 py-12">
                                    <ShoppingCart className="w-12 h-12 mb-4" />
                                    <p className="font-bold uppercase tracking-widest text-xs">Carrinho vazio</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.length > 0 && historyItems.length > 0 && (
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary italic mb-1">
                                            <Plus className="w-3 h-3" />
                                            Novos Itens a Adicionar
                                        </div>
                                    )}
                                    {cart.map((item) => (
                                        <motion.div layout key={item.id} className="flex flex-col gap-2 p-3 rounded-xl border border-primary/20 bg-background shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium text-sm leading-tight flex-1">{item.name}</span>
                                                <button onClick={() => removeFromCart(item.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-background rounded-md"><Minus className="w-3 h-3" /></button>
                                                    <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-background rounded-md"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <span className="font-bold text-primary">{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-muted/30 border-t space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Novos Itens ({itemCount})</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                                {historyItems.length > 0 && (
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Consumo Anterior</span>
                                        <span>{formatCurrency(historyTotal)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-black text-primary pt-2 border-t border-dashed border-border/50">
                                    <span>VALOR TOTAL</span>
                                    <span>{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                {salesType !== 'counter' && targetNumber ? (
                                    <>
                                        <Button className="w-full h-12 text-lg font-bold rounded-xl shadow-lg bg-green-600 hover:bg-green-700 text-white" disabled={cart.length === 0} onClick={handleAddToTab}>Adicionar à Conta</Button>
                                        <Button variant="outline" className="w-full h-12 text-lg font-bold rounded-xl border-2 border-primary text-primary" onClick={() => setShowCheckout(true)}>Fechar Conta</Button>
                                    </>
                                ) : (
                                    <Button className="w-full h-14 text-lg font-bold rounded-xl shadow-lg" disabled={cart.length === 0} onClick={() => setShowCheckout(true)}>Finalizar Venda</Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            <AnimatePresence>
                {showHistory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                            <div className="p-6 border-b flex justify-between items-center bg-muted/30">
                                <div><h2 className="text-xl font-bold">Histórico</h2><p className="text-sm text-muted-foreground">{salesType === 'table' ? 'Mesa' : 'Quarto'} {targetNumber}</p></div>
                                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-muted rounded-full"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                <div className="space-y-4">
                                    {historyItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-muted"><Clock className="w-5 h-5 text-primary" /></div>
                                                <div><p className="font-semibold">{item.productName}</p><p className="text-sm text-muted-foreground">{item.quantity}x {formatCurrency(item.price)}</p></div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{formatCurrency(item.quantity * item.price)}</p>
                                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase font-bold">{item.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 border-t bg-muted/20">
                                <div className="flex justify-between items-center mb-4"><span className="font-medium">Total Consumido</span><span className="text-2xl font-black">{formatCurrency(historyTotal)}</span></div>
                                <Button className="w-full h-12 rounded-xl" onClick={handleCheckoutFromHistory}>Fechar para Pagamento</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCheckout && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckout(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden">
                            <div className="p-8 space-y-8">
                                <div className="flex justify-between items-center"><h2 className="text-2xl font-black">Pagamento</h2><button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-muted rounded-full"><X className="w-6 h-6" /></button></div>
                                <div className="text-center p-6 bg-primary/5 rounded-2xl border-2 border-primary/20">
                                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total a pagar</p>
                                    <p className="text-5xl font-black text-primary mt-2">{formatCurrency(grandTotal)}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'pix', label: 'PIX', icon: QrCode },
                                            { id: 'credit', label: 'Crédito', icon: CreditCard },
                                            { id: 'debit', label: 'Débito', icon: CreditCard },
                                            { id: 'cash', label: 'Dinheiro', icon: Banknote },
                                        ].map((method) => (
                                            <button key={method.id} onClick={() => setPaymentMethod(method.id as any)} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id ? 'border-primary bg-primary/10' : 'border-border'}`}>
                                                <method.icon className={`w-8 h-8 mb-2 ${paymentMethod === method.id ? 'text-primary' : ''}`} />
                                                <span className="text-xs font-bold">{method.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Button className="w-full h-16 text-xl font-bold rounded-2xl" disabled={!paymentMethod} onClick={handleFinishPayment}>Confirmar Recebimento</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showShortcuts && (
                    <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:pb-4 pointer-events-none">
                        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-2 pointer-events-auto">
                            {[
                                { key: 'F1', label: 'BUSCAR', action: () => document.querySelector<HTMLInputElement>('input[placeholder*="Buscar"]')?.focus() },
                                { key: 'F2', label: 'BALCÃO', action: () => setSalesType('counter') },
                                { key: 'F3', label: 'MESAS', action: () => setSalesType('table') },
                                { key: 'F4', label: 'QUARTOS', action: () => setSalesType('room') },
                                { key: 'F5', label: 'PAGAR', action: () => setShowCheckout(true) },
                                { key: 'F8', label: 'CONTA', action: () => setShowHistory(true) },
                                { key: 'F9', label: 'LIMPAR', action: () => setCart([]) },
                                { key: 'ESC', label: 'FECHAR', action: () => setShowShortcuts(false) },
                            ].map((btn) => (
                                <button key={btn.key} onClick={btn.action} className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-2xl">
                                    <span className="text-primary">{btn.key}</span><span>{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
