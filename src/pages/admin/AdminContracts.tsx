import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileSignature, Save, Clock, AlertCircle, History, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { db } from '../../services/db';
import { PlatformTerms } from '../../types/user';

export function AdminContractsPage() {
    const [terms, setTerms] = useState<PlatformTerms | null>(null);
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    useEffect(() => {
        const platformTerms = db.getPlatformTerms();
        setTerms(platformTerms);
        setContent(platformTerms.content);
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            db.savePlatformTerms(content);
            const updated = db.getPlatformTerms();
            setTerms(updated);
            setLastSaved(new Date().toLocaleTimeString());
            setIsSaving(false);
            alert('Contrato atualizado com sucesso!');
        }, 1000);
    };

    if (!terms) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Contratos</h1>
                    <p className="text-muted-foreground mt-1">Edite o termo de uso global da plataforma</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <History className="w-4 h-4 mr-2" />
                        Ver Histórico
                    </Button>
                    <Button onClick={handleSave} isLoading={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor Section */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="h-full min-h-[600px] flex flex-col">
                        <CardHeader className="border-b bg-muted/30">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <FileSignature className="w-4 h-4 text-primary" />
                                    Editor de Contrato
                                </CardTitle>
                                <div className="text-xs text-muted-foreground font-medium">
                                    Markdown suportado
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <textarea
                                className="w-full h-full min-h-[500px] p-6 text-sm font-mono bg-transparent outline-none resize-none custom-scrollbar"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Comece a digitar o contrato aqui..."
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Info & Settings Section */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Status Atual</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    Última Atualização
                                </div>
                                <span className="text-xs font-bold">{new Date(terms.updatedAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                    Versão Atual
                                </div>
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                    v{terms.version}
                                </span>
                            </div>

                            {lastSaved && (
                                <p className="text-center text-xs text-green-600 font-bold animate-pulse">
                                    Salvo às {lastSaved}
                                </p>
                            )}

                            <div className="pt-4 border-t">
                                <Button variant="outline" className="w-full" onClick={() => window.open('#/register', '_blank')}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Pré-visualizar no Cadastro
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-primary" />
                                Importante
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-primary/80 leading-relaxed">
                                Todas as alterações neste contrato serão registradas para conformidade legal. Novos usuários deverão aceitar esta versão.
                            </p>
                            <ul className="text-xs space-y-2 text-primary/60 list-disc pl-4">
                                <li>As alterações não são retroativas aos usuários já cadastrados.</li>
                                <li>Use `#` para títulos em negrito.</li>
                                <li>Use `**` para destaque em negrito.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
