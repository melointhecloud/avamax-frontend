import React from 'react';
import { Building2, MapPin, User, Award, Phone, Mail, Star, Database } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import propertyPlaceholder from '@/assets/property-placeholder.jpg';
import { getCoverPhotoForPdf } from '@/lib/pdfImages';
import type { RemaxReportProps, RemaxColors } from '../types';

interface CoverPageLandscapeProps {
  property: RemaxReportProps['property'];
  market: RemaxReportProps['market'];
  broker?: RemaxReportProps['broker'];
  client?: RemaxReportProps['client'];
  clientName: string;
  colors: RemaxColors;
  totalPages: number;
  isRental?: boolean;
  showClient?: boolean;
  showBrokerContact?: boolean;
}

export const RemaxCoverPageLandscape: React.FC<CoverPageLandscapeProps> = ({
  property, market, broker, client, clientName, colors: c, totalPages, showClient = true, showBrokerContact = true,
}) => {
  const hasClientData = client?.nome || clientName !== 'Cliente Avaluz';
  const displayClientName = client?.nome || clientName;
  const brokerPhone = broker?.telefone_custom || broker?.telefone;
  const brokerEmail = broker?.email_custom || broker?.email;

  return (
    <div className="w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white">
      {/* Top red stripe */}
      <div className="h-2 w-full" style={{ backgroundColor: c.primary }} />

      {/* Header */}
      <header className="relative z-10 px-8 pt-4 pb-3 flex justify-between items-center">
        <img src={avamaxLogo} alt="AvaMax" className="h-12 w-auto" />
        <div className="text-right">
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <p className="text-xs text-gray-400">ID: AMX-{property.id.toString().padStart(6, '0')}</p>
        </div>
      </header>

      {/* Main Content - Hero Layout */}
      <div className="relative z-10 flex-1 flex px-8 gap-6 min-h-0">
        {/* Left: Photo (60%) */}
        <div className="w-[58%] flex flex-col gap-3">
          <div className="relative rounded-2xl overflow-hidden flex-1 bg-gray-100">
            {getCoverPhotoForPdf(property.foto_capa) ? (
              <div className="absolute inset-0" style={{
                backgroundImage: `url("${getCoverPhotoForPdf(property.foto_capa)}")`,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }} />
            ) : (
              <div className="absolute inset-0 w-full h-full">
                <img src={propertyPlaceholder} alt="" className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 size={80} className="text-gray-300" />
                </div>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ backgroundColor: c.primary }}>
                <span className="text-base font-medium uppercase text-white">{property.tipo}</span>
              </div>
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { val: property.area, label: 'm² úteis' },
              { val: property.quartos, label: 'Quartos' },
              { val: property.banheiros || '-', label: 'Banheiros' },
              { val: property.suites || '-', label: 'Suítes' },
              { val: property.vagas || '-', label: 'Vagas' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-2.5 text-center border border-gray-200 bg-gray-50">
                <p className="font-bold text-xl text-gray-900">{item.val}</p>
                <p className="text-xs uppercase text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info (40%) */}
        <div className="w-[42%] flex flex-col gap-3">
          {/* Title */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-2" style={{ backgroundColor: `${c.primary}15`, border: `1px solid ${c.primary}30` }}>
              <Star size={12} style={{ color: c.primary }} />
              <span className="text-sm tracking-wide font-medium" style={{ color: c.primary }}>Estudo de Mercado</span>
            </div>
            <h1 className="font-inter font-bold text-4xl leading-tight mb-1">
              <span className="text-gray-900">Avaliação</span><br />
              <span style={{ color: c.primary }}>Estratégica</span>
            </h1>
            <p className="text-base text-gray-500">
              Método Comparativo • {market.amostras} Imóveis
            </p>
          </div>

          {/* Location */}
          <div className="rounded-xl p-3 border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.secondary}15` }}>
                <MapPin size={16} style={{ color: c.secondary }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-base truncate text-gray-900">{property.rua || property.bairro}</p>
                <p className="text-sm truncate text-gray-500">{property.bairro}, {property.municipio} - {property.estado}</p>
              </div>
            </div>
          </div>

          {/* Client */}
          {showClient && (
            <div className="rounded-xl p-3" style={{ backgroundColor: `${c.secondary}08`, border: `1px solid ${c.secondary}25` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.secondary}15` }}>
                  <User size={16} style={{ color: c.secondary }} />
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

          {/* Broker/Agency */}
          {broker && (
            <div className="rounded-xl p-3 flex-1" style={{ backgroundColor: `${c.primary}06`, border: `1px solid ${c.primary}20` }}>
              <div className="flex gap-3 items-center mb-2">
                <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0" style={{ borderColor: `${c.primary}30`, backgroundColor: 'white' }}>
                  {broker.logo_imobiliaria_url ? (
                    <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Building2 size={22} style={{ color: c.primary }} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest" style={{ color: c.primary }}>Imobiliária</p>
                  <h3 className="font-bold text-base truncate text-gray-900">{broker.imobiliaria || 'RE/MAX'}</h3>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0" style={{ borderColor: `${c.primary}30`, backgroundColor: 'white' }}>
                  {broker.avatar_url ? (
                    <img src={broker.avatar_url} alt="" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <User size={22} style={{ color: c.primary }} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest" style={{ color: c.primary }}>Corretor</p>
                  <h3 className="font-bold text-base truncate text-gray-900">{broker.nome || 'Especialista'}</h3>
                  {broker.creci && <p className="text-sm text-gray-500 flex items-center gap-1"><Award size={9} style={{ color: c.primary }} />CRECI {broker.creci}</p>}
                  {showBrokerContact && brokerPhone && <p className="text-sm text-gray-600 flex items-center gap-1"><Phone size={9} style={{ color: c.primary }} />{brokerPhone}</p>}
                  {showBrokerContact && brokerEmail && <p className="text-sm text-gray-600 flex items-center gap-1"><Mail size={9} style={{ color: c.primary }} /><span className="truncate max-w-[140px]">{brokerEmail}</span></p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-8 pb-4 pt-3 flex justify-between items-center border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${c.primary}15`, color: c.primary }}>CONFIDENCIAL</span>
          <span className="flex items-center gap-1"><Database size={11} style={{ color: c.secondary }} />{market.amostras} imóveis analisados</span>
        </div>
        <p className="text-sm text-gray-400">01 / {totalPages}</p>
      </footer>
    </div>
  );
};