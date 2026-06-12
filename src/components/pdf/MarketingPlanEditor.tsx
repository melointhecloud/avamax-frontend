import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Target,
  Layers,
  Filter,
  Star,
  Activity,
  BarChart3,
  ChevronRight
} from 'lucide-react';

// Estrutura das seções de marketing para PDF de VENDA
const SALE_SECTIONS = [
  {
    id: 'introduction',
    label: 'Introdução e Objetivos',
    icon: Target,
    description: 'Apresentação do plano, objetivos estratégicos e metas de venda.',
  },
  {
    id: 'pillars',
    label: 'Pilares Estratégicos',
    icon: Layers,
    description: 'Precificação, conteúdo, experiência, publicidade, redes sociais e parcerias.',
    subItems: [
      { id: 'pricing', label: 'Precificação Inteligente' },
      { id: 'content', label: 'Conteúdo e Apresentação' },
      { id: 'experience', label: 'Experiência do Cliente' },
      { id: 'advertising', label: 'Publicidade Digital' },
      { id: 'social', label: 'Redes Sociais' },
      { id: 'partnerships', label: 'Parcerias Estratégicas' },
    ]
  },
  {
    id: 'funnel',
    label: 'Funil de Vendas',
    icon: Filter,
    description: 'Etapas do funil: estrutura, preparação, divulgação, conversão e acompanhamento.',
    subItems: [
      { id: 'structure', label: 'Estrutura e Segurança' },
      { id: 'preparation', label: 'Preparação e Apresentação' },
      { id: 'promotion', label: 'Divulgação Estratégica' },
      { id: 'conversion', label: 'Conversão' },
      { id: 'followup', label: 'Acompanhamento e Feedback' },
    ]
  },
  {
    id: 'benefits',
    label: 'Benefícios para o Proprietário',
    icon: Star,
    description: 'Vantagens exclusivas de trabalhar com assessoria profissional.',
  },
];

// Estrutura das seções de marketing para PDF de ALUGUEL
const RENTAL_SECTIONS = [
  {
    id: 'rentalFunnel',
    label: 'Funil de Locação',
    icon: Activity,
    description: 'Captação, divulgação, visitas, análise cadastral, aprovação, contrato e entrega.',
    subItems: [
      { id: 'capture', label: 'Captação e Preparação' },
      { id: 'promotion', label: 'Divulgação' },
      { id: 'visits', label: 'Visitas' },
      { id: 'analysis', label: 'Análise Cadastral' },
      { id: 'approval', label: 'Aprovação' },
      { id: 'contract', label: 'Contrato' },
      { id: 'handover', label: 'Entrega das Chaves' },
    ]
  },
  {
    id: 'indicators',
    label: 'Indicadores de Performance',
    icon: BarChart3,
    description: 'Tempo de locação, risco de vacância, competitividade e perfil do inquilino.',
  },
];

export interface MarketingPlanSettings {
  // Seções de Venda
  introduction?: { enabled: boolean };
  pillars?: { 
    enabled: boolean;
    items?: Record<string, boolean>;
  };
  funnel?: { 
    enabled: boolean;
    items?: Record<string, boolean>;
  };
  benefits?: { enabled: boolean };
  
  // Seções de Aluguel
  rentalFunnel?: { 
    enabled: boolean;
    items?: Record<string, boolean>;
  };
  indicators?: { enabled: boolean };
}

interface MarketingPlanEditorProps {
  settings: MarketingPlanSettings;
  onChange: (settings: MarketingPlanSettings) => void;
  isRental: boolean;
  disabled?: boolean;
}

export function MarketingPlanEditor({ 
  settings, 
  onChange, 
  isRental,
  disabled = false 
}: MarketingPlanEditorProps) {
  const sections = isRental ? RENTAL_SECTIONS : SALE_SECTIONS;

  const handleSectionToggle = (sectionId: string, enabled: boolean) => {
    onChange({
      ...settings,
      [sectionId]: {
        ...(settings[sectionId as keyof MarketingPlanSettings] as object || {}),
        enabled,
      }
    });
  };

  const handleSubItemToggle = (sectionId: string, itemId: string, enabled: boolean) => {
    const currentSection = settings[sectionId as keyof MarketingPlanSettings] as { enabled?: boolean; items?: Record<string, boolean> } || {};
    onChange({
      ...settings,
      [sectionId]: {
        ...currentSection,
        items: {
          ...(currentSection.items || {}),
          [itemId]: enabled,
        }
      }
    });
  };

  const isSectionEnabled = (sectionId: string): boolean => {
    const section = settings[sectionId as keyof MarketingPlanSettings] as { enabled?: boolean } | undefined;
    return section?.enabled !== false; // Default true
  };

  const isSubItemEnabled = (sectionId: string, itemId: string): boolean => {
    const section = settings[sectionId as keyof MarketingPlanSettings] as { items?: Record<string, boolean> } | undefined;
    return section?.items?.[itemId] !== false; // Default true
  };

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <p className="text-xs text-muted-foreground mb-4">
        Personalize quais seções do plano de marketing aparecem no PDF.
      </p>
      
      <Accordion type="multiple" className="w-full space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const enabled = isSectionEnabled(section.id);
          
          return (
            <AccordionItem 
              key={section.id} 
              value={section.id}
              className="border border-border rounded-lg bg-muted/30 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isRental ? 'bg-emerald-500/20' : 'bg-primary/20'
                }`}>
                  <Icon size={16} className={isRental ? 'text-emerald-500' : 'text-primary'} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">
                      {section.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => handleSectionToggle(section.id, checked)}
                  />
                  
                  {section.subItems && section.subItems.length > 0 && (
                    <AccordionTrigger className="p-0 hover:no-underline">
                      <ChevronRight size={16} className="text-muted-foreground transition-transform duration-200" />
                    </AccordionTrigger>
                  )}
                </div>
              </div>
              
              {section.subItems && section.subItems.length > 0 && (
                <AccordionContent className="px-4 pb-4 pt-0">
                  <p className="text-xs text-muted-foreground mb-3 pl-11">
                    {section.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pl-11">
                    {section.subItems.map((item) => {
                      const itemEnabled = enabled && isSubItemEnabled(section.id, item.id);
                      return (
                        <div 
                          key={item.id} 
                          className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${
                            itemEnabled 
                              ? 'bg-background border-border' 
                              : 'bg-muted/50 border-transparent'
                          } ${!enabled ? 'opacity-50' : ''}`}
                        >
                          <Checkbox
                            id={`${section.id}-${item.id}`}
                            checked={itemEnabled}
                            onCheckedChange={(checked) => 
                              handleSubItemToggle(section.id, item.id, checked as boolean)
                            }
                            disabled={!enabled}
                          />
                          <Label 
                            htmlFor={`${section.id}-${item.id}`}
                            className="text-xs cursor-pointer flex-1"
                          >
                            {item.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              )}
              
              {/* Se não tem subItems, mostra descrição inline */}
              {(!section.subItems || section.subItems.length === 0) && (
                <div className="px-4 pb-3 pt-0">
                  <p className="text-xs text-muted-foreground pl-11">
                    {section.description}
                  </p>
                </div>
              )}
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
