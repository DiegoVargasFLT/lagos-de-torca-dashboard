import React, { useMemo } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { formatCurrency, formatPercentage } from "../../lib/utils";
import { Card } from "../Card";

export const ExecutiveSummary: React.FC = () => {
  const { filteredUFData, isConsolidated } = useDashboard();

  // PROTECCIÓN 1: Si no hay datos aún, mostrar estado de carga
  if (!filteredUFData) {
    return <div className="p-8 text-center text-gray-500">Cargando datos del resumen...</div>;
  }

  // PROTECCIÓN 2: Asegurar que siempre sea un array
  const data = filteredUFData || [];

  const stats = useMemo(() => {
    if (isConsolidated) {
      return {
        totalContractual: data.reduce((acc, uf) => acc + (uf?.constructorContract?.value ?? 0) + (uf?.interventoriaContract?.value ?? 0), 0),
        totalExecuted: data.reduce((acc, uf) => acc + (uf?.constructorContract?.executed ?? 0) + (uf?.interventoriaContract?.executed ?? 0), 0),
        globalExecution: data.length > 0 ? (data.reduce((acc, uf) => acc + (uf?.financialProgress ?? 0), 0) / data.length) : 0,
      };
    }
    const uf = data.length > 0 ? data[0] : null;
    return {
      totalContractual: (uf?.constructorContract?.value ?? 0) + (uf?.interventoriaContract?.value ?? 0),
      totalExecuted: (uf?.constructorContract?.executed ?? 0) + (uf?.interventoriaContract?.executed ?? 0),
      globalExecution: uf?.financialProgress ?? 0,
    };
  }, [isConsolidated, data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 shadow-lg border-none bg-gradient-to-br from-violet-50 to-white">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Contrato Total</p>
          <p className="text-2xl font-black text-violeta-dark">{formatCurrency(stats.totalContractual)}</p>
        </Card>
        
        <Card className="p-6 shadow-lg border-none bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Total Ejecutado</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(stats.totalExecuted)}</p>
        </Card>

        <Card className="p-6 shadow-lg border-none bg-gradient-to-br from-blue-50 to-white">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Avance Global</p>
          <p className="text-2xl font-black text-blue-600">{formatPercentage(stats.globalExecution)}</p>
        </Card>
      </div>
    </div>
  );
};