import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { db } from '../../services/db';
import { FileText, Search, Filter, Download, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export default function Invoices() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [currentCompany, setCurrentCompany] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('sepi_current_company');
        if (stored) {
            const company = JSON.parse(stored);
            setCurrentCompany(company);
            const docs = db.getFiscalDocuments(company.id);
            setInvoices(docs);
        }
        setIsLoading(false);
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'autorizada':
                return 'bg-green-100 text-green-700';
            case 'rejeitada':
                return 'bg-red-100 text-red-700';
            case 'pendente':
                return 'bg-yellow-100 text-yellow-700';
            case 'cancelada':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documentos Fiscais</h1>
                    <p className="text-gray-500 dark:text-gray-400">Acompanhe a emissão e status de suas notas fiscais</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                        Atualizar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                        <Download className="w-4 h-4" />
                        Exportar XMLs
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 flex flex-col justify-between">
                    <span className="text-sm text-gray-500">Total Emitidas (Mês)</span>
                    <span className="text-2xl font-bold">{invoices.length}</span>
                </Card>
                <Card className="p-4 flex flex-col justify-between">
                    <span className="text-sm text-gray-500">Aguardando Autorização</span>
                    <span className="text-2xl font-bold text-yellow-500">
                        {invoices.filter(d => d.status === 'pendente').length}
                    </span>
                </Card>
                <Card className="p-4 flex flex-col justify-between">
                    <span className="text-sm text-gray-500">Rejeitadas</span>
                    <span className="text-2xl font-bold text-red-500">
                        {invoices.filter(d => d.status === 'rejeitada').length}
                    </span>
                </Card>
                <Card className="p-4 flex flex-col justify-between">
                    <span className="text-sm text-gray-500">Consumo API</span>
                    <span className="text-2xl font-bold text-blue-500">65%</span>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por número, cliente ou chave de acesso..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="">Tipo: Todos</option>
                        <option value="nfe">NF-e</option>
                        <option value="nfce">NFC-e</option>
                        <option value="nfse">NFS-e</option>
                    </select>
                    <select className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="">Status: Todos</option>
                        <option value="autorizada">Autorizada</option>
                        <option value="rejeitada">Rejeitada</option>
                        <option value="pendente">Pendente</option>
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Documento</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {invoice.type.toUpperCase()} #{invoice.number}
                                                </span>
                                                <span className="text-xs text-gray-500 font-mono">
                                                    Série {invoice.series}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 dark:text-white">{invoice.customerName}</span>
                                                <span className="text-xs text-gray-500">{invoice.customerCpfCnpj}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(invoice.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyle(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Ver Detalhes">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Baixar DANFE/XML">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-500">
                                            <FileText className="w-12 h-12 opacity-20" />
                                            <p>Nenhum documento fiscal encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Tips Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg h-fit">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Dica de Gestão</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Mantenha seu certificado digital A1 sempre atualizado para evitar interrupções na emissão de vendas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
