import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NewsFeed } from '@/components/noticiario/NewsFeed';
import { NoticeCard } from '@/components/noticiario/NoticeCard';
import { CreateNoticeDialog } from '@/components/noticiario/CreateNoticeDialog';
import { CreateNewsDialog } from '@/components/noticiario/CreateNewsDialog';
import { useTeamLayoutData } from '@/hooks/useTeamLayoutData';
import { useTeamNotices } from '@/hooks/useTeamNotices';
import {
  Newspaper,
  TrendingUp,
  Building2,
  BarChart3,
  Globe,
  Megaphone
} from 'lucide-react';

const Noticiario = () => {
  const location = useLocation();
  const isRemax = location.pathname.startsWith('/home');
  const [noticeDialogOpen, setNoticeDialogOpen] = useState(false);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const { data: teamData } = useTeamLayoutData();
  const { data: notices } = useTeamNotices();

  const isOwner = teamData?.userRole === 'owner';

  const categories = [
    { icon: TrendingUp, label: 'Tendências' },
    { icon: Building2, label: 'Imobiliário' },
    { icon: BarChart3, label: 'Economia' },
    { icon: Globe, label: 'Nacional' },
  ];

  return (
    <DashboardLayout
      title="Noticiário"
      subtitle="Fique por dentro das novidades do mercado imobiliário"
    >
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-destructive/10">
                <Newspaper className="h-7 w-7 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  Mercado Imobiliário
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  As principais notícias e análises do setor imobiliário brasileiro,
                  atualizadas diariamente para você.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
                {categories.map((cat, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className={`gap-1.5 ${isRemax
                      ? (i % 2 === 0
                        ? 'bg-[hsl(0,100%,40%)] text-white hover:bg-white hover:text-[hsl(0,100%,40%)] hover:border hover:border-[hsl(0,100%,40%)]'
                        : 'bg-[hsl(216,100%,40%)] text-white hover:bg-white hover:text-[hsl(216,100%,40%)] hover:border hover:border-[hsl(216,100%,40%)]')
                      : 'bg-muted/80'}`}
                  >
                    <cat.icon className="h-3 w-3" />
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avisos do Time */}
        {teamData?.teamId && (
          <Card className="border-amber-500/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Megaphone className="h-5 w-5 text-amber-500" />
                    Avisos do Time
                  </CardTitle>
                  <CardDescription>
                    Comunicados internos da sua equipe
                  </CardDescription>
                </div>
                {isOwner && (
                  <Button
                    size="sm"
                    onClick={() => setNoticeDialogOpen(true)}
                    className="gap-1.5"
                  >
                    <Megaphone className="h-4 w-4" />
                    Novo Aviso
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {notices && notices.length > 0 ? (
                <div className="space-y-3">
                  {notices.slice(0, 5).map((notice) => (
                    <NoticeCard key={notice.id} notice={notice} isOwner={isOwner} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Megaphone className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nenhum aviso publicado ainda.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* News Feed */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-destructive" />
                  Últimas Notícias
                </CardTitle>
                <CardDescription>
                  Notícias selecionadas sobre o mercado imobiliário
                </CardDescription>
              </div>
              {isOwner && teamData?.teamId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNewsDialogOpen(true)}
                  className="gap-1.5"
                >
                  <Newspaper className="h-4 w-4" />
                  Nova Notícia
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <NewsFeed />
          </CardContent>
        </Card>
      </div>

      {teamData?.teamId && (
        <>
          <CreateNoticeDialog
            open={noticeDialogOpen}
            onOpenChange={setNoticeDialogOpen}
            teamId={teamData.teamId}
            members={teamData.members}
          />
          <CreateNewsDialog
            open={newsDialogOpen}
            onOpenChange={setNewsDialogOpen}
            teamId={teamData.teamId}
            members={teamData.members}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default Noticiario;
