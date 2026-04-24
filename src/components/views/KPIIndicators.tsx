import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Zap, 
  BarChart3,
  Info,
  FileSpreadsheet
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { ufData } from "../../data/mockData";
import { formatPercentage, cn, formatCurrency } from "../../lib/utils";
import { Card } from "../Card";
import { exportAsImage } from "../../lib/exportUtils";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  Cell
} from "recharts";
import { motion } from "motion/react";

export const KPIIndicators: React.FC = () => {
  const { filteredUFData, setSelectedUFIds, setCurrentView, selectedUF } = useDashboard();
  const reportRef = React.useRef<HTMLDivElement>(null);

  const kpiStats = [
    { 
      label: "Diferencia de Avance", 
      value: selectedUF ? (selectedUF.financialProgress - selectedUF.financialProgrammed).toFixed(2) + "%" : "-2.57%", 
      status: selectedUF ? (selectedUF.financialProgress >= selectedUF.financialProgrammed ? "ok" : "warning") : "warning",
      description: "Diferencia porcentual entre el avance económico real y el programado."
    },
    { 
      label: "Eficiencia de Ejecución", 
      value: selectedUF ? (selectedUF.financialProgress / selectedUF.financialProgrammed).toFixed(2) : "0.98", 
      status: selectedUF ? (selectedUF.financialProgress >= selectedUF.financialProgrammed ? "ok" : "warning") : "warning",
      description: "Relación entre el avance económico real y el programado. > 1.0 es eficiente."
    },
    { 
      label: "Eficiencia de Facturación", 
      value: selectedUF ? ((selectedUF.constructorContract.invoiced / selectedUF.constructorContract.executed) * 100).toFixed(1) + "%" : "88.5%", 
      status: "ok",
      description: "Porcentaje de obra ejecutada que ya ha sido facturada."
    },
    { 
      label: "Pendiente por Facturar", 
      value: selectedUF ? formatCurrency(selectedUF.constructorContract.executed - selectedUF.constructorContract.invoiced) : "$19.8B", 
      status: "warning",
      description: "Valor de la obra ejecutada que aún no ha sido facturada al cliente."
    },
  ];

  return (
    <div className="space-y-8" ref={reportRef}>
      {/* Header with Export */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div>
          <h2 className="text-3xl font-display font-bold text-violeta-dark tracking-tight">Indicadores de Desempeño</h2>
          <p className="text-sm text-gray-500 font-medium">Análisis de eficiencia, cumplimiento y proyecciones</p>
        </div>
        <button 
          onClick={() => exportAsImage(reportRef, 'Indicadores_KPI_Torca')}
          className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-white hover:shadow-premium transition-all group"
        >
          <div className="p-2 bg-torca-azul/10 rounded-xl text-torca-azul group-hover:scale-110 transition-transform">
            <FileSpreadsheet size={18} />
          </div>
          <span className="text-xs font-bold text-violeta-dark uppercase tracking-widest">Descargar Reporte KPI</span>
        </button>
      </div>

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-lg font-bold text-violeta-dark">Estado de Avance Económico</h3>
              <p className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wider uppercase">Ejecutado vs Programado por Unidad Funcional</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-torca-azul" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase text-gray-500 tracking-wider">Programado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rio-verde" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase text-gray-500 tracking-wider">Ejecutado</span>
              </div>
            </div>
          </div>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={filteredUFData} 
                margin={{ left: -20, right: 0 }}
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    setSelectedUFIds([data.activePayload[0].payload.id]);
                    setCurrentView("resumen");
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 600, cursor: 'pointer' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 600 }} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 600 }}
                  labelStyle={{ fontSize: '11px', fontWeight: 800, marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="financialProgrammed" 
                  name="Programado" 
                  fill="#61B1E3" 
                  radius={[4, 4, 0, 0]} 
                  barSize={16} 
                  className="cursor-pointer"
                />
                <Bar 
                  dataKey="financialProgress" 
                  name="Ejecutado" 
                  fill="#74C6D3" 
                  radius={[4, 4, 0, 0]} 
                  barSize={16} 
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 md:p-8">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-violeta-dark">Estado de Desviación Económica</h3>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wider uppercase">Semáforo de cumplimiento financiero por UF</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 h-64 md:h-80 overflow-y-auto pr-2 custom-scrollbar">
            {filteredUFData.map((uf) => {
              const deviation = uf.financialProgress - uf.financialProgrammed;
              let status: "ok" | "warning" | "critical" = "ok";
              if (deviation < -5) status = "critical";
              else if (deviation < 0) status = "warning";

              return (
                <div key={uf.id} className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-gray-50 border border-gray-100 group hover:border-torca-azul transition-all">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] md:text-xs font-black text-violeta-dark">{uf.id}</span>
                    <span className={cn(
                      "text-[8px] md:text-[10px] font-bold mt-1 truncate",
                      status === "ok" ? "text-emerald-600" : status === "warning" ? "text-amber-600" : "text-red-600"
                    )}>
                      {deviation >= 0 ? "Al día / Adelantado" : status === "warning" ? "Retraso Leve" : "Retraso Crítico"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] md:text-xs font-bold text-violeta-dark">{deviation.toFixed(2)}%</p>
                      <p className="text-[8px] md:text-[9px] text-gray-600 uppercase font-bold tracking-tighter">Desv.</p>
                    </div>
                    <div className="flex flex-col gap-1 bg-gray-200 p-1 rounded-full">
                      <div className={cn(
                        "w-3 h-3 md:w-4 md:h-4 rounded-full shadow-inner transition-all duration-500",
                        status === "critical" ? "bg-red-500 shadow-red-900/50 scale-110" : "bg-red-900/20"
                      )} />
                      <div className={cn(
                        "w-3 h-3 md:w-4 md:h-4 rounded-full shadow-inner transition-all duration-500",
                        status === "warning" ? "bg-amber-500 shadow-amber-900/50 scale-110" : "bg-amber-900/20"
                      )} />
                      <div className={cn(
                        "w-3 h-3 md:w-4 md:h-4 rounded-full shadow-inner transition-all duration-500",
                        status === "ok" ? "bg-emerald-500 shadow-emerald-900/50 scale-110" : "bg-emerald-900/20"
                      )} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="p-4 md:p-8">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-violeta-dark">Tendencia de Ejecución Global</h3>
          <p className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wider uppercase">Evolución histórica del megaproyecto</p>
        </div>
        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={[
                { month: "Ene", value: 1.2 },
                { month: "Feb", value: 1.4 },
                { month: "Mar", value: 1.5 },
                { month: "Abr", value: 1.7 },
                { month: "May", value: 1.8 },
                { month: "Jun", value: 1.9 },
                { month: "Jul", value: 2.0 },
                { month: "Ago", value: 2.1 },
                { month: "Sep", value: 2.15 },
                { month: "Oct", value: 2.17 },
              ]}
              margin={{ left: -20, right: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 600 }} tickFormatter={(val) => `${val}%`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px' }}
                itemStyle={{ fontSize: '10px', fontWeight: 600 }}
                labelStyle={{ fontSize: '11px', fontWeight: 800, marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#61B1E3" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "#61B1E3", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
