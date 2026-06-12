import { TeamDashboardLayout } from '@/components/layout/team/TeamDashboardLayout';
import { useTeamAchievements } from '@/hooks/useTeamAchievements';
import { useTeamLayoutData } from '@/hooks/useTeamLayoutData';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressHeader } from '@/pages/Conquistas/components/ProgressHeader';
import { AchievementTrail } from '@/pages/Conquistas/components/AchievementTrail';
import { ShareableCard } from '@/pages/Conquistas/components/ShareableCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Share2 } from 'lucide-react';

export default function TeamAchievements() {
  const { profile } = useAuth();
  const { data: teamData } = useTeamLayoutData();
  const { data, isLoading } = useTeamAchievements(teamData?.teamId);
  
  if (isLoading) {
    return (
      <TeamDashboardLayout>
        <div className="space-y-6">
        <Skeleton className="h-40 w-full bg-muted" />
          <Skeleton className="h-80 w-full bg-muted" />
        </div>
      </TeamDashboardLayout>
    );
  }
  
  const achievements = data?.achievements || [];
  const stats = data?.stats || { total_value: 0 };
  
  return (
    <TeamDashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Conquistas do Time</h1>
        <p className="text-muted-foreground">Acompanhe as conquistas coletivas da sua equipe</p>
      </div>
      
      <Tabs defaultValue="trail" className="space-y-6">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="trail" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-primary">
            <Trophy className="w-4 h-4" />
            Trilha
          </TabsTrigger>
          <TabsTrigger value="share" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-primary">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="trail" className="space-y-6">
          <ProgressHeader
            achievements={achievements}
            totalValue={stats.total_value}
            isTeam
          />
          <AchievementTrail achievements={achievements} />
        </TabsContent>
        
        <TabsContent value="share">
          <div className="flex justify-center">
            <ShareableCard
              achievements={achievements}
              totalValue={stats.total_value}
              userName={profile?.nome || profile?.email || 'Gestor'}
              isTeam
              teamName={teamData?.teamName || 'Minha Equipe'}
            />
          </div>
        </TabsContent>
      </Tabs>
    </TeamDashboardLayout>
  );
}
