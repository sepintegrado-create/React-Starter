import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, QrCode, CheckCircle2, ArrowLeft, Wallet, ShieldCheck, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';

export function AddCreditPage() {
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'input' | 'payment' | 'success'>('input');
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem('sepi_user_balance');
        if (stored) setBalance(parseFloat(stored));
    }, []);

    const handleGenerateQR = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;
        setStep('payment');
    };

    const confirmPayment = () => {
        const newBalance = balance + parseFloat(amount);
        setBalance(newBalance);
        localStorage.setItem('sepi_user_balance', newBalance.toString());
        setStep('success');
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => step === 'payment' ? setStep('input') : window.location.hash = '#/'}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Adicionar Crédito</h1>
                    <p className="text-muted-foreground text-sm">Abasteça seu saldo para consumos rápidos</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 'input' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="p-3 bg-primary/10 rounded-2xl">
                                        <Wallet className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground">Saldo Atual</p>
                                        <p className="text-xl font-black text-primary italic">R$ {balance.toFixed(2)}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleGenerateQR} className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Quanto deseja adicionar?</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-2xl text-muted-foreground">R$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                className="w-full pl-14 p-6 rounded-[2rem] border-2 border-input focus:border-primary bg-background text-3xl font-black italic outline-none transition-all"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[20, 50, 100].map(val => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setAmount(val.toString())}
                                                className={`p-4 rounded-2xl border-2 font-black italic transition-all ${parseFloat(amount) === val ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' : 'border-border hover:border-primary/50'}`}
                                            >
                                                +R$ {val}
                                            </button>
                                        ))}
                                    </div>

                                    <Button type="submit" className="w-full h-16 text-xl font-black uppercase italic rounded-3xl shadow-xl shadow-primary/20">
                                        Gerar QR Code PIX
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 'payment' && (
                    <motion.div
                        key="payment"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <Card className="text-center overflow-hidden">
                            <div className="bg-primary/5 p-8 border-b border-border">
                                <div className="bg-white p-6 rounded-[3rem] border-4 border-primary/20 inline-block shadow-2xl mb-4">
                                    <QRCodeSVG value={`PIX-PAY-REF-${Date.now()}`} size={200} />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase">R$ {parseFloat(amount).toFixed(2)}</h3>
                                <p className="text-muted-foreground font-medium">Escaneie o QR Code acima para pagar</p>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-left p-4 rounded-2xl bg-muted/50 border border-border">
                                        <Info className="w-5 h-5 text-primary shrink-0" />
                                        <p className="text-xs text-muted-foreground font-medium">O saldo será creditado instantaneamente após a confirmação do banco.</p>
                                    </div>

                                    {/* Mock confirmation button */}
                                    <Button onClick={confirmPayment} className="w-full h-16 text-lg font-black uppercase italic rounded-3xl">
                                        Confirmar Pagamento (MOCK)
                                    </Button>

                                    <p className="text-[10px] text-muted-foreground uppercase font-black flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Pagamento 100% Seguro via PIX
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="text-center p-12 space-y-8 bg-green-50 border-green-200">
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-200">
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black italic uppercase text-green-800">Crédito Adicionado!</h2>
                                <p className="text-green-700 font-medium mt-2">Seu novo saldo é de <span className="font-black">R$ {balance.toFixed(2)}</span></p>
                            </div>
                            <Button
                                onClick={() => window.location.hash = '#/'}
                                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black uppercase italic rounded-2xl"
                            >
                                Voltar ao Início
                            </Button>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
