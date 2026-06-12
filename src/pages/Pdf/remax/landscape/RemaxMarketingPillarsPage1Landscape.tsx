import React from 'react';
import { Layers, Scale, Palette, Users, CheckCircle2 } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from '../types';

interface Props {
  colors: RemaxColors;
  broker?: { nome: string | null; avatar_url: string | null; logo_imobiliaria_url?: string | null; imobiliaria?: string | null };
  page: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxMarketingPillarsPage1Landscape: React.FC<Props> = ({ colors: c, broker, page, totalPages }) => {
  const pageClass = "w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  const pillars = [
    {
      num: '01', title: 'Precificação Inteligente', icon: Scale,
      desc: 'A precificação correta é o fundamento de qualquer venda bem-sucedida. Utilizamos análise de dados de mercado para posicionar o imóvel de forma competitiva.',
      checks: ['Análise de comparativos', 'Faixas de preço estratégicas'],
      iconColor: 'text-green-600', iconBg: 'bg-green-50', badgeBg: 'bg-green-100', badgeText: 'text-green-700', checkColor: 'text-green-600',
    },
    {
      num: '02', title: 'Conteúdo e Apresentação', icon: Palette,
      desc: 'A primeira impressão é decisiva. Investimos em produção visual de alto padrão e narrativa que destaca os diferenciais do imóvel.',
      checks: ['Fotos e vídeos profissionais', 'Tour virtual 360°'],
      iconColor: 'text-purple-600', iconBg: 'bg-purple-50', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700', checkColor: 'text-purple-600',
    },
    {
      num: '03', title: 'Experiência do Cliente', icon: Users,
      desc: 'Cada interação com o comprador é uma oportunidade de encantar. Criamos experiências memoráveis em todas as etapas.',
      checks: ['Visitas personalizadas', 'Atendimento consultivo'],
      useSecondary: true,
    },
  ];

  return (
    <div className={pageClass}>
      <header className="relative z-10 px-8 pt-5 pb-3 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
            <Layers size={16} style={{ color: c.primary }} />
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase" style={{ color: c.primary }}>Fundamentos</p>
            <h2 className="font-bold text-2xl text-gray-900">Pilares Estratégicos — 01 a 03</h2>
          </div>
        </div>
        <img src={avamaxLogo} alt="AvaMax" className="h-9 w-auto" />
      </header>

      <div className="relative z-10 px-8 py-4 flex-1 grid grid-cols-3 gap-4">
        {pillars.map((p, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${p.iconBg || ''}`}
              style={p.useSecondary ? { backgroundColor: `${c.secondary}10` } : undefined}>
              <p.icon size={24} className={p.iconColor || ''}
                style={p.useSecondary ? { color: c.secondary } : undefined} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badgeBg || ''} ${p.badgeText || ''}`}
                style={p.useSecondary ? { backgroundColor: `${c.secondary}15`, color: c.secondary } : undefined}>{p.num}</span>
              <h4 className="text-gray-900 font-bold text-base">{p.title}</h4>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-3 flex-1">{p.desc}</p>
            <div className="space-y-1.5">
              {p.checks.map((ch, j) => (
                <div key={j} className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} className={p.checkColor || ''}
                    style={p.useSecondary ? { color: c.secondary } : undefined} />
                  <span>{ch}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="relative z-10 px-8 py-3 border-t border-gray-200 flex justify-between items-center mt-auto">
        <p className="text-gray-400 text-sm">AvaMax • Plano de Marketing</p>
        <p className="text-gray-400 text-sm">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};