import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Trash2, Calendar, Clock, PlusCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { db, Client, Appointment, ScheduledService } from '../../services/db';

interface SchedulingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string;
    onSave: () => void;
    appointment?: Appointment | null;
    initialEmployeeId?: string; // Added to pre-fill professional
}

export function SchedulingModal({ isOpen, onClose, selectedDate, onSave, appointment, initialEmployeeId }: SchedulingModalProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [foundClients, setFoundClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [manualClientName, setManualClientName] = useState('');

    const [date, setDate] = useState(selectedDate);
    const [isForcedFit, setIsForcedFit] = useState(false);

    const [services, setServices] = useState<Partial<ScheduledService>[]>([
        { id: Math.random().toString(36).substr(2, 9), startTime: '09:00', duration: 45, price: 0 }
    ]);

    useEffect(() => {
        if (isOpen) {
            setClients(db.getClients());
            setProducts(db.getProducts());
            setEmployees(db.getEmployees());

            if (appointment) {
                setDate(appointment.date);
                setIsForcedFit(appointment.isForcedFit);
                setServices(appointment.services);
                const client = db.getClients().find(c => c.id === appointment.clientId);
                if (client) setSelectedClient(client);
                else setManualClientName(appointment.clientName);
            } else {
                setDate(selectedDate);
                setIsForcedFit(false);
                const initialEmp = initialEmployeeId ? employees.find(e => e.id === initialEmployeeId) : null;
                setServices([
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        startTime: '09:00',
                        duration: 45,
                        price: 0,
                        employeeId: initialEmployeeId || '',
                        employeeName: initialEmp ? initialEmp.name : ''
                    }
                ]);
                setSelectedClient(null);
                setManualClientName('');
            }
        }
    }, [isOpen, selectedDate, appointment]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFoundClients([]);
        } else {
            const filtered = clients.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.phone.includes(searchTerm)
            );
            setFoundClients(filtered);
        }
    }, [searchTerm, clients]);

    const handleAddService = () => {
        const lastService = services[services.length - 1];
        const newStartTime = lastService?.endTime || '10:00';

        setServices([...services, {
            id: Math.random().toString(36).substr(2, 9),
            startTime: newStartTime,
            duration: 30,
            price: 0
        }]);
    };

    const handleRemoveService = (id: string) => {
        if (services.length > 1) {
            setServices(services.filter(s => s.id !== id));
        }
    };

    const updateService = (id: string, updates: Partial<ScheduledService>) => {
        setServices(services.map(s => {
            if (s.id === id) {
                const updated = { ...s, ...updates };

                // Auto-calculate end time if start time or duration changes
                if (updates.startTime || updates.duration) {
                    const [hours, minutes] = (updated.startTime || '00:00').split(':').map(Number);
                    const date = new Date();
                    date.setHours(hours, minutes + (updated.duration || 0));
                    updated.endTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                }

                // Auto-update price if serviceId changes
                if (updates.serviceId) {
                    const product = products.find(p => p.id === updates.serviceId);
                    if (product) {
                        updated.serviceName = product.name;
                        updated.price = product.price;
                        if (product.duration) {
                            updated.duration = product.duration;
                        }
                    }
                }

                // Update employee name
                if (updates.employeeId) {
                    const emp = employees.find(e => e.id === updates.employeeId);
                    if (emp) updated.employeeName = emp.name;
                }

                return updated;
            }
            return s;
        }));
    };

    const totalValue = services.reduce((sum, s) => sum + (s.price || 0), 0);

    const handleSave = () => {
        if (!selectedClient && !manualClientName) return;

        const appointmentData: Appointment = {
            id: appointment?.id || Math.random().toString(36).substr(2, 9),
            clientId: selectedClient?.id || 'manual',
            clientName: selectedClient?.name || manualClientName,
            date,
            services: services as ScheduledService[],
            totalValue,
            status: appointment?.status || 'scheduled',
            isForcedFit,
            notified: appointment?.notified || false
        };

        if (appointment) {
            db.updateAppointment(appointmentData);
        } else {
            db.addAppointment(appointmentData);
        }

        onSave();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-primary/5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold">{appointment ? 'Editar agendamento' : 'Novo agendamento'}</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8">
                            {/* Cliente Section */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Search className="w-4 h-4" /> Cliente
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="md:col-span-3 relative">
                                        <Input
                                            placeholder="Pesquisar Cliente por nome ou celular"
                                            value={selectedClient ? selectedClient.name : searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                if (selectedClient) setSelectedClient(null);
                                                setManualClientName(e.target.value);
                                            }}
                                            className="pr-10"
                                        />
                                        {foundClients.length > 0 && !selectedClient && (
                                            <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {foundClients.map(c => (
                                                    <button
                                                        key={c.id}
                                                        className="w-full p-3 text-left hover:bg-muted border-b last:border-0"
                                                        onClick={() => {
                                                            setSelectedClient(c);
                                                            setSearchTerm('');
                                                        }}
                                                    >
                                                        <p className="font-medium">{c.name}</p>
                                                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                                        Cadastrar Cliente
                                    </Button>
                                </div>
                            </section>

                            {/* Data Section */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Data
                                </h3>
                                <div className="flex items-center gap-6">
                                    <div className="w-48">
                                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                                    </div>
                                    <button className="text-primary text-sm font-medium hover:underline">
                                        Recorrência...
                                    </button>
                                </div>
                            </section>

                            {/* Serviços Section */}
                            <section className="space-y-4">
                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-muted/50 border-b">
                                                <th className="p-3 text-left font-semibold">Serviço</th>
                                                <th className="p-3 text-left font-semibold">Profissional</th>
                                                <th className="p-3 text-left font-semibold">Tempo</th>
                                                <th className="p-3 text-left font-semibold">Início</th>
                                                <th className="p-3 text-left font-semibold">Fim</th>
                                                <th className="p-3 text-left font-semibold">Valor (R$)</th>
                                                <th className="p-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {services.map((service, idx) => (
                                                <tr key={service.id} className="border-b last:border-0 hover:bg-muted/20">
                                                    <td className="p-2">
                                                        <select
                                                            className="w-full p-2 bg-transparent border rounded-md"
                                                            value={service.serviceId || ''}
                                                            onChange={(e) => updateService(service.id!, { serviceId: e.target.value })}
                                                        >
                                                            <option value="">Selecione...</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.type === 'service' ? '🛠️ ' : '📦 '} {p.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <select
                                                            className="w-full p-2 bg-transparent border rounded-md"
                                                            value={service.employeeId || ''}
                                                            onChange={(e) => updateService(service.id!, { employeeId: e.target.value })}
                                                        >
                                                            <option value="">Selecione...</option>
                                                            {employees.map(e => (
                                                                <option key={e.id} value={e.id}>{e.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-2 w-20">
                                                        <Input
                                                            type="number"
                                                            value={service.duration || ''}
                                                            onChange={(e) => updateService(service.id!, { duration: Number(e.target.value) })}
                                                            className="text-center"
                                                        />
                                                    </td>
                                                    <td className="p-2 w-24">
                                                        <Input
                                                            type="time"
                                                            value={service.startTime || ''}
                                                            onChange={(e) => updateService(service.id!, { startTime: e.target.value })}
                                                        />
                                                    </td>
                                                    <td className="p-2 w-24">
                                                        <div className="p-2 bg-muted/30 rounded text-center font-medium">
                                                            {service.endTime || '--:--'}
                                                        </div>
                                                    </td>
                                                    <td className="p-2 w-24">
                                                        <Input
                                                            type="number"
                                                            value={service.price || ''}
                                                            onChange={(e) => updateService(service.id!, { price: Number(e.target.value) })}
                                                            className="text-right"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <button
                                                            onClick={() => handleRemoveService(service.id!)}
                                                            className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={handleAddService}
                                            className="flex items-center gap-2 text-primary"
                                        >
                                            <PlusCircle className="w-4 h-4" /> Adicionar serviço
                                        </Button>
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isForcedFit}
                                                onChange={(e) => setIsForcedFit(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium">Forçar Encaixe</span>
                                        </label>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Total (R$)</p>
                                        <p className="text-3xl font-black text-primary">{totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
                            <Button variant="outline" onClick={onClose} className="px-8">
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} className="px-12 bg-primary hover:bg-primary/90">
                                Salvar
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
