/**
 * Adapter para converter reportData (formato html2canvas) para novo formato @react-pdf/renderer
 * ATUALIZADO: Agora converte imagens para Base64 para evitar erros de DataView
 */

import type { PropertyData, MarketData, BrokerData, SampleData } from '../types';
import { optimizeImageForPdf, convertImagesToBase64 } from '../utils/imageConverter';

export interface AdaptedPdfData {
    property: PropertyData;
    market: MarketData;
    broker?: BrokerData;
    samples: SampleData[];
    clientName: string;
}

/**
 * Converte reportData para formato do PDF, incluindo conversão de imagens para Base64
 * @param reportData - Dados do relatório no formato legado
 * @returns Dados adaptados com imagens em Base64
 */
export async function adaptReportDataToPdfFormat(reportData: any): Promise<AdaptedPdfData> {
    // Extrair dados do formato antigo
    const {
        property,
        broker,
        clientName = 'Cliente',
        market,
    } = reportData;

    // CORREÇÃO CRÍTICA: Buscar samples de múltiplas fontes possíveis
    // usePdfDownload coloca os dados em market.similares, não em samples
    const samples = reportData.samples || market?.similares || [];

    console.log('📊 Samples encontrados:', samples.length);

    // Coletar todas as URLs de imagens para converter em batch
    // Incluir imagem principal E array de imagens de cada sample
    const imageUrls: (string | undefined)[] = [
        property?.foto_capa || property?.imagem,
        broker?.avatar_url,
        broker?.logo_imobiliaria_url,
        // Todas as imagens principais e secundárias das amostras
        ...(samples || []).flatMap((s: any) => [
            s.imagem,
            ...(s.imagens || [])
        ]),
    ];

    console.log('🖼️ Convertendo imagens para Base64...', imageUrls.filter(Boolean).length, 'imagens');

    // Converter todas as imagens em paralelo
    const convertedImages = await convertImagesToBase64(imageUrls, 800); // Max 800KB por imagem

    // Distribuir imagens convertidas
    let imageIndex = 0;
    const propertyImage = convertedImages[imageIndex++];
    const brokerAvatar = convertedImages[imageIndex++];
    const brokerLogo = convertedImages[imageIndex++];

    // Processar imagens das amostras (principal + secundárias)
    const sampleImagesMap: { main: string | undefined; extras: string[] }[] = [];
    for (const sample of (samples || [])) {
        const mainImage = convertedImages[imageIndex++];
        const extrasCount = (sample.imagens || []).length;
        const extras = convertedImages.slice(imageIndex, imageIndex + extrasCount);
        imageIndex += extrasCount;
        sampleImagesMap.push({ main: mainImage, extras: extras.filter(Boolean) as string[] });
    }

    // Adaptar property
    const adaptedProperty: PropertyData = {
        tipo: property?.tipo || 'Imóvel',
        bairro: property?.bairro || '',
        municipio: property?.municipio || '',
        estado: property?.estado || '',
        rua: property?.rua || '',
        cep: property?.cep || '',
        area: property?.area || 0,
        quartos: property?.quartos || 0,
        suites: property?.suites || 0,
        banheiros: property?.banheiros || 0,
        vagas: property?.vagas || 0,
        condominio: property?.condominio || 0,
        iptu: property?.iptu || 0,
        aVenda: property?.aVenda ?? true,
        valor_atual: property?.valor_atual || property?.valor || 0,
        descricao: property?.descricao || '',
        foto_capa: propertyImage || undefined, // Base64 ou undefined
        features: property?.features || [],
        mobiliado: property?.mobiliado,
    };

    // Adaptar market
    const adaptedMarket: MarketData = {
        valor_estimado: market?.valor_estimado || 0,
        minimo: market?.minimo || 0,
        maximo: market?.maximo || 0,
        confianca: market?.confianca || 'Média',
        amostras: samples?.length || 0,
    };

    // Adaptar broker
    const adaptedBroker: BrokerData | undefined = broker ? {
        nome: broker.nome || '',
        creci: broker.creci || '',
        telefone: broker.telefone || '',
        email: broker.email || '',
        imobiliaria: broker.imobiliaria || '',
        telefone_imobiliaria: broker.telefone_imobiliaria || '',
        avatar_url: brokerAvatar || undefined, // Base64 ou undefined
        logo_imobiliaria_url: brokerLogo || undefined, // Base64 ou undefined
    } : undefined;

    // Adaptar samples com todas as imagens
    const adaptedSamples: SampleData[] = (samples || []).map((sample: any, index: number) => ({
        id: sample.id || String(index + 1),
        titulo: sample.titulo || `Amostra ${index + 1}`,
        descricao: sample.descricao || '',
        categoria: sample.categoria || sample.titulo || undefined,
        area: sample.area || 0,
        quartos: sample.quartos || 0,
        suites: sample.suites || 0,
        banheiros: sample.banheiros || 0,
        vagas: sample.vagas || 0,
        valor: sample.valor || 0,
        bairro: sample.bairro || '',
        municipio: sample.municipio || '',
        estado: sample.estado || '',
        status: sample.status || 'ativo',
        imagem: sampleImagesMap[index]?.main || undefined,
        imagens: sampleImagesMap[index]?.extras || [],
        link: sample.link || undefined,
    }));

    console.log('✅ Imagens convertidas com sucesso!');

    return {
        property: adaptedProperty,
        market: adaptedMarket,
        broker: adaptedBroker,
        samples: adaptedSamples,
        clientName,
    };
}

