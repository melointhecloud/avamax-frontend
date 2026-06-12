import React from 'react';
import { getImageUrlForPdf, getCoverPhotoForPdf } from '@/lib/pdfImages';
import avaluzLogo from '@/assets/avaluz-logo-transparent.png';
import propertyPlaceholder from '@/assets/property-placeholder.jpg';
import { PriceComparisonChart } from './components/PriceComparisonChart';
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
   Trees,
   Key,
   CalendarDays,
   UserCheck,
   FileCheck,
   ClipboardCheck,
   Wallet,
   PiggyBank
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
   cep?: string;
   condominio?: number;
   iptu?: number;
   aVenda?: boolean;
   linkVenda?: string;
   mobiliado?: string;
   situacaoLegal?: string[];
   locaisProximos?: string;
   avaliacaoTecnica?: number;
   localizacao?: number;
   planta?: number;
   acabamentos?: number;
   conservacao?: number;
   areasComuns?: number;
   features?: string[];
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
   primary: '#10b981', // emerald for rental
   primaryLight: '#34d399',
   secondary: '#3b82f6',
   secondaryLight: '#60a5fa',
   accent: '#f97316',
   text: '#ffffff',
   textMuted: '#94a3b8',
   cardBackground: 'rgba(16, 185, 129, 0.1)',
   cardBorder: 'rgba(52, 211, 153, 0.2)',
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
   // Rental time settings
   showRentalTime?: boolean;
   rentalTimeText?: string;
   rentalTimeDescription?: string;
   // Custom colors
   pdfColors?: PdfColors;
}

interface RentalReportProps {
   clientName: string;
   client?: ClientData;
   property: PropertyData;
   market: MarketData;
   broker?: BrokerData;
   settings?: PdfSettings;
}

