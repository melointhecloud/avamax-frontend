import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAchievements } from '@/hooks/useAchievements';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressHeader } from './components/ProgressHeader';
import { AchievementTrail } from './components/AchievementTrail';
import { ShareableCard } from './components/ShareableCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Share2 } from 'lucide-react';

export default function Conquistas() {
  const { profile } = useAuth();
  const { data, isLoading } = useAchievements();
  
  if (isLoading) {
    return (
      <DashboardLayout title="Conquistas" subtitle="Acompanhe seu progresso e desbloqueie conquistas">
        <div className="space-y-6">
          <Skeleton className="h-40 w-full bg-card" />
          <Skeleton className="h-80 w-full bg-card" />
        </div>
      </DashboardLayout>
    );
  }
  
  const achievements = data?.achievements || [];
  const stats = data?.stats || { total_value: 0 };
  
  return (
    <DashboardLayout title="Conquistas" subtitle="Acompanhe seu progresso e desbloqueie conquistas">
      <Tabs defaultValue="trail" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="trail" className="gap-2">
            <Trophy className="w-4 h-4" />
            Trilha
          </TabsTrigger>
          <TabsTrigger value="share" className="gap-2">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="trail" className="space-y-6">
          <ProgressHeader
            achievements={achievements}
            totalValue={stats.total_value}
          />
          <AchievementTrail achievements={achievements} />
        </TabsContent>
        
        <TabsContent value="share">
          <div className="flex justify-center">
            <ShareableCard
              achievements={achievements}
              totalValue={stats.total_value}
              userName={profile?.nome || profile?.email || 'Corretor'}
            />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
