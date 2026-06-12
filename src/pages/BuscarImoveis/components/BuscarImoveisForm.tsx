import { useState, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, MapPin, Loader2, Building2, Bed, Bath, Car, Maximize } from 'lucide-react'
import { buscarImoveisSchema, type BuscarImoveisFormData } from '@/validators/BuscarImoveis'
import {
  buscarImoveisParaCompra,
  type PropertyForDisplay,
} from '@/services/buscar-imoveis.service'
import { useEvaluationCities } from '@/hooks/useEvaluationCities'
import { useNeighborhoods, findNeighborhoodMatch } from '@/hooks/useNeighborhoods'

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
  { value: 'Apartamento', label: 'Apartamento' },
  { value: 'Casa', label: 'Casa' },
  { value: 'Cobertura', label: 'Cobertura' },
  { value: 'Kitnet', label: 'Kitnet/Studio' },
  { value: 'Terreno', label: 'Terreno' },
  { value: 'Comercial', label: 'Comercial' },
]

interface BuscarImoveisFormProps {
  onResults: (results: PropertyForDisplay[], criteria: BuscarImoveisFormData) => void
  isSearching: boolean
  setIsSearching: (value: boolean) => void
}

export function BuscarImoveisForm({ onResults, isSearching, setIsSearching }: BuscarImoveisFormProps) {
  const location = useLocation()
  const isRemax = location.pathname.startsWith('/home')
  const iconColor = isRemax ? 'text-destructive' : 'text-primary'
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [viaCepBairro, setViaCepBairro] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BuscarImoveisFormData>({
    resolver: zodResolver(buscarImoveisSchema),
    defaultValues: {
      estado: '',
      municipio: '',
      bairro: '',
      categoria: '',
      area: undefined,
      quartos: undefined,
      banheiros: undefined,
      vagas: undefined,
      limite: 10,
    },
  })

  const estadoValue = watch('estado')
  const municipioValue = watch('municipio')
  const bairroValue = watch('bairro')

  // Fetch cities for selected state
  const { data: citiesData, isLoading: isLoadingCities } = useEvaluationCities()

  // Get cities for the selected state
  const cities =
    citiesData && estadoValue
      ? citiesData
          .filter((c) => c.state === estadoValue)
          .map((c) => c.city)
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort()
      : []

  // Fetch neighborhoods for selected city
  const { data: neighborhoods = [], isLoading: isLoadingNeighborhoods } =
    useNeighborhoods(municipioValue)

  // CEP auto-fill
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

      if (data.localidade) setValue('municipio', data.localidade)
      if (data.bairro) setViaCepBairro(data.bairro)
      if (data.uf) setValue('estado', data.uf)

      toast.success('Endereço preenchido automaticamente')
    } catch {
      toast.error('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setIsFetchingCep(false)
    }
  }, [setValue])

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

  // Effect para pré-selecionar bairro quando carregar a lista e houver sugestão do ViaCEP
  useEffect(() => {
    if (viaCepBairro && neighborhoods.length > 0) {
      const match = findNeighborhoodMatch(viaCepBairro, neighborhoods)
      if (match) {
        setValue('bairro', match)
      }
      setViaCepBairro(null)
    }
  }, [viaCepBairro, neighborhoods, setValue])

  // Reset municipio when estado changes
  useEffect(() => {
    if (estadoValue) {
      setValue('municipio', '')
      setValue('bairro', '')
    }
  }, [estadoValue, setValue])

  // Reset bairro when municipio changes
  useEffect(() => {
    if (municipioValue && bairroValue && neighborhoods.length > 0 && !neighborhoods.includes(bairroValue)) {
      setValue('bairro', '')
    }
  }, [municipioValue, neighborhoods, bairroValue, setValue])

  const onSubmit = async (data: BuscarImoveisFormData) => {
    setIsSearching(true)
    try {
      const results = await buscarImoveisParaCompra({
        estado: data.estado,
        municipio: data.municipio,
        bairro: data.bairro,
        area: data.area,
        quartos: data.quartos,
        banheiros: data.banheiros,
        vagas: data.vagas,
        categoria: data.categoria || '',
        limite: data.limite || 10,
      })

      if (results.length === 0) {
        toast.info('Nenhum imóvel encontrado com os critérios informados')
      } else {
        toast.success(`${results.length} imóveis encontrados!`)
      }

      onResults(results, data)
    } catch (error: any) {
      console.error('Erro na busca:', error)
      toast.error(error.message || 'Erro ao buscar imóveis')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Seção 1: Localização */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className={`h-5 w-5 ${iconColor}`} />
            <h3 className="font-semibold text-lg">Localização Desejada</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CEP (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="cep">CEP (opcional - preenche automaticamente)</Label>
              <div className="relative">
                <Input
                  id="cep"
                  placeholder="00000-000"
                  onChange={handleCepChange}
                  disabled={isFetchingCep}
                  className={isFetchingCep ? 'pr-10' : ''}
                />
                {isFetchingCep && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={estadoValue}
                onValueChange={(value) => setValue('estado', value, { shouldValidate: true })}
              >
                <SelectTrigger id="estado" className={errors.estado ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione o estado" />
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

            {/* Município */}
            <div className="space-y-2">
              <Label htmlFor="municipio">Município *</Label>
              {isLoadingCities ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={municipioValue}
                  onValueChange={(value) => setValue('municipio', value, { shouldValidate: true })}
                  disabled={!estadoValue || cities.length === 0}
                >
                  <SelectTrigger
                    id="municipio"
                    className={errors.municipio ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder={!estadoValue ? 'Selecione o estado primeiro' : 'Selecione o município'} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.municipio && (
                <p className="text-sm text-destructive">{errors.municipio.message}</p>
              )}
            </div>

            {/* Bairro */}
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro *</Label>
              {isLoadingNeighborhoods ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={bairroValue}
                  onValueChange={(value) => setValue('bairro', value, { shouldValidate: true })}
                  disabled={!municipioValue || neighborhoods.length === 0}
                >
                  <SelectTrigger
                    id="bairro"
                    className={errors.bairro ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder={!municipioValue ? 'Selecione o município primeiro' : 'Selecione o bairro'} />
                  </SelectTrigger>
                  <SelectContent>
                    {neighborhoods.map((bairro) => (
                      <SelectItem key={bairro} value={bairro}>
                        {bairro}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.bairro && (
                <p className="text-sm text-destructive">{errors.bairro.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Tipo de Imóvel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className={`h-5 w-5 ${iconColor}`} />
            <h3 className="font-semibold text-lg">Tipo de Imóvel</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={watch('categoria') || undefined}
                onValueChange={(value) => setValue('categoria', value === '__all__' ? '' : value, { shouldValidate: true })}
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas as categorias</SelectItem>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Limite de resultados */}
            <div className="space-y-2">
              <Label htmlFor="limite">Quantidade de resultados</Label>
              <Select
                value={String(watch('limite') || 10)}
                onValueChange={(value) => setValue('limite', parseInt(value), { shouldValidate: true })}
              >
                <SelectTrigger id="limite">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 imóveis</SelectItem>
                  <SelectItem value="10">10 imóveis</SelectItem>
                  <SelectItem value="20">20 imóveis</SelectItem>
                  <SelectItem value="30">30 imóveis</SelectItem>
                  <SelectItem value="50">50 imóveis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Características Desejadas */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Maximize className={`h-5 w-5 ${iconColor}`} />
            <h3 className="font-semibold text-lg">Características Desejadas</h3>
            <span className="text-sm text-muted-foreground">(opcional)</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Área mínima */}
            <div className="space-y-2">
              <Label htmlFor="area" className="flex items-center gap-2">
                <Maximize className="h-4 w-4 text-muted-foreground" />
                Área mínima (m²)
              </Label>
              <Input
                id="area"
                type="number"
                min="0"
                placeholder="Ex: 80"
                {...register('area', { valueAsNumber: true })}
              />
            </div>

            {/* Quartos */}
            <div className="space-y-2">
              <Label htmlFor="quartos" className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                Quartos
              </Label>
              <Input
                id="quartos"
                type="number"
                min="0"
                placeholder="Ex: 3"
                {...register('quartos', { valueAsNumber: true })}
              />
            </div>

            {/* Banheiros */}
            <div className="space-y-2">
              <Label htmlFor="banheiros" className="flex items-center gap-2">
                <Bath className="h-4 w-4 text-muted-foreground" />
                Banheiros
              </Label>
              <Input
                id="banheiros"
                type="number"
                min="0"
                placeholder="Ex: 2"
                {...register('banheiros', { valueAsNumber: true })}
              />
            </div>

            {/* Vagas */}
            <div className="space-y-2">
              <Label htmlFor="vagas" className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                Vagas
              </Label>
              <Input
                id="vagas"
                type="number"
                min="0"
                placeholder="Ex: 2"
                {...register('vagas', { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isSearching}
          className="min-w-[200px] gap-2"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Buscar Imóveis
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
