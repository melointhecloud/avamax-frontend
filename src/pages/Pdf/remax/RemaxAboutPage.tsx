import React from 'react';
import { Globe, Users, Award, Star, ThumbsUp, Shield, TrendingUp, Heart } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from './types';

interface AboutPageProps {
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

export const RemaxAboutPage: React.FC<AboutPageProps> = ({ colors: c, broker, pageStart, totalPages, isRental = false }) => {
  const pageClass = "w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  const Header = ({ icon: Icon, label, title, page }: { icon: any; label: string; title: string; page: number }) => (
    <header className="relative z-10 px-10 pt-8 pb-4 flex justify-between items-start border-b border-gray-200">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
            <Icon size={14} style={{ color: c.primary }} />
          </div>
          <p className="text-xs tracking-widest uppercase" style={{ color: c.primary }}>{label}</p>
        </div>
        <h2 className="font-bold text-3xl text-gray-900">{title}</h2>
      </div>
      <img src={avamaxLogo} alt="AvaMax" className="h-10 w-auto" />
    </header>
  );

  const Footer = ({ page }: { page: number }) => (
    <footer className="relative z-10 px-10 py-4 border-t border-gray-200 flex justify-between items-center mt-auto">
      <p className="text-gray-400 text-xs">AvaMax • {isRental ? 'Estudo de Locação' : 'Estudo de Mercado'}</p>
      <p className="text-gray-400 text-xs">{String(page).padStart(2, '0')} / {totalPages}</p>
    </footer>
  );

  return (
    <>
      {/* PAGE: Quem Somos */}
      <div className={pageClass}>
        <Header icon={Globe} label="Seção 1 — Institucional" title="Quem Somos" page={pageStart} />
        
        <div className="relative z-10 px-10 py-6 flex-1">
          <div className="grid grid-cols-2 gap-5 mb-6">
            {/* RE/MAX no Mundo */}
            <div className="rounded-xl p-5 border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={16} style={{ color: c.primary }} />
                <h3 className="font-bold text-base text-gray-900">RE/MAX no Mundo</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Presente em mais de <strong>110 países</strong>, a RE/MAX é a maior rede imobiliária do planeta, 
                com mais de <strong>140.000 corretores</strong> conectados globalmente. Fundada em 1973, 
                revolucionou o mercado imobiliário com seu modelo de franquia inovador.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[{ n: '110+', l: 'Países' }, { n: '140mil', l: 'Corretores' }, { n: '9mil+', l: 'Escritórios' }].map((s, i) => (
                  <div key={i} className="text-center p-2 rounded-lg" style={{ backgroundColor: `${c.primary}08` }}>
                    <p className="font-bold text-base" style={{ color: c.primary }}>{s.n}</p>
                    <p className="text-[10px] text-gray-500">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RE/MAX no Brasil */}
            <div className="rounded-xl p-5 border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} style={{ color: c.secondary }} />
                <h3 className="font-bold text-base text-gray-900">RE/MAX no Brasil</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                No Brasil desde 2009, a RE/MAX se consolidou como referência em 
                <strong> intermediação imobiliária de alta performance</strong>. 
                Com mais de 400 franquias espalhadas pelo país, oferece suporte tecnológico 
                e capacitação contínua.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[{ n: '590+', l: 'Franquias' }, { n: '12mil+', l: 'Corretores' }, { n: '15+', l: 'Anos no BR' }].map((s, i) => (
                  <div key={i} className="text-center p-2 rounded-lg" style={{ backgroundColor: `${c.secondary}08` }}>
                    <p className="font-bold text-base" style={{ color: c.secondary }}>{s.n}</p>
                    <p className="text-[10px] text-gray-500">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nossa Agência */}
          <div className="rounded-xl p-5 border-2 mb-5" style={{ borderColor: `${c.primary}25`, backgroundColor: `${c.primary}04` }}>
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} style={{ color: c.primary }} />
              <h3 className="font-bold text-base text-gray-900">Nossa Agência</h3>
            </div>
            <div className="flex gap-5 items-center">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ borderColor: `${c.primary}30`, backgroundColor: 'white' }}>
                {broker?.logo_imobiliaria_url ? (
                  <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Users size={28} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-gray-900 mb-1">{broker?.imobiliaria || 'RE/MAX'}</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Nossa equipe é formada por profissionais certificados e especializados no mercado local, 
                  com dedicação exclusiva ao atendimento de excelência. Unimos tecnologia de ponta e 
                  conhecimento regional para entregar resultados superiores.
                </p>
              </div>
            </div>
          </div>

          {/* Por que nos escolher */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} style={{ color: c.primary }} />
              <h3 className="font-bold text-base text-gray-900">Por que nos escolher</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Globe, title: 'Rede Global', desc: 'Acesso a compradores e investidores do mundo inteiro pela rede RE/MAX.' },
                { icon: Shield, title: 'Segurança', desc: 'Processos jurídicos e documentais auditados para sua tranquilidade.' },
                { icon: TrendingUp, title: 'Tecnologia', desc: 'Ferramentas avançadas de avaliação, marketing digital e gestão de leads.' },
                { icon: Heart, title: 'Dedicação', desc: 'Atendimento personalizado com foco em resultados acima da média.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.secondary}10` }}>
                    <item.icon size={14} style={{ color: c.secondary }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 mb-0.5">{item.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prova Social */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp size={16} style={{ color: c.primary }} />
              <h3 className="font-bold text-base text-gray-900">Clientes Satisfeitos</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Maria S.', text: '"Venderam meu imóvel em 45 dias, acima do valor que eu esperava!"', stars: 5 },
                { name: 'Carlos R.', text: '"Profissionalismo e transparência do início ao fim. Recomendo!"', stars: 5 },
                { name: 'Ana P.', text: '"A avaliação de mercado foi decisiva para fecharmos um ótimo negócio."', stars: 5 },
              ].map((t, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={10} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed mb-2">{t.text}</p>
                  <p className="text-xs font-semibold text-gray-800">— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer page={pageStart} />
      </div>
    </>
  );
};