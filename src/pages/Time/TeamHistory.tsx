import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TeamDashboardLayout } from '@/components/layout/team/TeamDashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTeamEvaluations, getEvaluationValue, TeamEvaluation } from '@/hooks/useTeamEvaluations';
import { Search, FileText, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ITEMS_PER_PAGE = 10;

function formatCurrency(value?: number) {
  if (!value) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function EvaluationTable({
  evaluations,
  isLoading,
  showAuthor,
  onView
}: {
  evaluations: TeamEvaluation[];
  isLoading: boolean;
  showAuthor: boolean;
  onView: (id: number) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEvaluations = useMemo(() => {
    if (!searchTerm) return evaluations;
    const term = searchTerm.toLowerCase();
    return evaluations.filter((e) => {
      const location = `${e.input?.municipio || ''} ${e.input?.bairro || ''} ${e.input?.estado || ''}`.toLowerCase();
      const author = (e.author_name || '').toLowerCase();
      return location.includes(term) || author.includes(term);
    });
  }, [evaluations, searchTerm]);

  const totalPages = Math.ceil(filteredEvaluations.length / ITEMS_PER_PAGE);
  const paginatedEvaluations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvaluations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEvaluations, currentPage]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full bg-team-accent" />
        ))}
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhuma avaliação encontrada"
        description="Não há avaliações nesta categoria ainda"
      />
    );
  }

  return (
    <div className="space-y-4 min-w-0 overflow-hidden">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-team-muted" />
        <Input
          placeholder="Buscar por localização ou autor..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-9 border-team-border bg-team-accent/30 text-team-foreground placeholder:text-team-muted"
        />
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 lg:hidden">
        {paginatedEvaluations.map((evaluation) => (
          <Card
            key={evaluation.id}
            className="border-team-border bg-team-card cursor-pointer hover:bg-team-accent/30 transition-colors"
            onClick={() => onView(evaluation.id)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                {showAuthor && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={evaluation.author_avatar || undefined} />
                    <AvatarFallback className="bg-team-primary text-xs">
                      {evaluation.author_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-team-foreground truncate text-sm">
                        {evaluation.input?.bairro || 'Sem bairro'}
                      </p>
                      <p className="text-xs text-team-muted truncate">
                        {evaluation.input?.municipio}, {evaluation.input?.estado}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-team-orange text-sm">
                        {formatCurrency(getEvaluationValue(evaluation))}
                      </p>
                      <p className="text-xs text-team-muted">
                        {format(new Date(evaluation.created_at), 'dd/MM/yy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {showAuthor && (
                    <p className="text-xs text-team-muted mt-1 truncate">
                      {evaluation.author_name || 'Usuário'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-team-border hover:bg-transparent">
              {showAuthor && <TableHead className="text-team-muted w-[50px]"></TableHead>}
              <TableHead className="text-team-muted whitespace-nowrap">Data</TableHead>
              <TableHead className="text-team-muted">Localização</TableHead>
              <TableHead className="text-team-muted">Categoria</TableHead>
              {showAuthor && <TableHead className="text-team-muted">Autor</TableHead>}
              <TableHead className="text-team-muted whitespace-nowrap">Valor Estimado</TableHead>
              <TableHead className="text-team-muted text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvaluations.map((evaluation) => (
              <TableRow
                key={evaluation.id}
                className="border-team-border hover:bg-team-accent/30 cursor-pointer"
                onClick={() => onView(evaluation.id)}
              >
                {showAuthor && (
                  <TableCell className="w-[50px] pr-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={evaluation.author_avatar || undefined} />
                      <AvatarFallback className="bg-team-primary text-xs">
                        {evaluation.author_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                )}
                <TableCell className="text-team-foreground whitespace-nowrap">
                  {format(new Date(evaluation.created_at), 'dd MMM yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="min-w-0 max-w-[200px]">
                    <p className="truncate font-medium text-team-foreground">
                      {evaluation.input?.bairro || '-'}
                    </p>
                    <p className="truncate text-xs text-team-muted">
                      {evaluation.input?.municipio}, {evaluation.input?.estado}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-team-accent text-team-foreground whitespace-nowrap">
                    {evaluation.input?.categoria || '-'}
                  </Badge>
                </TableCell>
                {showAuthor && (
                  <TableCell>
                    <span className="text-sm text-team-foreground truncate block max-w-[120px]">
                      {evaluation.author_name || 'Usuário'}
                    </span>
                  </TableCell>
                )}
                <TableCell className="font-semibold text-team-orange whitespace-nowrap">
                  {formatCurrency(getEvaluationValue(evaluation))}
                  {evaluation.input?.tipoAvaliacao === 'aluguel' && (
                    <span className="text-xs font-normal text-team-muted">/mês</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-team-muted hover:text-team-foreground hover:bg-team-accent"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
          <p className="text-xs sm:text-sm text-team-muted text-center sm:text-left">
            {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredEvaluations.length)} de {filteredEvaluations.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-team-border text-team-foreground h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-team-foreground min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-team-border text-team-foreground h-8 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRemax = true;

  // Fetch all team evaluations (scope 'all' includes all members)
  const { data: evaluations, isLoading } = useTeamEvaluations('all', 100);

  const handleView = (id: number) => {
    navigate(isRemax ? `/avaliacao/${id}` : `/avaliacao/${id}`);
  };

  return (
    <TeamDashboardLayout title="Histórico do Time" subtitle="Todas as avaliações realizadas pela equipe">
      <Card className="border-team-border bg-team-card">
        <CardContent className="p-4 sm:p-6">
          <EvaluationTable
            evaluations={evaluations || []}
            isLoading={isLoading}
            showAuthor={true}
            onView={handleView}
          />
        </CardContent>
      </Card>
    </TeamDashboardLayout>
  );
}
