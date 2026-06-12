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
  {
    num: 1, title: 'Estrutura e Segurança',
    what: 'Organização documental completa e análise jurídica do imóvel.',
    why: 'Um processo de venda seguro começa com documentação em ordem.',
    impact: 'Evita problemas e transmite confiança ao comprador.',
    color: '#003DA5',
  },
  {
    num: 2, title: 'Preparação e Apresentação',
    what: 'Home staging, reparos, produção de fotos e vídeos profissionais.',
    why: 'A primeira impressão visual define 90% da decisão do comprador.',
    impact: 'Destaque em portais e redes sociais.',
    color: '#0d9488',
  },
  {
    num: 3, title: 'Divulgação Estratégica',
    what: 'Publicação em portais, redes sociais, anúncios pagos e parcerias.',
    why: 'Alcançar o maior número de compradores qualificados possível.',
    impact: 'Gera fluxo constante de interessados.',
    color: '#CC0000',
  },
  {
    num: 4, title: 'Conversão',
    what: 'Agendamento de visitas, negociação e fechamento do negócio.',
    why: 'Transformar interessados em compradores reais.',
    impact: 'Acelerar o fechamento com técnicas de negociação.',
    color: '#e11d48',
  },
  {
    num: 5, title: 'Acompanhamento e Feedback',
    what: 'Relatórios periódicos, análise de visitas e ajustes na estratégia.',
    why: 'Manter o proprietário informado e otimizar o processo.',
    impact: 'Transparência total e tomada de decisão baseada em dados.',
    color: '#059669',
  },
];

export const RemaxMarketingFunnelPage: React.FC<Props> = ({ colors: c, broker, page, totalPages, isRental = false }) => {
  const pageClass = "w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  return (
    <div className={pageClass}>
      <header className="relative z-10 p-8 border-b border-gray-200 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${c.primary}15` }}>
              <Filter size={20} style={{ color: c.primary }} />
            </div>
            <p className="text-xs tracking-[0.25em] uppercase font-semibold" style={{ color: c.primary }}>Funil de Vendas</p>
          </div>
          <h2 className="text-gray-900 font-bold text-4xl">Ações de Marketing</h2>
        </div>
        <div className="flex items-center gap-3">
          {broker?.logo_imobiliaria_url && (
            <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 border-2 flex-shrink-0" style={{ borderColor: `${c.primary}40` }}>
              <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || 'Imobiliária'} className="w-full h-full object-contain p-1" />
            </div>
          )}
          {broker?.avatar_url && (
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2" style={{ borderColor: `${c.primary}40` }}>
              <img src={broker.avatar_url} alt={broker.nome || ''} className="w-full h-full object-contain p-0.5" />
            </div>
          )}
          <img src={avamaxLogo} alt="AvaMax" className="h-16 w-auto" />
        </div>
      </header>

      <div className="relative z-10 px-8 pt-6 pb-4">
        <p className="text-gray-500 text-base leading-relaxed">
          As ações de marketing seguem um <span className="text-gray-900 font-semibold">funil estruturado</span>, onde cada etapa prepara o terreno para a próxima.
        </p>
      </div>

      <div className="relative z-10 px-8 flex-1 flex flex-col gap-3">
        {FUNNEL_STEPS.map((step) => (
          <div key={step.num} className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-full" style={{ backgroundColor: step.color }} />
            <div className="ml-5 rounded-2xl p-5 border border-gray-200 bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl" style={{ backgroundColor: step.color }}>
                  {step.num}
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 font-bold text-lg mb-3">{step.title}</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-sm min-w-[52px]" style={{ color: step.color }}>O que:</span>
                      <span className="text-gray-500 text-sm">{step.what}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-sm min-w-[52px]" style={{ color: step.color }}>Por que:</span>
                      <span className="text-gray-500 text-sm">{step.why}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
                      <span className="text-green-700 text-sm font-medium">Impacto: {step.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="relative z-10 p-8 border-t border-gray-200 flex justify-between items-center">
        <p className="text-gray-400 text-xs">AvaMax • Plano de Marketing</p>
        <p className="text-gray-400 text-xs">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};