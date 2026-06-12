import React from 'react';
import { Building2, MapPin, User, Award, Phone, Mail, Star, Database } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import propertyPlaceholder from '@/assets/property-placeholder.jpg';
import { getCoverPhotoForPdf } from '@/lib/pdfImages';
import type { RemaxReportProps, RemaxColors } from './types';

interface CoverPageProps {
  property: RemaxReportProps['property'];
  market: RemaxReportProps['market'];
  broker?: RemaxReportProps['broker'];
  client?: RemaxReportProps['client'];
  clientName: string;
  colors: RemaxColors;
  totalPages: number;
  showClient?: boolean;
  showBrokerContact?: boolean;
  isRental?: boolean;
}

export const RemaxCoverPage: React.FC<CoverPageProps> = ({
  property, market, broker, client, clientName, colors: c, totalPages, showClient = true, showBrokerContact = true, isRental = false,
}) => {
  const hasClientData = client?.nome || clientName !== 'Cliente Avaluz';
  const displayClientName = client?.nome || clientName;
  const brokerPhone = broker?.telefone_custom || broker?.telefone;
  const brokerEmail = broker?.email_custom || broker?.email;

  return (
    <div className="w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white">
      {/* Top red stripe */}
      <div className="h-2 w-full" style={{ backgroundColor: c.primary }} />

      {/* Header */}
      <header className="relative z-10 px-10 pt-6 pb-4 flex justify-between items-start">
        <img src={avamaxLogo} alt="AvaMax" className="h-14 w-auto" />
        <div className="text-right">
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <p className="text-xs text-gray-400">ID: AMX-{property.id.toString().padStart(6, '0')}</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col px-10">
        {/* Title */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-3" style={{ backgroundColor: `${c.primary}15`, border: `1px solid ${c.primary}30` }}>
            <Star size={13} style={{ color: c.primary }} />
            <span className="text-sm tracking-wide font-medium" style={{ color: c.primary }}>{isRental ? 'Estudo de Locação Profissional' : 'Estudo de Mercado Profissional'}</span>
          </div>
          <h1 className="font-inter font-bold text-4xl leading-tight mb-2">
            <span className="text-gray-900">Avaliação Estratégica</span><br />
            <span style={{ color: c.primary }}>{isRental ? 'de Valor de Aluguel' : 'de Valor de Mercado'}</span>
          </h1>
          <p className="text-base text-gray-500">
            Método Comparativo Direto • Análise de {market.amostras} Imóveis
          </p>
        </div>

        {/* Property Photo */}
        <div className="relative rounded-2xl overflow-hidden mb-4 h-[270px] w-full flex-shrink-0 bg-gray-100">
          {getCoverPhotoForPdf(property.foto_capa) ? (
            <div className="absolute inset-0" style={{
              backgroundImage: `url("${getCoverPhotoForPdf(property.foto_capa)}")`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }} />
          ) : (
            <div className="absolute inset-0 w-full h-full">
              <img src={propertyPlaceholder} alt="" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 size={70} className="text-gray-300" />
              </div>
            </div>
          )}
          {/* Property Type Badge */}
          <div className="absolute top-4 left-4">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ backgroundColor: c.primary }}>
              <span className="text-sm font-medium uppercase text-white">{property.tipo}</span>
            </div>
          </div>
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[
            { val: property.area, label: 'm² úteis' },
            { val: property.quartos, label: 'Quartos' },
            { val: property.banheiros || '-', label: 'Banheiros' },
            { val: property.suites || '-', label: 'Suítes' },
            { val: property.vagas || '-', label: 'Vagas' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl p-3 text-center border border-gray-200 bg-gray-50">
              <p className="font-bold text-xl text-gray-900">{item.val}</p>
              <p className="text-xs uppercase text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Location + Client Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-4 border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.secondary}15` }}>
                <MapPin size={18} style={{ color: c.secondary }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-base truncate text-gray-900">{property.rua || property.bairro}</p>
                <p className="text-sm truncate text-gray-500">{property.bairro}, {property.municipio} - {property.estado}</p>
              </div>
            </div>
          </div>

          {showClient && (
            <div className="rounded-xl p-4" style={{ backgroundColor: `${c.secondary}08`, border: `1px solid ${c.secondary}25` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.secondary}15` }}>
                  <User size={18} style={{ color: c.secondary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: c.secondary }}>Preparado para</p>
                  {hasClientData ? (
                    <p className="font-semibold text-base truncate text-gray-900">{displayClientName}</p>
                  ) : (
                    <p className="italic text-base text-gray-400">Cliente não informado</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Broker/Agency Card */}
        {broker && (
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: `${c.primary}08`, border: `2px solid ${c.primary}25` }}>
            <div className="flex gap-6 items-center">
              {/* Agency */}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ borderColor: `${c.primary}40`, backgroundColor: 'white' }}>
                  {broker.logo_imobiliaria_url ? (
                    <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || ''} className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Building2 size={32} style={{ color: c.primary }} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: c.primary }}>Imobiliária</p>
                  <h3 className="font-bold text-lg leading-tight truncate text-gray-900">{broker.imobiliaria || 'Imobiliária'}</h3>
                </div>
              </div>

              <div className="w-px h-16" style={{ backgroundColor: `${c.primary}25` }} />

              {/* Broker */}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ borderColor: `${c.primary}40`, backgroundColor: 'white' }}>
                  {broker.avatar_url ? (
                    <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <User size={32} style={{ color: c.primary }} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: c.primary }}>Corretor</p>
                  <h3 className="font-bold text-lg leading-tight truncate text-gray-900">{broker.nome || 'Especialista'}</h3>
                  {broker.creci && (
                    <p className="text-sm mt-0.5 flex items-center gap-1 text-gray-500">
                      <Award size={10} style={{ color: c.primary }} /> CRECI {broker.creci}
                    </p>
                  )}
                  {showBrokerContact && (brokerPhone || brokerEmail) && (
                    <div className="mt-1 space-y-0.5">
                      {brokerPhone && <p className="text-sm flex items-center gap-1 text-gray-600"><Phone size={9} style={{ color: c.primary }} />{brokerPhone}</p>}
                      {brokerEmail && <p className="text-sm flex items-center gap-1 text-gray-600"><Mail size={9} style={{ color: c.primary }} /><span className="truncate max-w-[160px]">{brokerEmail}</span></p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-10 pb-5 pt-3 flex justify-between items-center border-t border-gray-200">
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span className="px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${c.primary}15`, color: c.primary }}>CONFIDENCIAL</span>
          <span className="flex items-center gap-1"><Database size={11} style={{ color: c.secondary }} />{market.amostras} imóveis analisados</span>
        </div>
        <p className="text-xs text-gray-400">01 / {totalPages}</p>
      </footer>
    </div>
  );
};