import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { AvaluzPdfDocument } from '../components/pdf';
import type { PropertyData, MarketData, BrokerData, SampleData } from '../components/pdf';
import { adaptReportDataToPdfFormat } from '../components/pdf/adapters/reportDataAdapter';

/**
 * Página de teste para validar a geração de PDF com @react-pdf/renderer
 * VERSÃO COM IMAGENS EXTERNAS - para testar conversão Base64
 */
export const TestPdfGeneration: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [conversionLog, setConversionLog] = useState<string[]>([]);

    // Dados de teste - COM IMAGENS EXTERNAS
    const testReportData = {
        property: {
            tipo: 'Apartamento',
            bairro: 'Leblon',
            municipio: 'Rio de Janeiro',
            estado: 'RJ',
            cep: '22430-060',
            rua: 'Rua General Urquiza',
            area: 120,
            quartos: 3,
            suites: 2,
            banheiros: 3,
            vagas: 2,
            condominio: 1500,
            iptu: 3000,
            aVenda: true,
            valor_atual: 2500000,
            descricao: 'Apartamento de alto padrão em localização privilegiada com acabamentos de primeira linha. Vista mar parcial, varanda gourmet e duas vagas lado a lado.',
            foto_capa: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            features: [
                'Varanda gourmet',
                'Vista mar',
                'Duas vagas cobertas',
                'Piscina no condomínio',
                'Academia completa',
                'Salão de festas',
            ],
            mobiliado: 'parcial',
        },
        market: {
            valor_estimado: 2450000,
            minimo: 2200000,
            maximo: 2700000,
            confianca: 'Alta',
            amostras: 12,
        },
        broker: {
            nome: 'João Silva',
            creci: '12345-RJ',
            telefone: '(21) 98765-4321',
            email: 'joao@imobiliaria.com',
            imobiliaria: 'Imobiliária Premium',
            telefone_imobiliaria: '(21) 3333-4444',
            avatar_url: 'https://i.pravatar.cc/150?img=12',
            logo_imobiliaria_url: 'https://i.pravatar.cc/200?img=50',
        },
        samples: [
            {
                id: '1',
                titulo: 'Apartamento 3 quartos - Leblon',
                descricao: 'Excelente apartamento com vista panorâmica',
                area: 115,
                quartos: 3,
                suites: 1,
                banheiros: 2,
                vagas: 2,
                valor: 2400000,
                bairro: 'Leblon',
                municipio: 'Rio de Janeiro',
                estado: 'RJ',
                status: 'ativo' as const,
                imagem: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
            },
            {
                id: '2',
                titulo: 'Cobertura Duplex - Leblon',
                descricao: 'Cobertura duplex com piscina privativa',
                area: 130,
                quartos: 3,
                suites: 2,
                banheiros: 3,
                vagas: 3,
                valor: 2800000,
                bairro: 'Leblon',
                municipio: 'Rio de Janeiro',
                estado: 'RJ',
                status: 'vendido' as const,
                imagem: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600',
            },
            {
                id: '3',
                titulo: 'Apartamento Reformado - Leblon',
                descricao: 'Totalmente reformado com móveis planejados',
                area: 110,
                quartos: 3,
                suites: 1,
                banheiros: 2,
                vagas: 1,
                valor: 2300000,
                bairro: 'Leblon',
                municipio: 'Rio de Janeiro',
                estado: 'RJ',
                status: 'ativo' as const,
                imagem: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
            },
        ],
        clientName: 'Cliente Teste',
    };

    const handleGeneratePdf = async () => {
        setIsGenerating(true);
        setError(null);
        setPdfUrl(null);
        setConversionLog([]);

        try {
            // Log de início
            const log: string[] = [];
            log.push('🚀 Iniciando geração de PDF...');
            log.push(`📸 Imagens a converter: ${1 + 2 + testReportData.samples.length}`);
            setConversionLog([...log]);

            // Adaptar dados (converte imagens para Base64)
            log.push('🔄 Convertendo imagens para Base64...');
            setConversionLog([...log]);

            const adaptedData = await adaptReportDataToPdfFormat(testReportData);

            log.push('✅ Imagens convertidas com sucesso!');
            log.push(`📊 Propriedade: ${adaptedData.property.foto_capa ? 'COM imagem' : 'SEM imagem'}`);
            log.push(`👤 Corretor avatar: ${adaptedData.broker?.avatar_url ? 'COM imagem' : 'SEM imagem'}`);
            log.push(`🏢 Logo imobiliária: ${adaptedData.broker?.logo_imobiliaria_url ? 'COM imagem' : 'SEM imagem'}`);
            log.push(`🏠 Amostras com imagem: ${adaptedData.samples.filter(s => s.imagem).length}/${adaptedData.samples.length}`);
            setConversionLog([...log]);

            // Gerar PDF
            log.push('📄 Gerando PDF...');
            setConversionLog([...log]);

            const blob = await pdf(
                <AvaluzPdfDocument
                    property={adaptedData.property}
                    market={adaptedData.market}
                    broker={adaptedData.broker}
                    samples={adaptedData.samples}
                    clientName={adaptedData.clientName}
                    settings={{
                        showMinimo: true,
                        showMaximo: true,
                        showMarketingIntro: true,
                    }}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            setPdfUrl(url);

            log.push(`✅ PDF gerado com sucesso! Tamanho: ${(blob.size / 1024).toFixed(2)} KB`);
            setConversionLog([...log]);
        } catch (err: any) {
            console.error('Erro ao gerar PDF:', err);
            setError(err.message || 'Erro desconhecido');
            setConversionLog(prev => [...prev, `❌ ERRO: ${err.message}`]);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 shadow-2xl">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Teste PDF - COM IMAGENS
                    </h1>
                    <p className="text-slate-400 mb-8">
                        Testando conversão de imagens externas para Base64
                    </p>

                    <button
                        onClick={handleGeneratePdf}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mb-6"
                    >
                        {isGenerating ? '⏳ Gerando PDF...' : '✨ Gerar PDF (Com Imagens)'}
                    </button>

                    {/* Log de conversão */}
                    {conversionLog.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700">
                            <h3 className="text-sm font-semibold text-slate-300 mb-2">Log de Conversão:</h3>
                            <div className="space-y-1 font-mono text-xs">
                                {conversionLog.map((log, index) => (
                                    <div key={index} className="text-slate-400">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
                            <p className="text-red-400 font-semibold mb-1">❌ Erro:</p>
                            <p className="text-red-300 text-sm font-mono">{error}</p>
                        </div>
                    )}

                    {pdfUrl && (
                        <div className="space-y-4">
                            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4">
                                <p className="text-green-400 font-semibold">✅ PDF gerado com sucesso!</p>
                            </div>

                            <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700">
                                <iframe
                                    src={pdfUrl}
                                    className="w-full h-[600px]"
                                    title="PDF Preview"
                                />
                            </div>

                            <a
                                href={pdfUrl}
                                download="teste_pdf_com_imagens.pdf"
                                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl text-center transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                📥 Baixar PDF
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestPdfGeneration;
