import React from 'react';
import { DollarSign, PieChart, CheckCircle2, Users, Building2, Crown, Handshake } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from './types';

interface FeesPageProps {
  colors: RemaxColors;
  market: {
    valor_estimado: number;
  };
  page: number;
  totalPages: number;
  isRental?: boolean;
}

const REMAX_RED = '#CC0000';
const AVAMAX_BLUE = '#003DA5';
const GOLD = '#D4A017';
const GREEN = '#10B981';

export const RemaxFeesPage: React.FC<FeesPageProps> = ({ colors: c, market, page, totalPages, isRental = false }) => {
  const fmtMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const valor = market.valor_estimado;
  const comissaoTotal = valor * 0.06;
  const ladoA = valor * 0.03;
  const royalties = ladoA * 0.10;
  const imobiliaria = ladoA * 0.45;
  const corretor = ladoA * 0.45;
  const ladoB = valor * 0.03;

  const segments = [
    { label: 'Proprietário', pct: 94, color: '#22c55e' },
    { label: 'Comissão', pct: 6, color: AVAMAX_BLUE },
  ];

  const breakdown = [
    { label: 'Royalties RE/MAX', pct: '10%', value: royalties, color: REMAX_RED, icon: Crown },
    { label: 'Imobiliária', pct: '45%', value: imobiliaria, color: AVAMAX_BLUE, icon: Building2 },
    { label: 'Corretor Listador', pct: '45%', value: corretor, color: GOLD, icon: Users },
    { label: 'Mercado / Parceria', pct: '3%', value: ladoB, color: GREEN, icon: Handshake },
  ];

  return (
    <div className="w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white">
      <header className="relative z-10 px-10 pt-8 pb-4 flex justify-between items-start border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
              <DollarSign size={14} style={{ color: c.primary }} />
            </div>
            <p className="text-xs tracking-widest uppercase" style={{ color: c.primary }}>SEÇÃO 5 — HONORÁRIOS</p>
          </div>
          <h2 className="font-bold text-3xl text-gray-900">Honorários e Comissão</h2>
        </div>
        <img src={avamaxLogo} alt="AvaMax" className="h-10 w-auto" />
      </header>

      <div className="relative z-10 px-10 py-6 flex-1">
        <p className="text-sm text-gray-500 mb-5 max-w-lg">
          Transparência total nos honorários. A comissão de 6% é dividida em dois lados iguais,
          garantindo remuneração justa para todos os envolvidos na transação.
        </p>

        {/* Two-block diagram */}
        <div className="mb-6">
          <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign size={14} style={{ color: c.secondary }} /> Estrutura da Comissão 6%
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Lado A - Intermediação */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: `${AVAMAX_BLUE}10` }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: AVAMAX_BLUE }}>
                  <Building2 size={12} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Lado Intermediação</p>
                  <p className="text-[10px] text-gray-500">3% do valor do imóvel • {fmtMoney(ladoA)}</p>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {/* Stacked bar */}
                <div className="flex h-5 rounded-full overflow-hidden">
                  <div style={{ backgroundColor: REMAX_RED, flex: '10' }} />
                  <div style={{ backgroundColor: AVAMAX_BLUE, flex: '45' }} />
                  <div style={{ backgroundColor: GOLD, flex: '45' }} />
                </div>
                {/* Sub-items */}
                <div className="space-y-1.5 pt-1">
                  {[
                    { label: 'Royalties RE/MAX', value: royalties, color: REMAX_RED, icon: Crown, pct: '10%' },
                    { label: 'Imobiliária', value: imobiliaria, color: AVAMAX_BLUE, icon: Building2, pct: '45%' },
                    { label: 'Corretor Listador', value: corretor, color: GOLD, icon: Users, pct: '45%' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <item.icon size={11} style={{ color: item.color }} />
                        <span className="text-xs text-gray-700">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: item.color }}>{item.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lado B - Mercado */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: `${GREEN}10` }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: GREEN }}>
                  <Handshake size={12} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Lado Mercado / Parceria</p>
                  <p className="text-[10px] text-gray-500">3% do valor do imóvel • {fmtMoney(ladoB)}</p>
                </div>
              </div>
              <div className="p-3">
                <div className="h-5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: GREEN }} />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: GREEN }} />
                    <Handshake size={11} style={{ color: GREEN }} />
                    <span className="text-xs text-gray-700">Corretor Parceiro / Captação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: GREEN }}>3%</span>
                    <span className="text-xs text-gray-500">{fmtMoney(ladoB)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Destinado ao corretor que traz o comprador ou ao parceiro de captação no modelo de cooperação RE/MAX.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed breakdown table */}
        <div className="mb-5">
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: `${c.secondary}08` }}>
                  <th className="text-left p-2.5 text-xs font-semibold text-gray-700">Destinação</th>
                  <th className="text-center p-2.5 text-xs font-semibold text-gray-700">% do Total</th>
                  <th className="text-right p-2.5 text-xs font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((item, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-900">{item.label}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                        {item.pct}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-semibold text-sm text-gray-900"></td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300" style={{ backgroundColor: `${AVAMAX_BLUE}06` }}>
                  <td className="p-2.5">
                    <span className="text-sm font-bold text-gray-900">Total Comissão</span>
                  </td>
                  <td className="p-2.5 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${AVAMAX_BLUE}15`, color: AVAMAX_BLUE }}>
                      6%
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-bold text-sm" style={{ color: AVAMAX_BLUE }}></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">* Valores calculados com base no valor estimado de {fmtMoney(valor)}.</p>
        </div>

        {/* Donut chart + What's included side by side */}
        <div className="grid grid-cols-2 gap-5">
          {/* Donut */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
              <PieChart size={14} style={{ color: AVAMAX_BLUE }} /> Distribuição do Valor
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-full relative flex-shrink-0" style={{
                background: `conic-gradient(#22c55e 0% 94%, ${AVAMAX_BLUE} 94% 100%)`,
              }}>
                <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-bold text-xl" style={{ color: AVAMAX_BLUE }}>6%</p>
                    <p className="text-[9px] text-gray-500">Comissão</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {segments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-900">{seg.label}</span>
                        <span className="text-xs font-bold" style={{ color: seg.color }}>{seg.pct}%</span>
                      </div>
                      <p className="text-[10px] text-gray-500">{fmtMoney(valor * seg.pct / 100)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What's included */}
          <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
            <h3 className="font-bold text-sm text-gray-900 mb-2">Incluso nos honorários</h3>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                'Avaliação de mercado completa',
                'Produção fotográfica profissional',
                'Divulgação em portais e redes',
                'Acompanhamento de visitas',
                'Negociação com compradores',
                'Suporte jurídico e documental',
                'Relatórios periódicos',
                'Pós-venda e transferência',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={11} style={{ color: '#22c55e' }} />
                  <span className="text-[11px] text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 px-10 py-4 border-t border-gray-200 flex justify-between items-center mt-auto">
        <p className="text-gray-400 text-xs">AvaMax • {isRental ? 'Estudo de Locação' : 'Estudo de Mercado'}</p>
        <p className="text-gray-400 text-xs">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};