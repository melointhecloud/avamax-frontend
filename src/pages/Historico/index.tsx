import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTenantPrefix } from '@/hooks/useTenantPrefix'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Key } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { supabase } from '@/integrations/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { EmptyState } from '@/components/ui/EmptyState'
import { EvaluationCard } from '@/components/historico/EvaluationCard'
import { SatisfactionRating } from '@/components/historico/SatisfactionRating'
import { usePdfDownload } from '@/hooks/usePdfDownload'
import { toast } from 'sonner'
import {
  Search,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Filter,
  SlidersHorizontal,
  Loader2,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Avaliacao {
  id: number
  created_at: string
  creditos_consumidos: number
  satisfacao: number | null
  user_id: string
  input: {
    municipio?: string
    estado?: string
    bairro?: string
    categoria?: string
    area?: number
    areaTotal?: number
    tipoAvaliacao?: 'venda' | 'aluguel'
  }
  resultado: {
    valor_estimado?: number
    valor_m2?: number
    pdf_settings?: {
      market?: {
        valor_estimado?: number
        minimo?: number
        maximo?: number
      }
    }
    pdf_settings_aluguel?: {
      market?: {
        valor_estimado?: number
        minimo?: number
        maximo?: number
      }
    }
  }
  // Joined from profiles
  author_name?: string
}

// Helper para obter valor estimado (editado ou original)
const getValorEstimado = (avaliacao: Avaliacao): number | undefined => {
  const isRental = avaliacao.input?.tipoAvaliacao === 'aluguel'
  const resultado = avaliacao.resultado
  
  if (isRental) {
    // Se for aluguel, verifica se há valor editado de aluguel
    const valorEditadoAluguel = resultado?.pdf_settings_aluguel?.market?.valor_estimado
    if (valorEditadoAluguel) return valorEditadoAluguel
    
    // Senão calcula baseado no valor de venda (0.5%)
    const valorVenda = resultado?.pdf_settings?.market?.valor_estimado ?? resultado?.valor_estimado
    return valorVenda ? Math.round(valorVenda * 0.005) : undefined
  } else {
    // Se for venda, usa valor editado ou original
    return resultado?.pdf_settings?.market?.valor_estimado ?? resultado?.valor_estimado
  }
}

const ITEMS_PER_PAGE = 10

const Historico = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const p = useTenantPrefix()
  const isRemax = true
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { isDownloading, downloadingId, downloadPdf, PdfRenderer } = usePdfDownload()
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState<string>('all')
  const [filterPeriodo, setFilterPeriodo] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [avaliacaoToDelete, setAvaliacaoToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchAvaliacoes = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('avaliacoes')
          .select('id, created_at, creditos_consumidos, satisfacao, user_id, input, resultado')
          .order('created_at', { ascending: false })

        if (filterCategoria !== 'all') {
          query = query.eq('input->>categoria', filterCategoria)
        }

        if (filterPeriodo !== 'all') {
          const now = new Date()
          let startDate = new Date(0)
          switch (filterPeriodo) {
            case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break
            case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break
            case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break
          }
          query = query.gte('created_at', startDate.toISOString())
        }

        if (searchTerm) {
          const term = `%${searchTerm.toLowerCase()}%`
          query = query.or(`input->>municipio.ilike.${term},input->>bairro.ilike.${term},input->>estado.ilike.${term}`)
        }

        const { data, error } = await query

        if (error) throw error

        const rows = (data || []) as (Avaliacao & { user_id: string })[]

        // Fetch profile names for unique user_ids
        const uniqueUserIds = [...new Set(rows.map((r) => r.user_id))]
        let profileMap: Record<string, string> = {}
        if (uniqueUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nome')
            .in('id', uniqueUserIds)
          if (profiles) {
            profileMap = Object.fromEntries(
              profiles.map((p) => [p.id, p.nome || 'Sem nome'])
            )
          }
        }

        setAvaliacoes(
          rows.map((r) => ({
            ...r,
            author_name: profileMap[r.user_id] || 'Sem nome',
          })) as Avaliacao[]
        )
      } catch (err) {
        console.error('Erro ao buscar avaliações:', err)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchAvaliacoes()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [user, filterCategoria, filterPeriodo, searchTerm])

  const categorias = useMemo(() => {
    const cats = new Set<string>()
    avaliacoes.forEach((a) => {
      if (a.input?.categoria) cats.add(a.input.categoria)
    })
    return Array.from(cats)
  }, [avaliacoes])

  const totalPages = Math.ceil(avaliacoes.length / ITEMS_PER_PAGE)
  const paginatedAvaliacoes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return avaliacoes.slice(start, start + ITEMS_PER_PAGE)
  }, [avaliacoes, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategoria, filterPeriodo])

  const formatCurrency = (value?: number) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleDownloadPdf = (avaliacao: Avaliacao) => {
    if (isRemax) {
      // Na rota RE/MAX, navega para a página de detalhes e abre o modal de PDF
      navigate(p(`/avaliacao/${avaliacao.id}`), { state: { openPdfPreview: true } })
    } else {
      downloadPdf(avaliacao.id)
    }
  }

  const handleDeleteClick = (id: number) => {
    setAvaliacaoToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!avaliacaoToDelete) return
    
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('avaliacoes')
        .delete()
        .eq('id', avaliacaoToDelete)
      
      if (error) throw error
      
      setAvaliacoes((prev) => prev.filter((a) => a.id !== avaliacaoToDelete))
      queryClient.invalidateQueries({ queryKey: ['evaluation-heatmap'] })
      queryClient.invalidateQueries({ queryKey: ['location-evaluations'] })
      toast.success('Avaliação excluída com sucesso')
    } catch (err) {
      console.error('Erro ao excluir avaliação:', err)
      toast.error('Erro ao excluir avaliação')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setAvaliacaoToDelete(null)
    }
  }

  const activeFiltersCount =
    (filterCategoria !== 'all' ? 1 : 0) + (filterPeriodo !== 'all' ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Categoria</label>
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Período</label>
        <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo período</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <DashboardLayout title="Histórico" subtitle="Visualize suas avaliações">
      <PdfRenderer />
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Histórico de Avaliações
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Visualize e gerencie todas as suas avaliações realizadas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
              <FileText className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avaliacoes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  avaliacoes.filter((a) => {
                    const date = new Date(a.created_at)
                    const now = new Date()
                    return (
                      date.getMonth() === now.getMonth() &&
                      date.getFullYear() === now.getFullYear()
                    )
                  }).length
                }
              </div>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créditos Usados</CardTitle>
              <Filter className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avaliacoes.reduce((sum, a) => sum + a.creditos_consumidos, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 sm:pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 pl-9"
                />
              </div>

              {/* Mobile: Filter button */}
              <div className="md:hidden">
                <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-10 w-full gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtros
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-auto">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <FilterContent />
                      <Button
                        className="mt-6 w-full"
                        onClick={() => setFilterSheetOpen(false)}
                      >
                        Aplicar filtros
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop: Inline filters */}
              <div className="hidden gap-3 md:flex">
                <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo período</SelectItem>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedAvaliacoes.length === 0 ? (
            <Card>
              <EmptyState
                icon={FileText}
                title="Nenhuma avaliação encontrada"
                description={
                  searchTerm || filterCategoria !== 'all' || filterPeriodo !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Você ainda não realizou nenhuma avaliação'
                }
                action={
                  !searchTerm &&
                  filterCategoria === 'all' &&
                  filterPeriodo === 'all' && (
                    <Button onClick={() => navigate(p('/avaliar'))}>Nova Avaliação</Button>
                  )
                }
              />
            </Card>
          ) : (
            <>
              {/* Mobile: Card list */}
              <div className="space-y-3 md:hidden">
                {paginatedAvaliacoes.map((avaliacao) => (
                  <EvaluationCard
                    key={avaliacao.id}
                    avaliacao={avaliacao}
                    onView={() => navigate(p(`/avaliacao/${avaliacao.id}`))}
                    onDownload={() => handleDownloadPdf(avaliacao)}
                    onDelete={() => handleDeleteClick(avaliacao.id)}
                    formatCurrency={formatCurrency}
                    isDownloading={downloadingId === avaliacao.id}
                    isDeleting={avaliacaoToDelete === avaliacao.id && isDeleting}
                    isRemax={isRemax}
                  />
                ))}
              </div>

              {/* Desktop: Table */}
              <Card className="hidden md:block">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Corretor</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead>Valor Estimado</TableHead>
                        <TableHead>Satisfação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAvaliacoes.map((avaliacao) => (
                        <TableRow key={avaliacao.id}>
                          <TableCell className="font-medium">
                            {format(new Date(avaliacao.created_at), 'dd MMM yyyy', {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm truncate max-w-[120px] block">
                              {avaliacao.author_name || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {avaliacao.input?.bairro || '-'}
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                {avaliacao.input?.municipio}, {avaliacao.input?.estado}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={isRemax
                                ? 'gap-1 text-white border-transparent'
                                : avaliacao.input?.tipoAvaliacao === 'aluguel' 
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 gap-1' 
                                  : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 gap-1'
                              }
                              style={isRemax ? { background: 'hsl(216 100% 40%)' } : undefined}
                            >
                              {avaliacao.input?.tipoAvaliacao === 'aluguel' ? (
                                <><Key className="h-3 w-3" /> Aluguel</>
                              ) : (
                                <><Home className="h-3 w-3" /> Venda</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {avaliacao.input?.categoria || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {avaliacao.input?.area ? `${avaliacao.input.area} m²` : '-'}
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            {formatCurrency(getValorEstimado(avaliacao))}
                            {avaliacao.input?.tipoAvaliacao === 'aluguel' && <span className="text-xs font-normal text-muted-foreground">/mês</span>}
                          </TableCell>
                          <TableCell>
                            <SatisfactionRating
                              avaliacaoId={avaliacao.id}
                              currentRating={avaliacao.satisfacao}
                              onRatingChange={(rating) => {
                                setAvaliacoes((prev) =>
                                  prev.map((a) =>
                                    a.id === avaliacao.id ? { ...a, satisfacao: rating } : a
                                  )
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => navigate(p(`/avaliacao/${avaliacao.id}`))}
                                aria-label="Visualizar"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => handleDownloadPdf(avaliacao)}
                                disabled={downloadingId === avaliacao.id}
                                aria-label="Download PDF"
                              >
                                {downloadingId === avaliacao.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteClick(avaliacao.id)}
                                disabled={avaliacaoToDelete === avaliacao.id && isDeleting}
                                aria-label="Excluir avaliação"
                              >
                                {avaliacaoToDelete === avaliacao.id && isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
                  <p className="text-sm text-muted-foreground">
                    <span className="hidden sm:inline">Mostrando </span>
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, avaliacoes.length)} de{' '}
                    {avaliacoes.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[80px] px-2 text-center text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      aria-label="Próxima página"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir avaliação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente e não pode ser desfeita. A avaliação será removida do seu histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

export default Historico
