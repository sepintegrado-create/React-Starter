import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { QrCode, Download, Share2, Copy, Check, X, Camera } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { QRCodeScanner } from '../../components/ui/QRCodeScanner';

import { db } from '../../services/db';

function QRCodeDisplay({ value, size = 200 }: { value: string; size?: number }) {
    return (
        <div
            className="bg-white p-4 rounded-lg border-2 border-border inline-block"
        >
            <QRCodeSVG
                value={value}
                size={size}
                level="H"
                includeMargin={false}
            />
        </div>
    );
}

export function QRCodePage() {
    const { currentCompany } = useAuth();
    const [qrType, setQrType] = useState<'payment' | 'table' | 'room'>('payment');
    const [amount, setAmount] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [copied, setCopied] = useState(false);

    // Validation State
    const [validationCode, setValidationCode] = useState('');
    const [validationResult, setValidationResult] = useState<any>(null);
    const [showScanner, setShowScanner] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        navigator.clipboard.writeText(qrValue);
        setTimeout(() => setCopied(false), 2000);
    };

    // Construct Public URL
    const baseUrl = window.location.origin + window.location.pathname;
    const qrValue = qrType === 'payment'
        ? `PIX-${currentCompany?.cnpj}-${amount || '0.00'}`
        : `${baseUrl}#/order/${currentCompany?.id}/${qrType}/${tableNumber || '1'}`;

    const handleValidate = () => {
        // Simple mock validation logic, or checking DB
        // If it looks like a URL, parse it
        try {
            if (validationCode.includes('/order/')) {
                const parts = validationCode.split('/order/')[1].split('/');
                const [companyId, type, number] = parts;
                setValidationResult({
                    type: type === 'table' ? 'Mesa' : 'Quarto',
                    number: number,
                    valid: true,
                    message: `QR Code válido para ${type === 'table' ? 'Mesa' : 'Quarto'} ${number}`
                });
                return;
            }
            throw new Error('Formato inválido');
        } catch (e) {
            setValidationResult({ valid: false, message: 'QR Code inválido ou não reconhecido.' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">QR Code</h1>
                <p className="text-muted-foreground mt-1">Gere QR Codes para pagamentos e identificação</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Code Generator */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gerar QR Code</CardTitle>
                        <CardDescription>Crie QR Codes para Cardápio Digital</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Type Selector */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Tipo de QR Code
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'payment', label: '💰 Pagamento', desc: 'PIX' },
                                    { value: 'table', label: '🍽️ Mesa', desc: 'Restaurante' },
                                    { value: 'room', label: '🛏️ Quarto', desc: 'Hotel' },
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setQrType(type.value as any)}
                                        className={`p-3 rounded-lg border-2 transition-all text-left ${qrType === type.value
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="font-semibold text-sm">{type.label}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{type.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Fields */}
                        {qrType === 'payment' && (
                            <Input
                                label="Valor (opcional)"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                helperText="Deixe vazio para valor livre"
                            />
                        )}

                        {(qrType === 'table' || qrType === 'room') && (
                            <Input
                                label={qrType === 'table' ? 'Número da Mesa' : 'Número do Quarto'}
                                type="number"
                                placeholder={qrType === 'table' ? '1' : '101'}
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                required
                            />
                        )}

                        <div className="pt-4 border-t">
                            <p className="text-sm font-medium text-muted-foreground mb-3">Link / Código Gerado</p>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                                <span className="flex-1 truncate text-xs">{qrValue}</span>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 rounded-lg hover:bg-background transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* QR Code Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Visualização</CardTitle>
                        <CardDescription>Preview do QR Code gerado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center space-y-4">
                            <QRCodeDisplay value={qrValue} size={250} />

                            <div className="text-center">
                                <p className="font-semibold">{currentCompany?.tradeName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {qrType === 'payment' && `Pagamento PIX${amount ? ` - R$ ${amount}` : ''}`}
                                    {qrType === 'table' && `Mesa ${tableNumber || '#'}`}
                                    {qrType === 'room' && `Quarto ${tableNumber || '#'}`}
                                </p>
                            </div>

                            <div className="flex gap-2 w-full">
                                <Button variant="outline" className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    Baixar
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Compartilhar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Validation Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Validar QR Code</CardTitle>
                    <CardDescription>Simule a leitura ou valide um código manualmente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Cole o código ou URL aqui..."
                            className="flex-1"
                            value={validationCode}
                            onChange={(e) => setValidationCode(e.target.value)}
                        />
                        <Button onClick={handleValidate}>Validar</Button>
                        <Button
                            onClick={() => setShowScanner(true)}
                            variant="outline"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Escanear
                        </Button>
                    </div>
                    {validationResult && (
                        <div className={`p-4 rounded-xl border ${validationResult.valid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                            <div className="flex items-center gap-2 font-bold mb-1">
                                {validationResult.valid ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                {validationResult.valid ? 'QR Code Válido' : 'Inválido'}
                            </div>
                            <p>{validationResult.message}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* QR Scanner Modal */}
            {showScanner && (
                <QRCodeScanner
                    onScan={(data) => {
                        setValidationCode(data);
                        setShowScanner(false);
                        // Auto-validate after scan
                        setTimeout(() => {
                            try {
                                if (data.includes('/order/')) {
                                    const parts = data.split('/order/')[1].split('/');
                                    const [companyId, type, number] = parts;
                                    setValidationResult({
                                        type: type === 'table' ? 'Mesa' : 'Quarto',
                                        number: number,
                                        valid: true,
                                        message: `QR Code válido para ${type === 'table' ? 'Mesa' : 'Quarto'} ${number}`
                                    });
                                } else {
                                    throw new Error('Formato inválido');
                                }
                            } catch (e) {
                                setValidationResult({ valid: false, message: 'QR Code inválido ou não reconhecido.' });
                            }
                        }, 100);
                    }}
                    onClose={() => setShowScanner(false)}
                    title="Validar QR Code"
                    description="Aponte a câmera para o QR Code"
                />
            )}
        </div>
    );
}
