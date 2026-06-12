// AvaluzRentalReportLandscape.tsx - Versão Landscape com 100% PARIDADE ao Portrait
// Mesmos dados, mesma estrutura, mesmas páginas - reorganizado para 297mm x 210mm

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
   AlertCircle, Activity, DollarSign, Star, FileText, Sofa, Key, PiggyBank, CalendarDays,
   UserCheck, FileCheck, ClipboardCheck, Wallet, Eye, ExternalLink
} from 'lucide-react';

// --- Interfaces (idênticas ao portrait) ---
interface ClientData { nome: string; email?: string; telefone?: string; }

interface PropertyData {
   id: number; rua: string | null; bairro: string; municipio: string; estado: string;
   area: number; quartos: number; banheiros?: number; suites?: number; vagas: number | null;
   valor_atual: number; tipo: string; foto_capa?: string | null; descricao?: string | null;
   cep?: string; condominio?: number; iptu?: number; mobiliado?: string; features?: string[];
   avaliacaoTecnica?: number; localizacao?: number; planta?: number; acabamentos?: number;
   conservacao?: number; areasComuns?: number; locaisProximos?: string;
   situacaoLegal?: string[];
   especificacoes?: { tipo?: string; checklist?: Record<string, boolean>; detalhes?: Record<string, string | number | null>; };
}

interface SimilarProperty {
   id: number; titulo: string; categoria?: string; descricao: string; valor: number; area: number;
   quartos: number; suites?: number; banheiros: number; vagas: number; imagem: string; imagens?: string[];
   status: 'ativo' | 'vendido'; link?: string;
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
   rentalFunnel?: { enabled: boolean; items?: Record<string, boolean>; };
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
   showMinimo?: boolean; showMaximo?: boolean; showMarketingPlan?: boolean;
   marketingPlan?: MarketingPlanSettings; showClient?: boolean; showClientEmail?: boolean;
   showClientPhone?: boolean; showBrokerContact?: boolean;
   showRentalTime?: boolean; rentalTimeText?: string; rentalTimeDescription?: string;
   pdfColors?: PdfColors;
}

interface RentalReportProps {
   clientName: string; client?: ClientData; property: PropertyData;
   market: MarketData; broker?: BrokerData; settings?: PdfSettings;
}

