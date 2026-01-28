import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Scan, Smartphone, Copy, Check, Download, Camera, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeScanner } from '../../components/ui/QRCodeScanner';

export function UserQRCodePage() {
    const { user } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [copied, setCopied] = useState(false);

    const userQrValue = `USER-${user?.id}`;

    const handleCopy = () => {
        setCopied(true);
        navigator.clipboard.writeText(userQrValue);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleScanComplete = (data: string) => {
        setIsScanning(false);
        console.log('Scanned data:', data);

        // Example: If it's an order URL, navigate to it
        if (data.includes('#/order/') || data.includes('api.sepi.pro')) {
            // Extract path or just use it
            if (data.includes('#')) {
                window.location.hash = data.split('#')[1];
            }
        } else {
            alert(`Código lido: ${data}`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight italic uppercase">QR Code</h1>
                    <p className="text-muted-foreground mt-1">Identificação e leitura de códigos na rede SEPI</p>
                </div>
                <Button onClick={() => setIsScanning(true)} className="gap-2 shadow-lg shadow-primary/20">
                    <Scan className="w-4 h-4" /> Escanear Código
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User ID QR Code */}
                <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
                    <CardHeader className="text-center">
                        <CardTitle className="italic font-black uppercase tracking-tight">Meu Cartão SEPI</CardTitle>
                        <CardDescription>Apresente este código em estabelecimentos parceiros</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center pb-8">
                        <div className="bg-white p-6 rounded-3xl border-4 border-primary shadow-2xl mb-6 relative group">
                            <QRCodeSVG
                                value={userQrValue}
                                size={200}
                                level="H"
                                includeMargin={false}
                            />
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                <Button variant="secondary" size="sm" className="font-bold" onClick={handleCopy}>
                                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                    {copied ? 'Copiado' : 'Copiar ID'}
                                </Button>
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <p className="font-black text-xl italic uppercase">{user?.name}</p>
                            <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">ID: {user?.id?.slice(0, 8)}...</p>
                        </div>

                        <div className="mt-8 flex gap-3 w-full">
                            <Button variant="outline" className="flex-1 gap-2 font-bold uppercase text-[10px]">
                                <Download className="w-4 h-4" /> Salvar Imagem
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Help / Info */}
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="italic font-black uppercase tracking-tight">Como usar?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shrink-0">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1 italic uppercase text-sm">Identificação Rápida</h4>
                                <p className="text-sm text-muted-foreground">Mostre seu QR Code para acumular pontos de fidelidade ou realizar check-in rápido.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-purple-100 rounded-xl text-purple-600 shrink-0">
                                <Scan className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1 italic uppercase text-sm">Pedidos Instantâneos</h4>
                                <p className="text-sm text-muted-foreground">Use o scanner para ler QR Codes em mesas ou quartos e abrir o cardápio digital automaticamente.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-green-100 rounded-xl text-green-600 shrink-0">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1 italic uppercase text-sm">Pagamentos SEPI</h4>
                                <p className="text-sm text-muted-foreground">Valide pagamentos e transferências lendo o código gerado pelo estabelecimento.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Scanner Modal */}
            <AnimatePresence>
                {isScanning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setIsScanning(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-card rounded-3xl overflow-hidden shadow-2xl border border-primary/20"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/20 rounded-xl">
                                        <Camera className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-black italic uppercase italic">Escanear Código</h2>
                                </div>
                                <button
                                    onClick={() => setIsScanning(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="aspect-square bg-black rounded-2xl overflow-hidden relative border-2 border-primary/50 shadow-inner">
                                    <QRCodeScanner
                                        onScan={handleScanComplete}
                                        onClose={() => setIsScanning(false)}
                                    />
                                </div>
                                <p className="mt-4 text-center text-sm text-muted-foreground font-medium">
                                    Posicione o QR Code dentro da área demarcada
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
