import { useState, useCallback, useEffect, useMemo } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useLocation } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { avaliarImovelSchema, type AvaliarImovelFormData } from '@/validators/AvaliarImovel'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FormSection } from './FormSection'
import { RatingInput } from './RatingInput'
import { ImageUpload } from './ImageUpload'
import { PropertyTypeChecklist } from './PropertyTypeChecklist'
import { PropertyFeaturesSection } from './PropertyFeaturesSection'

import { getFieldsConfig } from '../config/physicalFieldsConfig'
import { EvaluationLoadingScreen } from '@/components/evaluation/EvaluationLoadingScreen'
import { EvaluationResultDialog } from '@/components/evaluation/EvaluationResultDialog'
import { SimilarPropertiesGrid } from '@/components/evaluation/SimilarPropertiesGrid'
import type { SimilarPropertyData } from '@/components/evaluation/SimilarPropertyCard'
import { AlertCircle, Sparkles, Loader2, History, Search, Home, Trash2, Lock } from 'lucide-react'
import { CATEGORIA_TO_PROPERTY_TYPE } from '../types/specifications'
import { buildDefaultEspecificacoes } from '../config/propertyTypeChecklistConfig'
import { buscarImoveisSimilares, gerarAvaliacaoFinal, uploadPropertyImage } from '@/services/similares.service'
import { useNavigate } from 'react-router-dom'
import { useEvaluationDraft } from '@/hooks/useEvaluationDraft'
import { useUserCredits } from '@/hooks/useUserCredits'
import { useNeighborhoods, findNeighborhoodMatch } from '@/hooks/useNeighborhoods'
import { useMunicipalities } from '@/hooks/useMunicipalities'
import { ComboboxField } from '@/components/ui/combobox-field'
import type { EvaluationResult } from '@/types/evaluation'

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

// Tipos de estado do fluxo
type FlowStep = 'form' | 'selecting' | 'generating'

