import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Utensils, BedDouble, Instagram, Facebook, MessageSquare, Info, ChevronRight, Star, ArrowLeft, Wallet, CreditCard, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, PublicOrder } from '../../services/db';
import { Product } from '../../types/user';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

// Helper to parse hash params: #/order/COMPANY_ID/TYPE/NUMBER
const getOrderParams = () => {
    const hash = window.location.hash;
    const parts = hash.split('/');
    if (parts.length >= 5 && parts[1] === 'order') {
        return {
            companyId: parts[2],
            type: parts[3] as 'table' | 'room',
            targetNumber: parts[4]
        };
    }
    return null;
};

export function PublicOrderPage() {
    const { user } = useAuth();
    const params = getOrderParams();
    const [company, setCompany] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [step, setStep] = useState<'menu' | 'payment' | 'receipt'>('menu');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [balance, setBalance] = useState(0);
    const [orderId, setOrderId] = useState('');
    const [isSideCartOpen, setIsSideCartOpen] = useState(false);

    useEffect(() => {
        if (params) {
            setCompany(db.getCompanyById(params.companyId));
            const allProducts = db.getProducts();
            setProducts(allProducts.filter(p => p.isActive && p.companyId === params.companyId));

            // Load persisted cart from PublicProfile if exists
            const savedCart = localStorage.getItem(`sepi_cart_${params.companyId}`);
            if (savedCart) {
                setCart(JSON.parse(savedCart));
                // Clear it so it doesn't persist forever
                localStorage.removeItem(`sepi_cart_${params.companyId}`);
            }
        }
        const storedBalance = localStorage.getItem('sepi_user_balance');
        if (storedBalance) setBalance(parseFloat(storedBalance));
    }, [params?.companyId]);

    if (!params || !company) {
        return <div className="p-8 text-center min-h-screen flex items-center justify-center font-bold text-gray-400 uppercase tracking-widest">QR Code Inválido ou Empresa não encontrada.</div>;
    }

    const categories = ['Todos', ...Array.from(new Set(products.map(p => p.categoryId || 'Outros')))];

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.product.id === productId) {
                const newQty = i.quantity + delta;
                return newQty > 0 ? { ...i, quantity: newQty } : i;
            }
            return i;
        }).filter(i => i.quantity > 0));
    };

    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handlePlaceOrder = (paymentMethod: 'balance' | 'new_card') => {
        if (cart.length === 0) return;

        if (paymentMethod === 'balance') {
            if (balance < total) {
                alert('Saldo insuficiente! Por favor, adicione crédito.');
                window.location.hash = '#/user/add-credit';
                return;
            }
            const newBalance = balance - total;
            localStorage.setItem('sepi_user_balance', newBalance.toString());
            setBalance(newBalance);
        }

        const newId = Date.now().toString();
        const order: PublicOrder = {
            id: newId,
            companyId: params.companyId,
            userId: user?.id,
            targetType: params.type,
            targetNumber: params.targetNumber,
            status: 'pending',
            timestamp: Date.now(),
            source: 'public',
            history: [{ status: 'Pedido criado pelo cliente', timestamp: Date.now() }],
            items: cart.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                requiresPreparation: item.product.requiresPreparation,
                status: item.product.requiresPreparation ? 'preparing' : 'ready'
            }))
        };

        db.placePublicOrder(order);
        setOrderId(newId);
        setIsSideCartOpen(false);
        setStep('receipt');
        setCart([]);
    };

    if (step === 'receipt') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-card p-10 rounded-[3rem] shadow-2xl max-w-sm w-full border border-border relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />

                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>

                    <h2 className="text-2xl font-black mb-1 italic uppercase">PAGAMENTO CONFIRMADO!</h2>
                    <p className="text-muted-foreground text-sm mb-8">Mostre o QR Code abaixo ao atendente para receber seu pedido.</p>

                    <div className="bg-white p-4 rounded-3xl border-2 border-border inline-block shadow-lg mb-8">
                        {/* The QR code waiter will scan */}
                        <QRCodeSVG value={`ORDER-RECEIPT-${orderId}`} size={180} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-black uppercase text-muted-foreground border-b border-border pb-2">
                            <span>ID DO PEDIDO</span>
                            <span className="text-foreground">#{orderId.slice(-6)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-black uppercase text-muted-foreground border-b border-border pb-2">
                            <span>LOCAL</span>
                            <span className="text-foreground">{params.type === 'table' ? 'Mesa' : 'Quarto'} {params.targetNumber}</span>
                        </div>
                    </div>

                    <Button
                        onClick={() => setStep('menu')}
                        variant="outline"
                        className="w-full mt-8 h-12 rounded-2xl font-black uppercase italic"
                    >
                        Novo Pedido
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (step === 'payment') {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setStep('menu')} className="p-2 hover:bg-muted rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-black italic uppercase">Pagamento</h1>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase text-muted-foreground">Resumo do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Total a Pagar</span>
                                <span className="font-black text-2xl text-primary italic">R$ {total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <p className="text-xs font-black uppercase text-muted-foreground tracking-widest px-1">Escolha como pagar</p>

                        <button
                            onClick={() => handlePlaceOrder('balance')}
                            className="w-full p-6 rounded-3xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black italic uppercase text-sm">Usar Saldo</p>
                                    <p className="text-xs text-muted-foreground">Saldo disponível: R$ {balance.toFixed(2)}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <button
                            onClick={() => handlePlaceOrder('new_card')}
                            className="w-full p-6 rounded-3xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black italic uppercase text-sm">Cartão de Crédito</p>
                                    <p className="text-xs text-muted-foreground">Pagar agora via checkout seguro</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    const filteredProducts = selectedCategory === 'Todos' ? products : products.filter(p => p.categoryId === selectedCategory);

    return (
        <div className="min-h-screen bg-background pb-40">
            {/* Premium Header */}
            <div className="relative">
                {/* Cover Photo */}
                <div className="h-[25vh] md:h-[35vh] w-full relative overflow-hidden">
                    <img src={company.settings.coverPhoto} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                {/* Profile Section - Below Cover */}
                <div className="max-w-xl mx-auto px-6 relative">
                    {/* Profile Photo - Overlapping cover */}
                    <div className="flex flex-col items-center text-center -mt-16">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-card border-8 border-background shadow-2xl overflow-hidden p-1">
                            <img src={company.settings.logo} className="w-full h-full object-cover rounded-[2rem]" />
                        </div>
                        <div className="space-y-1 mt-4">
                            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">{company.tradeName}</h1>
                            <div className="flex items-center justify-center gap-2 text-sm font-black text-primary uppercase italic">
                                {params.type === 'table' ? <Utensils className="w-4 h-4" /> : <BedDouble className="w-4 h-4" />}
                                <span>{params.type === 'table' ? 'Mesa' : 'Quarto'} {params.targetNumber}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex gap-2">
                            <a href="#" className="p-2.5 rounded-xl bg-card border border-border hover:bg-accent transition-colors">
                                <Instagram className="w-5 h-5 text-muted-foreground" />
                            </a>
                            <a href="#" className="p-2.5 rounded-xl bg-card border border-border hover:bg-accent transition-colors">
                                <Facebook className="w-5 h-5 text-muted-foreground" />
                            </a>
                            <a href="#" className="p-2.5 rounded-xl bg-card border border-border hover:bg-accent transition-colors">
                                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                            </a>
                        </div>
                        <div className="flex-1 flex gap-2 h-10">
                            <div className="flex-1 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center gap-2 text-xs font-black text-primary uppercase tracking-tighter">
                                <Star className="w-3 h-3 fill-primary" />
                                4.9 (240+)
                            </div>
                            <div className="flex-1 rounded-xl bg-muted/50 border border-border flex items-center justify-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-tighter">
                                <Info className="w-3 h-3" />
                                Info
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Selector */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border mt-8 overflow-x-auto no-scrollbar">
                <div className="max-w-xl mx-auto flex items-center gap-2 p-4 px-6 min-w-max">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                                : 'bg-muted text-muted-foreground hover:bg-accent'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Feed */}
            <div className="max-w-xl mx-auto p-6 space-y-6">
                <AnimatePresence mode="popLayout">
                    {filteredProducts.map(product => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={product.id}
                            className="group relative bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex gap-4 p-4">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 relative">
                                    <img
                                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-tighter">
                                        R$ {product.price.toFixed(2)}
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{product.categoryId || 'Outros'}</span>
                                        </div>
                                        <h3 className="text-lg font-black leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                            Ingredientes selecionados e preparo premium para garantir o melhor sabor.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        {cart.find(i => i.product.id === product.id) ? (
                                            <div className="flex items-center gap-4 bg-muted rounded-2xl p-1 pr-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => updateQuantity(product.id, -1)}
                                                        className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-8 text-center font-black text-sm">
                                                        {cart.find(i => i.product.id === product.id)?.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(product.id, 1)}
                                                        className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => addToCart(product)}
                                                className="rounded-2xl h-10 px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                                            >
                                                Adicionar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Bio Section - Moved to bottom */}
                <div className="max-w-xl mx-auto px-6 mt-12 pb-8">
                    <div className="p-8 bg-card rounded-[2rem] border border-border shadow-sm text-center relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Sobre Nós</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
                            "{company.settings.bio || 'Bem-vindo! Estamos focados em entregar a melhor experiência para você.'}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Improved Side Sliding Cart */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <>
                        {/* Small Floating Cart Tab when closed */}
                        {!isSideCartOpen && (
                            <motion.button
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 100, opacity: 0 }}
                                onClick={() => setIsSideCartOpen(true)}
                                className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] bg-primary text-primary-foreground p-4 rounded-l-[2rem] shadow-2xl flex flex-col items-center gap-2 hover:-translate-x-2 transition-transform"
                            >
                                <ShoppingCart className="w-6 h-6" />
                                <span className="text-[10px] font-black">{cart.length}</span>
                            </motion.button>
                        )}

                        {/* Backdrop for Side Cart */}
                        {isSideCartOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSideCartOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
                            />
                        )}

                        {/* Side Cart Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: isSideCartOpen ? 0 : '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-[80] flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <ShoppingCart className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase italic tracking-tighter">Seu Carrinho</h2>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{cart.length} ITENS SELECIONADOS</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsSideCartOpen(false)}
                                    className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center transition-all"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {cart.map((item) => (
                                    <motion.div
                                        layout
                                        key={item.product.id}
                                        className="p-4 rounded-[1.5rem] bg-muted/30 border border-border/50 group hover:border-primary/30 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{item.product.name}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, -item.quantity)}
                                                className="text-muted-foreground hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 bg-background p-1 rounded-xl border border-border">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, -1)}
                                                    className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-all"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, 1)}
                                                    className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <span className="font-black text-primary">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="p-8 bg-muted/40 border-t border-border space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>R$ {total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-black text-xl uppercase italic">Total</span>
                                        <span className="font-black text-3xl text-primary italic tracking-tight">R$ {total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => { setIsSideCartOpen(false); setStep('payment'); }}
                                    className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-4 group"
                                >
                                    CONFIRMAR PEDIDO
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
