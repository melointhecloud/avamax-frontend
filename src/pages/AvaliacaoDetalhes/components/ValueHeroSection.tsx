import { Badge } from '@/components/ui/badge'
import { Building, Target, Home, Key } from 'lucide-react'

interface ValueHeroSectionProps {
  valorEstimado?: number
  valorM2?: number
  confianca?: number
  comparativos?: number
  bairro?: string
  municipio?: string
  estado?: string
  isRental?: boolean
}

const formatCurrency = (value?: number) => {
  if (!value) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export const ValueHeroSection = ({
  valorEstimado,
  valorM2,
  confianca = 85,
  comparativos,
  bairro,
  municipio,
  estado,
  isRental = false
}: ValueHeroSectionProps) => {
  // Para aluguel, esperamos que valorEstimado/valorM2 já venham como valores mensais
  const valorPrincipal = valorEstimado
  const valorM2Display = valorM2

  // Calculate value range (±10% para venda, ±15% para aluguel)
  const rangePercent = isRental ? 0.15 : 0.1;
  const valorMin = valorPrincipal ? valorPrincipal * (1 - rangePercent) : undefined;
  const valorMax = valorPrincipal ? valorPrincipal * (1 + rangePercent) : undefined;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${isRental ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-accent/5' : 'border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5'}`}>
      {/* Background decoration */}
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full ${isRental ? 'bg-emerald-500/5' : 'bg-primary/5'} blur-3xl`} />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      
      <div className="relative px-4 py-8 sm:px-8 sm:py-12">
        {/* Location badge */}
        <div className="mb-6 flex justify-center">
          <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm">
            <Building className="h-4 w-4" />
            {bairro}, {municipio} - {estado}
          </Badge>
        </div>

        {/* Main value */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            {isRental ? (
              <Key className="h-5 w-5 text-emerald-600" />
            ) : (
              <Home className="h-5 w-5 text-primary" />
            )}
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {isRental ? 'Aluguel Estimado Mensal' : 'Valor Estimado do Imóvel'}
            </p>
          </div>
          <p className={`mt-3 text-4xl font-bold tabular-nums sm:text-5xl md:text-6xl ${isRental ? 'text-emerald-600' : 'text-primary'}`}>
            {formatCurrency(valorPrincipal)}
            {isRental && <span className="text-2xl sm:text-3xl md:text-4xl font-medium">/mês</span>}
          </p>
          {valorM2Display && (
            <p className="mt-2 text-lg text-muted-foreground tabular-nums sm:text-xl">
              {formatCurrency(valorM2Display)}/m²{isRental && ' mensal'}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {comparativos && (
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
              <Target className="h-3.5 w-3.5" />
              {comparativos} imóveis comparados
            </Badge>
          )}
        </div>

        {/* Value range */}
        {valorMin && valorMax && (
          <div className="mx-auto mt-8 max-w-md">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>{isRental ? 'Aluguel Mínimo' : 'Valor Mínimo'}</span>
              <span>{isRental ? 'Aluguel Máximo' : 'Valor Máximo'}</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-muted">
              <div 
                className={`absolute left-1/2 top-0 h-full w-1/3 -translate-x-1/2 rounded-full ${isRental ? 'bg-gradient-to-r from-emerald-500/60 via-emerald-500 to-emerald-500/60' : 'bg-gradient-to-r from-primary/60 via-primary to-primary/60'}`}
              />
              <div className={`absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${isRental ? 'border-emerald-500' : 'border-primary'} bg-background shadow-md`} />
            </div>
            <div className="mt-2 flex justify-between text-sm font-medium tabular-nums">
              <span className="text-muted-foreground">{formatCurrency(valorMin)}{isRental && '/mês'}</span>
              <span className={isRental ? 'text-emerald-600' : 'text-primary'}>{formatCurrency(valorPrincipal)}{isRental && '/mês'}</span>
              <span className="text-muted-foreground">{formatCurrency(valorMax)}{isRental && '/mês'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
