import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, CheckCircle, Ban, RefreshCw, Trash2, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import { Appointment, db } from '../../services/db';

interface AppointmentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    onAction: () => void;
    onReschedule: (app: Appointment) => void;
}

export function AppointmentDetailsModal({ isOpen, onClose, appointment, onAction, onReschedule }: AppointmentDetailsModalProps) {
    if (!appointment) return null;

    const handleStatusUpdate = (status: Appointment['status']) => {
        if (status === 'cancelled') {
            db.deleteAppointment(appointment.id);
        } else {
            if (status === 'completed') {
                db.sendAppointmentToPDV(appointment);
            }
            db.updateAppointment({ ...appointment, status });
        }
        onAction();
        onClose();
    };

    const handleDelete = () => {
        db.deleteAppointment(appointment.id);
        onAction();
        onClose();
    };

    const statusColors = {
        scheduled: 'bg-primary/20 text-primary border-primary/20',
        inprogress: 'bg-blue-100 text-blue-700 border-blue-200',
        completed: 'bg-green-100 text-green-700 border-green-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200'
    };

    const statusLabels = {
        scheduled: 'Agendado',
        inprogress: 'Em andamento',
        completed: 'Concluído',
        cancelled: 'Cancelado'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[appointment.status]}`}>
                                    {statusLabels[appointment.status]}
                                </div>
                                {appointment.isForcedFit && (
                                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                        Encaixe
                                    </div>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Client Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
                                    {appointment.clientName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">{appointment.clientName}</h3>
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <User className="w-4 h-4" /> Cliente
                                    </p>
                                </div>
                            </div>

                            {/* Appointment Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted/30 rounded-xl space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data</p>
                                    <p className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {appointment.date}</p>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-xl space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valor Total</p>
                                    <p className="font-bold text-primary flex items-center gap-2"><Tag className="w-4 h-4" /> R$ {appointment.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            {/* Services List */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Serviços e Profissionais</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {appointment.services.map((s, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border rounded-xl bg-background shadow-sm hover:border-primary/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary italic">
                                                    {s.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{s.serviceName}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{s.employeeName}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold flex items-center gap-1 justify-end"><Clock className="w-3 h-3 text-primary" /> {s.startTime}</p>
                                                <p className="text-[10px] text-muted-foreground">{s.duration} min</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Note / Actions Grid */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                                <Button
                                    onClick={() => handleStatusUpdate('completed')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center gap-2 h-12"
                                    disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
                                >
                                    <CheckCircle className="w-5 h-5" /> Concluir
                                </Button>
                                <Button
                                    onClick={() => onReschedule(appointment)}
                                    variant="outline"
                                    className="border-primary text-primary hover:bg-primary/5 font-bold flex items-center justify-center gap-2 h-12"
                                    disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
                                >
                                    <RefreshCw className="w-5 h-5" /> Remarcar
                                </Button>
                                <Button
                                    onClick={() => handleStatusUpdate('cancelled')}
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 font-bold flex items-center justify-center gap-2 h-12"
                                    disabled={appointment.status === 'cancelled'}
                                >
                                    <Ban className="w-5 h-5" /> Cancelar
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    variant="outline"
                                    className="border-muted-foreground/20 text-muted-foreground hover:bg-muted font-bold flex items-center justify-center gap-2 h-12"
                                >
                                    <Trash2 className="w-5 h-5" /> Desmarcar
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
