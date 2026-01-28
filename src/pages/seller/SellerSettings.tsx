import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save } from 'lucide-react';

export function SellerSettings() {
    const [settings, setSettings] = useState({
        name: 'Vendedor Teste',
        email: 'vendedor.teste@sepi.pro',
        phone: '(11) 98765-4321',
        sellerCode: 'VEND-TEST01',
    });

    const handleSave = () => {
        console.log('Saving settings:', settings);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground mt-1">Gerencie suas informações de vendedor</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        label="Nome"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    />
                    <Input
                        label="Telefone"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    />
                    <Input
                        label="Código do Vendedor"
                        value={settings.sellerCode}
                        disabled
                    />
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
