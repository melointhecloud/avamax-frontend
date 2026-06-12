import { ReactNode } from 'react';
import { RemaxSidebar } from './RemaxSidebar';
import { RemaxHeader } from './RemaxHeader';

interface RemaxDashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function RemaxDashboardLayout({ children, title }: RemaxDashboardLayoutProps) {
  return (
    <div className="remax-theme flex min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <RemaxSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col pl-0 lg:pl-64 min-w-0 overflow-x-hidden">
        <RemaxHeader title={title} />

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}