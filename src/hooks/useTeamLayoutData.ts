import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TeamMember {
  user_id: string;
  role: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export interface TeamLayoutData {
  members: TeamMember[];
  teamName: string | null;
  teamId: string | null;
  userRole: string;
  totalMembers: number;
}

export function useTeamLayoutData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team-layout-data', user?.id],
    queryFn: async (): Promise<TeamLayoutData> => {
      // 1. Buscar team_id do usuário (como membro ou owner)
      const { data: memberData } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user!.id)
        .single();

      let teamId = memberData?.team_id;
      let userRole = memberData?.role || 'member';

      // Se não for membro, verificar se é owner
      if (!teamId) {
        const { data: ownedTeam } = await supabase
          .from('teams')
          .select('id, name')
          .eq('owner_id', user!.id)
          .single();

        if (ownedTeam) {
          teamId = ownedTeam.id;
          userRole = 'owner';
        }
      }

      if (!teamId) {
        return {
          members: [],
          teamName: null,
          teamId: null,
          userRole: 'member',
          totalMembers: 0,
        };
      }

      // 2. Buscar informações do time
      const { data: team } = await supabase
        .from('teams')
        .select('name, owner_id')
        .eq('id', teamId)
        .single();

      // Ensure the actual team owner always gets the 'owner' role
      if (team?.owner_id === user!.id) {
        userRole = 'owner';
      }

      // 3. Buscar todos os membros do time com seus perfis
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('user_id, role')
        .eq('team_id', teamId);

      // 4. Buscar perfis dos membros
      const memberIds = teamMembers?.map(m => m.user_id) || [];

      // Adicionar owner se não estiver na lista de membros
      if (team?.owner_id && !memberIds.includes(team.owner_id)) {
        memberIds.push(team.owner_id);
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, email, avatar_url')
        .in('id', memberIds);

      // 5. Combinar dados
      const members: TeamMember[] = memberIds.map(id => {
        const profile = profiles?.find(p => p.id === id);
        const memberRole = id === team?.owner_id
          ? 'owner'
          : teamMembers?.find(m => m.user_id === id)?.role || 'member';

        return {
          user_id: id,
          role: memberRole,
          name: profile?.nome || null,
          email: profile?.email || null,
          avatar_url: profile?.avatar_url || null,
        };
      });

      // Ordenar: owner primeiro, depois por nome
      members.sort((a, b) => {
        if (a.role === 'owner') return -1;
        if (b.role === 'owner') return 1;
        return (a.name || '').localeCompare(b.name || '');
      });

      return {
        members,
        teamName: team?.name || null,
        teamId,
        userRole,
        totalMembers: members.length,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function getRoleLabel(role: string): string {
  const normalizedRole = role.toLowerCase();
  const roleLabels: Record<string, string> = {
    owner: 'Proprietário',
    admin: 'Administrador',
    member: 'Membro',
  };
  return roleLabels[normalizedRole] || 'Membro';
}
