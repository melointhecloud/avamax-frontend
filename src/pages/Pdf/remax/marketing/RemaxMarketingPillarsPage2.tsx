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

export const RemaxMarketingPillarsPage2: React.FC<Props> = ({ colors: c, page, totalPages, isRental = false }) => {
  const pageClass = "w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  return (
    <div className={pageClass}>
      <header className="relative z-10 p-8 border-b border-gray-200 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
              <Layers size={16} style={{ color: c.primary }} />
            </div>
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: c.primary }}>Fundamentos</p>
          </div>
          <h2 className="text-gray-900 font-bold text-3xl">Pilares Estratégicos</h2>
        </div>
        <img src={avamaxLogo} alt="AvaMax" className="h-8 w-auto opacity-60" />
      </header>

      <div className="relative z-10 p-8 flex-1 flex flex-col gap-4">
        {/* Pilar 4 */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.primary}10` }}>
              <Target size={24} style={{ color: c.primary }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${c.primary}15`, color: c.primary }}>04</span>
                <h4 className="text-gray-900 font-bold text-lg">Publicidade Digital Segmentada</h4>
              </div>
              <p className="text-gray-500 text-base leading-relaxed mb-3">
                Campanhas estratégicas para alcançar {isRental ? 'inquilinos qualificados' : 'compradores qualificados'} nos canais 
                mais efetivos para o perfil do imóvel.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} style={{ color: c.primary }} />
                  <span>Google Ads e Meta Ads</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} style={{ color: c.primary }} />
                  <span>Retargeting inteligente</span>
                </div>
              </div>
              <div className="mt-3 rounded-lg p-2 border" style={{ backgroundColor: `${c.primary}06`, borderColor: `${c.primary}15` }}>
                <p className="text-xs font-medium" style={{ color: c.primary }}>
                  IMPACTO: Alcançar {isRental ? 'inquilinos certos' : 'compradores certos'}, no momento certo, com a mensagem certa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pilar 5 */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
              <Eye size={24} className="text-pink-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-pink-100 text-pink-700 text-[9px] font-bold px-2 py-0.5 rounded-full">05</span>
                <h4 className="text-gray-900 font-bold text-lg">Redes Sociais e Engajamento</h4>
              </div>
              <p className="text-gray-500 text-base leading-relaxed mb-3">
                Presença estratégica nas principais redes sociais para ampliar 
                a visibilidade e gerar interesse orgânico.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} className="text-pink-600" />
                  <span>Instagram e Facebook</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} className="text-pink-600" />
                  <span>Stories e Reels</span>
                </div>
              </div>
              <div className="mt-3 bg-pink-50 border border-pink-200 rounded-lg p-2">
                 <p className="text-pink-700 text-xs font-medium">
                   IMPACTO: Visibilidade massiva e engajamento com potenciais {isRental ? 'inquilinos' : 'compradores'}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pilar 6 */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
              <Users size={24} className="text-teal-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-teal-100 text-teal-700 text-[9px] font-bold px-2 py-0.5 rounded-full">06</span>
                <h4 className="text-gray-900 font-bold text-lg">Parcerias Estratégicas</h4>
              </div>
              <p className="text-gray-500 text-base leading-relaxed mb-3">
                Rede de parceiros e corretores para ampliar o alcance e acelerar 
                a comercialização do imóvel.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} className="text-teal-600" />
                  <span>Rede de corretores parceiros</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} className="text-teal-600" />
                  <span>Parcerias com imobiliárias</span>
                </div>
              </div>
              <div className="mt-3 bg-teal-50 border border-teal-200 rounded-lg p-2">
                 <p className="text-teal-700 text-xs font-medium">
                   IMPACTO: Multiplicar a exposição e acelerar o processo de {isRental ? 'locação' : 'venda'} com rede de parceiros.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 p-8 border-t border-gray-200 flex justify-between items-center">
        <p className="text-gray-400 text-xs">AvaMax • Plano de Marketing</p>
        <p className="text-gray-400 text-xs">{String(page).padStart(2, '0')} / {totalPages}</p>
      </footer>
    </div>
  );
};