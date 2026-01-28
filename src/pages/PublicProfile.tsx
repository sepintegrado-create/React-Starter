import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Instagram, Facebook, Linkedin, MessageSquare, Mail, Phone, Link as LinkIcon, Star, MapPin, Share2, ShoppingCart, Plus, Minus, Trash2, ChevronRight, PackagePlus, Wallet, CreditCard, CheckCircle2, ArrowLeft, Info } from 'lucide-react';
import { db, PublicOrder } from '../services/db';
import { Button } from '../components/ui/Button';
import { Product, UserRole } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export function PublicProfilePage() {
    const [settings, setSettings] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('Postagens');
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [step, setStep] = useState<'profile' | 'payment' | 'receipt'>('profile');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [balance, setBalance] = useState(0);
    const [orderId, setOrderId] = useState('');
    const [isSideCartOpen, setIsSideCartOpen] = useState(false);
    const { user, currentRole } = useAuth();

    const isOwner = user && company && (
        user.id === company.ownerId ||
        (currentRole === UserRole.COMPANY_ADMIN && user.companies?.includes(company.id))
    );

    useEffect(() => {
        const hash = window.location.hash;
        const queryParams = new URLSearchParams(hash.split('?')[1]);
        const companyId = queryParams.get('id');

        if (companyId) {
            const companyData = db.getCompanyById(companyId);
            setCompany(companyData);
            setSettings({
                ...companyData.settings,
                name: companyData.tradeName,
                email: companyData.settings.socialLinks?.whatsapp || 'contato@empresa.com', // fallback
                supportUrl: `www.sepi.pro/${companyId}`
            });
            // Load products for this company
            const allProducts = db.getProducts();
            const companyProducts = allProducts.filter(p => p.isActive && p.companyId === companyId);
            setProducts(companyProducts);
        } else {
            setSettings(db.getPlatformSettings());
        }

        const storedBalance = localStorage.getItem('sepi_user_balance');
        if (storedBalance) setBalance(parseFloat(storedBalance));
    }, []);

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

    const handleCheckout = () => {
        setIsSideCartOpen(false);
        setStep('payment');
    };

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
            companyId: company.id,
            userId: user?.id,
            targetType: 'table', // Default for now
            targetNumber: '1',    // Default for now
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
        setStep('receipt');
        setCart([]);
    };

    if (!settings) return null;

    const tabs = ['Postagens', 'Produtos', 'Novidades', 'Galeria'];
    const categories = ['Todos', ...Array.from(new Set(products.map(p => p.categoryId || 'Premium')))];
    const filteredProducts = selectedCategory === 'Todos' ? products : products.filter(p => p.categoryId === selectedCategory);

    return (
        <div className="min-h-screen bg-background pb-32">
            <AnimatePresence mode="wait">
                {step === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Social Header */}
                        <div className="relative">
                            {/* Cover Photo */}
                            <div className="h-64 md:h-96 w-full relative overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5">
                                <div className="absolute inset-0 bg-black/20" />
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80"
                                    className="w-full h-full object-cover"
                                    alt="Background"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
                            </div>

                            {/* Profile Stats & Actions */}
                            <div className="max-w-5xl mx-auto px-6 relative -mt-20">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="flex items-end gap-6">
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-white p-2 shadow-2xl border border-border"
                                        >
                                            <div className="w-full h-full rounded-[2rem] bg-primary flex items-center justify-center text-primary-foreground text-5xl font-black italic">
                                                {settings.name.charAt(0)}
                                            </div>
                                        </motion.div>
                                        <div className="mb-4">
                                            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter uppercase italic">{settings.name}</h1>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1 text-primary font-bold">
                                                    <Star className="w-4 h-4 fill-primary" />
                                                    <span>4.9</span>
                                                </div>
                                                <div className="h-4 w-[1px] bg-border" />
                                                <div className="text-muted-foreground font-medium">@sepi_platform</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mb-4">
                                        <Button size="lg" className="rounded-2xl px-8 font-black shadow-xl shadow-primary/20">
                                            <MessageSquare className="w-5 h-5 mr-2" />
                                            MENSAGEM
                                        </Button>
                                        <Button size="lg" variant="outline" className="rounded-2xl w-14 p-0 border-border">
                                            <Share2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Owner Management Quick Access */}
                                {isOwner && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-12 group"
                                    >
                                        <div className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-primary/[0.08] transition-all duration-500">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                                    <PackagePlus className="w-8 h-8 text-primary-foreground" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-foreground mb-1">Gerenciar Seus Produtos</h2>
                                                    <p className="text-muted-foreground font-medium italic">Adicione novos itens ou atualize seu estoque rapidamente aqui.</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => window.location.hash = '#/company/products'}
                                                size="lg"
                                                className="w-full md:w-auto px-12 h-16 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                ADICIONAR NOVO PRODUTO
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Content Tabs Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                                    {/* Main Feed */}
                                    <div className="lg:col-span-3 space-y-8">
                                        {/* Tab Navigation */}
                                        <div className="bg-card rounded-[2rem] p-2 border border-border overflow-hidden">
                                            <div className="flex p-4 gap-4 overflow-x-auto no-scrollbar">
                                                {tabs.map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setActiveTab(tab)}
                                                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'
                                                            }`}
                                                    >
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tab Content */}
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'Postagens' && (
                                                <motion.div
                                                    key="postagens"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    className="grid grid-cols-2 gap-4"
                                                >
                                                    {[1, 2, 3, 4].map(idx => (
                                                        <motion.div
                                                            key={idx}
                                                            whileHover={{ y: -4 }}
                                                            className="aspect-square rounded-[2rem] bg-muted overflow-hidden border border-border group"
                                                        >
                                                            <img
                                                                src={`https://images.unsplash.com/photo-${1500000000000 + idx * 100000}?w=600&q=80`}
                                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                                alt="Post"
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            )}

                                            {activeTab === 'Produtos' && (
                                                <motion.div
                                                    key="produtos"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    className="space-y-8"
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                        <div>
                                                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">Produtos para Venda</h2>
                                                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Confira nossas ofertas exclusivas</p>
                                                        </div>
                                                        {isOwner && (
                                                            <Button
                                                                onClick={() => window.location.hash = '#/company/products'}
                                                                className="rounded-2xl h-14 px-8 font-black shadow-xl shadow-primary/20 bg-primary text-primary-foreground hover:scale-105 transition-transform"
                                                            >
                                                                <PackagePlus className="w-5 h-5 mr-2" />
                                                                ADICIONAR PRODUTO
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Category Selector */}
                                                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                                                        {categories.map(cat => (
                                                            <button
                                                                key={cat}
                                                                onClick={() => setSelectedCategory(cat)}
                                                                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat
                                                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                                                                    : 'bg-muted text-muted-foreground hover:bg-accent'
                                                                    }`}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {filteredProducts.length === 0 ? (
                                                        <div className="text-center py-24 bg-card rounded-[2.5rem] border border-dashed border-border">
                                                            <ShoppingCart className="w-20 h-20 mx-auto mb-6 opacity-20 text-primary" />
                                                            <p className="text-xl font-black uppercase italic tracking-tight text-muted-foreground">Nenhum produto disponível no momento</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-6">
                                                            {filteredProducts.map(product => (
                                                                <motion.div
                                                                    key={product.id}
                                                                    layout
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className="group relative bg-card rounded-[2.5rem] overflow-hidden border border-border shadow-sm hover:shadow-2xl transition-all duration-500"
                                                                >
                                                                    <div className="flex flex-col sm:flex-row gap-6 p-6">
                                                                        <div className="w-full sm:w-48 h-48 rounded-[2rem] overflow-hidden flex-shrink-0 relative bg-muted">
                                                                            <img
                                                                                src={product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop'}
                                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                                alt={product.name}
                                                                            />
                                                                            <div className="absolute top-4 left-4 px-4 py-2 rounded-2xl bg-black/70 backdrop-blur-xl text-sm font-black text-white uppercase tracking-tighter shadow-lg">
                                                                                R$ {product.price.toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1 flex flex-col justify-between py-2">
                                                                            <div className="space-y-3">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-[0.2em]">{product.categoryId || 'Premium'}</span>
                                                                                </div>
                                                                                <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors tracking-tight italic uppercase">{product.name}</h3>
                                                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                                                                                    {product.description || 'Um produto de excelência, selecionado especialmente para você com os melhores ingredientes do mercado.'}
                                                                                </p>
                                                                            </div>
                                                                            <div className="flex items-center justify-between mt-8">
                                                                                {cart.find(i => i.product.id === product.id) ? (
                                                                                    <div className="flex items-center gap-4 bg-muted/50 rounded-[1.5rem] p-2 pr-6">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <button
                                                                                                onClick={() => updateQuantity(product.id, -1)}
                                                                                                className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all font-bold"
                                                                                            >
                                                                                                <Minus className="w-5 h-5" />
                                                                                            </button>
                                                                                            <span className="w-12 text-center font-black text-lg tabular-nums">
                                                                                                {cart.find(i => i.product.id === product.id)?.quantity}
                                                                                            </span>
                                                                                            <button
                                                                                                onClick={() => updateQuantity(product.id, 1)}
                                                                                                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-primary/30"
                                                                                            >
                                                                                                <Plus className="w-5 h-5" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <Button
                                                                                        size="lg"
                                                                                        onClick={() => addToCart(product)}
                                                                                        className="rounded-[1.5rem] h-14 px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all lg:w-fit w-full"
                                                                                    >
                                                                                        Adicionar ao Carrinho
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {activeTab === 'Novidades' && (
                                                <motion.div
                                                    key="novidades"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    className="text-center py-24 bg-card rounded-[2.5rem] border border-border"
                                                >
                                                    <p className="text-xl font-black uppercase italic tracking-tight text-muted-foreground">Novidades em breve!</p>
                                                </motion.div>
                                            )}

                                            {activeTab === 'Galeria' && (
                                                <motion.div
                                                    key="galeria"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    className="grid grid-cols-2 md:grid-cols-3 gap-6"
                                                >
                                                    {[5, 6, 7, 8, 9, 10].map(idx => (
                                                        <motion.div
                                                            key={idx}
                                                            whileHover={{ y: -8, scale: 1.02 }}
                                                            className="aspect-square rounded-[2.5rem] bg-muted overflow-hidden border border-border group"
                                                        >
                                                            <img
                                                                src={`https://images.unsplash.com/photo-${1500000000000 + idx * 100000}?w=600&q=80`}
                                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                                                alt="Gallery"
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Bio Section - Framed Bottom Content */}
                                        <div className="mt-32 group">
                                            <section className="relative overflow-hidden bg-card rounded-[3rem] p-8 md:p-16 border border-border shadow-2xl">
                                                {/* Decorative background element */}
                                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

                                                <div className="relative flex flex-col lg:flex-row gap-16">
                                                    <div className="flex-1 space-y-10">
                                                        <div className="space-y-4">
                                                            <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground decoration-primary decoration-8 underline-offset-[12px]">Sobre {settings.name}</h3>
                                                            <div className="h-2 w-32 bg-primary rounded-full" />
                                                        </div>

                                                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-semibold italic border-l-8 border-primary/20 pl-8 py-2">
                                                            "{settings.welcomeMessage || settings.bio || 'Bem-vindo à nossa empresa! Estamos focados em entregar a melhor experiência e qualidade para nossos clientes em cada detalhe.'}"
                                                        </p>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                                            <div className="flex items-start gap-5 group/item cursor-default">
                                                                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover/item:bg-primary transition-all duration-300 group-hover/item:text-white shadow-lg">
                                                                    <MapPin className="w-7 h-7" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Sede Principal</p>
                                                                    <p className="font-bold text-lg">São Paulo, Brasil</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-5 group/item cursor-default">
                                                                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover/item:bg-primary transition-all duration-300 group-hover/item:text-white shadow-lg">
                                                                    <Mail className="w-7 h-7" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Contato Direto</p>
                                                                    <p className="font-bold text-lg truncate max-w-[250px]">{settings.email}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-5 group/item cursor-default">
                                                                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover/item:bg-primary transition-all duration-300 group-hover/item:text-white shadow-lg">
                                                                    <LinkIcon className="w-7 h-7" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Website Oficial</p>
                                                                    <p className="font-bold text-lg truncate max-w-[250px]">{settings.supportUrl?.replace('https://', '')}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-5 group/item cursor-default">
                                                                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover/item:bg-primary transition-all duration-300 group-hover/item:text-white shadow-lg">
                                                                    <Phone className="w-7 h-7" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">WhatsApp Business</p>
                                                                    <p className="font-bold text-lg">{settings.socialLinks?.whatsapp || '(11) 99999-9999'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="w-full lg:w-64 flex flex-col gap-6 pt-4 lg:pt-0">
                                                        <div className="space-y-2 text-center lg:text-left">
                                                            <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.3em]">Redes Sociais</p>
                                                            <div className="h-1 w-12 bg-border mx-auto lg:mx-0" />
                                                        </div>
                                                        <div className="flex flex-row lg:flex-col gap-4">
                                                            <a href={settings.socialLinks?.instagram || "#"} className="flex-1 h-16 rounded-3xl bg-muted flex items-center justify-center hover:bg-gradient-to-tr from-purple-600 to-pink-500 hover:text-white transition-all duration-500 shadow-md">
                                                                <Instagram className="w-8 h-8" />
                                                            </a>
                                                            <a href={settings.socialLinks?.facebook || "#"} className="flex-1 h-16 rounded-3xl bg-muted flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-500 shadow-md">
                                                                <Facebook className="w-8 h-8" />
                                                            </a>
                                                            <a href={settings.socialLinks?.linkedin || "#"} className="flex-1 h-16 rounded-3xl bg-muted flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-all duration-500 shadow-md">
                                                                <Linkedin className="w-8 h-8" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
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
                                                onClick={handleCheckout}
                                                className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-4 group"
                                            >
                                                FINALIZAR COMPRA
                                                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {step === 'payment' && (
                    <motion.div
                        key="payment"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="min-h-screen p-6"
                    >
                        <div className="max-w-xl mx-auto space-y-8 pt-12">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setStep('profile')}
                                    className="w-12 h-12 flex items-center justify-center bg-card rounded-2xl border border-border hover:bg-muted transition-all"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                                <h1 className="text-3xl font-black italic uppercase tracking-tighter">PAGAMENTO</h1>
                            </div>

                            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-gradient-to-br from-card to-muted/30 overflow-hidden">
                                <CardHeader className="p-8 pb-0">
                                    <CardTitle className="text-xs font-black uppercase text-primary tracking-[0.3em]">Resumo do Pedido</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item.product.id} className="flex justify-between items-center text-sm font-bold">
                                                <span className="text-muted-foreground italic">{item.quantity}x {item.product.name}</span>
                                                <span className="tabular-nums">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-[1px] bg-border" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-xl uppercase italic">Total a Pagar</span>
                                        <span className="font-black text-3xl text-primary italic tracking-tight">R$ {total.toFixed(2)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] px-2">Escolha como pagar</p>

                                <button
                                    onClick={() => handlePlaceOrder('balance')}
                                    className="w-full p-8 rounded-[2.5rem] border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center justify-between group shadow-lg"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-orange-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                            <Wallet className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="font-black italic uppercase text-lg tracking-tighter">Usar Saldo</p>
                                            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">Saldo disponível: R$ {balance.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-white" />
                                    </div>
                                </button>

                                <button
                                    onClick={() => handlePlaceOrder('new_card')}
                                    className="w-full p-8 rounded-[2.5rem] border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center justify-between group shadow-lg"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                            <CreditCard className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="font-black italic uppercase text-lg tracking-tighter">Cartão de Crédito</p>
                                            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">Pagar agora via checkout seguro</p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-white" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'receipt' && (
                    <motion.div
                        key="receipt"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background"
                    >
                        <motion.div
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            className="bg-card p-12 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.2)] max-w-md w-full border border-border relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-3 bg-primary" />

                            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircle2 className="w-12 h-12 text-primary" />
                            </div>

                            <h2 className="text-3xl font-black mb-2 italic uppercase tracking-tighter">PAGO COM SUCESSO!</h2>
                            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-10">Apresente o código abaixo ao atendente</p>

                            <div className="bg-white p-6 rounded-[3rem] border-4 border-muted inline-block shadow-2xl mb-10 transform hover:scale-105 transition-transform duration-500">
                                <QRCodeSVG value={`ORDER-RECEIPT-${orderId}`} size={220} level="H" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="p-4 rounded-3xl bg-muted/50 border border-border">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">ID PEDIDO</p>
                                    <p className="text-sm font-black italic">#{orderId.slice(-6)}</p>
                                </div>
                                <div className="p-4 rounded-3xl bg-muted/50 border border-border">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">LOCAL</p>
                                    <p className="text-sm font-black italic">Balcão/Mesa</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setStep('profile')}
                                size="lg"
                                className="w-full h-16 rounded-2xl font-black uppercase italic text-lg shadow-xl shadow-primary/20"
                            >
                                Voltar ao Perfil
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
