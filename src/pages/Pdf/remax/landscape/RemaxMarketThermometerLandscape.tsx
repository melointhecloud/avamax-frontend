import React from 'react';
import { Thermometer, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from '../types';

interface ThermometerLandscapeProps {
  colors: RemaxColors;
  property: {
    bairro: string;
    municipio: string;
    estado: string;
    tipo: string;
  };
  market: {
    valor_estimado: number;
    amostras: number;
    confianca: number;
    minimo: number;
    maximo: number;
  };
  page: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxMarketThermometerLandscape: React.FC<ThermometerLandscapeProps> = ({
  colors: c, property, market, page, totalPages,
}) => {
  const fmtMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const confiancaDisplay = market.confianca < 1 ? Math.round(market.confianca * 100) : Math.round(market.confianca);

  const getDemandLevel = () => {
    if (market.amostras >= 8 && confiancaDisplay >= 85) return { level: 'Alta', color: '#16a34a', bar: 85 };
    if (market.amostras >= 5 && confiancaDisplay >= 70) return { level: 'Moderada', color: '#f59e0b', bar: 60 };
    return { level: 'Baixa', color: '#ef4444', bar: 35 };
  };

  const getSupplyLevel = () => {
    if (market.amostras >= 10) return { level: 'Alta', color: '#ef4444', bar: 80 };
    if (market.amostras >= 6) return { level: 'Moderada', color: '#f59e0b', bar: 55 };
    return { level: 'Baixa', color: '#16a34a', bar: 30 };
  };

  const demand = getDemandLevel();
  const supply = getSupplyLevel();
  const tempLabel = confiancaDisplay >= 85 ? 'Aquecido' : confiancaDisplay >= 70 ? 'Estável' : 'Desaquecido';
  const tempEmoji = confiancaDisplay >= 85 ? '🔥' : confiancaDisplay >= 70 ? '☀️' : '❄️';
  const tempColor = confiancaDisplay >= 85 ? '#ef4444' : confiancaDisplay >= 70 ? '#f59e0b' : '#3b82f6';
  const range = market.maximo - market.minimo;
  const sliderPos = range > 0 ? Math.max(0, Math.min(100, ((market.valor_estimado - market.minimo) / range) * 100)) : 50;

  return (
    <div className="w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white">
      <header className="relative z-10 px-8 pt-5 pb-3 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
            <Thermometer size={16} style={{ color: c.primary }} />
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase" style={{ color: c.primary }}>Seção 3 — Análise de Mercado</p>
            <h2 className="font-bold text-2xl text-gray-900">Termômetro do Mercado</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">{property.bairro}, {property.municipio} - {property.estado}</p>
          <img src={avamaxLogo} alt="AvaMax" className="h-9 w-auto" />
        </div>
      </header>

      <div className="relative z-10 px-8 py-4 flex-1 flex flex-col gap-4">
        {/* Temperature Card - horizontal */}
        <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: `${tempColor}08`, border: `2px solid ${tempColor}25` }}>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-5xl">{tempEmoji}</span>
              <span className="text-5xl font-extrabold tracking-tight uppercase" style={{ color: tempColor, letterSpacing: '-0.02em' }}>{tempLabel}</span>
            </div>
            <span className="text-4xl font-thin text-gray-300">|</span>
            <div className="text-left">
              <p className="text-base text-gray-600">O mercado para <strong>{property.tipo}</strong> em <strong>{property.bairro}</strong> está</p>
              <p className="font-bold text-3xl" style={{ color: tempColor }}>
                {confiancaDisplay >= 85 ? 'em alta demanda' : confiancaDisplay >= 70 ? 'em equilíbrio' : 'com baixa atividade'}
              </p>
            </div>
          </div>
        </div>

        {/* Demand & Supply side by side */}
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} style={{ color: demand.color }} />
              <h3 className="font-bold text-lg text-gray-900">Demanda</h3>
            </div>
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-base text-gray-500">Nível de procura</span>
                <span className="text-base font-bold" style={{ color: demand.color }}>{demand.level}</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${demand.bar}%`, backgroundColor: demand.color }} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Baseado na quantidade de buscas ativas e velocidade de venda na região.
              Imóveis semelhantes têm mostrado {demand.level.toLowerCase()} procura.
            </p>
          </div>

          <div className="rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={18} style={{ color: supply.color }} />
              <h3 className="font-bold text-lg text-gray-900">Oferta</h3>
            </div>
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-base text-gray-500">Imóveis disponíveis</span>
                <span className="text-base font-bold" style={{ color: supply.color }}>{supply.level}</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${supply.bar}%`, backgroundColor: supply.color }} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Identificamos <strong>{market.amostras} imóveis comparáveis</strong> ativos na região.
              Oferta {supply.level.toLowerCase()} indica {supply.level === 'Alta' ? 'mais competição' : 'oportunidade de posicionamento'}.
            </p>
          </div>
        </div>

        {/* Price Slider - wider */}
        <div className="rounded-xl p-5 border-2" style={{ borderColor: `${c.secondary}25`, backgroundColor: `${c.secondary}04` }}>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} style={{ color: c.secondary }} />
            <h3 className="font-bold text-lg text-gray-900">Faixa de Valor de Mercado</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="relative h-8 mb-2">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-5 rounded-full overflow-hidden" style={{ background: `linear-gradient(to right, ${c.secondary}30, ${c.primary}30)` }}>
                  <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(to right, ${c.secondary}, ${c.primary})` }} />
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 bg-white shadow-md z-10" style={{ left: `calc(${sliderPos}% - 12px)`, borderColor: c.primary }} />
              </div>
              <div className="flex justify-between text-base text-gray-500">
                <span>{fmtMoney(market.minimo)}</span>
                <span className="font-bold text-xl" style={{ color: c.primary }}>{fmtMoney(market.valor_estimado)}</span>
                <span>{fmtMoney(market.maximo)}</span>
              </div>
            </div>
            <div className="w-px h-16 bg-gray-200" />
            <div className="text-center px-4">
              <p className="text-sm text-gray-500 mb-1">💡 Insight</p>
              <p className="text-sm text-gray-600 leading-relaxed max-w-[200px]">
                {market.amostras} imóveis analisados com {confiancaDisplay}% de confiança.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 px-8 py-3 border-t border-gray-200 flex justify-between items-center mt-auto">
        <p className="text-gray-400 text-sm">AvaMax • Estudo de Mercado</p>
        <p className="text-gray-400 text-sm">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};