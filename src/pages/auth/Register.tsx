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
    FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { validateCPF, formatCPF, validateEmail, formatPhone } from '../../utils/validators';
import { db } from '../../services/db';
import { Modal } from '../../components/ui/Modal';

export function Register() {
    const { register, verify2FA } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [terms, setTerms] = useState({ content: '', version: '', updatedAt: '' });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        password: '',
        confirmPassword: '',
        acceptedTerms: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const platformTerms = db.getPlatformTerms();
        setTerms(platformTerms);
    }, []);

    const handleNext = () => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.name) newErrors.name = 'Nome é obrigatório';
            if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
            else if (!validateCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';

            if (!formData.email) newErrors.email = 'Email é obrigatório';
            else if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';

            if (!formData.phone) newErrors.phone = 'Celular é obrigatório';

            if (!formData.password) newErrors.password = 'Senha é obrigatória';
            else if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'As senhas não coincidem';
            }

            if (!formData.acceptedTerms) {
                newErrors.terms = 'Você precisa aceitar os termos de uso';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setStep(step + 1);

        // Simulate sending code
        if (step === 1) {
            console.log('Sending verification code to:', formData.email);
        } else if (step === 2) {
            console.log('Sending verification code to:', formData.phone);
        }
    };

    const handleVerify = async () => {
        if (verificationCode.length !== 6) {
            setErrors({ code: 'O código deve ter 6 dígitos' });
            return;
        }

        setIsLoading(true);
        // Simulate verification
        setTimeout(() => {
            if (step === 2) {
                setStep(3); // Go to phone verification
                setVerificationCode('');
            } else if (step === 3) {
                handleFinalRegister();
            }
            setIsLoading(false);
        }, 1500);
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <Card className="overflow-hidden">
                    <CardHeader className="text-center bg-muted/30 pb-8">
                        <div className="flex justify-center mb-4 pt-4">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg">
                                <UserPlus className="w-8 h-8 text-primary-foreground transform -rotate-12" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black">Crie sua conta</CardTitle>
                        <CardDescription>Junte-se a centenas de empresas no SEPI</CardDescription>

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
                                            placeholder="Ex: João Silva"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            error={errors.name}
                                            required
                                        />
                                        <Input
                                            label="CPF"
                                            placeholder="000.000.000-00"
                                            value={formData.cpf}
                                            onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                                            error={errors.cpf}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="E-mail"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            error={errors.email}
                                            required
                                        />
                                        <Input
                                            label="Celular"
                                            placeholder="(00) 00000-0000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                            error={errors.phone}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Senha"
                                            type="password"
                                            placeholder="••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            error={errors.password}
                                            required
                                        />
                                        <Input
                                            label="Confirmar Senha"
                                            type="password"
                                            placeholder="••••••"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            error={errors.confirmPassword}
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
                                    {errors.terms && <p className="text-xs text-destructive mt-1">{errors.terms}</p>}

                                    <Button onClick={handleNext} className="w-full h-12 text-lg font-bold group">
                                        Próximo Passo
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
                                        <h3 className="text-xl font-bold">Verifique seu {step === 2 ? 'e-mail' : 'celular'}</h3>
                                        <p className="text-muted-foreground mt-2">
                                            Enviamos um código de 6 dígitos para:<br />
                                            <span className="font-bold text-foreground">
                                                {step === 2 ? formData.email : formData.phone}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex justify-center gap-2">
                                        <Input
                                            className="text-center text-2xl font-black tracking-[1em] max-w-[200px]"
                                            maxLength={6}
                                            placeholder="000000"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                            error={errors.code}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            onClick={handleVerify}
                                            className="w-full h-12 font-bold"
                                            isLoading={isLoading}
                                        >
                                            Verificar e Continuar
                                        </Button>
                                        <button
                                            onClick={() => setStep(step - 1)}
                                            className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center mx-auto"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                                        </button>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Não recebeu? <button className="text-primary font-bold hover:underline">Reenviar código</button>
                                    </p>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="success"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-8 space-y-6"
                                >
                                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <CheckCircle2 className="w-12 h-12" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black">Cadastro Concluído!</h3>
                                        <p className="text-muted-foreground mt-2">
                                            Sua conta foi criada com sucesso e seu CPF foi validado em nossa base.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-muted/50 text-left space-y-2">
                                        <div className="flex items-center gap-3 text-sm">
                                            <ShieldCheck className="w-5 h-5 text-primary" />
                                            <span>2FA Habilitado e Verificado</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Fingerprint className="w-5 h-5 text-primary" />
                                            <span>CPF {formData.cpf} Validado</span>
                                        </div>
                                    </div>

                                    <Button className="w-full h-12 text-lg font-bold" onClick={() => window.location.hash = '/'}>
                                        Ir para o Login
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>

                    <CardFooter className="justify-center border-t py-4">
                        <p className="text-sm text-muted-foreground">
                            Já tem uma conta? <a href="#/" className="text-primary font-bold hover:underline">ENTRAR</a>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>

            {/* Terms Modal */}
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
                        <div dangerouslySetInnerHTML={{ __html: terms.content.replace(/\n/g, '<br/>') }} />
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={() => {
                            setFormData({ ...formData, acceptedTerms: true });
                            setShowTerms(false);
                        }}>
                            Eu li e concordo
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
