import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { TeamSidebar } from './TeamSidebar';
import { TeamHeader } from './TeamHeader';

interface TeamDashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function TeamDashboardLayout({ children, title, subtitle }: TeamDashboardLayoutProps) {
  const { pathname } = useLocation();
  const isRemax = true;

  return (
    <div className={`flex min-h-screen bg-team-background text-team-foreground ${isRemax ? 'remax-theme' : ''}`}>
      {/* Sidebar - Desktop */}
      <TeamSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col pl-0 lg:pl-64 min-w-0 overflow-x-hidden">
        <TeamHeader title={title} />

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}


