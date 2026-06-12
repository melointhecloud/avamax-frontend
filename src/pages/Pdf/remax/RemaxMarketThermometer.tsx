import React from 'react';
import { Thermometer, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from './types';

interface ThermometerPageProps {
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

export const RemaxMarketThermometer: React.FC<ThermometerPageProps> = ({
  colors: c, property, market, page, totalPages, isRental = false,
}) => {
  const fmtMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const confiancaDisplay = market.confianca < 1 ? Math.round(market.confianca * 100) : Math.round(market.confianca);

  // Determine demand level based on confidence and sample count
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

  // Temperature metaphor
  const tempLabel = confiancaDisplay >= 85 ? 'Aquecido' : confiancaDisplay >= 70 ? 'Estável' : 'Desaquecido';
  const tempEmoji = confiancaDisplay >= 85 ? '🔥' : confiancaDisplay >= 70 ? '☀️' : '❄️';
  const tempColor = confiancaDisplay >= 85 ? '#ef4444' : confiancaDisplay >= 70 ? '#f59e0b' : '#3b82f6';

  const range = market.maximo - market.minimo;
  const sliderPos = range > 0 ? Math.max(0, Math.min(100, ((market.valor_estimado - market.minimo) / range) * 100)) : 50;

  return (
    <div className="w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white">
      <header className="relative z-10 px-10 pt-8 pb-4 flex justify-between items-start border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
              <Thermometer size={14} style={{ color: c.primary }} />
            </div>
            <p className="text-xs tracking-widest uppercase" style={{ color: c.primary }}>Seção 3 — Análise de Mercado</p>
          </div>
          <h2 className="font-bold text-3xl text-gray-900">Termômetro do Mercado</h2>
          <p className="text-sm text-gray-500 mt-1">{property.bairro}, {property.municipio} - {property.estado}</p>
        </div>
        <img src={avamaxLogo} alt="AvaMax" className="h-10 w-auto" />
      </header>

      <div className="relative z-10 px-10 py-8 flex-1">
        {/* Temperature Card */}
        <div className="rounded-2xl p-6 mb-6 text-center" style={{ backgroundColor: `${tempColor}08`, border: `2px solid ${tempColor}25` }}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">{tempEmoji}</span>
            <span className="text-4xl font-extrabold tracking-tight uppercase" style={{ color: tempColor, letterSpacing: '-0.02em' }}>{tempLabel}</span>
          </div>
          <p className="text-base text-gray-600">O mercado para <strong>{property.tipo}</strong> em <strong>{property.bairro}</strong> está</p>
          <p className="font-bold text-2xl mt-1" style={{ color: tempColor }}>
            {confiancaDisplay >= 85 ? 'em alta demanda' : confiancaDisplay >= 70 ? 'em equilíbrio' : 'com baixa atividade'}
          </p>
        </div>

        {/* Demand vs Supply */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} style={{ color: demand.color }} />
              <h3 className="font-bold text-base text-gray-900">Demanda</h3>
            </div>
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500">Nível de procura</span>
                <span className="text-sm font-bold" style={{ color: demand.color }}>{demand.level}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${demand.bar}%`, backgroundColor: demand.color }} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Baseado na quantidade de buscas ativas e velocidade de venda na região. 
              Imóveis semelhantes têm mostrado {demand.level.toLowerCase()} procura.
            </p>
          </div>

          <div className="rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={16} style={{ color: supply.color }} />
              <h3 className="font-bold text-base text-gray-900">Oferta</h3>
            </div>
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500">Imóveis disponíveis</span>
                <span className="text-sm font-bold" style={{ color: supply.color }}>{supply.level}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${supply.bar}%`, backgroundColor: supply.color }} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Identificamos <strong>{market.amostras} imóveis comparáveis</strong> ativos na região. 
              Oferta {supply.level.toLowerCase()} indica {supply.level === 'Alta' ? 'mais competição' : 'oportunidade de posicionamento'}.
            </p>
          </div>
        </div>

        {/* Price Slider */}
        <div className="rounded-xl p-5 border-2 mb-6" style={{ borderColor: `${c.secondary}25`, backgroundColor: `${c.secondary}04` }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} style={{ color: c.secondary }} />
            <h3 className="font-bold text-base text-gray-900">{isRental ? 'Faixa de Valor de Aluguel' : 'Faixa de Valor de Mercado'}</h3>
          </div>

          <div className="relative h-8 mb-3">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 rounded-full overflow-hidden" style={{ background: `linear-gradient(to right, ${c.secondary}30, ${c.primary}30)` }}>
              <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(to right, ${c.secondary}, ${c.primary})` }} />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 bg-white shadow-md z-10" style={{ left: `calc(${sliderPos}% - 10px)`, borderColor: c.primary }} />
          </div>

          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>{fmtMoney(market.minimo)}</span>
            <span className="font-bold text-base" style={{ color: c.primary }}>{fmtMoney(market.valor_estimado)}</span>
            <span>{fmtMoney(market.maximo)}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-white border border-gray-200">
              <p className="text-xs text-gray-500">Mínimo</p>
              <p className="font-bold text-sm text-gray-800">{fmtMoney(market.minimo)}</p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: `${c.primary}10`, border: `1px solid ${c.primary}25` }}>
              <p className="text-xs" style={{ color: c.primary }}>Valor Estimado</p>
              <p className="font-bold text-sm" style={{ color: c.primary }}>{fmtMoney(market.valor_estimado)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white border border-gray-200">
              <p className="text-xs text-gray-500">Máximo</p>
              <p className="font-bold text-sm text-gray-800">{fmtMoney(market.maximo)}</p>
            </div>
          </div>
        </div>

        {/* Key Insight */}
        <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>💡 Insight:</strong> Com base em {market.amostras} imóveis analisados e nível de confiança de {confiancaDisplay}%, 
            o mercado na região de <strong>{property.bairro}</strong> apresenta condições {confiancaDisplay >= 80 ? 'favoráveis para negociação' : 'que exigem estratégia cuidadosa de precificação'}. 
            A faixa de preço sugere {range > market.valor_estimado * 0.3 ? 'grande variação, indicando espaço para diferenciação' : 'valores consistentes, indicando mercado estável'}.
          </p>
        </div>
      </div>

      <footer className="relative z-10 px-10 py-4 border-t border-gray-200 flex justify-between items-center mt-auto">
        <p className="text-gray-400 text-xs">AvaMax • {isRental ? 'Estudo de Locação' : 'Estudo de Mercado'}</p>
        <p className="text-gray-400 text-xs">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};