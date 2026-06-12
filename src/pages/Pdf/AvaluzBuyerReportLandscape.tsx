// AvaluzBuyerReportLandscape.tsx - Landscape A4 PDF for presentation mode
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
  Search,
  Home,
  Database,
  Filter,
  Target,
  Shield,
  CheckCircle2,
  Clock,
  Wallet,
  Key,
  FileCheck,
  Calculator,
  UserCheck,
  ArrowRight,
  Sparkles,
  FileText,
  TrendingDown,
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
  primary: '#f97316',
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
}

interface PdfSettings {
  showAcquisitionPlan?: boolean
  acquisitionPlan?: AcquisitionPlanSettings
  showClient?: boolean
  clientName?: string
  showBrokerContact?: boolean
  pdfColors?: PdfColors
}

interface AvaluzBuyerReportLandscapeProps {
  properties: PropertyForDisplay[]
  searchCriteria: BuscarImoveisFormData
  broker?: BrokerData | null
  currentSlide?: number
  settings?: PdfSettings
}

export const AvaluzBuyerReportLandscape: React.FC<AvaluzBuyerReportLandscapeProps> = ({
  properties,
  searchCriteria,
  broker,
  currentSlide = 0,
  settings = {},
}) => {
  const c = settings.pdfColors || DEFAULT_COLORS

  const showAcquisitionPlan = settings.showAcquisitionPlan !== false
  const ap = settings.acquisitionPlan || {}
  const showAcquisitionIntro = showAcquisitionPlan && ap.introduction?.enabled !== false
  const showAcquisitionProcess = showAcquisitionPlan && ap.process?.enabled !== false

  const showBrokerContact = settings.showBrokerContact !== false
  const clientName = settings.clientName || null

  const brokerPhone = broker?.telefone_custom || broker?.telefone
  const brokerEmail = broker?.email_custom || broker?.email

  const fmtMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)

  // Landscape page: 297mm x 210mm
  const pageClass =
    'w-[297mm] h-[210mm] relative flex flex-col overflow-hidden page-break'
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

  // Slide calculation
  // 0: Cover
  // 1: Methodology
  // 2 to N: Properties (2 per slide)
  // N+1: Comparison
  // N+2: Acquisition Intro (if enabled)
  // N+3: Acquisition Process (if enabled)
  // Last: Contact

  const propertySlides = Math.ceil(properties.length / 2)
  const acquisitionSlides = (showAcquisitionIntro ? 1 : 0) + (showAcquisitionProcess ? 1 : 0)
  const totalSlides = 1 + 1 + propertySlides + 1 + acquisitionSlides + 1

  const getSlideContent = () => {
    // ================= SLIDE 0: COVER =================
    if (currentSlide === 0) {
      return (
        <div className={pageClass} style={pageStyle}>
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}40, ${c.secondary}26, transparent)` }} />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}33, transparent)` }} />
          </div>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(${c.secondary}4d 1px, transparent 1px), linear-gradient(90deg, ${c.secondary}4d 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />

          {/* Header */}
          <header className="relative z-10 px-8 py-4 flex justify-between items-center">
            <img src={avaluzLogo} alt="Avaluz" className="h-8 w-auto opacity-80" />
            <p className="text-sm font-medium" style={{ color: `${c.secondaryLight}cc` }}>
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </header>

          {/* Main Content */}
          <div className="relative z-10 flex-1 flex px-8 gap-8">
            {/* Left: Title and Criteria */}
            <div className="w-1/2 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 w-fit" style={{ backgroundColor: `${c.primary}1a`, border: `1px solid ${c.primary}4d` }}>
                <Search size={14} style={{ color: c.primary }} />
                <span className="text-sm tracking-wide font-medium" style={{ color: c.primaryLight }}>
                  Seleção de Imóveis
                </span>
              </div>
              <h1 className="font-inter font-bold text-4xl leading-tight mb-4">
                <span style={{ color: c.text }}>Imóveis para</span>
                <br />
                <span style={{ color: c.primary }}>Compra</span>
              </h1>
              <p className="text-lg mb-6" style={{ color: `${c.secondaryLight}b3` }}>
                {properties.length} imóveis em {searchCriteria.bairro}, {searchCriteria.municipio}
              </p>

              {/* Search filters */}
              <div className="flex flex-wrap gap-2">
                {searchCriteria.categoria && (
                  <div className="rounded-full px-3 py-1.5 flex items-center gap-1.5" style={{ backgroundColor: `${c.secondary}1a`, border: `1px solid ${c.secondary}4d` }}>
                    <Home size={14} style={{ color: c.secondaryLight }} />
                    <span className="text-sm" style={{ color: c.text }}>{searchCriteria.categoria}</span>
                  </div>
                )}
                {searchCriteria.area && (
                  <div className="rounded-full px-3 py-1.5 flex items-center gap-1.5" style={{ backgroundColor: `${c.secondary}1a`, border: `1px solid ${c.secondary}4d` }}>
                    <Ruler size={14} style={{ color: c.secondaryLight }} />
                    <span className="text-sm" style={{ color: c.text }}>{searchCriteria.area}m²+</span>
                  </div>
                )}
                {searchCriteria.quartos && (
                  <div className="rounded-full px-3 py-1.5 flex items-center gap-1.5" style={{ backgroundColor: `${c.secondary}1a`, border: `1px solid ${c.secondary}4d` }}>
                    <Bed size={14} style={{ color: c.secondaryLight }} />
                    <span className="text-sm" style={{ color: c.text }}>{searchCriteria.quartos}+ qts</span>
                  </div>
                )}
              </div>

              {/* Client */}
              {clientName && (
                <div className="mt-4 flex items-center gap-3">
                  <User size={16} style={{ color: c.secondaryLight }} />
                  <span className="text-sm" style={{ color: `${c.secondaryLight}b3` }}>Preparado para: <strong style={{ color: c.text }}>{clientName}</strong></span>
                </div>
              )}
            </div>

            {/* Right: Stats Grid */}
            <div className="w-1/2 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-6 text-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}33, ${c.primary}1a)`, border: `1px solid ${c.primary}4d` }}>
                  <p className="text-5xl font-bold mb-2" style={{ color: c.text }}>{properties.length}</p>
                  <p className="text-sm uppercase tracking-wider" style={{ color: `${c.primaryLight}b3` }}>Imóveis</p>
                </div>
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                  <p className="text-2xl font-bold mb-2" style={{ color: c.text }}>{fmtMoney(avgPrice)}</p>
                  <p className="text-sm uppercase tracking-wider" style={{ color: `${c.secondaryLight}b3` }}>Média</p>
                </div>
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                  <p className="text-2xl font-bold mb-2" style={{ color: c.text }}>{fmtMoney(minPrice)}</p>
                  <p className="text-sm uppercase tracking-wider" style={{ color: `${c.secondaryLight}b3` }}>Menor</p>
                </div>
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                  <p className="text-2xl font-bold mb-2" style={{ color: c.text }}>{fmtMoney(maxPrice)}</p>
                  <p className="text-sm uppercase tracking-wider" style={{ color: `${c.secondaryLight}b3` }}>Maior</p>
                </div>
              </div>
            </div>
          </div>

          {/* Broker Footer */}
          {broker && (
            <div className="relative z-10 mx-8 mb-4 rounded-xl p-4" style={{ background: `linear-gradient(to bottom right, ${c.primary}33, ${c.primary}1a)`, border: `1px solid ${c.primary}66` }}>
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
                    <h3 className="font-bold text-base truncate" style={{ color: c.text }}>
                      {broker.nome || 'Especialista'}
                    </h3>
                    {broker.creci && (
                      <p className="text-sm flex items-center gap-1" style={{ color: `${c.secondaryLight}b3` }}>
                        <Award size={12} style={{ color: c.primary }} />
                        CRECI {broker.creci}
                      </p>
                    )}
                  </div>
                </div>
                {showBrokerContact && (brokerPhone || brokerEmail) && (
                  <>
                    <div className="w-px h-10" style={{ backgroundColor: `${c.primary}4d` }} />
                    <div className="flex gap-4">
                      {brokerPhone && (
                        <p className="text-sm flex items-center gap-1.5" style={{ color: `${c.secondaryLight}cc` }}>
                          <Phone size={14} style={{ color: c.primary }} />
                          {brokerPhone}
                        </p>
                      )}
                      {brokerEmail && (
                        <p className="text-sm flex items-center gap-1.5" style={{ color: `${c.secondaryLight}cc` }}>
                          <Mail size={14} style={{ color: c.primary }} />
                          {brokerEmail}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )
    }

    // ================= SLIDE 1: METHODOLOGY =================
    if (currentSlide === 1) {
      return (
        <div className={pageClass} style={pageStyle}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}26, transparent)` }} />
          </div>

          <header className="relative z-10 px-8 py-3 flex justify-between items-center" style={{ borderBottom: `1px solid ${c.secondary}33` }}>
            <img src={avaluzLogo} alt="Avaluz" className="h-6 w-auto opacity-60" />
            <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Metodologia de Busca</p>
          </header>

          <div className="relative z-10 flex-1 px-8 py-6 flex gap-8">
            {/* Left: Title */}
            <div className="w-[35%] flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: c.text }}>Como Encontramos</h2>
              <p className="text-xl font-bold" style={{ color: c.primary }}>os Melhores Imóveis</p>
              <p className="mt-4 text-sm" style={{ color: `${c.secondaryLight}99` }}>
                Nossa metodologia combina tecnologia avançada com curadoria profissional.
              </p>
            </div>

            {/* Right: Steps Grid */}
            <div className="w-[65%] grid grid-cols-2 gap-4">
              {[
                { icon: Database, title: 'Varredura do Mercado', desc: 'Base atualizada diariamente com milhares de imóveis.' },
                { icon: Filter, title: 'Filtragem Inteligente', desc: 'Aplicação precisa dos seus critérios de busca.' },
                { icon: Target, title: 'Score de Similaridade', desc: 'Pontuação baseada na aderência aos seus critérios.' },
                { icon: Shield, title: 'Curadoria Profissional', desc: 'Verificação de disponibilidade e remoção de duplicatas.' },
              ].map((step, idx) => (
                <div key={idx} className="rounded-xl p-4" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}26)` }}>
                      <step.icon size={20} style={{ color: c.primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: c.text }}>{step.title}</h3>
                      <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <footer className="relative z-10 px-8 py-2 flex justify-between items-center" style={{ borderTop: `1px solid ${c.secondary}33` }}>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Avaluz</p>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Slide {currentSlide + 1} de {totalSlides}</p>
          </footer>
        </div>
      )
    }

    // ================= PROPERTY SLIDES =================
    const propIndex = currentSlide - 2
    if (propIndex >= 0 && propIndex < propertySlides) {
      const startIdx = propIndex * 2
      const slideProperties = properties.slice(startIdx, startIdx + 2)

      return (
        <div className={pageClass} style={pageStyle}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent)` }} />
          </div>

          <header className="relative z-10 px-8 py-3 flex justify-between items-center" style={{ borderBottom: `1px solid ${c.secondary}33` }}>
            <img src={avaluzLogo} alt="Avaluz" className="h-6 w-auto opacity-60" />
            <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>
              {searchCriteria.bairro}, {searchCriteria.municipio} • Imóveis {startIdx + 1}-{Math.min(startIdx + 2, properties.length)} de {properties.length}
            </p>
          </header>

          <div className="relative z-10 flex-1 px-8 py-4 flex gap-6">
            {slideProperties.map((property, idx) => {
              const globalIndex = startIdx + idx + 1
              return (
                <div
                  key={property.id}
                  className="flex-1 rounded-2xl overflow-hidden flex flex-col"
                  style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}
                >
                  {/* Image */}
                  <div className="h-[180px] relative flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${c.secondary}80, ${c.background}cc)` }}>
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
                    <div className="absolute top-3 left-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryLight})`, color: c.text }}>
                        {globalIndex}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: `linear-gradient(to top, ${c.background}cc, transparent)` }}>
                      <p className="text-2xl font-bold" style={{ color: c.text }}>{fmtMoney(property.valor)}</p>
                      <p className="text-sm" style={{ color: `${c.text}b3` }}>
                        {fmtMoney(property.valor / (property.metros || 1))}/m²
                      </p>
                    </div>
                    {property.score > 0 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-1 backdrop-blur-sm" style={{ backgroundColor: `${c.secondary}cc` }}>
                        <Star size={12} style={{ color: c.primary }} />
                        <span className="text-xs font-medium" style={{ color: c.text }}>{property.score}</span>
                      </div>
                    )}
                    {property.valoresAnteriores && (
                      <div className="absolute top-12 left-3">
                        <div className="flex items-center gap-1 rounded-full px-2 py-1" style={{ backgroundColor: `${c.accent}e6` }}>
                          <TrendingDown size={10} style={{ color: c.text }} />
                          <span className="text-[10px] font-medium" style={{ color: c.text }}>Reduzido</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {property.categoria && (
                          <span className="inline-block text-xs px-2 py-1 rounded-full mb-2" style={{ backgroundColor: `${c.primary}33`, color: c.primaryLight }}>
                            {property.categoria}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5" style={{ color: `${c.secondaryLight}b3` }}>
                          <MapPin size={14} />
                          <span className="text-sm line-clamp-1">
                            {property.rua ? `${property.rua}, ` : ''}{property.bairro}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="flex gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Ruler size={14} style={{ color: c.secondaryLight }} />
                        <span className="text-sm" style={{ color: c.text }}>{property.metros}m²</span>
                      </div>
                      {property.quartos && (
                        <div className="flex items-center gap-1.5">
                          <Bed size={14} style={{ color: c.secondaryLight }} />
                          <span className="text-sm" style={{ color: c.text }}>{property.quartos}</span>
                        </div>
                      )}
                      {property.banheiros && (
                        <div className="flex items-center gap-1.5">
                          <Bath size={14} style={{ color: c.secondaryLight }} />
                          <span className="text-sm" style={{ color: c.text }}>{property.banheiros}</span>
                        </div>
                      )}
                      {property.vagas && (
                        <div className="flex items-center gap-1.5">
                          <Car size={14} style={{ color: c.secondaryLight }} />
                          <span className="text-sm" style={{ color: c.text }}>{property.vagas}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {property.descricao && (
                      <p className="text-xs line-clamp-3" style={{ color: `${c.secondaryLight}99` }}>
                        {property.descricao}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <footer className="relative z-10 px-8 py-2 flex justify-between items-center" style={{ borderTop: `1px solid ${c.secondary}33` }}>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Avaluz</p>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Slide {currentSlide + 1} de {totalSlides}</p>
          </footer>
        </div>
      )
    }

    // ================= COMPARISON SLIDE =================
    if (currentSlide === 2 + propertySlides) {
      return (
        <div className={pageClass} style={pageStyle}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent)` }} />
          </div>

          <header className="relative z-10 px-8 py-3 flex justify-between items-center" style={{ borderBottom: `1px solid ${c.secondary}33` }}>
            <img src={avaluzLogo} alt="Avaluz" className="h-6 w-auto opacity-60" />
            <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Comparativo de Imóveis</p>
          </header>

          <div className="relative z-10 flex-1 px-8 py-4 flex gap-6">
            {/* Table */}
            <div className="flex-1 rounded-xl overflow-hidden" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: `${c.secondary}33` }}>
                    <th className="text-left p-2 font-medium" style={{ color: c.secondaryLight }}>#</th>
                    <th className="text-left p-2 font-medium" style={{ color: c.secondaryLight }}>Tipo</th>
                    <th className="text-right p-2 font-medium" style={{ color: c.secondaryLight }}>Valor</th>
                    <th className="text-right p-2 font-medium" style={{ color: c.secondaryLight }}>Área</th>
                    <th className="text-right p-2 font-medium" style={{ color: c.secondaryLight }}>R$/m²</th>
                    <th className="text-center p-2 font-medium" style={{ color: c.secondaryLight }}>Qts</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.slice(0, 8).map((property, idx) => (
                    <tr
                      key={property.id}
                      style={{ backgroundColor: idx % 2 === 0 ? `${c.secondary}0d` : 'transparent' }}
                    >
                      <td className="p-2 font-medium" style={{ color: c.text }}>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs" style={{ background: `linear-gradient(to bottom right, ${c.primary}80, ${c.primary}4d)`, color: c.text }}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="p-2" style={{ color: c.text }}>{property.categoria || '-'}</td>
                      <td className="p-2 text-right font-semibold" style={{ color: c.text }}>
                        {fmtMoney(property.valor)}
                      </td>
                      <td className="p-2 text-right" style={{ color: `${c.secondaryLight}b3` }}>{property.metros}m²</td>
                      <td className="p-2 text-right" style={{ color: `${c.secondaryLight}b3` }}>
                        {fmtMoney(property.valor / (property.metros || 1))}
                      </td>
                      <td className="p-2 text-center" style={{ color: `${c.secondaryLight}b3` }}>
                        {property.quartos || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stats */}
            <div className="w-[200px] flex flex-col gap-4">
              <div className="rounded-xl p-4 text-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}33, ${c.primary}1a)`, border: `1px solid ${c.primary}4d` }}>
                <p className="text-xs uppercase mb-1" style={{ color: `${c.primaryLight}b3` }}>Média</p>
                <p className="text-xl font-bold" style={{ color: c.text }}>{fmtMoney(avgPrice)}</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                <p className="text-xs uppercase mb-1" style={{ color: `${c.secondaryLight}b3` }}>R$/m² Médio</p>
                <p className="text-xl font-bold" style={{ color: c.text }}>{fmtMoney(avgM2)}</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                <p className="text-xs uppercase mb-1" style={{ color: `${c.secondaryLight}b3` }}>Menor</p>
                <p className="text-xl font-bold" style={{ color: c.text }}>{fmtMoney(minPrice)}</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                <p className="text-xs uppercase mb-1" style={{ color: `${c.secondaryLight}b3` }}>Maior</p>
                <p className="text-xl font-bold" style={{ color: c.text }}>{fmtMoney(maxPrice)}</p>
              </div>
            </div>
          </div>

          <footer className="relative z-10 px-8 py-2 flex justify-between items-center" style={{ borderTop: `1px solid ${c.secondary}33` }}>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Avaluz</p>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Slide {currentSlide + 1} de {totalSlides}</p>
          </footer>
        </div>
      )
    }

    // ================= ACQUISITION INTRO SLIDE =================
    const acquisitionIntroIndex = 3 + propertySlides
    if (showAcquisitionIntro && currentSlide === acquisitionIntroIndex) {
      return (
        <div className={pageClass} style={pageStyle}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}1a, transparent)` }} />
          </div>

          <header className="relative z-10 px-8 py-3 flex justify-between items-center" style={{ borderBottom: `1px solid ${c.secondary}33` }}>
            <img src={avaluzLogo} alt="Avaluz" className="h-6 w-auto opacity-60" />
            <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Plano de Aquisição</p>
          </header>

          <div className="relative z-10 flex-1 px-8 py-6 flex gap-8">
            <div className="w-[35%] flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 w-fit" style={{ backgroundColor: `${c.primary}1a`, border: `1px solid ${c.primary}4d` }}>
                <Key size={14} style={{ color: c.primary }} />
                <span className="text-sm tracking-wide font-medium" style={{ color: c.primaryLight }}>Sua Jornada</span>
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: c.text }}>Plano de</h2>
              <p className="text-3xl font-bold" style={{ color: c.primary }}>Aquisição</p>
              <p className="mt-4 text-sm" style={{ color: `${c.secondaryLight}99` }}>
                Acompanhamos você em cada etapa do processo de compra.
              </p>
            </div>

            <div className="w-[65%] grid grid-cols-2 gap-4">
              {[
                { icon: Target, title: 'Análise de Mercado', desc: 'Avaliação completa do valor e potencial' },
                { icon: Calculator, title: 'Simulação Financeira', desc: 'Melhores opções para seu perfil' },
                { icon: FileCheck, title: 'Documentação', desc: 'Análise e organização de documentos' },
                { icon: UserCheck, title: 'Negociação', desc: 'Representação profissional' },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl p-5 text-center" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}4d, ${c.primary}26)` }}>
                    <item.icon size={24} style={{ color: c.primary }} />
                  </div>
                  <h3 className="font-semibold mb-1" style={{ color: c.text }}>{item.title}</h3>
                  <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <footer className="relative z-10 px-8 py-2 flex justify-between items-center" style={{ borderTop: `1px solid ${c.secondary}33` }}>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Avaluz</p>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Slide {currentSlide + 1} de {totalSlides}</p>
          </footer>
        </div>
      )
    }

    // ================= ACQUISITION PROCESS SLIDE =================
    const acquisitionProcessIndex = acquisitionIntroIndex + (showAcquisitionIntro ? 1 : 0)
    if (showAcquisitionProcess && currentSlide === acquisitionProcessIndex) {
      return (
        <div className={pageClass} style={pageStyle}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.secondary}1a, transparent)` }} />
          </div>

          <header className="relative z-10 px-8 py-3 flex justify-between items-center" style={{ borderBottom: `1px solid ${c.secondary}33` }}>
            <img src={avaluzLogo} alt="Avaluz" className="h-6 w-auto opacity-60" />
            <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>Etapas da Compra</p>
          </header>

          <div className="relative z-10 flex-1 px-8 py-4">
            <div className="grid grid-cols-3 gap-4 h-full">
              {[
                { icon: Search, title: '1. Seleção', desc: 'Identificação das melhores opções' },
                { icon: Clock, title: '2. Visitas', desc: 'Acompanhamento e análise técnica' },
                { icon: Calculator, title: '3. Proposta', desc: 'Elaboração e negociação' },
                { icon: FileText, title: '4. Documentos', desc: 'Verificação completa' },
                { icon: Wallet, title: '5. Financiamento', desc: 'Simulação e acompanhamento' },
                { icon: Key, title: '6. Entrega', desc: 'Assinatura e entrega das chaves' },
              ].map((step, idx) => (
                <div key={idx} className="rounded-xl p-4 flex flex-col" style={{ backgroundColor: c.cardBackground, border: `1px solid ${c.cardBorder}` }}>
                  <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${c.primary}, ${c.primaryLight})` }}>
                    <step.icon size={18} style={{ color: c.text }} />
                  </div>
                  <h3 className="font-semibold mb-1" style={{ color: c.text }}>{step.title}</h3>
                  <p className="text-xs" style={{ color: `${c.secondaryLight}99` }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <footer className="relative z-10 px-8 py-2 flex justify-between items-center" style={{ borderTop: `1px solid ${c.secondary}33` }}>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Avaluz</p>
            <p className="text-xs" style={{ color: `${c.secondaryLight}80` }}>Slide {currentSlide + 1} de {totalSlides}</p>
          </footer>
        </div>
      )
    }

    // ================= CONTACT SLIDE (LAST) =================
    return (
      <div className={pageClass} style={pageStyle}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${c.primary}26, transparent)` }} />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
          <img src={avaluzLogo} alt="Avaluz" className="h-16 w-auto mb-8 opacity-80" />
          <h2 className="text-3xl font-bold mb-2" style={{ color: c.text }}>Próximos Passos</h2>
          <p className="text-lg mb-8" style={{ color: `${c.secondaryLight}b3` }}>
            Vamos encontrar o imóvel perfeito para você
          </p>

          {broker && (
            <div className="rounded-2xl p-6 min-w-[400px]" style={{ background: `linear-gradient(to bottom right, ${c.primary}33, ${c.primary}1a)`, border: `1px solid ${c.primary}66` }}>
              <div className="flex items-center gap-4">
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
                  {showBrokerContact && brokerPhone && (
                    <p className="text-sm flex items-center gap-1.5 mt-2" style={{ color: `${c.secondaryLight}cc` }}>
                      <Phone size={14} style={{ color: c.primary }} />
                      {brokerPhone}
                    </p>
                  )}
                  {showBrokerContact && brokerEmail && (
                    <p className="text-sm flex items-center gap-1.5" style={{ color: `${c.secondaryLight}cc` }}>
                      <Mail size={14} style={{ color: c.primary }} />
                      {brokerEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="relative z-10 px-8 py-3 flex justify-center" style={{ borderTop: `1px solid ${c.secondary}33` }}>
          <p className="text-sm" style={{ color: `${c.secondaryLight}80` }}>avaluz.com.br</p>
        </footer>
      </div>
    )
  }

  return (
    <div 
      className="w-full font-inter pdf-theme" 
      style={{ backgroundColor: c.background, color: c.text }}
    >
      <PdfThemeStyles colors={c} />
      {getSlideContent()}
    </div>
  )
}