export const AvaliarImovelForm = () => {

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isRemax = true;

  const { profile, user } = useAuth()
  const { saveDraft, loadDraft, clearDraft, saveLastEvaluation, loadLastEvaluation, hasLastEvaluation } = useEvaluationDraft()
  const [images, setImages] = useState<File[]>([])
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)

  // Novo fluxo em etapas
  const [flowStep, setFlowStep] = useState<FlowStep>('form')
  const [isSearching, setIsSearching] = useState(false)
  const [similarProperties, setSimilarProperties] = useState<SimilarPropertyData[]>([])
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([])
  const [formDataSnapshot, setFormDataSnapshot] = useState<AvaliarImovelFormData | null>(null)

  // Modal result state
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<{
    id: number
    inputPayload: AvaliarImovelFormData
    resultPayload: EvaluationResult
  } | null>(null)

  const { data: userCredits } = useUserCredits()
  const hasCredits = (userCredits?.available ?? profile?.credits ?? 0) > 0

  // Estado para armazenar o bairro sugerido pelo ViaCEP (apenas para pré-seleção)
  const [viaCepBairro, setViaCepBairro] = useState<string | null>(null)

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setIsFetchingCep(true)
    try {
      let data: { localidade?: string; bairro?: string; uf?: string; logradouro?: string } | null = null

      // Tentativa 1: ViaCEP
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const json = await res.json()
        if (!json.erro) data = json
      } catch { /* fallback */ }

      // Tentativa 2: BrasilAPI (fallback)
      if (!data) {
        try {
          const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`)
          if (res.ok) {
            const json = await res.json()
            data = {
              localidade: json.city,
              bairro: json.neighborhood,
              uf: json.state,
              logradouro: json.street,
            }
          }
        } catch { /* ambas falharam */ }
      }

      if (!data) {
        toast.error('CEP não encontrado. Verifique e tente novamente.')
        return
      }

      if (data.localidade) setValue('municipio', data.localidade, { shouldValidate: true })
      if (data.bairro) setViaCepBairro(data.bairro)
      if (data.uf) setValue('estado', data.uf, { shouldValidate: true })
      if (data.logradouro) setValue('rua', data.logradouro)

      toast.success('Endereço preenchido automaticamente')
    } catch {
      toast.error('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setIsFetchingCep(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9)

    setValue('cep', formatted)

    if (formatted.replace(/\D/g, '').length === 8) {
      fetchAddressByCep(formatted)
    }
  }

  const form = useForm<AvaliarImovelFormData>({
    resolver: zodResolver(avaliarImovelSchema),
    defaultValues: {
      tipoAvaliacao: 'venda',
      clienteAtivo: false,
      clienteNome: '',
      clienteEmail: '',
      clienteTelefone: '',
      quartos: 0,
      suites: 0,
      banheiros: 0,
      vagas: 0,
      avaliacaoTecnica: 3,
      localizacao: 3,
      planta: 3,
      acabamentos: 3,
      conservacao: 3,
      areasComuns: 3,
      aVenda: false,
      mobiliado: '',
      especificacoes: undefined,
      features: { byGroup: {}, selected: [] },
    },
  })

  // Formatação do telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')

    if (value.length <= 10) {
      value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else {
      value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    }

    setValue('clienteTelefone', value.slice(0, 15))
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = form

  const watchedValues = watch()
  const municipioValue = watchedValues.municipio
  const fieldsConfig = useMemo(() => getFieldsConfig(watchedValues.categoria), [watchedValues.categoria])

  // Reset hidden fields when category changes
  useEffect(() => {
    if (!watchedValues.categoria) return
    const cfg = getFieldsConfig(watchedValues.categoria)
    if (!cfg.showQuartos) setValue('quartos', 0)
    if (!cfg.showSuites) setValue('suites', 0)
    if (!cfg.showBanheiros) setValue('banheiros', 0)
    if (!cfg.showVagas) setValue('vagas', 0)
    if (!cfg.showCondominio) setValue('condominio', undefined as any)
  }, [watchedValues.categoria, setValue])

  // Auto-save draft to localStorage on every form change (debounced)
  useEffect(() => {
    const subscription = form.watch((values) => {
      saveDraft(values as Partial<AvaliarImovelFormData>)
    })
    return () => subscription.unsubscribe()
  }, [form, saveDraft])

  // Restore draft from localStorage on mount
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      // Reset the form with stored values, keeping defaults for missing fields
      form.reset({ ...form.getValues(), ...draft })
      // Trigger validation for required fields to sync internal state
      setTimeout(() => {
        form.trigger(['estado', 'municipio', 'bairro', 'categoria', 'areaTotal'])
      }, 0)
      toast.info('Rascunho restaurado! Continuando de onde parou.', { duration: 3000 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Hook para buscar municípios do banco de dados baseado no estado
  const estadoValue = watchedValues.estado
  const { data: municipalities = [], isLoading: isLoadingMunicipalities } = useMunicipalities(estadoValue)

  // Hook para buscar bairros do banco de dados baseado no município
  const { data: neighborhoods = [], isLoading: isLoadingNeighborhoods } = useNeighborhoods(municipioValue)

  // Effect para pré-selecionar bairro quando carregar a lista e houver sugestão do ViaCEP
  useEffect(() => {
    if (viaCepBairro && neighborhoods.length > 0) {
      const match = findNeighborhoodMatch(viaCepBairro, neighborhoods)
      if (match) {
        setValue('bairro', match)
      }
      setViaCepBairro(null) // Limpa após tentar selecionar
    }
  }, [viaCepBairro, neighborhoods, setValue])

  // Note: bairro is NOT auto-cleared when municipio changes,
  // because users can now type a custom neighborhood name.

  const hasFilledSpecifications = () => {
    const specs = watchedValues.especificacoes
    if (!specs) return false

    const hasChecklist = Object.values(specs.checklist || {}).some(Boolean)
    const hasDetails = Object.values(specs.detalhes || {}).some(
      (v) => v !== null && v !== '' && v !== undefined
    )
    return hasChecklist || hasDetails
  }

  const handleCategoryChange = (newValue: string) => {
    setValue('categoria', newValue, { shouldValidate: true })
    const propertyType = CATEGORIA_TO_PROPERTY_TYPE[newValue]
    if (propertyType) {
      const defaults = buildDefaultEspecificacoes(propertyType)
      if (defaults) setValue('especificacoes', defaults, { shouldValidate: true })
    }
  }

  // ETAPA 1: Buscar imóveis similares
  const onSubmit = async (data: AvaliarImovelFormData) => {
    if (!hasCredits) {
      toast.error('Você não possui créditos suficientes')
      return
    }

    // Ensure especificacoes.tipo matches categoria
    if (data.categoria && data.especificacoes) {
      const propertyType = CATEGORIA_TO_PROPERTY_TYPE[data.categoria]
      if (propertyType && data.especificacoes.tipo !== propertyType) {
        data.especificacoes.tipo = propertyType
      }
    }

    // Save draft before search
    saveDraft(data)
    setFormDataSnapshot(data)
    setIsSearching(true)

    try {
      const result = await buscarImoveisSimilares(data)

      console.log('🔍 Imóveis similares encontrados:', result.similares.length)

      setSimilarProperties(result.similares)
      setSelectedPropertyIds([]) // Reset selection
      setFlowStep('selecting')

      toast.success(`${result.similares.length} imóveis similares encontrados!`)

    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar imóveis similares')
    } finally {
      setIsSearching(false)
    }
  }

  // ETAPA 2: Gerar avaliação com imóveis selecionados
  const handleConfirmSelection = async () => {
    if (!formDataSnapshot || selectedPropertyIds.length < 3) {
      toast.error('Selecione pelo menos 3 imóveis para gerar a avaliação')
      return
    }

    if (!user?.id) {
      toast.error('Usuário não autenticado')
      return
    }

    setFlowStep('generating')

    try {
      // Faz upload da imagem se houver
      let fotoCapaUrl: string | null = null
      if (images.length > 0) {
        console.log('📷 Fazendo upload da imagem...')
        fotoCapaUrl = await uploadPropertyImage(images[0], user.id)
        if (fotoCapaUrl) {
          console.log('✅ Imagem carregada:', fotoCapaUrl)
        }
      }

      // Filtra os similares selecionados (mantém objetos completos p/ separar reais x manuais)
      const selectedSimilares = similarProperties.filter(p =>
        selectedPropertyIds.includes(p.id)
      )

      // Chama a edge function para gerar avaliação final
      const resultado = await gerarAvaliacaoFinal(formDataSnapshot, selectedSimilares, fotoCapaUrl)

      console.log('📊 Resultado da avaliação:', resultado)

      // Calcula valor por m² baseado no valor médio retornado
      const valorM2 = formDataSnapshot.areaTotal > 0
        ? resultado.valor_medio / formDataSnapshot.areaTotal
        : 0

      // Transform result to our format
      const resultPayload: EvaluationResult = {
        id: Date.now(), // ID temporário para exibição
        valor_estimado: resultado.valor_medio,
        confianca: resultado.confianca,
        minimo: resultado.valor_medio * 0.9,
        maximo: resultado.valor_medio * 1.1,
        valor_m2: valorM2,
        similares: selectedSimilares.map((s, idx) => ({
          id: s.id,
          titulo: s.categoria || `Amostra ${idx + 1}`,
          descricao: s.descricao || '',
          valor: s.valor,
          area: s.metros,
          quartos: s.quartos || 0,
          banheiros: s.banheiros || 0,
          vagas: s.vagas || 0,
          imagem: s.imagem || ''
        })),
        observacoes: `Avaliação baseada em ${resultado.quantidade_base} imóveis similares selecionados.`
      }

      // Store result and open modal (inclui URL da foto)
      const inputWithPhoto = { ...formDataSnapshot }
      setEvaluationResult({
        id: Date.now(),
        inputPayload: inputWithPhoto,
        resultPayload
      })

      setFlowStep('form')
      setResultDialogOpen(true)

      // Save as last evaluation for quick reload
      saveLastEvaluation(formDataSnapshot)

      toast.success('Avaliação gerada com sucesso!')

    } catch (error: any) {
      setFlowStep('selecting') // Volta para seleção em caso de erro
      const msg = String(error?.message || '')
      if (/n[aã]o encontrad/i.test(msg) || /not found/i.test(msg)) {
        toast.error('Não foi possível processar alguns imóveis selecionados. Tente novamente ou remova os imóveis adicionados manualmente.')
      } else {
        toast.error(msg || 'Erro ao gerar avaliação')
      }
    }
  }

  // Voltar para o formulário
  const handleBackToForm = () => {
    setFlowStep('form')
    setSimilarProperties([])
    setSelectedPropertyIds([])
  }

  const handleRecalculate = async (newData: AvaliarImovelFormData) => {
    setIsRecalculating(true)

    try {
      // Para recalcular, precisamos buscar novos similares
      const result = await buscarImoveisSimilares(newData)

      // Se temos similares anteriores selecionados, tentamos manter a seleção
      const previousSelection = selectedPropertyIds.filter(id =>
        result.similares.some(s => s.id === id)
      )

      setSimilarProperties(result.similares)
      setFormDataSnapshot(newData)
      setSelectedPropertyIds(previousSelection.length > 0 ? previousSelection : [])

      // Abre a seleção novamente
      setResultDialogOpen(false)
      setFlowStep('selecting')

      toast.success('Novos similares encontrados! Selecione os imóveis novamente.')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao recalcular avaliação')
      throw error
    } finally {
      setIsRecalculating(false)
    }
  }

  // Handler para adicionar imóvel manualmente
  const handleAddManualProperty = (property: SimilarPropertyData) => {
    setSimilarProperties(prev => [property, ...prev])
  }

  // Se estiver na etapa de seleção, mostra o grid de similares
  if (flowStep === 'selecting' || flowStep === 'generating') {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <EvaluationLoadingScreen isOpen={flowStep === 'generating'} />
        <SimilarPropertiesGrid
          properties={similarProperties}
          selectedIds={selectedPropertyIds}
          onSelectionChange={setSelectedPropertyIds}
          onBack={handleBackToForm}
          onConfirm={handleConfirmSelection}
          isLoading={flowStep === 'generating'}
          minSelection={3}
          maxSelection={20}
          tipoAvaliacao={formDataSnapshot?.tipoAvaliacao || 'venda'}
          bairro={formDataSnapshot?.bairro}
          municipio={formDataSnapshot?.municipio}
          estado={formDataSnapshot?.estado}
          onAddManualProperty={handleAddManualProperty}
        />
      </div>
    )
  }

  return (
    <FormProvider {...form}>
      <EvaluationLoadingScreen isOpen={isSearching} />

      {/* Modal de Resultado */}
      {evaluationResult && (
        <EvaluationResultDialog
          open={resultDialogOpen}
          onOpenChange={setResultDialogOpen}
          evaluationId={evaluationResult.id}
          inputPayload={evaluationResult.inputPayload}
          resultPayload={evaluationResult.resultPayload}
          onRecalculate={handleRecalculate}
          isRecalculating={isRecalculating}
          images={images}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log('❌ Erros de validação:', errors)
        // Extract first meaningful error message, including nested ones
        const findFirstMessage = (obj: any): string | undefined => {
          if (!obj) return undefined
          if (typeof obj.message === 'string' && obj.message) return obj.message
          for (const val of Object.values(obj)) {
            if (val && typeof val === 'object') {
              const msg = findFirstMessage(val)
              if (msg) return msg
            }
          }
          return undefined
        }
        const msg = findFirstMessage(errors)
        toast.error(msg || 'Preencha todos os campos obrigatórios')
      })} className="space-y-6 pb-8">

        {/* Tipo de Avaliação */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Tipo de Avaliação</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => setValue('tipoAvaliacao', 'venda')} className="h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" /><span className="text-xs">Limpar</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('tipoAvaliacao', 'venda')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${watchedValues.tipoAvaliacao === 'venda'
                  ? isRemax
                    ? 'border-destructive bg-destructive/10'
                    : 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                  : isRemax
                    ? 'border-border hover:border-destructive/50'
                    : 'border-border hover:border-orange-300'
                  }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${watchedValues.tipoAvaliacao === 'venda'
                  ? isRemax ? 'bg-destructive text-destructive-foreground' : 'bg-orange-500 text-white'
                  : 'bg-muted text-muted-foreground'
                  }`}>
                  <Home className="h-6 w-6" />
                </div>
                <span className={`font-semibold ${watchedValues.tipoAvaliacao === 'venda'
                  ? isRemax ? 'text-destructive' : 'text-orange-600'
                  : 'text-foreground'}`}>
                  Venda
                </span>
                <span className="text-xs text-muted-foreground text-center">
                  Avaliação de valor de mercado para venda
                </span>
              </button>

              <button
                type="button"
                onClick={() => toast.info('Funcionalidade em desenvolvimento. Em breve você poderá avaliar imóveis para aluguel!')}
                className="p-4 rounded-lg border-2 border-border flex flex-col items-center gap-2 opacity-50 cursor-not-allowed relative"
              >
                <div className="absolute top-2 right-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </div>
                <span className="font-semibold text-muted-foreground">Aluguel</span>
                <span className="text-xs text-muted-foreground text-center">Em breve</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Cliente */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Dados do Cliente</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setValue('clienteAtivo', false); setValue('clienteNome', ''); setValue('clienteEmail', ''); setValue('clienteTelefone', '') }} className="h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" /><span className="text-xs">Limpar</span>
              </Button>
            </div>

            {/* Switch de ativação */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="clienteAtivo" className="font-medium cursor-pointer">
                  Esta avaliação é para um cliente?
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ative para adicionar os dados do cliente no relatório
                </p>
              </div>
              <Switch
                id="clienteAtivo"
                checked={watchedValues.clienteAtivo}
                onCheckedChange={(checked) => setValue('clienteAtivo', checked)}
              />
            </div>

            {/* Campos condicionais - aparecem com animação */}
            {watchedValues.clienteAtivo && (
              <div className="space-y-4 animate-fade-in">
                {/* Nome do Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="clienteNome">Nome do Cliente *</Label>
                  <Input
                    id="clienteNome"
                    placeholder="Ex: João Silva"
                    {...register('clienteNome')}
                  />
                  {errors.clienteNome && (
                    <p className="text-sm text-destructive">{errors.clienteNome.message}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados do Imóvel */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            <h2 className="text-xl font-bold text-foreground">Dados do Imóvel</h2>

            {/* Localização */}
            <FormSection title="Localização" onClear={() => { setValue('cep', ''); setValue('estado', ''); setValue('municipio', ''); setValue('bairro', ''); setValue('rua', '') }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      placeholder="Ex: 74672-200"
                      value={watchedValues.cep || ''}
                      onChange={handleCepChange}
                      maxLength={9}
                    />
                    {isFetchingCep && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    value={watchedValues.estado}
                    onValueChange={(value) => setValue('estado', value, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.estado && (
                    <p className="text-sm text-destructive">{errors.estado.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipio">Município *</Label>
                  <ComboboxField
                    value={watchedValues.municipio || ''}
                    onChange={(val) => {
                      setValue('municipio', val, { shouldValidate: true })
                      setValue('bairro', '', { shouldValidate: true })
                    }}
                    options={municipalities}
                    placeholder={
                      !estadoValue
                        ? "Selecione o estado primeiro"
                        : "Selecione ou digite o município"
                    }
                    searchPlaceholder="Buscar município..."
                    emptyMessage="Nenhum município encontrado."
                    isLoading={isLoadingMunicipalities}
                    disabled={!estadoValue}
                  />
                  {errors.municipio && (
                    <p className="text-sm text-destructive">{errors.municipio.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <ComboboxField
                    value={watchedValues.bairro || ''}
                    onChange={(val) => setValue('bairro', val, { shouldValidate: true })}
                    options={neighborhoods}
                    placeholder={
                      !municipioValue
                        ? "Informe o município primeiro"
                        : "Selecione ou digite o bairro"
                    }
                    searchPlaceholder="Buscar bairro..."
                    emptyMessage="Nenhum bairro encontrado."
                    isLoading={isLoadingNeighborhoods}
                    disabled={!municipioValue}
                  />
                  {errors.bairro && (
                    <p className="text-sm text-destructive">{errors.bairro.message}</p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    placeholder="Ex: Rua das Palmeiras, 123"
                    {...register('rua')}
                  />
                </div>
              </div>
            </FormSection>

            {/* Categoria */}
            <FormSection title="Categoria do Imóvel" onClear={() => { setValue('categoria', ''); setValue('especificacoes', undefined as any) }}>
              <div className="space-y-2">
                <Label>Selecione a categoria *</Label>
                <Select
                  value={watchedValues.categoria}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o tipo de imóvel" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Escolha o tipo de imóvel correspondente ao caso.
                </p>
                {errors.categoria && (
                  <p className="text-sm text-destructive">{errors.categoria.message}</p>
                )}
              </div>
            </FormSection>

            {/* Especificações por Tipo de Imóvel - Seção Condicional */}
            {watchedValues.categoria && (
              <PropertyTypeChecklist control={control} />
            )}

            {/* Características Físicas */}
            <FormSection title="Características Físicas" onClear={() => { setValue('areaTotal', '' as any); if (fieldsConfig.showQuartos) setValue('quartos', 0); if (fieldsConfig.showSuites) setValue('suites', 0); if (fieldsConfig.showBanheiros) setValue('banheiros', 0); if (fieldsConfig.showVagas) setValue('vagas', 0) }}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="areaTotal">{fieldsConfig.labels.areaTotal}</Label>
                  <Input
                    id="areaTotal"
                    type="number"
                    placeholder="98"
                    {...register('areaTotal')}
                  />
                  {errors.areaTotal && (
                    <p className="text-sm text-destructive">{errors.areaTotal.message}</p>
                  )}
                </div>
                {fieldsConfig.showQuartos && (
                  <div className="space-y-2">
                    <Label htmlFor="quartos">{fieldsConfig.labels.quartos}</Label>
                    <Input
                      id="quartos"
                      type="number"
                      min="0"
                      {...register('quartos')}
                    />
                  </div>
                )}
                {fieldsConfig.showSuites && (
                  <div className="space-y-2">
                    <Label htmlFor="suites">{fieldsConfig.labels.suites}</Label>
                    <Input
                      id="suites"
                      type="number"
                      min="0"
                      {...register('suites')}
                    />
                  </div>
                )}
                {fieldsConfig.showBanheiros && (
                  <div className="space-y-2">
                    <Label htmlFor="banheiros">{fieldsConfig.labels.banheiros}</Label>
                    <Input
                      id="banheiros"
                      type="number"
                      min="0"
                      {...register('banheiros')}
                    />
                  </div>
                )}
                {fieldsConfig.showVagas && (
                  <div className="space-y-2">
                    <Label htmlFor="vagas">{fieldsConfig.labels.vagas}</Label>
                    <Input
                      id="vagas"
                      type="number"
                      min="0"
                      {...register('vagas')}
                    />
                  </div>
                )}
              </div>
            </FormSection>

            {/* Características do Imóvel */}
            <PropertyFeaturesSection />

            {/* Informações Financeiras */}
            {fieldsConfig.showCondominio && (
              <FormSection title="Informações Financeiras" onClear={() => setValue('condominio', '' as any)}>
                <div className="space-y-2">
                  <Label htmlFor="condominio">{fieldsConfig.labels.condominio || 'Condomínio (R$)'}</Label>
                  <Input
                    id="condominio"
                    type="number"
                    placeholder="450"
                    {...register('condominio')}
                  />
                </div>
              </FormSection>
            )}

            {/* Imagem do Imóvel */}
            <FormSection title="">
              <ImageUpload
                images={images}
                onChange={setImages}
                maxFiles={5}
                maxSizeMB={5}
              />
            </FormSection>
          </CardContent>
        </Card>

        {/* Avaliação Detalhada */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Avaliação Detalhada</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => {
                setValue('aVenda', false); setValue('linkVenda', ''); setValue('avaliacaoTecnica', 3); setValue('localizacao', 3); setValue('planta', 3); setValue('acabamentos', 3); setValue('conservacao', 3); setValue('areasComuns', 3); setValue('situacaoLegal', []); setValue('iptu', '' as any); setValue('locaisProximos', ''); setValue('mobiliado', '')
              }} className="h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" /><span className="text-xs">Limpar</span>
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="aVenda">O imóvel está à venda?</Label>
                <Switch
                  id="aVenda"
                  checked={watchedValues.aVenda}
                  onCheckedChange={(checked) => setValue('aVenda', checked)}
                />
              </div>

              {watchedValues.aVenda && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="linkVenda">Link do anúncio de venda</Label>
                  <Input
                    id="linkVenda"
                    type="url"
                    placeholder="https://exemplo.com/anuncio"
                    {...register('linkVenda')}
                  />
                  {errors.linkVenda && (
                    <p className="text-sm text-destructive">{errors.linkVenda.message}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
              <RatingInput
                label="Avaliação técnica do imóvel:"
                value={watchedValues.avaliacaoTecnica ?? 3}
                onChange={(v) => setValue('avaliacaoTecnica', v)}
              />
              <RatingInput
                label="Localização:"
                value={watchedValues.localizacao ?? 3}
                onChange={(v) => setValue('localizacao', v)}
              />
              <RatingInput
                label="Planta e distribuição dos cômodos:"
                value={watchedValues.planta ?? 3}
                onChange={(v) => setValue('planta', v)}
              />
              <RatingInput
                label="Quantidade e qualidade dos acabamentos:"
                value={watchedValues.acabamentos ?? 3}
                onChange={(v) => setValue('acabamentos', v)}
              />
              <RatingInput
                label="Estado geral de conservação:"
                value={watchedValues.conservacao ?? 3}
                onChange={(v) => setValue('conservacao', v)}
              />
              <RatingInput
                label="Áreas comuns, lazer e rua de acesso:"
                value={watchedValues.areasComuns ?? 3}
                onChange={(v) => setValue('areasComuns', v)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Situação legal do imóvel</Label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {SITUACAO_LEGAL.map((sit) => {
                    const isChecked = Array.isArray(watchedValues.situacaoLegal) && watchedValues.situacaoLegal.includes(sit.value)
                    return (
                      <label
                        key={sit.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
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
                <Label htmlFor="iptu">Valor anual do IPTU (R$)</Label>
                <Input
                  id="iptu"
                  type="number"
                  placeholder="Ex: 1200.00"
                  {...register('iptu')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locaisProximos">
                Locais próximos (shopping, farmácia, escolas, transporte etc.)
              </Label>
              <Textarea
                id="locaisProximos"
                placeholder="Descreva os pontos de interesse ao redor do imóvel"
                rows={3}
                {...register('locaisProximos')}
              />
            </div>

            <div className="space-y-2">
              <Label>Mobília</Label>
              <Select
                value={watchedValues.mobiliado || undefined}
                onValueChange={(value) => setValue('mobiliado', value, { shouldValidate: true })}
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
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="space-y-4">
          {!hasCredits && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Sem créditos disponíveis</p>
                <p className="text-sm opacity-80">
                  Você não possui créditos suficientes. Adquira mais créditos para continuar.
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={!hasCredits || isSubmitting}
          >
            <Search className="h-5 w-5" />
            {isSubmitting ? 'Buscando...' : 'Buscar Imóveis Similares'}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/10"
              onClick={() => {
                form.reset()
                setImages([])
                clearDraft()
                toast.success('Todos os campos foram limpos')
              }}
            >
              <Trash2 className="h-4 w-4" />
              Limpar tudo
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full gap-2"
              disabled={!hasLastEvaluation}
              onClick={() => {
                const lastData = loadLastEvaluation()
                if (lastData) {
                  form.reset({ ...form.getValues(), ...lastData })
                  setTimeout(() => {
                    form.trigger(['estado', 'municipio', 'bairro', 'categoria', 'areaTotal'])
                  }, 0)
                  toast.success('Dados da última avaliação carregados!')
                }
              }}
            >
              <History className="h-4 w-4" />
              Carregar última
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
