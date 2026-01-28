import axios, { AxiosInstance } from 'axios';
import { fiscalSimulation } from './fiscal-simulation.service';

// ============================================
// TYPES
// ============================================

export interface NFePayload {
    companyId: string;
    certificateId: string;
    recipient: {
        name: string;
        cpfCnpj: string;
        email?: string;
        phone?: string;
        address: {
            street: string;
            number: string;
            complement?: string;
            neighborhood: string;
            city: string;
            state: string;
            zipCode: string;
        };
    };
    items: Array<{
        productName: string;
        productCode?: string;
        ncm: string;
        cfop: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        icms?: number;
        pis?: number;
        cofins?: number;
    }>;
    totalValue: number;
    taxValue: number;
    environment: 'homologacao' | 'producao';
}

export interface NFCePayload extends Omit<NFePayload, 'recipient'> {
    recipient: {
        cpfCnpj?: string;
    };
    cscId: string;
    cscToken: string;
}

export interface NFSePayload {
    companyId: string;
    recipient: {
        name: string;
        cpfCnpj: string;
        email?: string;
    };
    serviceDescription: string;
    serviceCode: string;
    totalValue: number;
    issRate: number;
    environment: 'homologacao' | 'producao';
}

export interface TegraInvoiceResponse {
    id: string;
    status: 'processing' | 'authorized' | 'denied' | 'cancelled';
    accessKey?: string;
    protocol?: string;
    xmlUrl?: string;
    pdfUrl?: string;
    errorMessage?: string;
    errorCode?: string;
}

// ============================================
// TEGRA SERVICE
// ============================================

export class TegraService {
    private client: AxiosInstance;
    private apiKey: string;
    private environment: 'sandbox' | 'production';
    private simulationMode: boolean;

