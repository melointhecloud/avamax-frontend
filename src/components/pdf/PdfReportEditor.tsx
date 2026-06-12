import React, { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Pencil,
  X,
  Save,
  RotateCcw,
  Users,
  ImagePlus,
  Megaphone,
  ChevronDown,
  Clock,
  Home,
  ArrowUp,
  ArrowDown,
  GripVertical,
   RefreshCw
} from 'lucide-react'

import { MarketingPlanEditor, MarketingPlanSettings } from '@/components/pdf/MarketingPlanEditor'
import { PdfColorEditor, PDF_COLOR_PRESETS, type PdfColors } from '@/components/pdf/PdfColorEditor'
import { toast } from 'sonner'

// Formata número para Real (R$)
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Converte string de moeda para número
const parseCurrency = (value: string): number => {
  const numericValue = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(numericValue) || 0;
};

export interface PdfReportEditorProps {
  data: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  onReset?: () => void;
  isRental?: boolean;
  evaluationId?: number;
   onRequestReselectSamples?: () => void;
}

 export function PdfReportEditor({ data, onSave, onCancel, onReset, isRental = false, evaluationId, onRequestReselectSamples }: PdfReportEditorProps) {
  const [formData, setFormData] = useState({
    ...data,
    settings: {
      showMinimo: true, 
      showMaximo: true, 
      showMarketingPlan: true, 
      marketingPlan: {},
      pdfColors: PDF_COLOR_PRESETS.default,
      ...data.settings
    }
  });
  const [marketingOpen, setMarketingOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
   // Amostras do formulário
  const allSamples = formData.market?.similares || [];

  const handleSettingsChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      settings: {
        ...(prev.settings || {}),
        [field]: value
      }
    }));
  };
  
  const handleColorsChange = (colors: PdfColors) => {
    handleSettingsChange('pdfColors', colors);
  };

  const handleChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleClientChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      client: {
        ...(prev.client || {}),
        [field]: value
      }
    }));
  };

  const handleBrokerChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      broker: {
        ...(prev.broker || {}),
        [field]: value
      }
    }));
  };

  const handleSampleChange = (index: number, field: string, value: any) => {
    const newSimilares = [...formData.market.similares];
    newSimilares[index] = { ...newSimilares[index], [field]: value };
    
    setFormData((prev: any) => ({
      ...prev,
      market: {
        ...prev.market,
        similares: newSimilares
      }
    }));
  };

  const handleMoveSample = (index: number, direction: 'up' | 'down') => {
     const targetIndex = direction === 'up' ? index - 1 : index + 1
     if (targetIndex < 0 || targetIndex >= allSamples.length) return
 
    const newSimilares = [...allSamples];
    [newSimilares[index], newSimilares[targetIndex]] = [newSimilares[targetIndex], newSimilares[index]];

    setFormData((prev: any) => ({
      ...prev,
      market: {
        ...prev.market,
        similares: newSimilares
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('property', 'foto_capa', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-border">
        {/* Header do Modal */}
        <div className={`p-6 border-b border-border flex justify-between items-center rounded-t-xl ${isRental ? 'bg-emerald-500/10' : 'bg-muted/50'}`}>
          <div>
            <h3 className={`text-xl font-bold ${isRental ? 'text-emerald-600' : 'text-primary'}`}>
              {isRental ? 'Editar PDF de Aluguel' : 'Editar PDF de Venda'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRental ? 'Personalize os dados do relatório de aluguel.' : 'Personalize os dados antes de gerar o documento.'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Corpo do Form (Scrollável) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* Seção 1: Cliente e Imóvel */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Users size={18} className="text-primary" /> Dados do Cliente & Imóvel
            </h4>
            
            {/* Upload de Foto da Fachada - Seção Destacada */}
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ImagePlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="text-foreground font-semibold text-base">Foto da Fachada</Label>
                  <p className="text-xs text-muted-foreground">Imagem principal que aparece na capa do PDF</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Preview da imagem */}
                <div 
                  className="relative w-40 h-28 rounded-lg border-2 border-dashed border-primary/40 bg-background flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.property?.foto_capa ? (
                    <>
                      <img 
                        src={formData.property.foto_capa} 
                        alt="Fachada" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-sm font-medium flex items-center gap-1">
                          <Pencil size={14} />
                          Alterar
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-primary/70 group-hover:text-primary transition-colors">
                      <ImagePlus size={28} />
                      <span className="text-xs mt-1 font-medium">Clique para adicionar</span>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                
                {/* Botão de ação e instruções */}
                <div className="flex-1 space-y-2">
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    {formData.property?.foto_capa ? 'Trocar foto' : 'Selecionar foto'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    JPG, PNG ou WEBP
                  </p>
                </div>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className={`p-4 rounded-lg border space-y-4 transition-opacity ${formData.settings?.showClient !== false ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border opacity-60'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h5 className="font-medium text-primary text-sm">Dados do Cliente (capa do PDF)</h5>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Exibir cliente no PDF</span>
                  <Switch
                    checked={formData.settings?.showClient !== false}
                    onCheckedChange={(checked) => handleSettingsChange('showClient', checked)}
                  />
                </div>
              </div>
              
              {formData.settings?.showClient !== false && (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Nome do Cliente</Label>
                  <Input 
                    placeholder="Nome do cliente"
                    value={formData.client?.nome || formData.clientName || ''} 
                    onChange={(e) => {
                      handleClientChange('nome', e.target.value);
                      setFormData((prev: any) => ({...prev, clientName: e.target.value}));
                    }} 
                  />
                </div>
              )}
            </div>

            {/* Dados de Contato do Corretor */}
            <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h5 className="font-medium text-blue-600 text-sm">Contato do Corretor (capa do PDF)</h5>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Exibir contato</span>
                  <Switch
                    checked={formData.settings?.showBrokerContact !== false}
                    onCheckedChange={(checked) => handleSettingsChange('showBrokerContact', checked)}
                  />
                </div>
              </div>
              
              {formData.settings?.showBrokerContact !== false && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-foreground font-medium text-sm">Telefone</Label>
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded flex-shrink-0">
                        {formData.broker?.telefone_custom ? 'Personalizado' : 'Do perfil'}
                      </span>
                    </div>
                    <Input 
                      placeholder="(00) 00000-0000"
                      value={formData.broker?.telefone_custom || formData.broker?.telefone || ''} 
                      onChange={(e) => handleBrokerChange('telefone_custom', e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground">Deixe em branco para usar o telefone do perfil</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-foreground font-medium text-sm">E-mail</Label>
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded flex-shrink-0">
                        {formData.broker?.email_custom ? 'Personalizado' : 'Do perfil'}
                      </span>
                    </div>
                    <Input 
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.broker?.email_custom || formData.broker?.email || ''} 
                      onChange={(e) => handleBrokerChange('email_custom', e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground">Deixe em branco para usar o e-mail do perfil</p>
                  </div>
                </div>
              )}
            </div>

            {/* Dados da Imobiliária */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Nome da Imobiliária (badge Supervisão)</Label>
              <Input 
                placeholder="Nome da imobiliária ou deixe vazio para 'Avaliação I.A.'"
                value={formData.broker?.imobiliaria || ''} 
                onChange={(e) => handleBrokerChange('imobiliaria', e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Valor Pedido / Atual</Label>
                <Input 
                  placeholder="R$ 0"
                  value={formatCurrency(formData.property?.valor_atual || 0)} 
                  onChange={(e) => handleChange('property', 'valor_atual', parseCurrency(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Endereço (Rua)</Label>
                <Input 
                  value={formData.property?.rua || ''} 
                  onChange={(e) => handleChange('property', 'rua', e.target.value)} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Município</Label>
                <Input 
                  value={formData.property?.municipio || ''} 
                  onChange={(e) => handleChange('property', 'municipio', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Bairro</Label>
                <Input 
                  value={formData.property?.bairro || ''} 
                  onChange={(e) => handleChange('property', 'bairro', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mt-2">
               <div className="space-y-1">
                  <Label className="text-xs text-foreground">Área (m²)</Label>
                  <Input type="number" value={formData.property?.area || 0} onChange={(e) => handleChange('property', 'area', Number(e.target.value))} />
               </div>
               <div className="space-y-1">
                  <Label className="text-xs text-foreground">Quartos</Label>
                  <Input type="number" value={formData.property?.quartos || 0} onChange={(e) => handleChange('property', 'quartos', Number(e.target.value))} />
               </div>
               <div className="space-y-1">
                  <Label className="text-xs text-foreground">Suítes</Label>
                  <Input type="number" value={formData.property?.suites || 0} onChange={(e) => handleChange('property', 'suites', Number(e.target.value))} />
               </div>
               <div className="space-y-1">
                  <Label className="text-xs text-foreground">Vagas</Label>
                  <Input type="number" value={formData.property?.vagas || 0} onChange={(e) => handleChange('property', 'vagas', Number(e.target.value))} />
               </div>
            </div>
          </div>

          {/* Seção 2: Valores de Mercado */}
          <div className="space-y-4">
            <h4 className={`font-bold text-foreground flex items-center gap-2 border-b border-border pb-2`}>
              <Sparkles size={18} className={isRental ? 'text-emerald-600' : 'text-primary'} /> 
              {isRental ? 'Valores de Aluguel (Mensal)' : 'Análise de Mercado (IA)'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className={`font-bold ${isRental ? 'text-emerald-600' : 'text-primary'}`}>
                  {isRental ? 'Aluguel Estimado (Mensal)' : 'Valor Estimado (Avaluz)'}
                </Label>
                <Input 
                  placeholder="R$ 0"
                  className={isRental ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-primary/30 bg-primary/10'}
                  value={formatCurrency(formData.market?.valor_estimado || 0)} 
                  onChange={(e) => handleChange('market', 'valor_estimado', parseCurrency(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium">Mínimo (Piso)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Exibir no PDF</span>
                    <Switch
                      checked={formData.settings?.showMinimo !== false}
                      onCheckedChange={(checked) => handleSettingsChange('showMinimo', checked)}
                    />
                  </div>
                </div>
                <Input 
                  placeholder="R$ 0"
                  className={formData.settings?.showMinimo === false ? 'opacity-50' : ''}
                  value={formatCurrency(formData.market?.minimo || 0)} 
                  onChange={(e) => handleChange('market', 'minimo', parseCurrency(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium">Máximo (Teto)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Exibir no PDF</span>
                    <Switch
                      checked={formData.settings?.showMaximo !== false}
                      onCheckedChange={(checked) => handleSettingsChange('showMaximo', checked)}
                    />
                  </div>
                </div>
                <Input 
                  placeholder="R$ 0"
                  className={formData.settings?.showMaximo === false ? 'opacity-50' : ''}
                  value={formatCurrency(formData.market?.maximo || 0)} 
                  onChange={(e) => handleChange('market', 'maximo', parseCurrency(e.target.value))} 
                />
              </div>
            </div>
          </div>

          {/* Seção: Cores do PDF */}
          <PdfColorEditor
            colors={formData.settings?.pdfColors || PDF_COLOR_PRESETS.default}
            onChange={handleColorsChange}
            reportType={isRental ? 'aluguel' : 'venda'}
          />

          {/* Seção: Plano de Marketing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Megaphone size={18} className="text-orange-500" /> Plano de Marketing
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Exibir no PDF</span>
                <Switch
                  checked={formData.settings?.showMarketingPlan !== false}
                  onCheckedChange={(checked) => handleSettingsChange('showMarketingPlan', checked)}
                />
              </div>
            </div>
            
            {/* Editor expansível do plano de marketing */}
            <Collapsible open={marketingOpen} onOpenChange={setMarketingOpen}>
              <CollapsibleTrigger asChild>
                <button 
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    formData.settings?.showMarketingPlan !== false 
                      ? 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20' 
                      : 'bg-muted/50 border-border opacity-50'
                  }`}
                  disabled={formData.settings?.showMarketingPlan === false}
                >
                  <span className="text-sm font-medium text-foreground">
                    Personalizar seções do plano
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`text-muted-foreground transition-transform ${marketingOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <MarketingPlanEditor
                  settings={formData.settings?.marketingPlan || {}}
                  onChange={(newSettings: MarketingPlanSettings) => handleSettingsChange('marketingPlan', newSettings)}
                  isRental={isRental}
                  disabled={formData.settings?.showMarketingPlan === false}
                />
              </CollapsibleContent>
            </Collapsible>
            
            <p className="text-xs text-muted-foreground">
              {isRental 
                ? 'Funil de locação, indicadores de performance e benefícios da assessoria.' 
                : 'Estratégias de precificação, pilares de venda e funil de ações.'}
            </p>
          </div>

          {/* Seção: Tempo de Locação (apenas para aluguel) */}
          {isRental && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  <Clock size={18} className="text-emerald-500" /> Tempo de Locação
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Exibir no PDF</span>
                  <Switch
                    checked={formData.settings?.showRentalTime !== false}
                    onCheckedChange={(checked) => handleSettingsChange('showRentalTime', checked)}
                  />
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border space-y-4 transition-opacity ${
                formData.settings?.showRentalTime !== false 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : 'bg-muted/30 border-border opacity-60'
              }`}>
                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 p-2 rounded-md">
                  ⚠️ Alguns corretores preferem ocultar esta informação para evitar expectativas de prazo com o cliente.
                </p>
                
                {formData.settings?.showRentalTime !== false && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Tempo estimado (ex: "15-30 dias")</Label>
                      <Input 
                        placeholder="15-30 dias"
                        value={formData.settings?.rentalTimeText || ''} 
                        onChange={(e) => handleSettingsChange('rentalTimeText', e.target.value)} 
                      />
                      <p className="text-[10px] text-muted-foreground">Deixe em branco para usar o padrão: "15-30 dias"</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Descrição do indicador</Label>
                      <Textarea 
                        placeholder="Com o preço de equilíbrio recomendado, expectativa de locação dentro deste prazo."
                        className="min-h-[60px]"
                        value={formData.settings?.rentalTimeDescription || ''} 
                        onChange={(e) => handleSettingsChange('rentalTimeDescription', e.target.value)} 
                      />
                      <p className="text-[10px] text-muted-foreground">Deixe em branco para usar a descrição padrão</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seção 3: Amostras do PDF */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground flex items-center gap-2 border-b border-border pb-2 text-sm sm:text-base">
              <Home size={18} className="text-primary flex-shrink-0" /> 
               <span className="truncate">Amostras no PDF ({Math.min(allSamples.length, 6)} de {allSamples.length})</span>
            </h4>
             <div className="text-xs text-muted-foreground -mt-2 space-y-2">
              <p>Apenas as 6 primeiras amostras aparecem no PDF. Use as setas para reordenar.</p>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
               {allSamples.slice(0, 6).map((sample: any, idx: number) => (
                 <div key={sample.id ?? idx} className="p-3 sm:p-4 border rounded-lg space-y-3 border-border bg-muted/30">
                  {/* Header com número e controles de ordenação */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical size={14} className="text-muted-foreground/50 flex-shrink-0" />
                      <span className="font-bold text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded flex-shrink-0">#{idx + 1}</span>
                      <span className="text-xs text-muted-foreground truncate">{sample.titulo}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 gap-1 text-xs"
                        onClick={() => handleMoveSample(idx, 'up')}
                        disabled={idx === 0}
                      >
                        <ArrowUp size={12} />
                        <span className="hidden sm:inline">Subir</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 gap-1 text-xs"
                        onClick={() => handleMoveSample(idx, 'down')} 
                         disabled={idx >= Math.min(allSamples.length, 6) - 1}
                      >
                        <ArrowDown size={12} />
                        <span className="hidden sm:inline">Descer</span>
                      </Button>
                    </div>
                  </div>
                  {/* Campos em grid responsivo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-foreground">Título / Nome</Label>
                      <Input 
                        className="h-8 text-sm" 
                        value={sample.titulo} 
                        onChange={(e) => {
                          const originalIdx = allSamples.findIndex((s: any) => (s.id ?? allSamples.indexOf(s)) === (sample.id ?? idx));
                          handleSampleChange(originalIdx >= 0 ? originalIdx : idx, 'titulo', e.target.value);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-foreground">Valor</Label>
                      <Input 
                        className="h-8 text-sm" 
                        placeholder="R$ 0"
                        value={formatCurrency(sample.valor || 0)} 
                        onChange={(e) => {
                          const originalIdx = allSamples.findIndex((s: any) => (s.id ?? allSamples.indexOf(s)) === (sample.id ?? idx));
                          handleSampleChange(originalIdx >= 0 ? originalIdx : idx, 'valor', parseCurrency(e.target.value));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-foreground">Descrição</Label>
                      <Input 
                        className="h-8 text-sm" 
                        value={sample.descricao} 
                        onChange={(e) => {
                          const originalIdx = allSamples.findIndex((s: any) => (s.id ?? allSamples.indexOf(s)) === (sample.id ?? idx));
                          handleSampleChange(originalIdx >= 0 ? originalIdx : idx, 'descricao', e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
               ))}
            </div>
          </div>

        </div>

        {/* Footer com Ações */}
        <div className="p-4 sm:p-6 border-t border-border bg-muted/50 rounded-b-xl flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {onReset && (
              <Button variant="outline" onClick={() => setShowResetConfirm(true)} className="text-muted-foreground gap-2 w-full sm:w-auto">
                <RotateCcw size={16} /> Restaurar Original
              </Button>
            )}
            {evaluationId && onRequestReselectSamples && (
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10 w-full sm:w-auto"
                onClick={onRequestReselectSamples}
              >
                <RefreshCw size={16} />
                Re-selecionar Amostras
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
            <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto order-2 sm:order-1">Cancelar</Button>
            <Button onClick={() => onSave(formData)} className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto order-1 sm:order-2">
               <Save size={18} /> Salvar Alterações
            </Button>
          </div>
        </div>

        {/* Dialog de Confirmação para Restaurar */}
        {onReset && (
          <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restaurar dados originais?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá descartar todas as alterações personalizadas e restaurar os valores originais da avaliação. 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    setShowResetConfirm(false);
                    onReset();
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Restaurar Original
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

      </div>
    </div>
  );
}
