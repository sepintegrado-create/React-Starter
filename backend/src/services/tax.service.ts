import { Decimal } from '@prisma/client/runtime/library';

// ============================================
// TYPES
// ============================================

export interface Product {
    id: string;
    type: 'PRODUCT' | 'SERVICE';
    price: Decimal;
    ncm?: string;
    cfop?: string;
    cst?: string;
    icmsRate?: Decimal;
    pisRate?: Decimal;
    cofinsRate?: Decimal;
    issRate?: Decimal;
}

export interface Company {
    fiscalRegime: 'SIMPLES' | 'PRESUMIDO' | 'REAL';
    addressState: string;
    addressCity: string;
}

export interface TaxBreakdown {
    icms: Decimal;
    pis: Decimal;
    cofins: Decimal;
    iss: Decimal;
    total: Decimal;
}

export interface TransactionItem {
    product: Product;
    quantity: number;
    unitPrice: Decimal;
    totalPrice: Decimal;
}

// ============================================
// TAX CALCULATION SERVICE
// ============================================

export class TaxCalculationService {
    /**
     * Calculate ICMS (Imposto sobre Circulação de Mercadorias e Serviços)
     */
    calculateICMS(
        product: Product,
        company: Company,
        destinationState: string,
        totalValue: Decimal
    ): Decimal {
        // Products only, not services
        if (product.type === 'SERVICE') {
            return new Decimal(0);
        }

        // Get ICMS rate based on regime and state
        let icmsRate = product.icmsRate || new Decimal(0);

        // Simples Nacional has different rules
        if (company.fiscalRegime === 'SIMPLES') {
            // Simples Nacional - ICMS included in DAS
            // For interstate sales, may have DIFAL
            if (company.addressState !== destinationState) {
                // Simplified DIFAL calculation
                const originRate = this.getICMSRateByState(company.addressState);
                const destRate = this.getICMSRateByState(destinationState);
                icmsRate = destRate.minus(originRate);
            } else {
                // Same state - no ICMS to calculate separately
                return new Decimal(0);
            }
        }

        return totalValue.times(icmsRate).dividedBy(100);
    }

    /**
     * Calculate PIS (Programa de Integração Social)
     */
    calculatePIS(
        product: Product,
        company: Company,
        totalValue: Decimal
    ): Decimal {
        let pisRate = product.pisRate || new Decimal(0);

        // Simples Nacional
        if (company.fiscalRegime === 'SIMPLES') {
            return new Decimal(0); // Included in DAS
        }

        // Lucro Real - Non-cumulative
        if (company.fiscalRegime === 'REAL') {
            pisRate = new Decimal(1.65); // Standard rate
        }

        // Lucro Presumido - Cumulative
        if (company.fiscalRegime === 'PRESUMIDO') {
            pisRate = new Decimal(0.65); // Standard rate
        }

        return totalValue.times(pisRate).dividedBy(100);
    }

    /**
     * Calculate COFINS (Contribuição para Financiamento da Seguridade Social)
     */
    calculateCOFINS(
        product: Product,
        company: Company,
        totalValue: Decimal
    ): Decimal {
        let cofinsRate = product.cofinsRate || new Decimal(0);

        // Simples Nacional
        if (company.fiscalRegime === 'SIMPLES') {
            return new Decimal(0); // Included in DAS
        }

        // Lucro Real - Non-cumulative
        if (company.fiscalRegime === 'REAL') {
            cofinsRate = new Decimal(7.6); // Standard rate
        }

        // Lucro Presumido - Cumulative
        if (company.fiscalRegime === 'PRESUMIDO') {
            cofinsRate = new Decimal(3.0); // Standard rate
        }

        return totalValue.times(cofinsRate).dividedBy(100);
    }

    /**
     * Calculate ISS (Imposto Sobre Serviços)
     */
    calculateISS(
        product: Product,
        company: Company,
        totalValue: Decimal
    ): Decimal {
        // Services only, not products
        if (product.type === 'PRODUCT') {
            return new Decimal(0);
        }

        // ISS rate varies by city (2% to 5%)
        let issRate = product.issRate || this.getISSRateByCity(company.addressCity);

        // Simples Nacional
        if (company.fiscalRegime === 'SIMPLES') {
            // ISS is included in DAS, but may have additional municipal tax
            // Simplified: return 0 for now
            return new Decimal(0);
        }

        return totalValue.times(issRate).dividedBy(100);
    }

