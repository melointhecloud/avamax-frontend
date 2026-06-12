import type { PropertyTypeConfig, PropertyType } from '../types/specifications'

export const propertyTypeChecklistConfig: PropertyTypeConfig[] = [
  {
    type: 'APARTAMENTO',
    label: 'Apartamento',
    groups: [
      {
        id: 'localizacao',
        title: 'Localização',
        items: [
          { id: 'bairro_valorizado', label: 'Bairro valorizado / boa localização' },
          { id: 'proximo_comercio_transporte', label: 'Próximo a comércio/transporte' },
        ],
      },
      {
        id: 'caracteristicas',
        title: 'Características',
        items: [
          { id: 'andar_alto', label: 'Andar alto' },
          { id: 'vista_livre', label: 'Vista livre' },
        ],
      },
      {
        id: 'predio',
        title: 'Prédio',
        items: [
          { id: 'possui_elevador', label: 'Possui elevador' },
          { id: 'portaria_24h', label: 'Portaria 24h' },
          { id: 'area_lazer', label: 'Área de lazer (piscina/academia/salão)' },
        ],
      },
      {
        id: 'estado',
        title: 'Estado',
        items: [
          { id: 'reformado', label: 'Reformado' },
          { id: 'acabamento_alto_padrao', label: 'Acabamento alto padrão' },
        ],
      },
      {
        id: 'extras',
        title: 'Extras',
        items: [
          {
            id: 'idade_predio_info',
            label: 'Informar idade do prédio',
            detailField: {
              id: 'idade_predio',
              label: 'Idade do prédio (anos)',
              type: 'number',
              placeholder: 'Ex: 10',
            },
          },
        ],
      },
    ],
  },
  {
    type: 'CASA',
    label: 'Casa',
    groups: [
      {
        id: 'terreno',
        title: 'Terreno',
        items: [
          { id: 'lote_plano', label: 'Lote plano' },
          { id: 'esquina', label: 'Esquina' },
          {
            id: 'tamanho_lote_info',
            label: 'Informar tamanho do lote',
            detailField: {
              id: 'tamanho_lote',
              label: 'Tamanho do lote (m²)',
              type: 'number',
              placeholder: 'Ex: 300',
            },
          },
        ],
      },
      {
        id: 'construcao',
        title: 'Construção',
        items: [
          { id: 'reformada', label: 'Reformada' },
          {
            id: 'ano_construcao_info',
            label: 'Informar ano da construção',
            detailField: {
              id: 'ano_construcao',
              label: 'Ano da construção',
              type: 'number',
              placeholder: 'Ex: 2010',
            },
          },
        ],
      },
      {
        id: 'extras',
        title: 'Extras',
        items: [
          { id: 'quintal', label: 'Quintal' },
          { id: 'area_gourmet', label: 'Área gourmet/churrasqueira' },
          { id: 'piscina', label: 'Piscina' },
        ],
      },
    ],
  },
  {
    type: 'COBERTURA',
    label: 'Cobertura',
    groups: [
      {
        id: 'exclusividade',
        title: 'Exclusividade',
        items: [
          { id: 'duplex', label: 'Duplex' },
          { id: 'triplex', label: 'Triplex' },
          { id: 'exclusividade_alta', label: 'Exclusividade alta (poucas coberturas no prédio)' },
        ],
      },
      {
        id: 'area_externa',
        title: 'Área Externa',
        items: [
          { id: 'terraco', label: 'Terraço' },
          { id: 'piscina_privativa', label: 'Piscina privativa' },
          { id: 'churrasqueira', label: 'Churrasqueira' },
        ],
      },
      {
        id: 'vista',
        title: 'Vista',
        items: [
          { id: 'vista_livre', label: 'Vista livre' },
          { id: 'vista_privilegiada', label: 'Vista privilegiada (mar/parque/skyline)' },
        ],
      },
      {
        id: 'predio',
        title: 'Prédio',
        items: [
          { id: 'elevador_ate_cobertura', label: 'Elevador até a cobertura' },
          { id: 'padrao_alto_edificio', label: 'Padrão alto do edifício' },
        ],
      },
    ],
  },
  {
    type: 'KITNET_STUDIO',
    label: 'Kitnet/Studio',
    groups: [
      {
        id: 'perfil_aluguel',
        title: 'Perfil de Aluguel',
        items: [
          { id: 'alta_demanda_aluguel', label: 'Região com alta demanda de aluguel' },
          { id: 'proximo_faculdade_hospital', label: 'Próximo a faculdade/hospital' },
        ],
      },
      {
        id: 'imovel',
        title: 'Imóvel',
        items: [
          { id: 'mobiliado', label: 'Mobiliado' },
        ],
      },
      {
        id: 'predio',
        title: 'Prédio',
        items: [
          { id: 'condominio_baixo', label: 'Condomínio baixo' },
          { id: 'predio_novo', label: 'Prédio novo' },
        ],
      },
    ],
  },
  {
    type: 'COMERCIAL',
    label: 'Comercial',
    groups: [
      {
        id: 'local',
        title: 'Local',
        items: [
          { id: 'rua_movimentada', label: 'Rua movimentada / região comercial consolidada' },
          { id: 'fachada_visivel', label: 'Fachada visível' },
          { id: 'vitrine', label: 'Vitrine' },
        ],
      },
      {
        id: 'uso',
        title: 'Uso',
        items: [
          { id: 'zoneamento_varias_atividades', label: 'Zoneamento permite várias atividades' },
        ],
      },
      {
        id: 'renda',
        title: 'Renda',
        items: [
          {
            id: 'esta_alugado',
            label: 'Está alugado',
            detailField: {
              id: 'aluguel_atual',
              label: 'Aluguel atual (R$)',
              type: 'number',
              placeholder: 'Ex: 3500',
            },
          },
        ],
      },
      {
        id: 'estrutura',
        title: 'Estrutura',
        items: [
          { id: 'pe_direito_alto', label: 'Pé-direito alto' },
          { id: 'acesso_facil', label: 'Acesso fácil' },
          { id: 'estacionamento', label: 'Estacionamento' },
        ],
      },
    ],
  },
  {
    type: 'TERRENO',
    label: 'Terreno',
    groups: [
      {
        id: 'localizacao',
        title: 'Localização',
        items: [
          { id: 'bairro_crescimento', label: 'Bairro em crescimento' },
          { id: 'infraestrutura_completa', label: 'Infraestrutura completa' },
        ],
      },
      {
        id: 'caracteristicas',
        title: 'Características',
        items: [
          { id: 'formato_regular', label: 'Formato regular' },
          {
            id: 'frente_testada_info',
            label: 'Informar frente/testada',
            detailField: {
              id: 'frente_testada',
              label: 'Frente/testada (m)',
              type: 'number',
              placeholder: 'Ex: 12',
            },
          },
        ],
      },
      {
        id: 'potencial',
        title: 'Potencial',
        items: [
          {
            id: 'potencial_construtivo',
            label: 'Bom potencial construtivo',
            detailField: {
              id: 'pavimentos_permitidos',
              label: 'Pavimentos permitidos',
              type: 'number',
              placeholder: 'Ex: 4',
            },
          },
        ],
      },
    ],
  },
  {
    type: 'RURAL',
    label: 'Rural',
    groups: [
      {
        id: 'terra',
        title: 'Terra',
        items: [
          { id: 'area_produtiva_relevante', label: 'Área produtiva relevante' },
          {
            id: 'area_total_hectares_info',
            label: 'Informar área total',
            detailField: {
              id: 'area_total_hectares',
              label: 'Área total (hectares)',
              type: 'number',
              placeholder: 'Ex: 50',
            },
          },
          {
            id: 'area_produtiva_hectares_info',
            label: 'Informar área produtiva',
            detailField: {
              id: 'area_produtiva_hectares',
              label: 'Área produtiva (hectares)',
              type: 'number',
              placeholder: 'Ex: 30',
            },
          },
        ],
      },
      {
        id: 'uso',
        title: 'Uso',
        items: [
          { id: 'agricultura', label: 'Agricultura' },
          { id: 'pecuaria', label: 'Pecuária' },
          { id: 'misto', label: 'Misto' },
        ],
      },
      {
        id: 'recursos',
        title: 'Recursos',
        items: [
          { id: 'agua', label: 'Água (rio/nascente/poço)' },
          { id: 'energia_eletrica', label: 'Energia elétrica' },
        ],
      },
      {
        id: 'benfeitorias',
        title: 'Benfeitorias',
        items: [
          { id: 'casa_sede', label: 'Casa sede' },
          { id: 'galpao', label: 'Galpão' },
          { id: 'cercas', label: 'Cercas' },
        ],
      },
      {
        id: 'acesso',
        title: 'Acesso',
        items: [
          { id: 'estrada_boa', label: 'Estrada boa' },
          { id: 'proximo_cidade', label: 'Próximo da cidade' },
        ],
      },
    ],
  },
]

export const getConfigByType = (type: string): PropertyTypeConfig | undefined => {
  return propertyTypeChecklistConfig.find((config) => config.type === type)
}

/**
 * Build a fully-initialized especificacoes object for a given property type,
 * with every checklist item set to `false` and every detail field set to `null`.
 */
export const buildDefaultEspecificacoes = (propertyType: PropertyType) => {
  const config = getConfigByType(propertyType)
  if (!config) return undefined

  const checklist: Record<string, boolean> = {}
  const detalhes: Record<string, string | number | null> = {}

  for (const group of config.groups) {
    for (const item of group.items) {
      checklist[item.id] = false
      if (item.detailField) {
        detalhes[item.detailField.id] = null
      }
    }
  }

  return { tipo: propertyType, checklist, detalhes }
}
