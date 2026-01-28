import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield, FileText, Upload, CheckCircle, AlertCircle, Calendar, Building2, Save } from 'lucide-react';

export function AdminFiscalPage() {
    const [config, setConfig] = useState({
        cnpj: '12.345.678/0001-90',
        razaoSocial: 'SEPI Tecnologia Ltda',
        inscricaoEstadual: '123.456.789.012',
        inscricaoMunicipal: '12345678',
        regime: 'lucro_presumido',
        aliquotaISS: '5',
        aliquotaPIS: '0.65',
        aliquotaCOFINS: '3',
        certificateStatus: 'valid',
        certificateExpiry: '2025-12-15',
        nfseAutomatic: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Load configuration from backend
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/platform/fiscal');
                if (response.ok) {
                    const data = await response.json();
                    setConfig(data);
                }
            } catch (error) {
                console.error('Failed to load fiscal config:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            const response = await fetch('http://localhost:3001/api/platform/fiscal', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });

            if (response.ok) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            console.error('Failed to save fiscal config:', error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configurações Fiscais</h1>
                    <p className="text-muted-foreground mt-1">Dados fiscais e certificados da plataforma SEPI</p>
                </div>
                <Button onClick={handleSave} isLoading={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                </Button>
            </div>

            {/* Save Status Notification */}
            {saveStatus === 'success' && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">Configurações salvas com sucesso!</p>
                </div>
            )}
            {saveStatus === 'error' && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-medium">Erro ao salvar configurações. Tente novamente.</p>
                </div>
            )}

            {/* Certificate Status */}
            <Card className={`border-2 ${config.certificateStatus === 'valid' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${config.certificateStatus === 'valid' ? 'bg-green-100' : 'bg-red-100'}`}>
                                {config.certificateStatus === 'valid' ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold">Certificado Digital A1</h3>
                                <p className="text-sm text-muted-foreground">
                                    {config.certificateStatus === 'valid' ? 'Válido até ' : 'Expirado em '}
                                    {new Date(config.certificateExpiry).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => document.getElementById('cert-upload')?.click()}>
                                <Upload className="w-4 h-4 mr-2" />
                                Enviar Novo Certificado
                            </Button>
                            <input id="cert-upload" type="file" className="hidden" accept=".pfx,.p12" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Data */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            Dados da Empresa
                        </CardTitle>
                        <CardDescription>Informações cadastrais da plataforma</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="CNPJ"
                            value={config.cnpj}
                            onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                        />
                        <Input
                            label="Razão Social"
                            value={config.razaoSocial}
                            onChange={(e) => setConfig({ ...config, razaoSocial: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Inscrição Estadual"
                                value={config.inscricaoEstadual}
                                onChange={(e) => setConfig({ ...config, inscricaoEstadual: e.target.value })}
                            />
                            <Input
                                label="Inscrição Municipal"
                                value={config.inscricaoMunicipal}
                                onChange={(e) => setConfig({ ...config, inscricaoMunicipal: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Tax Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Regime Tributário
                        </CardTitle>
                        <CardDescription>Configurações de impostos da plataforma</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Regime de Tributação
                            </label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                value={config.regime}
                                onChange={(e) => setConfig({ ...config, regime: e.target.value })}
                            >
                                <option value="simples">Simples Nacional</option>
                                <option value="lucro_presumido">Lucro Presumido</option>
                                <option value="lucro_real">Lucro Real</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Input
                                label="ISS (%)"
                                type="number"
                                value={config.aliquotaISS}
                                onChange={(e) => setConfig({ ...config, aliquotaISS: e.target.value })}
                            />
                            <Input
                                label="PIS (%)"
                                type="number"
                                value={config.aliquotaPIS}
                                onChange={(e) => setConfig({ ...config, aliquotaPIS: e.target.value })}
                            />
                            <Input
                                label="COFINS (%)"
                                type="number"
                                value={config.aliquotaCOFINS}
                                onChange={(e) => setConfig({ ...config, aliquotaCOFINS: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* NFSe Integration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Integração NFSe (Notas de Serviço)
                    </CardTitle>
                    <CardDescription>Emissão automática de notas fiscais para assinaturas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">NFSe Automática</h3>
                                <p className="text-sm text-muted-foreground">
                                    Emitir nota fiscal automaticamente para cada assinatura paga
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={config.nfseAutomatic}
                                onChange={(e) => setConfig({ ...config, nfseAutomatic: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
