import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Save, Palette, Mail, Phone, MessageSquare, Instagram, Linkedin, Facebook, Link as LinkIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { db } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { CompanySettings } from '../../types/user';

export function CompanyPublicProfileSettingsPage() {
    const { currentCompany } = useAuth();
    const [settings, setSettings] = useState<Partial<CompanySettings> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentCompany) {
            const data = db.getCompanyById(currentCompany.id);
            setSettings(data.settings || {});
        }
    }, [currentCompany]);

    const handleSave = async () => {
        if (!settings || !currentCompany) return;
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        db.saveCompanySettings(currentCompany.id, settings);
        setIsSaving(false);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newSettings = { ...settings, logo: reader.result as string };
                setSettings(newSettings);
                console.log('Logo uploaded:', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newSettings = { ...settings, coverPhoto: reader.result as string };
                setSettings(newSettings);
                console.log('Cover uploaded:', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!settings || !currentCompany) return null;

    return (
        <div className="space-y-8 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Perfil da Empresa</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Personalize como sua marca aparece para seus clientes</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => window.open(`#/profile?id=${currentCompany.id}`, '_blank')}>
                        <Globe className="w-4 h-4 mr-2" />
                        Ver Perfil Público
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
                <div className="h-64 md:h-80 w-full rounded-3xl bg-muted overflow-hidden relative border border-border">
                    {settings.coverPhoto ? (
                        <img src={settings.coverPhoto} className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5" />
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-4 right-4">
                        <label className="bg-white/90 hover:bg-white text-black px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 shadow-xl backdrop-blur-md border border-white/20">
                            <Palette className="w-4 h-4" />
                            Alterar Capa
                            <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                        </label>
                    </div>
                </div>

                {/* Profile Photo */}
                <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-card p-2 shadow-2xl border border-border overflow-hidden">
                            {settings.logo ? (
                                <img src={settings.logo} className="w-full h-full object-cover rounded-[2rem]" />
                            ) : (
                                <div className="w-full h-full rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary text-4xl font-black italic">
                                    {currentCompany.tradeName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-3 bg-primary text-primary-foreground rounded-2xl shadow-xl cursor-pointer hover:scale-110 transition-transform border-4 border-white">
                            <Palette className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </label>
                    </div>
                    <div className="mb-4 hidden md:block">
                        <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">{currentCompany.tradeName}</h2>
                        <p className="text-muted-foreground font-bold flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            sepi.pro/perfil/{currentCompany.id}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
                {/* Left Column: Essential Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-[2rem]">
                        <CardHeader>
                            <CardTitle className="text-xl font-black uppercase italic flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                Identidade e Bio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Input
                                label="Nome de Exibição (Fantasia)"
                                placeholder="Como o público verá você"
                                value={currentCompany.tradeName}
                                readOnly
                                className="h-12 text-lg font-bold opacity-70"
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                                    Biografia da Empresa
                                    <span className="text-xs font-normal text-muted-foreground">{(settings.bio || '').length}/200</span>
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all resize-none h-32 text-sm leading-relaxed font-medium"
                                    placeholder="Conte um pouco sobre sua empresa, sua missão e o que você oferece..."
                                    value={settings.bio || ''}
                                    onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-[2rem]">
                        <CardHeader>
                            <CardTitle className="text-xl font-black uppercase italic flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary" />
                                Canais de Atendimento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="E-mail de Contato"
                                placeholder="contato@empresa.com"
                                type="email"
                                value={settings.socialLinks?.whatsapp || ''} // Reusing for contact info
                                onChange={(e) => setSettings({
                                    ...settings,
                                    socialLinks: { ...settings.socialLinks, whatsapp: e.target.value }
                                })}
                                icon={<Mail className="w-4 h-4" />}
                                className="font-bold"
                            />
                            <Input
                                label="WhatsApp Comercial"
                                placeholder="(11) 99999-9999"
                                value={settings.socialLinks?.whatsapp || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    socialLinks: { ...settings.socialLinks, whatsapp: e.target.value }
                                })}
                                icon={<MessageSquare className="w-4 h-4" />}
                                className="font-bold"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Style & Social */}
                <div className="space-y-8">
                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
                        <div className="h-2 bg-primary" style={{ backgroundColor: settings.primaryColor }} />
                        <CardHeader>
                            <CardTitle className="text-xl font-black uppercase italic flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                Branding
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-4">
                                <label className="text-sm font-black uppercase tracking-widest block">Cor Principal</label>
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <input
                                            type="color"
                                            className="w-14 h-14 rounded-2xl cursor-pointer border-none p-0 overflow-hidden"
                                            value={settings.primaryColor || '#000000'}
                                            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                        />
                                    </div>
                                    <Input
                                        className="flex-1 font-mono uppercase font-bold"
                                        value={settings.primaryColor || '#000000'}
                                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-[2rem]">
                        <CardHeader>
                            <CardTitle className="text-xl font-black uppercase italic flex items-center gap-2">
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
                                className="font-bold"
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
                                className="font-bold"
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
                                className="font-bold"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
