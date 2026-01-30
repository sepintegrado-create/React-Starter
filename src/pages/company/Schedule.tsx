import React, { useState, useEffect } from 'react';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Search,
    Calendar as CalendarIcon,
    Lock,
    Filter,
    Users,
    ChevronDown,
    MoreVertical,
    Clock,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, Appointment, Employee, Client } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SchedulingModal } from '../../components/modals/SchedulingModal';
import { AppointmentDetailsModal } from '../../components/modals/AppointmentDetailsModal';

export function SchedulePage() {
    const { currentCompany } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showSchedulingModal, setShowSchedulingModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleProfessionals, setVisibleProfessionals] = useState<string[]>([]);
    const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | undefined>(undefined);

    // Time slots from 08:00 to 20:00 (30 min intervals)
    const timeSlots = [];
    for (let h = 8; h <= 20; h++) {
        timeSlots.push(`${String(h).padStart(2, '0')}:00`);
        if (h < 20) timeSlots.push(`${String(h).padStart(2, '0')}:30`);
    }

    useEffect(() => {
        if (currentCompany) {
            const empList = db.getEmployees(currentCompany.id);
            setEmployees(empList);

            // Handle pre-selected employee from URL
            const hash = window.location.hash;
            const params = new URLSearchParams(hash.split('?')[1]);
            const preSelectedId = params.get('employeeId');

            if (preSelectedId && empList.some(e => e.id === preSelectedId)) {
                setVisibleProfessionals([preSelectedId]);
            } else {
                setVisibleProfessionals(empList.map(e => e.id));
            }
            refreshData();
        }
    }, [currentCompany]);

    useEffect(() => {
        const handleHashChange = () => {
            if (currentCompany) {
                const empList = db.getEmployees(currentCompany.id);
                const hash = window.location.hash;
                const params = new URLSearchParams(hash.split('?')[1]);
                const preSelectedId = params.get('employeeId');

                if (preSelectedId && empList.some(e => e.id === preSelectedId)) {
                    setVisibleProfessionals([preSelectedId]);
                } else {
                    setVisibleProfessionals(empList.map(e => e.id));
                }
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [currentCompany, employees]);
    const refreshData = () => {
        setAppointments(db.getAppointments());
    };

    const getAppointmentsForEmployee = (empId: string, date: string) => {
        return appointments.filter(app =>
            app.date === date &&
            app.services.some(s => s.employeeId === empId)
        );
    };

    const toggleProfessional = (id: string) => {
        setVisibleProfessionals(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleClearDay = () => {
        if (window.confirm(`Deseja realmente excluir TODOS os agendamentos do dia ${selectedDate}? Esta ação não pode ser desfeita.`)) {
            db.deleteAppointmentsByDate(selectedDate);
            refreshData();
        }
    };

    // Calendar helper
    const getDaysInMonth = (year: number, month: number) => {
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    // Render calendar
    const renderCalendar = () => {
        const now = new Date(selectedDate);
        const days = getDaysInMonth(now.getFullYear(), now.getMonth());
        const startDay = days[0].getDay();
        const padding = Array(startDay).fill(null);

        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

        return (
            <div className="bg-card rounded-xl border p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm">{monthNames[now.getMonth()]} {now.getFullYear()}</h3>
                    <div className="flex gap-1">
                        <button className="p-1 hover:bg-muted rounded"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="p-1 hover:bg-muted rounded"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground uppercase mb-2">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {padding.map((_, i) => <div key={`p-${i}`} />)}
                    {days.map(d => {
                        const dateStr = d.toISOString().split('T')[0];
                        const isSelected = dateStr === selectedDate;
                        const isToday = dateStr === new Date().toISOString().split('T')[0];

                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`
                                    w-7 h-7 rounded-full text-xs flex items-center justify-center transition-colors
                                    ${isSelected ? 'bg-primary text-primary-foreground font-bold' :
                                        isToday ? 'border border-primary text-primary' : 'hover:bg-muted'}
                                `}
                            >
                                {d.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tighter uppercase text-primary">Agenda</h1>
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Regular</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /> Encaixe</span>
                </div>
            </div>

            {/* Main Layout Split */}
            <div className="flex flex-1 overflow-hidden gap-6">

                {/* Left Sidebar */}
                <aside className="w-64 flex flex-col gap-6 overflow-y-auto pr-2">
                    {renderCalendar()}

                    <div className="bg-card rounded-xl border p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                                <Users className="w-4 h-4" /> Profissionais
                            </h3>
                            {window.location.hash.includes('employeeId=') && (
                                <button
                                    onClick={() => window.location.hash = '#/company/schedule'}
                                    className="text-[10px] text-primary font-bold hover:underline"
                                >
                                    Ver Todos
                                </button>
                            )}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <input
                                placeholder="Pesquisar profissional"
                                className="w-full pl-7 pr-3 py-1.5 text-xs bg-muted/50 rounded-lg border-none focus:ring-1 focus:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer py-1">
                                <input
                                    type="checkbox"
                                    checked={visibleProfessionals.length === employees.length}
                                    onChange={() => setVisibleProfessionals(
                                        visibleProfessionals.length === employees.length ? [] : employees.map(e => e.id)
                                    )}
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-primary"
                                />
                                Todos
                            </label>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase pt-2">
                                    <ChevronDown className="w-3 h-3" /> Integrantes
                                </div>
                                {employees
                                    .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .filter(e => {
                                        const hash = window.location.hash;
                                        const params = new URLSearchParams(hash.split('?')[1]);
                                        const preSelectedId = params.get('employeeId');
                                        return !preSelectedId || e.id === preSelectedId;
                                    })
                                    .map(emp => (
                                        <label key={emp.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded-md">
                                            <input
                                                type="checkbox"
                                                checked={visibleProfessionals.includes(emp.id)}
                                                onChange={() => toggleProfessional(emp.id)}
                                                className="w-3.5 h-3.5 rounded border-gray-300 text-primary"
                                            />
                                            <div className="w-2 h-2 rounded-full bg-primary/40" />
                                            {emp.name}
                                        </label>
                                    ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Agenda Grid */}
                <main className="flex-1 flex flex-col bg-card rounded-2xl border shadow-sm overflow-hidden min-w-0">

                    {/* Grid Toolbar */}
                    <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 font-bold"
                                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                            >
                                Hoje
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 px-4 font-bold flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Bloquear Horário
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
                                <button className="px-3 py-1.5 text-xs font-bold rounded-md bg-white shadow-sm border">Dia</button>
                                <button className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-white/50 rounded-md">Semana</button>
                                <button className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-white/50 rounded-md">Mês</button>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleClearDay}
                                className="h-9 px-4 border-red-200 text-red-600 hover:bg-red-50 font-bold flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Limpar Agenda
                            </Button>

                            <Button onClick={() => {
                                setSelectedAppointment(null);
                                setSelectedProfessionalId(undefined);
                                setShowSchedulingModal(true);
                            }} className="h-9 px-6 bg-primary font-bold shadow-lg shadow-primary/20">
                                <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
                            </Button>
                        </div>
                    </div>

                    {/* Actual Grid */}
                    <div className="flex-1 overflow-auto relative">
                        <div className="flex h-full min-w-max">

                            {/* Time Axis */}
                            <div className="w-16 sticky left-0 z-20 bg-white border-r">
                                <div className="h-16 border-b" /> {/* Spacer for header */}
                                {timeSlots.map(time => (
                                    <div key={time} className="h-12 border-b flex justify-center text-[10px] font-bold text-muted-foreground pt-1">
                                        {time.endsWith(':00') ? time : ''}
                                    </div>
                                ))}
                            </div>

                            {/* Professionals Columns */}
                            {employees.filter(e => visibleProfessionals.includes(e.id)).map(emp => (
                                <div key={emp.id} className="w-48 border-r min-h-full flex flex-col">
                                    {/* Professional Header */}
                                    <div className="h-16 border-b p-3 bg-muted/10 sticky top-0 z-10 flex flex-col items-center justify-center gap-1 group">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 overflow-hidden border border-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider truncate w-full text-center">
                                            {emp.name.split(' ')[0]}
                                        </span>
                                    </div>

                                    {/* Column Cells */}
                                    <div className="relative group/col">
                                        {timeSlots.map(time => (
                                            <div
                                                key={time}
                                                className="h-12 border-b group/cell relative cursor-pointer hover:bg-primary/5 transition-colors"
                                                onClick={() => {
                                                    setSelectedAppointment(null);
                                                    setSelectedProfessionalId(emp.id);
                                                    setShowSchedulingModal(true);
                                                }}
                                            >
                                                <div className="absolute inset-x-0 top-0 h-px bg-muted opacity-0 group-hover/cell:opacity-100" />
                                            </div>
                                        ))}

                                        {/* Appointments Overlay */}
                                        {(() => {
                                            const empServices = getAppointmentsForEmployee(emp.id, selectedDate)
                                                .flatMap(app => app.services
                                                    .filter(s => s.employeeId === emp.id)
                                                    .map(s => ({
                                                        ...s,
                                                        appId: app.id,
                                                        appIsForcedFit: app.isForcedFit,
                                                        appClientName: app.clientName,
                                                        appStatus: app.status
                                                    }))
                                                )
                                                .sort((a, b) => a.startTime.localeCompare(b.startTime));

                                            // Simple overlap algorithm
                                            const columns: any[][] = [];
                                            empServices.forEach(service => {
                                                let placed = false;
                                                for (let i = 0; i < columns.length; i++) {
                                                    const lastInCol = columns[i][columns[i].length - 1];
                                                    if (service.startTime >= lastInCol.endTime) {
                                                        columns[i].push(service);
                                                        placed = true;
                                                        break;
                                                    }
                                                }
                                                if (!placed) {
                                                    columns.push([service]);
                                                }
                                            });

                                            return columns.flatMap((col, colIdx) =>
                                                col.map(service => {
                                                    const [startH, startM] = service.startTime.split(':').map(Number);
                                                    const startMinutesTotal = (startH * 60) + startM;
                                                    const baseDayMinutes = (8 * 60); // 08:00
                                                    const topPos = ((startMinutesTotal - baseDayMinutes) / 30) * 48;
                                                    const height = (service.duration / 30) * 48;

                                                    const widthPercent = 100 / columns.length;
                                                    const leftPercent = colIdx * widthPercent;

                                                    return (
                                                        <motion.div
                                                            key={service.id}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const originalApp = appointments.find(a => a.id === service.appId);
                                                                if (originalApp) {
                                                                    setSelectedAppointment(originalApp);
                                                                    setShowDetailsModal(true);
                                                                }
                                                            }}
                                                            style={{
                                                                top: `${topPos + 4}px`,
                                                                height: `${height - 8}px`,
                                                                left: `${leftPercent}%`,
                                                                width: `calc(${widthPercent}% - 4px)`
                                                            }}
                                                            className={`
                                                                absolute rounded-lg p-1 shadow-sm border-l-2 overflow-hidden group/app z-10
                                                                ${service.appIsForcedFit ? 'bg-orange-50 border-orange-400' : 'bg-primary/10 border-primary shadow-primary/5'}
                                                                ${(service.appStatus === 'completed' || service.appStatus === 'cancelled') ? 'opacity-50 grayscale' : 'hover:scale-[1.02]'}
                                                                transition-all cursor-pointer
                                                            `}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-[8px] font-bold text-primary flex items-center gap-1">
                                                                    <Clock className="w-1.5 h-1.5" /> {service.startTime}
                                                                </span>
                                                            </div>
                                                            <p className="text-[9px] font-black leading-tight truncate">{service.appClientName}</p>
                                                            <p className="text-[7px] font-bold text-muted-foreground truncate uppercase">{service.serviceName}</p>

                                                            {service.appIsForcedFit && (
                                                                <div className="absolute bottom-0.5 right-0.5 text-[6px] bg-orange-400 text-white px-0.5 rounded-sm font-bold uppercase">
                                                                    E
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })
                                            );
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <SchedulingModal
                isOpen={showSchedulingModal}
                onClose={() => {
                    setShowSchedulingModal(false);
                    setSelectedAppointment(null);
                    setSelectedProfessionalId(undefined);
                }}
                selectedDate={selectedDate}
                onSave={refreshData}
                appointment={selectedAppointment}
                initialEmployeeId={selectedProfessionalId}
            />

            <AppointmentDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                appointment={selectedAppointment}
                onAction={refreshData}
                onReschedule={(app) => {
                    setShowDetailsModal(false);
                    setSelectedAppointment(app);
                    setShowSchedulingModal(true);
                }}
            />
        </div>
    );
}
