import React from 'react';
import { Layers, Target, Eye, Users, CheckCircle2 } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from '../types';

interface Props {
  colors: RemaxColors;
  page: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxMarketingPillarsPage2Landscape: React.FC<Props> = ({ colors: c, page, totalPages }) => {
  const pageClass = "w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  const pillars = [
    {
      num: '04', title: 'Publicidade Digital Segmentada', icon: Target,
      desc: 'Campanhas estratégicas para alcançar compradores qualificados nos canais mais efetivos para o perfil do imóvel.',
      checks: ['Google Ads e Meta Ads', 'Retargeting inteligente'],
      impact: 'Alcançar compradores certos, no momento certo, com a mensagem certa.',
      useAccent: true,
    },
    {
      num: '05', title: 'Redes Sociais e Engajamento', icon: Eye,
      desc: 'Presença estratégica nas principais redes sociais para ampliar a visibilidade e gerar interesse orgânico.',
      checks: ['Instagram e Facebook', 'Stories e Reels'],
      impact: 'Visibilidade massiva e engajamento com potenciais compradores.',
      iconColor: 'text-pink-600', iconBg: 'bg-pink-50', badgeBg: 'bg-pink-100', badgeText: 'text-pink-700',
      checkColor: 'text-pink-600', impactBg: 'bg-pink-50', impactBorder: 'border-pink-200', impactText: 'text-pink-700',
    },
    {
      num: '06', title: 'Parcerias Estratégicas', icon: Users,
      desc: 'Rede de parceiros e corretores para ampliar o alcance e acelerar a comercialização do imóvel.',
      checks: ['Rede de corretores parceiros', 'Parcerias com imobiliárias'],
      impact: 'Multiplicar a exposição e acelerar o processo de venda.',
      iconColor: 'text-teal-600', iconBg: 'bg-teal-50', badgeBg: 'bg-teal-100', badgeText: 'text-teal-700',
      checkColor: 'text-teal-600', impactBg: 'bg-teal-50', impactBorder: 'border-teal-200', impactText: 'text-teal-700',
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
            <h2 className="font-bold text-2xl text-gray-900">Pilares Estratégicos — 04 a 06</h2>
          </div>
        </div>
        <img src={avamaxLogo} alt="AvaMax" className="h-9 w-auto opacity-60" />
      </header>

      <div className="relative z-10 px-8 py-4 flex-1 grid grid-cols-3 gap-4">
        {pillars.map((p, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${p.iconBg || ''}`}
              style={p.useAccent ? { backgroundColor: `${c.primary}10` } : undefined}>
              <p.icon size={24} className={p.iconColor || ''}
                style={p.useAccent ? { color: c.primary } : undefined} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badgeBg || ''} ${p.badgeText || ''}`}
                style={p.useAccent ? { backgroundColor: `${c.primary}15`, color: c.primary } : undefined}>{p.num}</span>
              <h4 className="text-gray-900 font-bold text-base">{p.title}</h4>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-3 flex-1">{p.desc}</p>
            <div className="space-y-1.5 mb-3">
              {p.checks.map((ch, j) => (
                <div key={j} className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} className={p.checkColor || ''}
                    style={p.useAccent ? { color: c.primary } : undefined} />
                  <span>{ch}</span>
                </div>
              ))}
            </div>
            <div className={`rounded-lg p-2 border ${p.impactBg || ''} ${p.impactBorder || ''}`}
              style={p.useAccent ? { backgroundColor: `${c.primary}06`, borderColor: `${c.primary}15` } : undefined}>
              <p className={`text-xs font-medium ${p.impactText || ''}`}
                style={p.useAccent ? { color: c.primary } : undefined}>
                IMPACTO: {p.impact}
              </p>
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