    /**
     * Calculate total taxes for transaction
     */
    calculateTotalTax(
        items: TransactionItem[],
        company: Company,
        destinationState?: string
    ): TaxBreakdown {
        let totalICMS = new Decimal(0);
        let totalPIS = new Decimal(0);
        let totalCOFINS = new Decimal(0);
        let totalISS = new Decimal(0);

        for (const item of items) {
            const itemTotal = new Decimal(item.totalPrice);
            const destState = destinationState || company.addressState;

            totalICMS = totalICMS.plus(
                this.calculateICMS(item.product, company, destState, itemTotal)
            );

            totalPIS = totalPIS.plus(
                this.calculatePIS(item.product, company, itemTotal)
            );

            totalCOFINS = totalCOFINS.plus(
                this.calculateCOFINS(item.product, company, itemTotal)
            );

            totalISS = totalISS.plus(
                this.calculateISS(item.product, company, itemTotal)
            );
        }

        const total = totalICMS.plus(totalPIS).plus(totalCOFINS).plus(totalISS);

        return {
            icms: totalICMS,
            pis: totalPIS,
            cofins: totalCOFINS,
            iss: totalISS,
            total,
        };
    }

    /**
     * Get ICMS rate by state
     */
    private getICMSRateByState(state: string): Decimal {
        const rates: Record<string, number> = {
            'AC': 17, 'AL': 18, 'AP': 18, 'AM': 18, 'BA': 18,
            'CE': 18, 'DF': 18, 'ES': 17, 'GO': 17, 'MA': 18,
            'MT': 17, 'MS': 17, 'MG': 18, 'PA': 17, 'PB': 18,
            'PR': 18, 'PE': 18, 'PI': 18, 'RJ': 18, 'RN': 18,
            'RS': 18, 'RO': 17.5, 'RR': 17, 'SC': 17, 'SP': 18,
            'SE': 18, 'TO': 18,
        };

        return new Decimal(rates[state] || 18);
    }

    /**
     * Get ISS rate by city (simplified - in production, use a database)
     */
    private getISSRateByCity(city: string): Decimal {
        // Simplified: return default rate
        // In production, query database with city-specific rates
        return new Decimal(5); // 5% default
    }

    /**
     * Calculate Simples Nacional tax
     */
    calculateSimplesNacional(
        totalRevenue12Months: Decimal,
        monthlyRevenue: Decimal,
        activityType: 'commerce' | 'industry' | 'services'
    ): Decimal {
        // Simplified calculation based on Anexo I, III, or V
        // In production, use complete tables

        const effectiveRate = this.getSimplesRate(totalRevenue12Months, activityType);
        return monthlyRevenue.times(effectiveRate).dividedBy(100);
    }

    /**
     * Get Simples Nacional rate based on revenue
     */
    private getSimplesRate(
        revenue12Months: Decimal,
        activityType: 'commerce' | 'industry' | 'services'
    ): Decimal {
        // Simplified progressive rates
        // Anexo I (Commerce) - example
        if (activityType === 'commerce') {
            if (revenue12Months.lte(180000)) return new Decimal(4);
            if (revenue12Months.lte(360000)) return new Decimal(7.3);
            if (revenue12Months.lte(720000)) return new Decimal(9.5);
            if (revenue12Months.lte(1800000)) return new Decimal(10.7);
            if (revenue12Months.lte(3600000)) return new Decimal(14.3);
            return new Decimal(19);
        }

        // Anexo III (Services) - example
        if (activityType === 'services') {
            if (revenue12Months.lte(180000)) return new Decimal(6);
            if (revenue12Months.lte(360000)) return new Decimal(11.2);
            if (revenue12Months.lte(720000)) return new Decimal(13.5);
            if (revenue12Months.lte(1800000)) return new Decimal(16);
            if (revenue12Months.lte(3600000)) return new Decimal(21);
            return new Decimal(33);
        }

        // Default
        return new Decimal(6);
    }

    /**
     * Validate CFOP (Código Fiscal de Operações e Prestações)
     */
    validateCFOP(cfop: string, operationType: 'sale' | 'purchase'): boolean {
        const cfopNum = parseInt(cfop);

        // Sales: 5xxx (same state) or 6xxx (other states)
        if (operationType === 'sale') {
            return cfopNum >= 5000 && cfopNum < 7000;
        }

        // Purchases: 1xxx (same state) or 2xxx (other states)
        if (operationType === 'purchase') {
            return cfopNum >= 1000 && cfopNum < 3000;
        }

        return false;
    }

    /**
     * Get default CFOP based on operation
     */
    getDefaultCFOP(
        operationType: 'sale' | 'purchase',
        sameState: boolean,
        productType: 'PRODUCT' | 'SERVICE'
    ): string {
        if (operationType === 'sale') {
            if (productType === 'SERVICE') {
                return sameState ? '5933' : '6933'; // Service provision
            }
            return sameState ? '5102' : '6102'; // Product sale
        }

        if (operationType === 'purchase') {
            if (productType === 'SERVICE') {
                return sameState ? '1933' : '2933'; // Service acquisition
            }
            return sameState ? '1102' : '2102'; // Product purchase
        }

        return '5102'; // Default
    }
}

export default new TaxCalculationService();
