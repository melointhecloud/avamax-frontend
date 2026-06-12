import { useCallback, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

interface UsePdfGeneratorReturn {
  isGenerating: boolean
  generatePdf: (element: HTMLElement, filename: string) => Promise<void>
}

export const usePdfGenerator = (): UsePdfGeneratorReturn => {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePdf = useCallback(async (element: HTMLElement, filename: string) => {
    if (isGenerating) return
    
    setIsGenerating(true)
    
    try {
      // A4 dimensions in mm
      const pdfWidth = 210
      const pdfHeight = 297
      
      // Detectar dispositivo móvel/baixa memória para ajustar scale
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isLowMemory = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4
      
      // Scale adaptativo: reduz em dispositivos móveis para evitar travamento por memória
      const scale = (isMobile || isLowMemory) ? 1.5 : 2
      
      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#0A1628', // Match PDF background
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      
      // Calculate dimensions
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // Calculate number of pages needed
      const pageHeightPx = (pdfHeight / pdfWidth) * imgWidth
      const totalPages = Math.ceil(imgHeight / pageHeightPx)
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      
      // Add each page
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage()
        }
        
        // Calculate source coordinates for this page
        const sourceY = page * pageHeightPx
        const sourceHeight = Math.min(pageHeightPx, imgHeight - sourceY)
        
        // Create a temporary canvas for this page section
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = imgWidth
        pageCanvas.height = sourceHeight
        
        const ctx = pageCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY, imgWidth, sourceHeight,
            0, 0, imgWidth, sourceHeight
          )
          
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92)
          const destHeight = (sourceHeight / imgWidth) * pdfWidth
          
          pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, destHeight)
        }
      }
      
      // Download universal via Blob (evita problemas com window.open/pop-ups)
      const pdfBlob = pdf.output('blob')
      const blobUrl = URL.createObjectURL(pdfBlob)
      
      // Detectar iOS (Safari) que não suporta download attribute
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      
      if (isIOS) {
        // iOS: redireciona para o blob diretamente
        // Isso abre o PDF no navegador, permitindo ao usuário salvar via compartilhar
        window.location.href = blobUrl
        toast.success('PDF aberto! Toque no ícone de compartilhar para salvar.', { duration: 6000 })
      } else {
        // Outros navegadores: download direto via link
        const downloadLink = document.createElement('a')
        downloadLink.href = blobUrl
        downloadLink.download = `${filename}.pdf`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        toast.success('PDF baixado com sucesso!')
      }
      
      // Libera a URL do blob após delay maior para estabilidade
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF')
    } finally {
      setIsGenerating(false)
    }
  }, [isGenerating])

  return {
    isGenerating,
    generatePdf,
  }
}
