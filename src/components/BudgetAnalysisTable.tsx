import React from "react";
import { formatCurrency, formatPercentage } from "../lib/utils";
import { DollarSign } from "lucide-react";

interface BudgetAnalysisTableProps {
  uf: any;
}

export const BudgetAnalysisTable: React.FC<BudgetAnalysisTableProps> = ({ uf }) => {
  // Acceso seguro a las propiedades del objeto uf
  const constructor = uf?.constructorContract;
  const interventoria = uf?.interventoriaContract;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-black text-violeta-dark mb-4">Análisis Presupuestal</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
              <th className="pb-3">Componente</th>
              <th className="pb-3 text-right">Valor Total</th>
              <th className="pb-3 text-right">Ejecutado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-4 font-bold text-gray-700">Constructor</td>
              <td className="py-4 text-right">{formatCurrency(constructor?.value ?? 0)}</td>
              <td className="py-4 text-right">{formatCurrency(constructor?.executed ?? 0)}</td>
            </tr>
            <tr>
              <td className="py-4 font-bold text-gray-700">Interventoría</td>
              <td className="py-4 text-right">{formatCurrency(interventoria?.value ?? 0)}</td>
              <td className="py-4 text-right">{formatCurrency(interventoria?.executed ?? 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};