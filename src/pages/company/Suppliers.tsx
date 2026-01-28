import React, { useState, useEffect } from 'react';
import {
    Truck,
    Plus,
    Search,
    Edit2,
    Trash2,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Building2,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { db, Supplier } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

export function SuppliersPage() {
    const { currentCompany } = useAuth();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Supplier>>({
        taxId: '',
        name: '',
        tradeName: '',
        email: '',
        phone: '',
        address: '',
        category: '',
        status: 'active'
    });

    useEffect(() => {
        if (currentCompany) {
            setSuppliers(db.getSuppliers(currentCompany.id));
        }
    }, [currentCompany]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCompany) return;

        const supplier: Supplier = {
            id: editingSupplier?.id || `sup-${Date.now()}`,
            companyId: currentCompany.id,
            taxId: formData.taxId!,
            name: formData.name!,
            tradeName: formData.tradeName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            category: formData.category,
            status: formData.status as 'active' | 'inactive',
            createdAt: editingSupplier?.createdAt || new Date().toISOString()
        };

        db.saveSupplier(supplier);
        setSuppliers(db.getSuppliers(currentCompany.id));
        setShowForm(false);
        setEditingSupplier(null);
        setFormData({
            taxId: '',
            name: '',
            tradeName: '',
            email: '',
            phone: '',
            address: '',
            category: '',
            status: 'active'
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Deseja excluir este fornecedor?')) {
            db.deleteSupplier(id);
            if (currentCompany) {
                setSuppliers(db.getSuppliers(currentCompany.id));
            }
        }
    };

    const startEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormData(supplier);
        setShowForm(true);
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.taxId.includes(searchTerm) ||
        s.tradeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tight">Fornecedores</h1>
                    <p className="text-muted-foreground mt-1">Gestão de parceiros e suprimentos</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingSupplier(null);
                        setFormData({ status: 'active' });
                        setShowForm(true);
                    }}
                    className="gap-2 rounded-2xl h-12 px-6 font-black uppercase italic shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Novo Fornecedor
                </Button>
            </div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por Nome, Fantasia ou CNPJ..."
                            className="pl-12 h-14 rounded-2xl bg-background border-border/50 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredSuppliers.map((supplier) => (
                        <motion.div
                            key={supplier.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className="group hover:border-primary/50 transition-all duration-300 rounded-[2.5rem] overflow-hidden border-2 h-full flex flex-col">
                                <CardContent className="p-8 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Building2 className="w-7 h-7" />
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest ${supplier.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {supplier.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-black uppercase italic leading-tight group-hover:text-primary transition-colors">
                                                {supplier.tradeName || supplier.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">
                                                {supplier.taxId}
                                            </p>
                                        </div>

                                        <div className="space-y-2 pt-4">
                                            {supplier.email && (
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <Mail className="w-4 h-4 text-primary" />
                                                    <span className="truncate">{supplier.email}</span>
                                                </div>
                                            )}
                                            {supplier.phone && (
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <Phone className="w-4 h-4 text-primary" />
                                                    <span>{supplier.phone}</span>
                                                </div>
                                            )}
                                            {supplier.address && (
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    <span className="truncate">{supplier.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-6 bg-muted/30 border-t flex gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startEdit(supplier)}
                                        className="flex-1 rounded-xl h-10 font-bold uppercase text-[10px]"
                                    >
                                        <Edit2 className="w-3.5 h-3.5 mr-2" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(supplier.id)}
                                        className="rounded-xl h-10 w-10 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowForm(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-card rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <form onSubmit={handleSave} className="p-8 md:p-12">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h2 className="text-3xl font-black italic uppercase italic tracking-tight">
                                            {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                                        </h2>
                                        <p className="text-muted-foreground text-sm font-medium mt-1">Preencha os dados do parceiro comercial</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="p-3 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <XCircle className="w-8 h-8 text-muted-foreground" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase italic tracking-widest text-primary">CNPJ / CPF</label>
                                        <Input
                                            required
                                            placeholder="00.000.000/0000-00"
                                            value={formData.taxId}
                                            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                            className="h-12 rounded-xl bg-muted/50 border-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase italic tracking-widest text-primary">Status</label>
                                        <select
                                            className="w-full h-12 rounded-xl bg-muted/50 border-none px-4 text-sm font-medium"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        >
                                            <option value="active">Ativo</option>
                                            <option value="inactive">Inativo</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase italic tracking-widest text-primary">Nome / Razão Social</label>
                                        <Input
                                            required
                                            placeholder="Nome completo da empresa"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-12 rounded-xl bg-muted/50 border-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase italic tracking-widest text-primary">E-mail</label>
                                        <Input
                                            type="email"
                                            placeholder="contato@empresa.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="h-12 rounded-xl bg-muted/50 border-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase italic tracking-widest text-primary">Telefone</label>
                                        <Input
                                            placeholder="(00) 00000-0000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="h-12 rounded-xl bg-muted/50 border-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 h-14 rounded-2xl font-black uppercase italic"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-[2] h-14 rounded-2xl font-black uppercase italic shadow-xl shadow-primary/20"
                                    >
                                        Salvar Fornecedor
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
