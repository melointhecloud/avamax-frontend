import { ReactNode } from 'react';
import { CeoSidebar } from './CeoSidebar';
import { CeoHeader } from './CeoHeader';
import { CeoPeriodProvider } from '@/contexts/CeoPeriodContext';

interface CeoDashboardLayoutProps {
    children: ReactNode;
    title?: string;
}

export function CeoDashboardLayout({ children, title }: CeoDashboardLayoutProps) {
    return (
        <CeoPeriodProvider>
            <div className="remax-theme flex min-h-screen bg-background text-foreground">
                <CeoSidebar />
                <div className="flex flex-1 flex-col pl-0 lg:pl-64 min-w-0 overflow-x-hidden">
                    <CeoHeader title={title} />
                    <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </CeoPeriodProvider>
    );
}
