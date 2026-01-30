import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, Package, Image as ImageIcon, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { mockProducts } from '../../data/mockData';
import { formatCurrency } from '../../utils/validators';
import { Modal } from '../../components/ui/Modal';
import { Product } from '../../types/user';

import { db } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

export function ProductsPage() {
    const { currentCompany } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<any[]>([]);

    // Initial Load
    useEffect(() => {
        if (currentCompany) {
            const allProducts = db.getProducts();
            setProducts(allProducts.filter(p => p.companyId === currentCompany.id));
            setCategories(db.getCategories(currentCompany.id));
        }
    }, [currentCompany]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        price: '',
        stock: '',
        minStock: '',
        sku: '',
        barcode: '',
        description: '',
        imageUrl: '',
        isActive: true,
        requiresPreparation: false,
        requiresReservation: false,
        requiresAppointment: false,
        requiresDelivery: false,
        type: 'product' as 'product' | 'service',
        duration: '',
        costPrice: ''
    });

    const resetForm = () => {
        setFormData({
            name: '',
            categoryId: categories[0]?.id || '',
            price: '',
            stock: '',
            minStock: '',
            sku: '',
            barcode: '',
            description: '',
            imageUrl: '',
            isActive: true,
            requiresPreparation: false,
            requiresReservation: false,
            requiresAppointment: false,
            requiresDelivery: false,
            type: 'product',
            duration: '',
            costPrice: ''
        });
        setEditingProduct(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            categoryId: product.categoryId,
            price: product.price.toString(),
            stock: product.stock?.toString() || '',
            minStock: product.minStock?.toString() || '',
            sku: product.sku || '',
            barcode: product.barcode || '',
            description: product.description || '',
            imageUrl: product.images?.[0] || '',
            isActive: product.isActive,
            requiresPreparation: product.requiresPreparation || false,
            requiresReservation: product.requiresReservation || false,
            requiresAppointment: product.requiresAppointment || false,
            requiresDelivery: product.requiresDelivery || false,
            type: product.type,
            duration: product.duration?.toString() || '',
            costPrice: product.costPrice?.toString() || ''
        });
        setShowAddModal(true);
    };

    const handleDelete = (productId: string) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            const updated = products.filter(p => p.id !== productId);
            setProducts(updated);
            db.saveProducts(updated);
        }
    };

    const handleSave = () => {
        if (!formData.name || !formData.price) {
            alert('Preencha os campos obrigatórios');
            return;
        }

        const allProducts = db.getProducts();
        const productData = {
            name: formData.name,
            categoryId: formData.categoryId,
            price: parseFloat(formData.price),
            stock: formData.stock ? parseInt(formData.stock) : undefined,
            minStock: formData.minStock ? parseInt(formData.minStock) : undefined,
            sku: formData.sku,
            barcode: formData.barcode,
            description: formData.description,
            images: formData.imageUrl ? [formData.imageUrl] : [],
            isActive: formData.isActive,
            requiresPreparation: formData.requiresPreparation,
            requiresReservation: formData.requiresReservation,
            requiresAppointment: formData.requiresAppointment,
            requiresDelivery: formData.requiresDelivery,
            type: formData.type,
            duration: formData.type === 'service' ? parseInt(formData.duration) : undefined,
            costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
            updatedAt: new Date().toISOString()
        };

        let updatedProducts: Product[];
        if (editingProduct) {
            updatedProducts = allProducts.map(p =>
                p.id === editingProduct.id
                    ? { ...p, ...productData }
                    : p
            );
        } else {
            const newProduct: Product = {
                id: `prod-${Date.now()}`,
                companyId: currentCompany?.id || 'company-001',
                type: formData.type,
                images: [],
                createdAt: new Date().toISOString(),
                ...productData
            };
            updatedProducts = [...allProducts, newProduct];
        }

        db.saveProducts(updatedProducts);
        setProducts(updatedProducts.filter(p => p.companyId === currentCompany?.id));
        setShowAddModal(false);
        resetForm();
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Produtos e Serviços</h1>
                    <p className="text-muted-foreground mt-1">Gerencie seu catálogo de produtos e serviços</p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total de Produtos', value: products.length, color: 'text-blue-500' },
                    { label: 'Produtos Ativos', value: products.filter(p => p.isActive).length, color: 'text-green-500' },
                    { label: 'Categorias', value: categories.length, color: 'text-purple-500' },
                    { label: 'Estoque Baixo', value: products.filter(p => p.stock && p.minStock && p.stock < p.minStock).length, color: 'text-orange-500' },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar produtos ou serviços..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all">Todas as Categorias</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card hover className="h-full">
                            <CardContent className="p-0">
                                {/* Product Image */}
                                <div className="aspect-video bg-muted flex items-center justify-center border-b">
                                    {product.images.length > 0 ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{product.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                                        </div>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {product.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div>
                                            <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
                                            {product.stock !== undefined && (
                                                <p className="text-sm text-muted-foreground">
                                                    Estoque: <span className={product.stock < (product.minStock || 0) ? 'text-orange-600 font-medium' : ''}>{product.stock}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {product.sku && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-muted-foreground">
                                                SKU: <span className="font-mono">{product.sku}</span>
                                                {product.barcode && <> • Código: <span className="font-mono">{product.barcode}</span></>}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro produto'}
                        </p>
                        <Button onClick={handleOpenAdd}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Produto
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Add/Edit Product Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingProduct ? "Editar Produto" : "Adicionar Produto"}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Tipo de Cadastro
                            </label>
                            <div className="flex bg-muted rounded-lg p-1">
                                <button
                                    onClick={() => setFormData({ ...formData, type: 'product' })}
                                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${formData.type === 'product' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Produto
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, type: 'service' })}
                                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${formData.type === 'service' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Serviço
                                </button>
                            </div>
                        </div>
                        <Input
                            label="Nome do Cadastro"
                            placeholder={formData.type === 'product' ? "Ex: Feijoada Completa" : "Ex: Corte de Cabelo"}
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                            <label className="block text-sm font-medium text-foreground">
                                Categoria
                            </label>
                            <a
                                href="#/company/categories"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                                <Settings className="w-3 h-3" />
                                Gerenciar Categorias
                            </a>
                        </div>
                        <select
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        >
                            <option value="">Selecione uma categoria...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Preço de Venda (R$)"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        {formData.type === 'product' ? (
                            <Input
                                label="Estoque Inicial"
                                type="number"
                                placeholder="0"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                        ) : (
                            <Input
                                label="Custo do Serviço (R$)"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.costPrice}
                                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.type === 'product' ? (
                            <Input
                                label="Estoque Mínimo"
                                type="number"
                                placeholder="0"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                            />
                        ) : (
                            <Input
                                label="Tempo de Execução (minutos)"
                                type="number"
                                placeholder="Ex: 30"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            />
                        )}
                        <Input
                            label="SKU (Opcional)"
                            placeholder="EX: PRD-001"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Código de Barras (Opcional)"
                            placeholder="789..."
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Descrição
                        </label>
                        <textarea
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background min-h-[100px]"
                            placeholder="Descreva o produto ou serviço..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="URL da Imagem do Produto"
                            placeholder="https://exemplo.com/imagem.jpg"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            icon={<ImageIcon className="w-4 h-4" />}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {formData.imageUrl && (
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
                                <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                <button
                                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {!formData.imageUrl && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="p-8 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer bg-muted/20"
                            >
                                <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                <p className="text-sm font-bold uppercase tracking-widest">Adicionar Foto do Produto</p>
                                <p className="text-[10px] uppercase mt-1">Insira uma URL ou selecione um arquivo</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded"
                        />
                        <label htmlFor="active" className="text-sm font-medium">Produto Ativo</label>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            id="requiresPreparation"
                            checked={formData.requiresPreparation}
                            onChange={(e) => setFormData({ ...formData, requiresPreparation: e.target.checked })}
                            className="rounded"
                        />
                        <label htmlFor="requiresPreparation" className="text-sm font-medium">Exige Preparo (Cozinha)</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 py-2">
                            <input
                                type="checkbox"
                                id="requiresReservation"
                                checked={formData.requiresReservation}
                                onChange={(e) => setFormData({ ...formData, requiresReservation: e.target.checked })}
                                className="rounded"
                            />
                            <label htmlFor="requiresReservation" className="text-sm font-medium">Exige Reserva</label>
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <input
                                type="checkbox"
                                id="requiresAppointment"
                                checked={formData.requiresAppointment}
                                onChange={(e) => setFormData({ ...formData, requiresAppointment: e.target.checked })}
                                className="rounded"
                            />
                            <label htmlFor="requiresAppointment" className="text-sm font-medium">Exige Agenda</label>
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <input
                                type="checkbox"
                                id="requiresDelivery"
                                checked={formData.requiresDelivery}
                                onChange={(e) => setFormData({ ...formData, requiresDelivery: e.target.checked })}
                                className="rounded"
                            />
                            <label htmlFor="requiresDelivery" className="text-sm font-medium">Exige Entrega</label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1" onClick={handleSave}>
                            {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
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
