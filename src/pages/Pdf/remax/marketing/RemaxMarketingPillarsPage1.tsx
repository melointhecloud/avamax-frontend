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

export const RemaxMarketingPillarsPage1: React.FC<Props> = ({ colors: c, broker, page, totalPages, isRental = false }) => {
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

      <div className="relative z-10 p-8 flex-1 flex flex-col gap-4">
        {/* Pilar 1 */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Scale size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full">01</span>
                <h4 className="text-gray-900 font-bold text-lg">Precificação Inteligente</h4>
              </div>
              <p className="text-gray-500 text-base leading-relaxed mb-3">
               A precificação correta é o fundamento de qualquer {isRental ? 'locação' : 'venda'} bem-sucedida. Utilizamos 
                análise de dados de mercado para posicionar o imóvel de forma competitiva.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} className="text-green-600" />
                  <span>Análise de comparativos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} className="text-green-600" />
                  <span>Faixas de preço estratégicas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pilar 2 */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Palette size={24} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-2 py-0.5 rounded-full">02</span>
                <h4 className="text-gray-900 font-bold text-lg">Conteúdo e Apresentação</h4>
              </div>
              <p className="text-gray-500 text-base leading-relaxed mb-3">
                A primeira impressão é decisiva. Investimos em produção visual de alto padrão 
                e narrativa que destaca os diferenciais do imóvel.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} className="text-purple-600" />
                  <span>Fotos e vídeos profissionais</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} className="text-purple-600" />
                  <span>Tour virtual 360°</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pilar 3 */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.secondary}10` }}>
              <Users size={24} style={{ color: c.secondary }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${c.secondary}15`, color: c.secondary }}>03</span>
                <h4 className="text-gray-900 font-bold text-lg">Experiência do Cliente</h4>
              </div>
              <p className="text-gray-500 text-base leading-relaxed mb-3">
                Cada interação com o {isRental ? 'inquilino' : 'comprador'} é uma oportunidade de encantar. Criamos 
                experiências memoráveis em todas as etapas do processo.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} style={{ color: c.secondary }} />
                  <span>Visitas personalizadas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={12} style={{ color: c.secondary }} />
                  <span>Atendimento consultivo</span>
                </div>
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