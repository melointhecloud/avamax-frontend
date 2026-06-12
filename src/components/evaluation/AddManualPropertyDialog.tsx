import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Link2, Plus, AlertCircle, Pencil, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import type { SimilarPropertyData } from './SimilarPropertyCard'

const N8N_WEBHOOK_URL =
  'https://n8n-production-2e06.up.railway.app/webhook/8ad57fd9-e8d5-486a-9dc9-05bf113ccafb'

interface AddManualPropertyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPropertyAdded: (property: SimilarPropertyData) => void
}

// Subformulário de edição de campos do imóvel
function PropertyEditForm({
  property,
  onConfirm,
  onCancel,
}: {
  property: SimilarPropertyData
  onConfirm: (p: SimilarPropertyData) => void
  onCancel: () => void
}) {
  const fmt = (n: number | null | undefined) => (n != null && n !== 0 ? String(n) : '')

  const [valor, setValor] = useState(fmt(property.valor))
  const [metros, setMetros] = useState(fmt(property.metros))
  const [quartos, setQuartos] = useState(fmt(property.quartos))
  const [banheiros, setBanheiros] = useState(fmt(property.banheiros))
  const [vagas, setVagas] = useState(fmt(property.vagas))
  const [categoria, setCategoria] = useState(property.categoria || '')
  const [bairro, setBairro] = useState(property.bairro || '')

  const parseNum = (v: string) => {
    const n = Number(v.replace(/\D/g, ''))
    return isNaN(n) ? null : n
  }

  const handleConfirm = () => {
    const valorNum = Number(valor.replace(/\D/g, '')) || 0
    if (!valorNum) {
      toast.error('Informe o valor do imóvel')
      return
    }
    onConfirm({
      ...property,
      valor: valorNum,
      metros: parseNum(metros) ?? 0,
      quartos: parseNum(quartos),
      banheiros: parseNum(banheiros),
      vagas: parseNum(vagas),
      categoria: categoria || null,
      bairro: bairro || null,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <span className="text-amber-700 dark:text-amber-300">
          Alguns dados não foram capturados automaticamente. Preencha ou corrija abaixo antes de confirmar.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label>Valor (R$) *</Label>
          <Input
            placeholder="Ex: 1350000"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Área (m²)</Label>
          <Input
            placeholder="Ex: 120"
            value={metros}
            onChange={(e) => setMetros(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Quartos</Label>
          <Input
            placeholder="Ex: 3"
            value={quartos}
            onChange={(e) => setQuartos(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Banheiros</Label>
          <Input
            placeholder="Ex: 2"
            value={banheiros}
            onChange={(e) => setBanheiros(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Vagas</Label>
          <Input
            placeholder="Ex: 1"
            value={vagas}
            onChange={(e) => setVagas(e.target.value)}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Tipo / Categoria</Label>
          <Input
            placeholder="Ex: Apartamento"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Bairro</Label>
          <Input
            placeholder="Ex: Asa Sul"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button className="flex-1 gap-2" onClick={handleConfirm}>
          <CheckCircle2 className="h-4 w-4" />
          Confirmar e adicionar
        </Button>
      </div>
    </div>
  )
}

export function AddManualPropertyDialog({
  open,
  onOpenChange,
  onPropertyAdded,
}: AddManualPropertyDialogProps) {
  const [link, setLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingProperty, setEditingProperty] = useState<SimilarPropertyData | null>(null)

  const isValidUrl = (url: string) => {
    try {
      new URL(url.trim())
      return true
    } catch {
      return false
    }
  }

  const handleClose = (v: boolean) => {
    if (!isLoading) {
      onOpenChange(v)
      setError(null)
      setLink('')
      setEditingProperty(null)
    }
  }

  const handleSubmit = async () => {
    const trimmedLink = link.trim()
    if (!trimmedLink) {
      setError('Cole o link do anúncio do imóvel')
      return
    }
    if (!isValidUrl(trimmedLink)) {
      setError('Link inválido. Cole a URL completa do anúncio.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmedLink }),
      })

      if (!response.ok) {
        throw new Error('Erro ao processar o link. Tente novamente.')
      }

      const result = await response.json()
      const data = Array.isArray(result) ? result[0] : result

      if (!data) {
        throw new Error('Não foi possível extrair informações deste anúncio.')
      }

      console.log('[AddManualProperty] Resposta do webhook:', JSON.stringify(data, null, 2))

      // Parsing defensivo: n8n pode retornar campos com nomes variados
      const valor = Number(
        data.valor_imovel ?? data.valor ?? data.price ?? data.preco ?? 0
      ) || 0

      const metros = Number(
        data.area_m2 ?? data.area ?? data.metros ?? data.metragem ?? data.area_util ?? 0
      ) || 0

      const quartos = data.quartos ?? data.bedrooms ?? data.dormitorios ?? data.dormitórios ?? null
      const banheiros = data.banheiros ?? data.bathrooms ?? data.wcs ?? null
      const vagas = data.garagens ?? data.vagas ?? data.garagem ?? data.parking ?? null
      const categoria = data.categoria ?? data.tipo ?? data.type ?? data.property_type ?? null
      const descricao = data.descricao ?? data.description ?? data.texto ?? null
      const imagem = data.imagens ?? data.imagem ?? data.foto ?? data.image ?? data.thumbnail ?? null

      // Extrai bairro do campo "local" (formato: "Bairro, Cidade, Estado") ou campo dedicado
      const bairro = data.bairro ?? data.neighborhood ?? (
        data.local ? data.local.split(',')[0]?.trim() : null
      ) ?? null

      if (!valor && !metros) {
        throw new Error('Não foi possível extrair informações deste anúncio. Verifique se o link é de um portal compatível.')
      }

      // Use a large unique positive ID that won't collide with real DB IDs
      const manualId = 9_000_000_000 + Date.now() % 1_000_000_000

      const property: SimilarPropertyData = {
        id: manualId,
        valor,
        metros,
        quartos: quartos != null ? Number(quartos) : null,
        banheiros: banheiros != null ? Number(banheiros) : null,
        vagas: vagas != null ? Number(vagas) : null,
        categoria: categoria ? String(categoria) : null,
        descricao: descricao ? String(descricao) : null,
        imagem: imagem ? String(imagem) : null,
        bairro,
        link: trimmedLink,
        score: 100,
        mesmoBairro: false,
        _isManual: true,
      }

      // Se campos essenciais estão zerados, abre o formulário de edição manual
      if (!metros || quartos == null) {
        setEditingProperty(property)
        setIsLoading(false)
        return
      }

      onPropertyAdded(property)
      toast.success('Imóvel adicionado com sucesso!')
      setLink('')
      onOpenChange(false)
    } catch (err: any) {
      console.error('Erro ao adicionar imóvel manual:', err)
      setError(err.message || 'Erro ao processar o link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditConfirm = (property: SimilarPropertyData) => {
    onPropertyAdded(property)
    toast.success('Imóvel adicionado com sucesso!')
    setLink('')
    setEditingProperty(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            {editingProperty ? 'Confirmar dados do imóvel' : 'Adicionar imóvel manualmente'}
          </DialogTitle>
          {!editingProperty && (
            <DialogDescription>
              Cole o link do anúncio de um imóvel que você encontrou em outro site. Nós extrairemos as informações automaticamente.
            </DialogDescription>
          )}
        </DialogHeader>

        {editingProperty ? (
          <PropertyEditForm
            property={editingProperty}
            onConfirm={handleEditConfirm}
            onCancel={() => setEditingProperty(null)}
          />
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="property-link">Link do anúncio</Label>
                <Input
                  id="property-link"
                  placeholder="https://www.exemplo.com.br/imovel/..."
                  value={link}
                  onChange={(e) => { setLink(e.target.value); setError(null) }}
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span>Extraindo informações do anúncio... Isso pode levar alguns segundos.</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading || !link.trim()} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
