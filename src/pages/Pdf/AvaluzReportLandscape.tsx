// AvaluzReportLandscape.tsx - Versão Landscape 16:9 com PARIDADE TOTAL ao PDF original
// Mesmos dados, mesma estrutura, mesmas informações - apenas reorganizado para 297mm x 210mm

import React from 'react';
import avaluzLogo from '@/assets/avaluz-logo-transparent.png';
import propertyPlaceholder from '@/assets/property-placeholder.jpg';
import { PriceComparisonChart } from './components/PriceComparisonChart';
import { getImageUrlForPdf, getCoverPhotoForPdf } from '@/lib/pdfImages';
import { PdfThemeStyles } from '@/components/pdf/PdfThemeStyles';
import {
   Building2, MapPin, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Brain, Zap, Target,
   Clock, Shield, BarChart3, ArrowRight, Sparkles, Database, LineChart, Filter, Calculator,
   ChevronRight, BedDouble, Bath, Car, Ruler, User, Users, Mail, Award, Phone, Home,
   AlertCircle, Layers, Activity, Eye, DollarSign, Star, ExternalLink, FileText, Sofa, Scale,
   ThumbsUp, Palette, Wrench, Trees
} from 'lucide-react';

// --- Interfaces (idênticas ao portrait) ---
interface ClientData { nome: string; email?: string; telefone?: string; }

interface PropertyData {
   id: number; rua: string | null; bairro: string; municipio: string; estado: string;
   area: number; quartos: number; banheiros?: number; suites?: number; vagas: number | null;
   valor_atual: number; tipo: string; foto_capa?: string | null; descricao?: string | null;
   cep?: string; condominio?: number; iptu?: number; aVenda?: boolean; linkVenda?: string;
   mobiliado?: string; situacaoLegal?: string[]; locaisProximos?: string;
   avaliacaoTecnica?: number; localizacao?: number; planta?: number; acabamentos?: number;
   conservacao?: number; areasComuns?: number; features?: string[];
   especificacoes?: { tipo?: string; checklist?: Record<string, boolean>; detalhes?: Record<string, string | number | null>; };
}

interface SimilarProperty {
   id: number; titulo: string; categoria?: string; descricao: string; valor: number; area: number;
   quartos: number; suites?: number; banheiros: number; vagas: number; imagem: string;
   imagens?: string[]; status: 'ativo' | 'vendido'; link?: string;
   rua?: string | null; bairro?: string | null; municipio?: string | null; estado?: string | null;
}

interface BrokerData {
   nome: string | null; email: string | null; creci: string | null; avatar_url: string | null;
   imobiliaria?: string | null; telefone?: string | null; logo_imobiliaria_url?: string | null;
   signature_url?: string | null; telefone_custom?: string | null; email_custom?: string | null;
}

interface MarketData {
   valor_estimado: number; confianca: number; amostras: number; minimo: number;
   medio: number; maximo: number; similares: SimilarProperty[];
}

interface MarketingPlanSettings {
   introduction?: { enabled: boolean };
   pillars?: { enabled: boolean; items?: Record<string, boolean>; };
   funnel?: { enabled: boolean; items?: Record<string, boolean>; };
   benefits?: { enabled: boolean };
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
   showMinimo?: boolean; showMaximo?: boolean; showMarketingPlan?: boolean;
   marketingPlan?: MarketingPlanSettings; showClient?: boolean; showClientEmail?: boolean;
   showClientPhone?: boolean; showBrokerContact?: boolean;
   pdfColors?: PdfColors;
}

interface ReportProps {
   clientName: string; client?: ClientData; property: PropertyData;
   market: MarketData; broker?: BrokerData; settings?: PdfSettings;
}

