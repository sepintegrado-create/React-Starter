import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, User, Phone, Mail, Edit, Trash2, History, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { db, Client } from '../../services/db';

export function CustomersPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        setClients(db.getClients());
    }, []);

    const resetForm = () => {
        setFormData({ name: '', phone: '', email: '' });
        setEditingClient(null);
    };

    const handleSave = () => {
        if (!formData.name || !formData.phone) {
            alert('Nome e Telefone são obrigatórios');
            return;
        }

        if (editingClient) {
            const updated: Client = { ...editingClient, ...formData };
            db.updateClient(updated);
        } else {
            const newClient: Client = {
                id: Date.now().toString(),
                ...formData,
                serviceHistory: []
            };
            db.addClient(newClient);
        }

        setClients(db.getClients());
        setShowAddModal(false);
        resetForm();
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            phone: client.phone,
            email: client.email || ''
        });
        setShowAddModal(true);
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground mt-1">Gerencie a base de clientes e seu histórico de serviços</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Novo Cliente
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou telefone..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <motion.div
                        key={client.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="h-full hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{client.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Phone className="w-3 h-3" />
                                                <span>{client.phone}</span>
                                            </div>
                                            {client.email && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{client.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(client)}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <span>Histórico de Serviços</span>
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                            {client.serviceHistory.length} serviços
                                        </span>
                                    </div>

                                    {client.serviceHistory.length > 0 ? (
                                        <div className="space-y-2">
                                            {client.serviceHistory.slice(0, 2).map(service => (
                                                <div key={service.id} className="text-xs p-2 bg-muted/50 rounded border border-border flex justify-between">
                                                    <span>{service.description}</span>
                                                    <span className="text-muted-foreground">{service.date}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">Nenhum serviço registrado ainda.</p>
                                    )}

                                    <Button variant="ghost" className="w-full text-xs h-8 gap-2" onClick={() => window.location.hash = '#/company/schedule'}>
                                        Ver na Agenda <ExternalLink className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingClient ? "Editar Cliente" : "Novo Cliente"}
            >
                <div className="space-y-4">
                    <Input
                        label="Nome Completo"
                        placeholder="Ex: Carlos Silva"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                        label="Telefone / WhatsApp"
                        placeholder="Ex: (11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <Input
                        label="Email (Opcional)"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1" onClick={handleSave}>
                            {editingClient ? 'Salvar' : 'Cadastrar'}
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
