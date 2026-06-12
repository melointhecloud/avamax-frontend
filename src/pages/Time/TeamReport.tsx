import { useState } from 'react';
import { TeamDashboardLayout } from '@/components/layout/team/TeamDashboardLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Download, FileText } from 'lucide-react';
import { useTeamSubscription } from '@/hooks/useTeamSubscription';
import { useTeamResultsPdf, ReportPeriod } from '@/hooks/useTeamResultsPdf';
import { TeamResultsPdfDocument } from '@/components/pdf/TeamResultsPdfDocument';

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '15d', label: '15 dias' },
  { value: '30d', label: '30 dias' },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function TeamReport() {
  const { planName } = useTeamSubscription();
  const isImobiliaria = planName === 'IMOBILIARIA';
  const [period, setPeriod] = useState<ReportPeriod>('30d');
  const { pdfRef, data, isLoading, isGenerating, downloadPdf, teamName, brokerLogoUrl } =
    useTeamResultsPdf(period);

  if (!isImobiliaria) {
    return (
      <TeamDashboardLayout title="Relatório PDF">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <Lock className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Recurso PRO</h2>
          <p className="text-muted-foreground max-w-xs">
            O Relatório PDF está disponível apenas no plano Imobiliária.
          </p>
        </div>
      </TeamDashboardLayout>
    );
  }

  const members = data?.member_stats ?? [];
  const totals = data?.totals;

  const byAvaliacoes = [...members].sort((a, b) => b.total_avaliacoes - a.total_avaliacoes).slice(0, 5);
  const byCaptacoes = [...members].sort((a, b) => b.convertidos - a.convertidos).slice(0, 5);
  const byValor = [...members].sort((a, b) => (b.valor_total ?? 0) - (a.valor_total ?? 0)).slice(0, 5);

  const generatedAt = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <TeamDashboardLayout title="Relatório PDF">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-team-orange" />
          <h1 className="text-xl font-bold text-team-foreground">Relatório de Resultados</h1>
        </div>
        <p className="text-sm text-team-muted">
          Gere um PDF com o ranking da equipe por período.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex gap-1 bg-team-card rounded-lg p-1 border border-team-border">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                period === p.value
                  ? 'bg-team-orange text-white shadow-sm'
                  : 'text-team-muted hover:text-team-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <Button
          onClick={downloadPdf}
          disabled={isGenerating || isLoading || members.length === 0}
          className="bg-team-orange hover:bg-team-orange/90 text-white gap-2"
        >
          <Download className="h-4 w-4" />
          {isGenerating ? 'Gerando PDF…' : 'Baixar PDF'}
        </Button>
      </div>

      {/* Preview cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full bg-team-muted/20 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Totals */}
          {totals && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Avaliações', value: String(totals.total_avaliacoes) },
                { label: 'Conversões', value: String(totals.total_convertidos) },
                { label: 'Conversão', value: `${totals.taxa_conversao}%` },
                { label: 'Valor Total', value: formatCurrency(totals.valor_total) },
              ].map(stat => (
                <div key={stat.label} className="bg-team-card rounded-xl border border-team-border p-4">
                  <p className="text-xs text-team-muted uppercase tracking-wide mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-team-orange">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Ranking preview tables */}
          {[
            { title: 'Mais Avaliações', rows: byAvaliacoes, getValue: (m: typeof byAvaliacoes[0]) => `${m.total_avaliacoes} aval.`, getSub: (m: typeof byAvaliacoes[0]) => `${m.convertidos} convertidos` },
            { title: 'Mais Captações', rows: byCaptacoes, getValue: (m: typeof byCaptacoes[0]) => `${m.convertidos} convert.`, getSub: (m: typeof byCaptacoes[0]) => `${m.taxa_conversao}% conversão` },
            { title: 'Maior Valor', rows: byValor, getValue: (m: typeof byValor[0]) => formatCurrency(m.valor_total ?? 0), getSub: (m: typeof byValor[0]) => `Média ${formatCurrency(m.valor_medio)}` },
          ].map(section => (
            <div key={section.title} className="mb-6">
              <h3 className="text-sm font-semibold text-team-foreground mb-3">{section.title}</h3>
              <div className="bg-team-card rounded-xl border border-team-border overflow-hidden">
                {section.rows.length === 0 ? (
                  <p className="text-center text-team-muted text-sm py-6">Sem dados para o período</p>
                ) : (
                  section.rows.map((member, idx) => (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-team-border last:border-0"
                    >
                      <span className="text-sm font-bold text-team-muted w-5 text-center">{idx + 1}</span>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-team-orange/60 to-team-primary/60 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          getInitials(member.nome)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-team-foreground truncate">
                          {member.nome || 'Corretor'}
                        </p>
                        <p className="text-xs text-team-muted">{section.getSub(member as any)}</p>
                      </div>
                      <span className="text-sm font-bold text-team-orange">{section.getValue(member as any)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Hidden PDF element */}
      <div style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none' }}>
        {!isLoading && totals && (
          <TeamResultsPdfDocument
            ref={pdfRef}
            teamName={teamName}
            brokerLogoUrl={brokerLogoUrl}
            period={period}
            generatedAt={generatedAt}
            members={members}
            totals={totals}
          />
        )}
      </div>
    </TeamDashboardLayout>
  );
}
