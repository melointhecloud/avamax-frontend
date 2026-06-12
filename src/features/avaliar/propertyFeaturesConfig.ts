export const FEATURE_GROUP_KEYS = [
  "areas_externas_e_comuns",
  "caracteristicas_internas",
  "infraestrutura_geral",
  "orientacao_solar",
  "vista_do_imovel",
  "infraestrutura_condominio_area_comum",
] as const;

export type FeatureGroupKey = (typeof FEATURE_GROUP_KEYS)[number];

export interface FeatureItem {
  slug: string;
  label: string;
}

export interface FeatureGroup {
  key: FeatureGroupKey;
  title: string;
  items: FeatureItem[];
}

const toSlug = (label: string): string =>
  label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const createItems = (labels: string[]): FeatureItem[] =>
  labels.map((label) => ({ slug: toSlug(label), label }));

export const PROPERTY_FEATURES_CONFIG: FeatureGroup[] = [
  {
    key: "areas_externas_e_comuns",
    title: "Áreas Externas e Comuns",
    items: createItems([
      "Piscina",
      "Bicicletário",
      "Condomínio fechado",
      "Jardim",
      "Aquecimento solar",
      "Garagem",
      "Jacuzzi",
      "Acessível a cadeiras de rodas",
      "Churrasqueira comum",
      "Deck",
      "Estacionamento subterrâneo",
      "Estacionamento para visitantes",
      "Lareira externa",
      "Quadra de areia",
      "Sacada",
      "Vaga para motos",
    ]),
  },
  {
    key: "caracteristicas_internas",
    title: "Características Internas",
    items: createItems([
      "Ambientes integrados",
      "Aquecimento solar",
      "Biblioteca",
      "Closet",
      "Dependência de empregada",
      "Espelhos d'água internos",
      "Janelas amplas",
      "Mobiliado",
      "Sala de almoço",
      "Visitantes",
      "Loja comercial integrada",
      "Quadra de squash",
      "Salão de festas",
      "Estrutura inacabada",
      "Apartamento inteligente",
      "Área de serviço",
      "Carpete",
      "Cozinha comum",
      "Depósito",
      "Edifício antigo",
      "Churrasqueira privativa na varanda",
      "Cinema",
      "Espaço de beleza",
      "Garage Band",
      "Não permite pets",
      "Quadra poliesportiva",
      "Terraço comum",
      "Espaço fitness",
      "Guarita blindada",
      "Playground",
      "Quintal",
      "Terraço com deck",
      "Aquecimento elétrico",
      "Armário embutido",
      "Ar condicionado central",
      "Cozinha gourmet",
      "Elevador privativo",
      "Fogão à lenha ou de azulejo",
      "Hall de entrada",
      "Lavanderia privativa",
      "Permitido fumar",
      "Sala de jantar",
      "Salão de jogos",
      "Ventilador de teto",
      "Lavanderia comunitária",
      "Portas automáticas",
      "Brinquedoteca",
      "Sauna",
      "Aquecimento no piso",
      "Armários na cozinha",
      "Circuito interno de segurança",
      "Cozinha espaçosa",
      "Escada interna",
      "Home theater",
      "Mezanino",
      "Primeiro proprietário",
      "Sala de massagem",
      "Sem mobília",
      "Sala de reunião",
      "Sótão",
    ]),
  },
  {
    key: "infraestrutura_geral",
    title: "Infraestrutura Geral",
    items: createItems([
      "Ar condicionado",
      "Edícula",
      "Fechadura digital",
      "Precisa de reforma",
      "Serviço pay-per-use",
      "Casa de caseiro",
      "Elevador social",
      "Inacabado",
      "Reformado",
      "Zelador",
      "Condomínio sustentável",
      "Escritório",
      "Mais de um andar",
      "Serviço de lavanderia",
      "Vista aberta",
    ]),
  },
  {
    key: "orientacao_solar",
    title: "Orientação Solar",
    items: createItems([
      "Leste",
      "Oeste",
      "Nordeste",
      "Sudeste",
      "Noroeste",
      "Sudoeste",
      "Norte",
      "Sul",
    ]),
  },
  {
    key: "vista_do_imovel",
    title: "Vista do Imóvel",
    items: createItems([
      "Vista aberta",
      "Vista para o mar",
      "Vista exterior",
      "Vista para montanhas",
      "Vista para lago",
    ]),
  },
  {
    key: "infraestrutura_condominio_area_comum",
    title: "Infraestrutura do Condomínio e Área Comum",
    items: createItems([
      "Acesso à praia",
      "Espaço pet",
      "Quadra de futebol",
      "Vigilância contínua",
      "Coleta seletiva de lixo",
      "Marina",
      "Recepção do edifício",
      "Condomínio inteligente",
      "Piscina semiolímpica",
      "Segurança 24h",
      "Fontes de água",
    ]),
  },
];

export const getAllFeatureSlugs = (): string[] =>
  PROPERTY_FEATURES_CONFIG.flatMap((group) => group.items.map((item) => item.slug));
