import { ReactNode, createContext, useContext, useState } from 'react';

type CeoPeriod = 'month' | '3months' | 'year';

interface CeoPeriodContextType {
    period: CeoPeriod;
    setPeriod: (period: CeoPeriod) => void;
}

const CeoPeriodContext = createContext<CeoPeriodContextType | undefined>(undefined);

export function CeoPeriodProvider({ children }: { children: ReactNode }) {
    const [period, setPeriod] = useState<CeoPeriod>('month');

    return (
        <CeoPeriodContext.Provider value={{ period, setPeriod }}>
            {children}
        </CeoPeriodContext.Provider>
    );
}

export function useCeoPeriod() {
    const context = useContext(CeoPeriodContext);
    if (context === undefined) {
        throw new Error('useCeoPeriod must be used within a CeoPeriodProvider');
    }
    return context;
}
