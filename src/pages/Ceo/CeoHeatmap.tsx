import { Map, AlertCircle } from 'lucide-react';

export default function CeoHeatmap() {
  return (
    <div className="space-y-6 flex flex-col items-center justify-center h-[70vh]">
      <div className="p-6 rounded-full" style={{ background: 'hsl(216 100% 96%)' }}>
        <Map className="h-16 w-16" style={{ color: 'hsl(216 100% 40%)' }} />
      </div>
      <h2 className="text-2xl font-bold text-center" style={{ color: 'hsl(216 30% 20%)' }}>
        Mapa de Calor Global
      </h2>
      <p className="text-sm text-center max-w-md" style={{ color: 'hsl(216 15% 50%)' }}>
        Esta ferramenta agregará todas as avaliações feitas por qualquer MFR, Imobiliária e Corretor no Brasil em uma visão integrada.
      </p>
      
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ background: 'hsl(43 90% 96%)', color: 'hsl(43 90% 40%)' }}>
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Módulo de visualização unificada em desenvolvimento.</span>
      </div>
    </div>
  );
}
