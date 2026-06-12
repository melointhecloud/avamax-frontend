import React from 'react';
import avaluzLogo from '@/assets/avaluz-logo-transparent.png';
import propertyPlaceholder from '@/assets/property-placeholder.jpg';
import { PriceComparisonChart } from './components/PriceComparisonChart';
import { getImageUrlForPdf, getCoverPhotoForPdf } from '@/lib/pdfImages';
import { PdfThemeStyles } from '@/components/pdf/PdfThemeStyles';
import {
   Building2,
   MapPin,
   TrendingUp,
   TrendingDown,
   CheckCircle2,
   AlertTriangle,
   Brain,
   Zap,
   Target,
   Clock,
   Shield,
   BarChart3,
   ArrowRight,
   Sparkles,
   Database,
   LineChart,
   Filter,
   Calculator,
   ChevronRight,
   BedDouble,
   Bath,
   Car,
   Ruler,
   User,
   Users,
   Mail,
   Award,
   Phone,
   Home,
   AlertCircle,
   Layers,
   Activity,
   Eye,
   DollarSign,
   Star,
   ExternalLink,
   FileText,
   Sofa,
   Scale,
   ThumbsUp,
   Palette,
   Wrench,
   Trees
} from 'lucide-react';

// --- Interfaces ---

interface ClientData {
   nome: string;
   email?: string;
   telefone?: string;
}

interface PropertyData {
   id: number;
   rua: string | null;
   bairro: string;
   municipio: string;
   estado: string;
   area: number;
   quartos: number;
   banheiros?: number;
   suites?: number;
   vagas: number | null;
   valor_atual: number;
   tipo: string;
   foto_capa?: string | null;
   descricao?: string | null;
   // Dados extras do formulário
   cep?: string;
   condominio?: number;
   iptu?: number;
   aVenda?: boolean;
   linkVenda?: string;
   mobiliado?: string;
   situacaoLegal?: string[];
   locaisProximos?: string;
   // Avaliações (1-5)
   avaliacaoTecnica?: number;
   localizacao?: number;
   planta?: number;
   acabamentos?: number;
   conservacao?: number;
   areasComuns?: number;
   // Features selecionadas
   features?: string[];
   // Especificações do tipo
   especificacoes?: {
      tipo?: string;
      checklist?: Record<string, boolean>;
      detalhes?: Record<string, string | number | null>;
   };
}

interface SimilarProperty {
  id: number;
  titulo: string;
  categoria?: string;
  descricao: string;
  valor: number;
  area: number;
  quartos: number;
  suites?: number;
  banheiros: number;
  vagas: number;
  imagem: string;
  imagens?: string[]; // Múltiplas imagens (até 4)
  status: 'ativo' | 'vendido';
  link?: string;
  // Dados de localização
  rua?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  estado?: string | null;
}

interface BrokerData {
   nome: string | null;
   email: string | null;
   creci: string | null;
   avatar_url: string | null;
   imobiliaria?: string | null;
   telefone?: string | null;
   logo_imobiliaria_url?: string | null;
   signature_url?: string | null;
   // Custom overrides for PDF
   telefone_custom?: string | null;
   email_custom?: string | null;
}

interface MarketData {
   valor_estimado: number;
   confianca: number;
   amostras: number;
   minimo: number;
   medio: number;
   maximo: number;
   similares: SimilarProperty[];
}

interface MarketingPlanSettings {
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
   rentalFunnel?: { 
      enabled: boolean;
      items?: Record<string, boolean>;
   };
   indicators?: { enabled: boolean };
}

interface PdfColors {
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

const DEFAULT_COLORS: PdfColors = {
   background: '#0A1628',
   backgroundGradientFrom: '#061224',
   backgroundGradientVia: '#0A1E3C',
   backgroundGradientTo: '#0D2847',
   primary: '#f97316',
   primaryLight: '#fb923c',
   secondary: '#3b82f6',
   secondaryLight: '#60a5fa',
   accent: '#10b981',
   text: '#ffffff',
   textMuted: '#94a3b8',
   cardBackground: 'rgba(59, 130, 246, 0.1)',
   cardBorder: 'rgba(96, 165, 250, 0.2)',
};

interface PdfSettings {
   showMinimo?: boolean;
   showMaximo?: boolean;
   showMarketingPlan?: boolean;
   marketingPlan?: MarketingPlanSettings;
   // Client visibility settings
   showClient?: boolean;
   showClientEmail?: boolean;
   showClientPhone?: boolean;
   // Broker contact settings
   showBrokerContact?: boolean;
   // Custom colors
   pdfColors?: PdfColors;
}

interface ReportProps {
   clientName: string;
   client?: ClientData;
   property: PropertyData;
   market: MarketData;
   broker?: BrokerData;
   settings?: PdfSettings;
}

// --- Componente Principal ---
export const AvaluzReport: React.FC<ReportProps> = ({
   clientName = "Cliente Avaluz",
   client,
   property,
   market,
   broker,
   settings = { showMinimo: true, showMaximo: true }
}) => {

   // Cores do PDF (usa customizadas ou padrão)
   const c = settings.pdfColors || DEFAULT_COLORS;
   
   // Classes e estilos centralizados para todas as páginas
   const pageClass = "w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break";
   const pageStyle = { background: `linear-gradient(to bottom right, ${c.backgroundGradientFrom}, ${c.backgroundGradientVia}, ${c.backgroundGradientTo})` };
   const showMinimo = settings.showMinimo !== false;
   const showMaximo = settings.showMaximo !== false;
   const showMinMax = showMinimo || showMaximo;
   const showMarketing = settings.showMarketingPlan !== false;
   
   // Configurações de exibição do cliente
   const showClient = settings.showClient !== false;
   const showClientEmail = settings.showClientEmail !== false;
   const showClientPhone = settings.showClientPhone !== false;
   
   // Configurações de exibição do contato do corretor
   const showBrokerContact = settings.showBrokerContact !== false;
   
   // Configurações granulares do plano de marketing
   const mp = settings.marketingPlan || {};
   const showIntroduction = showMarketing && mp.introduction?.enabled !== false;
   const showPillars = showMarketing && mp.pillars?.enabled !== false;
   const showFunnel = showMarketing && mp.funnel?.enabled !== false;
   const showBenefits = showMarketing && mp.benefits?.enabled !== false;

   // Broker contact values (use custom if provided, fallback to profile)
   const brokerPhone = broker?.telefone_custom || broker?.telefone;
   const brokerEmail = broker?.email_custom || broker?.email;

   const fmtMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
   const fmtM2 = (val: number, area: number) => area > 0 ? fmtMoney(val / area) + "/m²" : "-";
   const fmtM2Simple = (val: number, area: number) => area > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val / area) : "-";

   const diferenca = property.valor_atual - market.valor_estimado;
   const percentual = market.valor_estimado > 0 ? (diferenca / market.valor_estimado) * 100 : 0;

   // Formatar confiança para exibição (0.99 -> 99%)
   const confiancaDisplay = market.confianca < 1 ? Math.round(market.confianca * 100) : Math.round(market.confianca);

   // Calcular posição no slider (0-100%)
   const sliderPosition = (() => {
      const range = market.maximo - market.minimo;
      if (range <= 0) return 50;
      const position = ((market.valor_estimado - market.minimo) / range) * 100;
      return Math.max(0, Math.min(100, position));
   })();

   // Todas as amostras disponíveis
   const allSamples = market.similares;
   
   // Amostras por página na tabela comparativa (máximo 6 por página)
   const SAMPLES_PER_TABLE_PAGE = 6;
   
   // Dividir amostras em chunks para paginação da tabela comparativa
   const tableChunks: typeof allSamples[] = [];
   for (let i = 0; i < allSamples.length; i += SAMPLES_PER_TABLE_PAGE) {
      tableChunks.push(allSamples.slice(i, i + SAMPLES_PER_TABLE_PAGE));
   }
   
   // Para páginas de amostras individuais, limitamos a 6
   const samplesToShow = allSamples.slice(0, 6);

   // Cálculo dinâmico de páginas de marketing
   // Introdução = 1 pág, Pilares = 2 pág, Funil = 1 pág, Benefícios = 1 pág
   const marketingPageCount = showMarketing 
      ? (showIntroduction ? 1 : 0) + (showPillars ? 2 : 0) + (showFunnel ? 1 : 0) + (showBenefits ? 1 : 0)
      : 0;
   
   // Páginas da tabela comparativa (pode ser mais de 1 se tiver muitas amostras)
   const tablePages = tableChunks.length || 1;
   
   const basePages = 5 + marketingPageCount + tablePages; // 5 = capa + metodologia + imóvel + diagnóstico + conclusão, + tablePages
   const samplePages = samplesToShow.length;
   const totalPages = basePages + samplePages;

   // Verificar se temos dados do cliente
   const hasClientData = client?.nome || clientName !== "Cliente Avaluz";
   const displayClientName = client?.nome || clientName;

   // Helper para renderizar rating
   const renderRating = (value?: number, label?: string) => {
      if (!value) return null;
      const stars = [];
      for (let i = 1; i <= 5; i++) {
         stars.push(
            <Star 
               key={i} 
               size={10} 
               style={{ color: i <= value ? c.primaryLight : c.textMuted, fill: i <= value ? c.primaryLight : 'transparent' }} 
            />
         );
      }
      return (
         <div className="flex items-center gap-1">
            {label && <span style={{ color: c.textMuted }} className="text-[10px] mr-1">{label}:</span>}
            <div className="flex gap-0.5">{stars}</div>
         </div>
      );
   };

   // Mapear mobiliado
   const getMobiliadoLabel = (val?: string) => {
      switch(val) {
         case 'mobiliado': return 'Mobiliado';
         case 'semi_mobiliado': return 'Semi-mobiliado';
         case 'nao_mobiliado': return 'Não mobiliado';
         default: return null;
      }
   };

   // Mapear situação legal
   const getSituacaoLegalLabels = (arr?: string[]) => {
      if (!arr || arr.length === 0) return null;
      const map: Record<string, string> = {
         'escriturado': 'Escriturado',
         'registrado': 'Registrado',
         'com_habite_se': 'Com Habite-se',
         'direito_possessorio': 'Direito Possessório'
      };
      return arr.map(s => map[s] || s).join(', ');
   };

   // CSS variables para as cores customizáveis
   const colorVars = {
      '--pdf-bg': c.background,
      '--pdf-bg-from': c.backgroundGradientFrom,
      '--pdf-bg-via': c.backgroundGradientVia,
      '--pdf-bg-to': c.backgroundGradientTo,
      '--pdf-primary': c.primary,
      '--pdf-primary-light': c.primaryLight,
      '--pdf-secondary': c.secondary,
      '--pdf-secondary-light': c.secondaryLight,
      '--pdf-accent': c.accent,
      '--pdf-text': c.text,
      '--pdf-text-muted': c.textMuted,
      '--pdf-card-bg': c.cardBackground,
      '--pdf-card-border': c.cardBorder,
   } as React.CSSProperties;