// --- Componente Principal ---
export const AvaluzRentalReport: React.FC<RentalReportProps> = ({
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
   
   // Configurações de tempo de locação
   const showRentalTime = settings.showRentalTime !== false;
   const rentalTimeText = settings.rentalTimeText || '15-30 dias';
   const rentalTimeDescription = settings.rentalTimeDescription || 'Com o preço de equilíbrio recomendado, expectativa de locação dentro deste prazo.';
   
   // Configurações de exibição do cliente
   const showClient = settings.showClient !== false;
   const showClientEmail = settings.showClientEmail !== false;
   const showClientPhone = settings.showClientPhone !== false;
   
   // Configurações de exibição do contato do corretor
   const showBrokerContact = settings.showBrokerContact !== false;
   
   // Configurações granulares do plano de marketing para aluguel
   const mp = settings.marketingPlan || {};
   const showRentalFunnel = showMarketing && mp.rentalFunnel?.enabled !== false;
   const showIndicators = showMarketing && mp.indicators?.enabled !== false;

   // Broker contact values (use custom if provided, fallback to profile)
   const brokerPhone = broker?.telefone_custom || broker?.telefone;
   const brokerEmail = broker?.email_custom || broker?.email;

   const fmtMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
   const fmtM2Simple = (val: number, area: number) => area > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val / area) : "-";

   const confiancaDisplay = market.confianca < 1 ? Math.round(market.confianca * 100) : Math.round(market.confianca);

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

   // Cálculo dinâmico de páginas de marketing para aluguel
   // Funil de Locação = 1 pág, Indicadores = 1 pág
   const marketingPageCount = showMarketing 
      ? (showRentalFunnel ? 1 : 0) + (showIndicators ? 1 : 0)
      : 0;
   
   // Páginas da tabela comparativa (pode ser mais de 1 se tiver muitas amostras)
   const tablePages = tableChunks.length || 1;
   
   const basePages = 5 + marketingPageCount + tablePages; // 5 = capa + metodologia + imóvel + diagnóstico + conclusão, + tablePages
   const samplePages = samplesToShow.length;
   const totalPages = basePages + samplePages;

   const hasClientData = client?.nome || clientName !== "Cliente Avaluz";
   const displayClientName = client?.nome || clientName;

   // Custo total mensal = Aluguel + Condomínio + IPTU mensalizado
   const iptuMensal = property.iptu ? Math.round(property.iptu / 12) : 0;
   const custoTotal = market.valor_estimado + (property.condominio || 0) + iptuMensal;

   const renderRating = (value?: number, label?: string) => {
      if (!value) return null;
      const stars = [];
      for (let i = 1; i <= 5; i++) {
         stars.push(
            <Star 
               key={i} 
               size={10} 
               className={i <= value ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} 
            />
         );
      }
      return (
         <div className="flex items-center gap-1">
            {label && <span className="text-slate-400 text-[10px] mr-1">{label}:</span>}
            <div className="flex gap-0.5">{stars}</div>
         </div>
      );
   };

   const getMobiliadoLabel = (val?: string) => {
      switch(val) {
         case 'mobiliado': return 'Mobiliado';
         case 'semi_mobiliado': return 'Semi-mobiliado';
         case 'nao_mobiliado': return 'Não mobiliado';
         default: return null;
      }
   };

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

   return (
      <div className="w-full py-10 font-inter flex flex-col items-center gap-8 print:p-0 print:gap-0 pdf-theme" style={{ backgroundColor: c.background, color: c.text }}>
         <PdfThemeStyles colors={c} />

         {/* =================================================================================
          PÁGINA 1: CAPA - LOCAÇÃO
      ================================================================================= */}
         <div className="w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break" style={{ background: `linear-gradient(to bottom right, ${c.backgroundGradientFrom}, ${c.backgroundGradientVia}, ${c.backgroundGradientTo})` }}>
            
            {/* Background Effects - Dynamic colors */}
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}33, ${c.primary}1a, transparent)` }}></div>
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}26, transparent, transparent)` }}></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}0d, transparent, transparent)` }}></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
               backgroundImage: `linear-gradient(${c.primary}4d 1px, transparent 1px), linear-gradient(90deg, ${c.primary}4d 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
            }}></div>

            {/* Header with Logo */}
            <header className="relative z-10 p-8 flex justify-between items-start">
               <div className="flex items-center gap-3">
                  <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
               </div>
                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <p className="text-xs" style={{ color: `${c.primary}b3` }}>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      <p className="text-[10px]" style={{ color: `${c.primary}80` }}>ID: AVL-L-{property.id.toString().padStart(6, '0')}</p>
                   </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col px-10">
               
               {/* Title Section */}
               <div className="mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4" style={{ backgroundColor: `${c.primary}1a`, border: `1px solid ${c.primary}4d` }}>
                     <Key size={14} style={{ color: c.primary }} />
                     <span className="text-xs tracking-wide font-medium" style={{ color: c.primaryLight }}>Estudo de Locação</span>
                  </div>
                  <h1 className="font-inter font-bold text-3xl leading-tight mb-3 break-words">
                     <span style={{ color: c.text }}>Avaliação Estratégica</span><br />
                     <span style={{ color: c.primary }}>de Valor de Aluguel</span>
                  </h1>
                  <p className="text-sm max-w-[400px] break-words" style={{ color: `${c.primary}99` }}>
                     Método Comparativo Direto de Aluguel • Análise de {market.amostras} Imóveis
                  </p>
               </div>

               {/* Property Photo - Hero */}
               <div className="relative rounded-2xl overflow-hidden mb-4 h-[280px] w-full flex-shrink-0 bg-gradient-to-br from-emerald-900/50 to-emerald-950/80">
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
                           <Building2 size={80} className="text-emerald-700/50" />
                        </div>
                     </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#061224] via-transparent to-transparent pointer-events-none"></div>
                  
                  {/* Property Type Badge */}
                  <div className="absolute top-5 left-4">
                     <div className="inline-flex items-center gap-2 bg-emerald-500/90 rounded-full px-4 py-2">
                        <Key size={12} className="text-white flex-shrink-0" />
                        <span className="text-white text-xs font-medium uppercase whitespace-nowrap leading-tight">LOCAÇÃO</span>
                     </div>
                  </div>
               </div>

               {/* Property Details Grid */}
               <div className="grid grid-cols-5 gap-2 mb-4">
                  <div className="bg-emerald-500/10 backdrop-blur border border-emerald-400/20 rounded-xl p-4 text-center">
                     <p className="text-white font-bold text-xl">{property.area}</p>
                     <p className="text-emerald-300/60 text-xs uppercase">m² úteis</p>
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur border border-emerald-400/20 rounded-xl p-4 text-center">
                     <p className="text-white font-bold text-xl">{property.quartos}</p>
                     <p className="text-emerald-300/60 text-xs uppercase">Quartos</p>
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur border border-emerald-400/20 rounded-xl p-4 text-center">
                     <p className="text-white font-bold text-xl">{property.banheiros || '-'}</p>
                     <p className="text-emerald-300/60 text-xs uppercase">Banheiros</p>
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur border border-emerald-400/20 rounded-xl p-4 text-center">
                     <p className="text-white font-bold text-xl">{property.suites || '-'}</p>
                     <p className="text-emerald-300/60 text-xs uppercase">Suítes</p>
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur border border-emerald-400/20 rounded-xl p-4 text-center">
                     <p className="text-white font-bold text-xl">{property.vagas || '-'}</p>
                     <p className="text-emerald-300/60 text-xs uppercase">Vagas</p>
                  </div>
               </div>

               {/* Location + Client Row */}
               <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Location */}
                  <div className="bg-emerald-500/10 backdrop-blur border border-emerald-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                           <MapPin size={20} className="text-orange-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                           <p className="text-white font-medium text-base truncate">{property.rua || property.bairro}</p>
                           <p className="text-emerald-300/60 text-sm truncate">{property.bairro}, {property.municipio} - {property.estado}</p>
                        </div>
                     </div>
                  </div>

                  {/* Prepared For - Client */}
                  {showClient && (
                     <div className="bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 border border-emerald-400/30 rounded-xl p-4">
                     <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                           <User size={20} className="text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-emerald-400 text-[11px] uppercase tracking-[0.15em] mb-1">Preparado para</p>
                          {hasClientData ? (
                              <>
                                 <p className="text-white font-semibold text-base truncate">{displayClientName}</p>
                              </>
                           ) : (
                              <p className="text-emerald-300/60 italic text-sm">Cliente não informado</p>
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </div>

               {/* Broker/Agency Card - Full Width Below */}
               {broker && (
                  <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
                     <div className="flex gap-8 items-center">
                        {/* Agency Column */}
                        <div className="flex-1 flex items-center gap-5 min-w-0">
                           <div className="w-28 h-28 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20 flex-shrink-0">
                              {broker.logo_imobiliaria_url ? (
                                 <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-emerald-500/20">
                                    <Building2 size={40} className="text-emerald-400" />
                                 </div>
                              )}
                           </div>
                           <div className="min-w-0">
                              <p className="text-emerald-400 text-[11px] uppercase tracking-[0.15em] mb-1">Imobiliária</p>
                              <h3 className="text-white font-bold text-lg leading-tight truncate">{broker.imobiliaria || 'Imobiliária'}</h3>
                           </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-20 bg-emerald-400/30" />

                        {/* Broker Column */}
                        <div className="flex-1 flex items-center gap-5 min-w-0">
                           <div className="w-28 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20 flex-shrink-0">
                              {broker.avatar_url ? (
                                 <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center">
                                    <User size={40} className="text-emerald-400" />
                                 </div>
                              )}
                           </div>
                           <div className="min-w-0">
                              <p className="text-emerald-400 text-[11px] uppercase tracking-[0.15em] mb-1">Corretor</p>
                              <h3 className="text-white font-bold text-lg leading-tight truncate">{broker.nome || 'Especialista'}</h3>
                              {broker.creci && (
                                 <p className="text-emerald-300/70 text-xs mt-1 flex items-center gap-1.5">
                                    <Award size={11} className="text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">CRECI {broker.creci}</span>
                                 </p>
                              )}
                              {showBrokerContact && (brokerPhone || brokerEmail) && (
                                 <div className="mt-1.5 space-y-0.5">
                                    {brokerPhone && (
                                       <p className="text-emerald-100/70 text-xs flex items-center gap-1.5">
                                          <Phone size={10} className="text-emerald-400 flex-shrink-0" />
                                          <span className="truncate">{brokerPhone}</span>
                                       </p>
                                    )}
                                    {brokerEmail && (
                                       <p className="text-emerald-100/70 text-xs flex items-center gap-1.5">
                                          <Mail size={10} className="text-emerald-400 flex-shrink-0" />
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
            <footer className="relative z-10 px-10 pb-4 flex justify-between items-center">
               <div className="flex items-center gap-4 text-emerald-300/50 text-xs">
                  <span className="flex items-center gap-1.5">
                     <Shield size={12} className="text-orange-400" />
                     Confidencial
                  </span>
                  <span className="flex items-center gap-1.5">
                     <Database size={12} className="text-orange-400" />
                     {market.amostras} imóveis analisados
                  </span>
               </div>
               <p className="text-emerald-400/40 text-xs">01 / {totalPages}</p>
            </footer>
         </div>

         {/* =================================================================================
          PÁGINA 2: METODOLOGIA AVALUZ - LOCAÇÃO
      ================================================================================= */}
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
               <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}14, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-emerald-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                        <Brain size={16} className="text-emerald-400" />
                     </div>
                     <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase">Processo Técnico</p>
                  </div>
                  <h2 className="text-white font-bold text-2xl">
                     Metodologia da Avaliação
                  </h2>
               </div>
                <div className="flex items-center gap-3">
                   {broker?.logo_imobiliaria_url && (
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30 flex-shrink-0">
                         <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                      </div>
                   )}
                   {broker?.avatar_url && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/30">
                         <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                      </div>
                   )}
                   <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
                </div>
            </header>

            <div className="relative z-10 p-8 flex-1 flex flex-col gap-6">
               
               <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 backdrop-blur-xl border border-emerald-400/20 rounded-2xl p-5">
                  <p className="text-emerald-100/80 text-sm leading-relaxed">
                     O <span className="text-emerald-400 font-semibold">Método Comparativo Direto de Aluguel</span> é a metodologia mais utilizada 
                     para definição de valores locatícios, seguindo padrões normativos (ABNT NBR 14653). 
                     Nosso sistema potencializa essa abordagem com tecnologia e análise de mercado em tempo real.
                  </p>
               </div>

               {/* Steps */}
               <div className="space-y-3">
                  {[
                     { num: 1, title: "Coleta de Dados", desc: "Identificação de imóveis similares para locação na região, considerando área, tipologia e padrão.", icon: Database },
                     { num: 2, title: "Análise de Mercado", desc: "Avaliação dos valores praticados, velocidade de locação e tendências de demanda na região.", icon: LineChart },
                     { num: 3, title: "Filtros de Comparação", desc: "Seleção das amostras mais relevantes por localização, características e valor de aluguel.", icon: Filter },
                     { num: 4, title: "Cálculo Estatístico", desc: "Processamento dos dados para determinar faixas de aluguel: agressivo, equilibrado e premium.", icon: Calculator }
                  ].map(step => (
                     <div key={step.num} className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                           <step.icon size={20} className="text-emerald-400" />
                        </div>
                        <div className="flex-1 bg-emerald-500/5 backdrop-blur-xl border border-emerald-400/10 rounded-xl p-4">
                           <div className="flex items-center gap-3 mb-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">{step.num}</span>
                              <h4 className="text-white font-semibold">{step.title}</h4>
                           </div>
                           <p className="text-emerald-200/60 text-sm">{step.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Rental-specific advantage */}
               <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                           <Clock size={18} className="text-emerald-400" />
                        </div>
                        <h4 className="text-white font-semibold text-sm">Velocidade de Locação</h4>
                     </div>
                     <p className="text-emerald-100/60 text-xs leading-relaxed">
                        Imóveis bem precificados têm <span className="text-emerald-400 font-medium">3x mais chances</span> de 
                        serem alugados nos primeiros 30 dias.
                     </p>
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                           <PiggyBank size={18} className="text-orange-400" />
                        </div>
                        <h4 className="text-white font-semibold text-sm">Custo da Vacância</h4>
                     </div>
                     <p className="text-emerald-100/60 text-xs leading-relaxed">
                        Cada mês vazio custa ao proprietário <span className="text-orange-400 font-medium">100% do aluguel</span> que 
                        poderia estar recebendo.
                     </p>
                  </div>
               </div>

            </div>

            <footer className="relative z-10 p-10 border-t border-emerald-400/10 flex justify-between items-center">
               <p className="text-emerald-400/40 text-xs">Avaluz • Estudo de Locação</p>
               <p className="text-emerald-400/40 text-xs">02 / {totalPages}</p>
            </footer>
         </div>

         {/* =================================================================================
          PÁGINAS DE MARKETING (CONDICIONAIS)
      ================================================================================= */}
         {showMarketing && (
         <>
         {/* Funil de Locação - Página de Marketing 1 */}
         {showRentalFunnel && (
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
               <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}14, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-emerald-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                        <Activity size={16} className="text-emerald-400" />
                     </div>
                     <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase">Processo</p>
                  </div>
                  <h2 className="text-white font-bold text-2xl">
                     Funil de Locação
                  </h2>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30 flex-shrink-0">
                        <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/30">
                        <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
               </div>
            </header>

            <div className="relative z-10 p-8 flex-1 flex flex-col gap-4">
               
               {/* Etapas do Funil */}
               {[
                  { num: 1, title: "Captação e Preparação", desc: "Análise do imóvel, definição de preço e preparação para locação.", color: "blue", icon: Home },
                  { num: 2, title: "Divulgação", desc: "Publicação em portais, redes sociais e ativação da rede de contatos.", color: "purple", icon: Eye },
                  { num: 3, title: "Visitas", desc: "Agendamento e condução de visitas com candidatos qualificados.", color: "orange", icon: CalendarDays },
                  { num: 4, title: "Análise Cadastral", desc: "Verificação de documentos, renda e referências do candidato.", color: "teal", icon: UserCheck },
                  { num: 5, title: "Aprovação", desc: "Validação do perfil e definição de garantias (fiador, seguro, caução).", color: "pink", icon: ClipboardCheck },
                  { num: 6, title: "Contrato", desc: "Elaboração e assinatura do contrato de locação.", color: "indigo", icon: FileCheck },
                  { num: 7, title: "Entrega das Chaves", desc: "Vistoria de entrada e entrega formal do imóvel ao inquilino.", color: "emerald", icon: Key }
               ].map((etapa, index) => {
                  const colorMap: Record<string, { bg: string, border: string, text: string, gradient: string }> = {
                     blue: { bg: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-400/20', text: 'text-blue-400', gradient: 'from-blue-400 to-blue-600' },
                     purple: { bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-400/20', text: 'text-purple-400', gradient: 'from-purple-400 to-purple-600' },
                     orange: { bg: 'from-orange-500/20 to-orange-600/20', border: 'border-orange-400/20', text: 'text-orange-400', gradient: 'from-orange-400 to-orange-600' },
                     teal: { bg: 'from-teal-500/20 to-teal-600/20', border: 'border-teal-400/20', text: 'text-teal-400', gradient: 'from-teal-400 to-teal-600' },
                     pink: { bg: 'from-pink-500/20 to-pink-600/20', border: 'border-pink-400/20', text: 'text-pink-400', gradient: 'from-pink-400 to-pink-600' },
                     indigo: { bg: 'from-indigo-500/20 to-indigo-600/20', border: 'border-indigo-400/20', text: 'text-indigo-400', gradient: 'from-indigo-400 to-indigo-600' },
                     emerald: { bg: 'from-emerald-500/20 to-emerald-600/20', border: 'border-emerald-400/20', text: 'text-emerald-400', gradient: 'from-emerald-400 to-emerald-600' }
                  };
                  const colors = colorMap[etapa.color];
                  
                  return (
                     <div key={etapa.num} className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                           <etapa.icon size={20} className={colors.text} />
                        </div>
                        <div className="flex-1 bg-emerald-500/5 backdrop-blur-xl border border-emerald-400/10 rounded-xl p-3">
                           <div className="flex items-center gap-2 mb-1">
                              <span className={`${colors.text} text-[10px] font-bold`}>0{etapa.num}</span>
                              <h4 className="text-white font-semibold text-sm">{etapa.title}</h4>
                           </div>
                           <p className="text-emerald-200/60 text-xs">{etapa.desc}</p>
                        </div>
                        {index < 6 && (
                           <ChevronRight size={16} className="text-emerald-500/30 flex-shrink-0" />
                        )}
                     </div>
                  );
               })}

               {/* Summary Card - Processo Completo */}
               <div className="mt-auto bg-gradient-to-r from-emerald-500/20 to-emerald-600/15 border border-emerald-500/40 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-emerald-500/25 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={24} className="text-emerald-400" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-white font-bold text-lg mb-2">Processo Completo</h4>
                        <p className="text-emerald-100/80 text-sm leading-relaxed">
                           Um processo organizado transmite <span className="text-emerald-400 font-semibold">profissionalismo e segurança</span> para proprietários e inquilinos, garantindo uma locação tranquila e bem-sucedida.
                        </p>
                     </div>
                  </div>
               </div>

            </div>

            <footer className="relative z-10 p-8 border-t border-emerald-400/10 flex justify-between items-center">
               <p className="text-emerald-400/40 text-xs">Avaluz • Estudo de Locação</p>
               <p className="text-emerald-400/40 text-xs">03 / {totalPages}</p>
            </footer>
         </div>
         )}

         {/* Indicadores de Performance - Página de Marketing 2 */}
         {showIndicators && (
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
               <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}14, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-emerald-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                        <BarChart3 size={16} className="text-emerald-400" />
                     </div>
                     <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase">Indicadores</p>
                  </div>
                  <h2 className="text-white font-bold text-2xl">
                     Indicadores de Performance
                  </h2>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30 flex-shrink-0">
                        <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/30">
                        <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
               </div>
            </header>

            <div className="relative z-10 p-8 flex-1 flex flex-col">
               
               {/* Indicators Grid */}
               <div className={`grid ${showRentalTime ? 'grid-cols-2' : 'grid-cols-3'} gap-4 mb-6`}>
                  
                  {showRentalTime && (
                     <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <Clock size={18} className="text-emerald-400" />
                           </div>
                           <h4 className="text-white font-semibold text-sm">Tempo Médio de Locação</h4>
                        </div>
                        <p className="text-white font-bold text-2xl mb-1">{rentalTimeText}</p>
                        <p className="text-emerald-100/60 text-xs leading-relaxed">
                           {rentalTimeDescription}
                        </p>
                     </div>
                  )}

                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                           <AlertTriangle size={18} className="text-orange-400" />
                        </div>
                        <h4 className="text-white font-semibold text-sm">Risco de Vacância</h4>
                     </div>
                     <p className="text-green-400 font-bold text-2xl mb-1">Baixo</p>
                     <p className="text-emerald-100/60 text-xs leading-relaxed">
                        Com base na demanda da região e características do imóvel.
                     </p>
                  </div>

                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                           <Target size={18} className="text-blue-400" />
                        </div>
                        <h4 className="text-white font-semibold text-sm">Competitividade</h4>
                     </div>
                     <p className="text-emerald-400 font-bold text-2xl mb-1">Alta</p>
                     <p className="text-emerald-100/60 text-xs leading-relaxed">
                        Preço alinhado com o mercado da região, atraindo inquilinos qualificados.
                     </p>
                  </div>

                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                           <Wallet size={18} className="text-purple-400" />
                        </div>
                        <h4 className="text-white font-semibold text-sm">Custo Total Mensal</h4>
                     </div>
                     <p className="text-white font-bold text-2xl mb-1">{fmtMoney(custoTotal)}</p>
                     <p className="text-emerald-100/60 text-xs leading-relaxed">
                        Inclui aluguel, condomínio e IPTU mensalizado.
                     </p>
                  </div>

               </div>

               {/* Perfil Ideal */}
               <div className="bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-5 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Users size={18} className="text-emerald-400" />
                     </div>
                     <h4 className="text-white font-semibold">Perfil Ideal do Inquilino</h4>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                     {[
                        { label: property.quartos >= 3 ? 'Família' : property.quartos >= 2 ? 'Casal' : 'Solteiro', icon: Users },
                        { label: 'Renda 3x aluguel', icon: Wallet },
                        { label: 'Longo prazo', icon: Clock },
                        { label: property.locaisProximos?.includes('metrô') ? 'Mobilidade' : 'Estabilidade', icon: MapPin }
                     ].map((item, i) => (
                        <div key={i} className="bg-emerald-500/10 rounded-lg p-2 text-center">
                           <item.icon size={16} className="text-emerald-400 mx-auto mb-1" />
                           <p className="text-white text-xs font-medium">{item.label}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Estratégia de Anúncio */}
               <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-5 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Sparkles size={18} className="text-orange-400" />
                     </div>
                     <h4 className="text-white font-semibold">Estratégia de Anúncio para Locação</h4>
                  </div>
                  <p className="text-emerald-100/70 text-sm mb-3 leading-relaxed">
                     Para locação, o foco é <span className="text-emerald-400 font-medium">velocidade e praticidade</span>. 
                     Diferente da venda, o inquilino busca soluções rápidas.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                     {[
                        '✓ Pronto para morar',
                        getMobiliadoLabel(property.mobiliado) === 'Mobiliado' ? '✓ Mobiliado completo' : '✓ Aceita mobília',
                        '✓ Chaves na mão',
                        '✓ Documentação em ordem',
                        '✓ Fotos funcionais',
                        '✓ Destaque para localização'
                     ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-emerald-200/80 text-xs">
                           <span>{item}</span>
                        </div>
                     ))}
                  </div>
               </div>

            </div>

            <footer className="relative z-10 p-8 border-t border-emerald-400/10 flex justify-between items-center">
               <p className="text-emerald-400/40 text-xs">Avaluz • Estudo de Locação</p>
               <p className="text-emerald-400/40 text-xs">04 / {totalPages}</p>
            </footer>
         </div>
         )}
         </>
         )}

         {/* =================================================================================
          PÁGINA 5: IDENTIFICAÇÃO DO IMÓVEL
      ================================================================================= */}
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-emerald-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                        <Building2 size={16} className="text-emerald-400" />
                     </div>
                     <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase">Objeto da Avaliação</p>
                  </div>
                  <h2 className="text-white font-bold text-2xl">
                     Identificação do Imóvel
                  </h2>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30 flex-shrink-0">
                        <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/30">
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
                        <div className="w-full h-full bg-gradient-to-br from-emerald-900/50 to-emerald-950/80 flex items-center justify-center">
                           <Building2 size={48} className="text-emerald-700/50" />
                        </div>
                     )}
                     <div className="absolute top-3 left-3">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/90 rounded-full px-2.5 py-1">
                           <Key size={10} className="text-white" />
                           <span className="text-white text-[10px] font-medium uppercase">Locação</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Location + Client Card */}
                  <div className="w-1/2 flex flex-col gap-3">
                     <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <MapPin size={14} className="text-orange-400" />
                           <p className="text-emerald-300/60 text-[10px] uppercase tracking-[0.15em]">Localização</p>
                        </div>
                        <p className="text-white font-medium text-sm">{property.rua ? `${property.rua}, ` : ''}{property.bairro}</p>
                        <p className="text-emerald-300/60 text-xs">{property.municipio} - {property.estado}</p>
                        {property.cep && <p className="text-emerald-300/50 text-xs mt-1">CEP: {property.cep}</p>}
                     </div>
                     
                     {/* Client */}
                     <div className="bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 border border-emerald-400/30 rounded-xl p-3">
                        <p className="text-emerald-400 text-[9px] uppercase tracking-[0.15em] mb-1">Preparado para</p>
                        {hasClientData ? (
                           <>
                              <p className="text-white font-semibold text-sm">{displayClientName}</p>
                           </>
                        ) : (
                           <p className="text-emerald-300/50 italic text-xs">Cliente não informado</p>
                        )}
                     </div>
                  </div>
               </div>

               {/* Specs Grid - Basic */}
               <div className="grid grid-cols-6 gap-2">
                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                     <Ruler size={14} className="text-emerald-400 mb-1" />
                     <p className="text-white font-bold text-sm">{property.area}</p>
                     <p className="text-emerald-300/50 text-[8px] uppercase">m²</p>
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                     <BedDouble size={14} className="text-emerald-400 mb-1" />
                     <p className="text-white font-bold text-sm">{property.quartos}</p>
                     <p className="text-emerald-300/50 text-[8px] uppercase">Quartos</p>
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                     <Home size={14} className="text-emerald-400 mb-1" />
                     <p className="text-white font-bold text-sm">{property.suites || '-'}</p>
                     <p className="text-emerald-300/50 text-[8px] uppercase">Suítes</p>
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                     <Bath size={14} className="text-emerald-400 mb-1" />
                     <p className="text-white font-bold text-sm">{property.banheiros || '-'}</p>
                     <p className="text-emerald-300/50 text-[8px] uppercase">Banheiros</p>
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                     <Car size={14} className="text-emerald-400 mb-1" />
                     <p className="text-white font-bold text-sm">{property.vagas || '-'}</p>
                     <p className="text-emerald-300/50 text-[8px] uppercase">Vagas</p>
                  </div>
                  {getMobiliadoLabel(property.mobiliado) && (
                     <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-2 flex flex-col items-center justify-center text-center">
                        <Sofa size={14} className="text-orange-400 mb-1" />
                        <p className="text-white font-bold text-[9px]">{getMobiliadoLabel(property.mobiliado)}</p>
                        <p className="text-emerald-300/50 text-[8px] uppercase">Mobília</p>
                     </div>
                  )}
               </div>

               {/* Cost Breakdown - Important for Rental */}
               <div className="bg-gradient-to-r from-orange-500/15 to-orange-600/10 border border-orange-500/30 rounded-xl p-4">
                  <p className="text-orange-400 text-xs uppercase tracking-wider mb-3 font-medium">Custo Mensal Total para o Inquilino</p>
                  <div className="grid grid-cols-4 gap-3">
                     <div className="text-center">
                        <p className="text-emerald-300/60 text-[10px] uppercase mb-1">Aluguel</p>
                        <p className="text-white font-bold text-lg">{fmtMoney(market.valor_estimado)}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-emerald-300/60 text-[10px] uppercase mb-1">Condomínio</p>
                        <p className="text-white font-bold text-lg">{property.condominio ? fmtMoney(property.condominio) : '-'}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-emerald-300/60 text-[10px] uppercase mb-1">IPTU (mensal)</p>
                        <p className="text-white font-bold text-lg">{iptuMensal > 0 ? fmtMoney(iptuMensal) : '-'}</p>
                     </div>
                     <div className="text-center bg-orange-500/20 rounded-lg p-2">
                        <p className="text-orange-400 text-[10px] uppercase mb-1 font-medium">Total</p>
                        <p className="text-orange-400 font-bold text-xl">{fmtMoney(custoTotal)}</p>
                     </div>
                  </div>
               </div>

                {/* Description and Features */}
                {property.descricao && (
                   <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2">
                         <FileText size={14} className="text-emerald-400" />
                         <p className="text-emerald-300/60 text-[10px] uppercase tracking-[0.15em]">Descrição</p>
                      </div>
                      <p className="text-emerald-100/80 text-sm leading-relaxed line-clamp-4 break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{property.descricao}</p>
                   </div>
                )}

               {/* Ratings Grid */}
               {(property.avaliacaoTecnica || property.localizacao || property.planta || property.acabamentos || property.conservacao || property.areasComuns) && (
                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-2 mb-3">
                        <Star size={14} className="text-orange-400" />
                        <p className="text-emerald-300/60 text-[10px] uppercase tracking-[0.15em]">Avaliação do Imóvel</p>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                        {property.avaliacaoTecnica && renderRating(property.avaliacaoTecnica, 'Técnica')}
                        {property.localizacao && renderRating(property.localizacao, 'Localização')}
                        {property.planta && renderRating(property.planta, 'Planta')}
                        {property.acabamentos && renderRating(property.acabamentos, 'Acabamentos')}
                        {property.conservacao && renderRating(property.conservacao, 'Conservação')}
                        {property.areasComuns && renderRating(property.areasComuns, 'Áreas Comuns')}
                     </div>
                  </div>
               )}

               {/* Features */}
               {property.features && property.features.length > 0 && (
                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4">
                     <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <p className="text-emerald-300/60 text-[10px] uppercase tracking-[0.15em]">Diferenciais</p>
                     </div>
                     <div className="flex flex-wrap gap-1.5">
                        {property.features.slice(0, 15).map((feat, i) => (
                           <span key={i} className="bg-emerald-500/20 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                              {feat}
                           </span>
                        ))}
                        {property.features.length > 15 && (
                           <span className="text-emerald-400 text-[10px] px-2 py-0.5">
                              +{property.features.length - 15} mais
                           </span>
                        )}
                     </div>
                  </div>
               )}

            </div>

            <footer className="relative z-10 p-8 border-t border-emerald-400/10 flex justify-between items-center">
               <p className="text-emerald-400/40 text-xs">Avaluz • Estudo de Locação</p>
               <p className="text-emerald-400/40 text-xs">05 / {totalPages}</p>
            </footer>
         </div>

         {/* =================================================================================
          PÁGINAS DE AMOSTRAS (COMPARÁVEIS DE ALUGUEL)
      ================================================================================= */}
         {samplesToShow.map((sample, index) => {
            const pageNum = 6 + index; // Começa na página 6
            const diffValue = sample.valor - market.valor_estimado;
            const diffPercent = market.valor_estimado > 0 ? (diffValue / market.valor_estimado) * 100 : 0;
            const isPositive = diffValue > 0;
            
            return (
               <div key={sample.id} className={pageClass} style={pageStyle}>
                  
                  <div className="absolute inset-0 overflow-hidden">
                     <div className="absolute top-20 right-20 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
                  </div>

                   <header className="relative z-10 p-8 border-b border-emerald-400/10 flex justify-between items-start">
                      <div>
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                               <span className="text-emerald-400 font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
                            </div>
                            <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase">Amostra Comparável</p>
                         </div>
                         <h2 className="text-white font-bold text-2xl">
                            Imóvel para Locação #{index + 1}
                         </h2>
                      </div>
                       <div className="flex items-center gap-3">
                          {broker?.logo_imobiliaria_url && (
                             <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30 flex-shrink-0">
                                <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                             </div>
                          )}
                          {broker?.avatar_url && (
                             <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/30">
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
                     return (
                              <div className="h-72 rounded-2xl overflow-hidden mb-6 relative bg-gradient-to-br from-emerald-900/50 to-emerald-950/80">
                                 <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                                    <Building2 size={64} className="text-emerald-700/50" />
                                 </div>
                                 {sample.link && (
                                    <a href={sample.link} target="_blank" rel="noopener noreferrer" 
                                       className="absolute bottom-4 right-4 bg-emerald-500/95 backdrop-blur rounded-full px-3 py-1.5 z-10 hover:bg-emerald-400 transition-colors inline-flex items-center gap-1.5 shadow-lg">
                                       <ExternalLink size={12} className="text-white" />
                                       <span className="text-white text-xs font-medium">Ver anúncio</span>
                                    </a>
                                 )}
                              </div>
                           );
                        }
                        
                        if (imageCount === 1) {
                        return (
                              <div className="h-72 rounded-2xl overflow-hidden mb-6 relative bg-gradient-to-br from-emerald-900/50 to-emerald-950/80">
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
                                    <div className="inline-flex items-center gap-2 bg-emerald-950/60 backdrop-blur rounded-full px-3 py-1.5">
                                       <Key size={12} className="text-emerald-400" />
                                        <span className="text-white text-xs font-medium">{sample.categoria || sample.titulo || 'Imóvel'}</span>
                                    </div>
                                 </div>
                                 {sample.link && (
                                    <a href={sample.link} target="_blank" rel="noopener noreferrer" 
                                       className="absolute bottom-4 right-4 bg-emerald-500/95 backdrop-blur rounded-full px-3 py-1.5 z-10 hover:bg-emerald-400 transition-colors inline-flex items-center gap-1.5 shadow-lg">
                                       <ExternalLink size={12} className="text-white" />
                                       <span className="text-white text-xs font-medium">Ver anúncio</span>
                                    </a>
                                 )}
                              </div>
                           );
                        }
                        
                        const gridClass = imageCount === 2 
                           ? "grid-cols-2" 
                           : imageCount === 3 
                              ? "grid-cols-3" 
                              : "grid-cols-2 grid-rows-2";
                        
                        return (
                           <div className={`grid ${gridClass} gap-2 h-80 rounded-2xl overflow-hidden mb-6 relative`}>
                              {sample.link && (
                                 <a href={sample.link} target="_blank" rel="noopener noreferrer" 
                                    className="absolute bottom-4 right-4 bg-emerald-500/95 backdrop-blur rounded-full px-3 py-1.5 z-20 hover:bg-emerald-400 transition-colors inline-flex items-center gap-1.5 shadow-lg">
                                    <ExternalLink size={12} className="text-white" />
                                    <span className="text-white text-xs font-medium">Ver anúncio</span>
                                 </a>
                              )}
                              {images.slice(0, 4).map((img, imgIdx) => (
                                 <div 
                                    key={imgIdx} 
                                    className={`relative bg-gradient-to-br from-emerald-900/50 to-emerald-950/80 ${imageCount === 3 && imgIdx === 2 ? 'col-span-1' : ''}`}
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
                                    {imgIdx === 0 && (
                                       <>
                                          <div className="absolute inset-0 bg-gradient-to-t from-[#061224]/60 via-transparent to-transparent pointer-events-none"></div>
                                          <div className="absolute top-2 left-2">
                                             <div className="inline-flex items-center gap-1 bg-emerald-950/60 backdrop-blur rounded-full px-2 py-1">
                                                <Key size={10} className="text-emerald-400" />
                                                 <span className="text-white text-[10px] font-medium">{sample.categoria || sample.titulo || 'Imóvel'}</span>
                                             </div>
                                          </div>
                                       </>
                                    )}
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
                       <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-2xl p-6 mb-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between gap-6 h-full">
                             <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                                <h3 className="text-white font-bold text-xl mb-2 line-clamp-2 break-words">{sample.titulo}</h3>
                                <p className="text-emerald-200/60 text-sm leading-relaxed line-clamp-[12] break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{sample.descricao}</p>
                             </div>
                             <div className="text-right flex-shrink-0">
                                <p className="text-emerald-300/50 text-xs uppercase mb-1">Valor</p>
                                <p className="text-white font-bold text-2xl">{fmtMoney(sample.valor)}<span className="text-sm font-normal text-emerald-300/60">/mês</span></p>
                                <p className="text-orange-400 text-sm">{fmtM2Simple(sample.valor, sample.area)}/m²</p>
                             </div>
                          </div>
                       </div>

                      {/* Location */}
                      {(sample.bairro || sample.rua || sample.municipio) && (
                         <div className="bg-emerald-500/10 backdrop-blur border border-emerald-400/20 rounded-xl p-3 mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                  <MapPin size={16} className="text-orange-400" />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-sm truncate">
                                     {sample.rua || sample.bairro}
                                  </p>
                                  <p className="text-emerald-300/60 text-xs">
                                     {sample.bairro}{sample.municipio ? `, ${sample.municipio}` : ''}{sample.estado ? ` - ${sample.estado}` : ''}
                                  </p>
                               </div>
                            </div>
                         </div>
                      )}

                      {/* Specs Grid */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                         <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                            <Ruler size={16} className="text-emerald-400 mb-1" />
                            <p className="text-white font-bold text-lg">{sample.area}</p>
                            <p className="text-emerald-300/50 text-[10px] uppercase">m²</p>
                         </div>
                         <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                            <BedDouble size={16} className="text-emerald-400 mb-1" />
                            <p className="text-white font-bold text-lg">{sample.quartos}</p>
                            <p className="text-emerald-300/50 text-[10px] uppercase">Quartos</p>
                         </div>
                         <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                            <Bath size={16} className="text-emerald-400 mb-1" />
                            <p className="text-white font-bold text-lg">{sample.banheiros}</p>
                            <p className="text-emerald-300/50 text-[10px] uppercase">Banheiros</p>
                         </div>
                         <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                            <Car size={16} className="text-emerald-400 mb-1" />
                            <p className="text-white font-bold text-lg">{sample.vagas}</p>
                            <p className="text-emerald-300/50 text-[10px] uppercase">Vagas</p>
                         </div>
                      </div>


                  </div>

                  <footer className="relative z-10 p-8 border-t border-emerald-400/10 flex justify-between items-center">
                     <p className="text-emerald-400/40 text-xs">Avaluz • Estudo de Locação</p>
                     <p className="text-emerald-400/40 text-xs">{String(pageNum).padStart(2, '0')} / {totalPages}</p>
                  </footer>
               </div>
            );
         })}

         {/* =================================================================================
          PÁGINA: DIAGNÓSTICO & ESTRATÉGIA (com gráfico comparativo)
      ================================================================================= */}
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}26, transparent, transparent)` }}></div>
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}1a, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-8 border-b border-emerald-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                        <BarChart3 size={16} className="text-emerald-400" />
                     </div>
                     <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase">Análise de Valor</p>
                  </div>
                  <h2 className="text-white font-bold text-2xl">
                     Diagnóstico & Estratégia
                  </h2>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30 flex-shrink-0">
                        <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/30">
                        <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
               </div>
            </header>

            <div className="relative z-10 p-8 flex-1 flex flex-col">

               {/* Property Mini Card */}
               <div className="flex items-center gap-4 bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 mb-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                     {property.foto_capa ? (
                        <img src={property.foto_capa} alt="Imóvel" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-emerald-900/50 flex items-center justify-center">
                           <Building2 size={24} className="text-emerald-700" />
                        </div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-white font-medium text-sm truncate">{property.bairro}</p>
                     <p className="text-emerald-300/60 text-xs">{property.municipio} - {property.estado}</p>
                     <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                        <span className="text-emerald-300/50 text-[10px]">{property.area}m²</span>
                        <span className="text-emerald-300/50 text-[10px]">•</span>
                        <span className="text-emerald-300/50 text-[10px]">{property.quartos} quartos</span>
                        {property.suites > 0 && (
                           <>
                              <span className="text-emerald-300/50 text-[10px]">•</span>
                              <span className="text-emerald-300/50 text-[10px]">{property.suites} suítes</span>
                           </>
                        )}
                        <span className="text-emerald-300/50 text-[10px]">•</span>
                        <span className="text-emerald-300/50 text-[10px]">{property.banheiros} banheiros</span>
                        <span className="text-emerald-300/50 text-[10px]">•</span>
                        <span className="text-emerald-300/50 text-[10px]">{property.vagas} vagas</span>
                     </div>
                  </div>
                   <div className="text-right">
                      <p className="text-emerald-300/50 text-[10px] uppercase">Aluguel Estimado</p>
                      <p className="text-orange-400 font-bold">{fmtMoney(market.valor_estimado)}/mês</p>
                   </div>
               </div>

               {/* Price Comparison Chart */}
               <PriceComparisonChart 
                  samples={samplesToShow}
                  evaluatedProperty={{
                     area: property.area,
                     valorEstimado: market.valor_estimado
                  }}
                  accentColor="emerald"
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
               <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/15 backdrop-blur-xl border-2 border-emerald-500/50 rounded-2xl p-5 mb-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
                  <div className="absolute top-3 right-3">
                     <div className="bg-emerald-500/30 rounded-full px-2 py-1">
                        <span className="text-emerald-300 text-[9px] uppercase font-bold">Recomendado</span>
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-emerald-300/60 text-xs uppercase tracking-wider mb-1">Aluguel de Equilíbrio</p>
                        <p className="text-white font-bold text-4xl">{fmtMoney(market.valor_estimado)}<span className="text-xl font-normal text-emerald-300/60">/mês</span></p>
                        <p className="text-orange-400 text-sm mt-1">{fmtM2Simple(market.valor_estimado, property.area)}/m²</p>
                     </div>
                  </div>
               </div>

               {/* Min/Max Cards (if enabled) */}
               {showMinMax ? (
                  <>
                     {(() => {
                        const cardCount = [showMaximo, showMinimo].filter(Boolean).length;
                        const gridCols = cardCount === 2 ? 'grid-cols-2' : 'grid-cols-1';
                        
                        return (
                           <div className={`grid ${gridCols} gap-4 mb-4`}>
                              {showMaximo && (
                                 <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400"></div>
                                    <div className="flex items-center gap-2 mb-2">
                                       <TrendingUp size={14} className="text-orange-400" />
                                       <span className="text-orange-400 text-[10px] uppercase tracking-wider font-medium">Aluguel Premium</span>
                                    </div>
                                    <p className="text-white font-bold text-lg mb-2">{fmtMoney(market.maximo)}<span className="text-sm font-normal text-emerald-300/60">/mês</span></p>
                                    <div className="space-y-1">
                                       <p className="text-emerald-100/70 text-[10px]"><span className="text-emerald-400 font-medium">Valor competitivo</span></p>
                                       {showRentalTime && (
                                          <p className="text-emerald-100/70 text-[10px]">Locação: <span className="text-white font-medium">{rentalTimeText}</span></p>
                                       )}
                                    </div>
                                 </div>
                              )}

                              {showMinimo && (
                                 <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                                    <div className="flex items-center gap-2 mb-2">
                                       <Zap size={14} className="text-green-400" />
                                       <span className="text-green-400 text-[10px] uppercase tracking-wider font-medium">Aluguel Agressivo</span>
                                    </div>
                                    <p className="text-white font-bold text-lg mb-2">{fmtMoney(market.minimo)}<span className="text-sm font-normal text-emerald-300/60">/mês</span></p>
                                    <div className="space-y-1">
                                       <p className="text-emerald-200/50 text-[10px]"><span className="text-green-400 font-medium">Aluga rápido</span></p>
                                       {showRentalTime && (
                                          <p className="text-emerald-200/50 text-[10px]">Locação: <span className="text-white font-medium">1-7 dias</span></p>
                                       )}
                                    </div>
                                 </div>
                              )}
                           </div>
                        );
                     })()}
                  </>
               ) : (
                  /* Single value card when no min/max is selected */
                  <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 backdrop-blur-xl border-2 border-emerald-500/40 rounded-xl p-8 mb-6 relative overflow-hidden">
                     <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
                     <div className="absolute top-3 right-3 bg-emerald-500/30 rounded-full px-2 py-1">
                        <span className="text-emerald-300 text-[9px] uppercase font-bold">Recomendado</span>
                     </div>
                     <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                           <Target size={18} className="text-emerald-400" />
                           <span className="text-emerald-400 text-xs uppercase tracking-wider font-medium">Aluguel de Equilíbrio</span>
                        </div>
                        <p className="text-white font-bold text-4xl mb-3">{fmtMoney(market.valor_estimado)}<span className="text-xl font-normal text-emerald-300/60">/mês</span></p>
                        <div className="flex items-center justify-center gap-4 text-sm">
                           <span className="text-emerald-100/70"><span className="text-emerald-400 font-medium">Valor competitivo</span></span>
                           {showRentalTime && (
                              <>
                                 <span className="text-emerald-200/40">•</span>
                                 <span className="text-emerald-100/70">Locação estimada: <span className="text-white font-medium">{rentalTimeText}</span></span>
                              </>
                            )}
                         </div>
                      </div>
                   </div>
               )}

               {/* Important Rental Notice */}
               <div className="bg-gradient-to-r from-orange-500/15 to-orange-600/10 border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                     <AlertCircle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
                     <div>
                        <h4 className="text-white font-semibold text-sm mb-1">Elasticidade de Preço</h4>
                        <p className="text-emerald-100/70 text-xs leading-relaxed">
                           Cada <span className="text-orange-400 font-medium">R$ 200 acima do mercado</span> pode representar 
                           <span className="text-orange-400 font-medium"> +30 dias de imóvel vazio</span>. O custo da vacância 
                           muitas vezes supera a diferença no valor do aluguel.
                        </p>
                     </div>
                  </div>
               </div>

            </div>

            <footer className="relative z-10 p-8 border-t border-emerald-400/10 flex justify-between items-center">
               <p className="text-emerald-400/40 text-xs">Avaluz • Estudo de Locação</p>
               <p className="text-emerald-400/40 text-xs">{String(5 + samplePages + 1).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>

         {/* =================================================================================
          PÁGINAS QUADRO COMPARATIVO (paginação automática se > 6 amostras)
      ================================================================================= */}
         {tableChunks.map((chunkSamples, chunkIndex) => {
            const isFirstTablePage = chunkIndex === 0;
            const isLastTablePage = chunkIndex === tableChunks.length - 1;
            const tablePageNumber = 5 + samplePages + 2 + chunkIndex;
            
            return (
               <div key={`table-page-${chunkIndex}`} className={pageClass} style={pageStyle}>
                  
                  <div className="absolute inset-0 overflow-hidden">
                     <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
                     <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}14, transparent, transparent)` }}></div>
                  </div>

                  <header className="relative z-10 p-8 border-b border-emerald-400/10 flex justify-between items-start">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                              <BarChart3 size={16} className="text-emerald-400" />
                           </div>
                           <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase">Análise Comparativa</p>
                        </div>
                        <h2 className="text-white font-bold text-2xl">
                           Quadro Comparativo
                           {tableChunks.length > 1 && <span className="text-emerald-300/60 text-lg ml-2">({chunkIndex + 1}/{tableChunks.length})</span>}
                        </h2>
                     </div>
                     <div className="flex items-center gap-3">
                        {broker?.logo_imobiliaria_url && (
                           <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30 flex-shrink-0">
                              <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                           </div>
                        )}
                        {broker?.avatar_url && (
                           <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/30">
                              <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                           </div>
                        )}
                        <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
                     </div>
                  </header>

                  <div className="relative z-10 p-6 flex-1 flex flex-col">
                     
                     {/* Tabela Comparativa */}
                     <div className="bg-emerald-500/5 backdrop-blur-xl border border-emerald-400/20 rounded-2xl overflow-hidden flex-1">
                        
                     {/* Header da Tabela */}
                        <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-emerald-400/10">
                           <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/15 p-3">
                              <p className="text-emerald-400 text-[10px] uppercase tracking-wider font-semibold">Imóvel</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Ruler size={14} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[9px] uppercase">Área</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <BedDouble size={14} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[9px] uppercase">Quartos</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Bath size={14} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[9px] uppercase">Banheiros</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Car size={14} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[9px] uppercase">Vagas</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <DollarSign size={14} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[9px] uppercase">Aluguel</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <TrendingUp size={14} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[9px] uppercase">R$/m²</p>
                           </div>
                        </div>

                        {/* Linha do Imóvel Avaliado (apenas na primeira página da tabela) */}
                        {isFirstTablePage && (
                           <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-emerald-400/10">
                              <div className="bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 p-3 flex items-center gap-3">
                                 <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 border-emerald-500/40">
                                    {property.foto_capa ? (
                                       <img src={property.foto_capa} alt="Seu Imóvel" className="w-full h-full object-cover" />
                                    ) : (
                                       <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center">
                                          <Home size={20} className="text-emerald-400" />
                                       </div>
                                    )}
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <p className="text-emerald-400 font-bold text-sm">Seu Imóvel</p>
                                    <p className="text-emerald-300/70 text-xs">{property.bairro}, {property.municipio}</p>
                                 </div>
                              </div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center">
                                 <p className="text-white font-bold text-sm">{property.area} m²</p>
                              </div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center">
                                 <p className="text-white font-bold text-sm">{property.quartos}</p>
                              </div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center">
                                 <p className="text-white font-bold text-sm">{property.banheiros}</p>
                              </div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center">
                                 <p className="text-white font-bold text-sm">{property.vagas}</p>
                              </div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center">
                                 <p className="text-emerald-400 font-bold text-sm">{fmtMoney(market.valor_estimado)}</p>
                              </div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center">
                                 <p className="text-emerald-400 font-semibold text-xs">{fmtM2Simple(market.valor_estimado, property.area)}</p>
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
                              <div key={sample.id} className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-emerald-400/10">
                                 <div className="bg-[#0A1E3C] p-3 flex items-center gap-3">
                                    {/* Sample number badge */}
                                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                       <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
                                          <span className="text-emerald-400 text-[10px] font-bold">{globalSampleNumber}</span>
                                       </div>
                                    </div>
                                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-emerald-400/30">
                                       {sampleImage ? (
                                          <img src={sampleImage} alt={displayTitle} className="w-full h-full object-cover" />
                                       ) : (
                                          <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center">
                                             <Building2 size={20} className="text-emerald-400" />
                                          </div>
                                       )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-white font-semibold text-xs line-clamp-2 leading-snug">{displayTitle}</p>
                                       <p className="text-emerald-300/70 text-[11px] truncate mt-0.5">{sample.bairro || property.bairro}{sample.municipio && `, ${sample.municipio}`}</p>
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
                              <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 text-center">
                                 <p className="text-emerald-300/60 text-[9px] uppercase tracking-wider mb-1">Média do Mercado</p>
                                 <p className="text-white font-bold text-lg">
                                    {fmtMoney(allSamples.reduce((acc, s) => acc + s.valor, 0) / allSamples.length)}
                                 </p>
                              </div>
                              <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 text-center">
                                 <p className="text-emerald-300/60 text-[9px] uppercase tracking-wider mb-1">Média R$/m²</p>
                                 <p className="text-white font-bold text-lg">
                                    {fmtM2Simple(
                                       allSamples.reduce((acc, s) => acc + s.valor, 0) / allSamples.length,
                                       allSamples.reduce((acc, s) => acc + s.area, 0) / allSamples.length
                                    )}
                                 </p>
                              </div>
                              <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 text-center">
                                 <p className="text-emerald-300/60 text-[9px] uppercase tracking-wider mb-1">Menor Aluguel</p>
                                 <p className="text-green-400 font-bold text-lg">
                                    {fmtMoney(Math.min(...allSamples.map(s => s.valor)))}
                                 </p>
                              </div>
                              <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 text-center">
                                 <p className="text-emerald-300/60 text-[9px] uppercase tracking-wider mb-1">Maior Aluguel</p>
                                 <p className="text-orange-400 font-bold text-lg">
                                    {fmtMoney(Math.max(...allSamples.map(s => s.valor)))}
                                 </p>
                              </div>
                           </div>

                           {/* Legenda */}
                           <div className="flex items-center justify-center gap-6 mt-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500"></div>
                                 <span className="text-emerald-300/60 text-[10px]">Seu Imóvel (valor estimado)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-green-400 text-[10px]">↓</span>
                                 <span className="text-emerald-300/60 text-[10px]">Abaixo da média</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-red-400 text-[10px]">↑</span>
                                 <span className="text-emerald-300/60 text-[10px]">Acima da média</span>
                              </div>
                           </div>
                        </>
                     )}

                  </div>

                  <footer className="relative z-10 p-6 border-t border-emerald-400/10 flex justify-between items-center">
                     <p className="text-emerald-400/40 text-xs">Avaluz • Estudo de Locação</p>
                     <p className="text-emerald-400/40 text-xs">{String(tablePageNumber).padStart(2, '0')} / {totalPages}</p>
                  </footer>
               </div>
            );
         })}

         {/* =================================================================================
          PÁGINA FINAL: CONCLUSÃO
      ================================================================================= */}
         <div className={pageClass} style={pageStyle}>
            
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}26, transparent, transparent)` }}></div>
            </div>

            <header className="relative z-10 p-10 border-b border-emerald-400/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                     </div>
                     <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase">Parecer Final</p>
                  </div>
                  <h2 className="text-white font-bold text-3xl">
                     Conclusão do Estudo
                  </h2>
               </div>
                <div className="flex items-center gap-3">
                   {broker?.logo_imobiliaria_url && (
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30 flex-shrink-0">
                         <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                      </div>
                   )}
                   {broker?.avatar_url && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500/30">
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
                        <div className="w-full h-full bg-gradient-to-br from-emerald-900/50 to-emerald-950/80 flex items-center justify-center">
                           <Building2 size={40} className="text-emerald-700/50" />
                        </div>
                     )}
                  </div>
                  <div className="flex-1">
                     <h3 className="text-white font-bold text-lg mb-1">{property.bairro}</h3>
                     <p className="text-emerald-200/60 text-sm mb-2">{property.municipio} - {property.estado}</p>
                     <div className="flex flex-wrap gap-2">
                        <span className="bg-emerald-500/20 rounded-full px-2 py-0.5 text-[10px] text-white">{property.area}m²</span>
                        <span className="bg-emerald-500/20 rounded-full px-2 py-0.5 text-[10px] text-white">{property.quartos} quartos</span>
                        {property.suites > 0 && (
                           <span className="bg-emerald-500/20 rounded-full px-2 py-0.5 text-[10px] text-white">{property.suites} suítes</span>
                        )}
                        <span className="bg-emerald-500/20 rounded-full px-2 py-0.5 text-[10px] text-white">{property.banheiros} banheiros</span>
                        <span className="bg-emerald-500/20 rounded-full px-2 py-0.5 text-[10px] text-white">{property.vagas} vagas</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-emerald-300/50 text-xs uppercase mb-1">Aluguel Recomendado</p>
                     <p className="text-emerald-400 font-bold text-xl">{fmtMoney(market.valor_estimado)}/mês</p>
                     <p className="text-orange-400 text-xs">Custo total: {fmtMoney(custoTotal)}/mês</p>
                  </div>
               </div>

               {/* Conclusion Text */}
               <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-2xl p-5 mb-6">
                  <h4 className="text-white font-semibold text-base mb-3">Parecer do Estudo de Locação</h4>
                  <p className="text-emerald-100/70 text-sm leading-relaxed mb-3">
                     Com base na análise de <span className="text-emerald-400 font-medium">{market.amostras} imóveis para locação</span> na 
                     região de <span className="text-white font-medium">{property.bairro}, {property.municipio}</span>, e considerando 
                     as características específicas do imóvel, concluímos que o valor de aluguel mensal 
                     recomendado é de <span className="text-emerald-400 font-bold">{fmtMoney(market.valor_estimado)}</span>.
                  </p>
                  <p className="text-emerald-100/70 text-sm leading-relaxed">
                     Este estudo tem caráter orientativo para definição de valor locatício e estratégia de mercado. 
                     O acompanhamento profissional do corretor responsável é fundamental para uma locação rápida e segura.
                  </p>
               </div>

                 {/* Broker Signature Card - Style matching cover page */}
                 {broker && (
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-lg shadow-emerald-500/10 flex-1 flex flex-col">
                       <div className="flex gap-8 items-center flex-1">
                          {/* Agency Column */}
                          <div className="flex-1 flex items-center gap-5">
                             <div className="w-28 h-28 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20 flex-shrink-0">
                                {broker.logo_imobiliaria_url ? (
                                   <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center bg-emerald-500/20">
                                      <Building2 size={40} className="text-emerald-400" />
                                   </div>
                                )}
                             </div>
                             <div>
                                <p className="text-emerald-400 text-[11px] uppercase tracking-[0.15em] mb-1">Imobiliária</p>
                                <h3 className="text-white font-bold text-lg leading-tight">{broker.imobiliaria || 'Imobiliária'}</h3>
                             </div>
                          </div>

                          {/* Divider */}
                          <div className="w-px h-20 bg-emerald-400/30" />

                          {/* Broker Column */}
                          <div className="flex-1 flex items-center gap-5">
                             <div className="w-28 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20 flex-shrink-0">
                                {broker.avatar_url ? (
                                   <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center">
                                      <User size={40} className="text-emerald-400" />
                                   </div>
                                )}
                             </div>
                            <div>
                               <p className="text-emerald-400 text-[11px] uppercase tracking-[0.15em] mb-1">Corretor Responsável</p>
                               <h3 className="text-white font-bold text-lg leading-tight">{broker.nome || 'Especialista'}</h3>
                               {broker.creci && (
                                  <p className="text-emerald-300/70 text-xs mt-1 flex items-center gap-1.5">
                                     <Award size={11} className="text-emerald-400" />
                                     CRECI {broker.creci}
                                  </p>
                               )}
                               {showBrokerContact && (brokerPhone || brokerEmail) && (
                                  <div className="mt-1.5 space-y-0.5">
                                     {brokerPhone && (
                                        <p className="text-emerald-100/70 text-xs flex items-center gap-1.5">
                                           <Phone size={10} className="text-emerald-400" />
                                           {brokerPhone}
                                        </p>
                                     )}
                                     {brokerEmail && (
                                        <p className="text-emerald-100/70 text-xs flex items-center gap-1.5">
                                           <Mail size={10} className="text-emerald-400" />
                                           {brokerEmail}
                                        </p>
                                     )}
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>

                      {/* Signature Row */}
                      <div className="flex items-center gap-4 pt-4 mt-4 border-t border-emerald-500/30">
                         <div className="flex-1">
                            <p className="text-emerald-300/60 text-xs">Data do Estudo</p>
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
                                  <div className="w-40 border-b border-emerald-500/30 mt-1" />
                                   <p className="text-emerald-300/60 text-[10px] mt-1">Assinatura do Corretor</p>
                               </div>
                            ) : (
                               <div className="flex flex-col items-end">
                                  <div className="w-40 h-12 border-b-2 border-dashed border-emerald-500/40" />
                                  <p className="text-emerald-300/60 text-[10px] mt-1">Assinatura do Corretor</p>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                )}

            </div>

            {/* Footer */}
            <footer className="relative z-10 p-10 border-t border-emerald-400/10">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <img src={avaluzLogo} alt="Avaluz" className="h-10 w-auto" />
                     </div>
                     <p className="text-emerald-300/50 text-xs max-w-md">
                        Este documento é um estudo de mercado para fins de orientação comercial e definição de valor locatício. 
                        Não substitui laudo de avaliação oficial para fins jurídicos ou financeiros.
                     </p>
                  </div>
                  <p className="text-emerald-400/40 text-xs">{String(totalPages).padStart(2, '0')} / {totalPages}</p>
               </div>
            </footer>
         </div>

      </div>
   );
};
