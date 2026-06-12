import { useFormContext } from 'react-hook-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RatingInput } from '@/pages/AvaliarImovel/components/RatingInput'
import { useIsMobile } from '@/hooks/use-mobile'
import { MapPin, Home, DollarSign, ClipboardList, Star } from 'lucide-react'
import type { AvaliarImovelFormData } from '@/validators/AvaliarImovel'
import type { EditTabId } from '@/types/evaluation'

const ESTADOS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

const CATEGORIAS = [
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'cobertura', label: 'Cobertura' },
  { value: 'kitnet', label: 'Kitnet/Studio' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'rural', label: 'Rural' },
]

const SITUACAO_LEGAL = [
  { value: 'escriturado', label: 'Escriturado' },
  { value: 'registrado', label: 'Registrado' },
  { value: 'com_habite_se', label: 'Com Habite-se' },
  { value: 'direito_possessorio', label: 'Direito Possessório' },
]

const TABS = [
  { id: 'localizacao' as EditTabId, label: 'Localização', icon: MapPin },
  { id: 'caracteristicas' as EditTabId, label: 'Características', icon: Home },
  { id: 'financeiro' as EditTabId, label: 'Financeiro', icon: DollarSign },
  { id: 'especificacoes' as EditTabId, label: 'Especificações', icon: ClipboardList },
  { id: 'avaliacao' as EditTabId, label: 'Avaliação', icon: Star },
]

interface EvaluationEditTabsProps {
  activeTab: EditTabId
  onTabChange: (tab: EditTabId) => void
}

export function EvaluationEditTabs({ activeTab, onTabChange }: EvaluationEditTabsProps) {
  const { register, setValue, watch } = useFormContext<AvaliarImovelFormData>()
  const isMobile = useIsMobile()
  const watchedValues = watch()

  const renderLocalizacao = () => (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select
            value={watchedValues.estado}
            onValueChange={(value) => setValue('estado', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS.map((estado) => (
                <SelectItem key={estado.value} value={estado.value}>
                  {estado.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Município</Label>
          <Input {...register('municipio')} />
        </div>
        <div className="space-y-2">
          <Label>Bairro</Label>
          <Input {...register('bairro')} />
        </div>
        <div className="space-y-2">
          <Label>Rua</Label>
          <Input {...register('rua')} />
        </div>
      </div>
    </div>
  )

  const renderCaracteristicas = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select
          value={watchedValues.categoria}
          onValueChange={(value) => setValue('categoria', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIAS.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
        <div className="space-y-2">
          <Label>Área (m²)</Label>
          <Input type="number" {...register('areaTotal')} />
        </div>
        <div className="space-y-2">
          <Label>Quartos</Label>
          <Input type="number" min="0" {...register('quartos')} />
        </div>
        <div className="space-y-2">
          <Label>Suítes</Label>
          <Input type="number" min="0" {...register('suites')} />
        </div>
        <div className="space-y-2">
          <Label>Banheiros</Label>
          <Input type="number" min="0" {...register('banheiros')} />
        </div>
        <div className="space-y-2">
          <Label>Vagas</Label>
          <Input type="number" min="0" {...register('vagas')} />
        </div>
      </div>
    </div>
  )

  const renderFinanceiro = () => (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Condomínio (R$)</Label>
          <Input type="number" placeholder="0" {...register('condominio')} />
        </div>
        <div className="space-y-2">
          <Label>IPTU anual (R$)</Label>
          <Input type="number" placeholder="0" {...register('iptu')} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label>O imóvel está à venda?</Label>
        <Switch
          checked={watchedValues.aVenda}
          onCheckedChange={(checked) => setValue('aVenda', checked)}
        />
      </div>
      {watchedValues.aVenda && (
        <div className="space-y-2">
          <Label>Link do anúncio</Label>
          <Input type="url" placeholder="https://" {...register('linkVenda')} />
        </div>
      )}
    </div>
  )

  const renderEspecificacoes = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Situação legal do imóvel</Label>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {SITUACAO_LEGAL.map((sit) => {
            const isChecked = Array.isArray(watchedValues.situacaoLegal) && watchedValues.situacaoLegal.includes(sit.value)
            return (
              <label key={sit.value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(watchedValues.situacaoLegal) ? watchedValues.situacaoLegal : []
                    if (checked) {
                      setValue('situacaoLegal', [...current, sit.value])
                    } else {
                      setValue('situacaoLegal', current.filter((v) => v !== sit.value))
                    }
                  }}
                />
                <span className="text-sm">{sit.label}</span>
              </label>
            )
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Mobília</Label>
        <Select
          value={watchedValues.mobiliado || ''}
          onValueChange={(value) => setValue('mobiliado', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mobiliado">Mobiliado</SelectItem>
            <SelectItem value="semi_mobiliado">Semi-mobiliado</SelectItem>
            <SelectItem value="sem_mobilia">Não possui mobília</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Locais próximos</Label>
        <Textarea
          placeholder="Shopping, farmácia, escolas..."
          rows={2}
          {...register('locaisProximos')}
        />
      </div>
    </div>
  )

  const renderAvaliacao = () => (
    <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
      <RatingInput
        label="Avaliação técnica:"
        value={watchedValues.avaliacaoTecnica ?? 3}
        onChange={(v) => setValue('avaliacaoTecnica', v)}
      />
      <RatingInput
        label="Localização:"
        value={watchedValues.localizacao ?? 3}
        onChange={(v) => setValue('localizacao', v)}
      />
      <RatingInput
        label="Planta:"
        value={watchedValues.planta ?? 3}
        onChange={(v) => setValue('planta', v)}
      />
      <RatingInput
        label="Acabamentos:"
        value={watchedValues.acabamentos ?? 3}
        onChange={(v) => setValue('acabamentos', v)}
      />
      <RatingInput
        label="Conservação:"
        value={watchedValues.conservacao ?? 3}
        onChange={(v) => setValue('conservacao', v)}
      />
      <RatingInput
        label="Áreas comuns:"
        value={watchedValues.areasComuns ?? 3}
        onChange={(v) => setValue('areasComuns', v)}
      />
    </div>
  )

  const getTabContent = (tabId: EditTabId) => {
    switch (tabId) {
      case 'localizacao': return renderLocalizacao()
      case 'caracteristicas': return renderCaracteristicas()
      case 'financeiro': return renderFinanceiro()
      case 'especificacoes': return renderEspecificacoes()
      case 'avaliacao': return renderAvaliacao()
    }
  }

  // Mobile: Accordion
  if (isMobile) {
    return (
      <Accordion type="single" collapsible value={activeTab} onValueChange={(v) => onTabChange(v as EditTabId)}>
        {TABS.map((tab) => (
          <AccordionItem key={tab.id} value={tab.id}>
            <AccordionTrigger className="text-sm">
              <span className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {getTabContent(tab.id)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  }

  // Desktop: Tabs
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as EditTabId)}>
      <TabsList className="grid grid-cols-5 w-full">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="text-xs gap-1">
            <tab.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="pt-4">
          {getTabContent(tab.id)}
        </TabsContent>
      ))}
    </Tabs>
  )
}
