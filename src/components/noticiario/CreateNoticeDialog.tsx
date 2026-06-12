import { useState, useEffect, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Megaphone, Search, CalendarIcon, ImageIcon, Upload, X } from 'lucide-react';
import { useTeamEvents, CreateEventInput } from '@/hooks/useTeamEvents';
import { useMfrBrokers } from '@/hooks/useMfrBrokers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { TeamMember } from '@/hooks/useTeamLayoutData';

type NoticeScope = 'GLOBAL' | 'SELECTED' | 'INDIVIDUAL' | 'MFR' | 'MFR_BROKER';

interface CreateNoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  members?: TeamMember[];
  allTeamIds?: string[];
}

export const CreateNoticeDialog = ({ open, onOpenChange, teamId, members = [], allTeamIds }: CreateNoticeDialogProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<NoticeScope>('GLOBAL');
  const [assignedTo, setAssignedTo] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedMfrBrokers, setSelectedMfrBrokers] = useState<string[]>([]);
  const [mfrSearch, setMfrSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userMfrId, setUserMfrId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('');
  const { createEvent } = useTeamEvents(teamId, new Date());
  const queryClient = useQueryClient();
  const location = useLocation();
  const isRemax = location.pathname.startsWith('/home');

  const { data: mfrBrokers = [] } = useMfrBrokers(userMfrId);

  // Fetch user's mfr_id
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('mfr_id').eq('id', user.id).single().then(({ data }) => {
      if (data?.mfr_id) setUserMfrId(data.mfr_id);
    });
  }, [user]);

  const hasMfr = !!userMfrId;

  const filteredMfrBrokers = useMemo(() => {
    if (!mfrSearch.trim()) return mfrBrokers;
    const q = mfrSearch.toLowerCase();
    return mfrBrokers.filter(b =>
      (b.nome || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.imobiliaria || '').toLowerCase().includes(q)
    );
  }, [mfrBrokers, mfrSearch]);

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleMfrBroker = (userId: string) => {
    setSelectedMfrBrokers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const buildDatetime = (date: Date | undefined, time: string): string => {
    if (!date) return new Date().toISOString();
    const d = new Date(date);
    if (time) {
      const [h, m] = time.split(':').map(Number);
      d.setHours(h, m, 0, 0);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    return d.toISOString();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setScope('GLOBAL');
    setAssignedTo('');
    setSelectedMembers([]);
    setSelectedMfrBrokers([]);
    setMfrSearch('');
    setImageFile(null);
    setImagePreview(null);
    setStartTime('');
    setEndDate(undefined);
    setEndTime('');
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (scope === 'INDIVIDUAL' && !assignedTo) return;
    if (scope === 'SELECTED' && selectedMembers.length === 0) return;
    if (scope === 'MFR_BROKER' && selectedMfrBrokers.length === 0) return;

    setIsSubmitting(true);
    const startAt = startDate ? buildDatetime(startDate, startTime) : new Date().toISOString();
    const endAt = endDate ? buildDatetime(endDate, endTime) : startAt;
    const route = isRemax ? '/noticiario' : '/noticiario';
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;

    let imgUrl: string | null = null;
    if (imageFile && currentUserId) {
      const ext = imageFile.name.split('.').pop();
      const filePath = `${currentUserId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('team-notice-images')
        .upload(filePath, imageFile);
      if (uploadError) {
        toast.error('Erro ao enviar imagem');
        setIsSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from('team-notice-images')
        .getPublicUrl(filePath);
      imgUrl = urlData.publicUrl;
    }

    try {
      if (scope === 'MFR') {
        const broadcastTeamIds = allTeamIds?.length ? allTeamIds : [teamId];
        for (const tid of broadcastTeamIds) {
          const { error } = await (supabase as any).from('team_events').insert({
            team_id: tid,
            title: title.trim(),
            description: description.trim() || null,
            start_at: startAt,
            end_at: endAt,
            color: '#3b82f6',
            scope: 'MFR',
            mfr_id: userMfrId,
            created_by: currentUserId,
            image_url: imgUrl,
          });
          if (error) throw error;
        }

        const brokerIds = mfrBrokers.map(b => b.user_id);
        if (brokerIds.length > 0) {
          const notifMsg = description.trim()
            ? `${title.trim()}\n\n${description.trim()}`
            : title.trim();
          await supabase.functions.invoke('notify-team', {
            body: {
              user_ids: brokerIds,
              title: '📢 Novo Aviso da Rede',
              message: notifMsg,
              type: 'team_notice',
              action_data: { route },
            },
          });
        }
        toast.success('Aviso enviado para toda a rede MFR');
      } else if (scope === 'MFR_BROKER') {
        for (const brokerId of selectedMfrBrokers) {
          const { error } = await (supabase as any).from('team_events').insert({
            team_id: teamId,
            title: title.trim(),
            description: description.trim() || null,
            start_at: startAt,
            end_at: endAt,
            color: '#3b82f6',
            scope: 'ASSIGNED',
            assigned_to: brokerId,
            mfr_id: userMfrId,
            created_by: currentUserId,
            image_url: imgUrl,
          });
          if (error) throw error;
        }

        const notifMsg = description.trim()
          ? `${title.trim()}\n\n${description.trim()}`
          : title.trim();
        await supabase.functions.invoke('notify-team', {
          body: {
            user_ids: selectedMfrBrokers,
            title: '📢 Novo Aviso',
            message: notifMsg,
            type: 'team_notice',
            action_data: { route },
          },
        });
        toast.success(`Aviso enviado para ${selectedMfrBrokers.length} corretor(es)`);
      } else if (scope === 'SELECTED') {
        for (const memberId of selectedMembers) {
          const { error } = await (supabase as any).from('team_events').insert({
            team_id: teamId,
            title: title.trim(),
            description: description.trim() || null,
            start_at: startAt,
            end_at: endAt,
            color: '#3b82f6',
            scope: 'ASSIGNED',
            assigned_to: memberId,
            created_by: currentUserId,
            image_url: imgUrl,
          });
          if (error) throw error;
        }

        const notifMessage = description.trim()
          ? `${title.trim()}\n\n${description.trim()}`
          : title.trim();

        await supabase.functions.invoke('notify-team', {
          body: {
            user_ids: selectedMembers,
            title: '📢 Novo Aviso',
            message: notifMessage,
            type: 'team_notice',
            action_data: { route },
          },
        });

        toast.success('Aviso enviado para os corretores selecionados');
      } else {
        // GLOBAL or INDIVIDUAL
        const broadcastTeamIds = scope === 'GLOBAL' && allTeamIds?.length ? allTeamIds : [teamId];
        for (const tid of broadcastTeamIds) {
          const input: CreateEventInput = {
            team_id: tid,
            title: title.trim(),
            description: description.trim() || undefined,
            start_at: startAt,
            end_at: endAt,
            color: '#3b82f6',
            scope: scope === 'INDIVIDUAL' ? 'ASSIGNED' : 'GLOBAL',
            assigned_to: scope === 'INDIVIDUAL' ? assignedTo : null,
          };

          const { error } = await (supabase as any).from('team_events').insert({
            ...input,
            created_by: currentUserId,
            image_url: imgUrl,
          });
          if (error) throw error;
        }

        const targetIds = scope === 'INDIVIDUAL' && assignedTo
          ? [assignedTo]
          : members.map(m => m.user_id);

        if (targetIds.length > 0) {
          const notifMsg = description.trim()
            ? `${title.trim()}\n\n${description.trim()}`
            : title.trim();

          await supabase.functions.invoke('notify-team', {
            body: {
              user_ids: targetIds,
              title: '📢 Novo Aviso',
              message: notifMsg,
              type: 'team_notice',
              action_data: { route },
            },
          });
        }
      }

      resetForm();
      queryClient.invalidateQueries({ queryKey: ['team-notices'] });
      queryClient.invalidateQueries({ queryKey: ['team-events'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }, 1500);
      onOpenChange(false);
    } catch (err) {
      console.error('Error creating notice:', err);
      toast.error('Erro ao publicar aviso');
      setIsSubmitting(false);
    }
  };

  const isDisabled = !title.trim() || isSubmitting || createEvent.isPending
    || (scope === 'INDIVIDUAL' && !assignedTo)
    || (scope === 'SELECTED' && selectedMembers.length === 0)
    || (scope === 'MFR_BROKER' && selectedMfrBrokers.length === 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Novo Aviso para o Time
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="notice-title">Título *</Label>
              <Input
                id="notice-title"
                placeholder="Ex: Reunião geral sexta-feira"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notice-desc">Descrição (opcional)</Label>
              <Textarea
                id="notice-desc"
                placeholder="Detalhes do aviso..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                Imagem (opcional)
              </Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-28 w-full rounded-md border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1.5 top-1.5 h-6 w-6"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-muted-foreground/30 p-4 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Clique para enviar uma imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Date/Time pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data de início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Hora de início</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data de fim (opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Hora de fim</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Para quem?</Label>
              <Select value={scope} onValueChange={(v) => {
                setScope(v as NoticeScope);
                setAssignedTo('');
                setSelectedMembers([]);
                setSelectedMfrBrokers([]);
                setMfrSearch('');
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLOBAL">🌐 Todo o time</SelectItem>
                  <SelectItem value="SELECTED">👥 Alguns corretores</SelectItem>
                  <SelectItem value="INDIVIDUAL">📌 Corretor específico</SelectItem>
                  {hasMfr && (
                    <>
                      <SelectItem value="MFR">🏢 Toda a rede MFR</SelectItem>
                      <SelectItem value="MFR_BROKER">🏢 Corretores MFR</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {scope === 'SELECTED' && (
              <div className="space-y-2">
                <Label>Selecionar corretores ({selectedMembers.length} selecionados)</Label>
                <ScrollArea className="h-40 rounded-md border p-3">
                  <div className="space-y-2">
                    {members.map(m => (
                      <label
                        key={m.user_id}
                        className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedMembers.includes(m.user_id)}
                          onCheckedChange={() => toggleMember(m.user_id)}
                        />
                        <span className="text-sm">{m.name || m.email || 'Membro'}</span>
                      </label>
                    ))}
                    {members.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum membro encontrado</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {scope === 'INDIVIDUAL' && (
              <div className="space-y-2">
                <Label>Selecionar corretor</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um corretor" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.name || m.email || 'Membro'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {scope === 'MFR_BROKER' && (
              <div className="space-y-2">
                <Label>Selecionar corretores da rede ({selectedMfrBrokers.length} selecionados)</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou imobiliária..."
                    value={mfrSearch}
                    onChange={(e) => setMfrSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <ScrollArea className="h-48 rounded-md border p-3">
                  <div className="space-y-2">
                    {filteredMfrBrokers.map(b => (
                      <label
                        key={b.user_id}
                        className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedMfrBrokers.includes(b.user_id)}
                          onCheckedChange={() => toggleMfrBroker(b.user_id)}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm">{b.nome || b.email || 'Corretor'}</span>
                          {b.imobiliaria && (
                            <span className="text-[10px] text-muted-foreground">{b.imobiliaria}</span>
                          )}
                        </div>
                      </label>
                    ))}
                    {filteredMfrBrokers.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum corretor encontrado</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {scope === 'GLOBAL'
                ? 'Este aviso será visível para todos os corretores do time e eles serão notificados.'
                : scope === 'SELECTED'
                  ? `Este aviso será enviado para ${selectedMembers.length} corretor(es) selecionado(s).`
                  : scope === 'MFR'
                    ? 'Este aviso será enviado para todos os corretores da rede MFR.'
                    : scope === 'MFR_BROKER'
                      ? `Este aviso será enviado para ${selectedMfrBrokers.length} corretor(es) da rede MFR.`
                      : 'Este aviso será enviado apenas para o corretor selecionado.'}
            </p>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isDisabled}>
            {(isSubmitting || createEvent.isPending) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Megaphone className="mr-2 h-4 w-4" />
            )}
            Publicar Aviso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
