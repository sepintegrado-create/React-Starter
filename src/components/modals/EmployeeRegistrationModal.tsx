import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Copy, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { db } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

interface EmployeeRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const generateEmployeeCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const randomNumbers = Math.floor(1000 + Math.random() * 9000).toString();
    return `${randomLetters}${randomNumbers}`;
};

export function EmployeeRegistrationModal({ isOpen, onClose }: EmployeeRegistrationModalProps) {
    const { user, updateUser } = useAuth();
    const [generatedCode, setGeneratedCode] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setGeneratedCode(generateEmployeeCode());
            setCopied(false);
        }
    }, [isOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = () => {
        setGeneratedCode(generateEmployeeCode());
        setCopied(false);
    };

    const handleActivate = () => {
        if (user) {
            const updatedData = { employeeCode: generatedCode };
            db.saveUser({ ...user, ...updatedData });
            updateUser(updatedData);
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Código de Vínculo de Funcionário"
            maxWidth="max-w-md"
        >
            <div className="py-2 space-y-6">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <Briefcase className="w-8 h-8" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold">Seu Código de Identificação</h3>
                    <p className="text-sm text-muted-foreground">
                        Informe este código ao administrador da empresa para que ele possa liberar seu acesso no sistema.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-muted border-2 border-dashed border-primary/30 relative overflow-hidden group">
                    <div className="text-center">
                        <span className="text-4xl font-black tracking-[0.2em] font-mono text-primary select-all">
                            {generatedCode}
                        </span>
                    </div>

                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-2">
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase">
                        <ShieldCheck className="w-4 h-4" /> Importante
                    </div>
                    <p className="text-xs text-blue-600 leading-relaxed">
                        Este código é único e servirá para localizar seu perfil. Após o administrador vincular sua conta, você terá acesso imediato ao painel da empresa.
                    </p>
                </div>

                <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={handleActivate}>
                    Fechar e Ativar Código
                </Button>

                <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                    SEPI • Gestão Corporativa
                </p>
            </div>
        </Modal>
    );
}
