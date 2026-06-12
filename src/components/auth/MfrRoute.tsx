import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BrandedLoader } from '@/components/ui/BrandedLoader';
import { MfrDashboardLayout } from '@/components/layout/mfr/MfrDashboardLayout';

interface MfrRouteProps {
    children: ReactNode;
    title?: string;
}

export function MfrRoute({ children, title }: MfrRouteProps) {
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

    // Must have mfr_id to access MFR routes
    if (!profile?.mfr_id) {
        return <Navigate to="/home" replace />;
    }

    return (
        <MfrDashboardLayout title={title}>
            {children}
        </MfrDashboardLayout>
    );
}
