import React from 'react';
import { Sparkles, FileText, Target, TrendingUp, Shield, User } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors } from '../types';

interface Props {
  colors: RemaxColors;
  property: { bairro: string; municipio: string };
  broker?: {
    nome: string | null;
    avatar_url: string | null;
    logo_imobiliaria_url?: string | null;
    imobiliaria?: string | null;
  };
  page: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxMarketingIntroPage: React.FC<Props> = ({ colors: c, property, broker, page, totalPages, isRental = false }) => {
  const pageClass = "w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  return (
    <div className={pageClass}>
      <header className="relative z-10 p-8 border-b border-gray-200 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
              <Sparkles size={16} style={{ color: c.primary }} />
            </div>
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: c.primary }}>Estratégia Personalizada</p>
          </div>
          <h2 className="text-gray-900 font-bold text-4xl">Plano de Marketing Imobiliário</h2>
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

      <div className="relative z-10 p-8 flex-1 flex flex-col">
        {/* O que é */}
        <div className="rounded-2xl p-6 mb-6 border" style={{ backgroundColor: `${c.primary}08`, borderColor: `${c.primary}25` }}>
          <h3 className="text-gray-900 font-bold text-xl mb-3 flex items-center gap-2">
            <FileText size={18} style={{ color: c.primary }} />
            O que é este Plano de Marketing?
          </h3>
          <p className="text-gray-600 text-base leading-relaxed mb-3">
            Este documento apresenta uma <span className="font-semibold" style={{ color: c.primary }}>estratégia estruturada e personalizada</span> para 
            a comercialização do seu imóvel, desenvolvida com base nas melhores práticas do mercado imobiliário 
            nacional e internacional.
          </p>
          <p className="text-gray-500 text-base leading-relaxed">
            Diferente de abordagens genéricas, este plano foi criado considerando as características específicas 
            do seu imóvel, o perfil de {isRental ? 'inquilinos' : 'compradores'} da região e as dinâmicas atuais do mercado em <span className="text-gray-900 font-medium">{property.bairro}, {property.municipio}</span>.
          </p>
        </div>

        {/* Objetivo Estratégico */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
          <h3 className="text-gray-900 font-bold text-xl mb-4 flex items-center gap-2">
            <Target size={18} style={{ color: c.secondary }} />
            Objetivo Estratégico
          </h3>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            O objetivo central deste plano é <span className="font-semibold" style={{ color: c.primary }}>maximizar o valor percebido do imóvel</span>, 
            <span className="font-semibold" style={{ color: c.primary }}> reduzir o tempo de {isRental ? 'locação' : 'venda'}</span> e 
            <span className="font-semibold" style={{ color: c.primary }}> gerar segurança</span> em todo o processo de comercialização.
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-2">
                <TrendingUp size={18} className="text-green-600" />
              </div>
              <p className="text-gray-900 font-semibold text-sm mb-1">Posicionamento Correto</p>
              <p className="text-gray-400 text-xs">Preço alinhado com o mercado atual</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${c.primary}10` }}>
                <Shield size={18} style={{ color: c.primary }} />
              </div>
              <p className="text-gray-900 font-semibold text-sm mb-1">Preservação de Valor</p>
              <p className="text-gray-400 text-xs">Evitar desvalorização por tempo</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-200">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${c.secondary}10` }}>
                <User size={18} style={{ color: c.secondary }} />
              </div>
              <p className="text-gray-900 font-semibold text-sm mb-1">Demanda Qualificada</p>
              <p className="text-gray-400 text-xs">Atrair {isRental ? 'inquilinos' : 'compradores'} com perfil ideal</p>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="rounded-xl p-4 text-center mt-auto border" style={{ backgroundColor: `${c.secondary}08`, borderColor: `${c.secondary}20` }}>
          <p className="text-gray-500 text-base italic">
            "Um imóvel bem posicionado e bem apresentado não vende por sorte — vende por estratégia."
          </p>
        </div>
      </div>

      <footer className="relative z-10 p-8 border-t border-gray-200 flex justify-between items-center">
        <p className="text-gray-400 text-xs">AvaMax • Plano de Marketing</p>
        <p className="text-gray-400 text-xs">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};