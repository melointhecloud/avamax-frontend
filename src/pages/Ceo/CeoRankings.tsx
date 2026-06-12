import { Trophy, AlertCircle } from 'lucide-react';

export default function CeoRankings() {
  return (
    <div className="space-y-6 flex flex-col items-center justify-center h-[70vh]">
      <div className="p-6 rounded-full" style={{ background: 'hsl(43 100% 96%)' }}>
        <Trophy className="h-16 w-16" style={{ color: 'hsl(43 90% 45%)' }} />
      </div>
      <h2 className="text-2xl font-bold text-center" style={{ color: 'hsl(216 30% 20%)' }}>
        Rankings Globais (CEO)
      </h2>
      <p className="text-sm text-center max-w-md" style={{ color: 'hsl(216 15% 50%)' }}>
        Acompanhe os líderes de avaliações, captações e performance em toda a rede. Visualize os Top Master Franquiados e as Imobiliárias de Destaque.
      </p>
      
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ background: 'hsl(43 90% 96%)', color: 'hsl(43 90% 40%)' }}>
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Lógica de ranking com escopo global em desenvolvimento.</span>
      </div>
    </div>
  );
}
