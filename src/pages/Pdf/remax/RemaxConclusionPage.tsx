import React from 'react';
import { CheckCircle2, Award, Phone, Mail, User, Building2 } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors, RemaxReportProps } from './types';

interface ConclusionPageProps {
  colors: RemaxColors;
  property: RemaxReportProps['property'];
  market: RemaxReportProps['market'];
  broker?: RemaxReportProps['broker'];
  page: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxConclusionPage: React.FC<ConclusionPageProps> = ({
  colors: c, property, market, broker, page, totalPages, isRental = false,
}) => {
  const fmtMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const brokerPhone = broker?.telefone_custom || broker?.telefone;
  const brokerEmail = broker?.email_custom || broker?.email;
  const confiancaDisplay = market.confianca < 1 ? Math.round(market.confianca * 100) : Math.round(market.confianca);

  return (
    <div className="w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white">
      <header className="relative z-10 px-10 pt-8 pb-4 flex justify-between items-start border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
              <CheckCircle2 size={14} style={{ color: c.primary }} />
            </div>
            <p className="text-xs tracking-widest uppercase" style={{ color: c.primary }}>SEÇÃO 4 - CONCLUSÃO</p>
          </div>
          <h2 className="font-bold text-2xl text-gray-900">Conclusão e Parecer</h2>
        </div>
        <img src={avamaxLogo} alt="AvaMax" className="h-10 w-auto" />
      </header>

      <div className="relative z-10 px-10 py-8 flex-1">
        {/* Value Result */}
        <div className="rounded-2xl p-6 mb-6 text-center" style={{ backgroundColor: `${c.primary}06`, border: `2px solid ${c.primary}20` }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: c.primary }}>{isRental ? 'Aluguel Estimado' : 'Valor de Mercado Estimado'}</p>
          <p className="font-bold text-4xl text-gray-900 mb-1">{fmtMoney(market.valor_estimado)}</p>
          <p className="text-sm text-gray-500">
            Faixa: {fmtMoney(market.minimo)} — {fmtMoney(market.maximo)}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="px-4 py-2 rounded-full text-xs font-medium" style={{ backgroundColor: `${c.secondary}10`, color: c.secondary }}>
              {confiancaDisplay}% de confiança
            </div>
            <div className="px-4 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {market.amostras} amostras analisadas
            </div>
          </div>
        </div>

        {/* Strategy Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: isRental ? 'Valor de Aluguel' : 'Valor de Mercado', value: fmtMoney(market.valor_estimado), desc: isRental ? 'Preço ideal para atrair inquilinos qualificados.' : 'Preço ideal para atrair compradores qualificados.', color: c.primary },
            { label: 'Valor Conservador', value: fmtMoney(market.minimo), desc: isRental ? 'Para locação rápida com alta competitividade.' : 'Para venda rápida com alta competitividade.', color: c.secondary },
            { label: 'Valor Otimista', value: fmtMoney(market.maximo), desc: 'Para testar o teto do mercado com paciência.', color: '#16a34a' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: s.color }}>{s.label}</p>
              <p className="font-bold text-lg text-gray-900 mb-1">{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Parecer */}
        <div className="rounded-xl p-5 bg-gray-50 border border-gray-200 mb-6">
          <h3 className="font-bold text-sm text-gray-900 mb-2">Parecer Técnico</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Com base na análise de {market.amostras} imóveis comparáveis na região de <strong>{property.bairro}</strong>, 
            {property.municipio} - {property.estado}, e considerando as características do imóvel avaliado 
            ({property.area}m², {property.quartos} quartos, {property.tipo}), 
            o valor de {isRental ? 'aluguel estimado' : 'mercado estimado'} é de <strong>{fmtMoney(market.valor_estimado)}</strong>, 
            com nível de confiança de {confiancaDisplay}%. Este estudo tem caráter orientativo e não substitui 
            laudo de avaliação oficial para fins jurídicos ou financeiros.
          </p>
        </div>

        {/* Broker Signature */}
        {broker && (
          <div className="rounded-2xl p-5" style={{ backgroundColor: `${c.primary}06`, border: `2px solid ${c.primary}15` }}>
            <div className="flex gap-6 items-center">
              {/* Agency */}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ borderColor: `${c.primary}30`, backgroundColor: 'white' }}>
                  {broker.logo_imobiliaria_url ? (
                    <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Building2 size={28} style={{ color: c.primary }} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: c.primary }}>Imobiliária</p>
                  <h3 className="font-bold text-sm text-gray-900">{broker.imobiliaria || 'RE/MAX'}</h3>
                </div>
              </div>

              <div className="w-px h-14" style={{ backgroundColor: `${c.primary}20` }} />

              {/* Broker */}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ borderColor: `${c.primary}30`, backgroundColor: 'white' }}>
                  {broker.avatar_url ? (
                    <img src={broker.avatar_url} alt="" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <User size={28} style={{ color: c.primary }} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: c.primary }}>Corretor Responsável</p>
                  <h3 className="font-bold text-sm text-gray-900">{broker.nome || 'Especialista'}</h3>
                  {broker.creci && (
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Award size={10} style={{ color: c.primary }} />CRECI {broker.creci}</p>
                  )}
                  {brokerPhone && <p className="text-xs text-gray-600 flex items-center gap-1"><Phone size={9} style={{ color: c.primary }} />{brokerPhone}</p>}
                  {brokerEmail && <p className="text-xs text-gray-600 flex items-center gap-1"><Mail size={9} style={{ color: c.primary }} />{brokerEmail}</p>}
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="flex items-center gap-4 pt-4 mt-4 border-t" style={{ borderColor: `${c.primary}15` }}>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Data da Avaliação</p>
                <p className="font-medium text-sm text-gray-900">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="text-right">
                {broker?.signature_url ? (
                  <div className="flex flex-col items-end">
                    <div className="bg-white rounded px-2 py-1 border border-gray-200">
                      <img src={broker.signature_url} alt="Assinatura" className="h-10 w-auto object-contain max-w-36" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    </div>
                    <div className="w-40 border-b border-gray-300 mt-1" />
                    <p className="text-[10px] text-gray-400 mt-1">Assinatura do Corretor</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <div className="w-40 h-12 border-b-2 border-dashed" style={{ borderColor: `${c.primary}30` }} />
                    <p className="text-[10px] text-gray-400 mt-1">Assinatura do Corretor</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-10 py-4 border-t border-gray-200 mt-auto">
        <div className="flex items-center justify-between">
          <div>
            <img src={avamaxLogo} alt="AvaMax" className="h-8 w-auto mb-1" />
            <p className="text-gray-400 text-[10px] max-w-md">
              Este documento é um estudo de mercado para fins de orientação comercial. 
              Não substitui laudo de avaliação oficial para fins jurídicos ou financeiros.
            </p>
          </div>
          <p className="text-gray-400 text-xs">{String(page).padStart(2, '0')} / {totalPages}</p>
        </div>
      </footer>
    </div>
  );
};
