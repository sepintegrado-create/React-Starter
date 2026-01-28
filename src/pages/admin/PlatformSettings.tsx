import React, { useState, useEffect } from 'react';
import { Settings, Save, Key, Globe, Database } from 'lucide-react';

interface PlatformConfig {
    id?: string;
    tegraCompanyId?: string;
    tegraEnvironment?: string;
    tegraBaseUrl?: string;
    hasApiKey?: boolean;
    updatedAt?: string;
}

export default function PlatformSettings() {
    const [config, setConfig] = useState<PlatformConfig>({
        tegraEnvironment: 'homologacao',
        tegraBaseUrl: 'https://api.nfe.io/v1',
    });
    const [tegraApiKey, setTegraApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${apiUrl}/platform/config`);

            if (response.ok) {
                const data = await response.json();
                setConfig(data);
            }
        } catch (error) {
            console.error('Error loading platform config:', error);
            setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${apiUrl}/platform/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tegraApiKey: tegraApiKey || undefined,
                    tegraCompanyId: config.tegraCompanyId,
                    tegraEnvironment: config.tegraEnvironment,
                    tegraBaseUrl: config.tegraBaseUrl,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setConfig(data);
                setTegraApiKey('');
                setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
            } else {
                setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
            }
        } catch (error) {
            console.error('Error saving platform config:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando configurações...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Configurações da Plataforma</h1>
                    </div>
                    <p className="text-gray-600">Gerencie as configurações globais da plataforma SEPI</p>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Tegra API Configuration */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Key className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Integração Tegra (nfe.io)</h2>
                    </div>

                    <div className="space-y-6">
                        {/* API Key */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                API Key
                                {config.hasApiKey && (
                                    <span className="ml-2 text-xs text-green-600">(Configurada)</span>
                                )}
                            </label>
                            <input
                                type="password"
                                value={tegraApiKey}
                                onChange={(e) => setTegraApiKey(e.target.value)}
                                placeholder={config.hasApiKey ? '••••••••••••••••' : 'Digite a API Key da Tegra'}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Deixe em branco para manter a chave atual
                            </p>
                        </div>

                        {/* Company ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company ID
                            </label>
                            <input
                                type="text"
                                value={config.tegraCompanyId || ''}
                                onChange={(e) => setConfig({ ...config, tegraCompanyId: e.target.value })}
                                placeholder="ID da empresa na Tegra"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Environment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Globe className="w-4 h-4 inline mr-2" />
                                Ambiente
                            </label>
                            <select
                                value={config.tegraEnvironment || 'homologacao'}
                                onChange={(e) => setConfig({ ...config, tegraEnvironment: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="homologacao">Homologação</option>
                                <option value="producao">Produção</option>
                            </select>
                        </div>

                        {/* Base URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Database className="w-4 h-4 inline mr-2" />
                                Base URL
                            </label>
                            <input
                                type="text"
                                value={config.tegraBaseUrl || ''}
                                onChange={(e) => setConfig({ ...config, tegraBaseUrl: e.target.value })}
                                placeholder="https://api.nfe.io/v1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                </div>

                {/* Last Update */}
                {config.updatedAt && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Última atualização: {new Date(config.updatedAt).toLocaleString('pt-BR')}
                    </div>
                )}
            </div>
        </div>
    );
}
