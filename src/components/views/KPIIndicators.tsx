import React from "react";
import { Target, Info } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { formatPercentage, cn, formatCurrency } from "../../lib/utils";
import { Card } from "../Card";
import { motion } from "motion/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export const KPIIndicators: React.FC = () => {
  const { filteredUFData, setSelectedUFIds, setCurrentView, selectedUF } = useDashboard();

  // PROTECCIÓN 1: Si no hay datos, mostrar carga (esto evita el error del .map)
  const safeData = filteredUFData || [];
  
  if (safeData.length === 0) {
    return <div className="p-8 text-center text-gray-500 font-bold">Cargando indicadores de desempeño...</div>;
  }

  // PROTECCIÓN 2: Cálculos matemáticos seguros
  const progress = selectedUF?.financialProgress ?? 0;
  const programmed = selectedUF?.financialProgrammed ?? 0;
  const executed = selectedUF?.constructorContract?.executed ?? 0;
  const invoiced = selectedUF?.constructorContract?.invoiced ?? 0;

  const kpiStats = [
    { 
      label: "Diferencia de Avance", 
      value: `${(progress - programmed).toFixed(2)}%`, 
      status: progress >= programmed ? "ok" : "warning",
    },
    { 
      label: "Eficiencia de Ejecución", 
      value: programmed > 0 ? (progress / programmed).toFixed(2) : "0.00", 
      status: programmed > 0 && (progress / programmed) >= 0.9 ? "ok" : "warning",
    },
    { 
      label: "Eficiencia de Facturación", 
      value: executed > 0 ? (((invoiced / executed) * 100).toFixed(1) + "%") : "0%", 
      status: "ok",
    },
    { 
      label: "Pendiente por Facturar", 
      value: formatCurrency(executed - invoiced), 
      status: (executed - invoiced) > 0 ? "warning" : "ok",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiStats.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 border-none shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 rounded-xl", kpi.status === "ok" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                  <Target size={18} />
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-xl font-bold text-violeta-dark">{kpi.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gráfica blindada contra errores */}
      <Card className="p-4 md:p-8">
        <h3 className="text-lg font-bold mb-6">Estado de Avance Económico</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* Usamos safeData para asegurar que nunca sea undefined */}
            <BarChart data={safeData} margin={{ left: -20, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="financialProgrammed" fill="#61B1E3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="financialProgress" fill="#74C6D3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};