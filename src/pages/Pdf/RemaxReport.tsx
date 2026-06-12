import React from 'react';
import { RemaxCoverPage } from './remax/RemaxCoverPage';
import { RemaxAboutPage } from './remax/RemaxAboutPage';
import { RemaxMarketingIntroPage } from './remax/marketing/RemaxMarketingIntroPage';
import { RemaxMarketingPillarsPage1 } from './remax/marketing/RemaxMarketingPillarsPage1';
import { RemaxMarketingPillarsPage2 } from './remax/marketing/RemaxMarketingPillarsPage2';
import { RemaxMarketingFunnelPage } from './remax/marketing/RemaxMarketingFunnelPage';
import { RemaxMarketingBenefitsPage } from './remax/marketing/RemaxMarketingBenefitsPage';
import { RemaxMarketThermometer } from './remax/RemaxMarketThermometer';
import { RemaxFeesPage } from './remax/RemaxFeesPage';
import { RemaxConclusionPage } from './remax/RemaxConclusionPage';
import { RemaxSamplePage } from './remax/RemaxSamplePage';
import { RemaxComparativeTablePage } from './remax/RemaxComparativeTablePage';
import { chunkSamples, REMAX_MAX_SAMPLE_PAGES, REMAX_SAMPLES_PER_TABLE_PAGE } from './remax/sampleUtils';
import { REMAX_COLORS } from './remax/types';
import type { RemaxReportProps } from './remax/types';
import { RemaxDarkThemeStyles } from '@/components/pdf/RemaxDarkThemeStyles';

export type { RemaxReportProps } from './remax/types';

export const RemaxReport: React.FC<RemaxReportProps> = (props) => {
  const {
    clientName = 'Cliente Avaluz',
    client,
    property,
    market,
    broker,
    settings = {},
    variant = 'full',
    darkMode = false,
    isRental = false,
  } = props;

  const c = REMAX_COLORS;
  const isQuick = variant === 'quick';
  const showClient = settings.showClient !== false;
  const showBrokerContact = settings.showBrokerContact !== false;

  const showMarketing = !isQuick && settings.showMarketingPlan !== false;
  const mp = settings.marketingPlan || {};
  const showIntroduction = showMarketing && mp.introduction?.enabled !== false;
  const showPillars = showMarketing && mp.pillars?.enabled !== false;
  const showFunnel = showMarketing && mp.funnel?.enabled !== false;
  const showBenefits = showMarketing && mp.benefits?.enabled !== false;

  const allSamples = market.similares || [];
  const samplesToShow = allSamples.slice(0, REMAX_MAX_SAMPLE_PAGES);
  const tableChunks = chunkSamples(allSamples, REMAX_SAMPLES_PER_TABLE_PAGE);
  const samplePages = samplesToShow.length;
  const tablePages = tableChunks.length;

  const marketingPageCount = showMarketing
    ? (showIntroduction ? 1 : 0) + (showPillars ? 2 : 0) + (showFunnel ? 1 : 0) + (showBenefits ? 1 : 0)
    : 0;

  const basePages = isQuick ? 3 : 5 + marketingPageCount;
  const totalPages = basePages + samplePages + tablePages;

  const aboutPage = 2;
  let nextPage = 3;
  const introPage = showIntroduction ? nextPage++ : 0;
  const pillars1Page = showPillars ? nextPage++ : 0;
  const pillars2Page = showPillars ? nextPage++ : 0;
  const funnelPage = showFunnel ? nextPage++ : 0;
  const benefitsPage = showBenefits ? nextPage++ : 0;

  const sampleStartPage = isQuick ? 2 : nextPage;
  const afterSamplesPage = sampleStartPage + samplePages;
  const thermometerPage = afterSamplesPage + tablePages;
  const conclusionPage = isQuick ? thermometerPage + 1 : thermometerPage + 1;
  const feesPage = isQuick ? 0 : conclusionPage + 1;

  return (
    <div className={`w-full py-10 font-inter flex flex-col items-center gap-8 print:p-0 print:gap-0 bg-gray-100 print:bg-white ${darkMode ? 'remax-dark' : ''}`}>
      {darkMode && <RemaxDarkThemeStyles />}
      
      <RemaxCoverPage
        property={property}
        market={market}
        broker={broker}
        client={client}
        clientName={clientName}
        colors={c}
        totalPages={totalPages}
        showClient={showClient}
        showBrokerContact={showBrokerContact}
        isRental={isRental}
      />

      {!isQuick && (
        <RemaxAboutPage
          colors={c}
          broker={broker}
          pageStart={aboutPage}
          totalPages={totalPages}
          isRental={isRental}
        />
      )}

      {showIntroduction && (
        <RemaxMarketingIntroPage
          colors={c}
          property={property}
          broker={broker}
          page={introPage}
          totalPages={totalPages}
          isRental={isRental}
        />
      )}

      {showPillars && (
        <>
          <RemaxMarketingPillarsPage1
            colors={c}
            broker={broker}
            page={pillars1Page}
            totalPages={totalPages}
            isRental={isRental}
          />
          <RemaxMarketingPillarsPage2
            colors={c}
            page={pillars2Page}
            totalPages={totalPages}
            isRental={isRental}
          />
        </>
      )}

      {showFunnel && (
        <RemaxMarketingFunnelPage
          colors={c}
          broker={broker}
          page={funnelPage}
          totalPages={totalPages}
          isRental={isRental}
        />
      )}

      {showBenefits && (
        <RemaxMarketingBenefitsPage
          colors={c}
          broker={broker}
          page={benefitsPage}
          totalPages={totalPages}
          isRental={isRental}
        />
      )}

      {samplesToShow.map((sample, index) => (
        <RemaxSamplePage
          key={`${sample.id}-${index}`}
          colors={c}
          sample={sample}
          sampleIndex={index}
          broker={broker}
          page={sampleStartPage + index}
          totalPages={totalPages}
          isRental={isRental}
        />
      ))}

      {tableChunks.map((chunk, index) => (
        <RemaxComparativeTablePage
          key={`table-${index}`}
          colors={c}
          property={property}
          market={market}
          samples={chunk}
          chunkIndex={index}
          totalChunks={tableChunks.length}
          broker={broker}
          page={afterSamplesPage + index}
          totalPages={totalPages}
          isRental={isRental}
        />
      ))}

      <RemaxMarketThermometer
        colors={c}
        property={property}
        market={market}
        page={thermometerPage}
        totalPages={totalPages}
        isRental={isRental}
      />

      <RemaxConclusionPage
        colors={c}
        property={property}
        market={market}
        broker={broker}
        page={conclusionPage}
        totalPages={totalPages}
        isRental={isRental}
      />

      {!isQuick && (
        <RemaxFeesPage
          colors={c}
          market={market}
          page={feesPage}
          totalPages={totalPages}
          isRental={isRental}
        />
      )}
    </div>
  );
};
