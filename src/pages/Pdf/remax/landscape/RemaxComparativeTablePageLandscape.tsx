import React from 'react';
import { BarChart3, Bath, BedDouble, Building2, Car, DollarSign, Home, Ruler, TrendingUp } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors, RemaxReportProps, SimilarProperty } from '../types';
import { formatMoney, formatPricePerM2, getSampleDisplayTitle, getSampleImages } from '../sampleUtils';

interface RemaxComparativeTablePageLandscapeProps {
  colors: RemaxColors;
  property: RemaxReportProps['property'];
  market: RemaxReportProps['market'];
  samples: SimilarProperty[];
  chunkIndex: number;
  totalChunks: number;
  broker?: RemaxReportProps['broker'];
  page: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxComparativeTablePageLandscape: React.FC<RemaxComparativeTablePageLandscapeProps> = ({
  colors: c,
  property,
  market,
  samples,
  chunkIndex,
  totalChunks,
  broker,
  page,
  totalPages,
}) => {
  const isFirstChunk = chunkIndex === 0;
  const isLastChunk = chunkIndex === totalChunks - 1;
  const allSamples = market.similares || [];
  const averageValue = allSamples.length ? allSamples.reduce((sum, sample) => sum + sample.valor, 0) / allSamples.length : 0;
  const averageArea = allSamples.length ? allSamples.reduce((sum, sample) => sum + sample.area, 0) / allSamples.length : 0;

  return (
    <div className="w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white">
      <header className="relative z-10 px-8 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
            <BarChart3 size={22} style={{ color: c.primary }} />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: c.primary }}>Análise Comparativa</p>
            <h2 className="font-bold text-2xl text-gray-900">
              Quadro Comparativo
              {totalChunks > 1 && <span className="text-gray-500 text-lg ml-2">({chunkIndex + 1}/{totalChunks})</span>}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      <div className="relative z-10 flex-1 flex flex-col px-8 py-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex-1">
          <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-gray-200">
            <div className="bg-white p-3"><p className="text-xs uppercase tracking-wider font-semibold" style={{ color: c.primary }}>Imóvel</p></div>
            <div className="bg-white p-3 text-center"><Ruler size={16} className="text-gray-500 mx-auto mb-1" /><p className="text-[10px] uppercase text-gray-500">Área</p></div>
            <div className="bg-white p-3 text-center"><BedDouble size={16} className="text-gray-500 mx-auto mb-1" /><p className="text-[10px] uppercase text-gray-500">Quartos</p></div>
            <div className="bg-white p-3 text-center"><Bath size={16} className="text-gray-500 mx-auto mb-1" /><p className="text-[10px] uppercase text-gray-500">Banheiros</p></div>
            <div className="bg-white p-3 text-center"><Car size={16} className="text-gray-500 mx-auto mb-1" /><p className="text-[10px] uppercase text-gray-500">Vagas</p></div>
            <div className="bg-white p-3 text-center"><DollarSign size={16} className="text-gray-500 mx-auto mb-1" /><p className="text-[10px] uppercase text-gray-500">Valor</p></div>
            <div className="bg-white p-3 text-center"><TrendingUp size={16} className="text-gray-500 mx-auto mb-1" /><p className="text-[10px] uppercase text-gray-500">R$/m²</p></div>
          </div>

