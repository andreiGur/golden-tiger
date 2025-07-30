export type InvestmentScenario = {
  id: string;
  type: 'stock' | 'real_estate' | 'bond' | 'mutual_fund';
  name: string;
  description: string;
  historicalReturn: number; // average annual return in %
  riskLevel: 'low' | 'medium' | 'high';
};

export const investmentScenarios: InvestmentScenario[] = [
  {
    id: 'stock1',
    type: 'stock',
    name: 'Blue Chip Stocks',
    description: 'Large, established companies with a history of reliable performance.',
    historicalReturn: 8,
    riskLevel: 'medium',
  },
  {
    id: 'stock2',
    type: 'stock',
    name: 'Tech Growth Stocks',
    description: 'Technology companies with high growth potential but higher volatility.',
    historicalReturn: 12,
    riskLevel: 'high',
  },
  {
    id: 'realestate1',
    type: 'real_estate',
    name: 'Residential Real Estate',
    description: 'Investing in homes and apartments for rental income and appreciation.',
    historicalReturn: 6,
    riskLevel: 'medium',
  },
  {
    id: 'bond1',
    type: 'bond',
    name: 'Government Bonds',
    description: 'Low-risk bonds issued by the government.',
    historicalReturn: 3,
    riskLevel: 'low',
  },
  {
    id: 'mutual1',
    type: 'mutual_fund',
    name: 'Index Fund',
    description: 'A fund that tracks a market index, offering broad diversification.',
    historicalReturn: 7,
    riskLevel: 'medium',
  },
]; 