// --- Componente Principal Landscape ---
export const AvaluzRentalReportLandscape: React.FC<RentalReportProps> = ({
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
   const showRentalTime = settings.showRentalTime !== false;
   const rentalTimeText = settings.rentalTimeText || '15-30 dias';
   const rentalTimeDescription = settings.rentalTimeDescription || 'Com o preço de equilíbrio recomendado, expectativa de locação dentro deste prazo.';
   const showClient = settings.showClient !== false;
   const showClientEmail = settings.showClientEmail !== false;
   const showClientPhone = settings.showClientPhone !== false;
   const showBrokerContact = settings.showBrokerContact !== false;

   const mp = settings.marketingPlan || {};
   const showRentalFunnel = showMarketing && mp.rentalFunnel?.enabled !== false;
   const showIndicators = showMarketing && mp.indicators?.enabled !== false;

   const brokerPhone = broker?.telefone_custom || broker?.telefone;
   const brokerEmail = broker?.email_custom || broker?.email;

   // Formatters
   const fmtMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
   const fmtM2Simple = (val: number, area: number) => area > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val / area) : "-";

   const confiancaDisplay = market.confianca < 1 ? Math.round(market.confianca * 100) : Math.round(market.confianca);

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
      ? (showRentalFunnel ? 1 : 0) + (showIndicators ? 1 : 0)
      : 0;
   const tablePages = tableChunks.length || 1;
   const basePages = 5 + marketingPageCount + tablePages;
   const samplePages = samplesToShow.length;
   const totalPages = basePages + samplePages;

   const hasClientData = client?.nome || clientName !== "Cliente Avaluz";
   const displayClientName = client?.nome || clientName;
   
   // Custo total mensal
   const iptuMensal = property.iptu ? Math.round(property.iptu / 12) : 0;
   const custoTotal = market.valor_estimado + (property.condominio || 0) + iptuMensal;

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
                <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}40, ${c.primary}26, transparent)` }}></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}33, transparent, transparent)` }}></div>
             </div>
             <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${c.primary}4d 1px, transparent 1px), linear-gradient(90deg, ${c.primary}4d 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

             {/* Header - compacto */}
             <header className="relative z-10 px-8 py-2 flex justify-between items-center">
                <img src={avaluzLogo} alt="Avaluz" className="h-8 w-auto opacity-80" />
                <div className="flex items-center gap-6 text-right">
                   <p className="text-emerald-300/80 text-sm font-medium">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                   <p className="text-emerald-400/60 text-xs">ID: AVL-L-{property.id.toString().padStart(6, '0')}</p>
                </div>
             </header>

             {/* Main Content - redesigned for impact */}
             <div className="relative z-10 flex-1 flex px-8 py-3 gap-6">
                {/* Left: Hero Image - LARGER and more prominent */}
                <div className="w-[50%] relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900/50 to-emerald-950/80 shadow-2xl border border-emerald-500/20">
                   {getCoverPhotoForPdf(property.foto_capa) ? (
                      <div className="absolute inset-0" style={{ backgroundImage: `url("${getCoverPhotoForPdf(property.foto_capa)}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                   ) : (
                      <div className="absolute inset-0 w-full h-full">
                         <img src={propertyPlaceholder} alt="" className="w-full h-full object-cover opacity-50" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 size={100} className="text-emerald-700/30" />
                         </div>
                      </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-[#061224]/90 via-transparent to-transparent"></div>
                   
                   {/* Type Badge - larger */}
                   <div className="absolute top-5 left-5">
                      <div className="inline-flex items-center gap-2 bg-emerald-500/95 rounded-full px-4 py-2 shadow-lg">
                         <Key size={14} className="text-white" />
                         <span className="text-white text-sm font-bold uppercase tracking-wider">LOCAÇÃO</span>
                      </div>
                   </div>

                </div>

                {/* Right: Info - enhanced typography */}
                <div className="w-[50%] flex flex-col justify-between gap-3">
                   {/* Title Section */}
                   <div>
                      <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-full px-4 py-1.5 mb-3">
                         <Key size={14} className="text-emerald-400" />
                         <span className="text-sm text-emerald-300 tracking-wide font-medium">Estudo de Locação</span>
                      </div>
                      <h1 className="font-inter font-bold text-3xl leading-tight mb-2">
                         <span className="text-white">Avaliação Estratégica</span><br />
                         <span className="text-emerald-400">de Valor de Aluguel</span>
                      </h1>
                      <p className="text-emerald-200/70 text-sm">Método Comparativo Direto de Aluguel • Análise de {market.amostras} Imóveis</p>
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
                         <div key={i} className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-3 text-center">
                            <p className="text-white font-bold text-xl">{item.value}</p>
                            <p className="text-emerald-300/70 text-[10px] uppercase tracking-wide mt-0.5">{item.label}</p>
                         </div>
                      ))}
                   </div>

                   {/* Location Card - larger */}
                   <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <MapPin size={24} className="text-orange-400" />
                         </div>
                         <div className="min-w-0 flex-1">
                            <p className="text-white font-semibold text-lg truncate">{property.rua || property.bairro}</p>
                            <p className="text-emerald-300/70 text-sm truncate">{property.bairro}, {property.municipio} - {property.estado}</p>
                         </div>
                      </div>
                   </div>

                   {/* Client Card - larger */}
                   {showClient && (
                      <div className="bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 border border-emerald-400/30 rounded-xl p-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                               <User size={24} className="text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                               <p className="text-emerald-400 text-xs uppercase tracking-wider mb-1">Preparado para</p>
                               {hasClientData ? (
                                  <p className="text-white font-semibold text-lg truncate">{displayClientName}</p>
                               ) : (
                                  <p className="text-emerald-300/60 italic text-sm">Cliente não informado</p>
                               )}
                            </div>
                         </div>
                      </div>
                   )}
                </div>
             </div>

             {/* Broker Footer - enhanced */}
             {broker && (
                <div className="relative z-10 mx-8 mb-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40 rounded-xl p-4">
                   <div className="flex gap-6 items-center">
                      <div className="flex-1 flex items-center gap-4 min-w-0">
                         <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/50 flex-shrink-0">
                            {broker.logo_imobiliaria_url ? (
                               <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center bg-emerald-500/20"><Building2 size={32} className="text-emerald-400" /></div>
                            )}
                         </div>
                         <div className="min-w-0">
                            <p className="text-emerald-400 text-xs uppercase tracking-wider">Imobiliária</p>
                            <h3 className="text-white font-bold text-base truncate">{broker.imobiliaria || 'Imobiliária'}</h3>
                         </div>
                      </div>
                      <div className="w-px h-16 bg-emerald-400/30" />
                      <div className="flex-1 flex items-center gap-4 min-w-0">
                         <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-2 border-emerald-500/50 flex-shrink-0">
                            {broker.avatar_url ? (
                               <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center"><User size={32} className="text-emerald-400" /></div>
                            )}
                         </div>
                         <div className="min-w-0">
                            <p className="text-emerald-400 text-xs uppercase tracking-wider">Corretor</p>
                            <h3 className="text-white font-bold text-base truncate">{broker.nome || 'Especialista'}</h3>
                            {broker.creci && <p className="text-emerald-300/70 text-sm flex items-center gap-1"><Award size={12} className="text-emerald-400 flex-shrink-0" /><span className="truncate">CRECI {broker.creci}</span></p>}
                         </div>
                      </div>
                      {showBrokerContact && (brokerPhone || brokerEmail) && (
                         <>
                            <div className="w-px h-12 bg-emerald-400/30" />
                            <div className="flex flex-col gap-1 min-w-0">
                               {brokerPhone && <p className="text-emerald-100/80 text-sm flex items-center gap-2 truncate"><Phone size={14} className="text-emerald-400 flex-shrink-0" /><span className="truncate">{brokerPhone}</span></p>}
                               {brokerEmail && <p className="text-emerald-100/80 text-sm flex items-center gap-2 truncate"><Mail size={14} className="text-emerald-400 flex-shrink-0" /><span className="truncate">{brokerEmail}</span></p>}
                            </div>
                         </>
                      )}
                   </div>
                </div>
             )}

             {/* Footer */}
             <footer className="relative z-10 px-8 py-2 flex justify-between items-center border-t border-emerald-400/10">
                <div className="flex items-center gap-3 text-sm text-emerald-300/60">
                   <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-semibold">CONFIDENCIAL</span>
                   <span className="flex items-center gap-1.5"><Database size={14} className="text-orange-400" />{market.amostras} imóveis analisados</span>
                </div>
                <p className="text-emerald-400/50 text-sm font-medium">01 / {totalPages}</p>
             </footer>
          </div>

          {/* ================= PÁGINA 2: METODOLOGIA ================= */}
          <div className={pageClass} style={pageStyle}>
             {/* Background decorations */}
             <div className="absolute inset-0 overflow-hidden">
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}26, transparent, transparent)` }}></div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}1a, transparent, transparent)` }}></div>
             </div>

             {/* Header - compacto */}
             <header className="relative z-10 px-8 py-2 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 flex items-center justify-center">
                      <Brain size={20} className="text-emerald-400" />
                   </div>
                   <div>
                      <p className="text-emerald-400 text-xs tracking-[0.15em] uppercase font-medium">Processo Técnico</p>
                      <h2 className="text-white font-bold text-2xl">Metodologia da Avaliação</h2>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   {broker?.logo_imobiliaria_url && <div className="h-12 w-12 rounded-xl overflow-hidden bg-white/10 border border-emerald-400/30"><img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" /></div>}
                   {broker?.avatar_url && <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/30"><img src={broker.avatar_url} alt="" className="w-full h-full object-cover" /></div>}
                   <img src={avaluzLogo} alt="Avaluz" className="h-10 w-auto opacity-80" />
                </div>
             </header>

             {/* Main content - 2 columns, enhanced */}
             <div className="relative z-10 flex-1 flex px-8 py-4 gap-8">
                {/* Left Column: Intro + Steps */}
                <div className="w-[55%] flex flex-col gap-4">
                   {/* Intro Box - full content from portrait */}
                   <div className="bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 backdrop-blur-xl border border-emerald-400/25 rounded-xl p-4">
                      <p className="text-emerald-100/90 text-sm leading-relaxed">
                         O <span className="text-emerald-400 font-semibold">Método Comparativo Direto de Aluguel</span> é a metodologia mais utilizada 
                         para definição de valores locatícios, seguindo padrões normativos (ABNT NBR 14653). 
                         Nosso sistema potencializa essa abordagem com tecnologia e análise de mercado em tempo real.
                      </p>
                   </div>

                   {/* Steps - larger, with full descriptions from portrait */}
                   <div className="grid grid-cols-2 gap-3 flex-1">
                      {[
                         { num: 1, icon: Database, title: "Coleta de Dados", desc: "Identificação de imóveis similares para locação na região, considerando área, tipologia e padrão." },
                         { num: 2, icon: LineChart, title: "Análise de Mercado", desc: "Avaliação dos valores praticados, velocidade de locação e tendências de demanda na região." },
                         { num: 3, icon: Filter, title: "Filtros de Comparação", desc: "Seleção das amostras mais relevantes por localização, características e valor de aluguel." },
                         { num: 4, icon: Calculator, title: "Cálculo Estatístico", desc: "Processamento dos dados para determinar faixas de aluguel: agressivo, equilibrado e premium." }
                      ].map((step) => (
                         <div key={step.num} className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-4 flex flex-col">
                            <div className="flex items-center gap-3 mb-2">
                               <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                                  <step.icon size={18} className="text-emerald-400" />
                               </div>
                               <div>
                                  <span className="text-emerald-500/70 text-xs font-medium">0{step.num}</span>
                                  <h4 className="text-white font-semibold text-base">{step.title}</h4>
                               </div>
                            </div>
                            <p className="text-emerald-200/70 text-sm leading-relaxed flex-1">{step.desc}</p>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Right Column: Strategy Cards + Quote */}
                <div className="w-[45%] flex flex-col gap-4">
                   {/* Velocidade de Locação - larger */}
                   <div className="bg-emerald-500/15 backdrop-blur-xl border border-emerald-400/25 rounded-xl p-5 flex-1">
                      <div className="flex items-center gap-4 mb-3">
                         <div className="w-12 h-12 rounded-xl bg-emerald-500/25 flex items-center justify-center">
                            <Clock size={24} className="text-emerald-400" />
                         </div>
                         <h4 className="text-white font-bold text-xl">Velocidade de Locação</h4>
                      </div>
                      <p className="text-emerald-100/80 text-base leading-relaxed">
                         Imóveis bem precificados têm <span className="text-emerald-400 font-semibold text-lg">3x mais chances</span> de 
                         serem alugados nos primeiros 30 dias.
                      </p>
                      <div className="mt-4 flex gap-3">
                         <div className="flex-1 bg-emerald-500/20 rounded-lg p-3 text-center">
                            <p className="text-emerald-400 font-bold text-2xl">30</p>
                            <p className="text-emerald-300/60 text-xs">dias médios</p>
                         </div>
                         <div className="flex-1 bg-emerald-500/20 rounded-lg p-3 text-center">
                            <p className="text-emerald-400 font-bold text-2xl">3x</p>
                            <p className="text-emerald-300/60 text-xs">mais rápido</p>
                         </div>
                      </div>
                   </div>

                   {/* Custo da Vacância - larger */}
                   <div className="bg-orange-500/10 backdrop-blur-xl border border-orange-400/25 rounded-xl p-5 flex-1">
                      <div className="flex items-center gap-4 mb-3">
                         <div className="w-12 h-12 rounded-xl bg-orange-500/25 flex items-center justify-center">
                            <PiggyBank size={24} className="text-orange-400" />
                         </div>
                         <h4 className="text-white font-bold text-xl">Custo da Vacância</h4>
                      </div>
                      <p className="text-emerald-100/80 text-base leading-relaxed">
                         Cada mês vazio custa ao proprietário <span className="text-orange-400 font-semibold text-lg">100% do aluguel</span> que 
                         poderia estar recebendo.
                      </p>
                      <div className="mt-4 bg-orange-500/15 rounded-lg p-3 text-center">
                         <p className="text-orange-400 font-bold text-xl">= {fmtMoney(market.valor_estimado)}/mês perdido</p>
                      </div>
                   </div>

                   {/* Quote */}
                   <div className="bg-gradient-to-r from-orange-500/15 to-emerald-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-center">
                      <p className="text-emerald-100/90 text-base italic text-center font-medium">
                         "Um imóvel bem posicionado não aluga por sorte — aluga por estratégia."
                      </p>
                   </div>
                </div>
             </div>

             {/* Footer */}
             <footer className="relative z-10 px-8 py-2 border-t border-emerald-400/10 flex justify-between items-center">
                <p className="text-emerald-400/50 text-sm">Avaluz • Estudo de Locação</p>
                <p className="text-emerald-400/50 text-sm font-medium">02 / {totalPages}</p>
             </footer>
          </div>

         {/* ================= PÁGINAS DE MARKETING (CONDICIONAIS) ================= */}
         {showMarketing && (
         <>
         {/* Funil de Locação - Otimizado para TV/Apresentação */}
         {showRentalFunnel && (
         <div className={pageClass} style={pageStyle}>
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full blur-3xl" style={{ background: `${c.primary}0d` }} />
               <div className="absolute bottom-1/4 -left-20 w-60 h-60 rounded-full blur-3xl" style={{ background: `${c.secondary}0d` }} />
            </div>

            <header className="relative z-10 px-8 py-4 border-b border-emerald-400/10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/25 flex items-center justify-center border border-emerald-400/20">
                     <Activity size={24} className="text-emerald-400" />
                  </div>
                  <div>
                     <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase font-medium">Processo</p>
                     <h2 className="text-white font-bold text-2xl">Funil de Locação</h2>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30">
                        <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
               </div>
            </header>

            <div className="relative z-10 flex-1 flex px-8 py-5 gap-6">
               {/* Left Column: Etapas 1-4 */}
               <div className="w-1/2 flex flex-col gap-3">
                  <div className="mb-2">
                     <h3 className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Captação à Análise</h3>
                     <p className="text-emerald-100/60 text-sm">Etapas iniciais do processo de locação</p>
                  </div>
                  {[
                     { num: 1, title: "Captação e Preparação", desc: "Análise completa do imóvel, definição estratégica de preço e preparação para locação no mercado.", color: "blue", icon: Home },
                     { num: 2, title: "Divulgação", desc: "Publicação em portais imobiliários, redes sociais e ativação completa da rede de contatos.", color: "purple", icon: Eye },
                     { num: 3, title: "Visitas", desc: "Agendamento e condução de visitas presenciais com candidatos qualificados.", color: "orange", icon: CalendarDays },
                     { num: 4, title: "Análise Cadastral", desc: "Verificação rigorosa de documentos, renda e referências do candidato.", color: "teal", icon: UserCheck }
                  ].map((etapa) => {
                     const colorMap: Record<string, { bg: string, border: string, text: string, glow: string }> = {
                        blue: { bg: 'from-blue-500/25 to-blue-600/25', border: 'border-blue-400/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
                        purple: { bg: 'from-purple-500/25 to-purple-600/25', border: 'border-purple-400/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
                        orange: { bg: 'from-orange-500/25 to-orange-600/25', border: 'border-orange-400/30', text: 'text-orange-400', glow: 'shadow-orange-500/20' },
                        teal: { bg: 'from-teal-500/25 to-teal-600/25', border: 'border-teal-400/30', text: 'text-teal-400', glow: 'shadow-teal-500/20' }
                     };
                     const colors = colorMap[etapa.color];
                     return (
                        <div key={etapa.num} className="flex items-center gap-4 group">
                           <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0 shadow-lg ${colors.glow}`}>
                              <etapa.icon size={24} className={colors.text} />
                           </div>
                           <div className="flex-1 bg-emerald-500/8 border border-emerald-400/15 rounded-xl p-4 hover:bg-emerald-500/12 transition-colors">
                              <div className="flex items-center gap-2 mb-1">
                                 <span className={`${colors.text} text-sm font-bold`}>0{etapa.num}</span>
                                 <h4 className="text-white font-semibold text-base">{etapa.title}</h4>
                              </div>
                              <p className="text-emerald-200/70 text-sm leading-relaxed">{etapa.desc}</p>
                           </div>
                        </div>
                     );
                  })}
               </div>

               {/* Right Column: Etapas 5-7 + Summary */}
               <div className="w-1/2 flex flex-col gap-3">
                  <div className="mb-2">
                     <h3 className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Aprovação à Entrega</h3>
                     <p className="text-emerald-100/60 text-sm">Etapas finais e conclusão</p>
                  </div>
                  {[
                     { num: 5, title: "Aprovação", desc: "Validação completa do perfil e definição de garantias (fiador, seguro, caução).", color: "pink", icon: ClipboardCheck },
                     { num: 6, title: "Contrato", desc: "Elaboração detalhada e assinatura formal do contrato de locação.", color: "indigo", icon: FileCheck },
                     { num: 7, title: "Entrega das Chaves", desc: "Vistoria de entrada completa e entrega formal do imóvel ao inquilino.", color: "emerald", icon: Key }
                  ].map((etapa) => {
                     const colorMap: Record<string, { bg: string, border: string, text: string, glow: string }> = {
                        pink: { bg: 'from-pink-500/25 to-pink-600/25', border: 'border-pink-400/30', text: 'text-pink-400', glow: 'shadow-pink-500/20' },
                        indigo: { bg: 'from-indigo-500/25 to-indigo-600/25', border: 'border-indigo-400/30', text: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
                        emerald: { bg: 'from-emerald-500/25 to-emerald-600/25', border: 'border-emerald-400/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' }
                     };
                     const colors = colorMap[etapa.color];
                     return (
                        <div key={etapa.num} className="flex items-center gap-4 group">
                           <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0 shadow-lg ${colors.glow}`}>
                              <etapa.icon size={24} className={colors.text} />
                           </div>
                           <div className="flex-1 bg-emerald-500/8 border border-emerald-400/15 rounded-xl p-4 hover:bg-emerald-500/12 transition-colors">
                              <div className="flex items-center gap-2 mb-1">
                                 <span className={`${colors.text} text-sm font-bold`}>0{etapa.num}</span>
                                 <h4 className="text-white font-semibold text-base">{etapa.title}</h4>
                              </div>
                              <p className="text-emerald-200/70 text-sm leading-relaxed">{etapa.desc}</p>
                           </div>
                        </div>
                     );
                  })}

                  {/* Summary Card */}
                  <div className="mt-auto bg-gradient-to-r from-emerald-500/20 to-emerald-600/15 border border-emerald-500/40 rounded-2xl p-5 shadow-lg shadow-emerald-500/10">
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
            </div>

            <footer className="relative z-10 px-8 py-3 border-t border-emerald-400/10 flex justify-between items-center">
               <p className="text-emerald-400/50 text-sm">Avaluz • Estudo de Locação</p>
               <p className="text-emerald-400/50 text-sm font-medium">03 / {totalPages}</p>
            </footer>
         </div>
         )}

         {/* Indicadores de Performance - Optimized for TV */}
         {showIndicators && (
         <div className={pageClass} style={pageStyle}>
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-emerald-500/8 to-transparent rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-orange-500/6 to-transparent rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
            </div>

            <header className="relative z-10 px-8 py-4 border-b border-emerald-400/10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/25 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                     <BarChart3 size={24} className="text-emerald-400" />
                  </div>
                  <div>
                     <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase font-medium">Indicadores</p>
                     <h2 className="text-white font-bold text-2xl">Indicadores de Performance</h2>
                  </div>
               </div>
               <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
            </header>

            <div className="relative z-10 flex-1 flex px-8 py-5 gap-6">
               {/* Left Column: Primary Indicators Grid */}
               <div className="w-1/2 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                     {/* Tempo Médio */}
                     {showRentalTime && (
                        <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border border-emerald-400/25 rounded-2xl p-5 flex flex-col">
                           <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-xl bg-emerald-500/25 flex items-center justify-center">
                                 <Clock size={22} className="text-emerald-400" />
                              </div>
                              <h4 className="text-white font-semibold text-base">Tempo Médio</h4>
                           </div>
                           <p className="text-white font-bold text-3xl mb-2">{rentalTimeText}</p>
                           <p className="text-emerald-100/70 text-sm leading-relaxed line-clamp-3 mt-auto">{rentalTimeDescription}</p>
                        </div>
                     )}
                     
                     {/* Risco Vacância */}
                     <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border border-emerald-400/25 rounded-2xl p-5 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-12 h-12 rounded-xl bg-orange-500/25 flex items-center justify-center">
                              <AlertTriangle size={22} className="text-orange-400" />
                           </div>
                           <h4 className="text-white font-semibold text-base">Risco Vacância</h4>
                        </div>
                        <p className="text-green-400 font-bold text-3xl mb-2">Baixo</p>
                        <p className="text-emerald-100/70 text-sm mt-auto">Baseado na demanda da região</p>
                     </div>
                     
                     {/* Competitividade */}
                     <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border border-emerald-400/25 rounded-2xl p-5 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-12 h-12 rounded-xl bg-blue-500/25 flex items-center justify-center">
                              <Target size={22} className="text-blue-400" />
                           </div>
                           <h4 className="text-white font-semibold text-base">Competitividade</h4>
                        </div>
                        <p className="text-emerald-400 font-bold text-3xl mb-2">Alta</p>
                        <p className="text-emerald-100/70 text-sm mt-auto">Preço alinhado ao mercado</p>
                     </div>
                     
                     {/* Custo Total */}
                     <div className="bg-gradient-to-br from-purple-500/15 to-purple-600/10 border border-purple-400/25 rounded-2xl p-5 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-12 h-12 rounded-xl bg-purple-500/25 flex items-center justify-center">
                              <Wallet size={22} className="text-purple-400" />
                           </div>
                           <h4 className="text-white font-semibold text-base">Custo Total</h4>
                        </div>
                        <p className="text-white font-bold text-3xl mb-2">{fmtMoney(custoTotal)}</p>
                        <p className="text-purple-200/70 text-sm mt-auto">Aluguel + Cond + IPTU</p>
                     </div>
                  </div>
                  
                  {/* Perfil Ideal do Inquilino */}
                  <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/15 border border-emerald-500/35 rounded-2xl p-5 shadow-lg shadow-emerald-500/10">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/25 flex items-center justify-center">
                           <Users size={20} className="text-emerald-400" />
                        </div>
                        <h4 className="text-white font-bold text-lg">Perfil Ideal do Inquilino</h4>
                     </div>
                     <div className="grid grid-cols-4 gap-3">
                        {[
                           { label: property.quartos >= 3 ? 'Família' : property.quartos >= 2 ? 'Casal' : 'Solteiro', icon: Users },
                           { label: 'Renda 3x', icon: Wallet },
                           { label: 'Longo prazo', icon: Clock },
                           { label: 'Estabilidade', icon: Shield }
                        ].map((item, i) => (
                           <div key={i} className="bg-emerald-500/15 border border-emerald-400/20 rounded-xl p-3 text-center">
                              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                                 <item.icon size={18} className="text-emerald-400" />
                              </div>
                              <p className="text-white text-sm font-semibold">{item.label}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Right Column: Strategy + Cost Breakdown */}
               <div className="w-1/2 flex flex-col gap-4">
                  {/* Estratégia de Anúncio */}
                  <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border border-emerald-400/25 rounded-2xl p-6 flex-1">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/25 flex items-center justify-center">
                           <Sparkles size={22} className="text-orange-400" />
                        </div>
                        <h4 className="text-white font-bold text-lg">Estratégia de Anúncio para Locação</h4>
                     </div>
                     <p className="text-emerald-100/80 text-base mb-5 leading-relaxed">
                        Para locação, o foco é <span className="text-emerald-400 font-semibold">velocidade e praticidade</span>. O inquilino busca soluções rápidas.
                     </p>
                     <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {[
                           '✓ Pronto para morar',
                           getMobiliadoLabel(property.mobiliado) === 'Mobiliado' ? '✓ Mobiliado completo' : '✓ Aceita mobília',
                           '✓ Chaves na mão',
                           '✓ Documentação em ordem',
                           '✓ Fotos funcionais',
                           '✓ Destaque localização'
                        ].map((item, i) => (
                           <div key={i} className="flex items-center gap-2 text-emerald-200/90 text-base">
                              <span>{item}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  {/* Custo Mensal Detalhado */}
                  <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/15 border border-orange-500/40 rounded-2xl p-6 shadow-lg shadow-orange-500/10">
                     <p className="text-orange-400 text-sm uppercase tracking-wider mb-5 font-bold">Custo Mensal para o Inquilino</p>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center justify-around">
                           <div className="text-center">
                              <p className="text-emerald-300/70 text-xs uppercase mb-2 font-medium">Aluguel</p>
                              <p className="text-white font-bold text-lg whitespace-nowrap">{fmtMoney(market.valor_estimado)}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-emerald-300/70 text-xs uppercase mb-2 font-medium">Cond.</p>
                              <p className="text-white font-bold text-lg whitespace-nowrap">{property.condominio ? fmtMoney(property.condominio) : '-'}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-emerald-300/70 text-xs uppercase mb-2 font-medium">IPTU</p>
                              <p className="text-white font-bold text-lg whitespace-nowrap">{iptuMensal > 0 ? fmtMoney(iptuMensal) : '-'}</p>
                           </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-xl px-5 py-3 border border-orange-400/30">
                           <p className="text-orange-300 text-xs uppercase font-bold mb-1 text-center">Total</p>
                           <p className="text-orange-400 font-bold text-xl whitespace-nowrap">{fmtMoney(custoTotal)}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <footer className="relative z-10 px-8 py-3 border-t border-emerald-400/10 flex justify-between items-center">
               <p className="text-emerald-400/50 text-sm">Avaluz • Estudo de Locação</p>
               <p className="text-emerald-400/50 text-sm font-medium">04 / {totalPages}</p>
            </footer>
         </div>
         )}
         </>
         )}

         {/* ================= PÁGINA: IDENTIFICAÇÃO DO IMÓVEL (Otimizado para TV) ================= */}
         <div className={pageClass} style={pageStyle}>
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}14, transparent, transparent)` }} />
               <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}0f, transparent, transparent)` }} />
            </div>

            <header className="relative z-10 px-8 py-4 border-b border-emerald-400/10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/20 flex items-center justify-center border border-emerald-400/20">
                     <Building2 size={24} className="text-emerald-400" />
                  </div>
                  <div>
                     <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase font-medium">Objeto da Avaliação</p>
                     <h2 className="text-white font-bold text-2xl">Identificação do Imóvel</h2>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30">
                        <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/30">
                        <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
               </div>
            </header>

            <div className="relative z-10 flex-1 flex px-8 py-5 gap-6">
               {/* Left: Photo + Location + Client - maior impacto visual */}
               <div className="w-[45%] flex flex-col gap-3">
                  {/* Property Photo - slightly smaller to fit client card */}
                  <div className="flex-1 min-h-0 rounded-2xl overflow-hidden relative bg-gradient-to-br from-emerald-900/50 to-emerald-950/80 shadow-2xl border border-emerald-500/20">
                     {property.foto_capa ? (
                        <img src={property.foto_capa} alt="Imóvel" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <Building2 size={80} className="text-emerald-700/50" />
                        </div>
                     )}
                     <div className="absolute top-4 left-4">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/95 rounded-full px-3 py-1.5 shadow-lg">
                           <Key size={14} className="text-white" />
                           <span className="text-white text-xs font-bold uppercase tracking-wider">Locação</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Location Card */}
                  <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-3">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                           <MapPin size={20} className="text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-white font-semibold text-base truncate">{property.rua || property.bairro}</p>
                           <p className="text-emerald-300/70 text-xs truncate">
                              {property.municipio} - {property.estado} {property.cep && `• CEP: ${property.cep}`}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Client Card - with fallback when hidden */}
                  {showClient && (
                     <div className="bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 border border-emerald-400/30 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                              <User size={20} className="text-emerald-400" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="text-emerald-400 text-[10px] uppercase tracking-wider mb-0.5">Preparado para</p>
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

               {/* Right: Specs + Details - enhanced typography */}
               <div className="w-[55%] flex flex-col gap-4">
                  {/* Specs Grid - larger cards */}
                  <div className="grid grid-cols-6 gap-2">
                     {[
                        { icon: Ruler, value: property.area, label: 'm²' },
                        { icon: BedDouble, value: property.quartos, label: 'Quartos' },
                        { icon: Home, value: property.suites || '-', label: 'Suítes' },
                        { icon: Bath, value: property.banheiros || '-', label: 'Banhos' },
                        { icon: Car, value: property.vagas || '-', label: 'Vagas' },
                        ...(getMobiliadoLabel(property.mobiliado) ? [{ icon: Sofa, value: getMobiliadoLabel(property.mobiliado)?.split('-')[0]?.trim() || getMobiliadoLabel(property.mobiliado)?.split(' ')[0], label: 'Mobília' }] : [])
                     ].slice(0, 6).map((item, i) => (
                        <div key={i} className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-3 text-center">
                           <item.icon size={20} className="text-emerald-400 mx-auto mb-2" />
                           <p className="text-white font-bold text-xl">{item.value}</p>
                           <p className="text-emerald-300/60 text-[10px] uppercase tracking-wide mt-0.5">{item.label}</p>
                        </div>
                     ))}
                  </div>

                  {/* Cost Breakdown - larger and prominent */}
                  <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/15 border border-orange-500/40 rounded-xl p-5 shadow-lg shadow-orange-500/10">
                     <p className="text-orange-400 text-sm uppercase tracking-wider mb-4 font-bold">Custo Mensal Total</p>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center justify-around">
                           <div className="text-center">
                              <p className="text-emerald-300/70 text-xs uppercase mb-2">Aluguel</p>
                              <p className="text-white font-bold text-lg whitespace-nowrap">{fmtMoney(market.valor_estimado)}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-emerald-300/70 text-xs uppercase mb-2">Cond.</p>
                              <p className="text-white font-bold text-lg whitespace-nowrap">{property.condominio ? fmtMoney(property.condominio) : '-'}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-emerald-300/70 text-xs uppercase mb-2">IPTU</p>
                              <p className="text-white font-bold text-lg whitespace-nowrap">{iptuMensal > 0 ? fmtMoney(iptuMensal) : '-'}</p>
                           </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-xl px-5 py-3 border border-orange-400/30">
                           <p className="text-orange-300 text-xs uppercase font-bold mb-1 text-center">Total</p>
                           <p className="text-orange-400 font-bold text-xl whitespace-nowrap">{fmtMoney(custoTotal)}</p>
                        </div>
                     </div>
                  </div>

                  {/* Ratings - larger stars */}
                  {(property.avaliacaoTecnica || property.localizacao || property.planta) && (
                     <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                           <Star size={18} className="text-orange-400" />
                           <p className="text-emerald-400 text-sm uppercase tracking-wider font-semibold">Avaliação</p>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                           {property.avaliacaoTecnica && (
                              <div className="flex items-center gap-2">
                                 <span className="text-emerald-200/70 text-sm">Técnica:</span>
                                 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= property.avaliacaoTecnica! ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />)}</div>
                              </div>
                           )}
                           {property.localizacao && (
                              <div className="flex items-center gap-2">
                                 <span className="text-emerald-200/70 text-sm">Local:</span>
                                 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= property.localizacao! ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />)}</div>
                              </div>
                           )}
                           {property.planta && (
                              <div className="flex items-center gap-2">
                                 <span className="text-emerald-200/70 text-sm">Planta:</span>
                                 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= property.planta! ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />)}</div>
                              </div>
                           )}
                           {property.acabamentos && (
                              <div className="flex items-center gap-2">
                                 <span className="text-emerald-200/70 text-sm">Acabam.:</span>
                                 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= property.acabamentos! ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />)}</div>
                              </div>
                           )}
                           {property.conservacao && (
                              <div className="flex items-center gap-2">
                                 <span className="text-emerald-200/70 text-sm">Conserv.:</span>
                                 <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= property.conservacao! ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />)}</div>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Features - larger badges */}
                  {property.features && property.features.length > 0 && (
                     <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                           <CheckCircle2 size={18} className="text-emerald-400" />
                           <p className="text-emerald-400 text-sm uppercase tracking-wider font-semibold">Diferenciais</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {property.features.slice(0, 12).map((feat, i) => (
                              <span key={i} className="bg-emerald-500/20 text-emerald-200 text-xs px-3 py-1 rounded-full border border-emerald-400/20">{feat}</span>
                           ))}
                           {property.features.length > 12 && <span className="text-emerald-400 text-sm font-medium">+{property.features.length - 12}</span>}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            <footer className="relative z-10 px-8 py-3 border-t border-emerald-400/10 flex justify-between items-center">
               <p className="text-emerald-400/50 text-sm">Avaluz • Estudo de Locação</p>
               <p className="text-emerald-400/50 text-sm font-medium">05 / {totalPages}</p>
            </footer>
         </div>

         {/* ================= PÁGINAS DE AMOSTRAS (Otimizado para TV) ================= */}
         {samplesToShow.map((sample, index) => {
            const pageNum = 6 + marketingPageCount + index;
            const diffValue = sample.valor - market.valor_estimado;
            const diffPercent = market.valor_estimado > 0 ? (diffValue / market.valor_estimado) * 100 : 0;
            const isPositive = diffValue > 0;
            const images = sample.imagens?.length ? sample.imagens : (sample.imagem ? [sample.imagem] : []);

            return (
               <div key={sample.id} className={pageClass} style={pageStyle}>
                  {/* Background decorations */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}14, transparent, transparent)` }} />
                     <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}0f, transparent, transparent)` }} />
                  </div>

                  <header className="relative z-10 px-8 py-4 border-b border-emerald-400/10 flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/20 flex items-center justify-center border border-emerald-400/20">
                           <span className="text-emerald-400 font-bold text-lg">{String(index + 1).padStart(2, '0')}</span>
                        </div>
                        <div>
                           <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase font-medium">Amostra Comparável</p>
                           <h2 className="text-white font-bold text-2xl">Imóvel para Locação #{index + 1}</h2>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        {broker?.logo_imobiliaria_url && (
                           <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30">
                              <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                           </div>
                        )}
                        {broker?.avatar_url && (
                           <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/30">
                              <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                           </div>
                        )}
                        <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
                     </div>
                  </header>

                  <div className="relative z-10 flex-1 min-h-0 flex px-8 py-5 gap-6 overflow-hidden">
                     {/* Left: Images - larger grid */}
                     <div className="w-[45%] rounded-2xl overflow-hidden relative bg-gradient-to-br from-emerald-900/50 to-emerald-950/80 shadow-2xl border border-emerald-500/20">
                        {sample.link && (
                           <a href={sample.link} target="_blank" rel="noopener noreferrer" 
                              className="absolute bottom-4 right-4 bg-emerald-500/95 backdrop-blur rounded-full px-4 py-2 z-10 hover:bg-emerald-400 transition-colors inline-flex items-center gap-2 shadow-lg">
                              <ExternalLink size={14} className="text-white" />
                              <span className="text-white text-sm font-medium">Ver anúncio</span>
                           </a>
                        )}
                        {images.length === 0 ? (
                           <div className="absolute inset-0 flex items-center justify-center"><Building2 size={80} className="text-emerald-700/50" /></div>
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
                           <div className="bg-emerald-950/80 backdrop-blur rounded-full px-3 py-1.5">
                               <span className="text-white text-sm font-semibold">{sample.categoria || sample.titulo || 'Imóvel'}</span>
                           </div>
                        </div>
                     </div>

                     {/* Right: Details - enhanced typography */}
                     <div className="w-[55%] flex flex-col gap-4">
                        {/* Title */}
                        <h3 className="text-white font-bold text-xl line-clamp-2">{sample.titulo}</h3>

                        {/* Value Card + Location Card side by side */}
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40 rounded-xl p-4 shadow-lg shadow-emerald-500/10">
                              <p className="text-emerald-400 text-xs uppercase tracking-wider mb-2 font-semibold">Aluguel</p>
                              <p className="text-white font-bold text-2xl whitespace-nowrap">{fmtMoney(sample.valor)}<span className="text-base font-normal text-emerald-300/60">/mês</span></p>
                              <p className="text-emerald-300/60 text-sm mt-1">{fmtM2Simple(sample.valor, sample.area)}/m²</p>
                           </div>
                           <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-4 flex items-center justify-center">
                              <div className="text-center">
                                 <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
                                    <MapPin size={20} className="text-orange-400" />
                                 </div>
                                 <p className="text-white font-semibold text-base truncate">{sample.bairro || 'Bairro'}</p>
                                 {sample.municipio && <p className="text-emerald-300/60 text-sm truncate">{sample.municipio}</p>}
                              </div>
                           </div>
                        </div>

                        {/* Specs - larger cards */}
                        <div className="grid grid-cols-4 gap-3">
                           {[
                              { icon: Ruler, value: `${sample.area}m²`, label: 'Área' },
                              { icon: BedDouble, value: sample.quartos, label: 'Quartos' },
                              { icon: Bath, value: sample.banheiros, label: 'Banhos' },
                              { icon: Car, value: sample.vagas, label: 'Vagas' }
                           ].map((item, i) => (
                              <div key={i} className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-3 text-center">
                                 <item.icon size={20} className="text-emerald-400 mx-auto mb-2" />
                                 <p className="text-white font-bold text-lg">{item.value}</p>
                                 <p className="text-emerald-300/60 text-[10px] uppercase tracking-wide">{item.label}</p>
                              </div>
                           ))}
                        </div>

                         {/* Description - larger text, more lines */}
                         <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-5 flex-1 min-h-0 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                               <FileText size={18} className="text-emerald-400" />
                               <p className="text-emerald-400 text-sm uppercase tracking-wider font-semibold">Descrição</p>
                            </div>
                            <p className="text-emerald-100/80 text-base leading-relaxed line-clamp-[8] break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{sample.descricao || 'Imóvel disponível para locação.'}</p>
                         </div>

                     </div>
                  </div>

                  <footer className="relative z-10 px-8 py-3 border-t border-emerald-400/10 flex justify-between items-center">
                     <p className="text-emerald-400/50 text-sm">Avaluz • Estudo de Locação</p>
                     <p className="text-emerald-400/50 text-sm font-medium">{String(pageNum).padStart(2, '0')} / {totalPages}</p>
                  </footer>
               </div>
            );
         })}

         {/* ================= PÁGINA: DIAGNÓSTICO (Otimizado para TV) ================= */}
         <div className={pageClass} style={pageStyle}>
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}14, transparent, transparent)` }} />
               <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}0f, transparent, transparent)` }} />
            </div>

            <header className="relative z-10 px-8 py-4 border-b border-emerald-400/10 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/20 flex items-center justify-center border border-emerald-400/20">
                     <BarChart3 size={24} className="text-emerald-400" />
                  </div>
                  <div>
                     <p className="text-emerald-400 text-xs tracking-[0.2em] uppercase font-medium">Análise de Valor</p>
                     <h2 className="text-white font-bold text-2xl">Diagnóstico & Estratégia</h2>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {broker?.logo_imobiliaria_url && (
                     <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30">
                        <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  {broker?.avatar_url && (
                     <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/30">
                        <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                     </div>
                  )}
                  <img src={avaluzLogo} alt="Avaluz" className="h-14 w-auto" />
               </div>
            </header>

            <div className="relative z-10 flex-1 flex px-8 py-5 gap-6">
               {/* Left: Mini-card + Chart */}
               <div className="w-1/2 flex flex-col gap-4">
                  {/* Property Mini-card - with complete info like portrait */}
                  <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-4 flex items-center gap-4">
                     <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-emerald-500/30">
                        {property.foto_capa ? (
                           <img src={property.foto_capa} alt="" className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center">
                              <Home size={24} className="text-emerald-400" />
                           </div>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-lg truncate">{property.bairro}</p>
                        <p className="text-emerald-300/70 text-sm">{property.municipio} - {property.estado}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                           <span className="text-emerald-300/70 text-sm">{property.area}m²</span>
                           <span className="text-emerald-300/50">•</span>
                           <span className="text-emerald-300/70 text-sm">{property.quartos} quartos</span>
                           {property.suites > 0 && (
                              <>
                                 <span className="text-emerald-300/50">•</span>
                                 <span className="text-emerald-300/70 text-sm">{property.suites} suítes</span>
                              </>
                           )}
                           <span className="text-emerald-300/50">•</span>
                           <span className="text-emerald-300/70 text-sm">{property.banheiros} banheiros</span>
                           <span className="text-emerald-300/50">•</span>
                           <span className="text-emerald-300/70 text-sm">{property.vagas} vagas</span>
                        </div>
                     </div>
                     <div className="text-right flex-shrink-0">
                        <p className="text-emerald-300/60 text-xs uppercase">Aluguel Estimado</p>
                        <p className="text-orange-400 font-bold text-xl">{fmtMoney(market.valor_estimado)}/mês</p>
                     </div>
                  </div>

                  {/* Chart - takes remaining space with large size for TV */}
                  <div className="flex-1 min-h-0">
                     <PriceComparisonChart
                        samples={samplesToShow}
                        evaluatedProperty={{ valorEstimado: market.valor_estimado, area: property.area }}
                        accentColor="emerald"
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
                  <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/15 border-2 border-emerald-500/50 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-emerald-500/10">
                     <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
                     <div className="absolute top-4 right-4">
                        <span className="bg-emerald-500/30 text-emerald-300 text-xs uppercase font-bold px-3 py-1 rounded-full">Recomendado</span>
                     </div>
                     <p className="text-emerald-300/70 text-sm uppercase tracking-wider mb-2">Aluguel de Equilíbrio</p>
                     <p className="text-white font-bold text-4xl">{fmtMoney(market.valor_estimado)}<span className="text-xl font-normal text-emerald-300/60">/mês</span></p>
                     <p className="text-emerald-400 text-base mt-2">{fmtM2Simple(market.valor_estimado, property.area)}/m²</p>
                  </div>

                  {/* Min/Max Cards - with complete info like portrait */}
                  {showMinMax && (
                     <div className="grid grid-cols-2 gap-4">
                        {showMaximo && (
                           <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-4 relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400"></div>
                              <div className="flex items-center gap-2 mb-2">
                                 <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                    <TrendingUp size={16} className="text-orange-400" />
                                 </div>
                                 <span className="text-orange-400 text-sm uppercase font-semibold">Aluguel Premium</span>
                              </div>
                              <p className="text-white font-bold text-2xl mb-2">{fmtMoney(market.maximo)}<span className="text-sm font-normal text-emerald-300/60">/mês</span></p>
                              <div className="space-y-1">
                                 <p className="text-emerald-100/70 text-sm"><span className="text-emerald-400 font-medium">Valor competitivo</span></p>
                                 {showRentalTime && (
                                    <p className="text-emerald-100/70 text-sm">Locação: <span className="text-white font-medium">{rentalTimeText}</span></p>
                                 )}
                              </div>
                           </div>
                        )}
                        {showMinimo && (
                           <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-4 relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                              <div className="flex items-center gap-2 mb-2">
                                 <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <Zap size={16} className="text-green-400" />
                                 </div>
                                 <span className="text-green-400 text-sm uppercase font-semibold">Aluguel Agressivo</span>
                              </div>
                              <p className="text-white font-bold text-2xl mb-2">{fmtMoney(market.minimo)}<span className="text-sm font-normal text-emerald-300/60">/mês</span></p>
                              <div className="space-y-1">
                                 <p className="text-emerald-200/70 text-sm"><span className="text-green-400 font-medium">Aluga rápido</span></p>
                                 {showRentalTime && (
                                    <p className="text-emerald-200/70 text-sm">Locação: <span className="text-white font-medium">1-7 dias</span></p>
                                 )}
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Warning Card - complete content like portrait */}
                  <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/15 border border-orange-500/40 rounded-xl p-5 mt-auto shadow-lg shadow-orange-500/10">
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                           <AlertCircle size={24} className="text-orange-400" />
                        </div>
                        <div className="flex-1">
                           <h4 className="text-white font-bold text-lg mb-2">Elasticidade de Preço</h4>
                           <p className="text-emerald-100/80 text-base leading-relaxed">
                              Cada <span className="text-orange-400 font-semibold">R$ 200 acima do mercado</span> pode representar 
                              <span className="text-orange-400 font-semibold"> +30 dias de imóvel vazio</span>. O custo da vacância 
                              muitas vezes supera a diferença no valor do aluguel.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <footer className="relative z-10 px-8 py-3 border-t border-emerald-400/10 flex justify-between items-center">
               <p className="text-emerald-400/50 text-sm">Avaluz • Estudo de Locação</p>
               <p className="text-emerald-400/50 text-sm font-medium">{String(5 + marketingPageCount + samplePages + 1).padStart(2, '0')} / {totalPages}</p>
            </footer>
         </div>

         {/* ================= PÁGINAS: QUADRO COMPARATIVO ================= */}
         {tableChunks.map((chunkSamples, chunkIndex) => {
            const isFirstTablePage = chunkIndex === 0;
            const isLastTablePage = chunkIndex === tableChunks.length - 1;
            const tablePageNumber = 5 + marketingPageCount + samplePages + 2 + chunkIndex;

            return (
               <div key={`table-page-${chunkIndex}`} className={pageClass} style={pageStyle}>
                  {/* Background effects */}
                  <div className="absolute inset-0 overflow-hidden">
                     <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent, transparent)` }}></div>
                     <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}14, transparent, transparent)` }}></div>
                  </div>

                  <header className="relative z-10 px-6 py-3 border-b border-emerald-400/10 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                           <BarChart3 size={16} className="text-emerald-400" />
                        </div>
                        <div>
                           <p className="text-emerald-400 text-xs tracking-[0.15em] uppercase">Análise Comparativa</p>
                           <h2 className="text-white font-bold text-xl">
                              Quadro Comparativo
                              {tableChunks.length > 1 && <span className="text-emerald-300/60 text-base ml-2">({chunkIndex + 1}/{tableChunks.length})</span>}
                           </h2>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        {broker?.logo_imobiliaria_url && (
                           <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/30 flex-shrink-0">
                              <img src={broker.logo_imobiliaria_url} alt={broker?.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                           </div>
                        )}
                        {broker?.avatar_url && (
                           <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-500/30">
                              <img src={broker.avatar_url} alt={broker?.nome || ''} className="w-full h-full object-cover" />
                           </div>
                        )}
                        <img src={avaluzLogo} alt="Avaluz" className="h-10 w-auto" />
                     </div>
                  </header>

                  <div className="relative z-10 flex-1 flex flex-col px-6 py-3">
                     <div className="bg-emerald-500/5 backdrop-blur-xl border border-emerald-400/20 rounded-xl overflow-hidden flex-1">
                        {/* Table Header - TV Optimized */}
                        <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-emerald-400/10">
                           <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/15 p-3">
                              <p className="text-emerald-400 text-xs uppercase tracking-wider font-semibold">Imóvel</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Ruler size={16} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[10px] uppercase">Área</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <BedDouble size={16} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[10px] uppercase">Quartos</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Bath size={16} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[10px] uppercase">Banheiros</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <Car size={16} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[10px] uppercase">Vagas</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <DollarSign size={16} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[10px] uppercase">Aluguel</p>
                           </div>
                           <div className="bg-[#0A1E3C] p-3 text-center">
                              <TrendingUp size={16} className="text-emerald-400 mx-auto mb-1" />
                              <p className="text-emerald-300/60 text-[10px] uppercase">R$/m²</p>
                           </div>
                        </div>

                        {/* Your Property Row - TV Optimized */}
                        {isFirstTablePage && (
                           <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-emerald-400/10">
                              <div className="bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 p-3 flex items-center gap-3">
                                 <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 border-emerald-500/40">
                                    {property.foto_capa ? (
                                       <img src={property.foto_capa} alt="Seu Imóvel" className="w-full h-full object-cover" />
                                    ) : (
                                       <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center"><Home size={18} className="text-emerald-400" /></div>
                                    )}
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <p className="text-emerald-400 font-bold text-sm">Seu Imóvel</p>
                                    <p className="text-emerald-300/70 text-xs truncate">{property.bairro}, {property.municipio}</p>
                                 </div>
                              </div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center"><p className="text-white font-bold text-sm">{property.area} m²</p></div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center"><p className="text-white font-bold text-sm">{property.quartos}</p></div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center"><p className="text-white font-bold text-sm">{property.banheiros}</p></div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center"><p className="text-white font-bold text-sm">{property.vagas}</p></div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center"><p className="text-emerald-400 font-bold text-sm">{fmtMoney(market.valor_estimado)}</p></div>
                              <div className="bg-emerald-500/10 p-3 flex items-center justify-center"><p className="text-emerald-400 font-semibold text-xs">{fmtM2Simple(market.valor_estimado, property.area)}</p></div>
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
                           // Calcular número global da amostra (considerando chunks anteriores)
                           const globalSampleNumber = (chunkIndex * 6) + index + 1;

                           return (
                              <div key={sample.id} className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-emerald-400/10">
                                 <div className="bg-[#0A1E3C] p-3 flex items-center gap-3">
                                    {/* Sample number badge */}
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                                       <span className="text-emerald-400 text-[10px] font-bold">{globalSampleNumber}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-emerald-400/30">
                                       {sampleImage ? (
                                          <img src={sampleImage} alt={displayTitle} className="w-full h-full object-cover" />
                                       ) : (
                                          <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center"><Building2 size={18} className="text-emerald-400" /></div>
                                       )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-white font-semibold text-xs line-clamp-2 leading-snug">{displayTitle}</p>
                                       <p className="text-emerald-300/70 text-[11px] truncate mt-0.5">{sample.bairro || property.bairro}{sample.municipio && `, ${sample.municipio}`}</p>
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
                        <>
                           <div className="grid grid-cols-4 gap-3 mt-3">
                              <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 text-center">
                                 <p className="text-emerald-300/60 text-[10px] uppercase tracking-wider mb-1">Média do Mercado</p>
                                 <p className="text-white font-bold text-lg">{fmtMoney(allSamples.reduce((acc, s) => acc + s.valor, 0) / allSamples.length)}</p>
                              </div>
                              <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 text-center">
                                 <p className="text-emerald-300/60 text-[10px] uppercase tracking-wider mb-1">Média R$/m²</p>
                                 <p className="text-white font-bold text-lg">{fmtM2Simple(allSamples.reduce((acc, s) => acc + s.valor, 0) / allSamples.length, allSamples.reduce((acc, s) => acc + s.area, 0) / allSamples.length)}</p>
                              </div>
                              <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 text-center">
                                 <p className="text-emerald-300/60 text-[10px] uppercase tracking-wider mb-1">Menor Aluguel</p>
                                 <p className="text-green-400 font-bold text-lg">{fmtMoney(Math.min(...allSamples.map(s => s.valor)))}</p>
                              </div>
                              <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 text-center">
                                 <p className="text-emerald-300/60 text-[10px] uppercase tracking-wider mb-1">Maior Aluguel</p>
                                 <p className="text-orange-400 font-bold text-lg">{fmtMoney(Math.max(...allSamples.map(s => s.valor)))}</p>
                              </div>
                           </div>

                           {/* Legend - TV Optimized */}
                           <div className="flex items-center justify-center gap-8 mt-3">
                              <div className="flex items-center gap-2">
                                 <div className="w-4 h-4 rounded-full bg-emerald-500/40 border border-emerald-500"></div>
                                 <span className="text-emerald-300/60 text-xs">Seu Imóvel (valor estimado)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-green-400 text-sm">↓</span>
                                 <span className="text-emerald-300/60 text-xs">Abaixo da média</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-red-400 text-sm">↑</span>
                                 <span className="text-emerald-300/60 text-xs">Acima da média</span>
                              </div>
                           </div>
                        </>
                     )}
                  </div>

                  <footer className="relative z-10 px-6 py-1.5 border-t border-emerald-400/10 flex justify-between items-center">
                     <p className="text-emerald-400/40 text-xs">Avaluz • Estudo de Locação</p>
                     <p className="text-emerald-400/40 text-xs">{String(tablePageNumber).padStart(2, '0')} / {totalPages}</p>
                  </footer>
               </div>
            );
         })}

         {/* ================= PÁGINA FINAL: CONCLUSÃO - FOTO HORIZONTAL NO TOPO ================= */}
         <div className={pageClass} style={pageStyle}>
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}26, transparent, transparent)` }}></div>
               <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}1a, transparent, transparent)` }}></div>
            </div>

            {/* Hero Property Photo - Full width at top */}
            <div className="relative z-10 h-[35%] w-full">
               {property.foto_capa ? (
                  <img src={property.foto_capa} alt="Imóvel" className="absolute inset-0 w-full h-full object-cover" />
               ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-emerald-950/80 flex items-center justify-center">
                     <Building2 size={60} className="text-emerald-700/30" />
                  </div>
               )}
               {/* Gradient overlay */}
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#061224]"></div>
               <div className="absolute inset-0 bg-gradient-to-r from-[#061224]/50 via-transparent to-[#061224]/50"></div>
               
               {/* Header overlay */}
               <div className="absolute top-0 left-0 right-0 px-6 py-3 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/20">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                     </div>
                     <div>
                        <p className="text-emerald-400 text-[10px] tracking-[0.2em] uppercase drop-shadow-lg">Parecer Final</p>
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

            {/* Content below photo */}
            <div className="relative z-10 flex-1 flex px-6 py-3 gap-4">
               {/* Left: Value + Conclusion */}
               <div className="w-1/2 flex flex-col gap-3">
                  {/* Value Hero Card */}
                  <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                     <p className="text-emerald-300/70 text-xs uppercase tracking-wider mb-1">Aluguel Recomendado</p>
                     <p className="text-emerald-400 font-bold text-3xl mb-1">{fmtMoney(market.valor_estimado)}<span className="text-lg font-normal text-emerald-300/70">/mês</span></p>
                     <div className="flex items-center justify-center gap-3 text-xs">
                        <span className="text-orange-400">Custo total: {fmtMoney(custoTotal)}/mês</span>
                        <span className="text-emerald-300/50">•</span>
                        <span className="text-emerald-300/60">{market.amostras} imóveis analisados</span>
                     </div>
                  </div>

                  {/* Conclusion Text */}
                  <div className="bg-emerald-500/5 border border-emerald-400/15 rounded-xl p-3 flex-1">
                     <h4 className="text-white font-semibold text-sm mb-2">Parecer do Estudo de Locação</h4>
                     <p className="text-emerald-100/80 text-xs leading-relaxed mb-2">
                        Com base na análise de <span className="text-emerald-400 font-medium">{market.amostras} imóveis para locação</span> na 
                        região de <span className="text-white font-medium">{property.bairro}, {property.municipio}</span>, e considerando 
                        as características específicas do imóvel, concluímos que o valor de aluguel mensal 
                        recomendado é de <span className="text-emerald-400 font-bold">{fmtMoney(market.valor_estimado)}</span>.
                     </p>
                     <p className="text-emerald-100/60 text-xs leading-relaxed">
                        Este estudo tem caráter orientativo para definição de valor locatício e estratégia de mercado. 
                        O acompanhamento profissional do corretor responsável é fundamental para uma locação rápida e segura.
                     </p>
                  </div>
               </div>

               {/* Right: Broker Signature Card */}
               {broker && (
                  <div className="w-1/2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/40 rounded-xl p-4 flex flex-col shadow-lg shadow-emerald-500/10">
                     <div className="flex gap-4 items-center flex-1">
                        {/* Agency Column */}
                        <div className="flex-1 flex items-center gap-3 min-w-0">
                           <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20 flex-shrink-0">
                              {broker.logo_imobiliaria_url ? (
                                 <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-emerald-500/20">
                                    <Building2 size={32} className="text-emerald-400" />
                                 </div>
                              )}
                           </div>
                           <div className="min-w-0">
                              <p className="text-emerald-400 text-[10px] uppercase tracking-[0.15em] mb-0.5">Imobiliária</p>
                              <h3 className="text-white font-bold text-base leading-tight truncate">{broker.imobiliaria || 'Imobiliária'}</h3>
                           </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-16 bg-emerald-400/30 flex-shrink-0" />

                        {/* Broker Column */}
                        <div className="flex-1 flex items-center gap-3 min-w-0">
                           <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20 flex-shrink-0">
                              {broker.avatar_url ? (
                                 <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center">
                                    <User size={24} className="text-emerald-400" />
                                 </div>
                              )}
                           </div>
                           <div className="min-w-0">
                              <p className="text-emerald-400 text-[10px] uppercase tracking-[0.15em] mb-0.5">Corretor Responsável</p>
                              <h3 className="text-white font-bold text-base leading-tight truncate">{broker.nome || 'Especialista'}</h3>
                              {broker.creci && (
                                 <p className="text-emerald-300/70 text-xs mt-0.5 flex items-center gap-1">
                                    <Award size={10} className="text-emerald-400" />
                                    CRECI {broker.creci}
                                 </p>
                              )}
                              {showBrokerContact && (brokerPhone || brokerEmail) && (
                                 <div className="mt-1 space-y-0.5">
                                    {brokerPhone && (
                                       <p className="text-emerald-100/70 text-xs flex items-center gap-1">
                                          <Phone size={9} className="text-emerald-400" />
                                          {brokerPhone}
                                       </p>
                                    )}
                                    {brokerEmail && (
                                       <p className="text-emerald-100/70 text-xs flex items-center gap-1 truncate">
                                          <Mail size={9} className="text-emerald-400" />
                                          {brokerEmail}
                                       </p>
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Signature Row */}
                     <div className="flex items-center gap-4 pt-3 mt-3 border-t border-emerald-500/30">
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
                                       className="h-10 w-auto object-contain max-w-32"
                                       crossOrigin="anonymous"
                                       referrerPolicy="no-referrer"
                                    />
                                 </div>
                                 <div className="w-36 border-b border-emerald-500/30 mt-1" />
                                 <p className="text-emerald-300/60 text-[10px] mt-0.5">Assinatura do Corretor</p>
                              </div>
                           ) : (
                              <div className="flex flex-col items-end">
                                 <div className="w-36 h-10 border-b-2 border-dashed border-emerald-500/40" />
                                 <p className="text-emerald-300/60 text-[10px] mt-0.5">Assinatura do Corretor</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Footer with full disclaimer */}
            <footer className="relative z-10 px-6 py-2 border-t border-emerald-400/10">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <img src={avaluzLogo} alt="Avaluz" className="h-8 w-auto" />
                     <p className="text-emerald-300/50 text-[10px] max-w-md">
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
