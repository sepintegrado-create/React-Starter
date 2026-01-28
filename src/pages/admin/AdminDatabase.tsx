import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Database,
    Download,
    Upload,
    Save,
    Building2,
    HardDrive,
    Activity,
    Wifi,
    Server,
    Clock,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Users,
    FileJson
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/validators';

interface CompanyData {
    id: string;
    name: string;
    dataSize: string;
    lastBackup: string;
    status: 'active' | 'inactive';
}

interface NetworkStats {
    uptime: string;
    requestsToday: number;
    activeConnections: number;
    responseTime: string;
    errorRate: string;
    cpuUsage: string;
    memoryUsage: string;
    diskUsage: string;
}

export function AdminDatabase() {
    const [companies, setCompanies] = useState<CompanyData[]>([
        { id: '1', name: 'Restaurante Bom Sabor', dataSize: '2.4 MB', lastBackup: '2024-01-25T10:30:00', status: 'active' },
        { id: '2', name: 'Tech Solutions', dataSize: '8.7 MB', lastBackup: '2024-01-25T10:28:00', status: 'active' },
        { id: '3', name: 'Padaria Central', dataSize: '1.2 MB', lastBackup: '2024-01-25T10:25:00', status: 'active' },
        { id: '4', name: 'Academia Fitness', dataSize: '4.1 MB', lastBackup: '2024-01-25T10:20:00', status: 'active' },
        { id: '5', name: 'Clínica Médica', dataSize: '12.3 MB', lastBackup: '2024-01-25T10:15:00', status: 'active' },
    ]);

    const [networkStats, setNetworkStats] = useState<NetworkStats>({
        uptime: '15d 7h 23m',
        requestsToday: 45678,
        activeConnections: 234,
        responseTime: '45ms',
        errorRate: '0.02%',
        cpuUsage: '32%',
        memoryUsage: '68%',
        diskUsage: '45%'
    });

    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [exportInProgress, setExportInProgress] = useState(false);

    const handleSelectAll = () => {
        if (selectedCompanies.length === companies.length) {
            setSelectedCompanies([]);
        } else {
            setSelectedCompanies(companies.map(c => c.id));
        }
    };

    const handleSelectCompany = (id: string) => {
        if (selectedCompanies.includes(id)) {
            setSelectedCompanies(selectedCompanies.filter(cid => cid !== id));
        } else {
            setSelectedCompanies([...selectedCompanies, id]);
        }
    };

    const handleBackupAll = async () => {
        setBackupInProgress(true);
        // Simulate backup process
        setTimeout(() => {
            setBackupInProgress(false);
            alert('Backup de todas as empresas realizado com sucesso!');
        }, 2000);
    };

    const handleBackupSelected = async () => {
        if (selectedCompanies.length === 0) {
            alert('Selecione pelo menos uma empresa');
            return;
        }
        setBackupInProgress(true);
        // Simulate backup process
        setTimeout(() => {
            setBackupInProgress(false);
            alert(`Backup de ${selectedCompanies.length} empresa(s) realizado com sucesso!`);
        }, 2000);
    };

    const handleExportAll = async () => {
        setExportInProgress(true);
        // Simulate export process
        setTimeout(() => {
            setExportInProgress(false);
            alert('Exportação de dados de todas as empresas iniciada!');
        }, 2000);
    };

    const handleExportByCompany = async () => {
        if (selectedCompanies.length === 0) {
            alert('Selecione pelo menos uma empresa');
            return;
        }
        setExportInProgress(true);
        // Simulate export process
        setTimeout(() => {
            setExportInProgress(false);
            alert(`Exportação de ${selectedCompanies.length} empresa(s) iniciada!`);
        }, 2000);
    };

    const monitoringCards = [
        { label: 'Tempo Online', value: networkStats.uptime, icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-50' },
        { label: 'Requisições Hoje', value: networkStats.requestsToday.toLocaleString(), icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-50' },
        { label: 'Conexões Ativas', value: networkStats.activeConnections, icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-50' },
        { label: 'Tempo de Resposta', value: networkStats.responseTime, icon: Activity, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    ];

    const systemHealth = [
        { label: 'CPU', value: networkStats.cpuUsage, max: 100, color: 'bg-blue-500' },
        { label: 'Memória', value: networkStats.memoryUsage, max: 100, color: 'bg-green-500' },
        { label: 'Disco', value: networkStats.diskUsage, max: 100, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Database className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Banco de Dados</h1>
                </div>
                <p className="text-muted-foreground">Gerenciamento de dados, backup e monitoramento de rede</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button
                    onClick={handleBackupAll}
                    disabled={backupInProgress}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    variant="outline"
                >
                    <Save className="w-6 h-6" />
                    <span className="text-sm font-semibold">Backup Completo</span>
                </Button>
                <Button
                    onClick={handleBackupSelected}
                    disabled={backupInProgress || selectedCompanies.length === 0}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    variant="outline"
                >
                    <Save className="w-6 h-6" />
                    <span className="text-sm font-semibold">Backup Selecionados</span>
                </Button>
                <Button
                    onClick={handleExportAll}
                    disabled={exportInProgress}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    variant="outline"
                >
                    <Download className="w-6 h-6" />
                    <span className="text-sm font-semibold">Exportar Tudo</span>
                </Button>
                <Button
                    onClick={handleExportByCompany}
                    disabled={exportInProgress || selectedCompanies.length === 0}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    variant="outline"
                >
                    <FileJson className="w-6 h-6" />
                    <span className="text-sm font-semibold">Exportar Selecionados</span>
                </Button>
            </div>

            {/* Network Monitoring */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Monitoramento de Rede
                            </CardTitle>
                            <CardDescription>Status em tempo real do servidor e rede</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-green-600">Online</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {monitoringCards.map((card, index) => (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-lg ${card.bgColor} border-2 border-${card.color.replace('text-', '')}/20`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                                    <card.icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <p className="text-2xl font-bold">{card.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* System Health */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Server className="w-5 h-5" />
                            Saúde do Sistema
                        </h3>
                        {systemHealth.map((metric) => (
                            <div key={metric.label}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{metric.label}</span>
                                    <span className="text-sm font-bold">{metric.value}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`${metric.color} h-full rounded-full transition-all duration-500`}
                                        style={{ width: metric.value }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                        <div className="text-center p-4 rounded-lg bg-muted">
                            <p className="text-sm text-muted-foreground mb-1">Taxa de Erro</p>
                            <p className="text-2xl font-bold text-green-600">{networkStats.errorRate}</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted">
                            <p className="text-sm text-muted-foreground mb-1">Status do Servidor</p>
                            <p className="text-sm font-bold text-green-600 flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Operacional
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Companies Data Management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                Dados por Empresa
                            </CardTitle>
                            <CardDescription>Gerenciar backup e exportação por empresa</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleSelectAll}>
                            {selectedCompanies.length === companies.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {companies.map((company, index) => (
                            <motion.div
                                key={company.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedCompanies.includes(company.id)
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:bg-muted/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedCompanies.includes(company.id)}
                                        onChange={() => handleSelectCompany(company.id)}
                                        className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
                                    />
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{company.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${company.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {company.status === 'active' ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <HardDrive className="w-3 h-3" />
                                                {company.dataSize}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Último backup: {new Date(company.lastBackup).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => alert(`Backup de ${company.name} iniciado!`)}
                                    >
                                        <Save className="w-4 h-4 mr-1" />
                                        Backup
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => alert(`Exportando dados de ${company.name}...`)}
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Exportar
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {selectedCompanies.length > 0 && (
                        <div className="mt-4 p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                            <p className="text-sm font-semibold text-primary">
                                {selectedCompanies.length} empresa(s) selecionada(s) para operação em lote
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
