import React from 'react';
import { Bath, BedDouble, Building2, Car, ExternalLink, FileText, Home, MapPin, Ruler } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors, RemaxReportProps, SimilarProperty } from '../types';
import { formatMoney, formatPricePerM2, getSampleDisplayTitle, getSampleImages, getSampleLocationStructured } from '../sampleUtils';

interface RemaxSamplePageLandscapeProps {
  colors: RemaxColors;
  sample: SimilarProperty;
  sampleIndex: number;
  broker?: RemaxReportProps['broker'];
  page: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxSamplePageLandscape: React.FC<RemaxSamplePageLandscapeProps> = ({
  colors: c,
  sample,
  sampleIndex,
  broker,
  page,
  totalPages,
}) => {
  const images = getSampleImages(sample);
  const displayTitle = getSampleDisplayTitle(sample);
  const location = getSampleLocationStructured(sample);

  return (
    <div className="w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white">
      <header className="relative z-10 px-8 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
            <Building2 size={20} style={{ color: c.primary }} />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: c.primary }}>Amostra Comparável</p>
            <h2 className="font-bold text-2xl text-gray-900">Imóvel #{String(sampleIndex + 1).padStart(2, '0')}</h2>
          </div>
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
            <div className="h-12 w-12 rounded-xl overflow-hidden bg-white border-2 border-gray-200">
              <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-contain p-1" />
            </div>
          )}
          {broker?.avatar_url && (
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200">
              <img src={broker.avatar_url} alt={broker.nome || 'Corretor'} className="w-full h-full object-contain p-0.5" />
            </div>
          )}
          <img src={avamaxLogo} alt="AvaMax" className="h-9 w-auto" />
        </div>
      </header>

      <div className="relative z-10 flex-1 min-h-0 flex px-8 py-5 gap-6 overflow-hidden">
        <div className="w-[45%] rounded-2xl overflow-hidden relative bg-gray-100 border border-gray-200">
          {images.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center"><Building2 size={80} className="text-gray-400" /></div>
          ) : images.length === 1 ? (
            <img src={images[0]} alt={displayTitle} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="grid grid-cols-2 grid-rows-2 gap-1.5 h-full p-1.5">
              {images.map((image, index) => (
                <div key={`${image}-${index}`} className="relative rounded-lg overflow-hidden bg-gray-200">
                  <img src={image} alt={`${displayTitle} ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 border border-gray-200">
            <span className="text-sm font-semibold text-gray-900">{displayTitle}</span>
          </div>

          {sample.link && (
            <a
              href={sample.link}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg"
              style={{ backgroundColor: c.primary }}
            >
              <ExternalLink size={14} />
              Ver anúncio
            </a>
          )}
        </div>

        <div className="w-[55%] flex flex-col gap-4 min-h-0">
          <h3 className="text-gray-900 font-bold text-xl line-clamp-2">{sample.titulo || displayTitle}</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: `${c.primary}08`, border: `1px solid ${c.primary}20` }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: c.primary }}>Valor de Venda</p>
              <p className="text-gray-900 font-bold text-2xl whitespace-nowrap">{formatMoney(sample.valor)}</p>
              <p className="text-sm mt-1" style={{ color: c.primary }}>{formatPricePerM2(sample.valor, sample.area)}/m²</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center">
              <div className="text-center max-w-full">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-2">
                  <MapPin size={18} style={{ color: c.secondary }} />
                </div>
                <p className="text-gray-900 font-semibold text-base truncate">{location.line1 || 'Localização'}</p>
                {location.line2 && <p className="text-sm text-gray-500 truncate">{location.line2}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              { icon: Ruler, value: `${sample.area}m²`, label: 'Área' },
              { icon: BedDouble, value: sample.quartos, label: 'Quartos' },
              { icon: Home, value: sample.suites || '-', label: 'Suítes' },
              { icon: Bath, value: sample.banheiros, label: 'Banhos' },
              { icon: Car, value: sample.vagas, label: 'Vagas' },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <item.icon size={18} className="text-gray-500 mx-auto mb-1" />
                <p className="text-gray-900 font-bold text-lg">{item.value}</p>
                <p className="text-gray-500 text-[10px] uppercase tracking-wide">{item.label}</p>
              </div>
            ))}
          </div>

          {location.line1 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} style={{ color: c.secondary }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Endereço</p>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">{location.line1}</p>
                {location.line2 && <p className="text-xs text-gray-500 mt-0.5">{location.line2}</p>}
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex-1 min-h-0 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} style={{ color: c.secondary }} />
              <p className="text-sm uppercase tracking-wider font-semibold text-gray-500">Descrição</p>
            </div>
            <p className="text-base text-gray-600 leading-relaxed line-clamp-[8] break-words">{sample.descricao || 'Imóvel disponível para venda.'}</p>
          </div>
        </div>
      </div>

      <footer className="relative z-10 px-8 py-3 border-t border-gray-200 flex justify-between items-center">
        <p className="text-gray-400 text-xs">AvaMax • Estudo de Mercado</p>
        <p className="text-gray-400 text-xs">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};
