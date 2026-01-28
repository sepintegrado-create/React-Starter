import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Package,
    Check,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Sparkles,
    Zap,
    Crown,
    UserPlus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { validateCNPJ, formatCNPJ, formatPhone } from '../../utils/validators';
import { db } from '../../services/db';
import { SubscriptionPlan } from '../../types/user';



export function RegisterCompany() {
    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<string>('');

    React.useEffect(() => {
        const loadedPlans = db.getPlans();
        setPlans(loadedPlans);
        if (loadedPlans.length > 0) {
            setSelectedPlan(loadedPlans[1]?.id || loadedPlans[0]?.id);
        }
    }, []);
    const [formData, setFormData] = useState({
        cnpj: '',
        name: '',
        tradeName: '',
        email: '',
        phone: '',
        sellerCode: '',
        addressStreet: '',
        addressNumber: '',
        addressCity: '',
        addressState: '',
        addressZipCode: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleNext = () => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            // Validate plan selection
            if (!selectedPlan) {
                newErrors.plan = 'Selecione um plano';
            }
        } else if (step === 2) {
            // Validate company data
            if (!formData.cnpj) newErrors.cnpj = 'CNPJ é obrigatório';
            else if (!validateCNPJ(formData.cnpj)) newErrors.cnpj = 'CNPJ inválido';

            if (!formData.name) newErrors.name = 'Razão Social é obrigatória';
            if (!formData.tradeName) newErrors.tradeName = 'Nome Fantasia é obrigatório';
            if (!formData.email) newErrors.email = 'Email é obrigatório';
            if (!formData.phone) newErrors.phone = 'Telefone é obrigatório';
            if (!formData.addressStreet) newErrors.addressStreet = 'Endereço é obrigatório';
            if (!formData.addressNumber) newErrors.addressNumber = 'Número é obrigatório';
            if (!formData.addressCity) newErrors.addressCity = 'Cidade é obrigatória';
            if (!formData.addressState) newErrors.addressState = 'Estado é obrigatório';
            if (!formData.addressZipCode) newErrors.addressZipCode = 'CEP é obrigatório';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        if (step < 3) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        console.log('Registering company:', { ...formData, planId: selectedPlan });
        // Redirect to payment page instead of just showing success
        window.location.hash = '#/auth/payment';
    };

    const selectedPlanData = plans.find(p => p.id === selectedPlan);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-6xl"
            >
                <Card className="overflow-hidden">
                    <CardHeader className="text-center bg-muted/30 pb-8">
                        <div className="flex justify-center mb-4 pt-4">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg">
                                <Building2 className="w-8 h-8 text-primary-foreground transform -rotate-12" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black">Cadastrar Empresa</CardTitle>
                        <CardDescription>Configure sua empresa no SEPI em 3 passos</CardDescription>

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
                            {/* Step 1: Select Plan */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-xl font-bold mb-2">Escolha seu Plano</h3>
                                        <p className="text-muted-foreground">Selecione o plano ideal para sua empresa</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {plans.map((plan) => (
                                            <motion.div
                                                key={plan.id}
                                                whileHover={{ scale: 1.02 }}
                                                className="relative"
                                            >
                                                {plan.popular && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow-lg">
                                                            <Sparkles className="w-3 h-3" />
                                                            Mais Popular
                                                        </div>
                                                    </div>
                                                )}
                                                <Card
                                                    className={`cursor-pointer transition-all h-full ${selectedPlan === plan.id
                                                        ? 'border-primary border-2 shadow-lg shadow-primary/20'
                                                        : 'hover:border-primary/50'
                                                        }`}
                                                    onClick={() => setSelectedPlan(plan.id)}
                                                >
                                                    <CardHeader>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                                                            {selectedPlan === plan.id && (
                                                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                                    <Check className="w-4 h-4 text-primary-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <CardDescription className="text-xs">{plan.description}</CardDescription>
                                                        <div className="mt-4">
                                                            <span className="text-3xl font-black text-primary">
                                                                R$ {plan.price.toFixed(2)}
                                                            </span>
                                                            <span className="text-muted-foreground text-sm">/mês</span>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <ul className="space-y-2">
                                                            {plan.features.map((feature, idx) => (
                                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${feature.enabled ? 'text-green-600' : 'text-muted-foreground'}`} />
                                                                    <span className={feature.enabled ? '' : 'text-muted-foreground line-through'}>{feature.name}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {errors.plan && <p className="text-xs text-destructive text-center">{errors.plan}</p>}

                                    <Button onClick={handleNext} className="w-full h-12 text-lg font-bold group">
                                        Continuar com {selectedPlanData?.name}
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            )}

                            {/* Step 2: Company Data */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold mb-2">Dados da Empresa</h3>
                                        <p className="text-muted-foreground text-sm">Preencha as informações da sua empresa</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="CNPJ"
                                            placeholder="00.000.000/0000-00"
                                            value={formData.cnpj}
                                            onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                                            error={errors.cnpj}
                                            required
                                        />
                                        <Input
                                            label="Razão Social"
                                            placeholder="Empresa LTDA"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            error={errors.name}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Nome Fantasia"
                                            placeholder="Minha Empresa"
                                            value={formData.tradeName}
                                            onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                                            error={errors.tradeName}
                                            required
                                        />
                                        <Input
                                            label="Email"
                                            type="email"
                                            placeholder="contato@empresa.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            error={errors.email}
                                            required
                                        />
                                    </div>

                                    <Input
                                        label="Telefone"
                                        placeholder="(00) 0000-0000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                        error={errors.phone}
                                        required
                                    />

                                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                        <div className="flex items-start gap-3">
                                            <UserPlus className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-blue-900 mb-1">Código do Vendedor (Opcional)</p>
                                                <p className="text-xs text-blue-700 mb-3">Se você foi indicado por um vendedor SEPI, insira o código dele aqui para que ele receba a comissão pela venda.</p>
                                                <Input
                                                    placeholder="Ex: VEND-TEST01"
                                                    value={formData.sellerCode}
                                                    onChange={(e) => setFormData({ ...formData, sellerCode: e.target.value.toUpperCase() })}
                                                    error={errors.sellerCode}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h4 className="font-bold mb-4">Endereço</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <Input
                                                    label="Rua"
                                                    placeholder="Rua Exemplo"
                                                    value={formData.addressStreet}
                                                    onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                                                    error={errors.addressStreet}
                                                    required
                                                />
                                            </div>
                                            <Input
                                                label="Número"
                                                placeholder="123"
                                                value={formData.addressNumber}
                                                onChange={(e) => setFormData({ ...formData, addressNumber: e.target.value })}
                                                error={errors.addressNumber}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                            <Input
                                                label="Cidade"
                                                placeholder="São Paulo"
                                                value={formData.addressCity}
                                                onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                                                error={errors.addressCity}
                                                required
                                            />
                                            <Input
                                                label="Estado"
                                                placeholder="SP"
                                                maxLength={2}
                                                value={formData.addressState}
                                                onChange={(e) => setFormData({ ...formData, addressState: e.target.value.toUpperCase() })}
                                                error={errors.addressState}
                                                required
                                            />
                                            <Input
                                                label="CEP"
                                                placeholder="00000-000"
                                                value={formData.addressZipCode}
                                                onChange={(e) => setFormData({ ...formData, addressZipCode: e.target.value })}
                                                error={errors.addressZipCode}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={() => setStep(1)}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <ArrowLeft className="mr-2 w-4 h-4" />
                                            Voltar
                                        </Button>
                                        <Button onClick={handleNext} className="flex-1">
                                            Próximo
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Review */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold mb-2">Revisar Informações</h3>
                                        <p className="text-muted-foreground text-sm">Confirme os dados antes de finalizar</p>
                                    </div>

                                    <div className="space-y-4">
                                        <Card className="border-primary/20 bg-primary/5">
                                            <CardHeader>
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <Package className="w-4 h-4" />
                                                    Plano Selecionado
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-lg">{selectedPlanData?.name}</p>
                                                        <p className="text-sm text-muted-foreground">{selectedPlanData?.description}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-primary">
                                                            R$ {selectedPlanData?.price.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">por mês</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <Building2 className="w-4 h-4" />
                                                    Dados da Empresa
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2 text-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <p className="text-muted-foreground">CNPJ</p>
                                                        <p className="font-semibold">{formData.cnpj}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Razão Social</p>
                                                        <p className="font-semibold">{formData.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Nome Fantasia</p>
                                                        <p className="font-semibold">{formData.tradeName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Email</p>
                                                        <p className="font-semibold">{formData.email}</p>
                                                    </div>
                                                    {formData.sellerCode && (
                                                        <div className="col-span-2">
                                                            <p className="text-muted-foreground">Código do Vendedor</p>
                                                            <p className="font-semibold text-primary">{formData.sellerCode}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pt-2 border-t">
                                                    <p className="text-muted-foreground mb-1">Endereço</p>
                                                    <p className="font-semibold">
                                                        {formData.addressStreet}, {formData.addressNumber} - {formData.addressCity}/{formData.addressState}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => setStep(2)}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <ArrowLeft className="mr-2 w-4 h-4" />
                                            Voltar
                                        </Button>
                                        <Button onClick={handleNext} className="flex-1">
                                            Finalizar Cadastro
                                            <CheckCircle2 className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Success */}
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
                                        <h3 className="text-2xl font-black">Empresa Cadastrada!</h3>
                                        <p className="text-muted-foreground mt-2">
                                            Sua empresa foi cadastrada com sucesso no plano {selectedPlanData?.name}.
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-xl bg-muted/50 text-left space-y-3">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            <span className="text-sm">Empresa vinculada ao plano {selectedPlanData?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            <span className="text-sm">Acesso a todas as funcionalidades do plano</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            <span className="text-sm">Suporte técnico disponível</span>
                                        </div>
                                    </div>

                                    <Button className="w-full h-12 text-lg font-bold" onClick={() => window.location.hash = '/company'}>
                                        Acessar Dashboard
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
