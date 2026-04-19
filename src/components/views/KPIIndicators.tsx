import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Zap, 
  BarChart3,
  Info
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { formatPercentage, cn, formatCurrency } from "../../lib/utils";
import { Card } from "../Card";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart,
  Line
} from "recharts";
import { motion } from "motion/react";

export const KPIIndicators: React.FC = () => {
  const { filteredUFData, setSelectedUFIds, setCurrentView, selectedUF } = useDashboard();

  // --- LÓGICA DE CÁLCULO SEGURA ---
  // Protegemos cada operación para evitar errores si los datos son null o undefined
  
  const progress = selectedUF?.financialProgress ?? 0;
  const programmed = selectedUF?.financialProgrammed ?? 0;
  const contract = selectedUF?.constructorContract;
  const executed = contract?.executed ?? 0;
  const invoiced = contract?.invoiced ?? 0;

  const kpiStats = [
    { 
      label: "Diferencia de Avance", 
      value: `${(progress - programmed).toFixed(2)}%`, 
      status: progress >= programmed ? "ok" : "warning",
      description: "Diferencia porcentual entre el avance económico real y el programado."
    },
    { 
      label: "Eficiencia de Ejecución", 
      value: programmed > 0 ? (progress / programmed).toFixed(2) : "0.00", 
      status: programmed > 0 && (progress / programmed) >= 0.9 ? "ok" : "warning",
      description: "Relación entre el avance económico real y el programado."
    },
    { 
      label: "Eficiencia de Facturación", 
      value: executed > 0 ? (((invoiced / executed) * 100).toFixed(1) + "%") : "0%", 
      status: "ok",
      description: "Porcentaje de obra ejecutada que ya ha sido facturada."
    },
    { 
      label: "Pendiente por Facturar", 
      value: formatCurrency(executed - invoiced), 
      status: (executed - invoiced) > 0 ? "warning" : "ok",
      description: "Valor de la obra ejecutada que aún no ha sido facturada."
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiStats.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-4 md:p-6 border-none shadow-xl shadow-violeta-aereo/5 group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "p-2 rounded-xl",
                  kpi.status === "ok" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  <Target size={18} className="md:w-5 md:h-5" />
                </div>
                <div className="group/info relative">
                  <Info size={14} className="text-gray-300 cursor-help" />
                  <div className="absolute right-0 top-6 w-48 p-3 bg-violeta-dark text-white text-[10px] rounded-xl opacity-0 group-hover/info:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
                    {kpi.description}
                  </div>
                </div>
              </div>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{kpi.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg md:text-xl font-bold text-violeta-dark truncate max-w-[150px]">{kpi.value}</p>
                <span className={cn(
                  "text-[9px] md:text-[10px] font-bold shrink-0",
                  kpi.status === "ok" ? "text-emerald-500" : "text-amber-500"
                )}>
                  {kpi.status === "ok" ? "Óptimo" : "Atención"}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50">
                <div className={cn(
                  "h-full transition-all duration-1000",
                  kpi.status === "ok" ? "bg-emerald-500" : "bg-amber-500"
                )} style={{ width: '100%' }} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <Card className="p-4 md:p-8">
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredUFData} margin={{ left: -20, right: 0 }} onClick={(data: any) => {
                  if (data?.activePayload?.[0]) {
                    setSelectedUFIds([data.activePayload[0].payload.id]);
                    setCurrentView("resumen");
                  }
                }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 600 }} tickFormatter={(val) => `${val}%`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="financialProgrammed" name="Programado" fill="#61B1E3" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="financialProgress" name="Ejecutado" fill="#74C6D3" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Deviation Status */}
        <Card className="p-4 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 h-64 md:h-80 overflow-y-auto pr-2 custom-scrollbar">
            {filteredUFData.map((uf) => {
              const prog = uf?.financialProgrammed ?? 0;
              const actual = uf?.financialProgress ?? 0;
              const deviation = actual - prog;
              let status: "ok" | "warning" | "critical" = "ok";
              if (deviation < -5) status = "critical";
              else if (deviation < 0) status = "warning";

              return (
                <div key={uf?.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border">
                  <span className="text-xs font-black">{uf?.id}</span>
                  <div className="flex flex-col gap-1 bg-gray-200 p-1 rounded-full">
                    <div className={cn("w-3 h-3 rounded-full", status === "critical" ? "bg-red-500 scale-110" : "bg-red-900/20")} />
                    <div className={cn("w-3 h-3 rounded-full", status === "warning" ? "bg-amber-500 scale-110" : "bg-amber-900/20")} />
                    <div className={cn("w-3 h-3 rounded-full", status === "ok" ? "bg-emerald-500 scale-110" : "bg-emerald-900/20")} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};