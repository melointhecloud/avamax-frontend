import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Newspaper, ExternalLink, Loader2, ArrowRight, Megaphone } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { useNoticias, Noticia } from '@/hooks/useNoticias'
import { useTeamNotices, TeamNotice } from '@/hooks/useTeamNotices'
import { useNavigate } from 'react-router-dom'
import { useTenantPrefix } from '@/hooks/useTenantPrefix'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const RecentNews = () => {
  const navigate = useNavigate()
  const p = useTenantPrefix()
  const { data: noticias, isLoading, error } = useNoticias()
  const { data: notices } = useTeamNotices()

  const recentNews = noticias?.slice(0, 5) ?? []
  const recentNotices = notices?.slice(0, 3) ?? []

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between px-3 pb-2 pt-3 sm:px-6 sm:pb-4 sm:pt-6">
          <CardTitle className="text-sm sm:text-base lg:text-lg">Últimas Notícias</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center px-3 pb-3 sm:px-6 sm:pb-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error || (recentNews.length === 0 && recentNotices.length === 0)) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between px-3 pb-2 pt-3 sm:px-6 sm:pb-4 sm:pt-6">
          <CardTitle className="text-sm sm:text-base lg:text-lg">Últimas Notícias</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4">
          <EmptyState
            icon={Newspaper}
            title="Nenhuma notícia disponível"
            className="py-4 sm:py-6 lg:py-8"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between px-3 pb-2 pt-3 sm:px-6 sm:pb-4 sm:pt-6">
        <CardTitle className="text-sm sm:text-base lg:text-lg">Últimas Notícias</CardTitle>
        <button
          onClick={() => navigate(p('/noticiario'))}
          className="flex items-center gap-1 text-xs text-primary hover:underline sm:text-sm"
        >
          Ver todas
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-6 sm:pb-4">
        <div className="space-y-2 sm:space-y-3">
          {/* Internal notices first */}
          {recentNotices.map((notice) => (
            <NoticeItem key={`notice-${notice.id}`} notice={notice} />
          ))}
          {recentNews.map((noticia) => (
            <NewsItem key={noticia.id} noticia={noticia} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface NoticeItemProps {
  notice: TeamNotice
}

const NoticeItem = ({ notice }: NoticeItemProps) => {
  const formattedDate = format(new Date(notice.created_at), 'dd/MM/yyyy', { locale: ptBR });

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-white/90 p-2.5 dark:bg-white/5 sm:gap-3 sm:p-3 lg:p-4">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 sm:h-9 sm:w-9">
          <Megaphone className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1.5">
            <Badge className="border-primary/30 bg-primary/15 px-1.5 py-0 text-[10px] text-primary hover:bg-primary/25">
              Aviso
            </Badge>
          </div>
          <p className="line-clamp-2 text-xs font-medium text-foreground sm:text-sm lg:text-base">
            {notice.title}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-primary/20 pt-2 sm:gap-3">
        <span className="text-[10px] text-muted-foreground sm:text-xs">
          {formattedDate} • {notice.creator_name}
        </span>
      </div>
    </div>
  )
}

interface NewsItemProps {
  noticia: Noticia
}

const NewsItem = ({ noticia }: NewsItemProps) => {
  const handleClick = () => {
    if (noticia.link) {
      window.open(noticia.link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      onClick={handleClick}
      className="group flex cursor-pointer flex-col gap-2 rounded-lg border border-border bg-card p-2.5 transition-all hover:border-primary/30 hover:bg-muted/50 sm:gap-3 sm:p-3 lg:p-4"
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {noticia.image ? (
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg sm:h-9 sm:w-9">
            <img
              src={noticia.image}
              alt={noticia.titulo || 'Notícia'}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9">
            <Newspaper className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-medium text-foreground sm:text-sm lg:text-base">
            {noticia.titulo || 'Sem título'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2 sm:gap-3">
        <span className="text-[10px] text-muted-foreground sm:text-xs">
          {noticia.data_noticia || 'Sem data'}
        </span>
        {noticia.link && (
          <div className="flex items-center gap-1 text-[10px] text-primary opacity-0 transition-opacity group-hover:opacity-100 sm:text-xs">
            <span className="hidden sm:inline">Ler mais</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  )
}
