export interface PrintThemePreset {
  id: string
  label: string
  primary: string
  secondary: string
  background: string
  isMonochrome?: boolean
}

export const printThemePresets: PrintThemePreset[] = [
  {
    id: 'original',
    label: 'Original',
    primary: '',
    secondary: '',
    background: '',
  },
  {
    id: 'bw',
    label: 'P&B',
    primary: '#000000',
    secondary: '#444444',
    background: '#ffffff',
    isMonochrome: true,
  },
  {
    id: 'navy',
    label: 'Azul Marinho',
    primary: '#0ea5e9',
    secondary: '#6366f1',
    background: '#0c1929',
  },
  {
    id: 'gold',
    label: 'Dourado',
    primary: '#d4af37',
    secondary: '#6b7280',
    background: '#0f0f0f',
  },
  {
    id: 'green-coral',
    label: 'Verde & Coral',
    primary: '#10b981',
    secondary: '#f97316',
    background: '#0a1a14',
  },
  {
    id: 'wine',
    label: 'Vinho & Dourado',
    primary: '#be123c',
    secondary: '#d4af37',
    background: '#1a0a14',
  },
]
