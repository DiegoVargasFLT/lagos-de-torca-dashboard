import React from "react";
import { 
  DollarSign, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Activity
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { globalStats, ufData } from "../../data/mockData";
import { formatCurrency, formatPercentage, cn } from "../../lib/utils";
import { Card } from "../Card";
import { BudgetAnalysisTable } from "../BudgetAnalysisTable";
import { InterventoriaBudgetTable } from "../InterventoriaBudgetTable";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { exportAsImage } from "../../lib/exportUtils";

export const CostControl: React.FC = () => {
  const { selectedUFId, unidadesFuncionales, selectedUF } = useDashboard();
  const [activeDashboard, setActiveDashboard] = React.useState<"constructor" | "interventoria">("constructor");
  const reportRef = React.useRef<HTMLDivElement>(null);

  const totalContractual = unidadesFuncionales.reduce((acc, uf) => acc + (uf.constructorContract?.value || 0) + (uf.interventoriaContract?.value || 0), 0);
  const totalExecuted = unidadesFuncionales.reduce((acc, uf) => acc + (uf.constructorContract?.executed || 0) + (uf.interventoriaContract?.executed || 0), 0);
  const totalInvoiced = unidadesFuncionales.reduce((acc, uf) => acc + (uf.constructorContract?.invoiced || 0) + (uf.interventoriaContract?.invoiced || 0), 0);

  const financialStats = [
    { label: "Presupuesto Total", value: formatCurrency(totalContractual), icon: Wallet, color: "text-torca-azul", bg: "bg-torca-azul/10" },
    { label: "Valor Ejecutado", value: formatCurrency(totalExecuted), icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Facturado Constructor", value: formatCurrency(unidadesFuncionales.reduce((acc, uf) => acc + (uf.constructorContract?.invoiced || 0), 0)), icon: Receipt, color: "text-violeta-dark", bg: "bg-violeta-aereo/10" },
    { label: "Facturado Interventoría", value: formatCurrency(unidadesFuncionales.reduce((acc, uf) => acc + (uf.interventoriaContract?.invoiced || 0), 0)), icon: Receipt, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-10" ref={reportRef}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-violeta-dark tracking-tight">Gestión Financiera</h2>
          <p className="text-sm text-gray-500 font-medium">Control presupuestal, ejecución y facturación del proyecto</p>
        </div>
        <div className="flex items-center gap-4 no-print">
          <button 
            onClick={() => exportAsImage(reportRef, 'Reporte_Financiero_Torca')}
            className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-white hover:shadow-premium transition-all group"
          >
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={18} />
            </div>
            <span className="text-xs font-bold text-violeta-dark uppercase tracking-widest">Descargar Reporte</span>
          </button>
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="premium-card p-8 group hover:shadow-2xl transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon size={24} />
                </div>
                <div className="p-2 bg-gray-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={14} className="text-gray-400" />
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-violeta-dark">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      {selectedUF ? (
        <div className="space-y-8">
          <div className="flex justify-center no-print">
            <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-3xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
              <button
                onClick={() => setActiveDashboard("constructor")}
                className={cn(
                  "px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2",
                  activeDashboard === "constructor" 
                    ? "bg-violeta-dark text-white shadow-lg shadow-violeta-dark/20" 
                    : "text-gray-400 hover:text-violeta-dark"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", activeDashboard === "constructor" ? "bg-rio-verde animate-pulse" : "bg-gray-300")} />
                Presupuesto Constructor
              </button>
              <button
                onClick={() => setActiveDashboard("interventoria")}
                className={cn(
                  "px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2",
                  activeDashboard === "interventoria" 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-gray-400 hover:text-blue-600"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", activeDashboard === "interventoria" ? "bg-amber-400 animate-pulse" : "bg-gray-300")} />
                Presupuesto Interventoría
              </button>
            </div>
          </div>

          <motion.div
            key={activeDashboard}
            initial={{ opacity: 0, x: activeDashboard === "constructor" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {activeDashboard === "constructor" ? (
              <BudgetAnalysisTable uf={selectedUF} />
            ) : (
              <InterventoriaBudgetTable uf={selectedUF} />
            )}
          </motion.div>
        </div>
      ) : (
        <div className="bento-grid gap-8">
          {/* Main Financial Table */}
          <div className="md:col-span-12">
            <div className="premium-card p-0 overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-xl font-display font-bold text-violeta-dark flex items-center gap-3">
                  <div className="p-2 bg-violeta-dark rounded-xl text-white">
                    <Receipt size={20} />
                  </div>
                  Detalle Financiero por Unidad y Contrato
                </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violeta-dark/20" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Constructor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-100 font-bold" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interventoría</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="text-[9px] uppercase tracking-[0.2em] text-gray-600 border-b border-gray-100">
                    <th className="py-5 font-black px-8">Identificación</th>
                    <th className="py-5 font-black px-6">Tipo Contrato</th>
                    <th className="py-5 font-black px-6 text-right">Valor Contractual</th>
                    <th className="py-5 font-black px-6 text-right">Valor Ejecutado</th>
                    <th className="py-5 font-black px-6 text-right">Valor Facturado</th>
                    <th className="py-5 font-black px-6 text-center">% Avance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUFData.map((uf) => {
                    const ufTotalValue = uf.constructorContract.value + uf.interventoriaContract.value;
                    const ufTotalExecuted = uf.constructorContract.executed + uf.interventoriaContract.executed;
                    const execPercent = (ufTotalExecuted / ufTotalValue) * 100;

                    const rowData = [
                      { type: "CONSTRUCTOR", ...uf.constructorContract, isChild: true },
                      { type: "INTERVENTORÍA", ...uf.interventoriaContract, isChild: true }
                    ];

                    return (
                      <React.Fragment key={uf.id}>
                        {/* Parent Row (Consolidated) */}
                        <tr className="bg-gray-50/40 border-l-4 border-violeta-dark transition-all">
                          <td className="py-6 px-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-violeta-dark flex items-center justify-center text-white font-display font-bold text-xs ring-4 ring-violeta-dark/5">
                                {uf.id}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-violeta-dark">Consolidado {uf.id}</p>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{uf.contractor} | {uf.interventoria}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <span className="text-[9px] font-black bg-violeta-dark/10 text-violeta-dark px-2 py-1 rounded tracking-tighter uppercase">Total UF</span>
                          </td>
                          <td className="py-6 px-6 text-sm font-mono font-bold text-violeta-dark text-right">{formatCurrency(ufTotalValue)}</td>
                          <td className="py-6 px-6 text-sm font-mono font-bold text-emerald-600 text-right">{formatCurrency(ufTotalExecuted)}</td>
                          <td className="py-6 px-6 text-sm font-mono font-bold text-violeta-dark text-right">{formatCurrency(uf.constructorContract.invoiced + uf.interventoriaContract.invoiced)}</td>
                          <td className="py-6 px-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-black text-violeta-dark font-mono">{formatPercentage(execPercent)}</span>
                              <div className="w-16 bg-gray-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-violeta-dark h-full rounded-full" style={{ width: `${execPercent}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Child Rows (Breakdown) */}
                        {rowData.map((row, idx) => (
                          <tr key={`${uf.id}-${idx}`} className="group hover:bg-gray-50/50 transition-all border-l-4 border-transparent">
                            <td className="py-4 px-8 pl-16 opacity-60">
                              <span className="text-xs font-bold text-gray-600">{row.name}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded tracking-tighter uppercase",
                                row.type === "CONSTRUCTOR" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                              )}>
                                {row.type}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-[13px] font-mono font-medium text-gray-500 text-right">{formatCurrency(row.value)}</td>
                            <td className="py-4 px-6 text-[13px] font-mono font-medium text-gray-500 text-right">{formatCurrency(row.executed)}</td>
                            <td className="py-4 px-6 text-[13px] font-mono font-medium text-gray-500 text-right">{formatCurrency(row.invoiced)}</td>
                            <td className="py-4 px-6 text-center">
                              <span className="text-[11px] font-mono font-bold text-gray-600">
                                {formatPercentage((row.executed / row.value) * 100)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Second Row of Bento Grid */}
        <AnimatePresence>
          {!selectedUF && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:col-span-12 overflow-hidden mb-8"
            >
              <div className="md:col-span-12">
                <div className="premium-card p-8 h-full">
                  <h3 className="text-xl font-display font-bold text-violeta-dark mb-10 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                      <Activity size={20} />
                    </div>
                    Rendimiento Financiero Consolidado
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Facturación Constructor</p>
                      <p className="text-xl font-display font-black text-violeta-dark">
                        {formatCurrency(filteredUFData.reduce((acc, uf) => acc + uf.constructorContract.invoiced, 0))}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-violeta-dark h-full rounded-full" style={{ width: '85%' }} />
                        </div>
                        <span className="text-[10px] font-black text-violeta-dark">85%</span>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Facturación Interventoría</p>
                      <p className="text-xl font-display font-black text-blue-600">
                        {formatCurrency(filteredUFData.reduce((acc, uf) => acc + uf.interventoriaContract.invoiced, 0))}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: '92%' }} />
                        </div>
                        <span className="text-[10px] font-black text-blue-600">92%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                      <Activity size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest">Alerta de Amortización</h4>
                      <p className="text-xs text-amber-700 font-medium mt-1 leading-relaxed">
                        Existen {filteredUFData.filter(uf => uf.anticipoGirado > 0 && uf.anticipoAmortizado === 0).length} unidades con anticipos girados sin amortización registrada. Se requiere conciliación de actas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Anticipos Section */}
      <div className="premium-card p-0 overflow-hidden">
        <div className="bg-[#003366] p-8 text-white flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl text-torca-azul">
            <Wallet size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold tracking-tight text-white">Gestión de Anticipos</h3>
            <p className="text-xs text-white/70 font-medium uppercase tracking-widest mt-1">Control de giros y amortización acumulada</p>
          </div>
        </div>
        
        <div className="p-10">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violeta-dark/5 rounded-bl-full -mr-8 -mt-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-4">Total Girado</p>
                <p className="text-3xl font-display font-black text-violeta-dark">{formatCurrency(filteredUFData.reduce((acc, uf) => acc + uf.anticipoGirado, 0))}</p>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-bl-full -mr-8 -mt-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-4">Total Amortizado</p>
                <p className="text-3xl font-display font-black text-emerald-600">{formatCurrency(filteredUFData.reduce((acc, uf) => acc + uf.anticipoAmortizado, 0))}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 block mb-1">Amortización Global</span>
                  <span className="text-2xl font-display font-black text-violeta-dark">Nivel de Retorno</span>
                </div>
                <span className="text-3xl font-display font-black text-emerald-600 leading-none">
                  {formatPercentage((filteredUFData.reduce((acc, uf) => acc + uf.anticipoAmortizado, 0) / (filteredUFData.reduce((acc, uf) => acc + uf.anticipoGirado, 0) || 1)) * 100)}
                </span>
              </div>
              <div className="w-full bg-gray-100 h-6 rounded-full overflow-hidden p-1.5 ring-4 ring-gray-50 shadow-inner">
                <motion.div 
                  className="bg-gradient-to-r from-torca-azul via-torca-azul to-emerald-500 h-full rounded-full shadow-[0_0_15px_rgba(97,177,227,0.4)]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(filteredUFData.reduce((acc, uf) => acc + uf.anticipoAmortizado, 0) / (filteredUFData.reduce((acc, uf) => acc + uf.anticipoGirado, 0) || 1)) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

