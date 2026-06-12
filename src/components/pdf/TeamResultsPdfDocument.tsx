import React from 'react';
import { MemberStat, AnalyticsTotals } from '@/hooks/useTeamAnalytics';

interface TeamResultsPdfDocumentProps {
  teamName: string;
  brokerLogoUrl?: string | null;
  period: '7d' | '15d' | '30d';
  generatedAt: string;
  members: MemberStat[];
  totals: AnalyticsTotals;
}

const PERIOD_LABEL: Record<string, string> = {
  '7d': 'Últimos 7 dias',
  '15d': 'Últimos 15 dias',
  '30d': 'Últimos 30 dias',
};

// ── Constantes de layout (em px a 96 dpi) ──────────────────────────────────
const PAGE_W        = 794;   // largura A4
const PAGE_H        = 1123;  // altura A4
const COVER_H       = 308;   // altura da capa (inclui borda laranja)
const RUN_HDR_H     = 44;    // running header (páginas 2+)
const SECT_HDR_H    = 82;    // título + subtítulo da seção
const CONT_LBL_H    = 28;    // "(continuação)" label
const FOOTER_H      = 36;    // rodapé fixo
const PAD_TOP       = 24;    // padding superior do conteúdo
const PAD_BOT       = 16;    // padding inferior do conteúdo
const ROW_H         = 67;    // altura de cada linha de corretor

// Linhas que cabem por tipo de página
const ROWS_P1   = Math.floor((PAGE_H - COVER_H - PAD_TOP - SECT_HDR_H - PAD_BOT - FOOTER_H) / ROW_H); // ~8
const ROWS_NEW  = Math.floor((PAGE_H - RUN_HDR_H - PAD_TOP - SECT_HDR_H - PAD_BOT - FOOTER_H) / ROW_H); // ~13
const ROWS_CONT = Math.floor((PAGE_H - RUN_HDR_H - PAD_TOP - CONT_LBL_H - PAD_BOT - FOOTER_H) / ROW_H); // ~14

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

function fmtCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
}
function initials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// ── Tipos internos ─────────────────────────────────────────────────────────
interface RankingRow { member: MemberStat; value: string; subvalue?: string; }
interface Section { title: string; subtitle: string; rows: RankingRow[]; }

type PageType = 'cover_section' | 'section_start' | 'continuation';
interface PageSpec {
  type: PageType;
  section: Section;
  rows: RankingRow[];
  pageNum: number;
  totalPages: number; // preenchido depois
  globalRowOffset: number; // posição do primeiro row no ranking global
}

// ── Paginação ──────────────────────────────────────────────────────────────
function paginate(sections: Section[]): PageSpec[] {
  const pages: PageSpec[] = [];

  sections.forEach((section, si) => {
    const { rows } = section;

    if (si === 0) {
      // Seção 1: primeira página compartilha com a capa
      const chunk = rows.slice(0, ROWS_P1);
      pages.push({ type: 'cover_section', section, rows: chunk, pageNum: 0, totalPages: 0, globalRowOffset: 0 });
      let i = ROWS_P1;
      while (i < rows.length) {
        pages.push({ type: 'continuation', section, rows: rows.slice(i, i + ROWS_CONT), pageNum: 0, totalPages: 0, globalRowOffset: i });
        i += ROWS_CONT;
      }
    } else {
      // Seções 2+: página própria
      const chunk = rows.slice(0, ROWS_NEW);
      pages.push({ type: 'section_start', section, rows: chunk, pageNum: 0, totalPages: 0, globalRowOffset: 0 });
      let i = ROWS_NEW;
      while (i < rows.length) {
        pages.push({ type: 'continuation', section, rows: rows.slice(i, i + ROWS_CONT), pageNum: 0, totalPages: 0, globalRowOffset: i });
        i += ROWS_CONT;
      }
    }
  });

  const total = pages.length;
  pages.forEach((p, i) => { p.pageNum = i + 1; p.totalPages = total; });
  return pages;
}

