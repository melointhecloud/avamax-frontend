/**
 * Hook para geração de PDF Nativo (@react-pdf/renderer)
 * 
 * Este hook substitui o usePdfGenerator que usava html2canvas.
 * Gera PDFs nativos com 100% de fidelidade ao design.
 */

import React, { useCallback, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { ReportProps, ReportType } from '@/lib/pdf/types';
import SaleReportDocument from '@/pages/Pdf/native/SaleReportDocument';

interface UseNativePdfGeneratorReturn {
  isGenerating: boolean;
  progress: number;
  statusMessage: string;
  generatePdf: (reportData: ReportProps, filename: string, type?: ReportType) => Promise<void>;
}

export const useNativePdfGenerator = (): UseNativePdfGeneratorReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const generatePdf = useCallback(async (
    reportData: ReportProps, 
    filename: string,
    type: ReportType = 'sale'
  ) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setProgress(0);
    setStatusMessage('Iniciando geração do PDF...');
    
    try {
      // Fase 1: Preparar documento
      setProgress(10);
      setStatusMessage('Preparando documento...');
      
      // Selecionar o componente de documento correto baseado no tipo
      let DocumentComponent;
      switch (type) {
        case 'sale':
          DocumentComponent = SaleReportDocument;
          break;
        // TODO: Implementar outros tipos
        // case 'rental':
        //   DocumentComponent = RentalReportDocument;
        //   break;
        // case 'buyer':
        //   DocumentComponent = BuyerReportDocument;
        //   break;
        default:
          DocumentComponent = SaleReportDocument;
      }
      
      // Fase 2: Renderizar documento
      setProgress(30);
      setStatusMessage('Renderizando páginas...');
      
      // Fase 3: Gerar blob do PDF
      setProgress(60);
      setStatusMessage('Gerando arquivo PDF...');
      
      // Criar elemento React e passar para o renderer
      const documentElement = React.createElement(DocumentComponent, reportData);
      const blob = await pdf(documentElement as any).toBlob();
      
      // Fase 4: Download
      setProgress(90);
      setStatusMessage('Preparando download...');
      
      const blobUrl = URL.createObjectURL(blob);
      
      // Detectar iOS (Safari) que não suporta download attribute
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      
      if (isIOS) {
        // iOS: redireciona para o blob diretamente
        window.location.href = blobUrl;
        toast.success('PDF aberto! Toque no ícone de compartilhar para salvar.', { duration: 6000 });
      } else {
        // Outros navegadores: download direto via link
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = `${filename}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success('PDF baixado com sucesso!');
      }
      
      // Libera a URL do blob após delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      
      setProgress(100);
      setStatusMessage('Concluído!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF nativo:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      // Reset após pequeno delay para UX
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setStatusMessage('');
      }, 500);
    }
  }, [isGenerating]);

  return {
    isGenerating,
    progress,
    statusMessage,
    generatePdf,
  };
};

export default useNativePdfGenerator;
