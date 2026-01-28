import React, { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from '../components/navigation/Sidebar';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    // Simple hash-based routing
    const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(window.location.hash.slice(1) || '/');
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        console.log('MainLayout mounted - v1.0.1');
    }, []);

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            {/* Mobile Overlay */}
            {!isSidebarCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarCollapsed(true)}
                />
            )}

            <Sidebar
                currentPath={currentPath}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <motion.main
                animate={{
                    paddingLeft: isSidebarCollapsed ? 0 : (window.innerWidth >= 1024 ? 0 : 0)
                }}
                className="flex-1 overflow-y-auto relative min-w-0"
            >
                {/* Header Mobile / Navigation Toggle */}
                <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between lg:hidden">
                    <button
                        onClick={() => setIsSidebarCollapsed(false)}
                        className="p-2 hover:bg-muted rounded-xl transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-black italic uppercase tracking-tighter text-primary">SEPI</span>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500">
                    {children}
                </div>
            </motion.main>
        </div>
    );
}