// ── Sub-componentes ────────────────────────────────────────────────────────
function RowList({ rows, startRank }: { rows: RankingRow[]; startRank: number }) {
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      {rows.map((row, idx) => {
        const rank = startRank + idx;
        return (
          <div key={row.member.user_id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            background: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
            borderBottom: idx < rows.length - 1 ? '1px solid #e2e8f0' : 'none',
            height: ROW_H - 1,
            boxSizing: 'border-box',
          }}>
            <div style={{
              minWidth: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: rank <= 3 ? MEDAL_COLORS[rank - 1] : '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: rank <= 3 ? '#fff' : '#64748b',
            }}>{rank}</div>

            <div style={{
              minWidth: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden',
            }}>
              {row.member.avatar_url
                ? <img src={row.member.avatar_url} alt="" crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials(row.member.nome)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', wordBreak: 'break-word', lineHeight: 1.2 }}>
                {row.member.nome || 'Corretor'}
              </div>
              {row.subvalue && (
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{row.subvalue}</div>
              )}
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, color: '#f97316', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {row.value}
            </div>
          </div>
        );
      })}
      {rows.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
          Sem dados para o período
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ height: SECT_HDR_H, boxSizing: 'border-box', paddingBottom: 12 }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#f97316', marginBottom: 4 }}>
        Ranking da Equipe
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 11, color: '#64748b' }}>{subtitle}</div>
    </div>
  );
}

function RunningHeader({ teamName, period, pageNum, totalPages }: { teamName: string; period: string; pageNum: number; totalPages: number }) {
  return (
    <div style={{
      height: RUN_HDR_H, background: '#0A1628', boxSizing: 'border-box',
      padding: '0 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: 1 }}>
        {teamName.toUpperCase()}
      </div>
      <div style={{ fontSize: 10, color: '#94a3b8' }}>
        {period} • Pág. {pageNum}/{totalPages}
      </div>
    </div>
  );
}

function PageFooter({ period }: { period: string }) {
  return (
    <div style={{
      height: FOOTER_H, borderTop: '1px solid #e2e8f0', background: '#f8fafc',
      padding: '0 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxSizing: 'border-box',
    }}>
      <div style={{ fontSize: 9, color: '#94a3b8' }}>AvaLuz • Relatório de Resultados</div>
      <div style={{ fontSize: 9, color: '#94a3b8' }}>{PERIOD_LABEL[period] ?? period}</div>
    </div>
  );
}

// ── Renderizadores de página ───────────────────────────────────────────────
interface PageProps {
  spec: PageSpec;
  teamName: string;
  period: string;
  brokerLogoUrl?: string | null;
  generatedAt: string;
  totals: AnalyticsTotals;
}

function CoverSectionPage({ spec, teamName, period, brokerLogoUrl, generatedAt, totals }: PageProps) {
  const whiteH = PAGE_H - COVER_H;
  return (
    <div style={{ width: PAGE_W, height: PAGE_H, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Capa */}
      <div style={{
        height: COVER_H, flexShrink: 0,
        background: 'linear-gradient(160deg, #061224 0%, #0A1E3C 60%, #0D2847 100%)',
        padding: '28px 36px 16px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderBottom: '3px solid #f97316',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#f97316', marginBottom: 6 }}>
              Relatório de Resultados
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 4 }}>
              {teamName}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>{PERIOD_LABEL[period]}</div>
          </div>
          {brokerLogoUrl && (
            <img src={brokerLogoUrl} alt="Logo" crossOrigin="anonymous"
              style={{ maxHeight: 56, maxWidth: 140, objectFit: 'contain', borderRadius: 6 }} />
          )}
        </div>

        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'Avaliações', value: String(totals.total_avaliacoes) },
              { label: 'Conversões', value: String(totals.total_convertidos) },
              { label: 'Taxa Conversão', value: `${totals.taxa_conversao}%` },
              { label: 'Valor Total', value: fmtCurrency(totals.valor_total) },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, background: 'rgba(59,130,246,0.12)',
                border: '1px solid rgba(96,165,250,0.2)', borderRadius: 8, padding: '10px 12px',
              }}>
                <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#f97316' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: '#475569' }}>Gerado em {generatedAt} • AvaLuz</div>
        </div>
      </div>

      {/* Ranking na mesma página */}
      <div style={{
        height: whiteH, background: '#ffffff', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: `${PAD_TOP}px 36px 0`, boxSizing: 'border-box' }}>
          <SectionHeader title={spec.section.title} subtitle={spec.section.subtitle} />
          <RowList rows={spec.rows} startRank={spec.globalRowOffset + 1} />
        </div>
        <div style={{ flex: 1 }} />
        <PageFooter period={period} />
      </div>
    </div>
  );
}

