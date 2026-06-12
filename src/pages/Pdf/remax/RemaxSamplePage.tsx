import React from 'react';
import { Bath, BedDouble, Building2, Car, ExternalLink, FileText, Home, MapPin, Ruler } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors, RemaxReportProps, SimilarProperty } from './types';
import { formatMoney, formatPricePerM2, getSampleDisplayTitle, getSampleImages, getSampleLocationStructured } from './sampleUtils';

interface RemaxSamplePageProps {
  colors: RemaxColors;
  sample: SimilarProperty;
  sampleIndex: number;
  broker?: RemaxReportProps['broker'];
  page: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxSamplePage: React.FC<RemaxSamplePageProps> = ({
  colors: c,
  sample,
  sampleIndex,
  broker,
  page,
  totalPages,
  isRental = false,
}) => {
  const images = getSampleImages(sample);
  const displayTitle = getSampleDisplayTitle(sample);
  const location = getSampleLocationStructured(sample);

  return (
    <div className="w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white">
      <header className="relative z-10 p-10 border-b border-gray-200 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
              <Building2 size={16} style={{ color: c.primary }} />
            </div>
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: c.primary }}>Amostra de Referência</p>
          </div>
          <h2 className="font-bold text-3xl text-gray-900">Amostra {String(sampleIndex + 1).padStart(2, '0')}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1 rounded-full text-xs font-medium border"
            style={{
              color: sample.status === 'vendido' ? '#16a34a' : c.secondary,
              backgroundColor: sample.status === 'vendido' ? '#16a34a15' : `${c.secondary}10`,
              borderColor: sample.status === 'vendido' ? '#16a34a30' : `${c.secondary}25`,
            }}
          >
            {sample.status === 'vendido' ? 'Vendido' : 'Ativo'}
          </div>
          {broker?.logo_imobiliaria_url && (
            <div className="h-14 w-14 rounded-xl overflow-hidden bg-white border-2 border-gray-200 flex-shrink-0">
              <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-contain p-1" />
            </div>
          )}
          {broker?.avatar_url && (
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <img src={broker.avatar_url} alt={broker.nome || 'Corretor'} className="w-full h-full object-contain p-0.5" />
            </div>
          )}
          <img src={avamaxLogo} alt="AvaMax" className="h-12 w-auto" />
        </div>
      </header>

      <div className="relative z-10 px-8 py-6 flex-1 min-h-0 flex flex-col overflow-hidden">
        {images.length === 0 ? (
          <div className="h-72 rounded-2xl overflow-hidden mb-6 border border-gray-200 bg-gray-100 flex items-center justify-center">
            <Building2 size={64} className="text-gray-400" />
          </div>
        ) : images.length === 1 ? (
          <div className="h-72 rounded-2xl overflow-hidden mb-6 relative border border-gray-200 bg-gray-100">
            <img src={images[0]} alt={displayTitle} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 border border-gray-200">
              <span className="text-xs font-medium text-gray-900">{displayTitle}</span>
            </div>
            {sample.link && (
              <a
                href={sample.link}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-lg"
                style={{ backgroundColor: c.primary }}
              >
                <ExternalLink size={12} />
                Ver anúncio
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 grid-rows-2 gap-2 h-80 rounded-2xl overflow-hidden mb-6 relative">
            {images.map((image, imageIndex) => (
              <div key={`${image}-${imageIndex}`} className="relative border border-gray-200 bg-gray-100 overflow-hidden rounded-xl">
                <img src={image} alt={`${displayTitle} ${imageIndex + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                {imageIndex === 0 && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-full px-3 py-1 border border-gray-200">
                    <span className="text-[11px] font-medium text-gray-900">{displayTitle}</span>
                  </div>
                )}
                {imageIndex === images.length - 1 && sample.link && (
                  <a
                    href={sample.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium text-white shadow-lg"
                    style={{ backgroundColor: c.primary }}
                  >
                    <ExternalLink size={10} />
                    Ver anúncio
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900 font-bold text-xl mb-2 line-clamp-2">{sample.titulo || displayTitle}</h3>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-[10]">{sample.descricao || 'Imóvel comparável utilizado na análise de mercado.'}</p>
            </div>
            <div className="text-right flex-shrink-0 rounded-xl px-4 py-3" style={{ backgroundColor: `${c.primary}08`, border: `1px solid ${c.primary}20` }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: c.primary }}>Valor</p>
              <p className="text-gray-900 font-bold text-2xl">{formatMoney(sample.valor)}</p>
              <p className="text-sm" style={{ color: c.primary }}>{formatPricePerM2(sample.valor, sample.area)}/m²</p>
            </div>
          </div>
        </div>

        {location.line1 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <MapPin size={18} style={{ color: c.secondary }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Localização</p>
              <p className="text-sm text-gray-800 font-medium leading-relaxed">{location.line1}</p>
              {location.line2 && <p className="text-xs text-gray-500 mt-0.5">{location.line2}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-3">
          {[
            { icon: Ruler, value: `${sample.area}m²`, label: 'Área' },
            { icon: BedDouble, value: sample.quartos, label: 'Quartos' },
            { icon: Home, value: sample.suites || '-', label: 'Suítes' },
            { icon: Bath, value: sample.banheiros, label: 'Banhos' },
            { icon: Car, value: sample.vagas, label: 'Vagas' },
          ].map((item, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <item.icon size={18} className="mx-auto mb-1 text-gray-500" />
              <p className="text-gray-900 font-bold text-lg">{item.value}</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-wide">{item.label}</p>
            </div>
          ))}
        </div>

        {sample.descricao && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} style={{ color: c.secondary }} />
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Resumo da amostra</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-[6]">{sample.descricao}</p>
          </div>
        )}
      </div>

      <footer className="relative z-10 p-8 border-t border-gray-200 flex justify-between items-center">
        <p className="text-gray-400 text-xs">AvaMax • {isRental ? 'Estudo de Locação' : 'Estudo de Mercado'}</p>
        <p className="text-gray-400 text-xs">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};
