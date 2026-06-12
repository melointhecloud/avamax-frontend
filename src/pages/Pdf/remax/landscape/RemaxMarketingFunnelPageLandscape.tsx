import React from 'react';
import { Filter, CheckCircle2 } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from '../types';

interface Props {
  colors: RemaxColors;
  broker?: { nome: string | null; avatar_url: string | null; logo_imobiliaria_url?: string | null; imobiliaria?: string | null };
  page: number;
  totalPages: number;
  isRental?: boolean;
}

const FUNNEL_STEPS = [
  { num: 1, title: 'Estrutura e Segurança', what: 'Organização documental e análise jurídica.', why: 'Processo seguro com documentação em ordem.', impact: 'Confiança ao comprador.', color: '#003DA5' },
  { num: 2, title: 'Preparação e Apresentação', what: 'Home staging, fotos e vídeos profissionais.', why: 'Primeira impressão define 90% da decisão.', impact: 'Destaque em portais.', color: '#0d9488' },
  { num: 3, title: 'Divulgação Estratégica', what: 'Portais, redes sociais e anúncios pagos.', why: 'Alcançar compradores qualificados.', impact: 'Fluxo de interessados.', color: '#CC0000' },
  { num: 4, title: 'Conversão', what: 'Visitas, negociação e fechamento.', why: 'Transformar interessados em compradores.', impact: 'Técnicas de negociação.', color: '#e11d48' },
  { num: 5, title: 'Acompanhamento', what: 'Relatórios e ajustes na estratégia.', why: 'Proprietário informado e processo otimizado.', impact: 'Decisão baseada em dados.', color: '#059669' },
];

export const RemaxMarketingFunnelPageLandscape: React.FC<Props> = ({ colors: c, broker, page, totalPages }) => {
  const pageClass = "w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  return (
    <div className={pageClass}>
      <header className="relative z-10 px-8 pt-5 pb-3 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
            <Filter size={16} style={{ color: c.primary }} />
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase" style={{ color: c.primary }}>Funil de Vendas</p>
            <h2 className="font-bold text-2xl text-gray-900">Ações de Marketing</h2>
          </div>
        </div>
        <img src={avamaxLogo} alt="AvaMax" className="h-9 w-auto" />
      </header>

      <div className="relative z-10 px-8 py-2">
        <p className="text-gray-500 text-sm">
          Cada etapa do funil prepara o terreno para a próxima, garantindo um <span className="text-gray-900 font-semibold">processo estruturado e eficiente</span>.
        </p>
      </div>

      {/* 3+2 grid layout */}
      <div className="relative z-10 px-8 py-2 flex-1 flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3 flex-1">
          {FUNNEL_STEPS.slice(0, 3).map((step) => (
            <FunnelCard key={step.num} step={step} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 flex-1">
          {FUNNEL_STEPS.slice(3).map((step) => (
            <FunnelCard key={step.num} step={step} />
          ))}
        </div>
      </div>

      <footer className="relative z-10 px-8 py-3 border-t border-gray-200 flex justify-between items-center mt-auto">
        <p className="text-gray-400 text-sm">AvaMax • Plano de Marketing</p>
        <p className="text-gray-400 text-sm">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};

const FunnelCard: React.FC<{ step: typeof FUNNEL_STEPS[0] }> = ({ step }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ backgroundColor: step.color }}>
        {step.num}
      </div>
      <h4 className="text-gray-900 font-bold text-base">{step.title}</h4>
    </div>
    <div className="space-y-1 flex-1">
      <div className="flex items-start gap-2">
        <span className="font-semibold text-xs min-w-[40px]" style={{ color: step.color }}>O que:</span>
        <span className="text-gray-500 text-xs">{step.what}</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="font-semibold text-xs min-w-[40px]" style={{ color: step.color }}>Por que:</span>
        <span className="text-gray-500 text-xs">{step.why}</span>
      </div>
    </div>
    <div className="flex items-center gap-2 mt-2 bg-green-50 border border-green-200 rounded-lg px-2 py-1.5">
      <CheckCircle2 size={12} className="text-green-600 flex-shrink-0" />
      <span className="text-green-700 text-xs font-medium">{step.impact}</span>
    </div>
  </div>
);