import React from "react";
import { useDashboard } from "../../context/DashboardContext";
import { formatPercentage, formatCurrency } from "../../lib/utils";
import { Card } from "./Card";

export const KPIIndicators: React.FC = () => {
  const { selectedUF } = useDashboard();

  // Si no hay datos, renderizamos un placeholder o vacío para evitar el crash
  if (!selectedUF) {
    return <div className="text-sm text-gray-400">Selecciona una unidad funcional para ver los indicadores.</div>;
  }

  const kpiStats = [
    { 
      label: "Diferencia de Avance", 
      value: ((selectedUF?.financialProgress ?? 0) - (selectedUF?.financialProgrammed ?? 0)).toFixed(2) + "%" 
    },
    { 
      label: "Eficiencia de Ejecución", 
      value: (selectedUF?.financialProgress ?? 0).toFixed(2) + "%"
    },
    { 
      label: "Pendiente por Facturar", 
      value: formatCurrency((selectedUF?.constructorContract?.executed ?? 0) - (selectedUF?.constructorContract?.invoiced ?? 0))
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpiStats.map((stat, index) => (
        <Card key={index} className="p-4">
          <p className="text-[10px] uppercase font-bold text-gray-400">{stat.label}</p>
          <p className="text-lg font-black text-violeta-dark">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
};