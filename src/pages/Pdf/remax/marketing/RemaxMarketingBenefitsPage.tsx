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

export const RemaxMarketingBenefitsPage: React.FC<Props> = ({ colors: c, broker, page, totalPages, isRental = false }) => {
  const pageClass = "w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white";

  return (
    <div className={pageClass}>
      <header className="relative z-10 p-8 border-b border-gray-200 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
              <Star size={16} style={{ color: c.primary }} />
            </div>
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: c.primary }}>Vantagens Exclusivas</p>
          </div>
          <h2 className="text-gray-900 font-bold text-3xl">Benefícios para o Proprietário</h2>
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
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { icon: Eye, title: 'Transparência Total', desc: 'Relatórios periódicos com todas as ações realizadas, visualizações, contatos recebidos e feedbacks de visitas.', iconColor: 'text-green-600', iconBg: 'bg-green-50' },
            { icon: Shield, title: 'Segurança Jurídica', desc: 'Suporte na análise documental e acompanhamento em todas as etapas da transação até o fechamento.', iconColor: '', iconBg: '', useAccent: true },
            { icon: User, title: 'Visibilidade Qualificada', desc: `Seu imóvel exposto para ${isRental ? 'inquilinos' : 'compradores'} com real interesse e capacidade financeira para a ${isRental ? 'locação' : 'aquisição'}.`, iconColor: '', iconBg: '', useSecondary: true },
            { icon: BarChart3, title: 'Controle do Processo', desc: 'Acompanhamento em tempo real do status da comercialização com métricas claras e objetivas.', iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
            { icon: Crown, title: 'Único Representante no Mercado', desc: 'Dedicação exclusiva ao seu imóvel, sem conflitos de interesse. Um único profissional focado em alcançar o melhor resultado para você.', iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
          ].map((b, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${b.iconBg}`}
                  style={b.useAccent ? { backgroundColor: `${c.primary}10` } : b.useSecondary ? { backgroundColor: `${c.secondary}10` } : undefined}>
                  <b.icon size={18} className={b.iconColor}
                    style={b.useAccent ? { color: c.primary } : b.useSecondary ? { color: c.secondary } : undefined} />
                </div>
                <h4 className="text-gray-900 font-semibold text-base">{b.title}</h4>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                <Database size={18} className="text-teal-600" />
              </div>
              <h4 className="text-gray-900 font-semibold text-base">Decisões Baseadas em Dados</h4>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Todas as recomendações são fundamentadas em análises de mercado reais, 
              comparativos de vendas e tendências da região. Nada de achismos.
            </p>
          </div>
        </div>

        {/* Compromisso */}
        <div className="rounded-2xl p-6 flex-1 border-2" style={{ backgroundColor: `${c.primary}06`, borderColor: `${c.primary}30` }}>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.primary}15` }}>
              <Sparkles size={28} style={{ color: c.primary }} />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold text-xl mb-3">Compromisso com Resultados</h4>
              <p className="text-gray-600 text-base leading-relaxed mb-3">
                Este plano não é apenas uma lista de tarefas — é uma <span className="font-semibold" style={{ color: c.primary }}>estratégia 
                completa de proteção do seu patrimônio</span>. Nosso objetivo vai além da venda: 
                 buscamos garantir que você obtenha o <span className="font-semibold" style={{ color: c.primary }}>melhor valor possível</span>, 
                no <span className="font-semibold" style={{ color: c.primary }}>menor tempo</span>, e com total <span className="font-semibold" style={{ color: c.primary }}>segurança</span>.
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-3">
                Com método, inteligência de dados e acompanhamento profissional, transformamos o processo 
                de {isRental ? 'locação' : 'venda'} em uma experiência controlada e previsível — onde cada etapa tem propósito 
                e cada decisão é fundamentada.
              </p>
              <p className="font-semibold text-base italic" style={{ color: c.primary }}>
                "Porque seu imóvel merece mais do que ser anunciado — merece ser estrategicamente posicionado para {isRental ? 'alugar' : 'vender'}."
              </p>
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