import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Edit2,
    Save,
    X,
    Users,
    Database,
    FileText,
    Building2,
    DollarSign,
    Info,
    Plus,
    Trash2
} from 'lucide-react';
import { db } from '../../services/db';
import { SubscriptionPlan } from '../../types/user';

export function PackageSettingsPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const loadPlans = () => {
            const data = db.getPlans();
            setPlans(data);
        };
        loadPlans();
    }, []);

    const handleEdit = (plan: SubscriptionPlan) => {
        setEditingPlan({ ...plan });
        setIsCreating(false);
    };

    const handleCreate = () => {
        const newPlan: SubscriptionPlan = {
            id: `plan-${Date.now()}`,
            name: '',
            description: '',
            price: 0,
            billingCycle: 'monthly',
            features: [],
            maxEmployees: 0,
            maxProducts: 0,
            maxLocations: 0,
            storageGB: 0,
            maxInvoices: 0,
            maxCompanies: 0
        };
        setEditingPlan(newPlan);
        setIsCreating(true);
    };

    const handleDelete = (planId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este pacote?')) {
            db.deletePlan(planId);
            setPlans(db.getPlans());
        }
    };

    const handleCancel = () => {
        setEditingPlan(null);
    };

    const handleSave = async () => {
        if (!editingPlan) return;

        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isCreating) {
            db.addPlan(editingPlan);
        } else {
            db.updatePlan(editingPlan);
        }

        const updatedPlans = db.getPlans();
        setPlans(updatedPlans);
        setEditingPlan(null);
        setIsSaving(false);
    };

    const handleInputChange = (field: keyof SubscriptionPlan, value: any) => {
        if (!editingPlan) return;
        setEditingPlan({ ...editingPlan, [field]: value });
    };

    const toggleFeature = (index: number) => {
        if (!editingPlan) return;
        const newFeatures = [...editingPlan.features];
        newFeatures[index] = { ...newFeatures[index], enabled: !newFeatures[index].enabled };
        setEditingPlan({ ...editingPlan, features: newFeatures });
    };

    const removeFeature = (index: number) => {
        if (!editingPlan) return;
        const newFeatures = editingPlan.features.filter((_, i) => i !== index);
        setEditingPlan({ ...editingPlan, features: newFeatures });
    };

    const addFeature = () => {
        if (!editingPlan) return;
        setEditingPlan({
            ...editingPlan,
            features: [...editingPlan.features, { name: 'Nova Funcionalidade', enabled: true }]
        });
    };

    const updateFeatureName = (index: number, name: string) => {
        if (!editingPlan) return;
        const newFeatures = [...editingPlan.features];
        newFeatures[index] = { ...newFeatures[index], name };
        setEditingPlan({ ...editingPlan, features: newFeatures });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuração de Pacotes</h1>
                    <p className="text-muted-foreground">Gerencie os limites e valores dos planos da plataforma.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar Pacote
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <motion.div
                        key={plan.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm group"
                    >
                        <div className="p-6 border-b border-border bg-muted/30">
                            <div className="flex items-center justify-between mb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(plan)}
                                        className="p-2 hover:bg-accent rounded-full transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className="p-2 hover:bg-destructive/10 rounded-full transition-colors group/trash"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4 text-muted-foreground group-hover/trash:text-destructive" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold">{plan.name || 'Sem nome'}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{plan.description || 'Sem descrição'}</p>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-2xl font-bold">R$ {plan.price.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">/{plan.billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-4 flex-1">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Database className="w-4 h-4" />
                                    <span>Espaço em GB</span>
                                </div>
                                <span className="font-semibold">{plan.storageGB} GB</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span>Funcionários</span>
                                </div>
                                <span className="font-semibold">{plan.maxEmployees}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText className="w-4 h-4" />
                                    <span>Notas/Cupons Fiscais</span>
                                </div>
                                <span className="font-semibold">{plan.maxInvoices}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Building2 className="w-4 h-4" />
                                    <span>Empresas Ativas</span>
                                </div>
                                <span className="font-semibold">{plan.maxCompanies}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {editingPlan && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        {isCreating ? <Plus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                                        {isCreating ? 'Novo Pacote' : `Editar ${editingPlan.name}`}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">Defina os limites e regras deste pacote.</p>
                                </div>
                                <button
                                    onClick={handleCancel}
                                    className="p-2 hover:bg-accent rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium">Nome do Plano</span>
                                        <input
                                            type="text"
                                            value={editingPlan.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Ex: Plano Master"
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </label>

                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium">Descrição</span>
                                        <textarea
                                            value={editingPlan.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Breve descrição dos principais benefícios"
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                            rows={2}
                                        />
                                    </label>

                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block space-y-2">
                                            <span className="text-sm font-medium flex items-center gap-1">
                                                <DollarSign className="w-3.5 h-3.5" /> Preço
                                            </span>
                                            <input
                                                type="number"
                                                value={editingPlan.price}
                                                onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                                                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                                            />
                                        </label>
                                        <label className="block space-y-2">
                                            <span className="text-sm font-medium">Ciclo</span>
                                            <select
                                                value={editingPlan.billingCycle}
                                                onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                                            >
                                                <option value="monthly">Mensal</option>
                                                <option value="yearly">Anual</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium flex items-center gap-1">
                                            <Database className="w-3.5 h-3.5" /> Espaço (GB)
                                        </span>
                                        <input
                                            type="number"
                                            value={editingPlan.storageGB}
                                            onChange={(e) => handleInputChange('storageGB', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </label>

                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" /> Qtd. Funcionários
                                        </span>
                                        <input
                                            type="number"
                                            value={editingPlan.maxEmployees}
                                            onChange={(e) => handleInputChange('maxEmployees', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </label>

                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5" /> Qtd. Notas Fiscais
                                        </span>
                                        <input
                                            type="number"
                                            value={editingPlan.maxInvoices}
                                            onChange={(e) => handleInputChange('maxInvoices', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </label>

                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium flex items-center gap-1">
                                            <Building2 className="w-3.5 h-3.5" /> Qtd. Empresas
                                        </span>
                                        <input
                                            type="number"
                                            value={editingPlan.maxCompanies}
                                            onChange={(e) => handleInputChange('maxCompanies', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </label>

                                    <div className="flex items-center justify-between pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={editingPlan.popular}
                                                onChange={(e) => handleInputChange('popular', e.target.checked)}
                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium group-hover:text-primary transition-colors">Destaque (Popular)</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Features Management */}
                                <div className="md:col-span-2 pt-4 border-t border-border space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground italic">Funcionalidades do Plano</h3>
                                        <button
                                            type="button"
                                            onClick={addFeature}
                                            className="text-xs flex items-center gap-1 px-2 py-1 h-8 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> Adicionar
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {editingPlan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/50 group">
                                                <input
                                                    type="checkbox"
                                                    checked={feature.enabled}
                                                    onChange={() => toggleFeature(idx)}
                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                                />
                                                <input
                                                    type="text"
                                                    value={feature.name}
                                                    onChange={(e) => updateFeatureName(idx, e.target.value)}
                                                    className="flex-1 bg-transparent border-none text-sm outline-none focus:ring-0 p-0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(idx)}
                                                    className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-border bg-muted/30 flex items-center justify-between">
                                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground max-w-[300px]">
                                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Certifique-se de preencher todos os limites antes de salvar.</span>
                                </div>
                                <div className="flex items-center gap-3 ml-auto">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isSaving || !editingPlan.name}
                                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {isCreating ? 'Criar Pacote' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
