import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Plus,
    Search,
    Edit2,
    Trash2,
    Shield,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { db, EmployeeFunction } from '../../services/db';

export default function FunctionsPage() {
    const { currentCompany } = useAuth();
    const [functions, setFunctions] = useState<EmployeeFunction[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingFunction, setEditingFunction] = useState<EmployeeFunction | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        defaultPermissions: [] as string[]
    });

    const allPermissions = ['PDV', 'Estoque', 'Relatórios', 'Equipe', 'Financeiro', 'Cardápio', 'Cozinha'];

    useEffect(() => {
        loadFunctions();
    }, [currentCompany]);

    const loadFunctions = () => {
        if (currentCompany) {
            const data = db.getFunctions(currentCompany.id);
            setFunctions(data);
        }
    };

    const handleOpenAdd = () => {
        setEditingFunction(null);
        setFormData({ name: '', description: '', defaultPermissions: [] });
        setShowModal(true);
    };

    const handleEdit = (func: EmployeeFunction) => {
        setEditingFunction(func);
        setFormData({
            name: func.name,
            description: func.description || '',
            defaultPermissions: []
        });
        setShowModal(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta função?')) {
            db.deleteFunction(id);
            loadFunctions();
        }
    };

    const handleSave = () => {
        if (!currentCompany) return;

        const functionData: EmployeeFunction = {
            id: editingFunction?.id || `func-${Date.now()}`,
            companyId: currentCompany.id,
            name: formData.name,
            description: formData.description,
            defaultPermissions: [] // Always empty, role is just nomenclature
        };

        db.saveFunction(functionData);
        setShowModal(false);
        loadFunctions();
    };

    const filteredFunctions = functions.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Funções da Equipe</h1>
                    <p className="text-muted-foreground">Gerencie os cargos e nomenclaturas da sua equipe</p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Função
                </Button>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar funções..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFunctions.map(func => (
                    <Card key={func.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Briefcase className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{func.name}</h3>
                                        <p className="text-sm text-muted-foreground">{func.description || 'Sem descrição'}</p>
                                        {func.companyId === 'all' && (
                                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold mt-1 inline-block">Padrão</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(func)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    {func.companyId !== 'all' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(func.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredFunctions.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Nenhuma função encontrada.</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingFunction ? "Editar Função" : "Nova Função"}
            >
                <div className="space-y-4">
                    <Input
                        label="Nome da Função"
                        placeholder="Ex: Cozinheiro, Garçom, etc."
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">
                            Descrição (Opcional)
                        </label>
                        <textarea
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background min-h-[80px] text-sm"
                            placeholder="Descreva as responsabilidades desta função..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg border border-border italic">
                        Nota: A função é apenas uma nomenclatura para organização. As permissões de acesso devem ser configuradas individualmente para cada funcionário na página de Equipe.
                    </p>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1" onClick={handleSave} disabled={!formData.name}>
                            {editingFunction ? 'Salvar Alterações' : 'Criar Função'}
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
