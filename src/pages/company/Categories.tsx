import React, { useState, useEffect } from 'react';
import {
    LayoutGrid,
    Plus,
    Search,
    Edit2,
    Trash2,
    ChevronRight,
    Tag,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/db';
import { Category } from '../../types/user';

export default function Categories() {
    const { currentCompany } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        loadCategories();
    }, [currentCompany]);

    const loadCategories = () => {
        if (currentCompany) {
            const data = db.getCategories(currentCompany.id);
            setCategories(data);
        }
    };

    const handleOpenAdd = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            db.deleteCategory(id);
            loadCategories();
        }
    };

    const handleSave = () => {
        if (!currentCompany) return;

        const categoryData: Category = {
            id: editingCategory?.id || `cat-${Date.now()}`,
            companyId: currentCompany.id,
            name: formData.name,
            description: formData.description
        };

        db.saveCategory(categoryData);
        setShowModal(false);
        loadCategories();
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
                    <p className="text-muted-foreground">Gerencie as categorias de seus produtos e serviços</p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Categoria
                </Button>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar categorias..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map(category => (
                    <Card key={category.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Tag className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{category.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {category.description || 'Sem descrição'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(category)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(category.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Nenhuma categoria encontrada.</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? "Editar Categoria" : "Nova Categoria"}
            >
                <div className="space-y-4">
                    <Input
                        label="Nome da Categoria"
                        placeholder="Ex: Bebidas, Corte de Cabelo, etc."
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">
                            Descrição (Opcional)
                        </label>
                        <textarea
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background min-h-[100px]"
                            placeholder="Descreva esta categoria..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1" onClick={handleSave} disabled={!formData.name}>
                            {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
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
