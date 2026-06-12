import React from 'react';
import { CheckCircle2, Award, Phone, Mail, User, Building2 } from 'lucide-react';
import avamaxLogo from '@/assets/avamax-brand.png';
import type { RemaxColors, RemaxReportProps } from '../types';

interface ConclusionPageLandscapeProps {
  colors: RemaxColors;
  property: RemaxReportProps['property'];
  market: RemaxReportProps['market'];
  broker?: RemaxReportProps['broker'];
  page: number;
  totalPages: number;
  isRental?: boolean;
}

export const RemaxConclusionPageLandscape: React.FC<ConclusionPageLandscapeProps> = ({
  colors: c, property, market, broker, page, totalPages,
}) => {
  const fmtMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const brokerPhone = broker?.telefone_custom || broker?.telefone;
  const brokerEmail = broker?.email_custom || broker?.email;
  const confiancaDisplay = market.confianca < 1 ? Math.round(market.confianca * 100) : Math.round(market.confianca);

  return (
    <div className="w-[297mm] h-[210mm] shadow-2xl relative flex flex-col overflow-hidden print:shadow-none page-break bg-white">
      <header className="relative z-10 px-8 pt-5 pb-3 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.primary}15` }}>
            <CheckCircle2 size={16} style={{ color: c.primary }} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: c.primary }}>SEÇÃO 4 - CONCLUSÃO</p>
            <h2 className="font-bold text-xl text-gray-900">Conclusão e Parecer</h2>
          </div>
        </div>
        <img src={avamaxLogo} alt="AvaMax" className="h-9 w-auto" />
      </header>

      <div className="relative z-10 px-8 py-4 flex-1 flex flex-col gap-4">
        {/* Value Result - hero horizontal */}
        <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: `${c.primary}06`, border: `2px solid ${c.primary}20` }}>
          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: c.primary }}>Valor de Mercado Estimado</p>
              <p className="font-bold text-4xl text-gray-900">{fmtMoney(market.valor_estimado)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Faixa: {fmtMoney(market.minimo)} — {fmtMoney(market.maximo)}
              </p>
            </div>
            <div className="w-px h-16 bg-gray-200" />
            <div className="flex gap-3">
              <div className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: `${c.secondary}10`, color: c.secondary }}>
                {confiancaDisplay}% confiança
              </div>
              <div className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {market.amostras} amostras
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Valor de Mercado', value: fmtMoney(market.valor_estimado), desc: 'Preço ideal para atrair compradores qualificados.', color: c.primary },
            { label: 'Valor Conservador', value: fmtMoney(market.minimo), desc: 'Para venda rápida com alta competitividade.', color: c.secondary },
            { label: 'Valor Otimista', value: fmtMoney(market.maximo), desc: 'Para testar o teto do mercado com paciência.', color: '#16a34a' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: s.color }}>{s.label}</p>
              <p className="font-bold text-2xl text-gray-900 mb-1">{s.value}</p>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Parecer + Broker Signature side by side */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          {/* Parecer */}
          <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
            <h3 className="font-bold text-sm text-gray-900 mb-2">Parecer Técnico</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Com base na análise de {market.amostras} imóveis comparáveis na região de <strong>{property.bairro}</strong>,
              {property.municipio} - {property.estado}, e considerando as características do imóvel avaliado
              ({property.area}m², {property.quartos} quartos, {property.tipo}),
              o valor de mercado estimado é de <strong>{fmtMoney(market.valor_estimado)}</strong>,
              com nível de confiança de {confiancaDisplay}%. Este estudo tem caráter orientativo e não substitui
              laudo de avaliação oficial para fins jurídicos ou financeiros.
            </p>
          </div>

          {/* Broker Signature */}
          {broker && (
            <div className="rounded-xl p-4" style={{ backgroundColor: `${c.primary}06`, border: `2px solid ${c.primary}15` }}>
              <div className="flex gap-4 items-center mb-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ borderColor: `${c.primary}30`, backgroundColor: 'white' }}>
                  {broker.logo_imobiliaria_url ? (
                    <img src={broker.logo_imobiliaria_url} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Building2 size={22} style={{ color: c.primary }} />
                    </div>
                  )}
                </div>
                <div className="w-px h-10" style={{ backgroundColor: `${c.primary}20` }} />
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ borderColor: `${c.primary}30`, backgroundColor: 'white' }}>
                  {broker.avatar_url ? (
                    <img src={broker.avatar_url} alt="" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <User size={22} style={{ color: c.primary }} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-gray-900">{broker.nome || 'Especialista'}</h3>
                  {broker.creci && <p className="text-xs text-gray-500 flex items-center gap-1"><Award size={9} style={{ color: c.primary }} />CRECI {broker.creci}</p>}
                  {brokerPhone && <p className="text-xs text-gray-600 flex items-center gap-1"><Phone size={9} style={{ color: c.primary }} />{brokerPhone}</p>}
                  {brokerEmail && <p className="text-xs text-gray-600 flex items-center gap-1"><Mail size={9} style={{ color: c.primary }} />{brokerEmail}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: `${c.primary}15` }}>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Data da Avaliação</p>
                  <p className="font-medium text-sm text-gray-900">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  {broker?.signature_url ? (
                    <div className="flex flex-col items-end">
                      <div className="bg-white rounded px-2 py-1 border border-gray-200">
                        <img src={broker.signature_url} alt="Assinatura" className="h-8 w-auto object-contain max-w-28" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                      </div>
                      <div className="w-32 border-b border-gray-300 mt-1" />
                      <p className="text-[9px] text-gray-400 mt-0.5">Assinatura</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <div className="w-32 h-8 border-b-2 border-dashed" style={{ borderColor: `${c.primary}30` }} />
                      <p className="text-[9px] text-gray-400 mt-0.5">Assinatura</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-3 border-t border-gray-200 mt-auto">
        <div className="flex items-center justify-between">
          <div>
            <img src={avamaxLogo} alt="AvaMax" className="h-7 w-auto mb-0.5" />
            <p className="text-gray-400 text-[9px] max-w-md">
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