/**
 * Versão síncrona (sem conversão de imagens) - para compatibilidade
 * @deprecated Use adaptReportDataToPdfFormat (async) para incluir imagens
 */
export function adaptReportDataToPdfFormatSync(reportData: any): AdaptedPdfData {
    const {
        property,
        samples,
        broker,
        clientName = 'Cliente',
        market,
    } = reportData;

    const adaptedProperty: PropertyData = {
        tipo: property?.tipo || 'Imóvel',
        bairro: property?.bairro || '',
        municipio: property?.municipio || '',
        estado: property?.estado || '',
        rua: property?.rua || '',
        cep: property?.cep || '',
        area: property?.area || 0,
        quartos: property?.quartos || 0,
        suites: property?.suites || 0,
        banheiros: property?.banheiros || 0,
        vagas: property?.vagas || 0,
        condominio: property?.condominio || 0,
        iptu: property?.iptu || 0,
        aVenda: property?.aVenda ?? true,
        valor_atual: property?.valor_atual || property?.valor || 0,
        descricao: property?.descricao || '',
        foto_capa: undefined, // Sem imagens na versão sync
        features: property?.features || [],
        mobiliado: property?.mobiliado,
    };

    const adaptedMarket: MarketData = {
        valor_estimado: market?.valor_estimado || 0,
        minimo: market?.minimo || 0,
        maximo: market?.maximo || 0,
        confianca: market?.confianca || 'Média',
        amostras: samples?.length || 0,
    };

    const adaptedBroker: BrokerData | undefined = broker ? {
        nome: broker.nome || '',
        creci: broker.creci || '',
        telefone: broker.telefone || '',
        email: broker.email || '',
        imobiliaria: broker.imobiliaria || '',
        telefone_imobiliaria: broker.telefone_imobiliaria || '',
        avatar_url: undefined,
        logo_imobiliaria_url: undefined,
    } : undefined;

    const adaptedSamples: SampleData[] = (samples || []).map((sample: any, index: number) => ({
        id: sample.id || String(index + 1),
        titulo: sample.titulo || `Amostra ${index + 1}`,
        descricao: sample.descricao || '',
        area: sample.area || 0,
        quartos: sample.quartos || 0,
        suites: sample.suites || 0,
        banheiros: sample.banheiros || 0,
        vagas: sample.vagas || 0,
        valor: sample.valor || 0,
        bairro: sample.bairro || '',
        municipio: sample.municipio || '',
        estado: sample.estado || '',
        status: sample.status || 'ativo',
        imagem: undefined,
    }));

    return {
        property: adaptedProperty,
        market: adaptedMarket,
        broker: adaptedBroker,
        samples: adaptedSamples,
        clientName,
    };
}
