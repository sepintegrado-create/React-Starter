import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { db } from '../../services/db';
import { FiscalConfig, FiscalCertificate } from '../../types/user';
import { Shield, FileText, Upload, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export default function FiscalSettings() {
    const [currentCompany, setCurrentCompany] = useState<any>(null);
    const [fiscalConfig, setFiscalConfig] = useState<FiscalConfig>({
        regime: 'simples',
        nfeSeries: '1',
        nfceSeries: '1',
        nfseSeries: '1',
        cfopDefault: '5102'
    });
    const [certificate, setCertificate] = useState<FiscalCertificate | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('sepi_current_company');
        if (stored) {
            const company = JSON.parse(stored);
            setCurrentCompany(company);
            if (company.settings?.fiscalConfig) {
                setFiscalConfig(company.settings.fiscalConfig);
            }
            if (company.settings?.fiscalCertificate) {
                setCertificate(company.settings.fiscalCertificate);
            }
        }
    }, []);

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updatedSettings = {
                ...currentCompany.settings,
                fiscalConfig
            };
            db.saveCompanySettings(currentCompany.id, updatedSettings);
            setFeedback({ type: 'success', message: 'Configurações fiscais salvas com sucesso!' });
        } catch (error) {
            setFeedback({ type: 'error', message: 'Erro ao salvar configurações.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setFeedback(null), 3000);
        }
    };

    const handleUploadCertificate = () => {
        // Simulate certificate upload
        const mockCert: FiscalCertificate = {
            id: 'cert-' + Math.random().toString(36).substr(2, 9),
            alias: currentCompany.name,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            issuer: 'AC SOLUTI Multipla v5',
            status: 'active',
            fileName: 'certificado_digital.pfx'
        };

        const updatedSettings = {
            ...currentCompany.settings,
            fiscalCertificate: mockCert
        };
        db.saveCompanySettings(currentCompany.id, updatedSettings);
        setCertificate(mockCert);
        setFeedback({ type: 'success', message: 'Certificado digital A1 configurado com sucesso!' });
        setTimeout(() => setFeedback(null), 3000);
    };

    if (!currentCompany) return null;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Área Fiscal</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie seu certificado digital e configurações de impostos</p>
                </div>
            </div>

            {feedback && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {feedback.message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certificate Section */}
                <Card className="p-6 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-semibold">Certificado Digital (A1)</h2>
                    </div>

                    {certificate ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-green-500/20">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{certificate.fileName}</p>
                                            <p className="text-sm text-gray-500">{certificate.issuer}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">Ativo</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Expira em: {new Date(certificate.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        <span>Tipo: A1 (Software)</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleUploadCertificate}
                                className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-600 rounded-lg transition-colors"
                            >
                                Substituir Certificado
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-8 h-8" />
                            </div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Nenhum certificado instalado</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                                Você precisa de um certificado digital A1 (.pfx) para assinar e emitir notas fiscais.
                            </p>
                            <button
                                onClick={handleUploadCertificate}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Carregar Certificado (.pfx)
                            </button>
                        </div>
                    )}
                </Card>

                {/* Fiscal Config Section */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-semibold">Configurações Gerais</h2>
                    </div>

                    <form onSubmit={handleSaveConfig} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Regime Tributário</label>
                            <select
                                value={fiscalConfig.regime}
                                onChange={(e) => setFiscalConfig({ ...fiscalConfig, regime: e.target.value as any })}
                                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <option value="simples">Simples Nacional</option>
                                <option value="presumido">Lucro Presumido</option>
                                <option value="real">Lucro Real</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Série NF-e</label>
                                <input
                                    type="text"
                                    value={fiscalConfig.nfeSeries}
                                    onChange={(e) => setFiscalConfig({ ...fiscalConfig, nfeSeries: e.target.value })}
                                    placeholder="Ex: 1"
                                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Série NFC-e</label>
                                <input
                                    type="text"
                                    value={fiscalConfig.nfceSeries}
                                    onChange={(e) => setFiscalConfig({ ...fiscalConfig, nfceSeries: e.target.value })}
                                    placeholder="Ex: 1"
                                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CFOP Padrão de Venda</label>
                            <input
                                type="text"
                                value={fiscalConfig.cfopDefault}
                                onChange={(e) => setFiscalConfig({ ...fiscalConfig, cfopDefault: e.target.value })}
                                placeholder="Ex: 5102"
                                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                            </button>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Mercado Pago Configuration */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-semibold">Mercado Pago</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Token</label>
                        <input
                            type="password"
                            placeholder="APP_USR-xxxxx"
                            className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Public Key</label>
                        <input
                            type="text"
                            placeholder="APP_USR-xxxxx"
                            className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Webhook Secret (Opcional)</label>
                        <input
                            type="password"
                            placeholder="whsec_xxxxx"
                            className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="enableMercadoPago"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="enableMercadoPago" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Habilitar pagamentos via Mercado Pago
                        </label>
                    </div>

                    <button
                        type="button"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Salvar Configurações do Mercado Pago
                    </button>
                </div>
            </Card>

            {/* Tegra API Configuration */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-semibold">Integração Tegra (nfe.io)</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            id="enableTegra"
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor="enableTegra" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Habilitar integração com Tegra
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Company ID na Tegra
                        </label>
                        <input
                            type="text"
                            placeholder="ID da empresa na plataforma Tegra"
                            className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Opcional: sobrescrever configuração global da plataforma
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            API Key (Opcional)
                        </label>
                        <input
                            type="password"
                            placeholder="Deixe em branco para usar a chave da plataforma"
                            className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Use apenas se precisar de credenciais diferentes da configuração global
                        </p>
                    </div>

                    <button
                        type="button"
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Salvar Configurações Tegra
                    </button>
                </div>
            </Card>

            {/* Fiscal Documents History Section */}
            <Card className="p-0 overflow-hidden border-none shadow-xl rounded-[2.5rem]">
                <div className="p-8 border-b bg-muted/20 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tight">Histórico de Notas e Cupons</h2>
                        <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Registros de emissões da empresa</p>
                    </div>
                    <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-muted/50 text-left">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Documento</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Data/Hora</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Valor</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Chave de Acesso</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {db.getFiscalDocuments(currentCompany.id).length > 0 ? (
                                db.getFiscalDocuments(currentCompany.id).map((doc: any) => (
                                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase italic text-primary">{doc.type}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold">Série {doc.series} | Nº {doc.number}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-muted-foreground">
                                            {new Date(doc.date).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-foreground">
                                            R$ {doc.amount.toFixed(2)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase italic ${doc.status === 'authorized' ? 'bg-green-100 text-green-700' :
                                                doc.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {doc.status === 'authorized' ? 'Autorizada' : doc.status === 'pending' ? 'Pendente' : 'Cancelada'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-mono text-[10px] text-muted-foreground">
                                            {doc.accessKey || 'Geração pendente...'}
                                        </td>
                                        <td className="px-8 py-5 text-right space-x-2">
                                            <button title="Visualizar XML" className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button title="Imprimir PDF" className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <FileText className="w-12 h-12" />
                                            <p className="font-black uppercase italic text-sm tracking-widest">Nenhuma emissão encontrada</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
