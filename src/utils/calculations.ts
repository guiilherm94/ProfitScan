export interface ProductData {
    nome: string
    custoProducao: number
    precoVenda: number
    custosFixos: number // percentage (0-100)
}

export interface CalculationResult {
    lucroLiquido: number
    margem: number
    isPrejuizo: boolean
}

export function calculateProfit(data: ProductData): CalculationResult {
    const { custoProducao, precoVenda, custosFixos } = data

    // Calculate fixed costs amount based on sale price
    const custosFixosValor = (precoVenda * custosFixos) / 100

    // Net profit = Sale Price - Production Cost - Fixed Costs
    const lucroLiquido = precoVenda - custoProducao - custosFixosValor

    // Margin percentage = (Net Profit / Sale Price) * 100
    const margem = precoVenda > 0 ? (lucroLiquido / precoVenda) * 100 : 0

    return {
        lucroLiquido,
        margem,
        isPrejuizo: lucroLiquido < 0
    }
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value)
}

export function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`
}
