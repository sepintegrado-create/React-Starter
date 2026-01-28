import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import {
    ChevronRight, LogOut, ShieldCheck, Building2, Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getRoutesByRole } from '../../utils/routes';
import { UserRole } from '../../types/user';

export function Sidebar({ currentPath, isCollapsed, onToggle }: {
    currentPath: string;
    isCollapsed: boolean;
    onToggle: () => void;
}) {
    const { user, currentRole, currentCompany, logout, switchRole } = useAuth();
    const routes = getRoutesByRole(currentRole);

    const handleSwitchToUser = () => {
        switchRole(UserRole.USER);
    };

    const hasCompany = user?.companies && user.companies.length > 0;
    const isEmployee = user?.employeeOf && user.employeeOf.length > 0;

    // Helper to get Lucide icon from string name
    const getIcon = (name?: string) => {
        if (!name) return LucideIcons.HelpCircle;
        const Icon = (LucideIcons as any)[name];
        return Icon || LucideIcons.HelpCircle;
    };

    return (
        <motion.div
            initial={false}
            animate={{
                width: isCollapsed ? (window.innerWidth >= 1024 ? 80 : 0) : 280,
                opacity: 1,
                x: isCollapsed && window.innerWidth < 1024 ? -280 : 0
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className={`
                h-screen bg-card border-r border-border flex flex-col overflow-hidden 
                fixed lg:relative z-[100] lg:z-50 shadow-2xl lg:shadow-none
            `}
        >

            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic tracking-tighter">
                            SEPI
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">Sistema Empresarial</p>
                    </motion.div>
                )}
                {isCollapsed && (
                    <h1 className="text-xl font-black text-primary mx-auto italic">S</h1>
                )}
                <button
                    onClick={onToggle}
                    className="hidden lg:flex p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
                >
                    {isCollapsed ? <LucideIcons.ChevronRight className="w-5 h-5" /> : <LucideIcons.Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* User Info */}
            <div className={`p-4 border-b border-border ${isCollapsed ? 'flex justify-center' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-inner">
                        <span className="text-primary font-black italic">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 min-w-0"
                        >
                            <p className="text-sm font-black truncate uppercase italic tracking-tighter">{user?.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate font-bold uppercase tracking-tight">{user?.email}</p>
                        </motion.div>
                    )}
                </div>

                {/* Role Badge */}
                <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                        {currentRole === UserRole.PLATFORM_ADMIN && '🔐 Admin Plataforma'}
                        {currentRole === UserRole.COMPANY_ADMIN && '🏢 Admin Empresa'}
                        {currentRole === UserRole.EMPLOYEE && '👤 Funcionário'}
                        {currentRole === UserRole.SELLER && '💼 Vendedor'}
                        {currentRole === UserRole.USER && '👥 Usuário'}
                    </span>
                </div>

                {/* Company Info */}
                {currentCompany && (
                    <div className="mt-3 p-3 rounded-2xl bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2">
                            <LucideIcons.Building2 className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-tight truncate">{currentCompany.tradeName}</span>
                        </div>
                    </div>
                )}

                {/* Switch Roles Quick Actions */}
                <div className="space-y-2 mt-4">
                    {currentRole === UserRole.USER && hasCompany && (
                        <button
                            onClick={() => switchRole(UserRole.COMPANY_ADMIN)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-primary"
                        >
                            <LucideIcons.Building2 className="w-3.5 h-3.5" />
                            Administrar Empresa
                        </button>
                    )}

                    {currentRole === UserRole.USER && isEmployee && (
                        <button
                            onClick={() => switchRole(UserRole.EMPLOYEE)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-border hover:bg-accent transition-all"
                        >
                            <LucideIcons.Briefcase className="w-3.5 h-3.5" />
                            Área do Funcionário
                        </button>
                    )}

                    {currentRole !== UserRole.USER && (
                        <button
                            onClick={handleSwitchToUser}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-border hover:bg-accent transition-all group"
                        >
                            <span className="group-hover:scale-125 transition-transform">👁️</span> Visão Cliente
                        </button>
                    )}

                    {currentRole !== UserRole.PLATFORM_ADMIN && user?.role === UserRole.PLATFORM_ADMIN && (
                        <button
                            onClick={() => switchRole(UserRole.PLATFORM_ADMIN)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-primary"
                        >
                            <LucideIcons.ShieldCheck className="w-3.5 h-3.5" />
                            Administração Geral
                        </button>
                    )}

                    {currentRole !== UserRole.SELLER && user?.role === UserRole.SELLER && (
                        <button
                            onClick={() => switchRole(UserRole.SELLER)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-primary"
                        >
                            <LucideIcons.Briefcase className="w-3.5 h-3.5" />
                            Voltar para Vendas
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {routes.map((route) => {
                    const isActive = currentPath === route.path;
                    const Icon = getIcon(route.icon);
                    return (
                        <motion.a
                            key={route.path}
                            href={`#${route.path}`}
                            whileHover={{ x: isCollapsed ? 0 : 4, scale: isCollapsed ? 1.05 : 1 }}
                            className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group relative ${isActive
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <Icon className={`w-4 h-4 transition-colors flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                                }`} />
                            {!isCollapsed && (
                                <>
                                    <span className="flex-1 truncate">{route.name}</span>
                                    <LucideIcons.ChevronRight className={`w-3.5 h-3.5 transition-all ${isActive ? 'text-primary-foreground translate-x-1' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                                        }`} />
                                </>
                            )}
                            {isCollapsed && isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-6 bg-primary-foreground rounded-r-full"
                                />
                            )}
                        </motion.a>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border bg-muted/20">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
                >
                    <LucideIcons.LogOut className="w-4 h-4" />
                    Sair do Sistema
                </button>
            </div>
        </motion.div>
    );
}
