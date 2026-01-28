import React, { useState, useEffect } from 'react';
import { Plus, Bell, Calendar as CalendarIcon, Clock, User, Phone, Search, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, Appointment, Client } from '../../services/db';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function SchedulePage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [newApp, setNewApp] = useState({
        clientName: '',
        clientId: '',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        description: ''
    });

    useEffect(() => {
        setAppointments(db.getAppointments());
        setClients(db.getClients());
    }, []);

    const handleAddAppointment = () => {
        const appointment: Appointment = {
            id: Date.now().toString(),
            clientId: newApp.clientId || 'guest',
            clientName: newApp.clientName,
            date: newApp.date,
            time: newApp.time,
            description: newApp.description,
            status: 'scheduled',
            notified: false
        };
        db.addAppointment(appointment);
        setAppointments(db.getAppointments());
        setShowAddModal(false);
        setNewApp({
            clientName: '',
            clientId: '',
            date: new Date().toISOString().split('T')[0],
            time: '14:00',
            description: ''
        });
    };

    const handleStatusChange = (app: Appointment, newStatus: Appointment['status']) => {
        const updated = { ...app, status: newStatus };
        db.updateAppointment(updated);
        setAppointments(db.getAppointments());
    };

    const filteredAppointments = appointments.filter(a =>
        a.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    const upcomingCount = appointments.filter(a => a.status === 'scheduled').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
                    <p className="text-muted-foreground mt-1">Gerencie seus compromissos e histórico de clientes</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Bell className="w-6 h-6 text-muted-foreground" />
                        {upcomingCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {upcomingCount}
                            </span>
                        )}
                    </div>
                    <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Novo Agendamento
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of Appointments */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Compromissos</CardTitle>
                            <div className="flex items-center gap-2 max-w-xs">
                                <Search className="w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar agendamento..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredAppointments.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    Nenhum agendamento encontrado.
                                </div>
                            ) : (
                                filteredAppointments.map(app => (
                                    <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${app.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                                                app.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                <CalendarIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">{app.clientName}</p>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {app.time}</span>
                                                    <span>•</span>
                                                    <span>{app.date}</span>
                                                </div>
                                                <p className="text-sm mt-1 text-muted-foreground">{app.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {app.status === 'scheduled' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(app, 'completed')}
                                                        className="p-2 hover:bg-green-100 rounded-full text-green-600 transition-colors"
                                                        title="Concluir"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(app, 'cancelled')}
                                                        className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors"
                                                        title="Cancelar"
                                                    >
                                                        <AlertCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${app.status === 'scheduled' ? 'bg-primary/20 text-primary' :
                                                app.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {app.status === 'scheduled' ? 'Agendado' :
                                                    app.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Client History Shortcut / Statistics */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes do Cliente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Selecionar Cliente</label>
                                    <select
                                        className="w-full p-2 rounded-lg border border-border bg-background text-sm"
                                        onChange={(e) => {
                                            const client = clients.find(c => c.id === e.target.value);
                                            setSelectedClient(client || null);
                                        }}
                                        value={selectedClient?.id || ''}
                                    >
                                        <option value="">Selecione um cliente...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedClient ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <User className="w-5 h-5 text-primary" />
                                                <span className="font-bold">{selectedClient.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <Phone className="w-4 h-4" />
                                                <span>{selectedClient.phone}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Histórico de Serviços</h4>
                                            <div className="space-y-2">
                                                {selectedClient.serviceHistory.length === 0 ? (
                                                    <p className="text-xs text-muted-foreground italic">Nenhum serviço registrado.</p>
                                                ) : (
                                                    selectedClient.serviceHistory.map(history => (
                                                        <div key={history.id} className="p-3 bg-muted/50 rounded-lg text-xs border border-border">
                                                            <div className="flex justify-between font-bold mb-1">
                                                                <span>{history.description}</span>
                                                                <span className="text-primary">R$ {history.amount.toFixed(2)}</span>
                                                            </div>
                                                            <div className="text-muted-foreground">{history.date}</div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl bg-muted/50 border border-dashed border-border text-center">
                                        <p className="text-sm text-muted-foreground">Selecione um cliente para ver o histórico completo.</p>
                                    </div>
                                )}

                                <div className="pt-4 border-t space-y-3">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Próximos Avisos</h4>
                                    {appointments.filter(a => a.status === 'scheduled').slice(0, 3).map(app => (
                                        <div key={app.id} className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-3">
                                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-yellow-900">{app.clientName}</p>
                                                <p className="text-xs text-yellow-700">{app.date} às {app.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Appointment Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 space-y-6">
                                <h2 className="text-2xl font-black">Novo Agendamento</h2>

                                <div className="space-y-4">
                                    <Input
                                        label="Nome do Cliente"
                                        placeholder="Ex: João Silva"
                                        value={newApp.clientName}
                                        onChange={(e) => setNewApp({ ...newApp, clientName: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Data"
                                            type="date"
                                            value={newApp.date}
                                            onChange={(e) => setNewApp({ ...newApp, date: e.target.value })}
                                        />
                                        <Input
                                            label="Hora"
                                            type="time"
                                            value={newApp.time}
                                            onChange={(e) => setNewApp({ ...newApp, time: e.target.value })}
                                        />
                                    </div>
                                    <Input
                                        label="Descrição do Serviço"
                                        placeholder="Ex: Consultoria Técnica"
                                        value={newApp.description}
                                        onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                                        Cancelar
                                    </Button>
                                    <Button className="flex-1" onClick={handleAddAppointment} disabled={!newApp.clientName}>
                                        Agendar
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