// --- Componente Principal Landscape ---
export const AvaluzReportLandscape: React.FC<ReportProps> = ({
   clientName = "Cliente Avaluz", client, property, market, broker,
   settings = { showMinimo: true, showMaximo: true }
}) => {
   // Cores do PDF (usa customizadas ou padrão)
   const c = settings.pdfColors || DEFAULT_COLORS;
   // Configurações (idênticas ao portrait)
   const showMinimo = settings.showMinimo !== false;
   const showMaximo = settings.showMaximo !== false;
   const showMinMax = showMinimo || showMaximo;
   const showMarketing = settings.showMarketingPlan !== false;
   const showClient = settings.showClient !== false;
   const showClientEmail = settings.showClientEmail !== false;
   const showClientPhone = settings.showClientPhone !== false;
   const showBrokerContact = settings.showBrokerContact !== false;

   const mp = settings.marketingPlan || {};
   const showIntroduction = showMarketing && mp.introduction?.enabled !== false;
   const showPillars = showMarketing && mp.pillars?.enabled !== false;
   const showFunnel = showMarketing && mp.funnel?.enabled !== false;
   const showBenefits = showMarketing && mp.benefits?.enabled !== false;

   const brokerPhone = broker?.telefone_custom || broker?.telefone;
   const brokerEmail = broker?.email_custom || broker?.email;

   // Formatters
   const fmtMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
   const fmtM2 = (val: number, area: number) => area > 0 ? fmtMoney(val / area) + "/m²" : "-";
   const fmtM2Simple = (val: number, area: number) => area > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val / area) : "-";

   const diferenca = property.valor_atual - market.valor_estimado;
   const percentual = market.valor_estimado > 0 ? (diferenca / market.valor_estimado) * 100 : 0;
   const confiancaDisplay = market.confianca < 1 ? Math.round(market.confianca * 100) : Math.round(market.confianca);

   const sliderPosition = (() => {
      const range = market.maximo - market.minimo;
      if (range <= 0) return 50;
      const position = ((market.valor_estimado - market.minimo) / range) * 100;
      return Math.max(0, Math.min(100, position));
   })();

   // Samples logic (idêntica ao portrait)
   const allSamples = market.similares;
   const SAMPLES_PER_TABLE_PAGE = 6;
   const tableChunks: typeof allSamples[] = [];
   for (let i = 0; i < allSamples.length; i += SAMPLES_PER_TABLE_PAGE) {
      tableChunks.push(allSamples.slice(i, i + SAMPLES_PER_TABLE_PAGE));
   }
   const samplesToShow = allSamples.slice(0, 6);

   // Page count (idêntica ao portrait)
   const marketingPageCount = showMarketing 
      ? (showIntroduction ? 1 : 0) + (showPillars ? 2 : 0) + (showFunnel ? 1 : 0) + (showBenefits ? 1 : 0)
      : 0;
   const tablePages = tableChunks.length || 1;
   const basePages = 5 + marketingPageCount + tablePages;
   const samplePages = samplesToShow.length;
   const totalPages = basePages + samplePages;

   const hasClientData = client?.nome || clientName !== "Cliente Avaluz";
   const displayClientName = client?.nome || clientName;

   // Helpers
   const renderRating = (value?: number, label?: string) => {
      if (!value) return null;
      const stars = [];
      for (let i = 1; i <= 5; i++) {
         stars.push(<Star key={i} size={8} className={i <= value ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />);
      }
      return (
         <div className="flex items-center gap-1">
            {label && <span className="text-slate-400 text-[8px] mr-0.5">{label}:</span>}
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
         'escriturado': 'Escriturado', 'registrado': 'Registrado',
         'com_habite_se': 'Com Habite-se', 'direito_possessorio': 'Direito Possessório'
      };
      return arr.map(s => map[s] || s).join(', ');
   };

   // Landscape page class: 297mm x 210mm - dynamic colors
   const pageStyle = { background: `linear-gradient(to bottom right, ${c.backgroundGradientFrom}, ${c.backgroundGradientVia}, ${c.backgroundGradientTo})` };
   const pageClass = "w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break";

    return (
       <div className="w-full py-10 font-inter flex flex-col items-center gap-8 print:p-0 print:gap-0 pdf-theme" style={{ backgroundColor: c.background, color: c.text }}>
          <PdfThemeStyles colors={c} />

          {/* ================= PÁGINA 1: CAPA ================= */}
          <div className="w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break" style={pageStyle}>
             {/* Background decorations - enhanced */}
             <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}40, ${c.secondary}26, transparent)` }}></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}33, transparent, transparent)` }}></div>
             </div>
             <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${c.secondary}4d 1px, transparent 1px), linear-gradient(90deg, ${c.secondary}4d 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

             {/* Header - compacto */}
             <header className="relative z-10 px-8 py-2 flex justify-between items-center">
                <img src={avaluzLogo} alt="Avaluz" className="h-8 w-auto opacity-80" />
                <div className="flex items-center gap-6 text-right">
                   <p className="text-blue-300/80 text-sm font-medium">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                   <p className="text-blue-400/60 text-xs">ID: AVL-{property.id.toString().padStart(6, '0')}</p>
                </div>
             </header>

             {/* Main Content - redesigned for impact */}
             <div className="relative z-10 flex-1 flex px-8 py-3 gap-6">
                {/* Left: Hero Image - LARGER and more prominent */}
                <div className="w-[50%] relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/50 to-blue-950/80 shadow-2xl border border-blue-500/20">
                   {getCoverPhotoForPdf(property.foto_capa) ? (
                      <div className="absolute inset-0" style={{ backgroundImage: `url("${getCoverPhotoForPdf(property.foto_capa)}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                   ) : (
                      <div className="absolute inset-0 w-full h-full">
                         <img src={propertyPlaceholder} alt="" className="w-full h-full object-cover opacity-50" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 size={100} className="text-blue-700/30" />
                         </div>
                      </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-[#061224]/90 via-transparent to-transparent"></div>
                   
                   {/* Type Badge - larger */}
                   <div className="absolute top-5 left-5">
                      <div className="inline-flex items-center gap-2 bg-orange-500/95 rounded-full px-4 py-2 shadow-lg">
                         <span className="text-white text-sm font-bold uppercase tracking-wider">{property.tipo}</span>
                      </div>
                   </div>

                </div>

                {/* Right: Info - enhanced typography */}
                <div className="w-[50%] flex flex-col justify-between gap-3">
                   {/* Title Section */}
                   <div>
                      <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/40 rounded-full px-4 py-1.5 mb-3">
                         <Star size={14} className="text-orange-400" />
                         <span className="text-sm text-orange-300 tracking-wide font-medium">Estudo de Mercado Profissional</span>
                      </div>
                      <h1 className="font-inter font-bold text-3xl leading-tight mb-2">
                         <span className="text-white">Avaliação Estratégica</span><br />
                         <span className="text-orange-400">de Valor de Mercado</span>
                      </h1>
                      <p className="text-blue-200/70 text-sm">Método Comparativo Direto • Análise de {market.amostras} Imóveis</p>
                   </div>

                   {/* Specs Grid - larger */}
                   <div className="grid grid-cols-5 gap-2">
                      {[
                         { value: property.area, label: 'm² úteis' },
                         { value: property.quartos, label: 'Quartos' },
                         { value: property.banheiros || '-', label: 'Banheiros' },
                         { value: property.suites || '-', label: 'Suítes' },
                         { value: property.vagas || '-', label: 'Vagas' }
                      ].map((item, i) => (
                         <div key={i} className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3 text-center">
                            <p className="text-white font-bold text-xl">{item.value}</p>
                            <p className="text-blue-300/70 text-[10px] uppercase tracking-wide mt-0.5">{item.label}</p>
                         </div>
                      ))}
                   </div>

                   {/* Location Card - larger */}
                   <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <MapPin size={24} className="text-orange-400" />
                         </div>
                         <div className="min-w-0 flex-1">
                            <p className="text-white font-semibold text-lg truncate">{property.rua || property.bairro}</p>
                            <p className="text-blue-300/70 text-sm truncate">{property.bairro}, {property.municipio} - {property.estado}</p>
                         </div>
                      </div>
                   </div>

                   {/* Client Card - larger */}
                   {showClient && (
                      <div className="bg-gradient-to-r from-blue-500/15 to-blue-600/10 border border-blue-400/30 rounded-xl p-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                               <User size={24} className="text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                               <p className="text-blue-400 text-xs uppercase tracking-wider mb-1">Preparado para</p>
                               {hasClientData ? (
                                  <p className="text-white font-semibold text-lg truncate">{displayClientName}</p>
                               ) : (
                                  <p className="text-blue-300/60 italic text-sm">Cliente não informado</p>
                               )}
                            </div>
                         </div>
                      </div>
                   )}
                </div>
             </div>

             {/* Broker Footer - enhanced */}
             {broker && (
                <div className="relative z-10 mx-8 mb-3 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/40 rounded-xl p-4">
                   <div className="flex gap-6 items-center">
                      <div className="flex-1 flex items-center gap-4 min-w-0">
                         <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/50 flex-shrink-0">
                            {broker.logo_imobiliaria_url ? (
                               <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center bg-orange-500/20"><Building2 size={32} className="text-orange-400" /></div>
                            )}
                         </div>
                         <div className="min-w-0">
                            <p className="text-orange-400 text-xs uppercase tracking-wider">Imobiliária</p>
                            <h3 className="text-white font-bold text-base truncate">{broker.imobiliaria || 'Imobiliária'}</h3>
                         </div>
                      </div>
                      <div className="w-px h-16 bg-orange-400/30" />
                      <div className="flex-1 flex items-center gap-4 min-w-0">
                         <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500/30 to-orange-600/20 border-2 border-orange-500/50 flex-shrink-0">
                            {broker.avatar_url ? (
                               <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center"><User size={32} className="text-orange-400" /></div>
                            )}
                         </div>
                         <div className="min-w-0">
                            <p className="text-orange-400 text-xs uppercase tracking-wider">Corretor</p>
                            <h3 className="text-white font-bold text-base truncate">{broker.nome || 'Especialista'}</h3>
                            {broker.creci && <p className="text-blue-300/70 text-sm flex items-center gap-1"><Award size={12} className="text-orange-400 flex-shrink-0" /><span className="truncate">CRECI {broker.creci}</span></p>}
                         </div>
                      </div>
                      {showBrokerContact && (brokerPhone || brokerEmail) && (
                         <>
                            <div className="w-px h-12 bg-orange-400/30" />
                            <div className="flex flex-col gap-1 min-w-0">
                               {brokerPhone && <p className="text-blue-100/80 text-sm flex items-center gap-2 truncate"><Phone size={14} className="text-orange-400 flex-shrink-0" /><span className="truncate">{brokerPhone}</span></p>}
                               {brokerEmail && <p className="text-blue-100/80 text-sm flex items-center gap-2 truncate"><Mail size={14} className="text-orange-400 flex-shrink-0" /><span className="truncate">{brokerEmail}</span></p>}
                            </div>
                         </>
                      )}
                   </div>
                </div>
             )}

             {/* Footer */}
             <footer className="relative z-10 px-8 py-2 flex justify-between items-center border-t border-blue-400/10">
                <div className="flex items-center gap-3 text-sm text-blue-300/60">
                   <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-semibold">CONFIDENCIAL</span>
                   <span className="flex items-center gap-1.5"><Database size={14} className="text-orange-400" />{market.amostras} imóveis analisados</span>
                </div>
                <p className="text-blue-400/50 text-sm font-medium">01 / {totalPages}</p>
             </footer>
          </div>

          {/* ================= PÁGINA 2: METODOLOGIA ================= */}
          <div className={pageClass} style={pageStyle}>
             {/* Background decorations */}
             <div className="absolute inset-0 overflow-hidden">
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}26, transparent, transparent)` }}></div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
             </div>

             {/* Header - compacto */}
             <header className="relative z-10 px-8 py-2 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 flex items-center justify-center">
                      <Brain size={20} className="text-orange-400" />
                   </div>
                   <div>
                      <p className="text-orange-400 text-xs tracking-[0.15em] uppercase font-medium">Processo Técnico</p>
                      <h2 className="text-white font-bold text-2xl">Metodologia da Avaliação</h2>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   {broker?.logo_imobiliaria_url && <div className="h-12 w-12 rounded-xl overflow-hidden bg-white/10 border border-orange-400/30"><img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" /></div>}
                   {broker?.avatar_url && <div className="w-12 h-12 rounded-xl overflow-hidden border border-orange-500/30"><img src={broker.avatar_url} alt="" className="w-full h-full object-cover" /></div>}
                   <img src={avaluzLogo} alt="Avaluz" className="h-10 w-auto opacity-80" />
                </div>
             </header>

             {/* Main content - 2 columns, enhanced */}
             <div className="relative z-10 flex-1 flex px-8 py-4 gap-8">
                {/* Left Column: Intro + Steps */}
                <div className="w-[55%] flex flex-col gap-4">
                   {/* Intro Box - full content from portrait */}
                   <div className="bg-gradient-to-r from-blue-500/15 to-blue-600/10 backdrop-blur-xl border border-blue-400/25 rounded-xl p-4">
                      <p className="text-blue-100/90 text-sm leading-relaxed">
                         Nossa metodologia combina <span className="text-orange-400 font-semibold">inteligência de dados</span> e <span className="text-orange-400 font-semibold">expertise imobiliária</span>, 
                         fornecendo ao corretor uma ferramenta poderosa para embasar suas recomendações com precisão e credibilidade.
                      </p>
                   </div>

                   {/* Steps - larger grid layout */}
                   <div className="grid grid-cols-2 gap-3 flex-1">
                      {[
                         { num: 1, icon: Database, title: "Coleta de Dados", desc: "Capturamos milhares de anúncios e dados de transações reais na região do imóvel." },
                         { num: 2, icon: Filter, title: "Seleção de Comparáveis", desc: "Algoritmos identificam imóveis verdadeiramente comparáveis por tipologia e localização." },
                         { num: 3, icon: Activity, title: "Análise Estatística", desc: "Aplicamos métodos estatísticos para determinar a faixa de valor mais provável." },
                         { num: 4, icon: Calculator, title: "Resultado Final", desc: "Valor apresentado com nível de confiança baseado na qualidade das amostras." }
                      ].map((step) => (
                         <div key={step.num} className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4 flex flex-col">
                            <div className="flex items-center gap-3 mb-2">
                               <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                                  <step.icon size={18} className="text-orange-400" />
                               </div>
                               <div>
                                  <span className="text-orange-500/70 text-xs font-medium">0{step.num}</span>
                                  <h4 className="text-white font-semibold text-base">{step.title}</h4>
                               </div>
                            </div>
                            <p className="text-blue-200/70 text-sm leading-relaxed flex-1">{step.desc}</p>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Right Column: Strategy Cards + Quote */}
                <div className="w-[45%] flex flex-col gap-4">
                   {/* Por que o Preço Correto Importa - larger */}
                   <div className="bg-blue-500/15 backdrop-blur-xl border border-blue-400/25 rounded-xl p-5 flex-1">
                      <div className="flex items-center gap-4 mb-3">
                         <div className="w-12 h-12 rounded-xl bg-orange-500/25 flex items-center justify-center">
                            <Clock size={24} className="text-orange-400" />
                         </div>
                         <h4 className="text-white font-bold text-xl">Por que o Preço Correto Importa?</h4>
                      </div>
                      <p className="text-blue-100/80 text-base leading-relaxed">
                         Imóveis precificados corretamente vendem <span className="text-orange-400 font-semibold text-lg">3x mais rápido</span>. 
                         O primeiro mês é crucial — imóveis com preço acima do mercado perdem até 60% das visitas qualificadas.
                      </p>
                      <div className="mt-4 flex gap-3">
                         <div className="flex-1 bg-blue-500/20 rounded-lg p-3 text-center">
                            <p className="text-orange-400 font-bold text-2xl">3x</p>
                            <p className="text-blue-300/60 text-xs">mais rápido</p>
                         </div>
                         <div className="flex-1 bg-blue-500/20 rounded-lg p-3 text-center">
                            <p className="text-orange-400 font-bold text-2xl">60%</p>
                            <p className="text-blue-300/60 text-xs">visitas perdidas</p>
                         </div>
                      </div>
                   </div>

                   {/* Proteção de Valor - larger */}
                   <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/25 rounded-xl p-5 flex-1">
                      <div className="flex items-center gap-4 mb-3">
                         <div className="w-12 h-12 rounded-xl bg-blue-500/25 flex items-center justify-center">
                            <Shield size={24} className="text-blue-400" />
                         </div>
                         <h4 className="text-white font-bold text-xl">Proteção de Valor</h4>
                      </div>
                      <p className="text-blue-100/80 text-base leading-relaxed">
                         Um posicionamento estratégico evita desvalorizações desnecessárias e protege o patrimônio do proprietário durante toda a negociação.
                      </p>
                   </div>

                   {/* Quote */}
                   <div className="bg-gradient-to-r from-orange-500/15 to-blue-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-center">
                      <p className="text-blue-100/90 text-base italic text-center font-medium">
                         "Um imóvel bem posicionado não vende por sorte — vende por estratégia."
                      </p>
                   </div>
                </div>
             </div>

             {/* Footer */}
             <footer className="relative z-10 px-8 py-2 border-t border-blue-400/10 flex justify-between items-center">
                <p className="text-blue-400/50 text-sm">Avaluz • Estudo de Mercado</p>
                <p className="text-blue-400/50 text-sm font-medium">02 / {totalPages}</p>
             </footer>
          </div>

         {/* ================= PÁGINAS DE MARKETING (CONDICIONAIS) ================= */}
         {showMarketing && (
         <>
         {/* Introdução */}
         {showIntroduction && (
         <div className={pageClass} style={pageStyle}>
            <header className="relative z-10 px-8 py-4 border-b border-blue-400/10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/25 to-orange-600/20 flex items-center justify-center border border-orange-400/20">
                     <Sparkles size={24} className="text-orange-400" />
                  </div>
                  <div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase font-medium">Estratégia Personalizada</p>
                     <h2 className="text-white font-bold text-2xl">Plano de Marketing Imobiliário</h2>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30">
                        <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                        <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
               </div>
            </header>

            <div className="relative z-10 flex-1 flex px-8 py-5 gap-6">
               {/* Left Column: O que é + Por que */}
               <div className="w-1/2 flex flex-col gap-4">
                  {/* O que é este Plano */}
                  <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/15 border border-orange-500/40 rounded-2xl p-6 flex-1">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/25 flex items-center justify-center flex-shrink-0">
                           <FileText size={24} className="text-orange-400" />
                        </div>
                        <h3 className="text-white font-bold text-xl">O que é este Plano de Marketing?</h3>
                     </div>
                     <p className="text-blue-100/90 text-base leading-relaxed mb-4">
                        Este documento apresenta uma <span className="text-orange-400 font-semibold">estratégia estruturada e personalizada</span> para 
                        a comercialização do seu imóvel, desenvolvida com base nas melhores práticas do mercado imobiliário.
                     </p>
                     <p className="text-blue-100/80 text-base leading-relaxed">
                        Diferente de abordagens genéricas, este plano foi criado considerando as características específicas 
                        do seu imóvel, o perfil de compradores da região e as dinâmicas atuais do mercado em <span className="text-white font-semibold">{property.bairro}, {property.municipio}</span>.
                     </p>
                  </div>

                  {/* Quote motivacional */}
                  <div className="bg-gradient-to-r from-blue-500/15 to-blue-600/10 border border-blue-400/30 rounded-xl p-5 flex items-center justify-center">
                     <p className="text-blue-100/90 text-lg italic text-center font-medium">
                        "Um imóvel bem posicionado e bem apresentado não vende por sorte — vende por estratégia."
                     </p>
                  </div>
               </div>

               {/* Right Column: Objetivo + Cards */}
               <div className="w-1/2 flex flex-col gap-4">
                  {/* Objetivo Estratégico */}
                  <div className="bg-blue-500/15 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/25 flex items-center justify-center flex-shrink-0">
                           <Target size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-white font-bold text-xl">Objetivo Estratégico</h3>
                     </div>
                     <p className="text-blue-100/90 text-base leading-relaxed">
                        O objetivo central é <span className="text-orange-400 font-semibold">maximizar o valor percebido</span>, 
                        <span className="text-orange-400 font-semibold"> reduzir o tempo de venda</span> e 
                        <span className="text-orange-400 font-semibold"> gerar segurança</span> em todo o processo de comercialização.
                     </p>
                  </div>

                  {/* Grid de Benefícios - 3 cards */}
                  <div className="grid grid-cols-3 gap-4 flex-1">
                     <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                           <TrendingUp size={28} className="text-green-400" />
                        </div>
                        <p className="text-white font-bold text-base mb-1">Posicionamento Correto</p>
                        <p className="text-blue-300/70 text-sm">Preço alinhado com o mercado atual</p>
                     </div>
                     <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center mb-3">
                           <Shield size={28} className="text-orange-400" />
                        </div>
                        <p className="text-white font-bold text-base mb-1">Preservação de Valor</p>
                        <p className="text-blue-300/70 text-sm">Evitar desvalorização por tempo</p>
                     </div>
                     <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                           <User size={28} className="text-blue-400" />
                        </div>
                        <p className="text-white font-bold text-base mb-1">Demanda Qualificada</p>
                        <p className="text-blue-300/70 text-sm">Atrair compradores com perfil ideal</p>
                     </div>
                  </div>
               </div>
            </div>

            <footer className="relative z-10 px-8 py-3 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/50 text-sm">Avaluz • Plano de Marketing</p>
               <p className="text-blue-400/50 text-sm font-medium">03 / {totalPages}</p>
            </footer>
         </div>
         )}

         {/* Pilares Estratégicos - Página 1 (Pilares 01-03) */}
         {showPillars && (
         <div className={pageClass} style={pageStyle}>
            <header className="relative z-10 px-8 py-4 border-b border-blue-400/10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/25 to-orange-600/20 flex items-center justify-center border border-orange-400/20">
                     <Layers size={24} className="text-orange-400" />
                  </div>
                  <div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase font-medium">Fundamentos</p>
                     <h2 className="text-white font-bold text-2xl">Pilares Estratégicos</h2>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30">
                        <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                        <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
               </div>
            </header>

            <div className="relative z-10 flex-1 flex px-8 py-5 gap-5">
               {/* 3 Pilares em layout horizontal */}
               {[
                  { num: '01', icon: Scale, color: 'green', title: "Precificação Inteligente", desc: "A precificação correta é o fundamento de qualquer venda bem-sucedida. Utilizamos análise de dados de mercado para posicionar o imóvel de forma competitiva.", items: ["Análise de comparativos", "Faixas de preço estratégicas"] },
                  { num: '02', icon: Palette, color: 'purple', title: "Conteúdo e Apresentação", desc: "A primeira impressão é decisiva. Investimos em produção visual de alto padrão e narrativa que destaca os diferenciais do imóvel.", items: ["Fotos e vídeos profissionais", "Tour virtual 360°"] },
                  { num: '03', icon: Users, color: 'blue', title: "Experiência do Cliente", desc: "Cada interação com o comprador é uma oportunidade de encantar. Criamos experiências memoráveis em todas as etapas do processo.", items: ["Visitas personalizadas", "Atendimento consultivo"] }
               ].map((pillar) => {
                  const colorMap: Record<string, { bg: string, border: string, text: string, badge: string, icon: string }> = {
                     green: { bg: 'from-green-500/20 to-green-600/20', border: 'border-green-400/30', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400', icon: 'text-green-400' },
                     purple: { bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-400/30', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-400', icon: 'text-purple-400' },
                     blue: { bg: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-400/30', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400', icon: 'text-blue-400' }
                  };
                  const colors = colorMap[pillar.color];
                  
                  return (
                     <div key={pillar.num} className="flex-1 bg-blue-500/10 backdrop-blur-xl border border-blue-400/25 rounded-2xl p-6 flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                           <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}>
                              <pillar.icon size={32} className={colors.icon} />
                           </div>
                           <div className="flex-1">
                              <span className={`${colors.badge} text-sm font-bold px-3 py-1 rounded-full inline-block mb-2`}>{pillar.num}</span>
                              <h4 className="text-white font-bold text-xl">{pillar.title}</h4>
                           </div>
                        </div>
                        <p className="text-blue-100/80 text-base leading-relaxed mb-4 flex-1">{pillar.desc}</p>
                        <div className="space-y-2">
                           {pillar.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-blue-100/70">
                                 <CheckCircle2 size={16} className={colors.text} />
                                 <span>{item}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  );
               })}
            </div>

            <footer className="relative z-10 px-8 py-3 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/50 text-sm">Avaluz • Plano de Marketing</p>
               <p className="text-blue-400/50 text-sm font-medium">04 / {totalPages}</p>
            </footer>
         </div>
         )}

         {/* Pilares Estratégicos - Página 2 (Pilares 04-06) */}
         {showPillars && (
         <div className={pageClass} style={pageStyle}>
            <header className="relative z-10 px-8 py-4 border-b border-blue-400/10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/25 to-orange-600/20 flex items-center justify-center border border-orange-400/20">
                     <Layers size={24} className="text-orange-400" />
                  </div>
                  <div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase font-medium">Fundamentos</p>
                     <h2 className="text-white font-bold text-2xl">Pilares Estratégicos</h2>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30">
                        <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                        <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
               </div>
            </header>

            <div className="relative z-10 flex-1 flex px-8 py-5 gap-5">
               {/* 3 Pilares em layout horizontal */}
               {[
                  { num: '04', icon: Target, color: 'orange', title: "Publicidade Digital Segmentada", desc: "Campanhas estratégicas para alcançar compradores qualificados nos canais mais efetivos para o perfil do imóvel.", items: ["Google Ads e Meta Ads", "Retargeting inteligente"], impact: "Alcançar compradores certos, no momento certo, com a mensagem certa." },
                  { num: '05', icon: Eye, color: 'pink', title: "Redes Sociais e Engajamento", desc: "Presença estratégica nas principais redes sociais para ampliar a visibilidade e gerar interesse orgânico.", items: ["Instagram e Facebook", "Stories e Reels"], impact: "Visibilidade massiva e engajamento com potenciais compradores." },
                  { num: '06', icon: Users, color: 'teal', title: "Parcerias Estratégicas", desc: "Rede de parceiros e corretores para ampliar o alcance e acelerar a comercialização do imóvel.", items: ["Rede de corretores parceiros", "Parcerias com imobiliárias"], impact: "Multiplicar a exposição e acelerar o processo de venda." }
               ].map((pillar) => {
                  const colorMap: Record<string, { bg: string, border: string, text: string, badge: string, icon: string, impactBg: string }> = {
                     orange: { bg: 'from-orange-500/20 to-orange-600/20', border: 'border-orange-400/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400', icon: 'text-orange-400', impactBg: 'bg-orange-500/15 border-orange-500/30' },
                     pink: { bg: 'from-pink-500/20 to-pink-600/20', border: 'border-pink-400/30', text: 'text-pink-400', badge: 'bg-pink-500/20 text-pink-400', icon: 'text-pink-400', impactBg: 'bg-pink-500/15 border-pink-500/30' },
                     teal: { bg: 'from-teal-500/20 to-teal-600/20', border: 'border-teal-400/30', text: 'text-teal-400', badge: 'bg-teal-500/20 text-teal-400', icon: 'text-teal-400', impactBg: 'bg-teal-500/15 border-teal-500/30' }
                  };
                  const colors = colorMap[pillar.color];
                  
                  return (
                     <div key={pillar.num} className="flex-1 bg-blue-500/10 backdrop-blur-xl border border-blue-400/25 rounded-2xl p-6 flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                           <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}>
                              <pillar.icon size={32} className={colors.icon} />
                           </div>
                           <div className="flex-1">
                              <span className={`${colors.badge} text-sm font-bold px-3 py-1 rounded-full inline-block mb-2`}>{pillar.num}</span>
                              <h4 className="text-white font-bold text-xl">{pillar.title}</h4>
                           </div>
                        </div>
                        <p className="text-blue-100/80 text-base leading-relaxed mb-3">{pillar.desc}</p>
                        <div className="space-y-2 mb-4">
                           {pillar.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-blue-100/70">
                                 <CheckCircle2 size={16} className={colors.text} />
                                 <span>{item}</span>
                              </div>
                           ))}
                        </div>
                        <div className={`mt-auto ${colors.impactBg} border rounded-xl p-3`}>
                           <p className={`${colors.text} text-sm font-medium`}>
                              <span className="font-bold">IMPACTO:</span> {pillar.impact}
                           </p>
                        </div>
                     </div>
                  );
               })}
            </div>

            <footer className="relative z-10 px-8 py-3 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/50 text-sm">Avaluz • Plano de Marketing</p>
               <p className="text-blue-400/50 text-sm font-medium">05 / {totalPages}</p>
            </footer>
         </div>
         )}

         {/* Funil de Vendas - Otimizado para TV */}
         {showFunnel && (
         <div className={pageClass} style={pageStyle}>
            {/* Header TV-Optimized */}
            <header className="relative z-10 px-8 py-4 border-b border-blue-400/10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-amber-400/20">
                     <Filter size={24} className="text-amber-400" />
                  </div>
                  <div>
                     <p className="text-amber-400 text-xs tracking-[0.2em] uppercase font-semibold">Funil de Vendas</p>
                     <h2 className="text-white font-bold text-2xl">Ações de Marketing</h2>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30">
                        <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                        <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
               </div>
            </header>

            {/* Intro Text */}
            <div className="relative z-10 px-8 pt-4 pb-2">
               <p className="text-blue-200/70 text-base leading-relaxed">
                  As ações de marketing seguem um <span className="text-white font-semibold">funil estruturado</span>, onde cada etapa prepara o terreno para a próxima.
               </p>
            </div>

            {/* 5 Steps - TV Layout 3+2 Grid */}
            <div className="relative z-10 flex-1 flex flex-col px-8 py-4 gap-4">
               {/* Top Row - 3 Cards */}
               <div className="flex gap-4 flex-1">
                  {[
                     { num: 1, colorHex: '#3b82f6', title: 'Estrutura e Segurança', desc: 'Organização documental completa e análise jurídica do imóvel para garantir um processo seguro e transparente.', impact: 'Confiança ao comprador' },
                     { num: 2, colorHex: '#14b8a6', title: 'Preparação Visual', desc: 'Home staging, reparos estratégicos, fotos e vídeos profissionais para causar primeira impressão impactante.', impact: 'Destaque nos portais' },
                     { num: 3, colorHex: '#f59e0b', title: 'Divulgação Estratégica', desc: 'Publicação em portais premium, redes sociais, anúncios pagos e ativação de rede de parcerias.', impact: 'Fluxo de interessados' }
                  ].map((step) => (
                     <div 
                        key={step.num} 
                        className="flex-1 min-w-0 rounded-2xl p-5 flex flex-col border backdrop-blur-sm relative overflow-hidden"
                        style={{ 
                           background: `linear-gradient(135deg, ${step.colorHex}18, ${step.colorHex}08)`,
                           borderColor: `${step.colorHex}35`
                        }}
                     >
                        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ background: step.colorHex }} />
                        <div className="flex items-center gap-4 mb-3 pt-1">
                           <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                              style={{ background: `linear-gradient(135deg, ${step.colorHex}, ${step.colorHex}bb)`, boxShadow: `0 4px 12px -3px ${step.colorHex}50` }}
                           >
                              <span className="text-white font-bold text-xl">{step.num}</span>
                           </div>
                           <h4 className="text-white font-bold text-lg leading-snug">{step.title}</h4>
                        </div>
                        <p className="text-blue-100/80 text-base leading-relaxed flex-1 mb-3">{step.desc}</p>
                        <div className="mt-auto rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: `${step.colorHex}20`, borderLeft: `4px solid ${step.colorHex}` }}>
                           <ArrowRight size={16} style={{ color: step.colorHex }} className="flex-shrink-0" />
                           <span className="text-white/90 text-sm font-medium">{step.impact}</span>
                        </div>
                     </div>
                  ))}
               </div>
               
               {/* Bottom Row - 2 Cards Centered */}
               <div className="flex gap-4 flex-1 justify-center">
                  {[
                     { num: 4, colorHex: '#f43f5e', title: 'Conversão e Fechamento', desc: 'Agendamento estratégico de visitas, técnicas de negociação profissional e fechamento assertivo do negócio.', impact: 'Venda acelerada' },
                     { num: 5, colorHex: '#10b981', title: 'Acompanhamento Contínuo', desc: 'Relatórios periódicos, análise detalhada de visitas e ajustes contínuos na estratégia para otimizar resultados.', impact: 'Decisão com dados' }
                  ].map((step) => (
                     <div 
                        key={step.num} 
                        className="flex-1 max-w-[calc(33.333%-0.5rem)] min-w-0 rounded-2xl p-5 flex flex-col border backdrop-blur-sm relative overflow-hidden"
                        style={{ 
                           background: `linear-gradient(135deg, ${step.colorHex}18, ${step.colorHex}08)`,
                           borderColor: `${step.colorHex}35`
                        }}
                     >
                        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ background: step.colorHex }} />
                        <div className="flex items-center gap-4 mb-3 pt-1">
                           <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                              style={{ background: `linear-gradient(135deg, ${step.colorHex}, ${step.colorHex}bb)`, boxShadow: `0 4px 12px -3px ${step.colorHex}50` }}
                           >
                              <span className="text-white font-bold text-xl">{step.num}</span>
                           </div>
                           <h4 className="text-white font-bold text-lg leading-snug">{step.title}</h4>
                        </div>
                        <p className="text-blue-100/80 text-base leading-relaxed flex-1 mb-3">{step.desc}</p>
                        <div className="mt-auto rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: `${step.colorHex}20`, borderLeft: `4px solid ${step.colorHex}` }}>
                           <ArrowRight size={16} style={{ color: step.colorHex }} className="flex-shrink-0" />
                           <span className="text-white/90 text-sm font-medium">{step.impact}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <footer className="relative z-10 px-8 py-3 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/50 text-sm">Avaluz • Plano de Marketing</p>
               <p className="text-blue-400/50 text-sm font-medium">{String(6 + (showIntroduction ? 0 : -1) + (showPillars ? 0 : -2)).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>
         )}

         {/* Benefícios - Otimizado para TV */}
         {showBenefits && (
         <div className={pageClass} style={pageStyle}>
            {/* Header TV-Optimized */}
            <header className="relative z-10 px-8 py-4 border-b border-blue-400/10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-400/20">
                     <Star size={24} className="text-orange-400" />
                  </div>
                  <div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase font-semibold">Vantagens Exclusivas</p>
                     <h2 className="text-white font-bold text-2xl">Benefícios para o Proprietário</h2>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/30">
                        <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                        <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
               </div>
            </header>

            {/* Grid 3+2 de Benefícios - TV Optimized */}
            <div className="relative z-10 flex-1 flex flex-col px-8 py-4 gap-4">
               
               {/* Top Row - 3 Cards */}
               <div className="flex gap-4 flex-1">
                  {[
                     { icon: Eye, color: 'green', colorHex: '#22c55e', title: 'Transparência Total', desc: 'Relatórios periódicos com todas as ações realizadas, visualizações, contatos recebidos e feedbacks de visitas.' },
                     { icon: Shield, color: 'orange', colorHex: '#f97316', title: 'Segurança Jurídica', desc: 'Suporte na análise documental e acompanhamento em todas as etapas da transação até o fechamento.' },
                     { icon: User, color: 'blue', colorHex: '#3b82f6', title: 'Visibilidade Qualificada', desc: 'Seu imóvel exposto para compradores com real interesse e capacidade financeira para a aquisição.' }
                  ].map((benefit, index) => (
                     <div key={index} className="flex-1 bg-blue-500/10 backdrop-blur-xl border border-blue-400/25 rounded-2xl p-5 flex flex-col">
                        <div className="flex items-center gap-4 mb-3">
                           <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: `${benefit.colorHex}30` }}
                           >
                              <benefit.icon size={24} style={{ color: benefit.colorHex }} />
                           </div>
                           <h4 className="text-white font-bold text-lg">{benefit.title}</h4>
                        </div>
                        <p className="text-blue-100/75 text-base leading-relaxed">{benefit.desc}</p>
                     </div>
                  ))}
               </div>
               
               {/* Bottom Row - 2 Cards Centered */}
               <div className="flex gap-4 justify-center">
                  {[
                     { icon: BarChart3, color: 'purple', colorHex: '#a855f7', title: 'Controle do Processo', desc: 'Acompanhamento em tempo real do status da comercialização com métricas claras e objetivas.' },
                     { icon: Database, color: 'teal', colorHex: '#14b8a6', title: 'Decisões Baseadas em Dados', desc: 'Recomendações fundamentadas em análises de mercado reais, comparativos de vendas e tendências da região.' }
                  ].map((benefit, index) => (
                     <div key={index} className="flex-1 max-w-[calc(33.333%-0.5rem)] bg-blue-500/10 backdrop-blur-xl border border-blue-400/25 rounded-2xl p-5 flex flex-col">
                        <div className="flex items-center gap-4 mb-3">
                           <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: `${benefit.colorHex}30` }}
                           >
                              <benefit.icon size={24} style={{ color: benefit.colorHex }} />
                           </div>
                           <h4 className="text-white font-bold text-lg">{benefit.title}</h4>
                        </div>
                        <p className="text-blue-100/75 text-base leading-relaxed">{benefit.desc}</p>
                     </div>
                  ))}
               </div>

               {/* Compromisso Card - Full Width */}
               <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/15 border-2 border-orange-500/40 rounded-2xl p-5 flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 flex items-center justify-center flex-shrink-0">
                     <Sparkles size={28} className="text-orange-400" />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-white font-bold text-lg mb-1">Compromisso com Resultados</h4>
                     <p className="text-blue-100/80 text-sm leading-relaxed">
                        Este plano é uma <span className="text-orange-400 font-semibold">estratégia completa de proteção do seu patrimônio</span>. 
                        Buscamos garantir o <span className="text-orange-400 font-semibold">melhor valor possível</span>, 
                        no <span className="text-orange-400 font-semibold">menor tempo</span>, com total <span className="text-orange-400 font-semibold">segurança</span>.
                     </p>
                  </div>
                  <p className="text-orange-400 font-semibold text-sm italic max-w-xs text-right">
                     "Seu imóvel merece ser estrategicamente posicionado para vender."
                  </p>
               </div>
            </div>

            <footer className="relative z-10 px-8 py-3 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/50 text-sm">Avaluz • Plano de Marketing</p>
               <p className="text-blue-400/50 text-sm font-medium">{String(7 + (showIntroduction ? 0 : -1) + (showPillars ? 0 : -2)).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>
         )}
         </>
         )}

         {/* ================= PÁGINA IMÓVEL: IDENTIFICAÇÃO COMPLETA - TV OPTIMIZED ================= */}
         <div className={pageClass} style={pageStyle}>
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}14, transparent, transparent)` }} />
               <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}0f, transparent, transparent)` }} />
            </div>

            <header className="relative z-10 px-8 py-4 border-b border-blue-400/10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/25 to-blue-600/20 flex items-center justify-center border border-blue-400/20">
                     <Building2 size={24} className="text-blue-400" />
                  </div>
                  <div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase font-medium">Objeto da Avaliação</p>
                     <h2 className="text-white font-bold text-2xl">Identificação do Imóvel</h2>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-blue-400/30">
                        <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-500/30">
                        <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
               </div>
            </header>

            <div className="relative z-10 flex-1 flex px-8 py-5 gap-6">
               {/* Left: Photo + Location + Client */}
               <div className="w-[45%] flex flex-col gap-3">
                  {/* Property Photo - flex-1 to fill space */}
                  <div className="flex-1 min-h-0 rounded-2xl overflow-hidden relative bg-gradient-to-br from-blue-900/50 to-blue-950/80 shadow-2xl border border-blue-500/20">
                     {property.foto_capa ? (
                        <img src={getImageUrlForPdf(property.foto_capa)} alt="Imóvel" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <Building2 size={80} className="text-blue-700/50" />
                        </div>
                     )}
                     <div className="absolute top-4 left-4">
                        <div className="inline-flex items-center gap-2 bg-orange-500/95 rounded-full px-3 py-1.5 shadow-lg">
                           <DollarSign size={14} className="text-white" />
                           <span className="text-white text-xs font-bold uppercase tracking-wider">{property.tipo}</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Location Card */}
                  <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                           <MapPin size={20} className="text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-white font-semibold text-base truncate">{property.rua || property.bairro}</p>
                           <p className="text-blue-300/70 text-xs truncate">
                              {property.municipio} - {property.estado} {property.cep && `• CEP: ${property.cep}`}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Client Card */}
                  {showClient && (
                     <div className="bg-gradient-to-r from-blue-500/15 to-blue-600/10 border border-blue-400/30 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                              <User size={20} className="text-blue-400" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="text-blue-400 text-[10px] uppercase tracking-wider mb-0.5">Preparado para</p>
                              {hasClientData ? (
                                 <p className="text-white font-semibold text-base truncate">{displayClientName}</p>
                              ) : (
                                 <p className="text-white font-semibold text-base truncate">{displayClientName}</p>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Right: Specs + Details */}
               <div className="w-[55%] flex flex-col gap-3">
                  {/* Specs Grid - 2 rows of 3 for full text display */}
                  <div className="flex flex-col gap-2">
                     {/* Row 1: Area, Quartos, Suítes */}
                     <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3 text-center">
                           <Ruler size={18} className="text-blue-400 mx-auto mb-1" />
                           <p className="text-white font-bold text-lg">{property.area}</p>
                           <p className="text-blue-300/60 text-[10px] uppercase tracking-wide">Área (m²)</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3 text-center">
                           <BedDouble size={18} className="text-blue-400 mx-auto mb-1" />
                           <p className="text-white font-bold text-lg">{property.quartos}</p>
                           <p className="text-blue-300/60 text-[10px] uppercase tracking-wide">Quartos</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3 text-center">
                           <Home size={18} className="text-blue-400 mx-auto mb-1" />
                           <p className="text-white font-bold text-lg">{property.suites || '-'}</p>
                           <p className="text-blue-300/60 text-[10px] uppercase tracking-wide">Suítes</p>
                        </div>
                     </div>
                     {/* Row 2: Banheiros, Vagas, Mobília/Situação */}
                     <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3 text-center">
                           <Bath size={18} className="text-blue-400 mx-auto mb-1" />
                           <p className="text-white font-bold text-lg">{property.banheiros || '-'}</p>
                           <p className="text-blue-300/60 text-[10px] uppercase tracking-wide">Banheiros</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3 text-center">
                           <Car size={18} className="text-blue-400 mx-auto mb-1" />
                           <p className="text-white font-bold text-lg">{property.vagas || '-'}</p>
                           <p className="text-blue-300/60 text-[10px] uppercase tracking-wide">Vagas</p>
                        </div>
                        {getMobiliadoLabel(property.mobiliado) ? (
                           <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3 text-center">
                              <Sofa size={18} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-white font-bold text-sm leading-tight">{getMobiliadoLabel(property.mobiliado)}</p>
                              <p className="text-blue-300/60 text-[10px] uppercase tracking-wide">Mobília</p>
                           </div>
                        ) : (
                           <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3 text-center">
                              <Scale size={18} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-white font-bold text-sm leading-tight">{getSituacaoLegalLabels(property.situacaoLegal) || '-'}</p>
                              <p className="text-blue-300/60 text-[10px] uppercase tracking-wide">Situação</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Costs Card */}
                  {(property.condominio || property.iptu || (property.aVenda && property.valor_atual)) && (
                     <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/15 border border-orange-500/40 rounded-xl p-4 shadow-lg shadow-orange-500/10">
                        <p className="text-orange-400 text-xs uppercase tracking-wider mb-3 font-bold">Valores do Imóvel</p>
                        <div className="flex items-center gap-3">
                           <div className="flex-1 flex items-center justify-around">
                              {property.aVenda && property.valor_atual > 0 && (
                                 <div className="text-center">
                                    <p className="text-blue-300/70 text-[10px] uppercase mb-1">Anunciado</p>
                                    <p className="text-white font-bold text-base whitespace-nowrap">{fmtMoney(property.valor_atual)}</p>
                                 </div>
                              )}
                              {property.condominio && (
                                 <div className="text-center">
                                    <p className="text-blue-300/70 text-[10px] uppercase mb-1">Cond.</p>
                                    <p className="text-white font-bold text-base whitespace-nowrap">{fmtMoney(property.condominio)}</p>
                                 </div>
                              )}
                              {property.iptu && (
                                 <div className="text-center">
                                    <p className="text-blue-300/70 text-[10px] uppercase mb-1">IPTU/ano</p>
                                    <p className="text-white font-bold text-base whitespace-nowrap">{fmtMoney(property.iptu)}</p>
                                 </div>
                              )}
                           </div>
                           {property.linkVenda && (
                              <a href={property.linkVenda} className="bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-xl px-3 py-2 border border-green-400/30 flex items-center gap-2">
                                 <ExternalLink size={14} className="text-green-400" />
                                 <span className="text-green-400 text-[10px] font-bold uppercase">Ver anúncio</span>
                              </a>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Ratings - compact inline */}
                  {(property.avaliacaoTecnica || property.localizacao || property.planta || property.acabamentos || property.conservacao || property.areasComuns) && (
                     <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                           <Star size={14} className="text-orange-400" />
                           <p className="text-blue-400 text-xs uppercase tracking-wider font-semibold">Avaliação do Corretor</p>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                           {property.avaliacaoTecnica && (
                              <div className="flex items-center gap-1.5">
                                 <span className="text-blue-200/70 text-[11px]">Técnica:</span>
                                 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= property.avaliacaoTecnica! ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />)}</div>
                              </div>
                           )}
                           {property.localizacao && (
                              <div className="flex items-center gap-1.5">
                                 <span className="text-blue-200/70 text-[11px]">Local:</span>
                                 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= property.localizacao! ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />)}</div>
                              </div>
                           )}
                           {property.planta && (
                              <div className="flex items-center gap-1.5">
                                 <span className="text-blue-200/70 text-[11px]">Planta:</span>
                                 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= property.planta! ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />)}</div>
                              </div>
                           )}
                           {property.acabamentos && (
                              <div className="flex items-center gap-1.5">
                                 <span className="text-blue-200/70 text-[11px]">Acabam.:</span>
                                 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= property.acabamentos! ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />)}</div>
                              </div>
                           )}
                           {property.conservacao && (
                              <div className="flex items-center gap-1.5">
                                 <span className="text-blue-200/70 text-[11px]">Conserv.:</span>
                                 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= property.conservacao! ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />)}</div>
                              </div>
                           )}
                           {property.areasComuns && (
                              <div className="flex items-center gap-1.5">
                                 <span className="text-blue-200/70 text-[11px]">Áreas:</span>
                                 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= property.areasComuns! ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />)}</div>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Features - compact badges */}
                  {property.features && property.features.length > 0 && (
                     <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                           <CheckCircle2 size={14} className="text-blue-400" />
                           <p className="text-blue-400 text-xs uppercase tracking-wider font-semibold">Características</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                           {property.features.slice(0, 12).map((feat, i) => (
                              <span key={i} className="bg-blue-500/20 text-blue-200 text-[10px] px-2 py-0.5 rounded-full border border-blue-400/20">{feat}</span>
                           ))}
                           {property.features.length > 12 && <span className="text-blue-400 text-[10px] font-medium">+{property.features.length - 12}</span>}
                        </div>
                     </div>
                  )}

                  {/* Nearby Locations + Description in row */}
                  <div className="flex gap-4 flex-1 min-h-0">
                     {property.locaisProximos && (
                        <div className="flex-1 bg-blue-500/10 border border-blue-400/25 rounded-xl p-4 overflow-hidden">
                           <div className="flex items-center gap-2 mb-2">
                              <Trees size={16} className="text-green-400" />
                              <p className="text-blue-300/60 text-xs uppercase tracking-wider font-semibold">Referências</p>
                           </div>
                           <p className="text-blue-100/80 text-sm leading-relaxed line-clamp-4 break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{property.locaisProximos}</p>
                        </div>
                     )}
                      {property.descricao && (
                         <div className="flex-1 bg-blue-500/10 border border-blue-400/25 rounded-xl p-4 min-w-0 overflow-hidden">
                            <p className="text-blue-300/60 text-xs uppercase tracking-wider mb-2 font-semibold">Descrição</p>
                            <p className="text-blue-100/70 text-sm leading-relaxed line-clamp-4 break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{property.descricao}</p>
                         </div>
                      )}
                  </div>
               </div>
            </div>

            <footer className="relative z-10 px-8 py-3 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/50 text-sm">Avaluz • Estudo de Mercado</p>
               <p className="text-blue-400/50 text-sm font-medium">{String(3 + marketingPageCount).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>

         {/* ================= PÁGINAS DE AMOSTRAS (Otimizado para TV) ================= */}
         {samplesToShow.map((sample, index) => {
            const pageNum = 4 + marketingPageCount + index;
            const diffValue = sample.valor - market.valor_estimado;
            const diffPercent = market.valor_estimado > 0 ? (diffValue / market.valor_estimado) * 100 : 0;
            const isPositive = diffValue >= 0;
            const images = sample.imagens?.length ? sample.imagens : (sample.imagem ? [sample.imagem] : []);

            return (
               <div key={sample.id} className={pageClass} style={pageStyle}>
                  {/* Background decorations */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}14, transparent, transparent)` }} />
                     <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}0f, transparent, transparent)` }} />
                  </div>

                  <header className="relative z-10 px-8 py-4 border-b border-blue-400/10 flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/25 to-orange-600/20 flex items-center justify-center border border-orange-400/20">
                           <span className="text-orange-400 font-bold text-lg">{String(index + 1).padStart(2, '0')}</span>
                        </div>
                        <div>
                           <p className="text-orange-400 text-xs tracking-[0.2em] uppercase font-medium">Amostra Comparável</p>
                           <h2 className="text-white font-bold text-2xl">Imóvel à Venda #{index + 1}</h2>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${sample.status === 'vendido' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-400/30'}`}>
                           {sample.status === 'vendido' ? 'Vendido' : 'Ativo'}
                        </div>
                        {broker?.logo_imobiliaria_url && (
                           <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-blue-400/30">
                              <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                           </div>
                        )}
                        {broker?.avatar_url && (
                           <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-blue-500/30">
                              <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                           </div>
                        )}
                        <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
                     </div>
                  </header>

                  <div className="relative z-10 flex-1 min-h-0 flex px-8 py-5 gap-6 overflow-hidden">
                     {/* Left: Images - larger grid like rental */}
                     <div className="w-[45%] rounded-2xl overflow-hidden relative bg-gradient-to-br from-blue-900/50 to-blue-950/80 shadow-2xl border border-blue-500/20">
                        {images.length === 0 ? (
                           <div className="absolute inset-0 flex items-center justify-center"><Building2 size={80} className="text-blue-700/50" /></div>
                        ) : images.length === 1 ? (
                           <div className="absolute inset-0" style={{ backgroundImage: `url("${getImageUrlForPdf(images[0])}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        ) : (
                           <div className="grid grid-cols-2 grid-rows-2 gap-1.5 h-full p-1.5">
                              {images.slice(0, 4).map((img, i) => (
                                 <div key={i} className="relative rounded-lg overflow-hidden">
                                    <div className="absolute inset-0" style={{ backgroundImage: `url("${getImageUrlForPdf(img)}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                 </div>
                              ))}
                           </div>
                        )}
                        <div className="absolute top-4 left-4">
                           <div className="bg-blue-950/80 backdrop-blur rounded-full px-3 py-1.5">
                               <span className="text-white text-sm font-semibold">{sample.categoria || sample.titulo || 'Imóvel'}</span>
                           </div>
                        </div>
                        {sample.link && (
                           <a href={sample.link} target="_blank" rel="noopener noreferrer" 
                              className="absolute bottom-4 right-4 bg-orange-500/95 backdrop-blur rounded-full px-4 py-2 z-10 hover:bg-orange-400 transition-colors inline-flex items-center gap-2 shadow-lg">
                              <ExternalLink size={14} className="text-white" />
                              <span className="text-white text-sm font-medium">Ver anúncio</span>
                           </a>
                        )}
                     </div>

                     {/* Right: Details - enhanced typography like rental */}
                     <div className="w-[55%] flex flex-col gap-4">
                        {/* Title */}
                        <h3 className="text-white font-bold text-xl line-clamp-2">{sample.titulo}</h3>

                        {/* Value Card + Location Card side by side */}
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/40 rounded-xl p-4 shadow-lg shadow-orange-500/10">
                              <p className="text-orange-400 text-xs uppercase tracking-wider mb-2 font-semibold">Valor de Venda</p>
                              <p className="text-white font-bold text-2xl whitespace-nowrap">{fmtMoney(sample.valor)}</p>
                              <p className="text-orange-300/60 text-sm mt-1">{fmtM2Simple(sample.valor, sample.area)}/m²</p>
                           </div>
                           <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-4 flex items-center justify-center">
                              <div className="text-center">
                                 <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
                                    <MapPin size={20} className="text-orange-400" />
                                 </div>
                                 <p className="text-white font-semibold text-base truncate">{sample.bairro || sample.rua || 'Bairro'}</p>
                                 {sample.municipio && <p className="text-blue-300/60 text-sm truncate">{sample.municipio}{sample.estado ? ` - ${sample.estado}` : ''}</p>}
                              </div>
                           </div>
                        </div>

                        {/* Specs - 5 columns with suites */}
                        <div className="grid grid-cols-5 gap-3">
                           {[
                              { icon: Ruler, value: `${sample.area}m²`, label: 'Área' },
                              { icon: BedDouble, value: sample.quartos, label: 'Quartos' },
                              { icon: Home, value: sample.suites || '-', label: 'Suítes' },
                              { icon: Bath, value: sample.banheiros, label: 'Banhos' },
                              { icon: Car, value: sample.vagas, label: 'Vagas' }
                           ].map((item, i) => (
                              <div key={i} className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-3 text-center">
                                 <item.icon size={18} className="text-blue-400 mx-auto mb-1" />
                                 <p className="text-white font-bold text-lg">{item.value}</p>
                                 <p className="text-blue-300/60 text-[10px] uppercase tracking-wide">{item.label}</p>
                              </div>
                           ))}
                        </div>

                         {/* Description - larger text, more lines */}
                         <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-5 flex-1 min-h-0 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                               <FileText size={18} className="text-blue-400" />
                               <p className="text-blue-400 text-sm uppercase tracking-wider font-semibold">Descrição</p>
                            </div>
                            <p className="text-blue-100/80 text-base leading-relaxed line-clamp-[8] break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{sample.descricao || 'Imóvel disponível para venda.'}</p>
                         </div>
                     </div>
                  </div>

                  <footer className="relative z-10 px-8 py-3 border-t border-blue-400/10 flex justify-between items-center">
                     <p className="text-blue-400/50 text-sm">Avaluz • Estudo de Mercado</p>
                     <p className="text-blue-400/50 text-sm font-medium">{String(pageNum).padStart(2, '0')} / {totalPages}</p>
                  </footer>
               </div>
            );
         })}

         {/* ================= PÁGINA DIAGNÓSTICO (Otimizado para TV) ================= */}
         <div className={pageClass} style={pageStyle}>
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}14, transparent, transparent)` }} />
               <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}0f, transparent, transparent)` }} />
            </div>

            <header className="relative z-10 px-8 py-4 border-b border-blue-400/10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/25 to-orange-600/20 flex items-center justify-center border border-orange-400/20">
                     <LineChart size={24} className="text-orange-400" />
                  </div>
                  <div>
                     <p className="text-orange-400 text-xs tracking-[0.2em] uppercase font-medium">Análise de Valor</p>
                     <h2 className="text-white font-bold text-2xl">Diagnóstico & Estratégia</h2>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-blue-400/30">
                        <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-blue-500/30">
                        <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
               </div>
            </header>

            <div className="relative z-10 flex-1 flex px-8 py-5 gap-6">
               {/* Left: Mini-card + Chart */}
               <div className="w-1/2 flex flex-col gap-4">
                  {/* Property Mini-card - with complete info */}
                  <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-4 flex items-center gap-4">
                     <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-blue-500/30">
                        {property.foto_capa ? (
                           <img src={property.foto_capa} alt="" className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full bg-blue-500/20 flex items-center justify-center">
                              <Home size={24} className="text-blue-400" />
                           </div>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-lg truncate">{property.bairro}</p>
                        <p className="text-blue-300/70 text-sm">{property.municipio} - {property.estado}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                           <span className="text-blue-300/70 text-sm">{property.area}m²</span>
                           <span className="text-blue-300/50">•</span>
                           <span className="text-blue-300/70 text-sm">{property.quartos} quartos</span>
                           {property.suites > 0 && (
                              <>
                                 <span className="text-blue-300/50">•</span>
                                 <span className="text-blue-300/70 text-sm">{property.suites} suítes</span>
                              </>
                           )}
                           <span className="text-blue-300/50">•</span>
                           <span className="text-blue-300/70 text-sm">{property.banheiros} banheiros</span>
                           <span className="text-blue-300/50">•</span>
                           <span className="text-blue-300/70 text-sm">{property.vagas} vagas</span>
                        </div>
                     </div>
                     <div className="text-right flex-shrink-0">
                        <p className="text-blue-300/60 text-xs uppercase">Valor Estimado</p>
                        <p className="text-orange-400 font-bold text-xl">{fmtMoney(market.valor_estimado)}</p>
                     </div>
                  </div>

                  {/* Chart - takes remaining space with large size for TV */}
                  <div className="flex-1 min-h-0">
                     <PriceComparisonChart
                        samples={samplesToShow}
                        evaluatedProperty={{ valorEstimado: market.valor_estimado, area: property.area }}
                        size="large"
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
                  </div>
               </div>

               {/* Right: Value Cards - enhanced */}
               <div className="w-1/2 flex flex-col gap-4">
                  {/* Main Value Card - larger */}
                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/15 border-2 border-orange-500/50 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-orange-500/10">
                     <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-orange-500"></div>
                     <div className="absolute top-4 right-4">
                        <span className="bg-orange-500/30 text-orange-300 text-xs uppercase font-bold px-3 py-1 rounded-full">Recomendado</span>
                     </div>
                     <p className="text-orange-300/70 text-sm uppercase tracking-wider mb-2">Valor de Mercado</p>
                     <p className="text-white font-bold text-4xl">{fmtMoney(market.valor_estimado)}</p>
                     <p className="text-orange-400 text-base mt-2">{fmtM2Simple(market.valor_estimado, property.area)}/m²</p>
                     <p className="text-blue-300/60 text-sm mt-2">Baseado em {market.amostras} imóveis comparáveis</p>
                  </div>

                  {/* Min/Max Cards - side by side like rental */}
                  {showMinMax && (
                     <div className="grid grid-cols-2 gap-4">
                        {showMaximo && (
                           <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-4 relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                              <div className="flex items-center gap-2 mb-2">
                                 <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                                    <TrendingUp size={16} className="text-red-400" />
                                 </div>
                                 <span className="text-red-400 text-sm uppercase font-semibold">Valor Premium</span>
                              </div>
                              <p className="text-white font-bold text-2xl mb-2">{fmtMoney(market.maximo)}</p>
                              <p className="text-blue-100/70 text-sm"><span className="text-red-400 font-medium">Venda pode demorar mais</span></p>
                           </div>
                        )}
                        {showMinimo && (
                           <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-4 relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                              <div className="flex items-center gap-2 mb-2">
                                 <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <Zap size={16} className="text-green-400" />
                                 </div>
                                 <span className="text-green-400 text-sm uppercase font-semibold">Valor de Mercado</span>
                              </div>
                              <p className="text-white font-bold text-2xl mb-2">{fmtMoney(market.minimo)}</p>
                              <p className="text-blue-200/70 text-sm"><span className="text-green-400 font-medium">Alta liquidez no mercado</span></p>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Status Badges - enhanced for TV */}
                  <div className="flex flex-col gap-3 mt-auto">
                     <div className={`flex items-center gap-3 p-4 rounded-xl ${percentual > 5 ? 'bg-red-500/10 border border-red-500/20' : percentual < -5 ? 'bg-green-500/10 border border-green-500/20' : 'bg-blue-500/10 border border-blue-400/20'}`}>
                        {percentual > 5 ? <TrendingUp size={20} className="text-red-400" /> : percentual < -5 ? <TrendingDown size={20} className="text-green-400" /> : <CheckCircle2 size={20} className="text-blue-400" />}
                        <span className={`text-sm font-medium ${percentual > 5 ? 'text-red-400' : percentual < -5 ? 'text-green-400' : 'text-blue-400'}`}>
                           {percentual > 5 ? `Preço atual ${Math.abs(percentual).toFixed(0)}% acima do mercado` : percentual < -5 ? `Preço atual ${Math.abs(percentual).toFixed(0)}% abaixo do mercado` : 'Preço alinhado com o mercado'}
                        </span>
                     </div>
                     <div className={`flex items-center gap-3 p-4 rounded-xl ${confiancaDisplay >= 80 ? 'bg-green-500/10 border border-green-500/20' : confiancaDisplay >= 60 ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-orange-500/10 border border-orange-500/20'}`}>
                        <Shield size={20} className={confiancaDisplay >= 80 ? 'text-green-400' : confiancaDisplay >= 60 ? 'text-yellow-400' : 'text-orange-400'} />
                        <span className={`text-sm font-medium ${confiancaDisplay >= 80 ? 'text-green-400' : confiancaDisplay >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>
                           {confiancaDisplay >= 80 ? 'Alta confiabilidade estatística' : confiancaDisplay >= 60 ? 'Confiabilidade moderada' : 'Dados limitados na região'}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            <footer className="relative z-10 px-8 py-3 border-t border-blue-400/10 flex justify-between items-center">
               <p className="text-blue-400/50 text-sm">Avaluz • Estudo de Mercado</p>
               <p className="text-blue-400/50 text-sm font-medium">{String(4 + marketingPageCount + samplePages).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>

         {/* ================= PÁGINAS QUADRO COMPARATIVO (Otimizado para TV) ================= */}
         {tableChunks.map((chunkSamples, chunkIndex) => {
            const isFirstTablePage = chunkIndex === 0;
            const isLastTablePage = chunkIndex === tableChunks.length - 1;
            const tablePageNumber = 5 + marketingPageCount + samplePages + chunkIndex;

            return (
               <div key={chunkIndex} className={pageClass} style={pageStyle}>
                  {/* Background effects */}
                  <div className="absolute inset-0 overflow-hidden">
                     <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent, transparent)` }}></div>
                     <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}14, transparent, transparent)` }}></div>
                  </div>

                  <header className="relative z-10 px-8 py-4 border-b border-blue-400/10 flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/25 to-orange-600/20 flex items-center justify-center border border-orange-400/20">
                           <BarChart3 size={24} className="text-orange-400" />
                        </div>
                        <div>
                           <p className="text-orange-400 text-xs tracking-[0.2em] uppercase font-medium">Análise Comparativa</p>
                           <h2 className="text-white font-bold text-2xl">
                              Quadro Comparativo
                              {tableChunks.length > 1 && <span className="text-blue-300/60 text-lg ml-2">({chunkIndex + 1}/{tableChunks.length})</span>}
                           </h2>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        {broker?.logo_imobiliaria_url && (
                           <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-blue-400/30">
                              <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                           </div>
                        )}
                        {broker?.avatar_url && (
                           <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-blue-500/30">
                              <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                           </div>
                        )}
                        <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
                     </div>
                  </header>

                  <div className="relative z-10 flex-1 flex flex-col px-8 py-4">
                     <div className="bg-blue-500/5 backdrop-blur-xl border border-blue-400/20 rounded-xl overflow-hidden flex-1">
                        {/* Table Header - TV Optimized */}
                        <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-blue-400/10">
                           <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/15 p-3">
                              <p className="text-orange-400 text-xs uppercase tracking-wider font-semibold">Imóvel</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Ruler size={16} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[10px] uppercase">Área</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <BedDouble size={16} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[10px] uppercase">Quartos</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Bath size={16} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[10px] uppercase">Banheiros</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Car size={16} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[10px] uppercase">Vagas</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <DollarSign size={16} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[10px] uppercase">Valor</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <TrendingUp size={16} className="text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-300/60 text-[10px] uppercase">R$/m²</p>
                           </div>
                        </div>

                        {/* Your Property Row - TV Optimized */}
                        {isFirstTablePage && (
                           <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-blue-400/10">
                              <div className="bg-gradient-to-r from-orange-500/15 to-orange-600/10 p-3 flex items-center gap-3">
                                 <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 border-orange-500/40">
                                    {property.foto_capa ? (
                                       <img src={property.foto_capa} alt="Seu Imóvel" className="w-full h-full object-cover" />
                                    ) : (
                                       <div className="w-full h-full bg-orange-500/20 flex items-center justify-center"><Home size={18} className="text-orange-400" /></div>
                                    )}
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <p className="text-orange-400 font-bold text-sm">Seu Imóvel</p>
                                    <p className="text-orange-300/70 text-xs truncate">{property.bairro}, {property.municipio}</p>
                                 </div>
                              </div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center"><p className="text-white font-bold text-sm">{property.area} m²</p></div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center"><p className="text-white font-bold text-sm">{property.quartos}</p></div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center"><p className="text-white font-bold text-sm">{property.banheiros}</p></div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center"><p className="text-white font-bold text-sm">{property.vagas}</p></div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center"><p className="text-orange-400 font-bold text-sm">{fmtMoney(market.valor_estimado)}</p></div>
                              <div className="bg-orange-500/10 p-3 flex items-center justify-center"><p className="text-orange-400 font-semibold text-xs">{fmtM2Simple(market.valor_estimado, property.area)}</p></div>
                           </div>
                        )}

                        {/* Sample Rows - TV Optimized */}
                        {chunkSamples.map((sample, index) => {
                           const precoM2Sample = sample.area > 0 ? sample.valor / sample.area : 0;
                           const precoM2Property = property.area > 0 ? market.valor_estimado / property.area : 0;
                           const diffPercent = precoM2Property > 0 ? ((precoM2Sample - precoM2Property) / precoM2Property) * 100 : 0;
                           const isHigher = diffPercent > 5;
                           const isLower = diffPercent < -5;
                           const sampleImage = sample.imagens?.[0] || sample.imagem;
                           const displayTitle = sample.titulo || `${sample.categoria || 'Imóvel'} - ${sample.quartos}q/${sample.banheiros}b`;
                           const globalSampleNumber = (chunkIndex * 6) + index + 1;

                           return (
                              <div key={sample.id} className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-blue-400/10">
                                 <div className="bg-[#0A1E3C] p-3 flex items-center gap-3">
                                    {/* Sample number badge */}
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0">
                                       <span className="text-orange-400 text-[10px] font-bold">{globalSampleNumber}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-blue-400/30">
                                       {sampleImage ? (
                                          <img src={sampleImage} alt={displayTitle} className="w-full h-full object-cover" />
                                       ) : (
                                          <div className="w-full h-full bg-blue-500/20 flex items-center justify-center"><Building2 size={18} className="text-blue-400" /></div>
                                       )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-white font-semibold text-xs line-clamp-2 leading-snug">{displayTitle}</p>
                                       <p className="text-blue-300/70 text-[11px] truncate mt-0.5">{sample.bairro || property.bairro}{sample.municipio && `, ${sample.municipio}`}</p>
                                    </div>
                                 </div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center"><p className="text-white text-sm">{sample.area} m²</p></div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center"><p className="text-white text-sm">{sample.quartos}</p></div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center"><p className="text-white text-sm">{sample.banheiros}</p></div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center"><p className="text-white text-sm">{sample.vagas}</p></div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center"><p className="text-white text-sm">{fmtMoney(sample.valor)}</p></div>
                                 <div className="bg-[#0A1E3C] p-3 flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                       <p className={`text-xs font-medium ${isHigher ? 'text-red-400' : isLower ? 'text-green-400' : 'text-white'}`}>{fmtM2Simple(sample.valor, sample.area)}</p>
                                       {(isHigher || isLower) && <span className={`text-[10px] ${isHigher ? 'text-red-400' : 'text-green-400'}`}>{isHigher ? '+' : ''}{Math.abs(diffPercent).toFixed(0)}% vs seu</span>}
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>

                     {/* Summary Stats - TV Optimized */}
                     {isLastTablePage && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                           <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4 text-center">
                              <p className="text-blue-300/60 text-xs uppercase tracking-wider mb-2">Média do Mercado</p>
                              <p className="text-white font-bold text-xl">{fmtMoney(allSamples.reduce((acc, s) => acc + s.valor, 0) / allSamples.length)}</p>
                           </div>
                           <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4 text-center">
                              <p className="text-blue-300/60 text-xs uppercase tracking-wider mb-2">Média R$/m²</p>
                              <p className="text-white font-bold text-xl">{fmtM2Simple(allSamples.reduce((acc, s) => acc + s.valor, 0) / allSamples.length, allSamples.reduce((acc, s) => acc + s.area, 0) / allSamples.length)}</p>
                           </div>
                           <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4 text-center">
                              <p className="text-blue-300/60 text-xs uppercase tracking-wider mb-2">Menor Valor</p>
                              <p className="text-green-400 font-bold text-xl">{fmtMoney(Math.min(...allSamples.map(s => s.valor)))}</p>
                           </div>
                           <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4 text-center">
                              <p className="text-blue-300/60 text-xs uppercase tracking-wider mb-2">Maior Valor</p>
                              <p className="text-orange-400 font-bold text-xl">{fmtMoney(Math.max(...allSamples.map(s => s.valor)))}</p>
                           </div>
                        </div>
                     )}
                  </div>

                  <footer className="relative z-10 px-8 py-3 border-t border-blue-400/10 flex justify-between items-center">
                     <p className="text-blue-400/50 text-sm">Avaluz • Estudo de Mercado</p>
                     <p className="text-blue-400/50 text-sm font-medium">{String(tablePageNumber).padStart(2, '0')} / {totalPages}</p>
                  </footer>
               </div>
            );
         })}

         {/* ================= PÁGINA FINAL: CONCLUSÃO - FOTO HORIZONTAL NO TOPO (TV Optimized) ================= */}
         <div className={pageClass} style={pageStyle}>
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}26, transparent, transparent)` }}></div>
               <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent, transparent)` }}></div>
            </div>

            {/* Hero Photo Section - Top 35% */}
            <div className="relative z-10 h-[35%] w-full">
               {property.foto_capa ? (
                  <img src={property.foto_capa} alt="Imóvel" className="absolute inset-0 w-full h-full object-cover" />
               ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-blue-950/80 flex items-center justify-center">
                     <Building2 size={60} className="text-blue-700/30" />
                  </div>
               )}
               {/* Gradient overlay */}
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#061224]"></div>
               <div className="absolute inset-0 bg-gradient-to-r from-[#061224]/50 via-transparent to-[#061224]/50"></div>
               
               {/* Header overlay */}
               <div className="absolute top-0 left-0 right-0 px-6 py-3 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/20">
                        <CheckCircle2 size={16} className="text-orange-400" />
                     </div>
                     <div>
                        <p className="text-orange-400 text-[10px] tracking-[0.2em] uppercase drop-shadow-lg">Parecer Final</p>
                        <h2 className="text-white font-bold text-xl drop-shadow-lg">Conclusão do Estudo</h2>
                     </div>
                  </div>
                  <img src={avaluzLogo} alt="Avaluz" className="h-8 w-auto drop-shadow-lg" />
               </div>

               {/* Property info overlay at bottom */}
               <div className="absolute bottom-0 left-0 right-0 px-6 py-3 flex items-end justify-between">
                  <div>
                     <h3 className="text-white font-bold text-2xl mb-1 drop-shadow-lg">{property.bairro}</h3>
                     <p className="text-white/80 text-sm drop-shadow-md">{property.municipio} - {property.estado}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end max-w-[60%]">
                     <span className="bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white border border-white/20">{property.area}m²</span>
                     <span className="bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white border border-white/20">{property.quartos} quartos</span>
                     {property.suites > 0 && (
                        <span className="bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white border border-white/20">{property.suites} suítes</span>
                     )}
                     <span className="bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white border border-white/20">{property.banheiros} banheiros</span>
                     <span className="bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white border border-white/20">{property.vagas} vagas</span>
                  </div>
               </div>
            </div>

            {/* Two-Column Content Area - Bottom 65% */}
            <div className="relative z-10 flex-1 flex px-6 py-3 gap-4">
               {/* Left: Value + Conclusion */}
               <div className="w-1/2 flex flex-col gap-3">
                  {/* Value Hero Card */}
                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4 text-center">
                     <p className="text-orange-300/70 text-xs uppercase tracking-wider mb-1">Valor de Mercado</p>
                     <p className="text-orange-400 font-bold text-3xl mb-1">{fmtMoney(market.valor_estimado)}</p>
                     <p className="text-blue-300/60 text-sm">{fmtM2Simple(market.valor_estimado, property.area)}/m²</p>
                  </div>

                  {/* Conclusion Text */}
                  <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 flex-1">
                     <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                        <FileText size={14} className="text-orange-400" />
                        Parecer do Estudo
                     </h4>
                     <p className="text-blue-100/70 text-sm leading-relaxed mb-2">
                        Com base na análise de <span className="text-orange-400 font-medium">{market.amostras} imóveis comparáveis</span> na 
                        região de <span className="text-white font-medium">{property.bairro}, {property.municipio}</span>, concluímos que o valor de mercado 
                        estimado é de <span className="text-orange-400 font-bold">{fmtMoney(market.valor_estimado)}</span>.
                     </p>
                     <p className="text-blue-100/70 text-sm leading-relaxed">
                        Este estudo foi conduzido utilizando Método Comparativo Direto, amplamente reconhecido no mercado imobiliário.
                     </p>
                  </div>
               </div>

               {/* Right: Broker Signature Card - TV Optimized */}
               <div className="w-1/2 flex flex-col">
                  {broker && (
                     <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/40 rounded-xl p-4 flex-1 flex flex-col">
                        {/* Agency | Broker Split */}
                        <div className="flex gap-4 items-start flex-1">
                         {/* Agency Section */}
                           <div className="flex-1 flex flex-col items-center text-center gap-2">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 border-2 border-orange-400/50 flex-shrink-0">
                                 {broker.logo_imobiliaria_url ? (
                                    <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-orange-500/20"><Building2 size={32} className="text-orange-400" /></div>
                                 )}
                              </div>
                              <div>
                                 <p className="text-orange-400 text-[10px] uppercase tracking-wider">Imobiliária</p>
                                 <h3 className="text-white font-bold text-sm">{broker.imobiliaria || 'Imobiliária'}</h3>
                              </div>
                           </div>

                           {/* Vertical Divider */}
                           <div className="w-px h-full bg-orange-400/30" />

                           {/* Broker Section */}
                           <div className="flex-1 flex flex-col items-center text-center gap-2">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500/30 to-orange-600/20 border-2 border-orange-500/50 flex-shrink-0">
                                 {broker.avatar_url ? (
                                    <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center"><User size={32} className="text-orange-400" /></div>
                                 )}
                              </div>
                              <div>
                                 <p className="text-orange-400 text-[10px] uppercase tracking-wider">Corretor</p>
                                 <h3 className="text-white font-bold text-sm">{broker.nome || 'Especialista'}</h3>
                                 {broker.creci && <p className="text-blue-300/70 text-xs flex items-center justify-center gap-1"><Award size={10} className="text-orange-400" />CRECI {broker.creci}</p>}
                              </div>
                           </div>
                        </div>

                        {/* Signature Area */}
                        <div className="pt-3 mt-3 border-t border-orange-500/30">
                           <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                 {broker?.signature_url ? (
                                    <div className="flex flex-col items-center">
                                       <div className="bg-white rounded px-3 py-2">
                                          <img src={broker.signature_url} alt="Assinatura" className="h-10 w-auto object-contain max-w-32" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                                       </div>
                                       <div className="w-32 border-b border-orange-500/30 mt-1" />
                                       <p className="text-blue-300/60 text-[10px] mt-1">Assinatura do Corretor</p>
                                    </div>
                                 ) : (
                                    <div className="flex flex-col items-center">
                                       <div className="w-32 h-10 border-b-2 border-dashed border-orange-500/40" />
                                       <p className="text-blue-300/60 text-[10px] mt-1">Assinatura do Corretor</p>
                                    </div>
                                 )}
                              </div>
                              <div className="text-right">
                                 <p className="text-blue-300/60 text-xs">Data da Avaliação</p>
                                 <p className="text-white font-medium text-sm">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                              </div>
                           </div>
                           {showBrokerContact && (brokerPhone || brokerEmail) && (
                              <div className="flex justify-center gap-4 mt-2 pt-2 border-t border-orange-500/20">
                                 {brokerPhone && <p className="text-blue-100/70 text-xs flex items-center gap-1"><Phone size={12} className="text-orange-400" />{brokerPhone}</p>}
                                 {brokerEmail && <p className="text-blue-100/70 text-xs flex items-center gap-1"><Mail size={12} className="text-orange-400" />{brokerEmail}</p>}
                              </div>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-2 border-t border-blue-400/10">
               <div className="flex items-center justify-between">
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <img src={avaluzLogo} alt="Avaluz" className="h-8 w-auto" />
                     </div>
                     <p className="text-blue-300/50 text-[10px] max-w-lg">
                        Este documento é um estudo de mercado para fins de orientação comercial. Não substitui laudo de avaliação oficial para fins jurídicos ou financeiros.
                     </p>
                  </div>
                  <p className="text-blue-400/40 text-sm">{String(totalPages).padStart(2, '0')} / {totalPages}</p>
               </div>
            </footer>
         </div>

      </div>
   );
};
