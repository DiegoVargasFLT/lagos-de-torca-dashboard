import React from "react";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ChevronRight, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Target
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { allAlerts } from "../../data/mockData";
import { cn } from "../../lib/utils";
import { Card } from "../Card";
import { motion } from "motion/react";

export const AlertsRisks: React.FC = () => {
  const { selectedUFId, filteredUFData } = useDashboard();

  const alerts = selectedUFId === "consolidated" 
    ? allAlerts 
    : allAlerts.filter(a => a.uf === selectedUFId);

  const criticalCount = alerts.filter(a => a.type === "critical").length;
  const warningCount = alerts.filter(a => a.type === "warning").length;
  const infoCount = alerts.filter(a => a.type === "info").length;

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-violeta-dark tracking-tight">Riesgos y Alertas</h2>
          <p className="text-sm text-gray-500 font-medium">Monitoreo de eventos críticos y gestión preventiva de riesgos</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-xl text-red-600">
              <ShieldAlert size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado de Riesgo</p>
              <p className="text-sm font-bold text-red-600">Nivel Moderado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Alertas Críticas", value: criticalCount, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50/50", border: "border-red-100" },
          { label: "Advertencias", value: warningCount, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50/50", border: "border-amber-100" },
          { label: "Seguimiento", value: infoCount, icon: Info, color: "text-blue-600", bg: "bg-blue-50/50", border: "border-blue-100" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={cn("premium-card p-8 border-b-4", stat.bg, stat.border, 
              i === 0 ? "border-b-red-500" : i === 1 ? "border-b-amber-500" : "border-b-blue-500"
            )}>
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl bg-white shadow-sm", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <span className={cn("text-4xl font-display font-bold", stat.color)}>{stat.value}</span>
              </div>
              <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", stat.color)}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bento-grid">
        {/* Detailed Alerts List */}
        <div className="md:col-span-8">
          <div className="premium-card p-8">
            <h3 className="text-xl font-display font-bold text-violeta-dark mb-10 flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-xl text-red-600">
                <AlertCircle size={20} />
              </div>
              Registro de Alertas Activas
            </h3>
            <div className="space-y-6">
              {alerts.length > 0 ? (
                alerts.map((alert, i) => (
                  <motion.div 
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative p-8 rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-premium transition-all"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                      <div className="flex items-start gap-6">
                        <div className={cn(
                          "p-4 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform",
                          alert.type === "critical" ? "bg-red-100 text-red-600" : 
                          alert.type === "warning" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {alert.type === "critical" ? <ShieldAlert size={24} /> : 
                           alert.type === "warning" ? <AlertTriangle size={24} /> : <Info size={24} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h4 className="text-lg font-display font-bold text-violeta-dark">{alert.title}</h4>
                            <span className="text-[10px] font-bold text-torca-azul bg-torca-azul/10 px-3 py-1 rounded-lg uppercase tracking-widest">{alert.uf}</span>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium">{alert.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-gray-600 tracking-widest mb-2">Impacto Potencial</p>
                              <p className="text-xs font-bold text-gray-700 leading-relaxed">{alert.impact}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase text-torca-azul tracking-widest mb-2">Acción Mitigante</p>
                              <p className="text-xs font-bold text-gray-700 leading-relaxed">{alert.action}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex md:flex-col justify-between md:justify-start items-center md:items-end w-full md:w-auto shrink-0 border-t md:border-t-0 pt-6 md:pt-0">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{alert.date}</p>
                        <button className="mt-4 p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-torca-azul hover:text-white transition-all">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-gray-300">
                  <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                    <ShieldCheck size={48} className="text-emerald-500 opacity-40" />
                  </div>
                  <p className="font-display font-bold uppercase tracking-[0.3em] text-sm">Sin Alertas Críticas</p>
                  <p className="text-xs font-medium mt-2">Todo el sistema opera bajo parámetros normales</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Risk Management Section */}
        <div className="md:col-span-4">
          <div className="premium-card p-8 h-full flex flex-col">
            <h3 className="text-xl font-display font-bold text-violeta-dark mb-10 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Target size={20} />
              </div>
              Matriz de Riesgos
            </h3>
            <div className="space-y-4 flex-1">
              {[
                { label: "Financiero", risk: "Medio", trend: "up", color: "text-amber-500", bg: "bg-amber-50" },
                { label: "Ambiental", risk: "Bajo", trend: "down", color: "text-emerald-500", bg: "bg-emerald-50" },
                { label: "Social", risk: "Medio", trend: "stable", color: "text-amber-500", bg: "bg-amber-50" },
                { label: "Técnico", risk: "Alto", trend: "up", color: "text-red-500", bg: "bg-red-50" },
                { label: "Legal", risk: "Bajo", trend: "stable", color: "text-emerald-500", bg: "bg-emerald-50" },
              ].map((risk, i) => (
                <div key={i} className="flex justify-between items-center p-5 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 group hover:bg-white hover:shadow-premium transition-all">
                  <div>
                    <p className="text-sm font-bold text-violeta-dark">{risk.label}</p>
                    <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", risk.color)}>Riesgo {risk.risk}</p>
                  </div>
                  <div className={cn(
                    "p-2 rounded-xl transition-transform group-hover:scale-110",
                    risk.trend === "up" ? "text-red-500 bg-red-50" : 
                    risk.trend === "down" ? "text-emerald-500 bg-emerald-50" : "text-gray-400 bg-gray-100"
                  )}>
                    {risk.trend === "up" ? <TrendingUp size={16} /> : 
                     risk.trend === "down" ? <TrendingDown size={16} /> : <ArrowRight size={16} />}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-8 rounded-[2rem] bg-violeta-dark text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Target size={60} />
              </div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-torca-azul mb-4">Foco de Gestión</h4>
              <p className="text-xs leading-relaxed text-white/70 mb-6 font-medium">
                La gestión actual se centra en la mitigación de riesgos técnicos en UF2A y la aceleración de facturación para mantener el flujo de caja.
              </p>
              <button className="w-full py-3 bg-torca-azul text-violeta-dark text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-lg shadow-torca-azul/20">
                Ver Plan de Mitigación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
