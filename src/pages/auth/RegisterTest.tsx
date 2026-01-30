import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    Mail,
    Lock,
    Phone,
    Fingerprint,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    FileText,
    Beaker
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { validateCPF, formatCPF, validateEmail, formatPhone } from '../../utils/validators';
import { db } from '../../services/db';
import { Modal } from '../../components/ui/Modal';

export function RegisterTest() {
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [terms, setTerms] = useState({ content: '', version: '', updatedAt: '' });

    // Form State
    const [formData, setFormData] = useState({
        name: 'Usuário de Teste',
        email: 'teste@sepi.pro',
        phone: '(11) 98491-0000',
        cpf: '000.000.000-00',
        password: 'password123',
        confirmPassword: 'password123',
        acceptedTerms: true
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [verificationCode, setVerificationCode] = useState('8491');
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const platformTerms = db.getPlatformTerms();
        setTerms(platformTerms);
    }, []);

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleVerify = async () => {
        setIsLoading(true);
        // Instant verification with test code
        setTimeout(() => {
            if (step === 2) {
                setStep(3);
                setVerificationCode('8491');
            } else if (step === 3) {
                handleFinalRegister();
            }
            setIsLoading(false);
        }, 500);
    };

    const handleFinalRegister = async () => {
        try {
            await register({
                name: formData.name,
                email: formData.email,
                cpf: formData.cpf,
                phone: formData.phone,
                password: formData.password,
                acceptedTerms: true,
                acceptedTermsAt: new Date().toISOString()
            });
            setIsVerified(true);
            setStep(4);
        } catch (error) {
            setErrors({ general: 'Erro ao finalizar cadastro' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-50 via-background to-blue-50">
            <div className="fixed top-4 left-4 z-50">
                <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-2 rounded-full font-black flex items-center gap-2 shadow-xl animate-bounce">
                    <Beaker className="w-5 h-5" />
                    MODO DE TESTE ATIVO
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <Card className="overflow-hidden border-yellow-200 border-2 shadow-2xl">
                    <CardHeader className="text-center bg-yellow-50/50 pb-8">
                        <div className="flex justify-center mb-4 pt-4">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg">
                                <UserPlus className="w-8 h-8 text-primary-foreground transform -rotate-12" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black">Cadastro de Teste</CardTitle>
                        <CardDescription>Validação rápida com o código <span className="font-black text-primary">8491</span></CardDescription>

                        {/* Progress Stepper */}
                        <div className="flex items-center justify-center mt-6 gap-2">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-primary' : 'w-4 bg-primary/20'
                                        }`}
                                />
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Nome Completo"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="CPF"
                                            value={formData.cpf}
                                            onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="E-mail"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="Celular"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
                                        <div className="pt-0.5">
                                            <input
                                                type="checkbox"
                                                id="terms"
                                                checked={formData.acceptedTerms}
                                                onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                                                className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary/20"
                                            />
                                        </div>
                                        <label htmlFor="terms" className="text-sm leading-relaxed">
                                            Eu li e aceito o <button
                                                type="button"
                                                onClick={() => setShowTerms(true)}
                                                className="text-primary font-bold hover:underline"
                                            >
                                                Contrato de Uso da Plataforma
                                            </button> de acordo com a LGPD.
                                        </label>
                                    </div>

                                    <Button onClick={handleNext} className="w-full h-12 text-lg font-bold group">
                                        Próximo Passo (Bypass)
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            )}

                            {(step === 2 || step === 3) && (
                                <motion.div
                                    key="step-verify"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="text-center space-y-6"
                                >
                                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                                        {step === 2 ? <Mail className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold">Verificação de Teste</h3>
                                        <p className="text-muted-foreground mt-2">
                                            Use o código mágico para os testes:<br />
                                            <span className="font-black text-3xl text-primary tracking-widest mt-2 block">
                                                8491
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex justify-center gap-2">
                                        <Input
                                            className="text-center text-2xl font-black tracking-[0.5em] max-w-[200px]"
                                            maxLength={4}
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleVerify}
                                        className="w-full h-12 font-bold"
                                        isLoading={isLoading}
                                    >
                                        Validar com Código de Teste
                                    </Button>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="success"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-8 space-y-6"
                                >
                                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-lg">
                                        <CheckCircle2 className="w-12 h-12" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black text-green-700">Teste Concluído!</h3>
                                        <p className="text-muted-foreground mt-2">
                                            O cadastro foi realizado com sucesso usando o bypass de desenvolvedor.
                                        </p>
                                    </div>

                                    <Button className="w-full h-12 text-lg font-bold" onClick={() => window.location.hash = '/'}>
                                        Ir para o Login
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Terms Modal (Dynamic) */}
            <Modal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
                title="Contrato de Uso da Plataforma"
                maxWidth="max-w-2xl"
            >
                <div className="space-y-4">
                    <div className="p-6 rounded-xl bg-muted/30 border max-h-[400px] overflow-y-auto prose prose-sm prose-primary custom-scrollbar">
                        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <FileText className="w-4 h-4" />
                            Versão {terms.version} • Atualizado em {new Date(terms.updatedAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div dangerouslySetInnerHTML={{
                            __html: terms.content
                                .replace(/^# (.*$)/gim, '<h1 class="text-xl font-black mb-4">$1</h1>')
                                .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mb-3">$1</h2>')
                                .replace(/^\d\. (.*$)/gim, '<p class="mb-2"><strong>$0</strong></p>')
                                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                                .replace(/\n/g, '<br/>')
                        }} />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
