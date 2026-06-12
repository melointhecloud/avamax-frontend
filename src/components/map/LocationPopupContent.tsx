import { useLocationEvaluations } from '@/hooks/useLocationEvaluations';
import { Loader2, MapPin, Home } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantPrefix } from '@/hooks/useTenantPrefix';

interface LocationPopupContentProps {
  bairro: string;
  municipio: string;
  estado: string;
  count: number;
  isOpen: boolean;
}

function formatCurrency(value: number | string | undefined | null): string {
  if (!value) return '—';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : value;
  if (isNaN(num)) return '—';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function extractValue(resultado: Record<string, any>): string {
  const val = resultado?.valor_estimado ?? resultado?.valorEstimado ?? resultado?.valor ?? null;
  return formatCurrency(val);
}

function extractCategory(input: Record<string, any>): string {
  return input?.categoria || input?.tipo || 'Imóvel';
}

function extractArea(input: Record<string, any>): string {
  const area = input?.area || input?.metros || input?.metragem;
  return area ? `${area}m²` : '';
}

export function LocationPopupContent({ bairro, municipio, estado, count, isOpen }: LocationPopupContentProps) {
  const { data: evaluations, isLoading, activate } = useLocationEvaluations(bairro, municipio, estado);
  const navigate = useNavigate();
  const p = useTenantPrefix();

  useEffect(() => {
    if (isOpen) activate();
  }, [isOpen, activate]);

  return (
    <div className="min-w-[260px] max-w-[320px]">
      {/* Header */}
      <div className="mb-2 border-b pb-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <p className="font-bold text-sm">{bairro || municipio}</p>
        </div>
        {bairro && (
          <p className="text-xs text-muted-foreground ml-5.5">{municipio} — {estado}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1 ml-5.5">
          {count} avaliação{count !== 1 ? 'ões' : ''}
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground">Carregando...</span>
        </div>
      ) : !evaluations || evaluations.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">Nenhuma avaliação encontrada.</p>
      ) : (
        <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
          {evaluations.map((ev) => (
            <div
              key={ev.eval_id}
              className="flex gap-2 rounded-lg border p-2 bg-background/50 cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => navigate(p(`/avaliacao/${ev.eval_id}`))}
            >
              {/* Cover image */}
              {ev.cover_url ? (
                <img
                  src={ev.cover_url}
                  alt="Imóvel"
                  className="h-14 w-14 rounded-md object-cover shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Home className="h-5 w-5 text-muted-foreground/40" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Broker */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Avatar className="h-4 w-4">
                    {ev.author_avatar && <AvatarImage src={ev.author_avatar} />}
                    <AvatarFallback className="text-[8px]">
                      {(ev.author_name || '?')[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium truncate">{ev.author_name || 'Corretor'}</span>
                </div>

                {/* Category + Area */}
                <p className="text-[11px] text-muted-foreground truncate">
                  {extractCategory(ev.input)}
                  {extractArea(ev.input) && ` · ${extractArea(ev.input)}`}
                </p>

                {/* Value + Date */}
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-semibold text-primary">
                    {extractValue(ev.resultado)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(ev.created_at), 'dd/MM/yy', { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
