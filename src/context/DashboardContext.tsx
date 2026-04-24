import React, { createContext, useContext, useState, ReactNode } from "react";
import { View, UFData } from "../types";
import { ufData } from "../data/mockData";

interface DashboardContextType {
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedUFIds: string[];
  setSelectedUFIds: (ids: string[]) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  filteredUFData: UFData[];
  isConsolidated: boolean;
  selectedUFId: string | null;
  selectedUF: UFData | null;
  updateUFData: (ufId: string, patch: Partial<UFData>) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<View>("resumen");
  const [selectedUFIds, setSelectedUFIds] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("20-Oct-24");
  const [patchedUfData, setPatchedUfData] = useState<UFData[]>(ufData);

  const updateUFData = (ufId: string, patch: Partial<UFData>) => {
    setPatchedUfData(prev => prev.map(uf => 
      uf.id === ufId ? { ...uf, ...patch } : uf
    ));
  };

  const filteredUFData = selectedUFIds.length === 0 
    ? patchedUfData 
    : patchedUfData.filter(uf => selectedUFIds.includes(uf.id));

  const isConsolidated = selectedUFIds.length === 0 || selectedUFIds.length > 1;
  const selectedUFId = selectedUFIds.length === 1 ? selectedUFIds[0] : null;
  const selectedUF = selectedUFIds.length === 1 ? filteredUFData[0] : null;

  return (
    <DashboardContext.Provider value={{
      currentView,
      setCurrentView,
      selectedUFIds,
      setSelectedUFIds,
      selectedPeriod,
      setSelectedPeriod,
      filteredUFData,
      isConsolidated,
      selectedUFId,
      selectedUF,
      updateUFData
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
