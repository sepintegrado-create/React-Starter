import React from 'react';
import { motion } from 'framer-motion';
import {
    Utensils,
    BedDouble,
    CheckCircle2,
    Clock,
    DollarSign,
    ChevronRight,
    Users
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/validators';

interface TableTab {
    type: 'table' | 'room';
    number: string;
    status: 'available' | 'occupied' | 'ready_to_pay';
    total: number;
    customerName?: string;
}

interface TableMonitorProps {
    tabs: TableTab[];
    onSelectTab: (type: 'table' | 'room', number: string) => void;
}

export function TableMonitor({ tabs, onSelectTab }: TableMonitorProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
            {tabs.map((tab) => {
                const isOccupied = tab.status !== 'available';
                const isReadyToPay = tab.status === 'ready_to_pay';
                const Icon = tab.type === 'table' ? Utensils : BedDouble;

                return (
                    <motion.button
                        key={`${tab.type}-${tab.number}`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectTab(tab.type, tab.number)}
                        className={`relative group flex flex-col p-4 rounded-3xl border-2 transition-all text-left h-40 ${isReadyToPay
                                ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-200/50'
                                : isOccupied
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-dashed border-muted-foreground/20 bg-muted/20 hover:border-muted-foreground/40'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-auto">
                            <div className={`p-2 rounded-xl ${isReadyToPay ? 'bg-amber-500 text-white' :
                                    isOccupied ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                }`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            {isOccupied && (
                                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase italic ${isReadyToPay ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
                                    }`}>
                                    {isReadyToPay ? 'Fechar' : 'Ocupado'}
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">
                                {tab.type === 'table' ? 'Mesa' : 'Quarto'}
                            </p>
                            <h3 className="text-2xl font-black italic">{tab.number}</h3>
                        </div>

                        {isOccupied && (
                            <div className="mt-2 pt-2 border-t border-dashed border-current/10 flex items-center justify-between">
                                <p className="text-sm font-bold truncate pr-2">
                                    {formatCurrency(tab.total)}
                                </p>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}

                        {!isOccupied && (
                            <p className="mt-2 text-[10px] font-bold uppercase text-muted-foreground/60 italic">Livre</p>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
