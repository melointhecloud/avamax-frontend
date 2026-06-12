import { useState } from 'react';
import { TeamDashboardLayout } from '@/components/layout/team/TeamDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Bell, CheckCircle2, BookOpen, Video, Award, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function TeamTraining() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNotifyMe = async () => {
    if (!email) {
      toast.error('Por favor, insira seu email');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create notification in the notifications table
      const { error } = await supabase.from('notifications').insert({
        user_id: user?.id || '',
        title: 'Área de Treinamento',
        message: 'Você será notificado quando a Área de Treinamento estiver disponível.',
        type: 'training_waitlist',
        action_data: { email, feature: 'training_area' }
      });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Você será notificado quando disponível!');
    } catch (error) {
      console.error('Error subscribing to notification:', error);
      toast.error('Erro ao registrar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const upcomingFeatures = [
    {
      icon: Video,
      title: 'Videoaulas Exclusivas',
      description: 'Conteúdo em vídeo sobre avaliação de imóveis e técnicas de mercado'
    },
    {
      icon: BookOpen,
      title: 'Material Didático',
      description: 'PDFs e guias práticos para download e consulta'
    },
    {
      icon: Award,
      title: 'Certificações',
      description: 'Certificados de conclusão para valorizar seu currículo'
    },
    {
      icon: Users,
      title: 'Mentorias em Grupo',
      description: 'Sessões ao vivo com especialistas do mercado imobiliário'
    }
  ];

  return (
    <TeamDashboardLayout title="Área de Treinamento">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-team-accent/20 bg-gradient-to-br from-team-accent/5 to-team-primary/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-team-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="text-center pb-4 relative">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-team-accent/10 flex items-center justify-center mb-4">
              <GraduationCap className="w-10 h-10 text-team-accent" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-team-accent/10 text-team-accent text-sm font-medium mx-auto mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-team-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-team-accent"></span>
              </span>
              Em Breve
            </div>
            <CardTitle className="text-2xl md:text-3xl text-team-foreground">
              Área de Treinamento
            </CardTitle>
            <CardDescription className="text-base max-w-lg mx-auto text-team-muted-foreground">
              Estamos preparando conteúdos exclusivos para capacitar você e sua equipe 
              nas melhores práticas de avaliação imobiliária.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 relative">
            {!isSubscribed ? (
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-team-card border-team-border"
                />
                <Button 
                  onClick={handleNotifyMe}
                  disabled={isSubmitting}
                  className="bg-team-accent hover:bg-team-accent/90 text-white shrink-0"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Registrando...' : 'Avise-me'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Você será notificado quando disponível!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Features Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-team-foreground">
            O que você vai encontrar
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {upcomingFeatures.map((feature) => (
              <Card key={feature.title} className="border-team-border bg-team-card/50">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-team-accent/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-team-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-team-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-team-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline hint */}
        <Card className="border-team-border bg-team-card/30">
          <CardContent className="p-6 text-center">
            <p className="text-team-muted-foreground">
              🚀 Lançamento previsto para o <span className="text-team-foreground font-medium">primeiro trimestre de 2025</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </TeamDashboardLayout>
  );
}
