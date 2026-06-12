import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle, 
  BookOpen, 
  Video, 
  Clock,
  Sparkles,
  FileText,
  Calculator,
  Users
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TutorialAvaluz = () => {
  const location = useLocation();
  const isRemax = location.pathname.startsWith('/home');
  const iconColor = isRemax ? 'text-destructive' : 'text-primary';
  const iconBg = isRemax ? 'bg-destructive/10' : 'bg-primary/10';
  const upcomingVideos = [
    {
      icon: PlayCircle,
      title: 'Introdução ao AvaLuz',
      description: 'Conheça a plataforma e entenda como ela pode ajudar no seu dia a dia.',
      duration: '~5 min'
    },
    {
      icon: Calculator,
      title: 'Como Fazer uma Avaliação',
      description: 'Passo a passo completo para realizar sua primeira avaliação de imóvel.',
      duration: '~8 min'
    },
    {
      icon: FileText,
      title: 'Entendendo o Relatório',
      description: 'Aprenda a interpretar os resultados e gráficos da avaliação.',
      duration: '~6 min'
    },
    {
      icon: Sparkles,
      title: 'Dicas para Avaliações Precisas',
      description: 'Melhores práticas para obter avaliações mais precisas.',
      duration: '~4 min'
    },
    {
      icon: Users,
      title: 'Gerenciando seu Time',
      description: 'Como adicionar membros e gerenciar créditos compartilhados.',
      duration: '~5 min'
    }
  ];

  return (
    <DashboardLayout 
      title="Tutorial AvaLuz" 
      subtitle="Aprenda a usar todas as funcionalidades do sistema"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Em Breve Banner */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isRemax ? 'bg-destructive/20' : 'bg-primary/20'}`}>
              <Video className={`h-8 w-8 ${iconColor}`} />
            </div>
            <Badge className={`mb-4 ${isRemax ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}>
              Em Breve
            </Badge>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Tutoriais em Vídeo
            </h2>
            <p className="max-w-md text-muted-foreground">
              Estamos preparando uma série de vídeos tutoriais para ajudá-lo a aproveitar 
              ao máximo todas as funcionalidades do AvaLuz. Fique ligado nas próximas atualizações!
            </p>
          </CardContent>
        </Card>

        {/* O que está por vir */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
                <BookOpen className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <CardTitle>O que está por vir</CardTitle>
                <CardDescription>
                  Confira os vídeos que estamos preparando para você
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingVideos.map((video, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 opacity-70"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    <video.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{video.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {video.duration}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enquanto isso... */}
        <Card className="border-muted">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${isRemax ? 'bg-destructive/10' : 'bg-muted'}`}>
                <Sparkles className={`h-5 w-5 ${isRemax ? 'text-destructive' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <h3 className="font-medium">Enquanto isso...</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Você pode explorar o sistema por conta própria! A interface foi projetada 
                  para ser intuitiva e fácil de usar. Se tiver dúvidas, nossa equipe está 
                  sempre disponível para ajudar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TutorialAvaluz;