function SectionStartPage({ spec, teamName, period }: PageProps) {
  return (
    <div style={{ width: PAGE_W, height: PAGE_H, overflow: 'hidden', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <RunningHeader teamName={teamName} period={period} pageNum={spec.pageNum} totalPages={spec.totalPages} />
      <div style={{ padding: `${PAD_TOP}px 36px 0`, boxSizing: 'border-box' }}>
        <SectionHeader title={spec.section.title} subtitle={spec.section.subtitle} />
        <RowList rows={spec.rows} startRank={spec.globalRowOffset + 1} />
      </div>
      <div style={{ flex: 1 }} />
      <PageFooter period={period} />
    </div>
  );
}

function ContinuationPage({ spec, teamName, period }: PageProps) {
  return (
    <div style={{ width: PAGE_W, height: PAGE_H, overflow: 'hidden', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <RunningHeader teamName={teamName} period={period} pageNum={spec.pageNum} totalPages={spec.totalPages} />
      <div style={{ padding: `${PAD_TOP}px 36px 0`, boxSizing: 'border-box' }}>
        <div style={{ height: CONT_LBL_H, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>
            {spec.section.title} — continuação
          </span>
        </div>
        <RowList rows={spec.rows} startRank={spec.globalRowOffset + 1} />
      </div>
      <div style={{ flex: 1 }} />
      <PageFooter period={period} />
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export const TeamResultsPdfDocument = React.forwardRef<HTMLDivElement, TeamResultsPdfDocumentProps>(
  ({ teamName, brokerLogoUrl, period, generatedAt, members, totals }, ref) => {
    const byAvaliacoes = [...members].sort((a, b) => b.total_avaliacoes - a.total_avaliacoes);
    const byValor      = [...members].sort((a, b) => (b.valor_total ?? 0) - (a.valor_total ?? 0));
    const allZero      = members.every(m => m.convertidos === 0);
    const byCaptacoes  = allZero
      ? [...members].sort((a, b) => b.convertidos - a.convertidos).slice(0, 5)
      : [...members].sort((a, b) => b.convertidos - a.convertidos);

    const sections: Section[] = [
      {
        title: 'Mais Avaliações',
        subtitle: 'Corretores com maior número de avaliações realizadas no período',
        rows: byAvaliacoes.map(m => ({
          member: m,
          value: `${m.total_avaliacoes} aval.`,
          subvalue: `${m.convertidos} convertido${m.convertidos !== 1 ? 's' : ''}`,
        })),
      },
      {
        title: 'Mais Captações / Conversões',
        subtitle: allZero
          ? 'Top 5 corretores (sem captações registradas no período)'
          : 'Corretores com mais imóveis captados ou convertidos no período',
        rows: byCaptacoes.map(m => ({
          member: m,
          value: `${m.convertidos} convert.`,
          subvalue: `${m.taxa_conversao}% de conversão`,
        })),
      },
      {
        title: 'Maior Valor Avaliado',
        subtitle: 'Corretores com maior valor total de imóveis avaliados no período',
        rows: byValor.map(m => ({
          member: m,
          value: fmtCurrency(m.valor_total ?? 0),
          subvalue: `Média: ${fmtCurrency(m.valor_medio)}`,
        })),
      },
    ];

    const pages = paginate(sections);

    const pageProps = (spec: PageSpec): PageProps => ({
      spec, teamName, period, brokerLogoUrl, generatedAt, totals,
    });

    return (
      <div ref={ref} style={{ width: PAGE_W, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
        {pages.map((spec, i) => {
          if (spec.type === 'cover_section')
            return <CoverSectionPage key={i} {...pageProps(spec)} />;
          if (spec.type === 'section_start')
            return <SectionStartPage key={i} {...pageProps(spec)} />;
          return <ContinuationPage key={i} {...pageProps(spec)} />;
        })}
      </div>
    );
  }
);

TeamResultsPdfDocument.displayName = 'TeamResultsPdfDocument';
