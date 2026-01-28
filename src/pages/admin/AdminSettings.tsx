import React from 'react';
import {
    Settings,
    DollarSign,
    FileText,
    Users,
    Globe,
    ChevronRight,
    Building2,
    ShieldCheck,
    Bell,
    Database
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

export function AdminSettingsPage() {
    const settingsCategories = [
        {
            id: 'profile',
            title: 'Minha Conta',
            description: 'Dados pessoais, senha e preferências',
            icon: Building2,
            path: '/admin/profile-settings',
            color: 'bg-blue-500/10 text-blue-600'
        },
        {
            id: 'financial',
            title: 'Financeiro',
            description: 'Receitas, assinaturas e comissões',
            icon: DollarSign,
            path: '/admin/financial',
            color: 'bg-green-500/10 text-green-600'
        },
        {
            id: 'fiscal',
            title: 'Fiscal e Tributos',
            description: 'CNPJ, certificados e impostos',
            icon: FileText,
            path: '/admin/fiscal',
            color: 'bg-purple-500/10 text-purple-600'
        },
        {
            id: 'employees',
            title: 'Funcionários da Plataforma',
            description: 'Equipe interna e permissões',
            icon: Users,
            path: '/admin/employees',
            color: 'bg-orange-500/10 text-orange-600'
        },
        {
            id: 'public-profile',
            title: 'Perfil Público',
            description: 'Página institucional da plataforma',
            icon: Globe,
            path: '/admin/profile',
            color: 'bg-cyan-500/10 text-cyan-600'
        },
        {
            id: 'security',
            title: 'Segurança',
            description: 'Logs de acesso e autenticação',
            icon: ShieldCheck,
            path: '/admin/security',
            color: 'bg-red-500/10 text-red-600'
        },
        {
            id: 'notifications',
            title: 'Notificações',
            description: 'Alertas e comunicações',
            icon: Bell,
            path: '/admin/notifications',
            color: 'bg-yellow-500/10 text-yellow-600'
        },
        {
            id: 'database',
            title: 'Banco de Dados',
            description: 'Backup e manutenção',
            icon: Database,
            path: '/admin/database',
            color: 'bg-gray-500/10 text-gray-600'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <header>
                <h1 className="text-3xl font-black uppercase tracking-tight italic">Configurações da Plataforma</h1>
                <p className="text-muted-foreground">Gerencie todos os aspectos administrativos do SEPI</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settingsCategories.map((item, index) => (
                    <motion.a
                        key={item.id}
                        href={`#${item.path}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                    >
                        <Card hover className="h-full border-border/50 transition-all group-hover:border-primary/30">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </div>
                                <div className="mt-6 space-y-1">
                                    <h3 className="font-black uppercase tracking-wider text-sm">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.a>
                ))}
            </div>

            {/* Quick Action Banner */}
            <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Settings className="w-24 h-24 rotate-12" />
                </div>
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h4 className="text-xl font-bold">Precisa de ajuda com a configuração?</h4>
                        <p className="text-sm text-muted-foreground max-w-lg">
                            Acesse nossa documentação ou entre em contato com o suporte técnico para assistência.
                        </p>
                    </div>
                    <Button variant="outline" className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest border-primary text-primary hover:bg-primary/10">
                        Ver Documentação
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
