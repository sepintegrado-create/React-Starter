import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Save, Palette, Mail, Phone, MessageSquare, Instagram, Linkedin, Facebook, Link as LinkIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { db } from '../../services/db';
import { PlatformSettings } from '../../types/user';

export function PublicProfileSettingsPage() {
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const data = db.getPlatformSettings();
        setSettings(data);
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        db.savePlatformSettings(settings);
        setIsSaving(false);
    };

    if (!settings) return null;

    return (
        <div className="space-y-8 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Personalização da Marca</h1>
                    <p className="text-muted-foreground mt-1">Configure como sua marca aparece para o mundo</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => window.open('#/profile', '_blank')}>
                        <Globe className="w-4 h-4 mr-2" />
                        Ver Página Pública
                    </Button>
                    <Button onClick={handleSave} isLoading={isSaving} className="shadow-lg shadow-primary/20">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            {/* Profile Preview / Header Design */}
            <div className="relative group">
                {/* Cover Image */}
                <div className="h-64 md:h-80 w-full rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 overflow-hidden relative border border-border">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-4 right-4">
                        <label className="bg-white/90 hover:bg-white text-black px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xl backdrop-blur-md border border-white/20">
                            <Palette className="w-4 h-4" />
                            Alterar Capa
                            <input type="file" className="hidden" accept="image/*" />
                        </label>
                    </div>
                </div>

                {/* Profile Photo */}
                <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white p-2 shadow-2xl border border-border overflow-hidden">
                            <div className="w-full h-full rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-black">
                                {settings.name.charAt(0)}
                            </div>
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-3 bg-primary text-primary-foreground rounded-2xl shadow-xl cursor-pointer hover:scale-110 transition-transform border-4 border-white">
                            <Palette className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" />
                        </label>
                    </div>
                    <div className="mb-4 hidden md:block">
                        <h2 className="text-2xl font-black text-foreground">{settings.name}</h2>
                        <p className="text-muted-foreground flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            perfil.sepi.pro/sua-empresa
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
                {/* Left Column: Essential Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                Identidade e Bio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Input
                                label="Nome da Marca"
                                placeholder="Como o público verá você"
                                value={settings.name}
                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                className="h-12 text-lg font-medium"
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center justify-between">
                                    Biografia / Manifesto
                                    <span className="text-xs font-normal text-muted-foreground">{settings.welcomeMessage.length}/200</span>
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background/50 focus:ring-2 focus:ring-primary outline-none transition-all resize-none h-32 text-sm leading-relaxed"
                                    placeholder="Conte um pouco sobre sua marca, sua missão e o que você oferece..."
                                    value={settings.welcomeMessage}
                                    onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary" />
                                Canais de Atendimento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="E-mail Público"
                                placeholder="atendimento@exemplo.com"
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                icon={<Mail className="w-4 h-4" />}
                            />
                            <Input
                                label="WhatsApp / Telefone"
                                placeholder="(11) 99999-9999"
                                value={settings.phone}
                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                icon={<MessageSquare className="w-4 h-4" />}
                            />
                            <Input
                                label="Link de Suporte / FAQ"
                                placeholder="https://ajuda.suaempresa.com"
                                className="md:col-span-2"
                                value={settings.supportUrl || ''}
                                onChange={(e) => setSettings({ ...settings, supportUrl: e.target.value })}
                                icon={<LinkIcon className="w-4 h-4" />}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Style & Social */}
                <div className="space-y-8">
                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                        <div className="h-2 bg-primary" style={{ backgroundColor: settings.primaryColor }} />
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                Estilo Visual
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-4">
                                <label className="text-sm font-bold block">Cor do Tema</label>
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <input
                                            type="color"
                                            className="w-14 h-14 rounded-2xl cursor-pointer border-none p-0 overflow-hidden"
                                            value={settings.primaryColor}
                                            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                        />
                                    </div>
                                    <Input
                                        className="flex-1 font-mono uppercase"
                                        value={settings.primaryColor}
                                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Essa cor será aplicada em botões, links e destaques no seu perfil.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Redes Sociais
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Instagram"
                                placeholder="@sua_marca"
                                value={settings.socialLinks?.instagram || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    socialLinks: { ...settings.socialLinks, instagram: e.target.value }
                                })}
                                icon={<Instagram className="w-4 h-4" />}
                            />
                            <Input
                                label="Facebook"
                                placeholder="facebook.com/suamarca"
                                value={settings.socialLinks?.facebook || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    socialLinks: { ...settings.socialLinks, facebook: e.target.value }
                                })}
                                icon={<Facebook className="w-4 h-4" />}
                            />
                            <Input
                                label="LinkedIn"
                                placeholder="linkedin.com/company/suamarca"
                                value={settings.socialLinks?.linkedin || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    socialLinks: { ...settings.socialLinks, linkedin: e.target.value }
                                })}
                                icon={<Linkedin className="w-4 h-4" />}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

