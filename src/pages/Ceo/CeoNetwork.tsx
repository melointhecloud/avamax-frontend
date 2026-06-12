import { Network, Building2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function CeoNetwork() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'hsl(216 30% 20%)' }}>
          Rede Avaluz
        </h2>
        <p className="text-sm mt-1" style={{ color: 'hsl(216 15% 50%)' }}>
          Visão central para análise de Master Franquiados, Imobiliárias e Corretores
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neu-card p-6 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 rounded-full" style={{ background: 'hsl(216 100% 96%)' }}>
                <Network className="h-8 w-8" style={{ color: 'hsl(216 100% 40%)' }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'hsl(216 30% 20%)' }}>Master Franquiados (MFR)</h3>
            <p className="text-sm" style={{ color: 'hsl(216 15% 50%)' }}>Analise o rendimento de todos os master franquiados da rede.</p>
        </div>
        
        <div className="neu-card p-6 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 rounded-full" style={{ background: 'hsl(216 100% 96%)' }}>
                <Building2 className="h-8 w-8" style={{ color: 'hsl(216 100% 40%)' }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'hsl(216 30% 20%)' }}>Imobiliárias</h3>
            <p className="text-sm" style={{ color: 'hsl(216 15% 50%)' }}>Compare a performance e veja os detalhes das imobiliárias.</p>
        </div>

        <div className="neu-card p-6 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 rounded-full" style={{ background: 'hsl(216 100% 96%)' }}>
                <Users className="h-8 w-8" style={{ color: 'hsl(216 100% 40%)' }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'hsl(216 30% 20%)' }}>Corretores</h3>
            <p className="text-sm" style={{ color: 'hsl(216 15% 50%)' }}>Avalie o histórico e métricas individuais dos corretores.</p>
        </div>
      </div>
      
      <div className="mt-8 neu-card p-8 text-center border border-dashed" style={{ borderColor: 'hsl(216 20% 80%)' }}>
         <p className="text-lg font-medium" style={{ color: 'hsl(216 20% 40%)' }}>
            A visualização detalhada de analytics (filtros, tabelas, e drill-down por entidade) será carregada aqui nas próximas iterações.
         </p>
      </div>

    </div>
  );
}
