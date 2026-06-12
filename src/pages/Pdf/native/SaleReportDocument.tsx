/**
 * Documento PDF Nativo - Relatório de Venda
 * 
 * Este é o documento principal que compõe todas as páginas do relatório.
 * Usa @react-pdf/renderer para gerar PDF nativo sem html2canvas.
 */

import React from 'react';
import { Document } from '@react-pdf/renderer';
import { ReportProps } from '../../../lib/pdf/types';
import { DEFAULT_COLORS, PdfColorScheme } from '../../../lib/pdf/tokens';
import { CoverPage } from './CoverPage';
import { MethodologyPage } from './MethodologyPage';
import { ConclusionPage } from './ConclusionPage';
import { IntroPage, PillarsPage, FunnelPage, BenefitsPage } from './marketing';

interface SaleReportDocumentProps extends ReportProps {
  // Podemos adicionar props específicas do documento aqui
}

export const SaleReportDocument: React.FC<SaleReportDocumentProps> = ({
  clientName = 'Cliente Avaluz',
  client,
  property,
  market,
  broker,
  settings = { showMinimo: true, showMaximo: true },
}) => {
  // Cores do PDF (usa customizadas ou padrão)
  const colors: PdfColorScheme = settings.pdfColors || DEFAULT_COLORS;
  
  // Configurações de marketing
  const showMarketing = settings.showMarketingPlan !== false;
  const mp = settings.marketingPlan || {};
  const showIntroduction = showMarketing && mp.introduction?.enabled !== false;
  const showPillars = showMarketing && mp.pillars?.enabled !== false;
  const showFunnel = showMarketing && mp.funnel?.enabled !== false;
  const showBenefits = showMarketing && mp.benefits?.enabled !== false;
  
  // Cálculo de páginas de marketing
  const marketingPageCount = showMarketing 
    ? (showIntroduction ? 1 : 0) + (showPillars ? 2 : 0) + (showFunnel ? 1 : 0) + (showBenefits ? 1 : 0)
    : 0;
  
  const samplesToShow = market.similares.slice(0, 6);
  const tablePages = Math.ceil(samplesToShow.length / 6) || 1;
  
  // Páginas base: capa + metodologia + conclusão = 3
  // + marketing pages + table pages + sample pages
  const basePages = 3;
  const totalPages = basePages + marketingPageCount + tablePages + samplesToShow.length;

  // Controle de número de página
  let currentPage = 1;

  return (
    <Document
      title={`Avaliação - ${property.bairro}, ${property.municipio}`}
      author={broker?.nome || 'Avaluz'}
      subject="Estudo de Valor de Mercado"
      creator="Avaluz - Sistema de Avaliação Imobiliária"
    >
      {/* Página 1: Capa */}
      <CoverPage
        property={property}
        broker={broker}
        client={client}
        clientName={clientName}
        market={market}
        settings={settings}
        colors={colors}
        pageNumber={currentPage++}
        totalPages={totalPages}
      />
      
      {/* Página 2: Metodologia */}
      <MethodologyPage
        broker={broker}
        colors={colors}
        pageNumber={currentPage++}
        totalPages={totalPages}
      />

      {/* === PÁGINAS DE MARKETING (CONDICIONAIS) === */}
      
      {/* Introdução ao Plano de Marketing */}
      {showIntroduction && (
        <IntroPage
          broker={broker}
          property={property}
          colors={colors}
          pageNumber={currentPage++}
          totalPages={totalPages}
        />
      )}

      {/* Pilares Estratégicos - Página 1 (1-3) */}
      {showPillars && (
        <PillarsPage
          broker={broker}
          colors={colors}
          pageNumber={currentPage++}
          totalPages={totalPages}
          pillarSet="first"
        />
      )}

      {/* Pilares Estratégicos - Página 2 (4-6) */}
      {showPillars && (
        <PillarsPage
          broker={broker}
          colors={colors}
          pageNumber={currentPage++}
          totalPages={totalPages}
          pillarSet="second"
        />
      )}

      {/* Funil de Vendas */}
      {showFunnel && (
        <FunnelPage
          broker={broker}
          colors={colors}
          pageNumber={currentPage++}
          totalPages={totalPages}
        />
      )}

      {/* Benefícios */}
      {showBenefits && (
        <BenefitsPage
          broker={broker}
          colors={colors}
          pageNumber={currentPage++}
          totalPages={totalPages}
        />
      )}

      {/* 
        TODO: Próximas fases de implementação:
        
        Fase 4 (Dados):
        - PropertyPage (ficha do imóvel)
        - DiagnosisPage (gráfico de comparação)
        - ComparativeTablePage
        - SamplePage (loop para cada amostra)
      */}

      {/* Página Final: Conclusão */}
      <ConclusionPage
        property={property}
        broker={broker}
        market={market}
        settings={settings}
        colors={colors}
        pageNumber={totalPages}
        totalPages={totalPages}
      />
    </Document>
  );
};

export default SaleReportDocument;
