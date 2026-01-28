import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Save,
    CheckCircle2,
    LayoutDashboard,
    Bell,
    Timer,
    ChefHat,
    Truck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { db } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

export function OperationalSettingsPage() {
    const { currentCompany } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [enableDetailedTracking, setEnableDetailedTracking] = useState(true);

    useEffect(() => {
        if (currentCompany) {
            const company = db.getCompanyById(currentCompany.id);
            if (company?.settings?.enableDetailedTracking !== undefined) {
                setEnableDetailedTracking(company.settings.enableDetailedTracking);
            }
        }
    }, [currentCompany]);

    const handleSave = async () => {
        if (!currentCompany) return;
        setIsSaving(true);
        try {
            db.saveCompanySettings(currentCompany.id, { enableDetailedTracking });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving operational settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight italic">Configurações Operacionais</h1>
                    <p className="text-muted-foreground">Gerencie o fluxo de trabalho e processos do seu negócio</p>
                </div>
                <Button
                    onClick={handleSave}
                    className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                    disabled={isSaving}
                >
                    {isSaving ? 'Salvando...' : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </header>

            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-600 font-bold uppercase text-xs tracking-widest"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    Configurações atualizadas com sucesso!
                </motion.div>
            )}

            <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Fluxo de Pedidos</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Controle como os pedidos são processados</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/50 border border-border/50">
                        <div className="space-y-1">
                            <p className="text-lg font-black uppercase italic tracking-tight">Acompanhamento Detalhado</p>
                            <p className="text-sm text-muted-foreground font-medium max-w-md">
                                Quando ativado, todos os produtos e serviços passarão pelas etapas de
                                **Aguardando**, **Preparação**, **Pronto** e **Entregue**, permitindo
                                total controle operacional e auditoria de funcionários.
                            </p>
                        </div>
                        <button
                            onClick={() => setEnableDetailedTracking(!enableDetailedTracking)}
                            className={`w-14 h-7 rounded-full p-1 transition-colors ${enableDetailedTracking ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${enableDetailedTracking ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-border bg-background space-y-3 opacity-60">
                            <div className="flex items-center gap-2 text-primary">
                                <Timer className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Tempo Médio</span>
                            </div>
                            <p className="text-xs font-bold">Métricas de tempo por funcionário</p>
                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase">Em breve</span>
                        </div>
                        <div className="p-4 rounded-2xl border border-border bg-background space-y-3 opacity-60">
                            <div className="flex items-center gap-2 text-primary">
                                <Bell className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Alertas</span>
                            </div>
                            <p className="text-xs font-bold">Notificações automáticas via WhatsApp</p>
                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase">Em breve</span>
                        </div>
                    </div>

                    {enableDetailedTracking && (
                        <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-4">
                            <h4 className="text-xs font-black uppercase text-primary tracking-widest italic">O que muda com esta função:</h4>
                            <div className="space-y-3">
                                <div className="flex gap-3 text-sm font-medium">
                                    <ChefHat className="w-5 h-5 text-primary flex-shrink-0" />
                                    <p><span className="font-black">Cozinha/Serviços:</span> Precisam confirmar o recebimento e início de cada item.</p>
                                </div>
                                <div className="flex gap-3 text-sm font-medium">
                                    <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                                    <p><span className="font-black">Garçons/Equipe:</span> Recebem alerta sonoro quando o item está pronto.</p>
                                </div>
                                <div className="flex gap-3 text-sm font-medium">
                                    <LayoutDashboard className="w-5 h-5 text-primary flex-shrink-0" />
                                    <p><span className="font-black">Auditoria:</span> Todo o fluxo é registrado no histórico com nome e hora.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
