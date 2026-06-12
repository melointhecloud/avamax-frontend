// AvaluzBuyerReport.tsx - Portrait A4 PDF for property search results
// Modeled after Sale/Rental PDFs with full visual parity

import React from 'react'
import avaluzLogo from '@/assets/avaluz-logo-transparent.png'
import { getImageUrlForPdf } from '@/lib/pdfImages'
import { PdfThemeStyles } from '@/components/pdf/PdfThemeStyles'
import {
  Building2,
  MapPin,
  User,
  Award,
  Phone,
  Mail,
  Bed,
  Bath,
  Car,
  Ruler,
  Star,
  TrendingDown,
  Search,
  Home,
  Database,
  Filter,
  Target,
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  Wallet,
  Key,
  FileCheck,
  Calculator,
  UserCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import type { PropertyForDisplay } from '@/services/buscar-imoveis.service'
import type { BuscarImoveisFormData } from '@/validators/BuscarImoveis'

interface BrokerData {
  nome?: string | null
  email?: string | null
  creci?: string | null
  avatar_url?: string | null
  imobiliaria?: string | null
  telefone?: string | null
  logo_imobiliaria_url?: string | null
  signature_url?: string | null
  telefone_custom?: string | null
  email_custom?: string | null
}

interface PdfColors {
  background: string
  backgroundGradientFrom: string
  backgroundGradientVia: string
  backgroundGradientTo: string
  primary: string
  primaryLight: string
  secondary: string
  secondaryLight: string
  accent: string
  text: string
  textMuted: string
  cardBackground: string
  cardBorder: string
}

const DEFAULT_COLORS: PdfColors = {
  background: '#0A1628',
  backgroundGradientFrom: '#061224',
  backgroundGradientVia: '#0A1E3C',
  backgroundGradientTo: '#0D2847',
  primary: '#f97316', // orange for buyer
  primaryLight: '#fb923c',
  secondary: '#3b82f6',
  secondaryLight: '#60a5fa',
  accent: '#10b981',
  text: '#ffffff',
  textMuted: '#94a3b8',
  cardBackground: 'rgba(59, 130, 246, 0.1)',
  cardBorder: 'rgba(96, 165, 250, 0.2)',
}

interface AcquisitionPlanSettings {
  introduction?: { enabled: boolean }
  process?: { enabled: boolean }
  financing?: { enabled: boolean }
}

interface PdfSettings {
  showAcquisitionPlan?: boolean
  acquisitionPlan?: AcquisitionPlanSettings
  showClient?: boolean
  clientName?: string
  showBrokerContact?: boolean
  pdfColors?: PdfColors
}

interface AvaluzBuyerReportProps {
  properties: PropertyForDisplay[]
  searchCriteria: BuscarImoveisFormData
  broker?: BrokerData | null
  settings?: PdfSettings
}

export const AvaluzBuyerReport: React.FC<AvaluzBuyerReportProps> = ({
  properties,
  searchCriteria,
  broker,
  settings = {},
}) => {
  const c = settings.pdfColors || DEFAULT_COLORS
  
  const showAcquisitionPlan = settings.showAcquisitionPlan !== false
  const ap = settings.acquisitionPlan || {}
  const showIntroduction = showAcquisitionPlan && ap.introduction?.enabled !== false
  const showProcess = showAcquisitionPlan && ap.process?.enabled !== false
  const showFinancing = showAcquisitionPlan && ap.financing?.enabled !== false
  
  const showClient = settings.showClient !== false
  const clientName = settings.clientName || null
  const showBrokerContact = settings.showBrokerContact !== false
  
  const brokerPhone = broker?.telefone_custom || broker?.telefone
  const brokerEmail = broker?.email_custom || broker?.email

  const fmtMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)

  const pageClass =
    'w-[210mm] min-h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break'
  const pageStyle = { background: `linear-gradient(to bottom right, ${c.backgroundGradientFrom}, ${c.backgroundGradientVia}, ${c.backgroundGradientTo})` }

  // Calculate stats
  const avgPrice = properties.length > 0 
    ? properties.reduce((sum, p) => sum + p.valor, 0) / properties.length 
    : 0
  const avgM2 = properties.length > 0
    ? properties.reduce((sum, p) => sum + p.valor / (p.metros || 1), 0) / properties.length
    : 0
  const minPrice = properties.length > 0 ? Math.min(...properties.map((p) => p.valor)) : 0
  const maxPrice = properties.length > 0 ? Math.max(...properties.map((p) => p.valor)) : 0

  // Split properties into pages (2 per page)
  const PROPERTIES_PER_PAGE = 2
  const propertyPages: PropertyForDisplay[][] = []
  for (let i = 0; i < properties.length; i += PROPERTIES_PER_PAGE) {
    propertyPages.push(properties.slice(i, i + PROPERTIES_PER_PAGE))
  }

  // Calculate total pages
  const acquisitionPageCount = showAcquisitionPlan 
    ? (showIntroduction ? 1 : 0) + (showProcess ? 1 : 0) + (showFinancing ? 1 : 0)
    : 0
  const basePages = 3 + acquisitionPageCount // Cover + Methodology + Comparison + acquisition pages
  const samplePages = propertyPages.length
  const totalPages = basePages + samplePages + 1 // +1 for conclusion

  let currentPageNumber = 0

  const colorVars = {
    '--pdf-bg': c.background,
    '--pdf-primary': c.primary,
    '--pdf-primary-light': c.primaryLight,
    '--pdf-secondary': c.secondary,
    '--pdf-secondary-light': c.secondaryLight,
  } as React.CSSProperties

  return (
    <div 
      className="w-full py-10 font-inter flex flex-col items-center gap-8 print:p-0 print:gap-0 pdf-theme"
      style={{ ...colorVars, backgroundColor: c.background, color: c.text }}
    >
      <PdfThemeStyles colors={c} />

      {/* ================= PAGE 1: COVER ================= */}
      <div className={pageClass} style={pageStyle}>
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}33 0%, ${c.secondary}1a 50%, transparent 100%)` }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}26 0%, transparent 100%)` }} />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(${c.secondary}4d 1px, transparent 1px), linear-gradient(90deg, ${c.secondary}4d 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Header */}
        <header className="relative z-10 p-8 flex justify-between items-start">
          <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto" />
          <div className="text-right">
            <p className="text-xs" style={{ color: `${c.secondaryLight}b3` }}>
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col px-10">
          {/* Title Section */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4" style={{ backgroundColor: `${c.primary}1a`, border: `1px solid ${c.primary}4d` }}>
              <Search size={14} style={{ color: c.primaryLight }} />
              <span className="text-xs tracking-wide font-medium" style={{ color: `${c.primaryLight}cc` }}>
                Seleção Personalizada de Imóveis
              </span>
            </div>
            <h1 className="font-inter font-bold text-3xl leading-tight mb-3 break-words">
              <span style={{ color: c.text }}>Imóveis Selecionados</span><br />
              <span style={{ color: c.primary }}>para Compra</span>
            </h1>
            <p className="text-sm max-w-[400px] break-words" style={{ color: `${c.secondaryLight}99` }}>
              {properties.length} imóveis encontrados • Análise de mercado em {searchCriteria.bairro}
            </p>
          </div>

          {/* Search Criteria Card */}
          <div className="rounded-2xl p-6 mb-4" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.primary}33` }}>
                <MapPin size={20} style={{ color: c.primary }} />
              </div>
              <div>
                <p className="font-semibold text-lg" style={{ color: c.text }}>{searchCriteria.bairro}</p>
                <p className="text-sm" style={{ color: `${c.secondaryLight}b3` }}>
                  {searchCriteria.municipio} - {searchCriteria.estado}
                </p>
              </div>
            </div>

            {/* Filters used */}
            <div className="grid grid-cols-4 gap-3">
              {searchCriteria.categoria && (
                <div className="rounded-lg p-3 text-center" style={{ backgroundColor: `${c.secondary}1a` }}>
                  <Home size={16} style={{ color: c.secondaryLight }} className="mx-auto mb-1" />
                  <p className="text-sm font-medium" style={{ color: c.text }}>{searchCriteria.categoria}</p>
                  <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Categoria</p>
                </div>
              )}
              {searchCriteria.area && (
                <div className="rounded-lg p-3 text-center" style={{ backgroundColor: `${c.secondary}1a` }}>
                  <Ruler size={16} style={{ color: c.secondaryLight }} className="mx-auto mb-1" />
                  <p className="text-sm font-medium" style={{ color: c.text }}>{searchCriteria.area}m²+</p>
                  <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Área mín.</p>
                </div>
              )}
              {searchCriteria.quartos && (
                <div className="rounded-lg p-3 text-center" style={{ backgroundColor: `${c.secondary}1a` }}>
                  <Bed size={16} style={{ color: c.secondaryLight }} className="mx-auto mb-1" />
                  <p className="text-sm font-medium" style={{ color: c.text }}>{searchCriteria.quartos}+</p>
                  <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Quartos</p>
                </div>
              )}
              {searchCriteria.vagas && (
                <div className="rounded-lg p-3 text-center" style={{ backgroundColor: `${c.secondary}1a` }}>
                  <Car size={16} style={{ color: c.secondaryLight }} className="mx-auto mb-1" />
                  <p className="text-sm font-medium" style={{ color: c.text }}>{searchCriteria.vagas}+</p>
                  <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Vagas</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl p-4 text-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}33, ${c.primary}1a)`, border: `1px solid ${c.primary}4d` }}>
              <p className="text-2xl font-bold" style={{ color: c.text }}>{properties.length}</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: `${c.primaryLight}b3` }}>Imóveis</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
              <p className="text-lg font-bold" style={{ color: c.text }}>{fmtMoney(avgPrice)}</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: `${c.secondaryLight}b3` }}>Média</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
              <p className="text-lg font-bold" style={{ color: c.text }}>{fmtMoney(minPrice)}</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: `${c.secondaryLight}b3` }}>Menor</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
              <p className="text-lg font-bold" style={{ color: c.text }}>{fmtMoney(maxPrice)}</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: `${c.secondaryLight}b3` }}>Maior</p>
            </div>
          </div>

          {/* Client Card */}
          {showClient && clientName && (
            <div className="rounded-xl p-4 mb-4" style={{ background: `linear-gradient(to right, ${c.secondary}1a, ${c.secondary}0d)`, border: `1px solid ${c.secondary}4d` }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.secondary}33` }}>
                  <User size={20} style={{ color: c.secondaryLight }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: c.secondaryLight }}>Preparado para</p>
                  <p className="font-semibold text-lg" style={{ color: c.text }}>{clientName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Broker Footer */}
        {broker && (
          <div className="relative z-10 mx-8 mb-6 rounded-xl p-4" style={{ background: `linear-gradient(to bottom right, ${c.primary}33, ${c.primary}1a)`, border: `1px solid ${c.primary}66` }}>
            <div className="flex gap-6 items-center">
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}33)`, border: `2px solid ${c.primary}80` }}>
                  {broker.avatar_url ? (
                    <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={24} style={{ color: c.primary }} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider" style={{ color: c.primary }}>Corretor</p>
                  <h3 className="font-bold text-base truncate" style={{ color: c.text }}>
                    {broker.nome || 'Especialista'}
                  </h3>
                  {broker.creci && (
                    <p className="text-sm flex items-center gap-1" style={{ color: `${c.secondaryLight}b3` }}>
                      <Award size={12} style={{ color: c.primary }} />
                      <span className="truncate">CRECI {broker.creci}</span>
                    </p>
                  )}
                </div>
              </div>
              {showBrokerContact && (brokerPhone || brokerEmail) && (
                <>
                  <div className="w-px h-12" style={{ backgroundColor: `${c.primary}4d` }} />
                  <div className="flex flex-col gap-1 min-w-0">
                    {brokerPhone && (
                      <p className="text-sm flex items-center gap-1.5" style={{ color: `${c.secondaryLight}cc` }}>
                        <Phone size={12} style={{ color: c.primary }} />
                        <span className="truncate">{brokerPhone}</span>
                      </p>
                    )}
                    {brokerEmail && (
                      <p className="text-sm flex items-center gap-1.5" style={{ color: `${c.secondaryLight}cc` }}>
                        <Mail size={12} style={{ color: c.primary }} />
                        <span className="truncate">{brokerEmail}</span>
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= PAGE 2: METHODOLOGY ================= */}
      <div className={pageClass} style={pageStyle}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}26, transparent)` }} />
        </div>

        <header className="relative z-10 px-8 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${c.secondary}33` }}>
          <img src={avaluzLogo} alt="Avaluz" className="h-6 w-auto opacity-60" />
          <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Metodologia da Busca</p>
        </header>

        <div className="relative z-10 flex-1 px-8 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: c.text }}>Metodologia de Busca</h2>
            <p className="text-sm" style={{ color: `${c.secondaryLight}99` }}>
              Como encontramos os melhores imóveis para você
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="rounded-xl p-5" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}33)` }}>
                  <Database size={20} style={{ color: c.primary }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1" style={{ color: c.text }}>1. Varredura do Mercado</h3>
                  <p className="text-sm" style={{ color: `${c.secondaryLight}b3` }}>
                    Nossa base de dados é atualizada diariamente com milhares de imóveis de múltiplas fontes, 
                    garantindo cobertura completa do mercado imobiliário na região selecionada.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl p-5" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}33)` }}>
                  <Filter size={20} style={{ color: c.primary }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1" style={{ color: c.text }}>2. Filtragem Inteligente</h3>
                  <p className="text-sm" style={{ color: `${c.secondaryLight}b3` }}>
                    Aplicamos seus critérios específicos: localização, área, número de quartos, vagas e categoria 
                    para encontrar imóveis que atendam exatamente suas necessidades.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl p-5" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}33)` }}>
                  <Target size={20} style={{ color: c.primary }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1" style={{ color: c.text }}>3. Score de Similaridade</h3>
                  <p className="text-sm" style={{ color: `${c.secondaryLight}b3` }}>
                    Cada imóvel recebe uma pontuação baseada na aderência aos seus critérios, permitindo 
                    priorizar as melhores oportunidades do mercado.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl p-5" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}33)` }}>
                  <Shield size={20} style={{ color: c.primary }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1" style={{ color: c.text }}>4. Curadoria Profissional</h3>
                  <p className="text-sm" style={{ color: `${c.secondaryLight}b3` }}>
                    Verificamos a disponibilidade e removemos duplicatas, apresentando apenas imóveis 
                    ativos e únicos para sua análise.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="mt-6 rounded-xl p-5" style={{ background: `linear-gradient(to bottom right, ${c.primary}1a, ${c.primary}0d)`, border: `1px solid ${c.primary}4d` }}>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} style={{ color: c.primary }} />
              <div>
                <p className="font-semibold" style={{ color: c.text }}>
                  {properties.length} imóveis selecionados
                </p>
                <p className="text-sm" style={{ color: `${c.primaryLight}b3` }}>
                  Baseado nos critérios informados para {searchCriteria.bairro}, {searchCriteria.municipio}
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="relative z-10 px-8 py-3 flex justify-between items-center" style={{ borderTop: `1px solid ${c.secondary}33` }}>
          <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Relatório gerado por Avaluz</p>
          <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Página {++currentPageNumber} de {totalPages}</p>
        </footer>
      </div>

      {/* ================= PROPERTY PAGES ================= */}
      {propertyPages.map((pageProperties, pageIndex) => (
        <div key={pageIndex} className={pageClass} style={pageStyle}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent)` }} />
          </div>

          <header className="relative z-10 px-8 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${c.secondary}33` }}>
            <img src={avaluzLogo} alt="Avaluz" className="h-6 w-auto opacity-60" />
            <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>
              {searchCriteria.bairro}, {searchCriteria.municipio} • Imóveis {pageIndex * 2 + 1}-{Math.min((pageIndex + 1) * 2, properties.length)}
            </p>
          </header>

          <div className="relative z-10 flex-1 px-8 py-6 space-y-6 min-h-0 overflow-hidden">
            {pageProperties.map((property, idx) => {
              const globalIndex = pageIndex * PROPERTIES_PER_PAGE + idx + 1
              return (
                <div
                  key={property.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}
                >
                  <div className="flex">
                    {/* Image */}
                    <div className="w-[200px] h-[200px] flex-shrink-0 relative" style={{ background: `linear-gradient(to bottom right, ${c.secondary}80, ${c.background}cc)` }}>
                      {property.imagem ? (
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url("${getImageUrlForPdf(property.imagem)}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={48} style={{ color: `${c.secondary}66` }} />
                        </div>
                      )}
                      {/* Number badge */}
                      <div className="absolute top-2 left-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryLight})`, color: c.text }}>
                          {globalIndex}
                        </div>
                      </div>
                      {/* Price badge */}
                      <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: `linear-gradient(to top, ${c.background}cc, transparent)` }}>
                        <p className="text-xl font-bold" style={{ color: c.text }}>{fmtMoney(property.valor)}</p>
                        <p className="text-xs" style={{ color: `${c.text}b3` }}>
                          {fmtMoney(property.valor / (property.metros || 1))}/m²
                        </p>
                      </div>
                      {property.valoresAnteriores && (
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center gap-1 rounded-full px-2 py-1" style={{ backgroundColor: `${c.accent}e6` }}>
                            <TrendingDown size={10} style={{ color: c.text }} />
                            <span className="text-[10px] font-medium" style={{ color: c.text }}>Reduzido</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          {property.categoria && (
                            <span className="inline-block text-xs px-2 py-1 rounded-full mb-2" style={{ backgroundColor: `${c.primary}33`, color: c.primaryLight }}>
                              {property.categoria}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5" style={{ color: `${c.secondaryLight}b3` }}>
                            <MapPin size={14} />
                            <span className="text-sm">
                              {property.rua ? `${property.rua}, ` : ''}
                              {property.bairro}
                            </span>
                          </div>
                        </div>
                        {property.score > 0 && (
                          <div className="flex items-center gap-1 rounded-full px-2 py-1" style={{ backgroundColor: `${c.secondary}33` }}>
                            <Star size={12} style={{ color: c.primary }} />
                            <span className="text-xs font-medium" style={{ color: c.text }}>
                              {property.score}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        <div className="text-center">
                          <Ruler size={16} style={{ color: c.secondaryLight }} className="mx-auto mb-1" />
                          <p className="font-semibold" style={{ color: c.text }}>{property.metros}m²</p>
                        </div>
                        {property.quartos && (
                          <div className="text-center">
                            <Bed size={16} style={{ color: c.secondaryLight }} className="mx-auto mb-1" />
                            <p className="font-semibold" style={{ color: c.text }}>{property.quartos} qts</p>
                          </div>
                        )}
                        {property.banheiros && (
                          <div className="text-center">
                            <Bath size={16} style={{ color: c.secondaryLight }} className="mx-auto mb-1" />
                            <p className="font-semibold" style={{ color: c.text }}>{property.banheiros} ban</p>
                          </div>
                        )}
                        {property.vagas && (
                          <div className="text-center">
                            <Car size={16} style={{ color: c.secondaryLight }} className="mx-auto mb-1" />
                            <p className="font-semibold" style={{ color: c.text }}>{property.vagas} vg</p>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {property.descricao && (
                        <p className="text-xs line-clamp-3" style={{ color: `${c.secondaryLight}99` }}>
                          {property.descricao}
                        </p>
                      )}

                      {/* Link indicator */}
                      {property.link && (
                        <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: c.primary }}>
                          <ExternalLink size={10} />
                          <span>Ver anúncio original</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <footer className="relative z-10 px-8 py-3 flex justify-between items-center flex-shrink-0" style={{ borderTop: `1px solid ${c.secondary}33` }}>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Relatório gerado por Avaluz</p>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>
              Página {++currentPageNumber} de {totalPages}
            </p>
          </footer>
        </div>
      ))}

      {/* ================= COMPARISON PAGE ================= */}
      <div className={pageClass} style={pageStyle}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent)` }} />
        </div>

        <header className="relative z-10 px-8 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${c.secondary}33` }}>
          <img src={avaluzLogo} alt="Avaluz" className="h-6 w-auto opacity-60" />
          <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Quadro Comparativo</p>
        </header>

        <div className="relative z-10 flex-1 px-8 py-6 min-h-0 overflow-hidden">
          <h2 className="text-xl font-bold mb-4" style={{ color: c.text }}>Comparativo dos Imóveis</h2>

          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: `${c.secondary}33` }}>
                  <th className="text-left p-3 font-medium" style={{ color: c.secondaryLight }}>#</th>
                  <th className="text-left p-3 font-medium" style={{ color: c.secondaryLight }}>Categoria</th>
                  <th className="text-right p-3 font-medium" style={{ color: c.secondaryLight }}>Valor</th>
                  <th className="text-right p-3 font-medium" style={{ color: c.secondaryLight }}>Área</th>
                  <th className="text-right p-3 font-medium" style={{ color: c.secondaryLight }}>R$/m²</th>
                  <th className="text-center p-3 font-medium" style={{ color: c.secondaryLight }}>Qts</th>
                  <th className="text-center p-3 font-medium" style={{ color: c.secondaryLight }}>Vgs</th>
                </tr>
              </thead>
              <tbody>
                {properties.slice(0, 10).map((property, idx) => (
                  <tr
                    key={property.id}
                    style={{ backgroundColor: idx % 2 === 0 ? `${c.secondary}0d` : 'transparent' }}
                  >
                    <td className="p-3 font-medium" style={{ color: c.text }}>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs" style={{ background: `linear-gradient(to bottom right, ${c.primary}80, ${c.primary}4d)`, color: c.text }}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="p-3" style={{ color: c.text }}>{property.categoria || '-'}</td>
                    <td className="p-3 text-right font-semibold" style={{ color: c.text }}>
                      {fmtMoney(property.valor)}
                    </td>
                    <td className="p-3 text-right" style={{ color: `${c.secondaryLight}b3` }}>{property.metros}m²</td>
                    <td className="p-3 text-right" style={{ color: `${c.secondaryLight}b3` }}>
                      {fmtMoney(property.valor / (property.metros || 1))}
                    </td>
                    <td className="p-3 text-center" style={{ color: `${c.secondaryLight}b3` }}>
                      {property.quartos || '-'}
                    </td>
                    <td className="p-3 text-center" style={{ color: `${c.secondaryLight}b3` }}>
                      {property.vagas || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl p-4 text-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}33, ${c.primary}1a)`, border: `1px solid ${c.primary}4d` }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: `${c.primaryLight}b3` }}>
                Preço Médio
              </p>
              <p className="text-2xl font-bold" style={{ color: c.text }}>{fmtMoney(avgPrice)}</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: `${c.secondaryLight}b3` }}>
                R$/m² Médio
              </p>
              <p className="text-2xl font-bold" style={{ color: c.text }}>{fmtMoney(avgM2)}</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: `${c.secondaryLight}b3` }}>
                Variação
              </p>
              <p className="text-lg font-bold" style={{ color: c.text }}>
                {fmtMoney(minPrice)} - {fmtMoney(maxPrice)}
              </p>
            </div>
          </div>
        </div>

        <footer className="relative z-10 px-8 py-3 flex justify-between items-center flex-shrink-0" style={{ borderTop: `1px solid ${c.secondary}33` }}>
          <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Relatório gerado por Avaluz</p>
          <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>
            Página {++currentPageNumber} de {totalPages}
          </p>
        </footer>
      </div>

      {/* ================= ACQUISITION PLAN PAGES ================= */}
      {showIntroduction && (
        <div className={pageClass} style={pageStyle}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent)` }} />
          </div>

          <header className="relative z-10 px-8 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${c.secondary}33` }}>
            <img src={avaluzLogo} alt="Avaluz" className="h-6 w-auto opacity-60" />
            <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Plano de Aquisição</p>
          </header>

          <div className="relative z-10 flex-1 px-8 py-6 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4" style={{ backgroundColor: `${c.primary}1a`, border: `1px solid ${c.primary}4d` }}>
                <Key size={14} style={{ color: c.primary }} />
                <span className="text-xs tracking-wide font-medium" style={{ color: c.primaryLight }}>
                  Sua Jornada de Compra
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: c.text }}>
                Plano de Aquisição
              </h2>
              <p className="text-lg max-w-lg mx-auto" style={{ color: `${c.secondaryLight}b3` }}>
                Acompanhamos você em cada etapa do processo de compra, garantindo segurança e as melhores condições.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}26)` }}>
                  <Target size={24} style={{ color: c.primary }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: c.text }}>Análise de Mercado</h3>
                <p className="text-sm" style={{ color: `${c.secondaryLight}99` }}>
                  Avaliação completa do valor e potencial de valorização
                </p>
              </div>
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}26)` }}>
                  <Calculator size={24} style={{ color: c.primary }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: c.text }}>Simulação Financeira</h3>
                <p className="text-sm" style={{ color: `${c.secondaryLight}99` }}>
                  Melhores opções de financiamento para seu perfil
                </p>
              </div>
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}26)` }}>
                  <FileCheck size={24} style={{ color: c.primary }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: c.text }}>Documentação</h3>
                <p className="text-sm" style={{ color: `${c.secondaryLight}99` }}>
                  Suporte completo na análise e organização de documentos
                </p>
              </div>
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}26)` }}>
                  <UserCheck size={24} style={{ color: c.primary }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: c.text }}>Negociação</h3>
                <p className="text-sm" style={{ color: `${c.secondaryLight}99` }}>
                  Representação profissional para as melhores condições
                </p>
              </div>
            </div>
          </div>

          <footer className="relative z-10 px-8 py-3 flex justify-between items-center" style={{ borderTop: `1px solid ${c.secondary}33` }}>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Relatório gerado por Avaluz</p>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Página {++currentPageNumber} de {totalPages}</p>
          </footer>
        </div>
      )}

      {showProcess && (
        <div className={pageClass} style={pageStyle}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent)` }} />
          </div>

          <header className="relative z-10 px-8 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${c.secondary}33` }}>
            <img src={avaluzLogo} alt="Avaluz" className="h-6 w-auto opacity-60" />
            <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Processo de Compra</p>
          </header>

          <div className="relative z-10 flex-1 px-8 py-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: c.text }}>Etapas da Compra</h2>
            <p className="text-sm mb-6" style={{ color: `${c.secondaryLight}99` }}>
              Passo a passo do seu processo de aquisição
            </p>

            <div className="space-y-4">
              {[
                { icon: Search, title: 'Seleção do Imóvel', desc: 'Identificação das melhores opções baseadas no seu perfil e necessidades.' },
                { icon: Clock, title: 'Visitas e Análise', desc: 'Agendamento e acompanhamento de visitas, análise técnica do imóvel.' },
                { icon: Calculator, title: 'Proposta e Negociação', desc: 'Elaboração de proposta estratégica e condução da negociação.' },
                { icon: FileText, title: 'Análise Documental', desc: 'Verificação completa da documentação do imóvel e vendedor.' },
                { icon: Wallet, title: 'Financiamento', desc: 'Simulação e acompanhamento junto às instituições financeiras.' },
                { icon: Key, title: 'Escritura e Entrega', desc: 'Assinatura do contrato, registro em cartório e entrega das chaves.' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryLight})` }}>
                      <step.icon size={18} style={{ color: c.text }} />
                    </div>
                    {idx < 5 && <div className="w-0.5 h-8 mt-1" style={{ backgroundColor: `${c.primary}4d` }} />}
                  </div>
                  <div className="flex-1 pb-2">
                    <h3 className="font-semibold mb-1" style={{ color: c.text }}>{step.title}</h3>
                    <p className="text-sm" style={{ color: `${c.secondaryLight}b3` }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <footer className="relative z-10 px-8 py-3 flex justify-between items-center" style={{ borderTop: `1px solid ${c.secondary}33` }}>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Relatório gerado por Avaluz</p>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Página {++currentPageNumber} de {totalPages}</p>
          </footer>
        </div>
      )}

      {showFinancing && (
        <div className={pageClass} style={pageStyle}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.accent}1a, transparent)` }} />
          </div>

          <header className="relative z-10 px-8 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${c.secondary}33` }}>
            <img src={avaluzLogo} alt="Avaluz" className="h-6 w-auto opacity-60" />
            <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Financiamento Imobiliário</p>
          </header>

          <div className="relative z-10 flex-1 px-8 py-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: c.text }}>Opções de Financiamento</h2>
            <p className="text-sm mb-6" style={{ color: `${c.secondaryLight}99` }}>
              Auxiliamos na escolha da melhor opção para seu perfil
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl p-5" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: c.text }}>
                  <Sparkles size={16} style={{ color: c.primary }} />
                  SFH - Sistema Financeiro de Habitação
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: `${c.secondaryLight}b3` }}>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={12} style={{ color: c.primary }} />
                    Imóveis até R$ 1,5 milhão
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={12} style={{ color: c.primary }} />
                    Taxas de juros mais baixas
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={12} style={{ color: c.primary }} />
                    Prazo de até 35 anos
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={12} style={{ color: c.primary }} />
                    Uso do FGTS
                  </li>
                </ul>
              </div>

              <div className="rounded-xl p-5" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: c.text }}>
                  <Sparkles size={16} style={{ color: c.secondary }} />
                  SFI - Sistema de Financiamento Imobiliário
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: `${c.secondaryLight}b3` }}>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={12} style={{ color: c.secondary }} />
                    Imóveis acima de R$ 1,5 milhão
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={12} style={{ color: c.secondary }} />
                    Maior flexibilidade
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={12} style={{ color: c.secondary }} />
                    Prazo de até 35 anos
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight size={12} style={{ color: c.secondary }} />
                    Alienação fiduciária
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl p-5" style={{ background: `linear-gradient(to bottom right, ${c.accent}1a, ${c.accent}0d)`, border: `1px solid ${c.accent}4d` }}>
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: c.text }}>
                <CheckCircle2 size={18} style={{ color: c.accent }} />
                Documentos Necessários
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm" style={{ color: `${c.secondaryLight}cc` }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.accent }} />
                  RG e CPF
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.accent }} />
                  Comprovante de renda
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.accent }} />
                  Comprovante de residência
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.accent }} />
                  Certidão de nascimento/casamento
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.accent }} />
                  Declaração de IR
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.accent }} />
                  Extrato FGTS (se aplicável)
                </div>
              </div>
            </div>
          </div>

          <footer className="relative z-10 px-8 py-3 flex justify-between items-center" style={{ borderTop: `1px solid ${c.secondary}33` }}>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Relatório gerado por Avaluz</p>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Página {++currentPageNumber} de {totalPages}</p>
          </footer>
        </div>
      )}

      {/* ================= CONCLUSION PAGE ================= */}
      <div className={pageClass} style={pageStyle}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}26, transparent)` }} />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
          <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto mb-8 opacity-80" />
          <h2 className="text-3xl font-bold mb-2" style={{ color: c.text }}>Próximos Passos</h2>
          <p className="text-lg mb-8 text-center max-w-md" style={{ color: `${c.secondaryLight}b3` }}>
            Vamos encontrar o imóvel perfeito para você. Entre em contato para agendar visitas.
          </p>

          {broker && (
            <div className="rounded-2xl p-6 min-w-[400px]" style={{ background: `linear-gradient(to bottom right, ${c.primary}33, ${c.primary}1a)`, border: `1px solid ${c.primary}66` }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}33)`, border: `2px solid ${c.primary}80` }}>
                  {broker.avatar_url ? (
                    <img src={broker.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={32} style={{ color: c.primary }} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xl" style={{ color: c.text }}>
                    {broker.nome || 'Especialista'}
                  </h3>
                  {broker.creci && (
                    <p className="text-sm flex items-center gap-1" style={{ color: `${c.secondaryLight}b3` }}>
                      <Award size={14} style={{ color: c.primary }} />
                      CRECI {broker.creci}
                    </p>
                  )}
                  {broker.imobiliaria && (
                    <p className="text-sm" style={{ color: `${c.secondaryLight}99` }}>{broker.imobiliaria}</p>
                  )}
                </div>
              </div>
              {showBrokerContact && (brokerPhone || brokerEmail) && (
                <div className="pt-4" style={{ borderTop: `1px solid ${c.primary}4d` }}>
                  <div className="flex flex-col gap-2">
                    {brokerPhone && (
                      <p className="text-sm flex items-center gap-2" style={{ color: `${c.secondaryLight}cc` }}>
                        <Phone size={14} style={{ color: c.primary }} />
                        {brokerPhone}
                      </p>
                    )}
                    {brokerEmail && (
                      <p className="text-sm flex items-center gap-2" style={{ color: `${c.secondaryLight}cc` }}>
                        <Mail size={14} style={{ color: c.primary }} />
                        {brokerEmail}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="relative z-10 px-8 py-4 flex justify-center" style={{ borderTop: `1px solid ${c.secondary}33` }}>
          <p className="text-sm" style={{ color: `${c.secondaryLight}80` }}>avaluz.com.br</p>
        </footer>
      </div>
    </div>
  )
}
