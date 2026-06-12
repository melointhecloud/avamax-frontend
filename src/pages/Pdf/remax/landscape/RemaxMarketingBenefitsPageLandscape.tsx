import React from 'react';
import { Star, Eye, Shield, User, BarChart3, Database, Sparkles, Crown } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from '../types';

interface Props {
  colors: RemaxColors;
  broker?: { nome: string | null; avatar_url: string | null; logo_imobiliaria_url?: string | null; imobiliaria?: string | null };
  page: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxMarketingBenefitsPageLandscape: React.FC<Props> = ({ colors: c, broker, page, totalPages }) => {
  const pageClass = "w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  return (
    <div className={pageClass}>
      <header className="relative z-10 px-8 pt-5 pb-3 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
            <Star size={16} style={{ color: c.primary }} />
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase" style={{ color: c.primary }}>Vantagens Exclusivas</p>
            <h2 className="font-bold text-2xl text-gray-900">Benefícios para o Proprietário</h2>
          </div>
        </div>
        <img src={avamaxLogo} alt="AvaMax" className="h-9 w-auto" />
      </header>

      <div className="relative z-10 px-8 py-4 flex-1 flex gap-6">
        {/* Left: Benefits grid */}
        <div className="flex-1 grid grid-cols-2 gap-3 content-start">
          {[
            { icon: Eye, title: 'Transparência Total', desc: 'Relatórios periódicos com todas as ações, visualizações e feedbacks.', iconColor: 'text-green-600', iconBg: 'bg-green-50' },
            { icon: Shield, title: 'Segurança Jurídica', desc: 'Suporte documental e acompanhamento em todas as etapas.', useAccent: true },
            { icon: User, title: 'Visibilidade Qualificada', desc: 'Imóvel exposto para compradores com real capacidade financeira.', useSecondary: true },
            { icon: BarChart3, title: 'Controle do Processo', desc: 'Métricas claras e objetivas em tempo real.', iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
            { icon: Crown, title: 'Único Representante no Mercado', desc: 'Dedicação exclusiva ao seu imóvel, sem conflitos de interesse.', iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
            { icon: Database, title: 'Decisões por Dados', desc: 'Recomendações baseadas em análises reais e tendências.', iconColor: 'text-teal-600', iconBg: 'bg-teal-50' },
          ].map((b, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${b.iconBg || ''}`}
                  style={b.useAccent ? { backgroundColor: `${c.primary}10` } : b.useSecondary ? { backgroundColor: `${c.secondary}10` } : undefined}>
                  <b.icon size={16} className={b.iconColor || ''}
                    style={b.useAccent ? { color: c.primary } : b.useSecondary ? { color: c.secondary } : undefined} />
                </div>
                <h4 className="text-gray-900 font-semibold text-sm">{b.title}</h4>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Right: Compromisso */}
        <div className="w-[45%] rounded-2xl p-5 border-2 flex flex-col" style={{ backgroundColor: `${c.primary}04`, borderColor: `${c.primary}25` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.primary}15` }}>
              <Sparkles size={24} style={{ color: c.primary }} />
            </div>
            <h4 className="text-gray-900 font-bold text-xl">Compromisso com Resultados</h4>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            Este plano é uma <span className="font-semibold" style={{ color: c.primary }}>estratégia completa de proteção do seu patrimônio</span>. 
            Buscamos garantir o <span className="font-semibold" style={{ color: c.primary }}>melhor valor possível</span>, 
            no <span className="font-semibold" style={{ color: c.primary }}>menor tempo</span>, com total <span className="font-semibold" style={{ color: c.primary }}>segurança</span>.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mb-3 flex-1">
            Com método, inteligência de dados e acompanhamento profissional, transformamos o processo 
            de venda em uma experiência controlada e previsível.
          </p>
          <p className="font-semibold text-base italic" style={{ color: c.primary }}>
            "Porque seu imóvel merece mais do que ser anunciado — merece ser estrategicamente posicionado para vender."
          </p>
        </div>
      </div>

      <footer className="relative z-10 px-8 py-3 border-t border-gray-200 flex justify-between items-center mt-auto">
        <p className="text-gray-400 text-sm">AvaMax • Plano de Marketing</p>
        <p className="text-gray-400 text-sm">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};