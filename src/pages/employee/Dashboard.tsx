import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface Task {
    id: number;
    title: string;
    status: 'pending' | 'completed';
    priority: 'high' | 'medium' | 'low';
}

export function EmployeeDashboard() {
    const { user } = useAuth();
    const [isOnShift, setIsOnShift] = useState(false);
    const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, title: 'Atender Mesa 5', status: 'pending', priority: 'high' },
        { id: 2, title: 'Repor estoque de bebidas', status: 'completed', priority: 'medium' },
        { id: 3, title: 'Limpar área de preparo', status: 'pending', priority: 'low' },
    ]);

    const employeeCode = user?.employeeOf?.[0]?.employeeCode || 'XX0000';
    const companyName = 'Bom Sabor'; // Mock - viria do contexto

    useEffect(() => {
        const storedShift = localStorage.getItem('sepi_employee_shift');
        if (storedShift) {
            try {
                const { isOnShift, startTime } = JSON.parse(storedShift);
                setIsOnShift(isOnShift);
                setShiftStartTime(startTime ? new Date(startTime) : null);
            } catch (e) {
                console.error('Falha ao carregar estado do turno:', e);
                localStorage.removeItem('sepi_employee_shift');
            }
        }
    }, []);

    const handleClockIn = () => {
        const now = new Date();
        setIsOnShift(true);
        setShiftStartTime(now);
        localStorage.setItem('sepi_employee_shift', JSON.stringify({ isOnShift: true, startTime: now.toISOString() }));
    };

    const handleClockOut = () => {
        setIsOnShift(false);
        setShiftStartTime(null);
        localStorage.removeItem('sepi_employee_shift');
    };

    const handleNavigate = (path: string) => {
        // Remove leading # if present to avoid double hash
        const cleanPath = path.startsWith('#') ? path.substring(1) : path;
        window.location.hash = cleanPath;
    };

    const toggleTask = (taskId: number) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
                : task
        ));
    };

    const stats = [
        { label: 'Atendimentos Hoje', value: '12', icon: Activity, color: 'text-blue-500' },
        { label: 'Vendas Realizadas', value: 'R$ 1.245', icon: TrendingUp, color: 'text-green-500' },
        { label: 'Tarefas Concluídas', value: `${tasks.filter(t => t.status === 'completed').length}/${tasks.length}`, icon: CheckCircle, color: 'text-purple-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="text-muted-foreground mt-1">
                    Código: <span className="font-mono font-semibold">{employeeCode}</span> • {companyName}
                </p>
            </div>

            {/* Shift Status Card */}
            <Card className={isOnShift ? 'border-green-500 bg-green-50/50' : 'border-orange-500 bg-orange-50/50'}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isOnShift ? 'bg-green-500' : 'bg-orange-500'}`}>
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {isOnShift ? 'Turno em Andamento' : 'Fora do Turno'}
                                </h3>
                                {isOnShift && shiftStartTime && (
                                    <p className="text-sm text-muted-foreground">
                                        Iniciado às {shiftStartTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                                {!isOnShift && (
                                    <p className="text-sm text-muted-foreground">
                                        Clique em "Iniciar Turno" para começar
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {!isOnShift ? (
                                <Button onClick={handleClockIn} variant="primary">
                                    Iniciar Turno
                                </Button>
                            ) : (
                                <Button onClick={handleClockOut} variant="destructive">
                                    Finalizar Turno
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card hover>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Tasks & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tarefas do Dia</CardTitle>
                        <CardDescription>Suas atividades pendentes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${task.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-border hover:bg-muted/50'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                        }`}>
                                        {task.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                            {task.title}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
                        <CardDescription>Funcionalidades frequentes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <button
                            onClick={() => handleNavigate('#/employee/pdv')}
                            className="w-full p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                        >
                            <h3 className="font-semibold mb-1">📋 Realizar Pedido</h3>
                            <p className="text-sm text-muted-foreground">Registrar novo pedido de cliente</p>
                        </button>

                        <button className="w-full p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left">
                            <h3 className="font-semibold mb-1">📱 Validar QR Code</h3>
                            <p className="text-sm text-muted-foreground">Escanear QR Code de pagamento</p>
                        </button>

                        <button className="w-full p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left">
                            <h3 className="font-semibold mb-1">📊 Meu Desempenho</h3>
                            <p className="text-sm text-muted-foreground">Ver estatísticas e histórico</p>
                        </button>

                        <button className="w-full p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left">
                            <h3 className="font-semibold mb-1">💬 Chat da Equipe</h3>
                            <p className="text-sm text-muted-foreground">Comunicação interna</p>
                        </button>
                    </CardContent>
                </Card>
            </div>

            {/* Shift History */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Turnos</CardTitle>
                    <CardDescription>Últimos 5 turnos trabalhados</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { date: '20/01/2026', start: '08:00', end: '17:00', hours: '9h', location: 'Loja Centro' },
                            { date: '19/01/2026', start: '08:00', end: '17:00', hours: '9h', location: 'Loja Centro' },
                            { date: '18/01/2026', start: '08:00', end: '16:00', hours: '8h', location: 'Loja Centro' },
                        ].map((shift, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-sm font-semibold">{shift.date}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>{shift.start} - {shift.end}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span>{shift.location}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">{shift.hours}</p>
                                    <p className="text-xs text-muted-foreground">trabalhadas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
