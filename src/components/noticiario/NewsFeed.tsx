import { Loader2, Newspaper, RefreshCw } from 'lucide-react';
import { useNoticias } from '@/hooks/useNoticias';
import { NewsCard } from './NewsCard';
import { Button } from '@/components/ui/button';

export const NewsFeed = () => {
  const { data: noticias, isLoading, error, refetch, isFetching } = useNoticias();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Carregando notícias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <Newspaper className="h-7 w-7 text-destructive" />
        </div>
        <h3 className="font-medium text-foreground">Erro ao carregar notícias</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Não foi possível buscar as notícias. Tente novamente.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={() => refetch()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!noticias || noticias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Newspaper className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground">Nenhuma notícia disponível</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Em breve teremos novidades do mercado imobiliário.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {noticias.length} notícias recentes
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* News list */}
      <div className="space-y-4">
        {noticias.map((noticia) => (
          <NewsCard key={noticia.id} noticia={noticia} />
        ))}
      </div>
    </div>
  );
};
