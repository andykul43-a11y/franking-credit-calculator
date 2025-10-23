export interface TaxEntity {
  id: string;
  name: string;
  type: 'Individual' | 'Group' | 'Trust';
  taxReturns: TaxReturn[];
}

export interface TaxReturn {
  id: string;
  entityId: string;
  fileName: string;
  uploadDate: Date;
  taxYear: string;
  incomeData: IncomeData;
  processed: boolean;
}

export interface IncomeData {
  employmentIncome: number;
  businessIncome: number;
  investmentIncome: InvestmentIncome;
  rentalIncome: number;
  trustDistributions: number;
  otherIncome: number;
  totalIncome: number;
  taxableIncome: number;
  taxPayable: number;
  frankingCredits: number;
  netTaxPayable: number;
}

export interface InvestmentIncome {
  dividends: number;
  interest: number;
  capitalGains: number;
  totalInvestment: number;
}

export interface ConsolidatedSummary {
  totalEntities: number;
  totalIncome: number;
  totalTaxPayable: number;
  totalFrankingCredits: number;
  netTaxPayable: number;
  incomeByType: {
    employment: number;
    business: number;
    investment: number;
    rental: number;
    trust: number;
    other: number;
  };
  incomeByEntity: {
    individual: number;
    group: number;
    trust: number;
  };
}