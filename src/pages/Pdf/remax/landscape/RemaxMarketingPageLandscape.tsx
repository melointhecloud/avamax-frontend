import React from 'react';
import { Megaphone, Camera, Target, Handshake, BarChart3, Search, Users, Globe, Zap, Eye } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from '../types';

interface MarketingPageLandscapeProps {
  colors: RemaxColors;
  pageStart: number;
  totalPages: number;
}

export const RemaxMarketingPageLandscape: React.FC<MarketingPageLandscapeProps> = ({ colors: c, pageStart, totalPages }) => {
  const pageClass = "w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  return (
    <div className={pageClass}>
      <header className="relative z-10 px-8 pt-5 pb-3 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
            <Megaphone size={16} style={{ color: c.primary }} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: c.primary }}>Seção 2 — Marketing</p>
            <h2 className="font-bold text-xl text-gray-900">Plano de Marketing Imobiliário</h2>
          </div>
        </div>
        <img src={avamaxLogo} alt="AvaMax" className="h-9 w-auto" />
      </header>

      <div className="relative z-10 px-8 py-4 flex-1 flex flex-col gap-4">
        <p className="text-xs text-gray-500 max-w-xl">
          Estratégia completa para posicionar seu imóvel com máxima visibilidade e atrair compradores qualificados.
        </p>

        {/* 3x2 Marketing strategies grid */}
        <div>
          <h3 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
            <Target size={14} style={{ color: c.secondary }} /> Estratégia de Divulgação
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Camera, title: 'Produção Visual', desc: 'Fotos profissionais, vídeos 4K, tour virtual 360° e drone.' },
              { icon: Globe, title: 'Portais e Redes', desc: 'Maiores portais imobiliários e campanhas em redes sociais.' },
              { icon: Users, title: 'Network RE/MAX', desc: 'Divulgação para toda a rede com milhares de parceiros.' },
              { icon: Search, title: 'SEO & Google Ads', desc: 'Otimização para buscadores e mídia paga segmentada.' },
              { icon: Eye, title: 'Placa e Open House', desc: 'Sinalização profissional e eventos exclusivos de visitação.' },
              { icon: BarChart3, title: 'Relatórios', desc: 'Métricas semanais de visualizações, leads e visitas.' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-gray-200 bg-white flex gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.secondary}10` }}>
                  <item.icon size={16} style={{ color: c.secondary }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 mb-0.5">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Pilares (4 cols) + Parcerias side by side */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          {/* Pilares */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
              <Zap size={14} style={{ color: c.primary }} /> Pilares Estratégicos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { n: '01', title: 'Precificação', desc: 'Análise comparativa para o preço ideal.' },
                { n: '02', title: 'Exposição', desc: 'Máxima visibilidade nos canais certos.' },
                { n: '03', title: 'Negociação', desc: 'Técnicas para maximizar o valor.' },
                { n: '04', title: 'Fechamento', desc: 'Suporte jurídico até a assinatura.' },
              ].map((p, i) => (
                <div key={i} className="p-3 rounded-lg text-center" style={{ backgroundColor: `${c.primary}06`, border: `1px solid ${c.primary}15` }}>
                  <p className="font-bold text-xl mb-0.5" style={{ color: c.primary }}>{p.n}</p>
                  <p className="font-semibold text-xs text-gray-900 mb-0.5">{p.title}</p>
                  <p className="text-[10px] text-gray-500 leading-snug">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Parcerias */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
              <Handshake size={14} style={{ color: c.secondary }} /> Parcerias com o Mercado
            </h3>
            <div className="rounded-xl p-4 border border-gray-200 bg-gray-50 h-[calc(100%-28px)] flex flex-col justify-between">
              <p className="text-xs text-gray-600 leading-relaxed">
                Trabalhamos em parceria com todo o mercado imobiliário. Nosso modelo colaborativo
                permite que <strong>qualquer corretor traga compradores</strong> para seu imóvel,
                multiplicando as chances de venda com comissão compartilhada.
              </p>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {[
                  { val: '100%', label: 'Parcerias abertas' },
                  { val: '50/50', label: 'Divisão de comissão' },
                  { val: '3x', label: 'Mais visitas' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-2 rounded-lg bg-white border border-gray-200">
                    <p className="font-bold text-base" style={{ color: c.primary }}>{s.val}</p>
                    <p className="text-[9px] text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 px-8 py-3 border-t border-gray-200 flex justify-between items-center mt-auto">
        <p className="text-gray-400 text-xs">AvaMax • Estudo de Mercado</p>
        <p className="text-gray-400 text-xs">{String(pageStart).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};
