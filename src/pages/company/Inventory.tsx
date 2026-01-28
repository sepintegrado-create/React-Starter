import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    Plus,
    History,
    Truck,
    Barcode,
    MoreVertical,
    ChevronRight,
    Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { mockProducts, mockSuppliers } from '../../data/mockData';
import { formatCurrency } from '../../utils/validators';

import { db, StockMovement } from '../../services/db';

export function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [entryData, setEntryData] = useState({ productId: '', quantity: '', reason: 'Compra Fornecedor' });

    const refreshData = () => {
        setProducts(db.getProducts());
        setMovements(db.getStockMovements());
    }

    useEffect(() => {
        refreshData();
    }, []);

    const handleSaveEntry = () => {
        if (!entryData.productId || !entryData.quantity) {
            alert('Selecione um produto e informe a quantidade.');
            return;
        }
        db.adjustStock(entryData.productId, parseInt(entryData.quantity), entryData.reason);
        refreshData();
        setShowEntryModal(false);
        setEntryData({ productId: '', quantity: '', reason: 'Compra Fornecedor' });
        alert('Entrada de estoque registrada com sucesso!');
    };

    const handleManualAdjustment = (product: any) => {
        const amount = prompt(`Ajuste manual para ${product.name}. Informe a quantidade atual no estoque:`, product.stock?.toString());
        if (amount !== null) {
            const newQty = parseInt(amount);
            if (!isNaN(newQty)) {
                const diff = newQty - (product.stock || 0);
                db.adjustStock(product.id, diff, 'Ajuste Manual');
                refreshData();
            }
        }
    };

    const lowStockProducts = products.filter(p => p.stock !== undefined && p.minStock !== undefined && p.stock <= p.minStock);
    const totalStockItems = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Controle de Estoque</h1>
                    <p className="text-muted-foreground mt-1">Gerencie seu inventário, movimentações e fornecedores</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <History className="w-4 h-4 mr-2" />
                        Relatório
                    </Button>
                    <Button size="sm" onClick={() => setShowEntryModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Entrada de Estoque
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">Total de Itens</p>
                                <p className="text-2xl font-black">{totalStockItems}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={lowStockProducts.length > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${lowStockProducts.length > 0 ? "bg-destructive/20 text-destructive" : "bg-green-100 text-green-600"}`}>
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">Estoque Baixo</p>
                                <p className={`text-2xl font-black ${lowStockProducts.length > 0 ? "text-destructive" : ""}`}>{lowStockProducts.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">Fornecedores</p>
                                <p className="text-2xl font-black">{mockSuppliers.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div onClick={() => setIsBarcodeModalOpen(true)} className="cursor-pointer">
                    <Card className="hover:bg-accent transition-colors h-full">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <Barcode className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Etiquetas</p>
                                    <p className="text-2xl font-black">Gerar</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main List */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <CardTitle className="text-lg font-bold">Inventário</CardTitle>
                                <div className="relative flex-1 md:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar produto ou SKU..."
                                        className="pl-9 h-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b border-border text-muted-foreground font-bold uppercase text-[10px] tracking-wider">
                                            <th className="pb-3 pl-2">Produto</th>
                                            <th className="pb-3">SKU</th>
                                            <th className="pb-3 text-center">Quantidade</th>
                                            <th className="pb-3 text-center">Mínimo</th>
                                            <th className="pb-3 text-right pr-2">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {products
                                            .filter(p => p.type === 'product' && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase())))
                                            .map((product) => (
                                                <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="py-4 pl-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                                                <Package className="w-4 h-4 text-muted-foreground" />
                                                            </div>
                                                            <span className="font-semibold">{product.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 font-mono text-xs">{product.sku}</td>
                                                    <td className="py-4 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${Number(product.stock) <= Number(product.minStock)
                                                            ? "bg-destructive/10 text-destructive"
                                                            : "bg-green-100 text-green-600"
                                                            }`}>
                                                            {product.stock || 0}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-center text-muted-foreground">{product.minStock || 0}</td>
                                                    <td className="py-4 text-right pr-2">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedProduct(product);
                                                                    setIsBarcodeModalOpen(true);
                                                                }}
                                                                className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-primary"
                                                                title="Gerar Etiqueta"
                                                            >
                                                                <Barcode className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleManualAdjustment(product)}
                                                                className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                                                                title="Ajuste Manual"
                                                            >
                                                                <MoreVertical className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recent Movements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" />
                                Movimentações Recentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {movements.length > 0 ? movements.slice(0, 10).map((move) => (
                                <div key={move.id} className="flex items-start justify-between group">
                                    <div className="flex gap-3">
                                        <div className={`mt-1 p-1.5 rounded-full ${move.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                                            {move.type === 'in' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">{move.productName}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{move.reason} • {move.date}</p>
                                        </div>
                                    </div>
                                    <p className={`text-xs font-black ${move.type === 'in' ? 'text-green-600' : 'text-destructive'}`}>
                                        {move.type === 'in' ? '+' : '-'}{move.quantity}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-xs text-muted-foreground italic text-center py-4">Nenhuma movimentação registrada.</p>
                            )}
                            <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-primary">
                                Ver todo o histórico
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Suppliers List */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Truck className="w-4 h-4 text-muted-foreground" />
                                Fornecedores Principais
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Plus className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {mockSuppliers.slice(0, 3).map((supplier) => (
                                <div key={supplier.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                            {supplier.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold truncate max-w-[120px]">{supplier.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{supplier.rating} ⭐</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                </div>
                            ))}
                            <Button variant="outline" className="w-full text-xs font-bold">
                                Gerenciar Fornecedores
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* New Entry Modal */}
            <Modal
                isOpen={showEntryModal}
                onClose={() => setShowEntryModal(false)}
                title="Entrada de Estoque"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Produto</label>
                        <select
                            className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                            value={entryData.productId}
                            onChange={(e) => setEntryData({ ...entryData, productId: e.target.value })}
                        >
                            <option value="">Selecione um produto...</option>
                            {products.filter(p => p.type === 'product').map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Atual: {p.stock || 0})</option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label="Quantidade de Entrada"
                        type="number"
                        placeholder="0"
                        value={entryData.quantity}
                        onChange={(e) => setEntryData({ ...entryData, quantity: e.target.value })}
                    />
                    <Input
                        label="Motivo / Fornecedor"
                        placeholder="Ex: Nota Fiscal #123"
                        value={entryData.reason}
                        onChange={(e) => setEntryData({ ...entryData, reason: e.target.value })}
                    />
                    <div className="flex gap-3 pt-4 border-t">
                        <Button className="flex-1" onClick={handleSaveEntry}>Confirmar Entrada</Button>
                        <Button variant="outline" className="flex-1" onClick={() => setShowEntryModal(false)}>Cancelar</Button>
                    </div>
                </div>
            </Modal>

            {/* Barcode Modal */}
            <Modal
                isOpen={isBarcodeModalOpen}
                onClose={() => {
                    setIsBarcodeModalOpen(false);
                    setSelectedProduct(null);
                }}
                title="Gerador de Etiquetas"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                        <div className="text-center">
                            <div className="bg-white p-4 rounded border border-border inline-block mb-3">
                                <div className="w-48 h-20 bg-black flex items-center justify-center">
                                    <span className="text-white font-mono text-xl tracking-[0.5em]">|||||||||||||</span>
                                </div>
                                <p className="mt-2 text-[10px] font-mono font-bold">{selectedProduct?.barcode || '7890000000000'}</p>
                            </div>
                            <p className="text-sm font-bold">{selectedProduct?.name || 'Selecione um produto'}</p>
                            <p className="text-xs text-muted-foreground">Preço: {selectedProduct ? formatCurrency(selectedProduct.price) : 'R$ 0,00'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Quantidade de Etiquetas" type="number" defaultValue={10} />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tamanho</label>
                                <select className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary">
                                    <option>30x20mm</option>
                                    <option>40x25mm</option>
                                    <option>50x30mm</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <Barcode className="w-5 h-5 text-primary" />
                            <p className="text-xs text-primary">
                                As etiquetas serão geradas seguindo o padrão **EAN-13** configurado no cadastro do produto.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="outline" onClick={() => setIsBarcodeModalOpen(false)}>Cancelar</Button>
                        <Button>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar PDF para Impressão
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
