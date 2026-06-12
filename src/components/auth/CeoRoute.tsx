import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BrandedLoader } from '@/components/ui/BrandedLoader';
import { CeoDashboardLayout } from '@/components/layout/ceo/CeoDashboardLayout';

interface CeoRouteProps {
    children: ReactNode;
    title?: string;
}

export function CeoRoute({ children, title }: CeoRouteProps) {
    const { user, profile, loading: authLoading } = useAuth();
    const location = useLocation();

    if (authLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <BrandedLoader />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth/signin" state={{ from: location }} replace />;
    }

    // Must have is_ceo to access CEO routes
    if (!profile?.is_ceo) {
        return <Navigate to="/home" replace />;
    }

    return (
        <CeoDashboardLayout title={title}>
            {children}
        </CeoDashboardLayout>
    );
}
