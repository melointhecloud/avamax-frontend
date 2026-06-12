import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { BrandedLoader } from '@/components/ui/BrandedLoader';
import { RemaxDashboardLayout } from '@/components/layout/remax/RemaxDashboardLayout';

type AccessStatus = 'member' | 'onboarding' | 'pending' | 'denied' | 'mfr' | 'ceo';

interface TenantRouteProps {
  children: ReactNode;
  title?: string;
  /**
   * `full` (default): require onboarding + team membership, render the tenant
   * dashboard shell. `bare`: only require an authenticated tenant user (used for
   * onboarding / pending / payment screens that render their own layout).
   */
  guard?: 'full' | 'bare';
}

/**
 * Tenant-aware route guard. Generalizes the old RemaxRoute/ProtectedRoute:
 * - tenant identity comes from TenantContext (no hardcoded 'remax' string),
 * - redirects are root-relative (no `/home` namespace),
 * - the brand discriminator is `tenant.organization`.
 */
export function TenantRoute({ children, title, guard = 'full' }: TenantRouteProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const tenant = useTenant();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<AccessStatus>('onboarding');

  useEffect(() => {
    let cancelled = false;

    if (authLoading) {
      return;
    }

    if (!user) {
      setChecking(false);
      return;
    }

    if (guard === 'bare') {
      setStatus('member');
      setChecking(false);
      return;
    }

    setChecking(true);

    const finish = (nextStatus: AccessStatus) => {
      if (cancelled) return;
      setStatus(nextStatus);
      setChecking(false);
    };

    const timeoutId = window.setTimeout(() => {
      console.warn('[TenantRoute] Access check timeout, fallback to pending');
      finish('pending');
    }, 12000);

    const checkAccess = async () => {
      try {
        if (!profile || profile.organization !== tenant.organization) {
          finish('denied');
          return;
        }

        if (profile.is_ceo) {
          finish('ceo');
          return;
        }

        // MFR users should go to the MFR dashboard, not regular member routes
        if (profile.mfr_id) {
          finish('mfr');
          return;
        }

        if (!profile.remax_onboarding_complete) {
          finish('onboarding');
          return;
        }

        const { data: membership, error } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('[TenantRoute] team membership check failed:', error);
          finish('pending');
          return;
        }

        if (!membership) {
          finish('pending');
          return;
        }

        finish('member');
      } catch (error) {
        console.error('[TenantRoute] unexpected access check error:', error);
        finish('pending');
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    checkAccess();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [authLoading, user?.id, profile?.organization, profile?.mfr_id, profile?.is_ceo, profile?.remax_onboarding_complete, guard, tenant.organization]);

  if (authLoading || (guard === 'full' && checking)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <BrandedLoader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  if (guard === 'bare') {
    return <>{children}</>;
  }

  if (status === 'denied') {
    return <Navigate to="/auth/signin" replace />;
  }

  if (status === 'ceo') {
    return <Navigate to="/ceo/home" replace />;
  }

  if (status === 'mfr') {
    return <Navigate to="/mfr/home" replace />;
  }

  if (status === 'onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (status === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  // For team routes, skip the tenant dashboard shell so TeamDashboardLayout can
  // render the Team sidebar (Membros, Agenda, etc.) instead of the tenant sidebar.
  if (location.pathname.startsWith('/time')) {
    return <>{children}</>;
  }

  return (
    <RemaxDashboardLayout title={title}>
      {children}
    </RemaxDashboardLayout>
  );
}
