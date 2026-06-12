import React from 'react';
import { Globe, Users, Award, Star, ThumbsUp, Shield, TrendingUp, Heart } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from '../types';

interface AboutPageLandscapeProps {
  colors: RemaxColors;
  broker?: {
    nome: string | null;
    imobiliaria?: string | null;
    logo_imobiliaria_url?: string | null;
    avatar_url?: string | null;
  };
  pageStart: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxAboutPageLandscape: React.FC<AboutPageLandscapeProps> = ({ colors: c, broker, pageStart, totalPages }) => {
  const pageClass = "w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  const Header = ({ icon: Icon, label, title }: { icon: any; label: string; title: string }) => (
    <header className="relative z-10 px-8 pt-5 pb-3 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
          <Icon size={16} style={{ color: c.primary }} />
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase" style={{ color: c.primary }}>{label}</p>
          <h2 className="font-bold text-2xl text-gray-900">{title}</h2>
        </div>
      </div>
      <img src={avamaxLogo} alt="AvaMax" className="h-9 w-auto" />
    </header>
  );

  const Footer = ({ page }: { page: number }) => (
    <footer className="relative z-10 px-8 py-3 border-t border-gray-200 flex justify-between items-center mt-auto">
      <p className="text-gray-400 text-sm">AvaMax • Estudo de Mercado</p>
      <p className="text-gray-400 text-sm">{String(page).padStart(2, '0')} / {totalPages}</p>
    </footer>
  );

  return (
    <div className={pageClass}>
      <Header icon={Globe} label="Seção 1 — Institucional" title="Quem Somos" />

      <div className="relative z-10 px-8 py-4 flex-1 flex flex-col gap-4">
        {/* Row 1: RE/MAX World + Brasil side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-4 border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={16} style={{ color: c.primary }} />
              <h3 className="font-bold text-base text-gray-900">RE/MAX no Mundo</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Presente em mais de <strong>110 países</strong>, a RE/MAX é a maior rede imobiliária do planeta,
              com mais de <strong>140.000 corretores</strong> conectados globalmente.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[{ n: '110+', l: 'Países' }, { n: '140mil', l: 'Corretores' }, { n: '9mil+', l: 'Escritórios' }].map((s, i) => (
                <div key={i} className="text-center p-2 rounded-lg" style={{ backgroundColor: `${c.primary}08` }}>
                  <p className="font-bold text-lg" style={{ color: c.primary }}>{s.n}</p>
                  <p className="text-[10px] text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} style={{ color: c.secondary }} />
              <h3 className="font-bold text-base text-gray-900">RE/MAX no Brasil</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              No Brasil desde 2009, a RE/MAX se consolidou como referência em
              <strong> intermediação imobiliária de alta performance</strong>.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[{ n: '590+', l: 'Franquias' }, { n: '12mil+', l: 'Corretores' }, { n: '15+', l: 'Anos no BR' }].map((s, i) => (
                <div key={i} className="text-center p-2 rounded-lg" style={{ backgroundColor: `${c.secondary}08` }}>
                  <p className="font-bold text-lg" style={{ color: c.secondary }}>{s.n}</p>
                  <p className="text-[10px] text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Nossa Agência + Por que nos escolher */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-4 border-2" style={{ borderColor: `${c.primary}25`, backgroundColor: `${c.primary}04` }}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} style={{ color: c.primary }} />
              <h3 className="font-bold text-base text-gray-900">Nossa Agência</h3>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ borderColor: `${c.primary}30`, backgroundColor: 'white' }}>
                {broker?.logo_imobiliaria_url ? (
                  <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Users size={24} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-gray-900 mb-1">{broker?.imobiliaria || 'RE/MAX'}</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Nossa equipe é formada por profissionais certificados e especializados no mercado local,
                  com dedicação exclusiva ao atendimento de excelência.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} style={{ color: c.primary }} />
              <h3 className="font-bold text-base text-gray-900">Por que nos escolher</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Globe, title: 'Rede Global', desc: 'Acesso a compradores e investidores do mundo inteiro.' },
                { icon: Shield, title: 'Segurança', desc: 'Processos jurídicos e documentais auditados.' },
                { icon: TrendingUp, title: 'Tecnologia', desc: 'Ferramentas avançadas de avaliação e marketing.' },
                { icon: Heart, title: 'Dedicação', desc: 'Atendimento personalizado com foco em resultados.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-2 p-2.5 rounded-lg border border-gray-200 bg-white">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.secondary}10` }}>
                    <item.icon size={13} style={{ color: c.secondary }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Prova Social - grid of 3 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp size={14} style={{ color: c.primary }} />
            <h3 className="font-bold text-base text-gray-900">Clientes Satisfeitos</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Maria S.', text: '"Venderam meu imóvel em 45 dias, acima do valor que eu esperava!"', stars: 5 },
              { name: 'Carlos R.', text: '"Profissionalismo e transparência do início ao fim. Recomendo!"', stars: 5 },
              { name: 'Ana P.', text: '"A avaliação de mercado foi decisiva para fecharmos um ótimo negócio."', stars: 5 },
            ].map((t, i) => (
              <div key={i} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={11} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic leading-relaxed mb-1">{t.text}</p>
                <p className="text-sm font-semibold text-gray-800">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer page={pageStart} />
    </div>
  );
};