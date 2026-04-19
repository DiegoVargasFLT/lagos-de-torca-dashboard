import React, { useState } from "react";
import { formatCurrency, formatPercentage } from "../lib/utils";

interface BudgetAnalysisTableProps {
  uf: any;
}

export const BudgetAnalysisTable: React.FC<BudgetAnalysisTableProps> = ({ uf }) => {
  // PROTECCIÓN: Si el objeto uf no ha cargado, no renderizamos la tabla
  if (!uf) {
    return <div className="p-8 text-center text-gray-500">Cargando presupuesto...</div>;
  }

  // Cálculos matemáticos 100% seguros
  const totalBudget = uf?.constructorContract?.value ?? 0;
  const totalExecuted = uf?.constructorContract?.executed ?? 0;
  const totalInvoiced = uf?.constructorContract?.invoiced ?? 0;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-black text-violeta-dark mb-6">Dashboard Presupuestal {uf?.id || ""}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 font-bold uppercase">Presupuesto</p>
          <p className="text-lg font-black">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 font-bold uppercase">Ejecutado</p>
          <p className="text-lg font-black text-emerald-600">{formatCurrency(totalExecuted)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 font-bold uppercase">Facturado</p>
          <p className="text-lg font-black text-blue-600">{formatCurrency(totalInvoiced)}</p>
        </div>
      </div>
    </div>
  );
};