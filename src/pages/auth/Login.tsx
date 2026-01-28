import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/validators';

export function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validation
        const newErrors: typeof errors = {};
        if (!email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Email inválido';
        }
        if (!password) {
            newErrors.password = 'Senha é obrigatória';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            // Redirect will be handled by App component based on auth state
        } catch (error) {
            setErrors({ general: error instanceof Error ? error.message : 'Erro ao fazer login' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                                <LogIn className="w-8 h-8 text-primary-foreground" />
                            </div>
                        </div>
                        <CardTitle>Bem-vindo ao SEPI</CardTitle>
                        <CardDescription>Sistema Empresarial Profissional Integrado</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {errors.general && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    {errors.general}
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-3 top-9 h-5 w-5 text-muted-foreground" />
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={errors.email}
                                    className="pl-10"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-9 h-5 w-5 text-muted-foreground" />
                                <Input
                                    label="Senha"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    error={errors.password}
                                    className="pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-input" />
                                    <span className="text-muted-foreground">Lembrar-me</span>
                                </label>
                                <a href="#" className="text-primary hover:underline">
                                    Esqueceu a senha?
                                </a>
                            </div>

                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Entrar
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                Não tem uma conta?{' '}
                                <a href="#/register" className="text-primary hover:underline font-medium">
                                    Cadastre-se
                                </a>
                            </div>
                        </CardContent>
                    </form>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    © 2026 SEPI - Todos os direitos reservados
                </p>
            </motion.div>
        </div>
    );
}
