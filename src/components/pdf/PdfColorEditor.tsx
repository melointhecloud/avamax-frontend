import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Palette, RotateCcw, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Presets de cores para o PDF
// Default para PDFs de Venda (laranja)
export const PDF_DEFAULT_SALE_COLORS = {
  name: 'Clássico Venda',
  background: '#0A1628',
  backgroundGradientFrom: '#061224',
  backgroundGradientVia: '#0A1E3C',
  backgroundGradientTo: '#0D2847',
  primary: '#f97316', // orange-500
  primaryLight: '#fb923c', // orange-400
  secondary: '#3b82f6', // blue-500
  secondaryLight: '#60a5fa', // blue-400
  accent: '#10b981', // emerald-500
  text: '#ffffff',
  textMuted: '#94a3b8', // slate-400
  cardBackground: 'rgba(59, 130, 246, 0.1)', // blue-500/10
  cardBorder: 'rgba(96, 165, 250, 0.2)', // blue-400/20
};

// Default para PDFs de Aluguel (esmeralda)
export const PDF_DEFAULT_RENTAL_COLORS = {
  name: 'Clássico Aluguel',
  background: '#0A1628',
  backgroundGradientFrom: '#061224',
  backgroundGradientVia: '#0A1E3C',
  backgroundGradientTo: '#0D2847',
  primary: '#10b981', // emerald-500
  primaryLight: '#34d399', // emerald-400
  secondary: '#3b82f6', // blue-500
  secondaryLight: '#60a5fa', // blue-400
  accent: '#f97316', // orange-500
  text: '#ffffff',
  textMuted: '#94a3b8', // slate-400
  cardBackground: 'rgba(16, 185, 129, 0.1)', // emerald-500/10
  cardBorder: 'rgba(52, 211, 153, 0.2)', // emerald-400/20
};

export const PDF_COLOR_PRESETS = {
  default: PDF_DEFAULT_SALE_COLORS,
  darkElegant: {
    name: 'Elegante Escuro',
    background: '#0f0f0f',
    backgroundGradientFrom: '#0a0a0a',
    backgroundGradientVia: '#171717',
    backgroundGradientTo: '#1f1f1f',
    primary: '#d4af37', // gold
    primaryLight: '#f4d03f',
    secondary: '#6b7280', // gray-500
    secondaryLight: '#9ca3af',
    accent: '#d4af37',
    text: '#ffffff',
    textMuted: '#a1a1aa',
    cardBackground: 'rgba(212, 175, 55, 0.08)',
    cardBorder: 'rgba(212, 175, 55, 0.2)',
  },
  modernBlue: {
    name: 'Azul Moderno',
    background: '#0c1929',
    backgroundGradientFrom: '#0a1425',
    backgroundGradientVia: '#0e2240',
    backgroundGradientTo: '#132d52',
    primary: '#0ea5e9', // sky-500
    primaryLight: '#38bdf8',
    secondary: '#6366f1', // indigo-500
    secondaryLight: '#818cf8',
    accent: '#22d3ee', // cyan-400
    text: '#ffffff',
    textMuted: '#7dd3fc',
    cardBackground: 'rgba(14, 165, 233, 0.1)',
    cardBorder: 'rgba(56, 189, 248, 0.2)',
  },
  emerald: {
    name: 'Esmeralda Premium',
    background: '#0a1a14',
    backgroundGradientFrom: '#071510',
    backgroundGradientVia: '#0d261b',
    backgroundGradientTo: '#103526',
    primary: '#10b981', // emerald-500
    primaryLight: '#34d399',
    secondary: '#14b8a6', // teal-500
    secondaryLight: '#2dd4bf',
    accent: '#fbbf24', // amber-400
    text: '#ffffff',
    textMuted: '#6ee7b7',
    cardBackground: 'rgba(16, 185, 129, 0.1)',
    cardBorder: 'rgba(52, 211, 153, 0.2)',
  },
  corporate: {
    name: 'Corporativo',
    background: '#111827', // gray-900
    backgroundGradientFrom: '#0f172a',
    backgroundGradientVia: '#1e293b',
    backgroundGradientTo: '#334155',
    primary: '#dc2626', // red-600
    primaryLight: '#ef4444',
    secondary: '#475569', // slate-600
    secondaryLight: '#64748b',
    accent: '#fbbf24',
    text: '#ffffff',
    textMuted: '#cbd5e1',
    cardBackground: 'rgba(71, 85, 105, 0.2)',
    cardBorder: 'rgba(100, 116, 139, 0.3)',
  },
};

