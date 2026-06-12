import { ExternalLink, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Noticia } from '@/hooks/useNoticias';

interface NewsCardProps {
  noticia: Noticia;
}

export const NewsCard = ({ noticia }: NewsCardProps) => {
  const handleClick = () => {
    if (noticia.link) {
      window.open(noticia.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-primary/20 bg-white/90 dark:bg-white/5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
      onClick={handleClick}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        {noticia.image && (
          <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-48 md:w-56">
            <img
              src={noticia.image}
              alt={noticia.titulo || 'Imagem da notícia'}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:bg-gradient-to-r" />
          </div>
        )}
        
        {/* Content */}
        <CardContent className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            {/* Date badge */}
            {noticia.data_noticia && (
              <div className="mb-2 flex items-center gap-1.5 text-xs text-primary">
                <Calendar className="h-3 w-3 text-primary" />
                <span>{noticia.data_noticia}</span>
              </div>
            )}
            
            {/* Title */}
            <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
              {noticia.titulo}
            </h3>
            
            {/* Description */}
            {noticia.descricao && (
              <p className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-3">
                {noticia.descricao}
              </p>
            )}
          </div>
          
          {/* Read more */}
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary opacity-70 transition-opacity group-hover:opacity-100">
            <span>Ler mais</span>
            <ExternalLink className="h-3 w-3 text-primary" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
