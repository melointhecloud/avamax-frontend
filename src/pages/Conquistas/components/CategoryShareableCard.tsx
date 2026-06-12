import { useRef, useState } from 'react';
import { Download, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Achievement } from '@/hooks/useAchievements';
import { TeamAchievement } from '@/hooks/useTeamAchievements';
import { getCategoryLabel, getCategoryColor, getCategoryIcon, AchievementCategory } from '@/lib/achievements';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import logo from '@/assets/avaluz-logo-transparent.png';

interface CategoryShareableCardProps {
  category: AchievementCategory;
  achievements: (Achievement | TeamAchievement)[];
  userName: string;
  isTeam?: boolean;
  teamName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryShareableCard({ 
  category, 
  achievements, 
  userName, 
  isTeam = false, 
  teamName,
  isOpen,
  onClose
}: CategoryShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const categoryLabel = getCategoryLabel(category);
  const categoryColor = getCategoryColor(category);
  const categoryIcon = getCategoryIcon(category);
  
  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `conquistas-${category}-avaluz-${Date.now()}.png`;
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
  
  const handleCopyToClipboard = async () => {
    if (!cardRef.current) return;
    
    setIsCopying(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
      });
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopied(true);
            toast.success('Imagem copiada para área de transferência!');
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            toast.error('Erro ao copiar imagem');
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error copying image:', error);
      toast.error('Erro ao copiar imagem');
    } finally {
      setIsCopying(false);
    }
  };
  
  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="remax-theme max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <span>{categoryIcon}</span>
            Compartilhar {categoryLabel}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCopyToClipboard}
              disabled={isCopying}
              className="border-border text-foreground hover:bg-muted"
            >
              {isCopying ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : copied ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
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
              Baixar
            </Button>
          </div>
          
          <div
            ref={cardRef}
            className="rounded-2xl p-6 bg-card border border-border"
            style={{ width: '100%' }}
          >
            <div className="flex items-center justify-between mb-6">
              <img src={logo} alt="Avaluz" className="h-8" />
              <div className="text-right">
                <p className="text-foreground text-sm font-bold">{isTeam ? teamName : userName}</p>
                <p className="text-primary text-xs">{isTeam ? 'Time' : 'Corretor'}</p>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: `${categoryColor}30` }}
              >
                <span className="text-2xl">{categoryIcon}</span>
                <span className="text-foreground font-bold text-lg">{categoryLabel}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso</span>
                <span className="text-foreground font-bold">{unlockedCount} de {totalCount}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(unlockedCount / totalCount) * 100}%`,
                    backgroundColor: categoryColor 
                  }}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex flex-wrap justify-center gap-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                      achievement.isUnlocked
                        ? 'bg-gradient-to-br from-primary to-amber-500'
                        : 'bg-muted opacity-40'
                    }`}
                    title={achievement.name}
                  >
                    {achievement.icon}
                  </div>
                ))}
              </div>
            </div>
            
            {unlockedAchievements.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider text-center">
                  Conquistas Desbloqueadas
                </p>
                <div className="space-y-1">
                  {unlockedAchievements.slice(0, 3).map(achievement => (
                    <div 
                      key={achievement.id}
                      className="flex items-center gap-2 text-sm text-muted-foreground justify-center"
                    >
                      <span>{achievement.icon}</span>
                      <span>{achievement.name}</span>
                    </div>
                  ))}
                  {unlockedAchievements.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{unlockedAchievements.length - 3} outras
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">avaluz.com.br</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
