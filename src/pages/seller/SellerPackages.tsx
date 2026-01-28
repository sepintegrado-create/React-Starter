import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Eye, Building2, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/user';

export function SellerPackages() {
    const { switchRole } = useAuth();

    const handleAccessDemo = () => {
        // Switch to company admin role to show demo
        switchRole(UserRole.COMPANY_ADMIN);
        window.location.hash = '#/company';
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Demonstração SEPI</h1>
                <p className="text-muted-foreground mt-1">Acesse um perfil completo de empresa para demonstrar aos clientes</p>
            </div>

            {/* Main Demo Access Card */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                            <Building2 className="w-10 h-10 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Perfil de Demonstração</CardTitle>
                    <CardDescription className="text-base">
                        Navegue por um perfil completo de administrador de empresa
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-white/50 rounded-xl p-6 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            O que você pode demonstrar:
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                <span className="text-sm">PDV (Ponto de Venda)</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                <span className="text-sm">Gestão de Produtos</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                <span className="text-sm">Controle de Estoque</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                <span className="text-sm">Agenda de Atendimentos</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                <span className="text-sm">Gestão Financeira</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                <span className="text-sm">Relatórios Completos</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                <span className="text-sm">Emissão de Notas Fiscais</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                <span className="text-sm">QR Code de Pagamento</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-900">
                            <strong>💡 Dica:</strong> Use este perfil para mostrar todas as funcionalidades do sistema SEPI aos seus clientes.
                            Você pode navegar livremente por todas as páginas e demonstrar como o sistema funciona na prática.
                        </p>
                    </div>

                    <Button
                        onClick={handleAccessDemo}
                        className="w-full h-14 text-lg font-bold"
                        size="lg"
                    >
                        <Eye className="w-5 h-5 mr-2" />
                        Acessar Perfil de Demonstração
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Você será redirecionado para o perfil de administrador da empresa "Bom Sabor"
                    </p>
                </CardContent>
            </Card>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">100%</div>
                        <p className="text-sm text-muted-foreground">Funcionalidades Disponíveis</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">Ilimitado</div>
                        <p className="text-sm text-muted-foreground">Tempo de Demonstração</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">Fácil</div>
                        <p className="text-sm text-muted-foreground">Retorno ao Painel</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
