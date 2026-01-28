import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Building2, ExternalLink, Filter, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Mock companies for discovery
const DISCOVERY_COMPANIES = [
    {
        id: '1',
        name: 'Restaurante Sabor & Arte',
        category: 'Restaurante',
        rating: 4.9,
        reviews: 128,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
        distance: '0.8 km'
    },
    {
        id: '2',
        name: 'Hotel Transilvânia',
        category: 'Hotelaria',
        rating: 4.7,
        reviews: 256,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
        distance: '2.5 km'
    },
    {
        id: '3',
        name: 'Barbearia Estilo',
        category: 'Estética',
        rating: 4.8,
        reviews: 84,
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80',
        distance: '1.2 km'
    },
    {
        id: '4',
        name: 'Café da Vila',
        category: 'Cafeteria',
        rating: 4.6,
        reviews: 152,
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
        distance: '0.5 km'
    }
];

export function UserExplorePage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = DISCOVERY_COMPANIES.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Explorar Empresas</h1>
                <p className="text-muted-foreground mt-1">Conecte-se com estabelecimentos próximos e aproveite nossos serviços</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="O que você está procurando hoje? (Almoço, Corte de cabelo...)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary outline-none font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" /> Filtros
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map((company, index) => (
                    <motion.div
                        key={company.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                    >
                        <Card className="h-full overflow-hidden border-border/50 group cursor-pointer" onClick={() => window.location.hash = `#/profile?id=${company.id}`}>
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={company.image}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt={company.name}
                                />
                                <div className="absolute top-2 right-2 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase shadow-sm">
                                    {company.distance}
                                </div>
                            </div>
                            <CardContent className="pt-4">
                                <span className="text-[10px] font-black uppercase text-primary mb-1 block tracking-widest">{company.category}</span>
                                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{company.name}</h3>
                                <div className="flex items-center justify-between mt-4 pb-2 border-b border-border/50">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-bold">{company.rating}</span>
                                        <span className="text-xs text-muted-foreground">({company.reviews})</span>
                                    </div>
                                    <button className="p-2 bg-primary/10 text-primary rounded-lg">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                    <MapPin className="w-3 h-3" /> São Paulo, SP
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
