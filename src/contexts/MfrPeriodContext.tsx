import { createContext, useContext, useState, ReactNode } from 'react';

type MfrPeriod = 'month' | '3months' | 'year';

interface MfrPeriodContextType {
  period: MfrPeriod;
  setPeriod: (p: MfrPeriod) => void;
}

const MfrPeriodContext = createContext<MfrPeriodContextType>({
  period: 'month',
  setPeriod: () => {},
});

export function MfrPeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<MfrPeriod>('month');
  return (
    <MfrPeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </MfrPeriodContext.Provider>
  );
}

export function useMfrPeriod() {
  return useContext(MfrPeriodContext);
}
