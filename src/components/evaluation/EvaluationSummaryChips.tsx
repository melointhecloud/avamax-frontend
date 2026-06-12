import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Ruler, 
  BedDouble, 
  Bath, 
  Car, 
  MapPin 
} from 'lucide-react'
import type { AvaliarImovelFormData } from '@/validators/AvaliarImovel'

interface EvaluationSummaryChipsProps {
  input: AvaliarImovelFormData
}

const CATEGORIAS_LABELS: Record<string, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  cobertura: 'Cobertura',
  kitnet: 'Kitnet/Studio',
  terreno: 'Terreno',
  comercial: 'Comercial',
  rural: 'Rural',
}

export function EvaluationSummaryChips({ input }: EvaluationSummaryChipsProps) {
  const chips = [
    {
      icon: Home,
      label: CATEGORIAS_LABELS[input.categoria] || input.categoria,
      show: !!input.categoria
    },
    {
      icon: Ruler,
      label: `${input.areaTotal} m²`,
      show: input.areaTotal > 0
    },
    {
      icon: BedDouble,
      label: `${input.quartos} quartos`,
      show: input.quartos > 0
    },
    {
      icon: Bath,
      label: `${input.banheiros} banheiros`,
      show: input.banheiros > 0
    },
    {
      icon: Car,
      label: `${input.vagas} vagas`,
      show: input.vagas > 0
    },
    {
      icon: MapPin,
      label: `${input.bairro}, ${input.municipio}`,
      show: !!input.bairro && !!input.municipio
    }
  ].filter(chip => chip.show)

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {chips.map((chip, index) => (
        <Badge 
          key={index} 
          variant="secondary"
          className="gap-1.5 px-2.5 py-1 text-xs"
        >
          <chip.icon className="h-3 w-3" />
          {chip.label}
        </Badge>
      ))}
    </div>
  )
}
