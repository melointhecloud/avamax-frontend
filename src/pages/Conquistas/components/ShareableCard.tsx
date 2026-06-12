import { useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Achievement } from '@/hooks/useAchievements';
import { TeamAchievement } from '@/hooks/useTeamAchievements';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import logo from '@/assets/avaluz-logo-transparent.png';

interface ShareableCardProps {
  achievements: (Achievement | TeamAchievement)[];
  totalValue: number;
  userName: string;
  isTeam?: boolean;
  teamName?: string;
}

export function ShareableCard({ achievements, totalValue, userName, isTeam = false, teamName }: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const getTier = () => {
    if (unlockedCount >= 20) return { name: 'Lenda', emoji: '👑' };
    if (unlockedCount >= 15) return { name: 'Mestre', emoji: '🏆' };
    if (unlockedCount >= 10) return { name: 'Expert', emoji: '🥇' };
    if (unlockedCount >= 5) return { name: 'Ativo', emoji: '⭐' };
    return { name: 'Iniciante', emoji: '🎯' };
  };
  
  const tier = getTier();
  const unlockedAchievements = achievements.filter(a => a.isUnlocked).slice(0, 8);
  
  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `conquistas-avaluz-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Imagem baixada com sucesso!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Erro ao baixar imagem');
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Baixar Imagem
        </Button>
      </div>
      
      <div
        ref={cardRef}
        className="rounded-2xl p-6 bg-card border border-border"
        style={{ width: '400px' }}
      >
        <div className="flex items-center justify-between mb-6">
          <img src={logo} alt="Avaluz" className="h-10" />
          <div className="text-right">
            <p className="text-foreground text-sm font-bold">{isTeam ? teamName : userName}</p>
            <p className="text-primary text-xs">{isTeam ? 'Time' : 'Corretor'}</p>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20">
            <span className="text-2xl">{tier.emoji}</span>
            <span className="text-foreground font-bold">{tier.name}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 rounded-xl bg-muted">
            <p className="text-3xl font-bold text-primary">{unlockedCount}</p>
            <p className="text-xs text-muted-foreground">de {totalCount} conquistas</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted">
            <p className="text-lg font-bold text-green-500">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-muted-foreground">valor avaliado</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Conquistas Recentes</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {unlockedAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-lg"
                title={achievement.name}
              >
                {achievement.icon}
              </div>
            ))}
            {unlockedCount > 8 && (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                +{unlockedCount - 8}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">avaluz.com.br</p>
        </div>
      </div>
    </div>
  );
}
