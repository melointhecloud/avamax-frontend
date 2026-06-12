import { useState } from 'react';
import { Menu, User, CalendarDays, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserPopover } from '@/components/layout/UserPopover';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CeoMobileSidebar } from './CeoMobileSidebar';
import { useCeoPeriod } from '@/contexts/CeoPeriodContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const periodOptions = [
  { label: 'Este Mês', value: 'month' as const },
  { label: 'Últimos 3 Meses', value: '3months' as const },
  { label: 'Este Ano', value: 'year' as const },
];

interface CeoHeaderProps {
  title?: string;
}

export function CeoHeader({ title }: CeoHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { period, setPeriod } = useCeoPeriod();

  const currentLabel = periodOptions.find(p => p.value === period)?.label || 'Este Mês';

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 lg:px-6 bg-white"
      style={{ borderColor: 'hsl(216 20% 92%)' }}
    >
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <CeoMobileSidebar onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        {title && (
          <h1 className="text-lg font-semibold" style={{ color: 'hsl(216 30% 20%)' }}>
            {title}
          </h1>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="neu-press flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
            style={{ color: 'hsl(216 25% 35%)', background: 'hsl(216 20% 97%)' }}
          >
            <CalendarDays className="h-3.5 w-3.5" style={{ color: 'hsl(216 100% 40%)' }} />
            {currentLabel}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {periodOptions.map(opt => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={period === opt.value ? 'font-bold' : ''}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <UserPopover>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <User className="h-5 w-5" />
        </Button>
      </UserPopover>
    </header>
  );
}
