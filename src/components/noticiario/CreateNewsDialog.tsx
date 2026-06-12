import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Newspaper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import type { TeamMember } from '@/hooks/useTeamLayoutData';

interface CreateNewsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teamId: string;
    members?: TeamMember[];
}

export const CreateNewsDialog = ({ open, onOpenChange, teamId, members = [] }: CreateNewsDialogProps) => {
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [link, setLink] = useState('');
    const [image, setImage] = useState('');
    const [notifyTeam, setNotifyTeam] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const location = useLocation();
    const { profile } = useAuth();
    const isRemax = location.pathname.startsWith('/home');
    const isMfr = !!profile?.mfr_id;

    const resetForm = () => {
        setTitulo('');
        setDescricao('');
        setLink('');
        setImage('');
        setNotifyTeam(true);
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        if (!titulo.trim()) return;

        setIsSubmitting(true);

        try {
            // Format date as DD/MM/YYYY
            const now = new Date();
            const dataNoticia = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

            const { error } = await supabase
                .from('noticias')
                .insert({
                    titulo: titulo.trim(),
                    descricao: descricao.trim() || null,
                    link: link.trim() || null,
                    image: image.trim() || null,
                    data_noticia: dataNoticia,
                });

            if (error) throw error;

            // Notify team or entire RE/MAX organization
            if (notifyTeam) {
                const route = isRemax ? '/noticiario' : '/noticiario';
                let memberIds: string[] = [];

                if (isMfr) {
                    // Fetch all RE/MAX organization users
                    const { data: remaxUsers } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('organization', 'remax');

                    memberIds = (remaxUsers || []).map(u => u.id);
                } else if (members.length > 0) {
                    memberIds = members.map(m => m.user_id);
                }

                if (memberIds.length > 0) {
                    await supabase.functions.invoke('notify-team', {
                        body: {
                            user_ids: memberIds,
                            title: '📰 Nova Notícia',
                            message: titulo.trim(),
                            type: 'team_notice',
                            action_data: { route },
                        },
                    });
                }
            }

            toast.success('Notícia publicada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['noticias'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            resetForm();
            onOpenChange(false);
        } catch (err) {
            console.error('Error creating news:', err);
            toast.error('Erro ao publicar notícia');
            setIsSubmitting(false);
        }
    };

    const isDisabled = !titulo.trim() || isSubmitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Newspaper className="h-5 w-5 text-destructive" />
                        Nova Notícia
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-1">
                    <div className="space-y-2">
                        <Label htmlFor="news-title">Título *</Label>
                        <Input
                            id="news-title"
                            placeholder="Ex: Mercado imobiliário em alta no primeiro trimestre"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="news-desc">Descrição (opcional)</Label>
                        <Textarea
                            id="news-desc"
                            placeholder="Detalhes da notícia..."
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="news-link">Link externo (opcional)</Label>
                        <Input
                            id="news-link"
                            placeholder="https://exemplo.com/noticia"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            type="url"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="news-image">URL da imagem (opcional)</Label>
                        <Input
                            id="news-image"
                            placeholder="https://exemplo.com/imagem.jpg"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            type="url"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="notify-toggle" className="cursor-pointer">
                                {isMfr ? 'Notificar toda a rede RE/MAX' : 'Notificar o time'}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {isMfr
                                    ? 'Enviar notificação para todos os corretores da rede'
                                    : 'Enviar notificação para todos os corretores'}
                            </p>
                        </div>
                        <Switch
                            id="notify-toggle"
                            checked={notifyTeam}
                            onCheckedChange={setNotifyTeam}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isDisabled}>
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Newspaper className="mr-2 h-4 w-4" />
                        )}
                        Publicar Notícia
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