   return (
      <div 
         className="w-full py-10 font-inter flex flex-col items-center gap-8 print:p-0 print:gap-0 pdf-theme"
         style={{ 
            ...colorVars,
            backgroundColor: c.background, 
            color: c.text 
         }}
      >
         <PdfThemeStyles colors={c} />

         {/* =================================================================================
          PÁGINA 1: CAPA - IMÓVEL E CORRETOR EM DESTAQUE (SEM CARD DE VALOR)
      ================================================================================= */}
         <div 
            className="w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break"
            style={{ background: `linear-gradient(to bottom right, ${c.backgroundGradientFrom}, ${c.backgroundGradientVia}, ${c.backgroundGradientTo})` }}
         >
            
            {/* Background Effects - Dynamic Colors */}
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}33 0%, ${c.secondary}1a 50%, transparent 100%)` }}></div>
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}26 0%, transparent 100%)` }}></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondaryLight}0d 0%, transparent 100%)` }}></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
               backgroundImage: `linear-gradient(${c.secondary}4d 1px, transparent 1px), linear-gradient(90deg, ${c.secondary}4d 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
            }}></div>

            {/* Header with Logo */}
            <header className="relative z-10 p-8 flex justify-between items-start">
               <div className="flex items-center gap-3">
                  <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
               </div>
               <div className="flex items-center gap-4">
                   <div className="text-right">
                      <p className="text-xs" style={{ color: `${c.secondaryLight}b3` }}>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      <p className="text-[10px]" style={{ color: `${c.secondaryLight}80` }}>ID: AVL-{property.id.toString().padStart(6, '0')}</p>
                   </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col px-10">
               
               {/* Title Section */}
               <div className="mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4" style={{ backgroundColor: `${c.primary}1a`, borderWidth: 1, borderStyle: 'solid', borderColor: `${c.primary}4d` }}>
                     <Star size={14} style={{ color: c.primaryLight }} />
                     <span className="text-xs tracking-wide font-medium" style={{ color: `${c.primaryLight}cc` }}>Estudo de Mercado Profissional</span>
                  </div>
                  <h1 className="font-inter font-bold text-3xl leading-tight mb-3 break-words">
                     <span style={{ color: c.text }}>Avaliação Estratégica</span><br />
                     <span style={{ color: c.primary }}>de Valor de Mercado</span>
                  </h1>
                  <p className="text-sm max-w-[400px] break-words" style={{ color: `${c.secondaryLight}99` }}>
                     Método Comparativo Direto • Análise de {market.amostras} Imóveis
                  </p>
               </div>

               {/* Property Photo - Hero */}
               <div className="relative rounded-2xl overflow-hidden mb-4 h-[280px] w-full flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${c.secondary}80, ${c.background}cc)` }}>
                  {/* Background image or placeholder */}
                  {getCoverPhotoForPdf(property.foto_capa) ? (
                     <div
                        className="absolute inset-0"
                        style={{
                           backgroundImage: `url("${getCoverPhotoForPdf(property.foto_capa)}")`,
                           backgroundSize: 'cover',
                           backgroundPosition: 'center',
                           backgroundRepeat: 'no-repeat',
                        }}
                     />
                  ) : (
                     <div className="absolute inset-0 w-full h-full">
                        <img src={propertyPlaceholder} alt="" className="w-full h-full object-cover opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Building2 size={80} style={{ color: `${c.secondary}80` }} />
                        </div>
                     </div>
                  )}

                  <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to top, ${c.backgroundGradientFrom}, transparent, transparent)` }}></div>

                  {/* Property Type Badge */}
                  <div className="absolute top-5 left-4">
                     <div className="inline-flex items-center gap-2 rounded-full px-4 py-2" style={{ backgroundColor: `${c.primary}e6` }}>
                        <span className="text-xs font-medium uppercase whitespace-nowrap leading-tight" style={{ color: c.text }}>{property.tipo}</span>
                     </div>
                  </div>
               </div>

               {/* Property Details Grid */}
               <div className="grid grid-cols-5 gap-2 mb-4">
                  <div className="backdrop-blur rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, borderWidth: 1, borderStyle: 'solid', borderColor: c.cardBorder }}>
                     <p className="font-bold text-xl" style={{ color: c.text }}>{property.area}</p>
                     <p className="text-xs uppercase" style={{ color: `${c.secondaryLight}99` }}>m² úteis</p>
                  </div>
                  <div className="backdrop-blur rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, borderWidth: 1, borderStyle: 'solid', borderColor: c.cardBorder }}>
                     <p className="font-bold text-xl" style={{ color: c.text }}>{property.quartos}</p>
                     <p className="text-xs uppercase" style={{ color: `${c.secondaryLight}99` }}>Quartos</p>
                  </div>
                  <div className="backdrop-blur rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, borderWidth: 1, borderStyle: 'solid', borderColor: c.cardBorder }}>
                     <p className="font-bold text-xl" style={{ color: c.text }}>{property.banheiros || '-'}</p>
                     <p className="text-xs uppercase" style={{ color: `${c.secondaryLight}99` }}>Banheiros</p>
                  </div>
                  <div className="backdrop-blur rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, borderWidth: 1, borderStyle: 'solid', borderColor: c.cardBorder }}>
                     <p className="font-bold text-xl" style={{ color: c.text }}>{property.suites || '-'}</p>
                     <p className="text-xs uppercase" style={{ color: `${c.secondaryLight}99` }}>Suítes</p>
                  </div>
                  <div className="backdrop-blur rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, borderWidth: 1, borderStyle: 'solid', borderColor: c.cardBorder }}>
                     <p className="font-bold text-xl" style={{ color: c.text }}>{property.vagas || '-'}</p>
                     <p className="text-xs uppercase" style={{ color: `${c.secondaryLight}99` }}>Vagas</p>
                  </div>
               </div>

               {/* Location + Client Row */}
               <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Location */}
                  <div className="backdrop-blur rounded-xl p-4" style={{ backgroundColor: c.cardBackground, borderWidth: 1, borderStyle: 'solid', borderColor: c.cardBorder }}>
                     <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.primary}33` }}>
                           <MapPin size={20} style={{ color: c.primaryLight }} />
                        </div>
                        <div className="min-w-0 flex-1">
                           <p className="font-medium text-base truncate" style={{ color: c.text }}>{property.rua || property.bairro}</p>
                           <p className="text-sm truncate" style={{ color: `${c.secondaryLight}99` }}>{property.bairro}, {property.municipio} - {property.estado}</p>
                        </div>
                     </div>
                  </div>

                  {/* Prepared For - Client */}
                  {showClient && (
                     <div className="rounded-xl p-4" style={{ background: `linear-gradient(to right, ${c.secondary}26, ${c.secondary}1a)`, borderWidth: 1, borderStyle: 'solid', borderColor: `${c.secondaryLight}4d` }}>
                     <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.secondary}33` }}>
                           <User size={20} style={{ color: c.secondaryLight }} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[11px] uppercase tracking-[0.15em] mb-1" style={{ color: c.secondaryLight }}>Preparado para</p>
                           {hasClientData ? (
                           <>
                                 <p className="font-semibold text-base truncate" style={{ color: c.text }}>{displayClientName}</p>
                              </>
                           ) : (
                              <p className="italic text-sm" style={{ color: `${c.secondaryLight}99` }}>Cliente não informado</p>
                           )}
                        </div>
                     </div>
                     </div>
                  )}
               </div>

               {/* Broker/Agency Card - Full Width Below */}
               {broker && (
                  <div className="rounded-2xl p-6 shadow-lg" style={{ background: `linear-gradient(to bottom right, ${c.primary}33, ${c.primary}1a)`, borderWidth: 2, borderStyle: 'solid', borderColor: `${c.primary}66`, boxShadow: `0 10px 15px -3px ${c.primary}1a` }}>
                     <div className="flex gap-8 items-center">
                        {/* Agency Column */}
                        <div className="flex-1 flex items-center gap-5 min-w-0">
                           <div className="w-28 h-28 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ backgroundColor: `${c.text}1a`, borderColor: `${c.primaryLight}80`, boxShadow: `0 10px 15px -3px ${c.primary}33` }}>
                              {broker.logo_imobiliaria_url ? (
                                 <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${c.primary}33` }}>
                                    <Building2 size={40} style={{ color: c.primaryLight }} />
                                 </div>
                              )}
                           </div>
                           <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-[0.15em] mb-1" style={{ color: c.primaryLight }}>Imobiliária</p>
                              <h3 className="font-bold text-lg leading-tight truncate" style={{ color: c.text }}>{broker.imobiliaria || 'Imobiliária'}</h3>
                           </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-20" style={{ backgroundColor: `${c.primaryLight}4d` }} />

                        {/* Broker Column */}
                        <div className="flex-1 flex items-center gap-5 min-w-0">
                           <div className="w-28 h-28 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}33)`, borderColor: `${c.primary}80`, boxShadow: `0 10px 15px -3px ${c.primary}33` }}>
                              {broker.avatar_url ? (
                                 <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center">
                                    <User size={40} style={{ color: c.primaryLight }} />
                                 </div>
                              )}
                           </div>
                           <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-[0.15em] mb-1" style={{ color: c.primaryLight }}>Corretor</p>
                              <h3 className="font-bold text-lg leading-tight truncate" style={{ color: c.text }}>{broker.nome || 'Especialista'}</h3>
                              {broker.creci && (
                                 <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: `${c.secondaryLight}b3` }}>
                                    <Award size={11} style={{ color: c.primaryLight }} className="flex-shrink-0" />
                                    <span className="truncate">CRECI {broker.creci}</span>
                                 </p>
                              )}
                              {showBrokerContact && (brokerPhone || brokerEmail) && (
                                 <div className="mt-1.5 space-y-0.5">
                                    {brokerPhone && (
                                       <p className="text-xs flex items-center gap-1.5" style={{ color: `${c.text}b3` }}>
                                          <Phone size={10} style={{ color: c.primaryLight }} className="flex-shrink-0" />
                                          <span className="truncate">{brokerPhone}</span>
                                       </p>
                                    )}
                                    {brokerEmail && (
                                       <p className="text-xs flex items-center gap-1.5" style={{ color: `${c.text}b3` }}>
                                          <Mail size={10} style={{ color: c.primaryLight }} className="flex-shrink-0" />
                                          <span className="truncate max-w-[180px]">{brokerEmail}</span>
                                       </p>
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>


            {/* Footer */}
            <footer className="relative z-10 px-10 pb-6 flex justify-between items-center pt-4" style={{ borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: `${c.secondaryLight}1a` }}>
               <div className="flex items-center gap-2 flex-wrap text-[10px]" style={{ color: `${c.secondaryLight}80` }}>
                  <span className="px-2 py-0.5 rounded-full font-medium whitespace-nowrap" style={{ backgroundColor: `${c.primary}33`, color: c.primaryLight }}>CONFIDENCIAL</span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                     <Database size={12} style={{ color: c.primaryLight }} className="flex-shrink-0" />
                     {market.amostras} imóveis analisados
                  </span>
               </div>
               <p className="text-xs whitespace-nowrap" style={{ color: `${c.secondaryLight}66` }}>01 / {totalPages}</p>
            </footer>
         </div>

         {/* =================================================================================
          PÁGINA 2: METODOLOGIA - CONTEXTO DO NEGÓCIO
      ================================================================================= */}
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent, transparent)` }}></div>
               <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}14, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-10 border-b border-blue-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <Brain size={16} className="text-orange-400" />
                     </div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase">Processo Técnico</p>
                  </div>
                  <h2 className="text-white font-bold text-3xl">
                     Metodologia da Avaliação
                  </h2>
               </div>
                <div className="flex items-center gap-3">
                   {broker?.logo_imobiliaria_url && (
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30 flex-shrink-0">
                         <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                      </div>
                   )}
                   {broker?.avatar_url && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                         <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                      </div>
                   )}
                   <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
                </div>
            </header>

            <div className="relative z-10 p-10 flex-1">
               
               <p className="text-blue-200/60 text-sm mb-8 max-w-[600px]">
                  Nossa metodologia combina inteligência de dados e expertise imobiliária, 
                  fornecendo ao corretor uma ferramenta poderosa para embasar suas recomendações.
               </p>

               {/* Steps */}
               <div className="space-y-4 mb-8">
                  
                  {[
                     { icon: Database, title: "Coleta de Dados de Mercado", desc: "Capturamos milhares de anúncios e dados de transações reais na região do imóvel." },
                     { icon: Filter, title: "Seleção de Comparáveis", desc: "Algoritmos identificam imóveis verdadeiramente comparáveis por tipologia, localização e características." },
                     { icon: Activity, title: "Análise Estatística", desc: "Aplicamos métodos estatísticos para determinar a faixa de valor mais provável de mercado." },
                     { icon: BarChart3, title: "Validação Comparativa", desc: "Cada amostra é analisada individualmente para garantir a consistência da avaliação." },
                     { icon: Calculator, title: "Resultado Final", desc: "O valor é apresentado com nível de confiança baseado na qualidade e quantidade das amostras." }
                  ].map((step, index) => (
                     <div key={index} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/20 flex items-center justify-center">
                              <step.icon size={22} className="text-orange-400" />
                           </div>
                           {index < 4 && (
                              <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500/30 to-transparent mt-2"></div>
                           )}
                        </div>
                        <div className="flex-1 pt-1">
                           <div className="flex items-center gap-3 mb-1">
                              <span className="text-orange-500/60 text-xs font-medium">0{index + 1}</span>
                              <h3 className="text-white font-semibold">{step.title}</h3>
                           </div>
                           <p className="text-blue-200/60 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                     </div>
                  ))}

               </div>

            </div>

            <footer className="relative z-10 p-10 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/40 text-xs">Avaluz • Estudo de Mercado</p>
               <p className="text-blue-400/40 text-xs">02 / {totalPages}</p>
            </footer>
         </div>

         {/* =================================================================================
          PÁGINAS DE MARKETING (CONDICIONAIS)
      ================================================================================= */}
         {showMarketing && (
         <>
         {/* Introdução - Página de Marketing 1 */}
         {showIntroduction && (
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent, transparent)` }}></div>
               <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}14, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-blue-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <Sparkles size={16} className="text-orange-400" />
                     </div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase">Estratégia Personalizada</p>
                  </div>
                  <h2 className="text-white font-bold text-3xl">
                     Plano de Marketing Imobiliário
                  </h2>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30 flex-shrink-0">
                        <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                        <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
               </div>
            </header>

            <div className="relative z-10 p-8 flex-1 flex flex-col">
               
               {/* Texto de Abertura */}
               <div className="bg-gradient-to-r from-orange-500/15 to-orange-600/10 border border-orange-500/30 rounded-2xl p-6 mb-6">
                  <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                     <FileText size={18} className="text-orange-400" />
                     O que é este Plano de Marketing?
                  </h3>
                  <p className="text-blue-100/80 text-sm leading-relaxed mb-3">
                     Este documento apresenta uma <span className="text-orange-400 font-semibold">estratégia estruturada e personalizada</span> para 
                     a comercialização do seu imóvel, desenvolvida com base nas melhores práticas do mercado imobiliário 
                     nacional e internacional.
                  </p>
                  <p className="text-blue-100/70 text-sm leading-relaxed">
                     Diferente de abordagens genéricas, este plano foi criado considerando as características específicas 
                     do seu imóvel, o perfil de compradores da região e as dinâmicas atuais do mercado em <span className="text-white font-medium">{property.bairro}, {property.municipio}</span>.
                  </p>
               </div>

               {/* Objetivo do Plano */}
               <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6 mb-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                     <Target size={18} className="text-blue-400" />
                     Objetivo Estratégico
                  </h3>
                  <p className="text-blue-100/80 text-sm leading-relaxed mb-4">
                     O objetivo central deste plano é <span className="text-orange-400 font-semibold">maximizar o valor percebido do imóvel</span>, 
                     <span className="text-orange-400 font-semibold"> reduzir o tempo de venda</span> e 
                     <span className="text-orange-400 font-semibold"> gerar segurança</span> em todo o processo de comercialização.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3">
                     <div className="bg-blue-950/50 rounded-xl p-3 text-center">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                           <TrendingUp size={18} className="text-green-400" />
                        </div>
                        <p className="text-white font-semibold text-xs mb-1">Posicionamento Correto</p>
                        <p className="text-blue-300/60 text-[10px]">Preço alinhado com o mercado atual</p>
                     </div>
                     <div className="bg-blue-950/50 rounded-xl p-3 text-center">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
                           <Shield size={18} className="text-orange-400" />
                        </div>
                        <p className="text-white font-semibold text-xs mb-1">Preservação de Valor</p>
                        <p className="text-blue-300/60 text-[10px]">Evitar desvalorização por tempo</p>
                     </div>
                     <div className="bg-blue-950/50 rounded-xl p-3 text-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                           <User size={18} className="text-blue-400" />
                        </div>
                        <p className="text-white font-semibold text-xs mb-1">Demanda Qualificada</p>
                        <p className="text-blue-300/60 text-[10px]">Atrair compradores com perfil ideal</p>
                     </div>
                  </div>
               </div>

               {/* Quote motivacional */}
               <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-400/20 rounded-xl p-4 text-center mt-auto">
                  <p className="text-blue-100/70 text-sm italic">
                     "Um imóvel bem posicionado e bem apresentado não vende por sorte — vende por estratégia."
                  </p>
               </div>

            </div>

            <footer className="relative z-10 p-8 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/40 text-xs">Avaluz • Plano de Marketing</p>
               <p className="text-blue-400/40 text-xs">{String(3).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>
         )}

         {/* Pilares Estratégicos - Páginas de Marketing 2 e 3 */}
         {showPillars && (
         <>
         {/* Página 4: Pilares Estratégicos (Parte 1) */}
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent, transparent)` }}></div>
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}14, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-blue-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <Layers size={16} className="text-orange-400" />
                     </div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase">Fundamentos</p>
                  </div>
                  <h2 className="text-white font-bold text-2xl">
                     Pilares Estratégicos
                  </h2>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30 flex-shrink-0">
                        <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                        <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
               </div>
            </header>

            <div className="relative z-10 p-8 flex-1 flex flex-col gap-4">
               
               {/* Pilar 1: Assessoria Jurídica */}
               <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center flex-shrink-0">
                        <Scale size={24} className="text-green-400" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-green-500/20 text-green-400 text-[9px] font-bold px-2 py-0.5 rounded-full">01</span>
                           <h4 className="text-white font-bold text-base">Precificação Inteligente</h4>
                        </div>
                        <p className="text-blue-100/70 text-sm leading-relaxed mb-3">
                           A precificação correta é o fundamento de qualquer venda bem-sucedida. Utilizamos 
                           análise de dados de mercado para posicionar o imóvel de forma competitiva.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-green-400" />
                              <span>Análise de comparativos</span>
                           </div>
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-green-400" />
                              <span>Faixas de preço estratégicas</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Pilar 2: Conteúdo e Apresentação */}
               <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                        <Palette size={24} className="text-purple-400" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-purple-500/20 text-purple-400 text-[9px] font-bold px-2 py-0.5 rounded-full">02</span>
                           <h4 className="text-white font-bold text-base">Conteúdo e Apresentação</h4>
                        </div>
                        <p className="text-blue-100/70 text-sm leading-relaxed mb-3">
                           A primeira impressão é decisiva. Investimos em produção visual de alto padrão 
                           e narrativa que destaca os diferenciais do imóvel.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-purple-400" />
                              <span>Fotos e vídeos profissionais</span>
                           </div>
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-purple-400" />
                              <span>Tour virtual 360°</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Pilar 3: Experiência do Cliente */}
               <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                        <Users size={24} className="text-blue-400" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-blue-500/20 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-full">03</span>
                           <h4 className="text-white font-bold text-base">Experiência do Cliente</h4>
                        </div>
                        <p className="text-blue-100/70 text-sm leading-relaxed mb-3">
                           Cada interação com o comprador é uma oportunidade de encantar. Criamos 
                           experiências memoráveis em todas as etapas do processo.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-blue-400" />
                              <span>Visitas personalizadas</span>
                           </div>
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-blue-400" />
                              <span>Atendimento consultivo</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

            </div>

            <footer className="relative z-10 p-8 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/40 text-xs">Avaluz • Plano de Marketing</p>
               <p className="text-blue-400/40 text-xs">{String(4).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>

         {/* =================================================================================
          PÁGINA 5: MARKETING 3 - PILARES ESTRATÉGICOS (PARTE 2)
      ================================================================================= */}
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent, transparent)` }}></div>
               <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}14, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-blue-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <Layers size={16} className="text-orange-400" />
                     </div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase">Fundamentos</p>
                  </div>
                  <h2 className="text-white font-bold text-2xl">
                     Pilares Estratégicos
                  </h2>
               </div>
               <img src={avaluzLogo} alt="Avaluz" className="h-8 w-auto opacity-60" />
            </header>

            <div className="relative z-10 p-8 flex-1 flex flex-col gap-4">
               
               {/* Pilar 4: Publicidade Digital */}
               <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center flex-shrink-0">
                        <Target size={24} className="text-orange-400" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-orange-500/20 text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-full">04</span>
                           <h4 className="text-white font-bold text-base">Publicidade Digital Segmentada</h4>
                        </div>
                        <p className="text-blue-100/70 text-sm leading-relaxed mb-3">
                           Campanhas estratégicas para alcançar compradores qualificados nos canais 
                           mais efetivos para o perfil do imóvel.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-orange-400" />
                              <span>Google Ads e Meta Ads</span>
                           </div>
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-orange-400" />
                              <span>Retargeting inteligente</span>
                           </div>
                        </div>
                        <div className="mt-3 bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                           <p className="text-orange-400 text-[10px] font-medium">
                              IMPACTO: Alcançar compradores certos, no momento certo, com a mensagem certa.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Pilar 5: Redes Sociais */}
               <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center flex-shrink-0">
                        <Eye size={24} className="text-pink-400" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-pink-500/20 text-pink-400 text-[9px] font-bold px-2 py-0.5 rounded-full">05</span>
                           <h4 className="text-white font-bold text-base">Redes Sociais e Engajamento</h4>
                        </div>
                        <p className="text-blue-100/70 text-sm leading-relaxed mb-3">
                           Presença estratégica nas principais redes sociais para ampliar 
                           a visibilidade e gerar interesse orgânico.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-pink-400" />
                              <span>Instagram e Facebook</span>
                           </div>
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-pink-400" />
                              <span>Stories e Reels</span>
                           </div>
                        </div>
                        <div className="mt-3 bg-pink-500/10 border border-pink-500/20 rounded-lg p-2">
                           <p className="text-pink-400 text-[10px] font-medium">
                              IMPACTO: Visibilidade massiva e engajamento com potenciais compradores.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Pilar 6: Parcerias */}
               <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center flex-shrink-0">
                        <Users size={24} className="text-teal-400" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-teal-500/20 text-teal-400 text-[9px] font-bold px-2 py-0.5 rounded-full">06</span>
                           <h4 className="text-white font-bold text-base">Parcerias Estratégicas</h4>
                        </div>
                        <p className="text-blue-100/70 text-sm leading-relaxed mb-3">
                           Rede de parceiros e corretores para ampliar o alcance e acelerar 
                           a comercialização do imóvel.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-teal-400" />
                              <span>Rede de corretores parceiros</span>
                           </div>
                           <div className="flex items-center gap-2 text-[11px] text-blue-100/60">
                              <CheckCircle2 size={12} className="text-teal-400" />
                              <span>Parcerias com imobiliárias</span>
                           </div>
                        </div>
                        <div className="mt-3 bg-teal-500/10 border border-teal-500/20 rounded-lg p-2">
                           <p className="text-teal-400 text-[10px] font-medium">
                              IMPACTO: Multiplicar a exposição e acelerar o processo de venda com rede de parceiros.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

            </div>

            <footer className="relative z-10 p-8 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/40 text-xs">Avaluz • Plano de Marketing</p>
               <p className="text-blue-400/40 text-xs">{String(5).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>
         </>
         )}

         {/* Funil de Vendas - Página de Marketing 4 */}
         {showFunnel && (
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}14, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-blue-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Filter size={20} className="text-amber-400" />
                     </div>
                     <p className="text-amber-400 text-xs tracking-[0.25em] uppercase font-semibold">Funil de Vendas</p>
                  </div>
                  <h2 className="text-white font-bold text-3xl">
                     Ações de Marketing
                  </h2>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30 flex-shrink-0">
                        <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                        <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
               </div>
            </header>

            <div className="relative z-10 px-8 pt-6 pb-4">
               <p className="text-blue-200/70 text-sm leading-relaxed">
                  As ações de marketing seguem um <span className="text-white font-semibold">funil estruturado</span>, onde cada etapa prepara o terreno para a próxima.
               </p>
            </div>

            <div className="relative z-10 px-8 flex-1 flex flex-col gap-3">
               
               {/* Etapa 1 - Estrutura e Segurança */}
               <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/40"></div>
                  <div className="ml-5 bg-gradient-to-r from-blue-500/15 via-blue-400/10 to-transparent backdrop-blur-sm border border-blue-400/20 rounded-2xl p-5 hover:border-blue-400/40 transition-all">
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-blue-500/30">
                           <span className="text-white font-bold text-xl">1</span>
                        </div>
                        <div className="flex-1">
                           <h4 className="text-white font-bold text-base mb-3">Estrutura e Segurança</h4>
                           <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                 <span className="text-blue-400 font-semibold text-xs min-w-[52px]">O que:</span>
                                 <span className="text-blue-100/80 text-xs">Organização documental completa e análise jurídica do imóvel.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                 <span className="text-blue-400 font-semibold text-xs min-w-[52px]">Por que:</span>
                                 <span className="text-blue-100/80 text-xs">Um processo de venda seguro começa com documentação em ordem.</span>
                              </div>
                              <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                 <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                                 <span className="text-emerald-400 text-[11px] font-medium">Impacto: Evita problemas e transmite confiança ao comprador.</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Etapa 2 - Preparação e Apresentação */}
               <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-lg shadow-teal-500/40"></div>
                  <div className="ml-5 bg-gradient-to-r from-teal-500/15 via-teal-400/10 to-transparent backdrop-blur-sm border border-teal-400/20 rounded-2xl p-5 hover:border-teal-400/40 transition-all">
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-teal-500/30">
                           <span className="text-white font-bold text-xl">2</span>
                        </div>
                        <div className="flex-1">
                           <h4 className="text-white font-bold text-base mb-3">Preparação e Apresentação</h4>
                           <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                 <span className="text-teal-400 font-semibold text-xs min-w-[52px]">O que:</span>
                                 <span className="text-blue-100/80 text-xs">Home staging, reparos, produção de fotos e vídeos profissionais.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                 <span className="text-teal-400 font-semibold text-xs min-w-[52px]">Por que:</span>
                                 <span className="text-blue-100/80 text-xs">A primeira impressão visual define 90% da decisão do comprador.</span>
                              </div>
                              <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                 <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                                 <span className="text-emerald-400 text-[11px] font-medium">Impacto: Destaque em portais e redes sociais.</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Etapa 3 - Divulgação Estratégica */}
               <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 via-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/40"></div>
                  <div className="ml-5 bg-gradient-to-r from-orange-500/15 via-orange-400/10 to-transparent backdrop-blur-sm border border-orange-400/20 rounded-2xl p-5 hover:border-orange-400/40 transition-all">
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-orange-500/30">
                           <span className="text-white font-bold text-xl">3</span>
                        </div>
                        <div className="flex-1">
                           <h4 className="text-white font-bold text-base mb-3">Divulgação Estratégica</h4>
                           <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                 <span className="text-orange-400 font-semibold text-xs min-w-[52px]">O que:</span>
                                 <span className="text-blue-100/80 text-xs">Publicação em portais, redes sociais, anúncios pagos e parcerias.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                 <span className="text-orange-400 font-semibold text-xs min-w-[52px]">Por que:</span>
                                 <span className="text-blue-100/80 text-xs">Alcançar o maior número de compradores qualificados possível.</span>
                              </div>
                              <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                 <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                                 <span className="text-emerald-400 text-[11px] font-medium">Impacto: Gera fluxo constante de interessados.</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Etapa 4 - Conversão */}
               <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 rounded-full shadow-lg shadow-rose-500/40"></div>
                  <div className="ml-5 bg-gradient-to-r from-rose-500/15 via-rose-400/10 to-transparent backdrop-blur-sm border border-rose-400/20 rounded-2xl p-5 hover:border-rose-400/40 transition-all">
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-rose-500/30">
                           <span className="text-white font-bold text-xl">4</span>
                        </div>
                        <div className="flex-1">
                           <h4 className="text-white font-bold text-base mb-3">Conversão</h4>
                           <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                 <span className="text-rose-400 font-semibold text-xs min-w-[52px]">O que:</span>
                                 <span className="text-blue-100/80 text-xs">Agendamento de visitas, negociação e fechamento do negócio.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                 <span className="text-rose-400 font-semibold text-xs min-w-[52px]">Por que:</span>
                                 <span className="text-blue-100/80 text-xs">Transformar interessados em compradores reais.</span>
                              </div>
                              <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                 <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                                 <span className="text-emerald-400 text-[11px] font-medium">Impacto: Acelerar o fechamento com técnicas de negociação.</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Etapa 5 - Acompanhamento e Feedback */}
               <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/40"></div>
                  <div className="ml-5 bg-gradient-to-r from-emerald-500/15 via-emerald-400/10 to-transparent backdrop-blur-sm border border-emerald-400/20 rounded-2xl p-5 hover:border-emerald-400/40 transition-all">
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/30">
                           <span className="text-white font-bold text-xl">5</span>
                        </div>
                        <div className="flex-1">
                           <h4 className="text-white font-bold text-base mb-3">Acompanhamento e Feedback</h4>
                           <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                 <span className="text-emerald-400 font-semibold text-xs min-w-[52px]">O que:</span>
                                 <span className="text-blue-100/80 text-xs">Relatórios periódicos, análise de visitas e ajustes na estratégia.</span>
                              </div>
                              <div className="flex items-start gap-2">
                                 <span className="text-emerald-400 font-semibold text-xs min-w-[52px]">Por que:</span>
                                 <span className="text-blue-100/80 text-xs">Manter o proprietário informado e otimizar o processo.</span>
                              </div>
                              <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                 <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                                 <span className="text-emerald-400 text-[11px] font-medium">Impacto: Transparência total e tomada de decisão baseada em dados.</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

            </div>

            <footer className="relative z-10 p-8 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/40 text-xs">Avaluz • Plano de Marketing</p>
               <p className="text-blue-400/40 text-xs">{String(6).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>
         )}

         {/* Benefícios - Página de Marketing 5 */}
         {showBenefits && (
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
               <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}14, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-blue-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <Star size={16} className="text-orange-400" />
                     </div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase">Vantagens Exclusivas</p>
                  </div>
                  <h2 className="text-white font-bold text-2xl">
                     Benefícios para o Proprietário
                  </h2>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30 flex-shrink-0">
                        <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                        <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
               </div>
            </header>

            <div className="relative z-10 p-8 flex-1 flex flex-col">
               
               {/* Grid de Benefícios */}
               <div className="grid grid-cols-2 gap-4 mb-6">
                  
                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                           <Eye size={18} className="text-green-400" />
                        </div>
                        <h4 className="text-white font-semibold text-sm">Transparência Total</h4>
                     </div>
                     <p className="text-blue-100/60 text-xs leading-relaxed">
                        Relatórios periódicos com todas as ações realizadas, visualizações, 
                        contatos recebidos e feedbacks de visitas.
                     </p>
                  </div>

                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                           <Shield size={18} className="text-orange-400" />
                        </div>
                        <h4 className="text-white font-semibold text-sm">Segurança Jurídica</h4>
                     </div>
                     <p className="text-blue-100/60 text-xs leading-relaxed">
                        Suporte na análise documental e acompanhamento em todas as etapas 
                        da transação até o fechamento.
                     </p>
                  </div>

                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                           <User size={18} className="text-blue-400" />
                        </div>
                        <h4 className="text-white font-semibold text-sm">Visibilidade Qualificada</h4>
                     </div>
                     <p className="text-blue-100/60 text-xs leading-relaxed">
                        Seu imóvel exposto para compradores com real interesse e capacidade 
                        financeira para a aquisição.
                     </p>
                  </div>

                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                           <BarChart3 size={18} className="text-purple-400" />
                        </div>
                        <h4 className="text-white font-semibold text-sm">Controle do Processo</h4>
                     </div>
                     <p className="text-blue-100/60 text-xs leading-relaxed">
                        Acompanhamento em tempo real do status da comercialização 
                        com métricas claras e objetivas.
                     </p>
                  </div>

                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4 col-span-2">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                           <Database size={18} className="text-teal-400" />
                        </div>
                        <h4 className="text-white font-semibold text-sm">Decisões Baseadas em Dados</h4>
                     </div>
                     <p className="text-blue-100/60 text-xs leading-relaxed">
                        Todas as recomendações são fundamentadas em análises de mercado reais, 
                        comparativos de vendas e tendências da região. Nada de achismos.
                     </p>
                  </div>

               </div>

               {/* Texto de Encerramento */}
               <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/15 border-2 border-orange-500/40 rounded-2xl p-6 flex-1">
                  <div className="flex items-start gap-4">
                     <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={28} className="text-orange-400" />
                     </div>
                     <div>
                        <h4 className="text-white font-bold text-lg mb-3">Compromisso com Resultados</h4>
                        <p className="text-blue-100/80 text-sm leading-relaxed mb-3">
                           Este plano não é apenas uma lista de tarefas — é uma <span className="text-orange-400 font-semibold">estratégia 
                           completa de proteção do seu patrimônio</span>. Nosso objetivo vai além da venda: 
                           buscamos garantir que você obtenha o <span className="text-orange-400 font-semibold">melhor valor possível</span>, 
                           no <span className="text-orange-400 font-semibold">menor tempo</span>, e com total <span className="text-orange-400 font-semibold">segurança</span>.
                        </p>
                        <p className="text-blue-100/70 text-sm leading-relaxed mb-3">
                           Com método, inteligência de dados e acompanhamento profissional, transformamos o processo 
                           de venda em uma experiência controlada e previsível — onde cada etapa tem propósito 
                           e cada decisão é fundamentada.
                        </p>
                        <p className="text-orange-400 font-semibold text-sm italic">
                           "Porque seu imóvel merece mais do que ser anunciado — merece ser estrategicamente posicionado para vender."
                        </p>
                     </div>
                  </div>
               </div>

            </div>

            <footer className="relative z-10 p-8 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/40 text-xs">Avaluz • Plano de Marketing</p>
               <p className="text-blue-400/40 text-xs">{String(7).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>
         )}
         </>
         )}

         {/* =================================================================================
          PÁGINA 8: IDENTIFICAÇÃO DO IMÓVEL - COMPLETA COM TODOS OS DADOS DO FORMULÁRIO
      ================================================================================= */}
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-blue-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <Building2 size={16} className="text-orange-400" />
                     </div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase">Objeto da Avaliação</p>
                  </div>
                  <h2 className="text-white font-bold text-2xl">
                     Identificação do Imóvel
                  </h2>
               </div>
                <div className="flex items-center gap-3">
                   {broker?.logo_imobiliaria_url && (
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30 flex-shrink-0">
                         <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                      </div>
                   )}
                   {broker?.avatar_url && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                         <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                      </div>
                   )}
                   <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
                </div>
            </header>

            <div className="relative z-10 p-8 flex-1 flex flex-col gap-4">
               
               {/* Property Image + Location side by side */}
               <div className="flex gap-4">
                  <div className="w-1/2 h-40 rounded-xl overflow-hidden relative">
                     {property.foto_capa ? (
                        <img src={property.foto_capa} alt="Imóvel" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-blue-950/80 flex items-center justify-center">
                           <Building2 size={48} className="text-blue-700/50" />
                        </div>
                     )}
                     <div className="absolute top-3 left-3">
                        <div className="inline-flex items-center gap-2 bg-orange-500/90 rounded-full px-2.5 py-1">
                           <span className="text-white text-[10px] font-medium uppercase">{property.tipo}</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Location + Client Card */}
                  <div className="w-1/2 flex flex-col gap-3">
                     <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <MapPin size={14} className="text-orange-400" />
                           <p className="text-blue-300/60 text-[10px] uppercase tracking-[0.15em]">Localização</p>
                        </div>
                        <p className="text-white font-medium text-sm">{property.rua ? `${property.rua}, ` : ''}{property.bairro}</p>
                        <p className="text-blue-300/60 text-xs">{property.municipio} - {property.estado}</p>
                        {property.cep && <p className="text-blue-300/50 text-xs mt-1">CEP: {property.cep}</p>}
                     </div>
                     
                     {/* Client */}
                     <div className="bg-gradient-to-r from-blue-500/15 to-blue-600/10 border border-blue-400/30 rounded-xl p-3">
                        <p className="text-blue-400 text-[9px] uppercase tracking-[0.15em] mb-1">Preparado para</p>
                        {hasClientData ? (
                           <>
                              <p className="text-white font-semibold text-sm">{displayClientName}</p>
                           </>
                        ) : (
                           <p className="text-blue-300/50 italic text-xs">Cliente não informado</p>
                        )}
                     </div>
                  </div>
               </div>

               {/* Specs Grid - Basic */}
               <div className="grid grid-cols-6 gap-2">
                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                     <Ruler size={14} className="text-orange-400 mb-1" />
                     <p className="text-white font-bold text-sm">{property.area}</p>
                     <p className="text-blue-300/50 text-[8px] uppercase">m²</p>
                  </div>
                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                     <BedDouble size={14} className="text-orange-400 mb-1" />
                     <p className="text-white font-bold text-sm">{property.quartos}</p>
                     <p className="text-blue-300/50 text-[8px] uppercase">Quartos</p>
                  </div>
                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                     <Home size={14} className="text-orange-400 mb-1" />
                     <p className="text-white font-bold text-sm">{property.suites || '-'}</p>
                     <p className="text-blue-300/50 text-[8px] uppercase">Suítes</p>
                  </div>
                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                     <Bath size={14} className="text-orange-400 mb-1" />
                     <p className="text-white font-bold text-sm">{property.banheiros || '-'}</p>
                     <p className="text-blue-300/50 text-[8px] uppercase">Banheiros</p>
                  </div>
                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                     <Car size={14} className="text-orange-400 mb-1" />
                     <p className="text-white font-bold text-sm">{property.vagas || '-'}</p>
                     <p className="text-blue-300/50 text-[8px] uppercase">Vagas</p>
                  </div>
                  {property.condominio !== undefined && property.condominio > 0 && (
                     <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                        <DollarSign size={14} className="text-orange-400 mb-1" />
                        <p className="text-white font-bold text-[10px]">{fmtMoney(property.condominio)}</p>
                        <p className="text-blue-300/50 text-[8px] uppercase">Cond.</p>
                     </div>
                  )}
               </div>

               {/* Financial + Legal Info Row */}
               <div className="grid grid-cols-3 gap-3">
                  {/* Valor de Venda (se à venda) */}
                  {property.aVenda && property.valor_atual > 0 && (
                     <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3">
                        <p className="text-blue-300/60 text-[9px] uppercase tracking-wider mb-1">Valor Anunciado</p>
                        <p className="text-white font-bold text-lg">{fmtMoney(property.valor_atual)}</p>
                        {property.linkVenda && (
                           <a href={property.linkVenda} className="text-blue-400 text-[10px] flex items-center gap-1 mt-1">
                              <ExternalLink size={10} /> Ver anúncio
                           </a>
                        )}
                     </div>
                  )}
                  
                  {/* IPTU */}
                  {property.iptu !== undefined && property.iptu > 0 && (
                     <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3">
                        <p className="text-blue-300/60 text-[9px] uppercase tracking-wider mb-1">IPTU Anual</p>
                        <p className="text-white font-bold text-lg">{fmtMoney(property.iptu)}</p>
                     </div>
                  )}
                  
                  {/* Mobiliado */}
                  {getMobiliadoLabel(property.mobiliado) && (
                     <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3">
                        <p className="text-blue-300/60 text-[9px] uppercase tracking-wider mb-1">Mobília</p>
                        <p className="text-white font-semibold text-sm flex items-center gap-1.5">
                           <Sofa size={14} className="text-orange-400" />
                           {getMobiliadoLabel(property.mobiliado)}
                        </p>
                     </div>
                  )}
                  
                   {/* Situação Legal */}
                   {getSituacaoLegalLabels(property.situacaoLegal) && (
                      <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 col-span-2">
                         <p className="text-blue-300/60 text-[9px] uppercase tracking-wider mb-1">Situação Legal</p>
                         <p className="text-white font-semibold text-sm flex items-center gap-1.5 truncate">
                            <Scale size={14} className="text-green-400 flex-shrink-0" />
                            <span className="truncate">{getSituacaoLegalLabels(property.situacaoLegal)}</span>
                         </p>
                      </div>
                   )}
               </div>

               {/* Avaliações do Corretor */}
               {(property.avaliacaoTecnica || property.localizacao || property.planta || property.acabamentos || property.conservacao || property.areasComuns) && (
                  <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4">
                     <p className="text-orange-400 text-[9px] uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                        <ThumbsUp size={12} />
                        Avaliação do Corretor
                     </p>
                     <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                        {property.avaliacaoTecnica && renderRating(property.avaliacaoTecnica, 'Técnica')}
                        {property.localizacao && renderRating(property.localizacao, 'Localização')}
                        {property.planta && renderRating(property.planta, 'Planta')}
                        {property.acabamentos && renderRating(property.acabamentos, 'Acabamentos')}
                        {property.conservacao && renderRating(property.conservacao, 'Conservação')}
                        {property.areasComuns && renderRating(property.areasComuns, 'Áreas Comuns')}
                     </div>
                  </div>
               )}

               {/* Features do Imóvel */}
               {property.features && property.features.length > 0 && (
                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4">
                     <p className="text-blue-300/60 text-[9px] uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                        <Sparkles size={12} className="text-orange-400" />
                        Características do Imóvel
                     </p>
                     <div className="flex flex-wrap gap-1.5">
                        {property.features.slice(0, 18).map((feature, idx) => (
                           <span key={idx} className="bg-blue-400/10 border border-blue-400/20 rounded-full px-2 py-0.5 text-[10px] text-blue-100/80">
                              {feature}
                           </span>
                        ))}
                        {property.features.length > 18 && (
                           <span className="bg-orange-500/20 border border-orange-500/30 rounded-full px-2 py-0.5 text-[10px] text-orange-300">
                              +{property.features.length - 18} mais
                           </span>
                        )}
                     </div>
                  </div>
               )}

                {/* Locais Próximos */}
                {property.locaisProximos && (
                   <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4">
                      <p className="text-blue-300/60 text-[9px] uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                         <Trees size={12} className="text-green-400" />
                         Pontos de Referência
                      </p>
                      <p className="text-blue-100/80 text-xs leading-relaxed line-clamp-3 break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{property.locaisProximos}</p>
                   </div>
                )}

               {/* Description */}
                {property.descricao && (
                   <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4 flex-1 min-w-0 overflow-hidden">
                      <p className="text-blue-300/60 text-[9px] uppercase tracking-[0.15em] mb-2">Descrição</p>
                      <p className="text-blue-100/70 text-xs leading-relaxed line-clamp-4 break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{property.descricao}</p>
                   </div>
                )}

            </div>

            <footer className="relative z-10 p-8 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/40 text-xs">Avaluz • Estudo de Mercado</p>
               <p className="text-blue-400/40 text-xs">08 / {totalPages}</p>
            </footer>
         </div>

         {/* =================================================================================
          PÁGINAS DE AMOSTRAS - UMA POR AMOSTRA (páginas 9 até 8+N)
      ================================================================================= */}
         {samplesToShow.map((sample, index) => {
            const pageNum = 9 + index; // Começa na página 9
            const diffValue = sample.valor - market.valor_estimado;
            const diffPercent = market.valor_estimado > 0 ? (diffValue / market.valor_estimado) * 100 : 0;
            const isPositive = diffValue >= 0;

            return (
               <div key={sample.id} className={pageClass} style={pageStyle}>
                  
                  <div className="absolute inset-0 overflow-hidden">
                     <div className="absolute top-20 right-20 w-[300px] h-[300px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent, transparent)` }}></div>
                  </div>

                   <header className="relative z-10 p-10 border-b border-blue-400/10 flex justify-between items-start">
                      <div>
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                               <Building2 size={16} className="text-orange-400" />
                            </div>
                            <p className="text-orange-400 text-xs tracking-[0.2em] uppercase">Amostra de Referência</p>
                         </div>
                         <h2 className="text-white font-bold text-3xl">
                            Amostra {String(index + 1).padStart(2, '0')}
                         </h2>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                             sample.status === 'vendido' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                          }`}>
                             {sample.status === 'vendido' ? 'Vendido' : 'Ativo'}
                          </div>
                          {broker?.logo_imobiliaria_url && (
                             <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30 flex-shrink-0">
                                <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                             </div>
                          )}
                          {broker?.avatar_url && (
                             <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                                <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                             </div>
                          )}
                          <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
                       </div>
                   </header>

                  <div className="relative z-10 px-8 py-6 flex-1 min-h-0 flex flex-col overflow-hidden">
                     
                     {/* Sample Images - Grid 2x2 para múltiplas imagens */}
                     {(() => {
                        const images = sample.imagens?.length ? sample.imagens : (sample.imagem ? [sample.imagem] : []);
                        const imageCount = images.length;
                        
                        if (imageCount === 0) {
                           // Placeholder quando não há imagens
                           return (
                              <div className="h-64 rounded-2xl overflow-hidden mb-6 relative bg-gradient-to-br from-blue-900/50 to-blue-950/80">
                                 <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                                    <Building2 size={64} className="text-blue-700/50" />
                                 </div>
                              </div>
                           );
                        }
                        
                        if (imageCount === 1) {
                           // Uma imagem - layout original
                           return (
                              <div className="h-64 rounded-2xl overflow-hidden mb-6 relative bg-gradient-to-br from-blue-900/50 to-blue-950/80">
                                 <div
                                    className="absolute inset-0"
                                    style={{
                                       backgroundImage: `url("${getImageUrlForPdf(images[0])}")`,
                                       backgroundSize: 'cover',
                                       backgroundPosition: 'center',
                                       backgroundRepeat: 'no-repeat',
                                    }}
                                 />
                                 <div className="absolute inset-0 bg-gradient-to-t from-[#061224] via-transparent to-transparent pointer-events-none"></div>
                                 <div className="absolute top-4 left-4">
                                    <div className="inline-flex items-center gap-2 bg-blue-950/60 backdrop-blur rounded-full px-3 py-1.5">
                                        <span className="text-white text-xs font-medium">{sample.categoria || sample.titulo || 'Imóvel'}</span>
                                    </div>
                                 </div>
                                 {sample.link && (
                                    <a href={sample.link} target="_blank" rel="noopener noreferrer" 
                                       className="absolute bottom-4 right-4 bg-orange-500/95 backdrop-blur rounded-full px-3 py-1.5 z-10 hover:bg-orange-400 transition-colors inline-flex items-center gap-1.5 shadow-lg">
                                       <ExternalLink size={12} className="text-white" />
                                       <span className="text-white text-xs font-medium">Ver anúncio</span>
                                    </a>
                                 )}
                              </div>
                           );
                        }
                        
                        // Múltiplas imagens - Grid adaptável
                        const gridClass = imageCount === 2 
                           ? "grid-cols-2" 
                           : imageCount === 3 
                              ? "grid-cols-3" 
                              : "grid-cols-2 grid-rows-2";
                        
                        return (
                           <div className={`grid ${gridClass} gap-2 h-80 rounded-2xl overflow-hidden mb-6 relative`}>
                              {images.slice(0, 4).map((img, imgIdx) => (
                                 <div 
                                    key={imgIdx} 
                                    className={`relative bg-gradient-to-br from-blue-900/50 to-blue-950/80 ${imageCount === 3 && imgIdx === 2 ? 'col-span-1' : ''}`}
                                 >
                                    <div
                                       className="absolute inset-0"
                                       style={{
                                          backgroundImage: `url("${getImageUrlForPdf(img)}")`,
                                          backgroundSize: 'cover',
                                          backgroundPosition: 'center',
                                          backgroundRepeat: 'no-repeat',
                                       }}
                                    />
                                    {/* Overlay de gradient apenas na primeira imagem */}
                                    {imgIdx === 0 && (
                                       <>
                                          <div className="absolute inset-0 bg-gradient-to-t from-[#061224]/60 via-transparent to-transparent pointer-events-none"></div>
                                          <div className="absolute top-2 left-2">
                                             <div className="inline-flex items-center gap-1 bg-blue-950/60 backdrop-blur rounded-full px-2 py-1">
                                                 <span className="text-white text-[10px] font-medium">{sample.categoria || sample.titulo || 'Imóvel'}</span>
                                             </div>
                                          </div>
                                       </>
                                    )}
                                    {/* Link apenas na última imagem */}
                                    {imgIdx === images.length - 1 && sample.link && (
                                       <a href={sample.link} target="_blank" rel="noopener noreferrer" 
                                          className="absolute bottom-2 left-2 bg-orange-500/95 backdrop-blur rounded-full px-2.5 py-1 z-10 hover:bg-orange-400 transition-colors inline-flex items-center gap-1 shadow-lg">
                                          <ExternalLink size={10} className="text-white" />
                                          <span className="text-white text-[9px] font-medium">Ver anúncio</span>
                                       </a>
                                    )}
                                    {/* Badge de quantidade de fotos na última célula */}
                                    {imgIdx === Math.min(images.length, 4) - 1 && images.length > 1 && (
                                       <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur rounded-full px-2 py-0.5">
                                          <span className="text-white text-[10px] font-medium">{images.length} fotos</span>
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        );
                     })()}

                       {/* Title and Value */}
                       <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6 mb-4">
                          <div className="flex items-start justify-between gap-6">
                             <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                                <h3 className="text-white font-bold text-xl mb-2 line-clamp-2 break-words">{sample.titulo}</h3>
                                {sample.descricao && (
                                   <p className="text-blue-100/60 text-sm leading-relaxed line-clamp-[12] break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{sample.descricao}</p>
                                )}
                             </div>
                             <div className="text-right flex-shrink-0">
                                <p className="text-blue-300/50 text-xs uppercase mb-1">Valor</p>
                                <p className="text-white font-bold text-2xl">{fmtMoney(sample.valor)}</p>
                                <p className="text-orange-400 text-sm">{fmtM2Simple(sample.valor, sample.area)}/m²</p>
                             </div>
                          </div>
                       </div>

                      {/* Location Block */}
                      {(sample.rua || sample.bairro || sample.municipio) && (
                         <div className="bg-blue-500/10 backdrop-blur border border-blue-400/20 rounded-xl p-3 mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                  <MapPin size={16} className="text-orange-400" />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-sm truncate">
                                     {sample.rua || sample.bairro}
                                  </p>
                                  <p className="text-blue-300/60 text-xs">
                                     {sample.rua && sample.bairro ? `${sample.bairro}, ` : ''}{sample.municipio || property.municipio}{sample.estado ? ` - ${sample.estado}` : ''}
                                  </p>
                               </div>
                            </div>
                         </div>
                      )}

                      {/* Specs Grid */}
                      <div className="grid grid-cols-5 gap-3">
                         <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 text-center">
                            <Ruler size={18} className="text-orange-400 mx-auto mb-1" />
                            <p className="text-white font-bold text-lg">{sample.area}</p>
                            <p className="text-blue-300/50 text-[10px] uppercase">m²</p>
                         </div>
                         <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 text-center">
                            <BedDouble size={18} className="text-orange-400 mx-auto mb-1" />
                            <p className="text-white font-bold text-lg">{sample.quartos}</p>
                            <p className="text-blue-300/50 text-[10px] uppercase">Quartos</p>
                         </div>
                         <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 text-center">
                            <Home size={18} className="text-orange-400 mx-auto mb-1" />
                            <p className="text-white font-bold text-lg">{sample.suites || '-'}</p>
                            <p className="text-blue-300/50 text-[10px] uppercase">Suítes</p>
                         </div>
                         <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 text-center">
                            <Bath size={18} className="text-orange-400 mx-auto mb-1" />
                            <p className="text-white font-bold text-lg">{sample.banheiros}</p>
                            <p className="text-blue-300/50 text-[10px] uppercase">Banheiros</p>
                         </div>
                         <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 text-center">
                            <Car size={18} className="text-orange-400 mx-auto mb-1" />
                            <p className="text-white font-bold text-lg">{sample.vagas}</p>
                            <p className="text-blue-300/50 text-[10px] uppercase">Vagas</p>
                         </div>
                      </div>

                  </div>

                  <footer className="relative z-10 p-10 border-t border-blue-400/10 flex justify-between items-center">
                     <p className="text-blue-400/40 text-xs">Avaluz • Estudo de Mercado</p>
                     <p className="text-blue-400/40 text-xs">{String(pageNum).padStart(2, '0')} / {totalPages}</p>
                  </footer>
               </div>
            );
         })}

         {/* =================================================================================
          PÁGINA DIAGNÓSTICO & ESTRATÉGIA (página N+2)
      ================================================================================= */}
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
               <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-blue-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <BarChart3 size={16} className="text-orange-400" />
                     </div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase">Análise de Valor</p>
                  </div>
                  <h2 className="text-white font-bold text-2xl">
                     Diagnóstico & Estratégia
                  </h2>
               </div>
                <div className="flex items-center gap-3">
                   {broker?.logo_imobiliaria_url && (
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30 flex-shrink-0">
                         <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                      </div>
                   )}
                   {broker?.avatar_url && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                         <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                      </div>
                   )}
                   <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
                </div>
            </header>

            <div className="relative z-10 p-8 flex-1 flex flex-col">

               {/* Property Mini Card */}
               <div className="flex items-center gap-4 bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 mb-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                     {property.foto_capa ? (
                        <img src={property.foto_capa} alt="Imóvel" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-blue-900/50 flex items-center justify-center">
                           <Building2 size={24} className="text-blue-700" />
                        </div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-white font-medium text-sm truncate">{property.bairro}</p>
                     <p className="text-blue-300/60 text-xs">{property.municipio} - {property.estado}</p>
                     <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                        <span className="text-blue-300/50 text-[10px]">{property.area}m²</span>
                        <span className="text-blue-300/50 text-[10px]">•</span>
                        <span className="text-blue-300/50 text-[10px]">{property.quartos} quartos</span>
                        {property.suites > 0 && (
                           <>
                              <span className="text-blue-300/50 text-[10px]">•</span>
                              <span className="text-blue-300/50 text-[10px]">{property.suites} suítes</span>
                           </>
                        )}
                        <span className="text-blue-300/50 text-[10px]">•</span>
                        <span className="text-blue-300/50 text-[10px]">{property.banheiros} banheiros</span>
                        <span className="text-blue-300/50 text-[10px]">•</span>
                        <span className="text-blue-300/50 text-[10px]">{property.vagas} vagas</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-blue-300/50 text-[10px] uppercase">Valor Estimado</p>
                     <p className="text-orange-400 font-bold">{fmtMoney(market.valor_estimado)}</p>
                  </div>
               </div>

               {/* Price Comparison Chart */}
               <PriceComparisonChart
                  samples={samplesToShow}
                  evaluatedProperty={{
                     valorEstimado: market.valor_estimado,
                     area: property.area
                  }}
                  accentColor="blue"
                   theme={{
                      primary: c.primary,
                      secondary: c.secondary,
                      secondaryLight: c.secondaryLight,
                      text: c.text,
                      textMuted: c.textMuted,
                      cardBackground: c.cardBackground,
                      cardBorder: c.cardBorder,
                   }}
               />

               {/* Value Hero - Card de valor principal */}
               <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/15 backdrop-blur-xl border-2 border-orange-500/50 rounded-2xl p-5 mb-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-orange-500"></div>
                  <div className="absolute top-3 right-3">
                     <div className="bg-orange-500/30 rounded-full px-2 py-1">
                        <span className="text-orange-300 text-[9px] uppercase font-bold">Recomendado</span>
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-orange-300/60 text-xs uppercase tracking-wider mb-1">Valor de Mercado</p>
                        <p className="text-white font-bold text-4xl">{fmtMoney(market.valor_estimado)}</p>
                        <p className="text-orange-400 text-sm mt-1">{fmtM2Simple(market.valor_estimado, property.area)}/m²</p>
                     </div>
                  </div>
               </div>

               {/* Min/Max Cards (if enabled) */}
               {showMinMax && (
                  <>
                     {(() => {
                        const cardCount = [showMaximo, showMinimo].filter(Boolean).length;
                        const gridCols = cardCount === 2 ? 'grid-cols-2' : 'grid-cols-1';
                        
                        return (
                           <div className={`grid ${gridCols} gap-4 mb-4`}>
                              {showMaximo && (
                                 <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                                    <div className="flex items-center gap-2 mb-2">
                                       <TrendingUp size={14} className="text-red-400" />
                                       <span className="text-red-400 text-[10px] uppercase tracking-wider font-medium">Valor Premium</span>
                                    </div>
                                    <p className="text-white font-bold text-lg mb-2">{fmtMoney(market.maximo)}</p>
                                    <div className="space-y-1">
                                       <p className="text-blue-100/70 text-[10px]"><span className="text-red-400 font-medium">Risco de imóvel parado</span></p>
                                       <p className="text-blue-100/70 text-[10px]">Venda: <span className="text-white font-medium">+12 meses</span></p>
                                    </div>
                                 </div>
                              )}

                              {showMinimo && (
                                 <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                                    <div className="flex items-center gap-2 mb-2">
                                       <Zap size={14} className="text-green-400" />
                                       <span className="text-green-400 text-[10px] uppercase tracking-wider font-medium">Valor de Mercado</span>
                                    </div>
                                    <p className="text-white font-bold text-lg mb-2">{fmtMoney(market.minimo)}</p>
                                    <div className="space-y-1">
                                       <p className="text-blue-200/50 text-[10px]"><span className="text-green-400 font-medium">Vende rápido</span></p>
                                       <p className="text-blue-200/50 text-[10px]">Venda: <span className="text-white font-medium">1-2 meses</span></p>
                                    </div>
                                 </div>
                              )}
                           </div>
                        );
                     })()}
                  </>
               )}

               {/* Important Sales Notice */}
               <div className="bg-gradient-to-r from-orange-500/15 to-orange-600/10 border border-orange-500/30 rounded-xl p-4 mt-auto">
                  <div className="flex items-start gap-3">
                     <AlertCircle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
                     <div>
                        <h4 className="text-white font-semibold text-sm mb-1">Estratégia de Precificação</h4>
                        <p className="text-blue-100/70 text-xs leading-relaxed">
                           Cada <span className="text-orange-400 font-medium">5% acima do valor de mercado</span> pode representar 
                           <span className="text-orange-400 font-medium"> +3 meses para vender</span>. A precificação correta, 
                           aliada ao trabalho do corretor, é a chave para uma venda rápida e bem-sucedida.
                        </p>
                     </div>
                  </div>
               </div>

            </div>

            <footer className="relative z-10 p-8 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/40 text-xs">Avaluz • Estudo de Mercado</p>
               <p className="text-blue-400/40 text-xs">{String(8 + samplePages + 1).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>

         {/* =================================================================================
          PÁGINAS QUADRO COMPARATIVO (paginação automática se > 6 amostras)
      ================================================================================= */}
         {tableChunks.map((chunkSamples, chunkIndex) => {
            const isFirstTablePage = chunkIndex === 0;
            const isLastTablePage = chunkIndex === tableChunks.length - 1;
            const tablePageNumber = 8 + samplePages + 2 + chunkIndex;
            
            return (
               <div key={`table-page-${chunkIndex}`} className={pageClass} style={pageStyle}>
                  
                  <div className="absolute inset-0 overflow-hidden">
                     <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent, transparent)` }}></div>
                     <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}14, transparent, transparent)` }}></div>
                  </div>

                  <header className="relative z-10 p-8 border-b border-blue-400/10 flex justify-between items-start">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                              <BarChart3 size={16} className="text-orange-400" />
                           </div>
                           <p className="text-orange-400 text-xs tracking-[0.2em] uppercase">Análise Comparativa</p>
                        </div>
                        <h2 className="text-white font-bold text-2xl">
                           Quadro Comparativo
                           {tableChunks.length > 1 && <span className="text-blue-300/60 text-lg ml-2">({chunkIndex + 1}/{tableChunks.length})</span>}
                        </h2>
                     </div>
                     <div className="flex items-center gap-3">
                        {broker?.logo_imobiliaria_url && (
                           <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30 flex-shrink-0">
                              <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                           </div>
                        )}
                        {broker?.avatar_url && (
                           <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                              <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                           </div>
                        )}
                        <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
                     </div>
                  </header>

                  <div className="relative z-10 p-6 flex-1 flex flex-col">
                     
                     {/* Tabela Comparativa */}
                     <div className="bg-blue-500/5 backdrop-blur-xl border border-blue-400/20 rounded-2xl overflow-hidden flex-1">
                        
                     {/* Header da Tabela */}
                        <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-blue-400/10">
                           <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/15 p-3">
                              <p className="text-orange-400 text-[10px] uppercase tracking-wider font-semibold">Imóvel</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Ruler size={14} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[9px] uppercase">Área</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <BedDouble size={14} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[9px] uppercase">Quartos</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Bath size={14} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[9px] uppercase">Banheiros</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Car size={14} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[9px] uppercase">Vagas</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <DollarSign size={14} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[9px] uppercase">Valor</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <TrendingUp size={14} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[9px] uppercase">R$/m²</p>
                           </div>
                        </div>

                        {/* Linha do Imóvel Avaliado (apenas na primeira página da tabela) */}
                        {isFirstTablePage && (
                           <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-blue-400/10">
                              <div className="bg-gradient-to-r from-orange-500/15 to-orange-600/10 p-3 flex items-center gap-3">
                                 <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 border-orange-500/40">
                                    {property.foto_capa ? (
                                       <img src={property.foto_capa} alt="Seu Imóvel" className="w-full h-full object-cover" />
                                    ) : (
                                       <div className="w-full h-full bg-orange-500/20 flex items-center justify-center">
                                          <Home size={20} className="text-orange-400" />
                                       </div>
                                    )}
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <p className="text-orange-400 font-bold text-sm">Seu Imóvel</p>
                                    <p className="text-orange-300/70 text-xs">{property.bairro}, {property.municipio}</p>
                                 </div>
                              </div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center">
                                 <p className="text-white font-bold text-sm">{property.area} m²</p>
                              </div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center">
                                 <p className="text-white font-bold text-sm">{property.quartos}</p>
                              </div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center">
                                 <p className="text-white font-bold text-sm">{property.banheiros}</p>
                              </div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center">
                                 <p className="text-white font-bold text-sm">{property.vagas}</p>
                              </div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center">
                                 <p className="text-orange-400 font-bold text-sm">{fmtMoney(market.valor_estimado)}</p>
                              </div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center">
                                 <p className="text-orange-400 font-semibold text-xs">{fmtM2Simple(market.valor_estimado, property.area)}</p>
                              </div>
                           </div>
                        )}

                        {/* Linhas das Amostras do chunk atual */}
                        {chunkSamples.map((sample, index) => {
                           const precoM2Sample = sample.area > 0 ? sample.valor / sample.area : 0;
                           const precoM2Property = property.area > 0 ? market.valor_estimado / property.area : 0;
                           const diffPercent = precoM2Property > 0 ? ((precoM2Sample - precoM2Property) / precoM2Property) * 100 : 0;
                           const isHigher = diffPercent > 5;
                           const isLower = diffPercent < -5;
                           
                           // Usar a primeira imagem disponível
                           const sampleImage = sample.imagens?.[0] || sample.imagem;
                           
                           // Criar título descritivo
                           const displayTitle = sample.titulo || `${sample.categoria || 'Imóvel'} - ${sample.quartos}q/${sample.banheiros}b`;
                           // Calcular número global da amostra (considerando chunks anteriores)
                           const globalSampleNumber = (chunkIndex * 6) + index + 1;
                           
                           return (
                              <div key={sample.id} className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-blue-400/10">
                                 <div className="bg-[#0A1E3C] p-3 flex items-center gap-3">
                                    {/* Sample number badge */}
                                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                       <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/40 flex items-center justify-center">
                                          <span className="text-orange-400 text-[10px] font-bold">{globalSampleNumber}</span>
                                       </div>
                                    </div>
                                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-blue-400/30">
                                       {sampleImage ? (
                                          <img src={sampleImage} alt={displayTitle} className="w-full h-full object-cover" />
                                       ) : (
                                          <div className="w-full h-full bg-blue-500/20 flex items-center justify-center">
                                             <Building2 size={20} className="text-blue-400" />
                                          </div>
                                       )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-white font-semibold text-xs line-clamp-2 leading-snug">{displayTitle}</p>
                                       <p className="text-blue-300/70 text-[11px] truncate mt-0.5">{sample.bairro || property.bairro}{sample.municipio && `, ${sample.municipio}`}</p>
                                    </div>
                                 </div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center">
                                    <p className="text-white text-sm">{sample.area} m²</p>
                                 </div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center">
                                    <p className="text-white text-sm">{sample.quartos}</p>
                                 </div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center">
                                    <p className="text-white text-sm">{sample.banheiros}</p>
                                 </div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center">
                                    <p className="text-white text-sm">{sample.vagas}</p>
                                 </div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center">
                                    <p className="text-white text-sm">{fmtMoney(sample.valor)}</p>
                                 </div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                       <p className={`text-xs font-medium ${isHigher ? 'text-red-400' : isLower ? 'text-green-400' : 'text-white'}`}>
                                          {fmtM2Simple(sample.valor, sample.area)}
                                       </p>
                                       {(isHigher || isLower) && (
                                          <span className={`text-[9px] ${isHigher ? 'text-red-400' : 'text-green-400'}`}>
                                             {isHigher ? '+' : ''}{Math.abs(diffPercent).toFixed(0)}% vs seu
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>

                     {/* Resumo Estatístico (apenas na última página da tabela) */}
                     {isLastTablePage && (
                        <>
                           <div className="grid grid-cols-4 gap-3 mt-4">
                              <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 text-center">
                                 <p className="text-blue-300/60 text-[9px] uppercase tracking-wider mb-1">Média do Mercado</p>
                                 <p className="text-white font-bold text-lg">
                                    {fmtMoney(allSamples.reduce((acc, s) => acc + s.valor, 0) / allSamples.length)}
                                 </p>
                              </div>
                              <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 text-center">
                                 <p className="text-blue-300/60 text-[9px] uppercase tracking-wider mb-1">Média R$/m²</p>
                                 <p className="text-white font-bold text-lg">
                                    {fmtM2Simple(
                                       allSamples.reduce((acc, s) => acc + s.valor, 0) / allSamples.length,
                                       allSamples.reduce((acc, s) => acc + s.area, 0) / allSamples.length
                                    )}
                                 </p>
                              </div>
                              <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 text-center">
                                 <p className="text-blue-300/60 text-[9px] uppercase tracking-wider mb-1">Menor Valor</p>
                                 <p className="text-green-400 font-bold text-lg">
                                    {fmtMoney(Math.min(...allSamples.map(s => s.valor)))}
                                 </p>
                              </div>
                              <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 text-center">
                                 <p className="text-blue-300/60 text-[9px] uppercase tracking-wider mb-1">Maior Valor</p>
                                 <p className="text-orange-400 font-bold text-lg">
                                    {fmtMoney(Math.max(...allSamples.map(s => s.valor)))}
                                 </p>
                              </div>
                           </div>

                           {/* Legenda */}
                           <div className="flex items-center justify-center gap-6 mt-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full bg-orange-500/40 border border-orange-500"></div>
                                 <span className="text-blue-300/60 text-[10px]">Seu Imóvel (valor estimado)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-green-400 text-[10px]">↓</span>
                                 <span className="text-blue-300/60 text-[10px]">Abaixo da média</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-red-400 text-[10px]">↑</span>
                                 <span className="text-blue-300/60 text-[10px]">Acima da média</span>
                              </div>
                           </div>
                        </>
                     )}

                  </div>

                  <footer className="relative z-10 p-6 border-t border-blue-400/10 flex justify-between items-center">
                     <p className="text-blue-400/40 text-xs">Avaluz • Estudo de Mercado</p>
                     <p className="text-blue-400/40 text-xs">{String(tablePageNumber).padStart(2, '0')} / {totalPages}</p>
                  </footer>
               </div>
            );
         })}

         {/* =================================================================================
          PÁGINA FINAL: CONCLUSÃO - CORRETOR EM DESTAQUE
      ================================================================================= */}
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}26, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-10 border-b border-blue-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-orange-400" />
                     </div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase">Parecer Final</p>
                  </div>
                  <h2 className="text-white font-bold text-3xl">
                     Conclusão do Estudo
                  </h2>
               </div>
                <div className="flex items-center gap-3">
                   {broker?.logo_imobiliaria_url && (
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30 flex-shrink-0">
                         <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                      </div>
                   )}
                   {broker?.avatar_url && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-orange-500/30">
                         <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                      </div>
                   )}
                   <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
                </div>
            </header>

            <div className="relative z-10 p-10 flex-1 flex flex-col">
               
               {/* Property Summary with Photo */}
               <div className="flex gap-6 mb-6">
                  <div className="w-44 h-32 rounded-xl overflow-hidden flex-shrink-0">
                     {property.foto_capa ? (
                        <img src={property.foto_capa} alt="Imóvel" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-blue-950/80 flex items-center justify-center">
                           <Building2 size={40} className="text-blue-700/50" />
                        </div>
                     )}
                  </div>
                  <div className="flex-1">
                     <h3 className="text-white font-bold text-lg mb-1">{property.bairro}</h3>
                     <p className="text-blue-200/60 text-sm mb-2">{property.municipio} - {property.estado}</p>
                     <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-500/20 rounded-full px-2 py-0.5 text-[10px] text-white">{property.area}m²</span>
                        <span className="bg-blue-500/20 rounded-full px-2 py-0.5 text-[10px] text-white">{property.quartos} quartos</span>
                        {property.suites > 0 && (
                           <span className="bg-blue-500/20 rounded-full px-2 py-0.5 text-[10px] text-white">{property.suites} suítes</span>
                        )}
                        <span className="bg-blue-500/20 rounded-full px-2 py-0.5 text-[10px] text-white">{property.banheiros} banheiros</span>
                        <span className="bg-blue-500/20 rounded-full px-2 py-0.5 text-[10px] text-white">{property.vagas} vagas</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-blue-300/50 text-xs uppercase mb-1">Valor de Mercado</p>
                     <p className="text-orange-400 font-bold text-xl">{fmtMoney(market.valor_estimado)}</p>
                     <p className="text-blue-300/60 text-xs">{fmtM2Simple(market.valor_estimado, property.area)}/m²</p>
                  </div>
               </div>

               {/* Conclusion Text */}
               <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-5 mb-6">
                  <h4 className="text-white font-semibold text-base mb-3">Parecer do Estudo de Mercado</h4>
                  <p className="text-blue-100/70 text-sm leading-relaxed mb-3">
                     Com base na análise de <span className="text-orange-400 font-medium">{market.amostras} imóveis comparáveis</span> na 
                     região de <span className="text-white font-medium">{property.bairro}, {property.municipio}</span>, e considerando 
                     as características específicas do imóvel em questão, concluímos que o valor de mercado 
                     estimado é de <span className="text-orange-400 font-bold">{fmtMoney(market.valor_estimado)}</span>.
                  </p>
                  <p className="text-blue-100/70 text-sm leading-relaxed">
                     Este estudo foi conduzido utilizando metodologia de Método Comparativo Direto, 
                     amplamente reconhecida no mercado imobiliário. O acompanhamento profissional 
                     do corretor responsável é fundamental para o sucesso da comercialização.
                  </p>
               </div>

                {/* Broker Signature Card - Style matching cover page */}
                {broker && (
                   <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-2 border-orange-500/40 rounded-2xl p-6 shadow-lg shadow-orange-500/10 flex-1 flex flex-col">
                      <div className="flex gap-8 items-center flex-1">
                         {/* Agency Column */}
                         <div className="flex-1 flex items-center gap-5">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/50 shadow-lg shadow-orange-500/20 flex-shrink-0">
                               {broker.logo_imobiliaria_url ? (
                                  <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                               ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-orange-500/20">
                                     <Building2 size={32} className="text-orange-400" />
                                  </div>
                               )}
                            </div>
                            <div>
                               <p className="text-orange-400 text-[11px] uppercase tracking-[0.15em] mb-1">Imobiliária</p>
                               <h3 className="text-white font-bold text-lg leading-tight">{broker.imobiliaria || 'Imobiliária'}</h3>
                            </div>
                         </div>

                         {/* Divider */}
                         <div className="w-px h-16 bg-orange-400/30" />

                         {/* Broker Column */}
                         <div className="flex-1 flex items-center gap-5">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500/30 to-orange-600/20 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20 flex-shrink-0">
                               {broker.avatar_url ? (
                                  <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                               ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                     <User size={32} className="text-orange-400" />
                                  </div>
                               )}
                            </div>
                            <div>
                               <p className="text-orange-400 text-[11px] uppercase tracking-[0.15em] mb-1">Corretor Responsável</p>
                               <h3 className="text-white font-bold text-lg leading-tight">{broker.nome || 'Especialista'}</h3>
                               {broker.creci && (
                                  <p className="text-blue-300/70 text-xs mt-1 flex items-center gap-1.5">
                                     <Award size={11} className="text-orange-400" />
                                     CRECI {broker.creci}
                                  </p>
                               )}
                               {showBrokerContact && (brokerPhone || brokerEmail) && (
                                  <div className="mt-1.5 space-y-0.5">
                                     {brokerPhone && (
                                        <p className="text-blue-100/70 text-xs flex items-center gap-1.5">
                                           <Phone size={10} className="text-orange-400" />
                                           {brokerPhone}
                                        </p>
                                     )}
                                     {brokerEmail && (
                                        <p className="text-blue-100/70 text-xs flex items-center gap-1.5">
                                           <Mail size={10} className="text-orange-400" />
                                           {brokerEmail}
                                        </p>
                                     )}
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>

                      {/* Signature Row */}
                      <div className="flex items-center gap-4 pt-4 mt-4 border-t border-orange-500/30">
                         <div className="flex-1">
                            <p className="text-blue-300/60 text-xs">Data da Avaliação</p>
                            <p className="text-white font-medium text-sm">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                         </div>
                         <div className="text-right">
                            {broker?.signature_url ? (
                               <div className="flex flex-col items-end">
                                  <div className="bg-white rounded px-2 py-1">
                                     <img 
                                        src={broker.signature_url} 
                                        alt="Assinatura" 
                                        className="h-10 w-auto object-contain max-w-36"
                                        crossOrigin="anonymous"
                                        referrerPolicy="no-referrer"
                                     />
                                  </div>
                                  <div className="w-40 border-b border-orange-500/30 mt-1" />
                                  <p className="text-blue-300/60 text-[10px] mt-1">Assinatura do Corretor</p>
                               </div>
                            ) : (
                               <div className="flex flex-col items-end">
                                  <div className="w-40 h-12 border-b-2 border-dashed border-orange-500/40" />
                                  <p className="text-blue-300/60 text-[10px] mt-1">Assinatura do Corretor</p>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                )}

            </div>

            {/* Footer */}
            <footer className="relative z-10 p-10 border-t border-blue-400/10">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <img src={avaluzLogo} alt="Avaluz" className="h-10 w-auto" />
                     </div>
                     <p className="text-blue-300/50 text-xs max-w-md">
                        Este documento é um estudo de mercado para fins de orientação comercial. 
                        Não substitui laudo de avaliação oficial para fins jurídicos ou financeiros.
                     </p>
                  </div>
                  <p className="text-blue-400/40 text-xs">{String(totalPages).padStart(2, '0')} / {totalPages}</p>
               </div>
            </footer>
         </div>

      </div>
   );
};
