import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCredits } from '@/hooks/useUserCredits';
import { toast } from 'sonner';
import { BrandedLoader } from '@/components/ui/BrandedLoader';
import { supabase } from '@/integrations/supabase/client';

interface TeamRouteProps {
  children: ReactNode;
}

export function TeamRoute({ children }: TeamRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: userCredits, isLoading: creditsLoading } = useUserCredits();
  const location = useLocation();
  const [ensuring, setEnsuring] = useState(false);
  const [ensured, setEnsured] = useState(false);

  // Ensure team exists on first access (only for owners)
  useEffect(() => {
    async function ensureTeam() {
      if (!user || !userCredits?.is_owner || ensured || ensuring) return;

      setEnsuring(true);
      try {
        const { data, error } = await supabase.functions.invoke('ensure-team');
        if (error) {
          console.error('Error ensuring team:', error);
        } else if (data?.created) {
          toast.success('Time criado automaticamente!');
        }
        setEnsured(true);
      } catch (err) {
        console.error('Failed to ensure team:', err);
        setEnsured(true); // Don't block access on error
      } finally {
        setEnsuring(false);
      }
    }

    if (!authLoading && !creditsLoading && userCredits?.is_owner) {
      ensureTeam();
    }
  }, [user, userCredits?.is_owner, authLoading, creditsLoading, ensured, ensuring]);

  // Show toast only once when non-owner tries to access
  useEffect(() => {
    if (!authLoading && !creditsLoading && user && userCredits && !userCredits.is_owner) {
      toast.error('Área restrita para proprietários de imobiliária');
    }
  }, [authLoading, creditsLoading, user, userCredits]);

  if (authLoading || creditsLoading || ensuring) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <BrandedLoader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // Only team owners can access /time/* routes
  if (!userCredits?.is_owner) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
