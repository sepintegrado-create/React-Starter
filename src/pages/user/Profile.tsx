import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User as UserIcon, Mail, Phone, Shield, Camera, Save, MapPin,
    Lock, Key, Bell, Eye, Smartphone, LogOut, Trash2, AlertTriangle, ArrowRight,
    Building2, Briefcase, TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { EmployeeRegistrationModal } from '../../components/modals/EmployeeRegistrationModal';
import { SellerRegistrationModal } from '../../components/modals/SellerRegistrationModal';

export function UserProfilePage() {
    const { user, switchRole } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [showSellerModal, setShowSellerModal] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: 'Rua das Flores, 123 - São Paulo, SP'
    });

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: user?.twoFactorEnabled || false,
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotions: false,
        newsletter: true,
    });

    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public' as 'public' | 'private' | 'friends',
        showEmail: false,
        showPhone: false,
        allowMessages: true,
    });

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Saving profile:', profileData);
        setIsEditing(false);
        // TODO: Integrate with API
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }
        console.log('Changing password');
        setSecurityData({ ...securityData, currentPassword: '', newPassword: '', confirmPassword: '' });
        // TODO: Integrate with API
    };

    const handleToggle2FA = () => {
        setSecurityData({ ...securityData, twoFactorEnabled: !securityData.twoFactorEnabled });
        // TODO: Integrate with API
    };

    const handleSaveNotifications = () => {
        console.log('Saving notifications:', notificationSettings);
        // TODO: Integrate with API
    };

    const handleSavePrivacy = () => {
        console.log('Saving privacy:', privacySettings);
        // TODO: Integrate with API
    };

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: UserIcon },
        { id: 'security', label: 'Segurança', icon: Shield },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'privacy', label: 'Privacidade', icon: Eye },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
                <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais e preferências</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-colors relative ${activeTab === tab.id
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - User Card */}
                <Card className="lg:col-span-1">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-black italic border-4 border-background shadow-xl">
                                {profileData.name.charAt(0)}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-background border-2 border-border rounded-full shadow-lg hover:bg-accent transition-colors">
                                <Camera className="w-4 h-4 text-primary" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold mt-4">{profileData.name}</h3>
                        <p className="text-sm text-muted-foreground">{profileData.email}</p>
                        <div className="mt-6 pt-6 border-t border-border space-y-2">
                            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-green-600 bg-green-50 py-2 rounded-lg">
                                <Shield className="w-4 h-4" /> Conta Verificada
                            </div>
                            {securityData.twoFactorEnabled && (
                                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-blue-600 bg-blue-50 py-2 rounded-lg">
                                    <Key className="w-4 h-4" /> 2FA Ativo
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Informações Pessoais</CardTitle>
                                        {!isEditing && (
                                            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                                                Editar
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSaveProfile} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-black uppercase text-muted-foreground">Nome Completo:</label>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        disabled={!isEditing}
                                                        className="w-full pl-10 p-2.5 rounded-lg border border-input bg-background font-medium disabled:opacity-60"
                                                        value={profileData.name}
                                                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-black uppercase text-muted-foreground">E-mail:</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        disabled={!isEditing}
                                                        className="w-full pl-10 p-2.5 rounded-lg border border-input bg-background font-medium disabled:opacity-60"
                                                        value={profileData.email}
                                                        onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-black uppercase text-muted-foreground">Telefone:</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        disabled={!isEditing}
                                                        className="w-full pl-10 p-2.5 rounded-lg border border-input bg-background font-medium disabled:opacity-60"
                                                        value={profileData.phone}
                                                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-black uppercase text-muted-foreground">Endereço Principal:</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        disabled={!isEditing}
                                                        className="w-full pl-10 p-2.5 rounded-lg border border-input bg-background font-medium disabled:opacity-60"
                                                        value={profileData.address}
                                                        onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="pt-4 flex justify-end gap-3">
                                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                                    Cancelar
                                                </Button>
                                                <Button type="submit" className="gap-2">
                                                    <Save className="w-4 h-4" /> Salvar Alterações
                                                </Button>
                                            </div>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Seller Status Info */}
                            {user?.sellerCode && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Card className="border-purple-200 bg-purple-50/30 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <TrendingUp className="w-24 h-24 text-purple-600" />
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="text-purple-700 flex items-center gap-2 text-xs uppercase font-black tracking-tighter">
                                                <TrendingUp className="w-4 h-4" /> Perfil de Vendedor Parceiro
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 relative z-10 shadow-sm">
                                                <div>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Seu Código de Indicação</p>
                                                    <p className="text-3xl font-black font-mono text-purple-600 tracking-tighter">{user.sellerCode}</p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-lg shadow-purple-200"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(user.sellerCode!);
                                                            alert('Código copiado com sucesso!');
                                                        }}
                                                    >
                                                        Copiar Código
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-[10px] uppercase font-bold text-purple-600 border-purple-100 hover:bg-purple-50"
                                                        onClick={() => switchRole('SELLER' as any)}
                                                    >
                                                        Assumir Função de Vendedor
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Company Links / Employee Status */}
                            {((user?.employeeOf && user.employeeOf.length > 0) || user?.employeeCode) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="border-blue-100 bg-blue-50/20">
                                        <CardHeader>
                                            <CardTitle className="text-blue-700 flex items-center gap-2 text-xs uppercase font-black tracking-tighter">
                                                <Briefcase className="w-4 h-4" /> Vínculos e Funções
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {user?.employeeOf && user.employeeOf.length > 0 ? (
                                                <div className="space-y-3">
                                                    {user.employeeOf.map((link, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                                                    <Building2 className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm">Empresa ID: {link.companyId}</p>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-black">Função: Colaborador • Ativo desde {new Date(link.hiredAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                                                                onClick={() => switchRole('EMPLOYEE' as any, link.companyId)}
                                                            >
                                                                Assumir Função
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-white/60 border border-dashed border-blue-200 rounded-xl text-center">
                                                    <p className="text-sm font-bold text-blue-700">Aguardando Vínculo</p>
                                                    <p className="text-xs text-muted-foreground">Seu código <span className="font-mono font-bold text-blue-600">{user?.employeeCode}</span> está aguardando ativação por um administrador.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Account Types / Upgrades */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => window.location.hash = '#/auth/register-company'}
                                    className="cursor-pointer"
                                >
                                    <Card className="h-full border-primary/20 hover:border-primary transition-all bg-gradient-to-br from-primary/5 to-transparent">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-lg">Cadastrar Empresa</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Seja o dono do seu próprio negócio. Escolha seu plano e comece agora.
                                                    </p>
                                                    <div className="pt-2 text-xs font-black uppercase text-primary tracking-widest flex items-center gap-1 group">
                                                        Ir para Cadastro <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setShowEmployeeModal(true)}
                                    className="cursor-pointer"
                                >
                                    <Card className="h-full border-blue-200 hover:border-blue-400 transition-all bg-gradient-to-br from-blue-50 to-transparent">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                                                    <Briefcase className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-lg">Registrar como Funcionário</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Gerar código de identificação para vinculação por um administrador.
                                                    </p>
                                                    <div className="pt-2 text-xs font-black uppercase text-blue-600 tracking-widest flex items-center gap-1 group">
                                                        Gerar Código <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {!user?.sellerCode && (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setShowSellerModal(true)}
                                        className="cursor-pointer"
                                    >
                                        <Card className="h-full border-purple-200 hover:border-purple-400 transition-all bg-gradient-to-br from-purple-50 to-transparent">
                                            <CardContent className="pt-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-200">
                                                        <TrendingUp className="w-6 h-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="font-bold text-lg">Seja um Vendedor</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Ganhe comissões indicando o SEPI para outros negócios.
                                                        </p>
                                                        <div className="pt-2 text-xs font-black uppercase text-purple-600 tracking-widest flex items-center gap-1 group">
                                                            Saiba Mais <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Change Password */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alterar Senha</CardTitle>
                                    <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-muted-foreground">Senha Atual</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="password"
                                                    className="w-full pl-10 p-2.5 rounded-lg border border-input bg-background font-medium"
                                                    value={securityData.currentPassword}
                                                    onChange={e => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                                    placeholder="Digite sua senha atual"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-muted-foreground">Nova Senha</label>
                                                <div className="relative">
                                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="password"
                                                        className="w-full pl-10 p-2.5 rounded-lg border border-input bg-background font-medium"
                                                        value={securityData.newPassword}
                                                        onChange={e => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                                        placeholder="Digite a nova senha"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-muted-foreground">Confirmar Senha</label>
                                                <div className="relative">
                                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="password"
                                                        className="w-full pl-10 p-2.5 rounded-lg border border-input bg-background font-medium"
                                                        value={securityData.confirmPassword}
                                                        onChange={e => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                                        placeholder="Confirme a nova senha"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button type="submit">Alterar Senha</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Two-Factor Authentication */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Autenticação de Dois Fatores (2FA)</CardTitle>
                                    <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="w-8 h-8 text-primary" />
                                            <div>
                                                <p className="font-bold">Autenticação por Aplicativo</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {securityData.twoFactorEnabled ? 'Ativo' : 'Inativo'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleToggle2FA}
                                            variant={securityData.twoFactorEnabled ? 'destructive' : 'primary'}
                                        >
                                            {securityData.twoFactorEnabled ? 'Desativar' : 'Ativar'}
                                        </Button>
                                    </div>
                                    {securityData.twoFactorEnabled && (
                                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-800">
                                                ✓ Sua conta está protegida com autenticação de dois fatores
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Active Sessions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sessões Ativas</CardTitle>
                                    <CardDescription>Gerencie os dispositivos conectados à sua conta</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Smartphone className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold">Dispositivo Atual</p>
                                                    <p className="text-sm text-muted-foreground">Windows • Chrome • São Paulo, BR</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                                Ativo Agora
                                            </span>
                                        </div>
                                        <Button variant="outline" className="w-full gap-2">
                                            <LogOut className="w-4 h-4" />
                                            Encerrar Todas as Outras Sessões
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Preferências de Notificação</CardTitle>
                                    <CardDescription>Escolha como e quando deseja receber notificações</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Notification Channels */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-sm uppercase text-muted-foreground">Canais de Notificação</h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="font-bold">E-mail</p>
                                                        <p className="text-sm text-muted-foreground">Receber notificações por e-mail</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.emailNotifications}
                                                    onChange={e => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                            </label>
                                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Bell className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="font-bold">Push</p>
                                                        <p className="text-sm text-muted-foreground">Notificações no navegador</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.pushNotifications}
                                                    onChange={e => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                            </label>
                                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Phone className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="font-bold">SMS</p>
                                                        <p className="text-sm text-muted-foreground">Mensagens de texto</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.smsNotifications}
                                                    onChange={e => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Notification Types */}
                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <h3 className="font-bold text-sm uppercase text-muted-foreground">Tipos de Notificação</h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                                <div>
                                                    <p className="font-bold">Atualizações de Pedidos</p>
                                                    <p className="text-sm text-muted-foreground">Status de pedidos e entregas</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.orderUpdates}
                                                    onChange={e => setNotificationSettings({ ...notificationSettings, orderUpdates: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                            </label>
                                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                                <div>
                                                    <p className="font-bold">Promoções e Ofertas</p>
                                                    <p className="text-sm text-muted-foreground">Descontos e novidades</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.promotions}
                                                    onChange={e => setNotificationSettings({ ...notificationSettings, promotions: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                            </label>
                                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                                <div>
                                                    <p className="font-bold">Newsletter</p>
                                                    <p className="text-sm text-muted-foreground">Dicas e conteúdos exclusivos</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.newsletter}
                                                    onChange={e => setNotificationSettings({ ...notificationSettings, newsletter: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleSaveNotifications}>Salvar Preferências</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Privacy Tab */}
                    {activeTab === 'privacy' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configurações de Privacidade</CardTitle>
                                    <CardDescription>Controle quem pode ver suas informações</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-muted-foreground">Visibilidade do Perfil</label>
                                            <select
                                                value={privacySettings.profileVisibility}
                                                onChange={e => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value as any })}
                                                className="w-full p-2.5 rounded-lg border border-input bg-background font-medium"
                                            >
                                                <option value="public">Público - Todos podem ver</option>
                                                <option value="friends">Amigos - Apenas conexões</option>
                                                <option value="private">Privado - Apenas eu</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-border">
                                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                                <div>
                                                    <p className="font-bold">Mostrar E-mail</p>
                                                    <p className="text-sm text-muted-foreground">Permitir que outros vejam seu e-mail</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={privacySettings.showEmail}
                                                    onChange={e => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                            </label>
                                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                                <div>
                                                    <p className="font-bold">Mostrar Telefone</p>
                                                    <p className="text-sm text-muted-foreground">Permitir que outros vejam seu telefone</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={privacySettings.showPhone}
                                                    onChange={e => setPrivacySettings({ ...privacySettings, showPhone: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                            </label>
                                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                                <div>
                                                    <p className="font-bold">Permitir Mensagens</p>
                                                    <p className="text-sm text-muted-foreground">Receber mensagens de outros usuários</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={privacySettings.allowMessages}
                                                    onChange={e => setPrivacySettings({ ...privacySettings, allowMessages: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleSavePrivacy}>Salvar Configurações</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Data Management */}
                            <Card className="border-destructive/20">
                                <CardHeader className="bg-destructive/5">
                                    <CardTitle className="text-destructive uppercase italic font-black">Zona de Risco</CardTitle>
                                    <CardDescription>Ações irreversíveis para sua conta e dados</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                                        <div>
                                            <p className="font-bold">Baixar Meus Dados</p>
                                            <p className="text-sm text-muted-foreground">Exportar todas as suas informações (LGPD)</p>
                                        </div>
                                        <Button variant="outline" size="sm">Download</Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                                        <div>
                                            <p className="font-bold text-destructive">Excluir Conta</p>
                                            <p className="text-sm text-muted-foreground">Remover permanentemente todos os seus dados</p>
                                        </div>
                                        <Button variant="destructive" size="sm" className="gap-2">
                                            <Trash2 className="w-4 h-4" />
                                            Excluir
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>

            <EmployeeRegistrationModal
                isOpen={showEmployeeModal}
                onClose={() => setShowEmployeeModal(false)}
            />
            <SellerRegistrationModal
                isOpen={showSellerModal}
                onClose={() => setShowSellerModal(false)}
            />
        </div>
    );
}
