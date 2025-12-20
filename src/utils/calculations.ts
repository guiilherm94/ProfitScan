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
    status: 'danger' | 'warning' | 'healthy'
    statusMessage: string
}

export function calculateProfit(data: ProductData): CalculationResult {
    const { custoProducao, precoVenda, custosFixos } = data

    // Calculate fixed costs amount based on sale price
    const custosFixosValor = (precoVenda * custosFixos) / 100

    // Net profit = Sale Price - Production Cost - Fixed Costs
    const lucroLiquido = precoVenda - custoProducao - custosFixosValor

    // Margin percentage = (Net Profit / Sale Price) * 100
    const margem = precoVenda > 0 ? (lucroLiquido / precoVenda) * 100 : 0

    // Determine status based on margin levels
    let status: 'danger' | 'warning' | 'healthy'
    let statusMessage: string

    if (margem < 0) {
        status = 'danger'
        statusMessage = 'Você está PAGANDO para vender!'
    } else if (margem === 0) {
        status = 'danger'
        statusMessage = 'Margem ZERO! Sem lucro nenhum.'
    } else if (margem < 15) {
        status = 'warning'
        statusMessage = 'Margem baixa! Considere ajustar.'
    } else if (margem < 30) {
        status = 'healthy'
        statusMessage = 'Margem aceitável para seu negócio.'
    } else {
        status = 'healthy'
        statusMessage = 'Margem excelente! Parabéns!'
    }

    return {
        lucroLiquido,
        margem,
        isPrejuizo: lucroLiquido <= 0,
        status,
        statusMessage
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
