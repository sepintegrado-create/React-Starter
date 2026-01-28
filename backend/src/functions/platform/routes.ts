import { Router, Request, Response } from 'express';

const router = Router();

// Mock database for platform fiscal configuration
let platformFiscalConfig = {
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'SEPI Tecnologia Ltda',
    inscricaoEstadual: '123.456.789.012',
    inscricaoMunicipal: '12345678',
    regime: 'lucro_presumido',
    aliquotaISS: '5',
    aliquotaPIS: '0.65',
    aliquotaCOFINS: '3',
    certificateStatus: 'valid',
    certificateExpiry: '2025-12-15',
    nfseAutomatic: true,
    tegraEnvironment: 'homologacao',
    tegraBaseUrl: 'https://api.nfe.io/v1',
    tegraCompanyId: '',
    hasApiKey: false,
};

/**
 * GET /api/platform/fiscal
 * Get platform fiscal configuration
 */
router.get('/fiscal', async (req: Request, res: Response) => {
    try {
        // TODO: Add authentication check for PLATFORM_ADMIN role
        res.json(platformFiscalConfig);
    } catch (error: any) {
        console.error('Error getting platform fiscal config:', error);
        res.status(500).json({ 
            error: 'Failed to get platform fiscal configuration',
            message: error.message 
        });
    }
});

/**
 * PUT /api/platform/fiscal
 * Update platform fiscal configuration
 */
router.put('/fiscal', async (req: Request, res: Response) => {
    try {
        // TODO: Add authentication check for PLATFORM_ADMIN role
        
        const data = req.body;
        
        // Update configuration
        platformFiscalConfig = {
            ...platformFiscalConfig,
            ...data,
        };

        res.json({
            message: 'Platform fiscal configuration updated successfully',
            config: platformFiscalConfig,
        });
    } catch (error: any) {
        console.error('Error updating platform fiscal config:', error);
        res.status(500).json({ 
            error: 'Failed to update platform fiscal configuration',
            message: error.message 
        });
    }
});

module.exports = router;
