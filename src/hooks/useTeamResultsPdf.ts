import { useRef, useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { useTeamAnalytics, AnalyticsPeriod } from './useTeamAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamLayoutData } from './useTeamLayoutData';

export type ReportPeriod = '7d' | '15d' | '30d';

export function useTeamResultsPdf(period: ReportPeriod) {
  const { data, isLoading } = useTeamAnalytics(period as AnalyticsPeriod);
  const { profile } = useAuth();
  const { data: teamData } = useTeamLayoutData();
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const downloadPdf = useCallback(async () => {
    const el = pdfRef.current;
    if (!el || isGenerating) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#0A1628',
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdfWidth = 210;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pageHeightPx = (297 / pdfWidth) * imgWidth;
      const totalPages = Math.ceil(imgHeight / pageHeightPx);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        const sourceY = page * pageHeightPx;
        const sourceHeight = Math.min(pageHeightPx, imgHeight - sourceY);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
          const pageImg = pageCanvas.toDataURL('image/jpeg', 0.92);
          pdf.addImage(pageImg, 'JPEG', 0, 0, pdfWidth, (sourceHeight / imgWidth) * pdfWidth);
        }
      }

      const periodLabel = period === '7d' ? '7dias' : period === '15d' ? '15dias' : '30dias';
      const teamName = teamData?.teamName || 'time';
      const filename = `relatorio-${teamName.toLowerCase().replace(/\s+/g, '-')}-${periodLabel}`;

      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

      if (isIOS) {
        window.location.href = url;
        toast.success('PDF aberto! Toque em compartilhar para salvar.', { duration: 6000 });
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Relatório PDF baixado!');
      }

      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (err) {
      console.error('Erro ao gerar relatório PDF:', err);
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, period, teamData]);

  return {
    pdfRef,
    data,
    isLoading,
    isGenerating,
    downloadPdf,
    teamName: teamData?.teamName || profile?.imobiliaria || 'Minha Imobiliária',
    brokerLogoUrl: profile?.logo_imobiliaria_url ?? null,
  };
}
