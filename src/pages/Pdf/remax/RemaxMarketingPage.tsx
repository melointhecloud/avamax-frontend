import React from 'react';
import { Megaphone, Camera, Target, Handshake, BarChart3, Search, Users, Globe, Zap, Eye } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from './types';

interface MarketingPageProps {
  colors: RemaxColors;
  pageStart: number;
  totalPages: number;
}

export const RemaxMarketingPage: React.FC<MarketingPageProps> = ({ colors: c, pageStart, totalPages }) => {
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
        <h2 className="font-bold text-2xl text-gray-900">{title}</h2>
      </div>
      <img src={avamaxLogo} alt="AvaMax" className="h-10 w-auto" />
    </header>
  );

  const Footer = ({ page }: { page: number }) => (
    <footer className="relative z-10 px-10 py-4 border-t border-gray-200 flex justify-between items-center mt-auto">
      <p className="text-gray-400 text-xs">AvaMax • Estudo de Mercado</p>
      <p className="text-gray-400 text-xs">{String(page).padStart(2, '0')} / {totalPages}</p>
    </footer>
  );

  return (
    <>
      {/* PAGE: Marketing Plan + Pillars */}
      <div className={pageClass}>
        <Header icon={Megaphone} label="Seção 2 — Marketing" title="Plano de Marketing Imobiliário" page={pageStart} />
        
        <div className="relative z-10 px-10 py-6 flex-1">
          <p className="text-xs text-gray-500 mb-6 max-w-lg">
            Estratégia completa para posicionar seu imóvel no mercado com máxima visibilidade e atrair compradores qualificados.
          </p>

          {/* 2.1 Plano de Marketing */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Target size={14} style={{ color: c.secondary }} /> Estratégia de Divulgação
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Camera, title: 'Produção Visual', desc: 'Fotos profissionais, vídeos em 4K, tour virtual 360° e drone para capturar cada detalhe.' },
                { icon: Globe, title: 'Portais e Redes', desc: 'Anúncio nos maiores portais imobiliários do Brasil e campanhas em redes sociais segmentadas.' },
                { icon: Users, title: 'Network RE/MAX', desc: 'Divulgação para toda a rede RE/MAX com acesso a milhares de corretores parceiros.' },
                { icon: Search, title: 'SEO & Google Ads', desc: 'Otimização para buscadores e campanhas de mídia paga para compradores ativos.' },
                { icon: Eye, title: 'Placa e Open House', desc: 'Sinalização profissional no imóvel e eventos exclusivos de visitação.' },
                { icon: BarChart3, title: 'Relatórios', desc: 'Acompanhamento semanal com métricas de visualizações, leads e visitas agendadas.' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${c.secondary}10` }}>
                    <item.icon size={14} style={{ color: c.secondary }} />
                  </div>
                  <p className="font-semibold text-xs text-gray-900 mb-1">{item.title}</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2.3 Pilares Estratégicos */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Zap size={14} style={{ color: c.primary }} /> Pilares Estratégicos
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { n: '01', title: 'Precificação', desc: 'Análise comparativa de mercado para definir o preço ideal.' },
                { n: '02', title: 'Exposição', desc: 'Máxima visibilidade nos canais certos para o público certo.' },
                { n: '03', title: 'Negociação', desc: 'Técnicas avançadas para maximizar o valor da transação.' },
                { n: '04', title: 'Fechamento', desc: 'Suporte jurídico e documental até a assinatura.' },
              ].map((p, i) => (
                <div key={i} className="p-3 rounded-lg text-center" style={{ backgroundColor: `${c.primary}06`, border: `1px solid ${c.primary}15` }}>
                  <p className="font-bold text-lg mb-1" style={{ color: c.primary }}>{p.n}</p>
                  <p className="font-semibold text-xs text-gray-900 mb-1">{p.title}</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2.4 Parcerias */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Handshake size={14} style={{ color: c.secondary }} /> Parcerias com o Mercado
            </h3>
            <div className="rounded-xl p-4 border border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Trabalhamos em parceria com todo o mercado imobiliário. Nosso modelo colaborativo 
                permite que <strong>qualquer corretor traga compradores</strong> para seu imóvel, 
                multiplicando as chances de venda com comissão compartilhada.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: '100%', label: 'Parcerias abertas' },
                  { val: '50/50', label: 'Divisão de comissão' },
                  { val: '3x', label: 'Mais visitas' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-2 rounded-lg bg-white border border-gray-200">
                    <p className="font-bold text-sm" style={{ color: c.primary }}>{s.val}</p>
                    <p className="text-[9px] text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer page={pageStart} />
      </div>
    </>
  );
};