export type PdfColorPreset = keyof typeof PDF_COLOR_PRESETS;

export interface PdfColors {
  background: string;
  backgroundGradientFrom: string;
  backgroundGradientVia: string;
  backgroundGradientTo: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  text: string;
  textMuted: string;
  cardBackground: string;
  cardBorder: string;
}

interface PdfColorEditorProps {
  colors: PdfColors;
  onChange: (colors: PdfColors) => void;
  /** Tipo do relatório para restaurar o tema padrão correto */
  reportType?: 'venda' | 'aluguel';
}

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}> = ({ label, value, onChange, description }) => {
  // Extrai cor hex de valores rgba para o input color
  const getHexValue = (val: string): string => {
    if (val.startsWith('#')) return val.slice(0, 7);
    if (val.startsWith('rgba') || val.startsWith('rgb')) {
      return '#3b82f6'; // fallback para valores rgba
    }
    return val.slice(0, 7);
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={getHexValue(value)}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent appearance-none overflow-hidden"
            style={{ 
              padding: 0,
              WebkitAppearance: 'none',
            }}
          />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-10 text-xs font-mono"
          placeholder="#000000"
        />
      </div>
      {description && (
        <p className="text-[10px] text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export const PdfColorEditor: React.FC<PdfColorEditorProps> = ({ colors, onChange, reportType = 'venda' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handlePresetChange = (presetKey: PdfColorPreset) => {
    onChange(PDF_COLOR_PRESETS[presetKey]);
  };

  const handleColorChange = (key: keyof PdfColors, value: string) => {
    onChange({ ...colors, [key]: value });
  };

  // Restaura o tema padrão baseado no tipo de relatório (Venda ou Aluguel)
  const handleReset = () => {
    const defaultColors = reportType === 'aluguel' 
      ? PDF_DEFAULT_RENTAL_COLORS 
      : PDF_DEFAULT_SALE_COLORS;
    onChange(defaultColors);
    setShowResetConfirm(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="p-4 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 rounded-lg border border-purple-500/20 space-y-4">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Palette className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-left">
                <h5 className="font-medium text-purple-600 text-sm">Cores do PDF</h5>
                <p className="text-xs text-muted-foreground">Personalize o visual do documento</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mini preview das cores atuais */}
              <div className="hidden sm:flex items-center gap-1 mr-2">
                <div 
                  className="w-4 h-4 rounded-full border border-white/20" 
                  style={{ backgroundColor: colors.primary }}
                  title="Primária"
                />
                <div 
                  className="w-4 h-4 rounded-full border border-white/20" 
                  style={{ backgroundColor: colors.secondary }}
                  title="Secundária"
                />
                <div 
                  className="w-4 h-4 rounded-full border border-white/20" 
                  style={{ backgroundColor: colors.background }}
                  title="Fundo"
                />
              </div>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4">
          {/* Presets */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Temas Pré-definidos</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(PDF_COLOR_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetChange(key as PdfColorPreset)}
                  className={`
                    p-3 rounded-lg border text-left transition-all hover:scale-[1.02]
                    ${colors.primary === preset.primary && colors.background === preset.background
                      ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50'
                      : 'border-border hover:border-purple-500/50 bg-card'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-5 h-5 rounded-full border border-white/20" 
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div 
                      className="w-5 h-5 rounded-full border border-white/20" 
                      style={{ backgroundColor: preset.secondary }}
                    />
                    <div 
                      className="w-5 h-5 rounded-full border border-white/20" 
                      style={{ backgroundColor: preset.background }}
                    />
                  </div>
                  <span className="text-xs font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cores Principais */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Cores Principais</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ColorInput
                label="Cor Primária"
                value={colors.primary}
                onChange={(v) => handleColorChange('primary', v)}
                description="Destaque principal, botões"
              />
              <ColorInput
                label="Cor Secundária"
                value={colors.secondary}
                onChange={(v) => handleColorChange('secondary', v)}
                description="Cards, bordas, ícones"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg overflow-hidden border border-border">
            <div 
              className="p-4 space-y-3"
              style={{ 
                background: `linear-gradient(to bottom right, ${colors.backgroundGradientFrom}, ${colors.backgroundGradientVia}, ${colors.backgroundGradientTo})` 
              }}
            >
              <div className="flex items-center gap-2">
                <Eye size={14} style={{ color: colors.textMuted }} />
                <span className="text-xs" style={{ color: colors.textMuted }}>Pré-visualização</span>
              </div>
              
              <div 
                className="p-3 rounded-lg"
                style={{ 
                  backgroundColor: colors.cardBackground,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: colors.cardBorder
                }}
              >
                <p className="text-sm font-bold" style={{ color: colors.text }}>
                  Valor de Mercado
                </p>
                <p className="text-xl font-bold" style={{ color: colors.primary }}>
                  R$ 850.000
                </p>
                <p className="text-xs" style={{ color: colors.textMuted }}>
                  Análise de 12 imóveis
                </p>
              </div>
              
              <div className="flex gap-2">
                <div 
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: colors.primary, color: colors.text }}
                >
                  Apartamento
                </div>
                <div 
                  className="px-3 py-1.5 rounded-full text-xs font-medium border"
                  style={{ 
                    borderColor: colors.secondaryLight,
                    color: colors.secondaryLight 
                  }}
                >
                  150m²
                </div>
              </div>
            </div>
          </div>

          {/* Cores Avançadas */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <span>Cores Avançadas</span>
                {advancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ColorInput
                  label="Fundo Principal"
                  value={colors.background}
                  onChange={(v) => handleColorChange('background', v)}
                />
                <ColorInput
                  label="Cor de Destaque"
                  value={colors.accent}
                  onChange={(v) => handleColorChange('accent', v)}
                />
                <ColorInput
                  label="Texto Principal"
                  value={colors.text}
                  onChange={(v) => handleColorChange('text', v)}
                />
                <ColorInput
                  label="Texto Secundário"
                  value={colors.textMuted}
                  onChange={(v) => handleColorChange('textMuted', v)}
                />
                <ColorInput
                  label="Primária Clara"
                  value={colors.primaryLight}
                  onChange={(v) => handleColorChange('primaryLight', v)}
                />
                <ColorInput
                  label="Secundária Clara"
                  value={colors.secondaryLight}
                  onChange={(v) => handleColorChange('secondaryLight', v)}
                />
              </div>
              
              <div className="pt-2 border-t border-border">
                <Label className="text-xs text-muted-foreground mb-2 block">Gradiente de Fundo</Label>
                <div className="grid grid-cols-3 gap-2">
                  <ColorInput
                    label="Início"
                    value={colors.backgroundGradientFrom}
                    onChange={(v) => handleColorChange('backgroundGradientFrom', v)}
                  />
                  <ColorInput
                    label="Meio"
                    value={colors.backgroundGradientVia}
                    onChange={(v) => handleColorChange('backgroundGradientVia', v)}
                  />
                  <ColorInput
                    label="Fim"
                    value={colors.backgroundGradientTo}
                    onChange={(v) => handleColorChange('backgroundGradientTo', v)}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Reset Button */}
          <div className="pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw size={12} className="mr-1" />
              Restaurar padrão ({reportType === 'aluguel' ? 'Aluguel' : 'Venda'})
            </Button>
          </div>
        </CollapsibleContent>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar cores padrão?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao restaurar, todas as suas personalizações de cores serão perdidas e o tema{' '}
              <strong>{reportType === 'aluguel' ? 'Aluguel (Esmeralda)' : 'Venda (Laranja)'}</strong>{' '}
              será aplicado. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Collapsible>
  );
};

export default PdfColorEditor;
