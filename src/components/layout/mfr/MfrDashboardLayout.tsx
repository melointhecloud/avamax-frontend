import { ReactNode } from 'react';
import { MfrSidebar } from './MfrSidebar';
import { MfrHeader } from './MfrHeader';
import { MfrPeriodProvider } from '@/contexts/MfrPeriodContext';

interface MfrDashboardLayoutProps {
    children: ReactNode;
    title?: string;
}

export function MfrDashboardLayout({ children, title }: MfrDashboardLayoutProps) {
    return (
        <MfrPeriodProvider>
            <div className="remax-theme flex min-h-screen bg-background text-foreground">
                <MfrSidebar />
                <div className="flex flex-1 flex-col pl-0 lg:pl-64 min-w-0 overflow-x-hidden">
                    <MfrHeader title={title} />
                    <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </MfrPeriodProvider>
    );
}
