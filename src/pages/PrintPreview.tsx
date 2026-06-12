import { useEffect, useState } from 'react';
import { AvaluzReport } from '@/pages/Pdf';
import { AvaluzRentalReport } from '@/pages/Pdf/AvaluzRentalReport';
import { RemaxReport } from '@/pages/Pdf/RemaxReport';

import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const PrintPreview = () => {
    const [reportData, setReportData] = useState<any>(null);
    const [reportType, setReportType] = useState<string>('venda');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const storedData: any = queryClient.getQueryData(['avaluz_print_data']);

            if (storedData) {
                setReportData(storedData.data);
                setReportType(storedData.type || 'venda');
                
                // Clear the query data to prevent memory leaks and ensure it dies quickly
                queryClient.removeQueries({ queryKey: ['avaluz_print_data'] });

                setTimeout(() => {
                    window.print();
                    // Optional: navigate back after printing window closes
                    // navigate(-1);
                }, 1000);
            } else {
                console.error("Dados de impressão ausentes na memória.");
                // navigate(-1); // Go back if no data
            }
        } catch (error) {
            console.error("Erro ao carregar dados para impressão:", error);
        }
    }, [queryClient, navigate]);

    if (!reportData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Carregando dados do relatório...</p>
            </div>
        );
    }

    const isRemax = reportType.startsWith('remax-');

    const renderReport = () => {
        if (isRemax) {
            return <RemaxReport {...reportData} />;
        }
        if (reportType === 'aluguel') {
            return <AvaluzRentalReport {...reportData} />;
        }
        return <AvaluzReport {...reportData} />;
    };

    return (
        <div className="print-container">
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
                .print-container {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                }
            `}</style>
            {renderReport()}
        </div>
    );
};

export default PrintPreview;
