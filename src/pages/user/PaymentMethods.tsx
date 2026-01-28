import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Trash2, CheckCircle, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface SavedCard {
    id: string;
    number: string;
    expiry: string;
    holderName: string;
    brand: string;
    isDefault: boolean;
}

export function UserPaymentMethodsPage() {
    const [cards, setCards] = useState<SavedCard[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newCard, setNewCard] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const stored = localStorage.getItem('user_payment_methods');
        if (stored) setCards(JSON.parse(stored));
    }, []);

    const saveCards = (updatedCards: SavedCard[]) => {
        setCards(updatedCards);
        localStorage.setItem('user_payment_methods', JSON.stringify(updatedCards));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!/^\d{16}$/.test(newCard.number.replace(/\s/g, ''))) newErrors.number = 'Número de cartão inválido (16 dígitos)';
        if (!/^\d{2}\/\d{2}$/.test(newCard.expiry)) newErrors.expiry = 'Formato inválido (MM/AA)';
        if (!/^\d{3}$/.test(newCard.cvv)) newErrors.cvv = 'CVV inválido (3 dígitos)';
        if (newCard.name.length < 5) newErrors.name = 'Nome muito curto';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const card: SavedCard = {
            id: Date.now().toString(),
            number: `**** **** **** ${newCard.number.slice(-4)}`,
            expiry: newCard.expiry,
            holderName: newCard.name.toUpperCase(),
            brand: 'Visa', // Simulating brand detection
            isDefault: cards.length === 0
        };

        saveCards([...cards, card]);
        setIsAdding(false);
        setNewCard({ number: '', expiry: '', cvv: '', name: '' });
    };

    const removeCard = (id: string) => {
        const updated = cards.filter(c => c.id !== id);
        if (updated.length > 0 && !updated.some(c => c.isDefault)) {
            updated[0].isDefault = true;
        }
        saveCards(updated);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Formas de Pagamento</h1>
                    <p className="text-muted-foreground mt-1">Gerencie seus cartões para pagamentos rápidos</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" /> Adicionar Cartão
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className="relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => removeCard(card.id)}
                                        className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive hover:text-white transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <CardContent className="pt-8 pb-6">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="p-3 bg-primary/10 rounded-xl">
                                            <CreditCard className="w-8 h-8 text-primary" />
                                        </div>
                                        {card.isDefault && (
                                            <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-2 py-1 rounded-full">Padrão</span>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-xl font-mono tracking-widest font-bold">{card.number}</p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black">Titular</p>
                                                <p className="font-bold">{card.holderName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-muted-foreground uppercase font-black">Validade</p>
                                                <p className="font-bold">{card.expiry}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {cards.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center bg-muted/20">
                        <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-bold">Nenhum cartão salvo</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mb-6">Adicione um cartão para facilitar seus pagamentos em empresas cadastradas.</p>
                        <Button variant="outline" onClick={() => setIsAdding(true)}>Começar agora</Button>
                    </div>
                )}
            </div>

            {/* Modal de Adição */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsAdding(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="relative w-full max-w-md"
                        >
                            <Card className="shadow-2xl border-primary/20">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-black italic uppercase italic">Novo Cartão</CardTitle>
                                        <CardDescription>Insira os dados do seu cartão com segurança</CardDescription>
                                    </div>
                                    <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-muted rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAddCard} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-muted-foreground">Nome no Cartão</label>
                                            <input
                                                className={`w-full p-3 rounded-xl border bg-background font-bold ${errors.name ? 'border-destructive' : 'border-input'}`}
                                                placeholder="NOME COMPLETO"
                                                value={newCard.name}
                                                onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                                            />
                                            {errors.name && <p className="text-[10px] text-destructive font-bold">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-muted-foreground">Número do Cartão</label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    className={`w-full pl-10 p-3 rounded-xl border bg-background font-mono ${errors.number ? 'border-destructive' : 'border-input'}`}
                                                    placeholder="0000 0000 0000 0000"
                                                    maxLength={19}
                                                    value={newCard.number}
                                                    onChange={e => setNewCard({ ...newCard, number: e.target.value })}
                                                />
                                            </div>
                                            {errors.number && <p className="text-[10px] text-destructive font-bold">{errors.number}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-muted-foreground">Validade</label>
                                                <input
                                                    className={`w-full p-3 rounded-xl border bg-background text-center ${errors.expiry ? 'border-destructive' : 'border-input'}`}
                                                    placeholder="MM/AA"
                                                    maxLength={5}
                                                    value={newCard.expiry}
                                                    onChange={e => setNewCard({ ...newCard, expiry: e.target.value })}
                                                />
                                                {errors.expiry && <p className="text-[10px] text-destructive font-bold">{errors.expiry}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-muted-foreground">CVV</label>
                                                <input
                                                    className={`w-full p-3 rounded-xl border bg-background text-center ${errors.cvv ? 'border-destructive' : 'border-input'}`}
                                                    placeholder="123"
                                                    maxLength={3}
                                                    value={newCard.cvv}
                                                    onChange={e => setNewCard({ ...newCard, cvv: e.target.value })}
                                                />
                                                {errors.cvv && <p className="text-[10px] text-destructive font-bold">{errors.cvv}</p>}
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center gap-3 text-[10px] text-muted-foreground bg-muted/30 p-3 rounded-xl">
                                            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                                            Seus dados são criptografados e processados de forma segura conforme normas internacionais.
                                        </div>

                                        <Button type="submit" className="w-full h-14 text-lg font-black uppercase italic shadow-xl shadow-primary/20">
                                            Salvar Cartão
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
