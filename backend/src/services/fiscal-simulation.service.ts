/**
 * Fiscal Simulation Service
 * Simulates fiscal operations when Tegra API is not configured
 * Useful for development and testing
 */

import { v4 as uuidv4 } from 'uuid';
import { FiscalDocument, InvoiceType, InvoiceStatus, FiscalEnv } from '@prisma/client';

interface SimulatedNFeResponse {
    id: string;
    accessKey: string;
    number: string;
    series: string;
    status: InvoiceStatus;
    authorizedAt?: Date;
    xmlUrl?: string;
    danfeUrl?: string;
    protocol?: string;
}

export class FiscalSimulationService {
    private simulationMode: boolean;

    constructor() {
        this.simulationMode = process.env.FISCAL_SIMULATION_MODE === 'true';
    }

    /**
     * Check if simulation mode is enabled
     */
    isSimulationMode(): boolean {
        return this.simulationMode;
    }

    /**
     * Generate simulated access key (44 digits)
     */
    private generateAccessKey(): string {
        const uf = '35'; // SP
        const year = new Date().getFullYear().toString().slice(-2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const cnpj = '12345678000100';
        const model = '55'; // NF-e
        const series = '001';
        const number = Math.floor(Math.random() * 999999).toString().padStart(9, '0');
        const emission = '1'; // Normal
        const code = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');

        const baseKey = uf + year + month + cnpj + model + series + number + emission + code;
        const checkDigit = this.calculateCheckDigit(baseKey);

        return baseKey + checkDigit;
    }

    /**
     * Calculate check digit for access key
     */
    private calculateCheckDigit(key: string): string {
        const weights = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        let sum = 0;
        for (let i = 0; i < key.length; i++) {
            sum += parseInt(key[i]) * weights[i];
        }

        const remainder = sum % 11;
        const digit = remainder < 2 ? 0 : 11 - remainder;

        return digit.toString();
    }

    /**
     * Generate simulated protocol number
     */
    private generateProtocol(): string {
        const timestamp = Date.now().toString();
        return '1' + timestamp.slice(-14);
    }

    /**
     * Simulate NF-e issuance
     */
    async simulateNFeIssuance(data: {
        companyId: string;
        number: string;
        series: string;
        recipientName: string;
        recipientCpfCnpj: string;
        totalValue: number;
        items: any[];
    }): Promise<SimulatedNFeResponse> {
        console.log('🎭 [SIMULATION] Issuing NF-e...');

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const accessKey = this.generateAccessKey();
        const protocol = this.generateProtocol();
        const id = uuidv4();

        // 90% success rate in simulation
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            console.log('✅ [SIMULATION] NF-e authorized successfully');
            return {
                id,
                accessKey,
                number: data.number,
                series: data.series,
                status: InvoiceStatus.AUTHORIZED,
                authorizedAt: new Date(),
                xmlUrl: `https://simulation.sepi.pro/xml/${accessKey}.xml`,
                danfeUrl: `https://simulation.sepi.pro/danfe/${accessKey}.pdf`,
                protocol,
            };
        } else {
            console.log('❌ [SIMULATION] NF-e denied (simulated error)');
            return {
                id,
                accessKey,
                number: data.number,
                series: data.series,
                status: InvoiceStatus.DENIED,
            };
        }
    }

    /**
     * Simulate NFC-e issuance
     */
    async simulateNFCeIssuance(data: {
        companyId: string;
        number: string;
        series: string;
        totalValue: number;
        items: any[];
    }): Promise<SimulatedNFeResponse> {
        console.log('🎭 [SIMULATION] Issuing NFC-e...');

        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

        const accessKey = this.generateAccessKey();
        const protocol = this.generateProtocol();
        const id = uuidv4();

        return {
            id,
            accessKey,
            number: data.number,
            series: data.series,
            status: InvoiceStatus.AUTHORIZED,
            authorizedAt: new Date(),
            xmlUrl: `https://simulation.sepi.pro/xml/${accessKey}.xml`,
            danfeUrl: `https://simulation.sepi.pro/danfe/${accessKey}.pdf`,
            protocol,
        };
    }

    /**
     * Simulate invoice cancellation
     */
    async simulateCancellation(invoiceId: string, reason: string): Promise<{ success: boolean; protocol?: string }> {
        console.log('🎭 [SIMULATION] Cancelling invoice...');

        await new Promise(resolve => setTimeout(resolve, 1000));

        const isSuccess = Math.random() > 0.05; // 95% success rate

        if (isSuccess) {
            console.log('✅ [SIMULATION] Invoice cancelled successfully');
            return {
                success: true,
                protocol: this.generateProtocol(),
            };
        } else {
            console.log('❌ [SIMULATION] Cancellation failed (simulated error)');
            return {
                success: false,
            };
        }
    }

    /**
     * Simulate status check
     */
    async simulateStatusCheck(invoiceId: string): Promise<{ status: InvoiceStatus; message?: string }> {
        console.log('🎭 [SIMULATION] Checking invoice status...');

        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            status: InvoiceStatus.AUTHORIZED,
            message: 'Invoice authorized (simulated)',
        };
    }

    /**
     * Generate simulated XML content
     */
    generateSimulatedXML(invoice: any): string {
        return `<?xml version="1.0" encoding="UTF-8"?>
<!-- SIMULATED XML - NOT VALID FOR FISCAL PURPOSES -->
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${invoice.accessKey}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>${Math.floor(Math.random() * 99999999)}</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>55</mod>
        <serie>${invoice.series}</serie>
        <nNF>${invoice.number}</nNF>
        <dhEmi>${new Date().toISOString()}</dhEmi>
        <tpNF>1</tpNF>
        <tpAmb>2</tpAmb>
        <tpEmis>1</tpEmis>
      </ide>
      <emit>
        <CNPJ>12345678000100</CNPJ>
        <xNome>EMPRESA SIMULADA LTDA</xNome>
        <xFant>SIMULACAO</xFant>
      </emit>
      <dest>
        <xNome>${invoice.recipientName}</xNome>
        <CPF>${invoice.recipientCpfCnpj}</CPF>
      </dest>
      <total>
        <ICMSTot>
          <vNF>${invoice.totalValue}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>2</tpAmb>
      <verAplic>SIMULACAO</verAplic>
      <chNFe>${invoice.accessKey}</chNFe>
      <dhRecbto>${new Date().toISOString()}</dhRecbto>
      <nProt>${this.generateProtocol()}</nProt>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e (SIMULADO)</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;
    }

    /**
     * Generate simulated DANFE (PDF placeholder)
     */
    generateSimulatedDANFE(invoice: any): Buffer {
        // In a real implementation, this would generate a PDF
        // For now, return a placeholder
        const content = `DANFE - DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA
    
SIMULAÇÃO - NÃO VÁLIDO PARA FINS FISCAIS

Número: ${invoice.number}
Série: ${invoice.series}
Chave de Acesso: ${invoice.accessKey}
Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}

Destinatário: ${invoice.recipientName}
CPF/CNPJ: ${invoice.recipientCpfCnpj}

Valor Total: R$ ${invoice.totalValue.toFixed(2)}

ESTE É UM DOCUMENTO SIMULADO
NÃO POSSUI VALIDADE FISCAL`;

        return Buffer.from(content, 'utf-8');
    }

    /**
     * Log simulation warning
     */
    logSimulationWarning() {
        console.warn('⚠️  FISCAL SIMULATION MODE ENABLED');
        console.warn('⚠️  Documents generated are NOT valid for fiscal purposes');
        console.warn('⚠️  Configure Tegra API for production use');
    }
}

export const fiscalSimulation = new FiscalSimulationService();
