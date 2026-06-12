export const PROPERTY_TYPES = [
  'APARTAMENTO',
  'CASA',
  'COBERTURA',
  'KITNET_STUDIO',
  'COMERCIAL',
  'TERRENO',
  'RURAL',
] as const

export type PropertyType = typeof PROPERTY_TYPES[number]

export interface ChecklistItemConfig {
  id: string
  label: string
  detailField?: {
    id: string
    label: string
    type: 'number' | 'text'
    placeholder?: string
  }
}

export interface ChecklistGroupConfig {
  id: string
  title: string
  items: ChecklistItemConfig[]
}

export interface PropertyTypeConfig {
  type: PropertyType
  label: string
  groups: ChecklistGroupConfig[]
}

export interface SpecificationsData {
  tipo: PropertyType
  checklist: Record<string, boolean>
  detalhes: Record<string, string | number | null>
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  APARTAMENTO: 'Apartamento',
  CASA: 'Casa',
  COBERTURA: 'Cobertura',
  KITNET_STUDIO: 'Kitnet/Studio',
  COMERCIAL: 'Comercial',
  TERRENO: 'Terreno',
  RURAL: 'Rural',
}

// Map from form categoria value to PropertyType
export const CATEGORIA_TO_PROPERTY_TYPE: Record<string, PropertyType> = {
  apartamento: 'APARTAMENTO',
  casa: 'CASA',
  cobertura: 'COBERTURA',
  kitnet: 'KITNET_STUDIO',
  comercial: 'COMERCIAL',
  terreno: 'TERRENO',
  rural: 'RURAL',
}
