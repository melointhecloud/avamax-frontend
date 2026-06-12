import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Globe, Users, User, Building2, Network } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMfrBrokers } from '@/hooks/useMfrBrokers';
import type { TeamMember } from '@/hooks/useTeamLayoutData';
import type { CreateEventInput } from '@/hooks/useTeamEvents';
import { ScrollArea } from '@/components/ui/scroll-area';

const EVENT_COLORS = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#f59e0b', label: 'Amarelo' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#06b6d4', label: 'Ciano' },
  { value: '#f97316', label: 'Laranja' },
];

type ScopeOption = 'GLOBAL' | 'SELECTED' | 'INDIVIDUAL' | 'MFR' | 'MFR_BROKER';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateEventInput) => void;
  isPending: boolean;
  teamId: string;
  members: TeamMember[];
  allTeamIds?: string[];
}

export function CreateEventDialog({ open, onOpenChange, onSubmit, isPending, teamId, members, allTeamIds }: CreateEventDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('#3b82f6');
  const [scopeOption, setScopeOption] = useState<ScopeOption>('GLOBAL');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedMfrBrokers, setSelectedMfrBrokers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userMfrId, setUserMfrId] = useState<string | null>(null);
  const [mfrBrokerSearch, setMfrBrokerSearch] = useState('');

  const { data: mfrBrokers = [] } = useMfrBrokers(userMfrId);

  // Fetch user's mfr_id
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('mfr_id')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setUserMfrId(data?.mfr_id || null);
      });
  }, [user]);

  const hasMfr = !!userMfrId;

  const filteredMfrBrokers = mfrBrokers.filter(b => {
    if (!mfrBrokerSearch) return true;
    const search = mfrBrokerSearch.toLowerCase();
    return (b.nome?.toLowerCase().includes(search) || b.email?.toLowerCase().includes(search) || b.imobiliaria?.toLowerCase().includes(search));
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime('09:00');
    setEndTime('10:00');
    setColor('#3b82f6');
    setScopeOption('GLOBAL');
    setAssignedTo('');
    setSelectedMembers([]);
    setSelectedMfrBrokers([]);
    setMfrBrokerSearch('');
  };

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

  const selectAllMembers = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(m => m.user_id));
    }
  };

  const selectAllMfrBrokers = () => {
    if (selectedMfrBrokers.length === mfrBrokers.length) {
      setSelectedMfrBrokers([]);
    } else {
      setSelectedMfrBrokers(mfrBrokers.map(b => b.user_id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;
    setIsSubmitting(true);

    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    const start = new Date(startDate);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(endDate);
    end.setHours(eh, em, 0, 0);

    try {
      if (scopeOption === 'GLOBAL') {
        const broadcastTeamIds = allTeamIds?.length ? allTeamIds : [teamId];
        for (const tid of broadcastTeamIds) {
          const input: CreateEventInput = {
            team_id: tid,
            title,
            description: description || undefined,
            start_at: start.toISOString(),
            end_at: end.toISOString(),
            color,
            scope: 'GLOBAL',
            assigned_to: null,
          };
          if (tid === teamId) {
            onSubmit(input);
          } else {
            await (supabase as any).from('team_events').insert({
              ...input,
              created_by: user!.id,
            });
          }
        }

        const targetIds = members.map(m => m.user_id);
        if (targetIds.length > 0) {
          await supabase.functions.invoke('notify-team', {
            body: {
              user_ids: targetIds,
              title: '📅 Novo Evento',
              message: `${title} — ${format(start, "dd/MM 'às' HH:mm", { locale: ptBR })}`,
              type: 'team_event',
              action_data: { route: '/time/agenda' },
            },
          }).catch(() => {});
        }
      } else if (scopeOption === 'INDIVIDUAL') {
        const input: CreateEventInput = {
          team_id: teamId,
          title,
          description: description || undefined,
          start_at: start.toISOString(),
          end_at: end.toISOString(),
          color,
          scope: 'ASSIGNED',
          assigned_to: assignedTo || null,
        };
        onSubmit(input);

        if (assignedTo) {
          await supabase.functions.invoke('notify-team', {
            body: {
              user_ids: [assignedTo],
              title: '📅 Novo Evento',
              message: `${title} — ${format(start, "dd/MM 'às' HH:mm", { locale: ptBR })}`,
              type: 'team_event',
              action_data: { route: '/time/agenda' },
            },
          }).catch(() => {});
        }
      } else if (scopeOption === 'SELECTED') {
        for (const memberId of selectedMembers) {
          const eventData = {
            team_id: teamId,
            title,
            description: description || null,
            start_at: start.toISOString(),
            end_at: end.toISOString(),
            color,
            scope: 'ASSIGNED',
            assigned_to: memberId,
            created_by: user!.id,
          };
          await (supabase as any).from('team_events').insert(eventData);
        }

        if (selectedMembers.length > 0) {
          await supabase.functions.invoke('notify-team', {
            body: {
              user_ids: selectedMembers,
              title: '📅 Novo Evento',
              message: `${title} — ${format(start, "dd/MM 'às' HH:mm", { locale: ptBR })}`,
              type: 'team_event',
              action_data: { route: '/time/agenda' },
            },
          }).catch(() => {});
        }
      } else if (scopeOption === 'MFR') {
        // MFR-wide event — broadcast to all franchise teams
        const broadcastTeamIds = allTeamIds?.length ? allTeamIds : [teamId];
        for (const tid of broadcastTeamIds) {
          const input: CreateEventInput = {
            team_id: tid,
            title,
            description: description || undefined,
            start_at: start.toISOString(),
            end_at: end.toISOString(),
            color,
            scope: 'MFR',
            assigned_to: null,
            mfr_id: userMfrId,
          };
          if (tid === teamId) {
            onSubmit(input);
          } else {
            await (supabase as any).from('team_events').insert({
              ...input,
              created_by: user!.id,
            });
          }
        }

        // Notify all MFR brokers
        const brokerIds = mfrBrokers.map(b => b.user_id);
        if (brokerIds.length > 0) {
          await supabase.functions.invoke('notify-team', {
            body: {
              user_ids: brokerIds,
              title: '📅 Evento MFR',
              message: `${title} — ${format(start, "dd/MM 'às' HH:mm", { locale: ptBR })}`,
              type: 'team_event',
              action_data: { route: '/time/agenda' },
            },
          }).catch(() => {});
        }
      } else if (scopeOption === 'MFR_BROKER') {
        // Assigned to specific MFR brokers - create one ASSIGNED event per broker
        for (const brokerId of selectedMfrBrokers) {
          const eventData = {
            team_id: teamId,
            title,
            description: description || null,
            start_at: start.toISOString(),
            end_at: end.toISOString(),
            color,
            scope: 'ASSIGNED',
            assigned_to: brokerId,
            created_by: user!.id,
            mfr_id: userMfrId,
          };
          await (supabase as any).from('team_events').insert(eventData);
        }

        if (selectedMfrBrokers.length > 0) {
          await supabase.functions.invoke('notify-team', {
            body: {
              user_ids: selectedMfrBrokers,
              title: '📅 Evento MFR',
              message: `${title} — ${format(start, "dd/MM 'às' HH:mm", { locale: ptBR })}`,
              type: 'team_event',
              action_data: { route: '/time/agenda' },
            },
          }).catch(() => {});
        }
      }

      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.warn('Error creating event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title && startDate && endDate &&
    (scopeOption === 'GLOBAL' ||
     scopeOption === 'MFR' ||
     (scopeOption === 'INDIVIDUAL' && assignedTo) ||
     (scopeOption === 'SELECTED' && selectedMembers.length > 0) ||
     (scopeOption === 'MFR_BROKER' && selectedMfrBrokers.length > 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="remax-theme sm:max-w-md bg-team-sidebar border-team-border text-team-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Reunião de equipe" className="bg-team-card border-team-border" required />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes do evento..." className="bg-team-card border-team-border" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal bg-team-card border-team-border', !startDate && 'text-team-muted')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : 'Selecionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={(d) => { setStartDate(d); if (!endDate) setEndDate(d); }} className="pointer-events-auto" locale={ptBR} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Hora Início</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-team-card border-team-border" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data Fim *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal bg-team-card border-team-border', !endDate && 'text-team-muted')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : 'Selecionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} className="pointer-events-auto" locale={ptBR} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Hora Fim</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="bg-team-card border-team-border" />
            </div>
          </div>

          <div>
            <Label>Cor</Label>
            <div className="flex gap-2 mt-1">
              {EVENT_COLORS.map(c => (
                <button key={c.value} type="button" onClick={() => setColor(c.value)}
                  className={cn('h-7 w-7 rounded-full border-2 transition-transform', color === c.value ? 'border-white scale-110' : 'border-transparent')}
                  style={{ backgroundColor: c.value }} title={c.label} />
              ))}
            </div>
          </div>

          {/* Scope selection */}
          <div>
            <Label>Visibilidade</Label>
            <div className={cn('grid gap-2 mt-1', hasMfr ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-3')}>
              <button
                type="button"
                onClick={() => setScopeOption('GLOBAL')}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors',
                  scopeOption === 'GLOBAL'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-team-border bg-team-card text-team-muted hover:border-team-border/80'
                )}
              >
                <Globe className="h-4 w-4" />
                Global
              </button>
              <button
                type="button"
                onClick={() => setScopeOption('SELECTED')}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors',
                  scopeOption === 'SELECTED'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                    : 'border-team-border bg-team-card text-team-muted hover:border-team-border/80'
                )}
              >
                <Users className="h-4 w-4" />
                Alguns
              </button>
              <button
                type="button"
                onClick={() => setScopeOption('INDIVIDUAL')}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors',
                  scopeOption === 'INDIVIDUAL'
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-team-border bg-team-card text-team-muted hover:border-team-border/80'
                )}
              >
                <User className="h-4 w-4" />
                Individual
              </button>
              {hasMfr && (
                <>
                  <button
                    type="button"
                    onClick={() => setScopeOption('MFR')}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors',
                      scopeOption === 'MFR'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-team-border bg-team-card text-team-muted hover:border-team-border/80'
                    )}
                  >
                    <Network className="h-4 w-4" />
                    MFR
                  </button>
                  <button
                    type="button"
                    onClick={() => setScopeOption('MFR_BROKER')}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors',
                      scopeOption === 'MFR_BROKER'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-team-border bg-team-card text-team-muted hover:border-team-border/80'
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                    Corretor MFR
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Multi-select for SELECTED scope */}
          {scopeOption === 'SELECTED' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Selecionar corretores</Label>
                <button type="button" onClick={selectAllMembers} className="text-[10px] text-team-orange hover:underline">
                  {selectedMembers.length === members.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>
              <ScrollArea className="max-h-[140px] rounded-lg border border-team-border bg-team-card p-2">
                <div className="space-y-1">
                  {members.map(m => (
                    <label key={m.user_id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-team-accent/30 cursor-pointer transition-colors">
                      <Checkbox
                        checked={selectedMembers.includes(m.user_id)}
                        onCheckedChange={() => toggleMember(m.user_id)}
                        className="border-team-border data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                      <span className="text-xs text-team-foreground">{m.name || m.email || 'Membro'}</span>
                    </label>
                  ))}
                  {members.length === 0 && (
                    <p className="text-xs text-team-muted py-2 text-center">Nenhum membro no time</p>
                  )}
                </div>
              </ScrollArea>
              {selectedMembers.length > 0 && (
                <p className="text-[10px] text-team-muted mt-1">{selectedMembers.length} corretor(es) selecionado(s)</p>
              )}
            </div>
          )}

          {/* Single select for INDIVIDUAL scope */}
          {scopeOption === 'INDIVIDUAL' && (
            <div>
              <Label>Atribuir a</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="bg-team-card border-team-border">
                  <SelectValue placeholder="Selecionar corretor" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.user_id} value={m.user_id}>{m.name || m.email || 'Membro'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* MFR Broker multi-select */}
          {scopeOption === 'MFR_BROKER' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Selecionar corretores MFR</Label>
                <button type="button" onClick={selectAllMfrBrokers} className="text-[10px] text-team-orange hover:underline">
                  {selectedMfrBrokers.length === mfrBrokers.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>
              <Input
                placeholder="Buscar corretor..."
                value={mfrBrokerSearch}
                onChange={e => setMfrBrokerSearch(e.target.value)}
                className="bg-team-card border-team-border mb-2 h-8 text-xs"
              />
              <ScrollArea className="max-h-[160px] rounded-lg border border-team-border bg-team-card p-2">
                <div className="space-y-1">
                  {filteredMfrBrokers.map(b => (
                    <label key={b.user_id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-team-accent/30 cursor-pointer transition-colors">
                      <Checkbox
                        checked={selectedMfrBrokers.includes(b.user_id)}
                        onCheckedChange={() => toggleMfrBroker(b.user_id)}
                        className="border-team-border data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs text-team-foreground">{b.nome || b.email || 'Corretor'}</span>
                        {b.imobiliaria && <span className="text-[10px] text-team-muted">{b.imobiliaria}</span>}
                      </div>
                    </label>
                  ))}
                  {filteredMfrBrokers.length === 0 && (
                    <p className="text-xs text-team-muted py-2 text-center">Nenhum corretor encontrado</p>
                  )}
                </div>
              </ScrollArea>
              {selectedMfrBrokers.length > 0 && (
                <p className="text-[10px] text-team-muted mt-1">{selectedMfrBrokers.length} corretor(es) MFR selecionado(s)</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-team-muted">Cancelar</Button>
            <Button type="submit" disabled={isPending || isSubmitting || !isFormValid} className="bg-team-orange hover:bg-team-orange/90 text-white">
              {isPending || isSubmitting ? 'Criando...' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
