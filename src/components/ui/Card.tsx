import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
    return (
        <motion.div
            whileHover={hover ? { y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } : {}}
            onClick={onClick}
            className={`bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {children}
        </motion.div>
    );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 border-b border-border ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <h3 className={`text-xl font-semibold tracking-tight ${className}`}>
            {children}
        </h3>
    );
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <p className={`text-sm text-muted-foreground mt-1 ${className}`}>
            {children}
        </p>
    );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 border-t border-border bg-muted/50 ${className}`}>
            {children}
        </div>
    );
}
