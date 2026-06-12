export interface PhysicalFieldsConfig {
  showQuartos: boolean
  showSuites: boolean
  showBanheiros: boolean
  showVagas: boolean
  showCondominio: boolean
  labels: {
    areaTotal: string
    quartos?: string
    suites?: string
    banheiros?: string
    vagas?: string
    condominio?: string
  }
}

const defaultConfig: PhysicalFieldsConfig = {
  showQuartos: true,
  showSuites: true,
  showBanheiros: true,
  showVagas: true,
  showCondominio: true,
  labels: {
    areaTotal: 'Área Total (m²) *',
    quartos: 'Quartos',
    suites: 'Suítes',
    banheiros: 'Banheiros',
    vagas: 'Vagas de Garagem',
    condominio: 'Condomínio (R$)',
  },
}

export const physicalFieldsConfig: Record<string, PhysicalFieldsConfig> = {
  apartamento: {
    ...defaultConfig,
  },
  casa: {
    ...defaultConfig,
  },
  cobertura: {
    ...defaultConfig,
  },
  kitnet: {
    showQuartos: false,
    showSuites: false,
    showBanheiros: true,
    showVagas: false,
    showCondominio: true,
    labels: {
      areaTotal: 'Área Total (m²) *',
      banheiros: 'Banheiros',
      condominio: 'Condomínio (R$)',
    },
  },
  comercial: {
    showQuartos: false,
    showSuites: false,
    showBanheiros: true,
    showVagas: true,
    showCondominio: true,
    labels: {
      areaTotal: 'Área Útil (m²) *',
      banheiros: 'Banheiros',
      vagas: 'Vagas de Estacionamento',
      condominio: 'Condomínio (R$)',
    },
  },
  terreno: {
    showQuartos: false,
    showSuites: false,
    showBanheiros: false,
    showVagas: false,
    showCondominio: false,
    labels: {
      areaTotal: 'Área do Terreno (m²) *',
    },
  },
  rural: {
    showQuartos: true,
    showSuites: true,
    showBanheiros: true,
    showVagas: true,
    showCondominio: false,
    labels: {
      areaTotal: 'Área Total (m²) *',
      quartos: 'Quartos',
      suites: 'Suítes',
      banheiros: 'Banheiros',
      vagas: 'Vagas',
    },
  },
}

export function getFieldsConfig(categoria: string): PhysicalFieldsConfig {
  return physicalFieldsConfig[categoria] || defaultConfig
}
