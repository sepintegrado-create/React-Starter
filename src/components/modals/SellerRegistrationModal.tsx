import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Copy, RefreshCw, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { db } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

interface SellerRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const generateSellerCode = () => {
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `VEND-${num}`;
};

export function SellerRegistrationModal({ isOpen, onClose }: SellerRegistrationModalProps) {
    const { user, updateUser } = useAuth();
    const [generatedCode, setGeneratedCode] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setGeneratedCode(generateSellerCode());
            setCopied(false);
        }
    }, [isOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = () => {
        setGeneratedCode(generateSellerCode());
        setCopied(false);
    };

    const handleActivate = () => {
        if (user) {
            const updatedData = { sellerCode: generatedCode };
            db.saveUser({ ...user, ...updatedData });
            updateUser(updatedData);
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Cadastro de Vendedor parceiro"
            maxWidth="max-w-md"
        >
            <div className="py-2 space-y-6">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold">Seu Código de Vendedor</h3>
                    <p className="text-sm text-muted-foreground">
                        Use este código para indicar novos clientes. Você receberá comissões por cada assinatura realizada com seu código.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-muted border-2 border-dashed border-purple-300 relative overflow-hidden group">
                    <div className="text-center">
                        <span className="text-4xl font-black tracking-[0.2em] font-mono text-purple-600 select-all">
                            {generatedCode}
                        </span>
                    </div>

                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleCopy}
                        className="flex-1 gap-2"
                        variant={copied ? "outline" : "primary"}
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                Copiado!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copiar Código
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerate}
                        title="Gerar novo código"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 space-y-3">
                    <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase">
                        <ShieldCheck className="w-4 h-4" /> Como funciona
                    </div>
                    <ul className="text-xs text-purple-600 space-y-2 list-none p-0">
                        <li className="flex items-start gap-2">
                            <span className="text-purple-400 font-black">•</span>
                            Indique o SEPI para empresas e negócios.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-400 font-black">•</span>
                            No cadastro, o cliente informa seu código.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-400 font-black">•</span>
                            <span className="font-bold">Ganhe 10% do valor do pacote</span> ou <span className="font-bold">100% da 2ª mensalidade</span>.
                        </li>
                    </ul>
                </div>

                <Button variant="ghost" className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50" onClick={handleActivate}>
                    Fechar e Ativar Perfil
                </Button>

                <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                    SEPI • Programa de Parceiros
                </p>
            </div>
        </Modal>
    );
}
