import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Wallet, Landmark } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function PaymentPage() {
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'bank_slip'>('credit_card');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);
        // Simulate payment process
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="text-center py-8">
                        <CardContent className="space-y-6">
                            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black">Pagamento Aprovado!</h2>
                                <p className="text-muted-foreground">
                                    Sua assinatura foi ativada com sucesso. Você já pode acessar o painel da sua empresa.
                                </p>
                            </div>
                            <Button className="w-full h-12 text-lg font-bold" onClick={() => window.location.hash = '#/company'}>
                                Acessar Dashboard
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Pagamento da Assinatura</h1>
                    <p className="text-muted-foreground mt-2">Finalize o pagamento para ativar sua empresa no SEPI</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Payment Methods */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Método de Pagamento</CardTitle>
                            <CardDescription>Escolha como deseja pagar</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}>
                                    <input type="radio" className="hidden" name="method" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} />
                                    <CreditCard className={`w-8 h-8 ${paymentMethod === 'credit_card' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className="font-bold text-xs uppercase">Cartão</span>
                                </label>
                                <label className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}>
                                    <input type="radio" className="hidden" name="method" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} />
                                    <Wallet className={`w-8 h-8 ${paymentMethod === 'pix' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className="font-bold text-xs uppercase">PIX</span>
                                </label>
                                <label className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'bank_slip' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}>
                                    <input type="radio" className="hidden" name="method" checked={paymentMethod === 'bank_slip'} onChange={() => setPaymentMethod('bank_slip')} />
                                    <Landmark className={`w-8 h-8 ${paymentMethod === 'bank_slip' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className="font-bold text-xs uppercase">Boleto</span>
                                </label>
                            </div>

                            {paymentMethod === 'credit_card' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    <Input label="Número do Cartão" placeholder="0000 0000 0000 0000" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Validade" placeholder="MM/AA" />
                                        <Input label="CVV" placeholder="123" />
                                    </div>
                                    <Input label="Nome no Cartão" placeholder="João da Silva" />
                                </motion.div>
                            )}

                            {paymentMethod === 'pix' && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 space-y-4">
                                    <div className="w-48 h-48 bg-muted rounded-xl border flex items-center justify-center">
                                        <span className="text-xs text-muted-foreground font-bold">QR CODE PIX</span>
                                    </div>
                                    <p className="text-sm text-center text-muted-foreground">O código expira em 30 minutos.</p>
                                    <Button variant="outline" className="w-full">Copiar Código PIX</Button>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Resumo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Plano Profissional</span>
                                <span className="font-bold">R$ 99,90</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Ciclo</span>
                                <span className="font-bold">Mensal</span>
                            </div>
                            <div className="pt-4 border-t flex justify-between items-center">
                                <span className="font-black uppercase italic">Total</span>
                                <span className="text-2xl font-black text-primary italic">R$ 99,90</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-3">
                            <Button className="w-full h-12 font-bold" onClick={handlePayment} isLoading={isLoading}>
                                Finalizar Pagamento
                            </Button>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black">
                                <ShieldCheck className="w-3 h-3" /> Pagamento 100% Seguro
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
