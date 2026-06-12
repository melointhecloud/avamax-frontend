import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TeamData {
  id: string;
  name: string;
  plan: string;
  monthly_credits: number;
  seat_limit: number;
  owner_id?: string;
  owner_email?: string | null;
}

const isRemaxDomain = (email?: string | null) =>
  (email || '').toLowerCase().endsWith('@remax.com.br');

export function useTeamSubscription() {
  const { user, profile } = useAuth();
  const { pathname } = useLocation();

  const { data: teamData, isLoading, error } = useQuery({
    queryKey: ['team-subscription', user?.id, pathname, user?.email, profile?.email],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: ownedTeam } = await supabase
        .from('teams')
        .select('id, name, plan, monthly_credits, seat_limit, owner_id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (ownedTeam) {
        return {
          ...(ownedTeam as TeamData),
          owner_email: user.email || profile?.email || null,
        };
      }

      const { data: membership } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (membership?.team_id) {
        const { data: team } = await supabase
          .from('teams')
          .select('id, name, plan, monthly_credits, seat_limit, owner_id')
          .eq('id', membership.team_id)
          .single();

        if (!team) return null;

        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', team.owner_id)
          .maybeSingle();

        return {
          ...(team as TeamData),
          owner_email: ownerProfile?.email || null,
        };
      }

      return null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const isTeamPlan = !!teamData;
  const planName = teamData?.plan || 'FREE';
  const isRemaxRoute = true;
  const knownEmails = [user?.email, profile?.email, teamData?.owner_email].filter(Boolean);
  const isRemaxEmail = knownEmails.some((email) => isRemaxDomain(email));
  const isUnlimitedSeats = isRemaxRoute && isRemaxEmail;

  return {
    teamData,
    isTeamPlan,
    planName,
    seatLimit: teamData?.seat_limit || 0,
    isRemaxContext: isUnlimitedSeats,
    isRemaxRoute,
    isRemaxEmail,
    isUnlimitedSeats,
    monthlyCredits: teamData?.monthly_credits || 0,
    isLoading,
    error,
  };
}
