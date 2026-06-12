import React from 'react';
import { Sparkles, FileText, Target, TrendingUp, Shield, User } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from '../types';

interface Props {
  colors: RemaxColors;
  property: { bairro: string; municipio: string };
  broker?: { nome: string | null; avatar_url: string | null; logo_imobiliaria_url?: string | null; imobiliaria?: string | null };
  page: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxMarketingIntroPageLandscape: React.FC<Props> = ({ colors: c, property, broker, page, totalPages }) => {
  const pageClass = "w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  return (
    <div className={pageClass}>
      <header className="relative z-10 px-8 pt-5 pb-3 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
            <Sparkles size={16} style={{ color: c.primary }} />
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase" style={{ color: c.primary }}>Estratégia Personalizada</p>
            <h2 className="font-bold text-2xl text-gray-900">Plano de Marketing Imobiliário</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {broker?.logo_imobiliaria_url && (
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-100 border flex-shrink-0" style={{ borderColor: `${c.primary}40` }}>
              <img src={broker.logo_imobiliaria_url} alt={broker.imobiliaria || ''} className="w-full h-full object-contain p-0.5" />
            </div>
          )}
          <img src={avamaxLogo} alt="AvaMax" className="h-9 w-auto" />
        </div>
      </header>

      <div className="relative z-10 px-8 py-4 flex-1 flex gap-6">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="rounded-2xl p-5 border flex-1" style={{ backgroundColor: `${c.primary}06`, borderColor: `${c.primary}20` }}>
            <h3 className="text-gray-900 font-bold text-xl mb-3 flex items-center gap-2">
              <FileText size={18} style={{ color: c.primary }} />
              O que é este Plano de Marketing?
            </h3>
            <p className="text-gray-600 text-base leading-relaxed mb-3">
              Este documento apresenta uma <span className="font-semibold" style={{ color: c.primary }}>estratégia estruturada e personalizada</span> para 
              a comercialização do seu imóvel, desenvolvida com base nas melhores práticas do mercado imobiliário.
            </p>
            <p className="text-gray-500 text-base leading-relaxed">
              Criado considerando as características específicas do seu imóvel e as dinâmicas atuais do mercado em <span className="text-gray-900 font-medium">{property.bairro}, {property.municipio}</span>.
            </p>
          </div>
          <div className="rounded-xl p-4 text-center border" style={{ backgroundColor: `${c.secondary}06`, borderColor: `${c.secondary}15` }}>
            <p className="text-gray-500 text-base italic">
              "Um imóvel bem posicionado e bem apresentado não vende por sorte — vende por estratégia."
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex-1">
            <h3 className="text-gray-900 font-bold text-xl mb-4 flex items-center gap-2">
              <Target size={18} style={{ color: c.secondary }} />
              Objetivo Estratégico
            </h3>
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              O objetivo central é <span className="font-semibold" style={{ color: c.primary }}>maximizar o valor percebido</span>, 
              <span className="font-semibold" style={{ color: c.primary }}> reduzir o tempo de venda</span> e 
              <span className="font-semibold" style={{ color: c.primary }}> gerar segurança</span> em todo o processo.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp size={18} className="text-green-600" />
                </div>
                <p className="text-gray-900 font-semibold text-sm mb-1">Posicionamento</p>
                <p className="text-gray-400 text-xs">Preço alinhado ao mercado</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${c.primary}10` }}>
                  <Shield size={18} style={{ color: c.primary }} />
                </div>
                <p className="text-gray-900 font-semibold text-sm mb-1">Preservação</p>
                <p className="text-gray-400 text-xs">Evitar desvalorização</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${c.secondary}10` }}>
                  <User size={18} style={{ color: c.secondary }} />
                </div>
                <p className="text-gray-900 font-semibold text-sm mb-1">Demanda</p>
                <p className="text-gray-400 text-xs">Compradores qualificados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 px-8 py-3 border-t border-gray-200 flex justify-between items-center mt-auto">
        <p className="text-gray-400 text-sm">AvaMax • Plano de Marketing</p>
        <p className="text-gray-400 text-sm">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};