          {isFirstChunk && (
            <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-gray-200 border-t border-gray-200">
              <div className="bg-red-50 p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-red-100 bg-white flex-shrink-0">
                  {property.foto_capa ? (
                    <img src={property.foto_capa} alt="Imóvel avaliado" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100"><Home size={18} style={{ color: c.primary }} /></div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm" style={{ color: c.primary }}>Seu imóvel</p>
                  <p className="text-xs text-gray-500 truncate">{property.bairro}, {property.municipio}</p>
                </div>
              </div>
              <div className="bg-red-50 p-3 flex items-center justify-center"><p className="text-sm font-semibold text-gray-900">{property.area} m²</p></div>
              <div className="bg-red-50 p-3 flex items-center justify-center"><p className="text-sm font-semibold text-gray-900">{property.quartos}</p></div>
              <div className="bg-red-50 p-3 flex items-center justify-center"><p className="text-sm font-semibold text-gray-900">{property.banheiros ?? '-'}</p></div>
              <div className="bg-red-50 p-3 flex items-center justify-center"><p className="text-sm font-semibold text-gray-900">{property.vagas ?? '-'}</p></div>
              <div className="bg-red-50 p-3 flex items-center justify-center"><p className="text-sm font-bold" style={{ color: c.primary }}>{formatMoney(market.valor_estimado)}</p></div>
              <div className="bg-red-50 p-3 flex items-center justify-center"><p className="text-xs font-semibold" style={{ color: c.primary }}>{formatPricePerM2(market.valor_estimado, property.area)}</p></div>
            </div>
          )}

          {samples.map((sample, index) => {
            const globalIndex = chunkIndex * 6 + index + 1;
            const sampleImage = getSampleImages(sample)[0];
            const title = sample.titulo || getSampleDisplayTitle(sample);
            const samplePricePerM2 = sample.area > 0 ? sample.valor / sample.area : 0;
            const propertyPricePerM2 = property.area > 0 ? market.valor_estimado / property.area : 0;
            const diffPercent = propertyPricePerM2 > 0 ? ((samplePricePerM2 - propertyPricePerM2) / propertyPricePerM2) * 100 : 0;
            const diffColor = diffPercent > 5 ? '#dc2626' : diffPercent < -5 ? '#16a34a' : '#374151';

            return (
              <div key={`${sample.id}-${globalIndex}`} className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_1.2fr] gap-px bg-gray-200 border-t border-gray-200">
                <div className="bg-white p-3 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: `${c.primary}15`, color: c.primary }}>
                    {globalIndex}
                  </div>
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                    {sampleImage ? (
                      <img src={sampleImage} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Building2 size={18} className="text-gray-400" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{sample.bairro || property.bairro}{sample.municipio ? `, ${sample.municipio}` : ''}</p>
                  </div>
                </div>
                <div className="bg-white p-3 flex items-center justify-center"><p className="text-sm text-gray-800">{sample.area} m²</p></div>
                <div className="bg-white p-3 flex items-center justify-center"><p className="text-sm text-gray-800">{sample.quartos}</p></div>
                <div className="bg-white p-3 flex items-center justify-center"><p className="text-sm text-gray-800">{sample.banheiros}</p></div>
                <div className="bg-white p-3 flex items-center justify-center"><p className="text-sm text-gray-800">{sample.vagas}</p></div>
                <div className="bg-white p-3 flex items-center justify-center"><p className="text-sm text-gray-900">{formatMoney(sample.valor)}</p></div>
                <div className="bg-white p-3 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs font-semibold" style={{ color: diffColor }}>{formatPricePerM2(sample.valor, sample.area)}</p>
                    {Math.abs(diffPercent) >= 5 && <p className="text-[10px]" style={{ color: diffColor }}>{diffPercent > 0 ? '+' : ''}{diffPercent.toFixed(0)}% vs seu</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isLastChunk && allSamples.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Média do mercado</p>
              <p className="text-xl font-bold text-gray-900">{formatMoney(averageValue)}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Média R$/m²</p>
              <p className="text-xl font-bold text-gray-900">{formatPricePerM2(averageValue, averageArea)}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Menor valor</p>
              <p className="text-xl font-bold text-green-600">{formatMoney(Math.min(...allSamples.map((sample) => sample.valor)))}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Maior valor</p>
              <p className="text-xl font-bold" style={{ color: c.primary }}>{formatMoney(Math.max(...allSamples.map((sample) => sample.valor)))}</p>
            </div>
          </div>
        )}
      </div>

      <footer className="relative z-10 px-8 py-3 border-t border-gray-200 flex justify-between items-center">
        <p className="text-gray-400 text-xs">AvaMax • Estudo de Mercado</p>
        <p className="text-gray-400 text-xs">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};
