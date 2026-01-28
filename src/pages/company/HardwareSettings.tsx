import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Printer,
    Scale,
    Keyboard,
    Scan,
    Save,
    Settings,
    Usb,
    Network,
    Bluetooth,
    Cpu,
    CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { db } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { HardwareSettings } from '../../types/user';

export function HardwareSettingsPage() {
    const { currentCompany } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [settings, setSettings] = useState<HardwareSettings>({
        printer: {
            type: 'none',
            connection: 'usb',
            paperSize: '80mm',
            autoPrint: false
        },
        fiscal: {
            provider: 'none'
        },
        scale: {
            enabled: false,
            protocol: 'none'
        },
        scanner: {
            mode: 'keyboard'
        },
        keyboard: {
            shortcutsEnabled: true,
            layout: 'br'
        }
    });

    useEffect(() => {
        if (currentCompany?.settings?.hardware) {
            setSettings(currentCompany.settings.hardware);
        }
    }, [currentCompany]);

    const handleSave = async () => {
        if (!currentCompany) return;
        setIsSaving(true);
        try {
            db.saveCompanySettings(currentCompany.id, { hardware: settings });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving hardware settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight italic">Configurações de Hardware</h1>
                    <p className="text-muted-foreground">Configure periféricos, impressoras e balanças do PDV</p>
                </div>
                <Button
                    onClick={handleSave}
                    className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                    disabled={isSaving}
                >
                    {isSaving ? 'Salvando...' : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </header>

            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-600 font-bold uppercase text-xs tracking-widest"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    Configurações de hardware atualizadas com sucesso!
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Impressora Térmica */}
                <Card className="border-border/50 shadow-xl shadow-black/5 overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                <Printer className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Impressora de Recibos</CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Configuração de impressão térmica</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Tipo de Equipamento</label>
                                <select
                                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={settings.printer?.type}
                                    onChange={(e) => setSettings({ ...settings, printer: { ...settings.printer!, type: e.target.value as any } })}
                                >
                                    <option value="none">Nenhuma</option>
                                    <option value="thermal">Térmica Comum</option>
                                    <option value="fiscal">Fiscal (NFC-e/SAT)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Largura do Papel</label>
                                <select
                                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={settings.printer?.paperSize}
                                    onChange={(e) => setSettings({ ...settings, printer: { ...settings.printer!, paperSize: e.target.value as any } })}
                                >
                                    <option value="58mm">58mm (Pequena)</option>
                                    <option value="80mm">80mm (Grande)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Modelo / Driver</label>
                            <Input
                                placeholder="Ex: Epson TM-T20, Bematech 4200..."
                                value={settings.printer?.model}
                                onChange={(e) => setSettings({ ...settings, printer: { ...settings.printer!, model: e.target.value } })}
                                icon={<Settings className="w-4 h-4" />}
                            />
                        </div>

                        <div className="space-y-4 pt-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Tipo de Conexão</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'usb', label: 'USB', icon: Usb },
                                    { id: 'network', label: 'Rede/IP', icon: Network },
                                    { id: 'bluetooth', label: 'B-Tooth', icon: Bluetooth },
                                ].map((conn) => (
                                    <button
                                        key={conn.id}
                                        onClick={() => setSettings({ ...settings, printer: { ...settings.printer!, connection: conn.id as any } })}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${settings.printer?.connection === conn.id
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border text-muted-foreground hover:bg-muted'}`}
                                    >
                                        <conn.icon className="w-5 h-5 mb-2" />
                                        <span className="text-[10px] font-black uppercase">{conn.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/50">
                            <div className="space-y-0.5">
                                <p className="text-[11px] font-black uppercase tracking-tight">Impressão Automática</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Imprimir recibo ao finalizar venda</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, printer: { ...settings.printer!, autoPrint: !settings.printer?.autoPrint } })}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.printer?.autoPrint ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.printer?.autoPrint ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {settings.printer?.type === 'fiscal' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-primary ml-1">Provedor Fiscal</label>
                                    <select
                                        className="w-full h-10 px-4 rounded-xl border border-primary/20 bg-background text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                                        value={settings.fiscal?.provider}
                                        onChange={(e) => setSettings({ ...settings, fiscal: { ...settings.fiscal!, provider: e.target.value as any } })}
                                    >
                                        <option value="none">Selecione...</option>
                                        <option value="nfc-e">NFC-e (Online)</option>
                                        <option value="sat">SAT (Hardware CF-e)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-primary ml-1">Token CSC / CSCID</label>
                                    <Input
                                        placeholder="Digite o Token..."
                                        value={settings.fiscal?.token}
                                        onChange={(e) => setSettings({ ...settings, fiscal: { ...settings.fiscal!, token: e.target.value } })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <Button
                            variant="outline"
                            className="w-full h-11 rounded-xl border-dashed border-2 hover:border-primary hover:text-primary transition-all text-xs font-bold uppercase tracking-widest"
                            onClick={() => alert('Enviando página de teste para a impressora...')}
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir Teste
                        </Button>
                    </CardContent>
                </Card>

                {/* Balança */}
                <Card className="border-border/50 shadow-xl shadow-black/5 overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                                <Scale className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Balança Eletrônica</CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Integração com balanças de checkout</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/50">
                            <div className="space-y-0.5">
                                <p className="text-[11px] font-black uppercase tracking-tight">Ativar Integração</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Permitir leitura automática de peso</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, scale: { ...settings.scale!, enabled: !settings.scale?.enabled } })}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.scale?.enabled ? 'bg-blue-500' : 'bg-muted-foreground/30'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.scale?.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {settings.scale?.enabled && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-6 overflow-hidden pt-2"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Protocolo</label>
                                        <select
                                            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none uppercase"
                                            value={settings.scale?.protocol}
                                            onChange={(e) => setSettings({ ...settings, scale: { ...settings.scale!, protocol: e.target.value as any } })}
                                        >
                                            <option value="none">Selecione...</option>
                                            <option value="toledo">Toledo (P03)</option>
                                            <option value="filizola">Filizola</option>
                                            <option value="urano">Urano</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Velocidade (Baud)</label>
                                        <select
                                            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                                            value={settings.scale?.baudRate}
                                            onChange={(e) => setSettings({ ...settings, scale: { ...settings.scale!, baudRate: parseInt(e.target.value) } })}
                                        >
                                            <option value="2400">2400</option>
                                            <option value="4800">4800</option>
                                            <option value="9600">9600</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Porta de Comunicação</label>
                                    <Input
                                        placeholder="Ex: COM1, COM2, /dev/ttyUSB0..."
                                        value={settings.scale?.port}
                                        onChange={(e) => setSettings({ ...settings, scale: { ...settings.scale!, port: e.target.value } })}
                                        icon={<Cpu className="w-4 h-4" />}
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div className="p-4 rounded-2xl bg-blue-50 py-4 border border-blue-100 italic">
                            <p className="text-[10px] text-blue-600 font-bold uppercase leading-relaxed">
                                Tip: Para balanças sem conexão serial, utilize produtos com código de barras padrão EAN-13 (2) para leitura direta no PDV.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-11 rounded-xl border-dashed border-2 border-blue-200 hover:border-blue-500 hover:text-blue-600 transition-all text-xs font-bold uppercase tracking-widest text-blue-500"
                            onClick={() => alert('Aguardando resposta da balança... (Simulação: 1.450kg)')}
                        >
                            <Scale className="w-4 h-4 mr-2" />
                            Testar Captura de Peso
                        </Button>
                    </CardContent>
                </Card>

                {/* Leitor de Código de Barras */}
                <Card className="border-border/50 shadow-xl shadow-black/5 overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
                                <Scan className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Leitor de Códigos</CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Configuração de leitura óptica</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Modo de Operação</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSettings({ ...settings, scanner: { ...settings.scanner!, mode: 'keyboard' } })}
                                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${settings.scanner?.mode === 'keyboard'
                                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                                        : 'border-border text-muted-foreground hover:bg-muted'}`}
                                >
                                    <Keyboard className="w-6 h-6 mb-2" />
                                    <span className="text-[11px] font-black uppercase">Teclado Emulado</span>
                                    <span className="text-[9px] font-bold uppercase mt-1 opacity-70">Padrão USB Hid</span>
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, scanner: { ...settings.scanner!, mode: 'serial' } })}
                                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${settings.scanner?.mode === 'serial'
                                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                                        : 'border-border text-muted-foreground hover:bg-muted'}`}
                                >
                                    <Cpu className="w-6 h-6 mb-2" />
                                    <span className="text-[11px] font-black uppercase">Serial / RS232</span>
                                    <span className="text-[9px] font-bold uppercase mt-1 opacity-70">Drivers específicos</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Prefixo do Leitor</label>
                                <Input
                                    placeholder="Ex: $"
                                    value={settings.scanner?.prefix}
                                    onChange={(e) => setSettings({ ...settings, scanner: { ...settings.scanner!, prefix: e.target.value } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Sufixo (Enter)</label>
                                <Input
                                    placeholder="Ex: \n"
                                    value={settings.scanner?.suffix}
                                    onChange={(e) => setSettings({ ...settings, scanner: { ...settings.scanner!, suffix: e.target.value } })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Atalhos de Teclado */}
                <Card className="border-border/50 shadow-xl shadow-black/5 overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gray-500/10 rounded-xl text-gray-500">
                                <Keyboard className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Atalhos do PDV</CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Configurações de interface rápida</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/50">
                            <div className="space-y-0.5">
                                <p className="text-[11px] font-black uppercase tracking-tight">Ativar Atalhos F1-F12</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Habilitar teclas de função no PDV</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, keyboard: { ...settings.keyboard!, shortcutsEnabled: !settings.keyboard?.shortcutsEnabled } })}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.keyboard?.shortcutsEnabled ? 'bg-gray-700' : 'bg-muted-foreground/30'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.keyboard?.shortcutsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Layout do Teclado</label>
                            <select
                                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-bold focus:ring-2 focus:ring-gray-500/20 outline-none"
                                value={settings.keyboard?.layout}
                                onChange={(e) => setSettings({ ...settings, keyboard: { ...settings.keyboard!, layout: e.target.value as any } })}
                            >
                                <option value="br">ABNT2 (Português Brasil)</option>
                                <option value="us">QWERTY (Estados Unidos)</option>
                            </select>
                        </div>

                        <div className="space-y-3 pt-2">
                            <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Atalhos Padrão</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg text-[10px] font-bold uppercase">
                                    <span>F1: Buscar</span>
                                    <span className="text-muted-foreground italic">Padrão</span>
                                </div>
                                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg text-[10px] font-bold uppercase">
                                    <span>F5: Pagar</span>
                                    <span className="text-muted-foreground italic">Padrão</span>
                                </div>
                                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg text-[10px] font-bold uppercase">
                                    <span>Esc: Cancelar</span>
                                    <span className="text-muted-foreground italic">Padrão</span>
                                </div>
                                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg text-[10px] font-bold uppercase">
                                    <span>Ins: Cliente</span>
                                    <span className="text-muted-foreground italic">Padrão</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
