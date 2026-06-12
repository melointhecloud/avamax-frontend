interface EvaluationValueCardProps {
  valorEstimado: number
  valorM2: number
  confianca: number
  minimo: number
  maximo: number
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function EvaluationValueCard({
  valorEstimado,
  valorM2,
  minimo,
  maximo
}: EvaluationValueCardProps) {
  return (
    <div className="space-y-4">
      {/* Valor Principal */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Valor Estimado</p>
        <p className="text-4xl md:text-5xl font-bold text-primary">
          {formatCurrency(valorEstimado)}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(valorM2)}/m²
        </p>
      </div>
      
      {/* Range de valores */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="text-center">
          <p className="text-muted-foreground">Mínimo</p>
          <p className="font-medium">{formatCurrency(minimo)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Máximo</p>
          <p className="font-medium">{formatCurrency(maximo)}</p>
        </div>
      </div>
    </div>
  )
}