    constructor() {
        this.apiKey = process.env.TEGRA_API_KEY || '';
        this.environment = (process.env.TEGRA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
        this.simulationMode = !this.apiKey || process.env.FISCAL_SIMULATION_MODE === 'true';

        if (this.simulationMode) {
            console.warn('⚠️  Tegra API not configured - using SIMULATION MODE');
            console.warn('⚠️  Set TEGRA_API_KEY in .env to enable real fiscal operations');
            fiscalSimulation.logSimulationWarning();
        }

        const baseURL = this.environment === 'production'
            ? 'https://api.nfe.io/v1'
            : 'https://api.sandbox.nfe.io/v1';

        this.client = axios.create({
            baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds
        });

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('Tegra API Error:', error.response?.data || error.message);
                throw error;
            }
        );
    }

    /**
     * Issue NF-e (Nota Fiscal Eletrônica)
     */
    async issueNFe(payload: NFePayload): Promise<TegraInvoiceResponse> {
        // Use simulation mode if API key not configured
        if (this.simulationMode) {
            const simResult = await fiscalSimulation.simulateNFeIssuance({
                companyId: payload.companyId,
                number: '1',
                series: '1',
                recipientName: payload.recipient.name,
                recipientCpfCnpj: payload.recipient.cpfCnpj,
                totalValue: payload.totalValue,
                items: payload.items,
            });

            return {
                id: simResult.id,
                status: simResult.status as any,
                accessKey: simResult.accessKey,
                protocol: simResult.protocol,
                xmlUrl: simResult.xmlUrl,
                pdfUrl: simResult.danfeUrl,
            };
        }

        try {
            const response = await this.client.post('/nfe', {
                company_id: payload.companyId,
                environment: payload.environment,
                recipient: {
                    name: payload.recipient.name,
                    federal_tax_number: payload.recipient.cpfCnpj,
                    email: payload.recipient.email,
                    phone: payload.recipient.phone,
                    address: {
                        street: payload.recipient.address.street,
                        number: payload.recipient.address.number,
                        complement: payload.recipient.address.complement,
                        neighborhood: payload.recipient.address.neighborhood,
                        city: payload.recipient.address.city,
                        state: payload.recipient.address.state,
                        postal_code: payload.recipient.address.zipCode,
                    },
                },
                items: payload.items.map(item => ({
                    description: item.productName,
                    product_code: item.productCode,
                    ncm: item.ncm,
                    cfop: item.cfop,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    total_price: item.totalPrice,
                    icms: item.icms,
                    pis: item.pis,
                    cofins: item.cofins,
                })),
                total_value: payload.totalValue,
                tax_value: payload.taxValue,
            });

            return {
                id: response.data.id,
                status: response.data.status,
                accessKey: response.data.access_key,
                protocol: response.data.protocol,
                xmlUrl: response.data.xml_url,
                pdfUrl: response.data.pdf_url,
                errorMessage: response.data.error_message,
                errorCode: response.data.error_code,
            };
        } catch (error: any) {
            throw new Error(`Failed to issue NF-e: ${error.message}`);
        }
    }

    /**
     * Issue NFC-e (Nota Fiscal ao Consumidor Eletrônica)
     */
    async issueNFCe(payload: NFCePayload): Promise<TegraInvoiceResponse> {
        try {
            const response = await this.client.post('/nfce', {
                company_id: payload.companyId,
                environment: payload.environment,
                csc_id: payload.cscId,
                csc_token: payload.cscToken,
                recipient: {
                    federal_tax_number: payload.recipient.cpfCnpj,
                },
                items: payload.items.map(item => ({
                    description: item.productName,
                    product_code: item.productCode,
                    ncm: item.ncm,
                    cfop: item.cfop,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    total_price: item.totalPrice,
                    icms: item.icms,
                    pis: item.pis,
                    cofins: item.cofins,
                })),
                total_value: payload.totalValue,
                tax_value: payload.taxValue,
            });

            return {
                id: response.data.id,
                status: response.data.status,
                accessKey: response.data.access_key,
                protocol: response.data.protocol,
                xmlUrl: response.data.xml_url,
                pdfUrl: response.data.pdf_url,
                errorMessage: response.data.error_message,
                errorCode: response.data.error_code,
            };
        } catch (error: any) {
            throw new Error(`Failed to issue NFC-e: ${error.message}`);
        }
    }

    /**
     * Issue NFS-e (Nota Fiscal de Serviço Eletrônica)
     */
    async issueNFSe(payload: NFSePayload): Promise<TegraInvoiceResponse> {
        try {
            const response = await this.client.post('/nfse', {
                company_id: payload.companyId,
                environment: payload.environment,
                recipient: {
                    name: payload.recipient.name,
                    federal_tax_number: payload.recipient.cpfCnpj,
                    email: payload.recipient.email,
                },
                service_description: payload.serviceDescription,
                service_code: payload.serviceCode,
                total_value: payload.totalValue,
                iss_rate: payload.issRate,
            });

            return {
                id: response.data.id,
                status: response.data.status,
                accessKey: response.data.access_key,
                protocol: response.data.protocol,
                xmlUrl: response.data.xml_url,
                pdfUrl: response.data.pdf_url,
                errorMessage: response.data.error_message,
                errorCode: response.data.error_code,
            };
        } catch (error: any) {
            throw new Error(`Failed to issue NFS-e: ${error.message}`);
        }
    }

    /**
     * Cancel invoice
     */
    async cancelInvoice(invoiceId: string, reason: string): Promise<void> {
        try {
            await this.client.post(`/invoices/${invoiceId}/cancel`, {
                reason,
            });
        } catch (error: any) {
            throw new Error(`Failed to cancel invoice: ${error.message}`);
        }
    }

    /**
     * Send correction letter (CC-e)
     */
    async sendCorrection(invoiceId: string, correction: string): Promise<void> {
        try {
            await this.client.post(`/invoices/${invoiceId}/correction`, {
                correction,
            });
        } catch (error: any) {
            throw new Error(`Failed to send correction: ${error.message}`);
        }
    }

    /**
     * Check invoice status
     */
    async checkStatus(invoiceId: string): Promise<TegraInvoiceResponse> {
        try {
            const response = await this.client.get(`/invoices/${invoiceId}`);

            return {
                id: response.data.id,
                status: response.data.status,
                accessKey: response.data.access_key,
                protocol: response.data.protocol,
                xmlUrl: response.data.xml_url,
                pdfUrl: response.data.pdf_url,
                errorMessage: response.data.error_message,
                errorCode: response.data.error_code,
            };
        } catch (error: any) {
            throw new Error(`Failed to check invoice status: ${error.message}`);
        }
    }

    /**
     * Download XML
     */
    async downloadXML(invoiceId: string): Promise<Buffer> {
        try {
            const response = await this.client.get(`/invoices/${invoiceId}/xml`, {
                responseType: 'arraybuffer',
            });

            return Buffer.from(response.data);
        } catch (error: any) {
            throw new Error(`Failed to download XML: ${error.message}`);
        }
    }

    /**
     * Download DANFE (PDF)
     */
    async downloadDANFE(invoiceId: string): Promise<Buffer> {
        try {
            const response = await this.client.get(`/invoices/${invoiceId}/pdf`, {
                responseType: 'arraybuffer',
            });

            return Buffer.from(response.data);
        } catch (error: any) {
            throw new Error(`Failed to download DANFE: ${error.message}`);
        }
    }

    /**
     * Inutilize number range
     */
    async inutilizeNumbers(
        companyId: string,
        series: string,
        startNumber: number,
        endNumber: number,
        reason: string
    ): Promise<void> {
        try {
            await this.client.post('/inutilization', {
                company_id: companyId,
                series,
                start_number: startNumber,
                end_number: endNumber,
                reason,
            });
        } catch (error: any) {
            throw new Error(`Failed to inutilize numbers: ${error.message}`);
        }
    }

    /**
     * Query SEFAZ status
     */
    async querySEFAZStatus(state: string): Promise<{ online: boolean; message?: string }> {
        try {
            const response = await this.client.get(`/sefaz/status/${state}`);

            return {
                online: response.data.online,
                message: response.data.message,
            };
        } catch (error: any) {
            return {
                online: false,
                message: error.message,
            };
        }
    }
}

export default new TegraService();
