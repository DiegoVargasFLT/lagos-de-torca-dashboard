import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Camera,
  Video,
  FileText,
  BarChart2,
  LayoutDashboard,
  CalendarDays,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  Globe,
  ExternalLink,
  Flag,
  Target,
  ArrowRight
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { formatCurrency, formatPercentage, cn, getStatusColor } from "../../lib/utils";
import { Card } from "../Card";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  ReferenceLine,
  Label
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Download } from "lucide-react";
import { exportAsImage } from "../../lib/exportUtils";

import { DetailedFinancialTable } from "../DetailedFinancialTable";
import { BudgetAnalysisTable } from "../BudgetAnalysisTable";

export const ExecutiveSummary: React.FC = () => {
  const { 
    selectedUFIds, 
    setSelectedUFIds, 
    unidadesFuncionales,
    ufSeleccionada,
    contratos,
    cronograma,
    hitos,
    fases,
    apu,
    curvaS,
    actas,
    resumenActas,
    alertas,
    reprogramaciones,
    loading,
    error
  } = useDashboard();
  const [activeTab, setActiveTab] = useState<"financiero" | "curva" | "cronograma" | "facturacion" | "alertas">("financiero");
  const scurveRef = React.useRef<HTMLDivElement>(null);
  const contractRef = React.useRef<HTMLDivElement>(null);

  // Calculate stats based on filtered data
  const stats = React.useMemo(() => {
    if (!unidadesFuncionales || unidadesFuncionales.length === 0) return null;
    
    return {
      totalContractual: unidadesFuncionales.reduce((acc, uf) => 
        acc + (uf.constructorContract?.value || 0) + (uf.interventoriaContract?.value || 0), 0),
      totalExecuted: unidadesFuncionales.reduce((acc, uf) => 
        acc + (uf.constructorContract?.executed || 0) + (uf.interventoriaContract?.executed || 0), 0),
      globalExecution: unidadesFuncionales.length > 0 
        ? unidadesFuncionales.reduce((acc, uf) => acc + (uf.financialProgress || 0), 0) / unidadesFuncionales.length 
        : 0,
      activeUFs: unidadesFuncionales.length,
      totalUFs: unidadesFuncionales.length
    };
  }, [unidadesFuncionales]);

  const selectedUF = selectedUFIds.length === 1 ? 
    unidadesFuncionales.find(uf => uf.id === selectedUFIds[0]) : null;

// Consolidated S-Curve for construction phase - SUM money values then derive percentage
  const consolidatedSCurve = React.useMemo(() => {
    if (!unidadesFuncionales || unidadesFuncionales.length === 0) return [];
    
    const points: any[] = [];
    const totalGlobalValue = unidadesFuncionales.reduce((acc, uf) => 
      acc + (uf.constructorContract?.value || 0) + (uf.interventoriaContract?.value || 0), 0);

    unidadesFuncionales.forEach((uf: any) => {
      // Usar curvaS o constructionSCurve dependiendo de qué datos estén disponibles
      const curveData = uf.constructionSCurve || uf.curvaS || [];
      
      curveData.forEach((p: any, i: number) => {
        if (!points[i]) {
          points[i] = { 
            month: p.month, 
            programmedMoney: 0, 
            programmedInitialMoney: 0,
            reprogramming1Money: 0,
            reprogramming2Money: 0,
            reprogramming3Money: 0,
            reprogramming4Money: 0,
            reprogramming5Money: 0,
            executedMoney: 0,
            invoicedMoney: 0
          };
        }
        const ufTotalVal = (uf.constructorContract?.value || 0) + (uf.interventoriaContract?.value || 0);
        points[i].programmedMoney += ((p.programmed || 0) / 100) * ufTotalVal;
        points[i].programmedInitialMoney += (((p.programmedInitial || p.programmed) || 0) / 100) * ufTotalVal;
        points[i].reprogramming1Money += (((p.reprogramming1 || p.programmedInitial || p.programmed) || 0) / 100) * ufTotalVal;
        points[i].reprogramming2Money += (((p.reprogramming2 || p.reprogramming1 || p.programmedInitial || p.programmed) || 0) / 100) * ufTotalVal;
        points[i].reprogramming3Money += (((p.reprogramming3 || p.reprogramming2 || p.reprogramming1 || p.programmedInitial || p.programmed) || 0) / 100) * ufTotalVal;
        points[i].reprogramming4Money += (((p.reprogramming4 || p.reprogramming3 || p.reprogramming2 || p.reprogramming1 || p.programmedInitial || p.programmed) || 0) / 100) * ufTotalVal;
        points[i].reprogramming5Money += (((p.reprogramming5 || p.reprogramming4 || p.reprogramming3 || p.reprogramming2 || p.reprogramming1 || p.programmedInitial || p.programmed) || 0) / 100) * ufTotalVal;
        points[i].executedMoney += ((p.executed || 0) / 100) * ufTotalVal;
        points[i].invoicedMoney += ((p.invoiced || 0) / 100) * ufTotalVal;
      });
    });

    return points.map(p => ({
      ...p,
      programmed: totalGlobalValue > 0 ? (p.programmedMoney / totalGlobalValue) * 100 : 0,
      programmedInitial: totalGlobalValue > 0 ? (p.programmedInitialMoney / totalGlobalValue) * 100 : 0,
      reprogramming1: totalGlobalValue > 0 ? (p.reprogramming1Money / totalGlobalValue) * 100 : 0,
      reprogramming2: totalGlobalValue > 0 ? (p.reprogramming2Money / totalGlobalValue) * 100 : 0,
      reprogramming3: totalGlobalValue > 0 ? (p.reprogramming3Money / totalGlobalValue) * 100 : 0,
      reprogramming4: totalGlobalValue > 0 ? (p.reprogramming4Money / totalGlobalValue) * 100 : 0,
      reprogramming5: totalGlobalValue > 0 ? (p.reprogramming5Money / totalGlobalValue) * 100 : 0,
      executed: totalGlobalValue > 0 ? (p.executedMoney / totalGlobalValue) * 100 : 0,
      invoiced: totalGlobalValue > 0 ? (p.invoicedMoney / totalGlobalValue) * 100 : 0,
    })).filter(p => p); // Filtrar valores undefined
  }, [unidadesFuncionales]);

  const markers = React.useMemo(() => {
    let rawMarkers = [];
    if (selectedUF) rawMarkers = selectedUF.reprogrammingMarkers || [];
    else rawMarkers = unidadesFuncionales[0]?.reprogrammingMarkers || [];
    return [...rawMarkers].sort((a, b) => a.month.localeCompare(b.month));
  }, [selectedUF, unidadesFuncionales]);

  // Calculate key milestone dates
  const lifecycleDates = React.useMemo(() => {
    if (unidadesFuncionales.length === 0) return null;

    const findMin = (arr: Date[]) => new Date(Math.min(...arr.map(d => d.getTime())));
    const findMax = (arr: Date[]) => new Date(Math.max(...arr.map(d => d.getTime())));
    const formatDate = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const data = {
      projectStart: findMin(unidadesFuncionales.map(uf => new Date(uf.startDate))),
      preconStart: findMin(unidadesFuncionales.map(uf => new Date(uf.preconstructionStart))),
      preconEnd: findMax(unidadesFuncionales.map(uf => new Date(uf.preconstructionEnd))),
      constStart: findMin(unidadesFuncionales.map(uf => new Date(uf.constructionStart))),
      constEnd: findMax(unidadesFuncionales.map(uf => new Date(uf.constructionEnd))),
      beneficiaries: findMax(unidadesFuncionales.map(uf => new Date(uf.beneficiariesDate))),
      liquidation: findMax(unidadesFuncionales.map(uf => new Date(uf.liquidationEnd)))
    };

    return {
      projectStart: formatDate(data.projectStart),
      preconStart: formatDate(data.preconStart),
      preconEnd: formatDate(data.preconEnd),
      constStart: formatDate(data.constStart),
      constEnd: formatDate(data.constEnd),
      beneficiaries: formatDate(data.beneficiaries),
      liquidation: formatDate(data.liquidation),
      corte: formatDate(new Date()) 
    };
  }, [unidadesFuncionales]);

  const billingStats = React.useMemo(() => {
    if (selectedUF) return {
      girado: selectedUF.anticipoGirado,
      amortizado: selectedUF.anticipoAmortizado,
      pendAmortizar: selectedUF.anticipoGirado - selectedUF.anticipoAmortizado
    };
    return {
      girado: unidadesFuncionales.reduce((acc, uf) => acc + (uf.anticipoGirado || 0), 0),
      amortizado: unidadesFuncionales.reduce((acc, uf) => acc + (uf.anticipoAmortizado || 0), 0),
      pendAmortizar: unidadesFuncionales.reduce((acc, uf) => acc + ((uf.anticipoGirado || 0) - (uf.anticipoAmortizado || 0)), 0)
    };
  }, [selectedUF, unidadesFuncionales]);

  const allMilestones = React.useMemo(() => {
    return unidadesFuncionales.flatMap(uf => (uf.milestones || []).map(m => ({ ...m, ufName: uf.name })))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [unidadesFuncionales]);

  const chartData = React.useMemo(() => {
    const baseData = selectedUF ? (selectedUF.constructionSCurve || selectedUF.curvaS || []) : consolidatedSCurve;
    const totalVal = selectedUF 
      ? ((selectedUF.constructorContract?.value || 0) + (selectedUF.interventoriaContract?.value || 0))
      : unidadesFuncionales.reduce((acc, uf) => acc + (uf.constructorContract?.value || 0) + (uf.interventoriaContract?.value || 0), 0);

    const m = markers.map(marker => marker.month);

    return (baseData || []).map(point => {
      const pInitialMoney = (((point.programmedInitial || point.programmed) || 0) / 100) * totalVal;
      const r1Money = (((point.reprogramming1 || point.reprogramming5 || point.programmed) || 0) / 100) * totalVal;
      const r2Money = (((point.reprogramming2 || point.reprogramming5 || point.programmed) || 0) / 100) * totalVal;
      const r3Money = (((point.reprogramming3 || point.reprogramming5 || point.programmed) || 0) / 100) * totalVal;
      const r4Money = (((point.reprogramming4 || point.reprogramming5 || point.programmed) || 0) / 100) * totalVal;
      const r5Money = (((point.reprogramming5 || point.programmed) || 0) / 100) * totalVal;

      const executedMoney = ((point.executed || 0) / 100) * totalVal;
      const invoicedMoney = ((point.invoiced || 0) / 100) * totalVal;

      const currentMonth = point.month;
      
      let currentProgrammed = pInitialMoney;
      if (m[0] && currentMonth > m[0]) currentProgrammed = r1Money;
      if (m[1] && currentMonth > m[1]) currentProgrammed = r2Money;
      if (m[2] && currentMonth > m[2]) currentProgrammed = r3Money;
      if (m[3] && currentMonth > m[3]) currentProgrammed = r4Money;
      if (m[4] && currentMonth > m[4]) currentProgrammed = r5Money;

      return {
        ...point,
        executedMoney,
        invoicedMoney,
        currentProgrammed,
        pInitialMoney: currentMonth <= (m[0] || 'ZZZ') ? pInitialMoney : undefined,
        r1Money: (m[0] && currentMonth >= m[0] && currentMonth <= (m[1] || 'ZZZ')) ? r1Money : undefined,
        r2Money: (m[1] && currentMonth >= m[1] && currentMonth <= (m[2] || 'ZZZ')) ? r2Money : undefined,
        r3Money: (m[2] && currentMonth >= m[2] && currentMonth <= (m[3] || 'ZZZ')) ? r3Money : undefined,
        r4Money: (m[3] && currentMonth >= m[3] && currentMonth <= (m[4] || 'ZZZ')) ? r4Money : undefined,
        r5Money: (m[4] && currentMonth >= m[4]) ? r5Money : undefined,
      };
    });
  }, [selectedUF, consolidatedSCurve, unidadesFuncionales, markers]);

  if (selectedUF) {
    return (
      <div className="space-y-10">
        {/* Back Button */}
        <button 
          onClick={() => setSelectedUFIds([])}
          className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-torca-azul hover:border-torca-azul transition-all shadow-sm group"
        >
          <div className="p-1 bg-gray-50 rounded-lg group-hover:bg-torca-azul/10 transition-colors">
            <ChevronRight className="rotate-180" size={14} />
          </div>
          Volver al Centro de Control
        </button>

        {/* UF Hero Card */}
        <div className="premium-card p-0 overflow-hidden bg-violeta-dark relative">
          <div className="absolute inset-0 bg-gradient-to-br from-azul-oceano/20 to-transparent pointer-events-none" />
          <div className="p-8 md:p-12 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={cn(
                    "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em]",
                    selectedUF.status === "ok" ? "bg-emerald-500/30 text-emerald-300" : "bg-amber-500/30 text-amber-300"
                  )}>
                    {selectedUF.statusText}
                  </span>
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest">Unidad Funcional {selectedUF.id}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-6">{selectedUF.name}</h2>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl text-torca-azul">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">Contratista</p>
                      <p className="text-sm font-semibold text-white">{selectedUF.contractor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl text-rio-verde">
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">Interventoría</p>
                      <p className="text-sm font-semibold text-white">{selectedUF.interventoria}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full lg:w-auto">
                <div className="glass-card p-8 rounded-[2rem] min-w-[300px] border border-white/10">
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Avance Económico</p>
                    <p className="text-3xl font-display font-bold text-torca-azul shadow-sm">{formatPercentage(selectedUF.financialProgress)}</p>
                  </div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden relative mb-4">
                    <div 
                      className="absolute top-0 left-0 bg-white/20 h-full" 
                      style={{ width: `${selectedUF.financialProgrammed}%` }}
                    />
                    <motion.div 
                      className="absolute top-0 left-0 bg-gradient-to-r from-torca-azul to-rio-verde h-full shadow-[0_0_10px_rgba(97,177,227,0.3)]" 
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedUF.financialProgress}%` }}
                      transition={{ duration: 1.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/70">
                    <span>Meta: {formatPercentage(selectedUF.financialProgrammed)}</span>
                    <span className={cn(
                      selectedUF.financialProgress >= selectedUF.financialProgrammed ? "text-emerald-300" : "text-amber-300"
                    )}>
                      Diferencia: {formatPercentage(selectedUF.financialProgress - selectedUF.financialProgrammed)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-t border-white/5 bg-black/20 px-8 overflow-x-auto">
            <div className="flex min-w-max">
              {[
                { id: "financiero", label: "Finanzas", icon: DollarSign },
                { id: "cronograma", label: "Hitos", icon: Clock },
                { id: "facturacion", label: "Facturación", icon: FileText },
                { id: "alertas", label: "Alertas", icon: AlertTriangle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-3 px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group",
                    activeTab === tab.id 
                      ? "text-torca-azul" 
                      : "text-white/60 hover:text-white/90"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 w-full h-1 bg-torca-azul" 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-8"
          >
            {activeTab === "financiero" && (
              <div className="bento-grid">
                <div className="md:col-span-12">
                  <div className="premium-card p-8">
                      <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-display font-bold text-violeta-dark flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                            <DollarSign size={20} />
                          </div>
                          Desglose de Contratos
                        </h3>
                        <button 
                          onClick={() => exportAsImage(contractRef, 'Desglose-Contratos')}
                          className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white transition-all text-[10px] font-black uppercase tracking-widest text-violeta-dark"
                        >
                          <Download size={14} />
                          Exportar Cuadro
                        </button>
                      </div>
                      <div ref={contractRef} className="bg-white p-4 rounded-3xl">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-gray-100 italic">
                              <th className="py-6 font-bold px-4">Concepto Contrato</th>
                              <th className="py-6 font-bold px-4 text-right">Valor Total</th>
                              <th className="py-6 font-bold px-4 text-right">Ejecutado</th>
                              <th className="py-6 font-bold px-4 text-right">Facturado</th>
                              <th className="py-6 font-bold px-4 text-center">% Avance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {/* For consolidated view, we might want to show global stats or a general breakdown */}
                            {unidadesFuncionales.slice(0, 5).map((uf, i) => (
                              <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-6 px-4">
                                  <p className="font-display font-bold text-sm text-violeta-dark">{uf.name}</p>
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded tracking-tighter uppercase bg-blue-50 text-blue-600">
                                    {uf.id}
                                  </span>
                                </td>
                                <td className="py-6 px-4 text-sm font-mono font-bold text-gray-700 text-right">{formatCurrency(uf.constructorContract.value + uf.interventoriaContract.value)}</td>
                                <td className="py-6 px-4 text-sm font-mono font-bold text-emerald-600 text-right">{formatCurrency(uf.constructorContract.executed + uf.interventoriaContract.executed)}</td>
                                <td className="py-6 px-4 text-sm font-mono font-bold text-gray-700 text-right">{formatCurrency(uf.constructorContract.invoiced + uf.interventoriaContract.invoiced)}</td>
                                <td className="py-6 px-4">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-black text-violeta-dark font-mono">
                                      {formatPercentage(uf.financialProgress)}
                                    </span>
                                    <div className="w-16 bg-gray-100 h-1 rounded-full overflow-hidden">
                                      <div className="h-full bg-torca-azul" style={{ width: `${uf.financialProgress}%` }} />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cronograma" && (
              <div className="bento-grid">
              <div className="md:col-span-8">
                <div className="premium-card p-10">
                  <h3 className="text-2xl font-display font-bold text-violeta-dark mb-10 flex items-center gap-4">
                    <div className="p-2 bg-purple-50 rounded-2xl text-purple-600">
                      <Clock size={24} />
                    </div>
                    Hitos Estratégicos {selectedUF ? `- ${selectedUF.name}` : '(Consolidado)'}
                  </h3>
                  <div className="space-y-12 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-1 before:bg-gray-50">
                    {(selectedUF ? selectedUF.milestones : allMilestones.slice(0, 10)).map((milestone, idx) => (
                      <div key={idx} className="flex gap-10 relative">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 shadow-lg border-4 border-white transition-transform hover:scale-110 duration-300",
                          milestone.status === "completed" ? "bg-emerald-500 text-white" : 
                          milestone.status === "delayed" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                        )}>
                          {milestone.status === "completed" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-3xl bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:shadow-premium transition-all duration-300">
                            <div>
                              <p className="text-lg font-display font-bold text-violeta-dark">{milestone.title}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">
                                  {!selectedUF && milestone.ufName ? milestone.ufName : 'Responsable'}
                                </span>
                                <p className="text-[11px] text-gray-600 font-bold">{milestone.responsible}</p>
                              </div>
                            </div>
                            <div className="px-5 py-3 bg-violeta-dark text-white rounded-2xl font-mono text-xs font-bold shadow-xl ring-4 ring-violeta-dark/5">
                              {milestone.date}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-4">
                <div className="premium-card p-10 h-full">
                  <h3 className="text-xl font-display font-bold text-violeta-dark mb-10 flex items-center gap-3">
                    <div className="p-2 bg-torca-azul/10 rounded-xl text-torca-azul">
                      <CalendarDays size={20} />
                    </div>
                    Ciclo de Vida del Proyecto
                  </h3>
                  <div className="space-y-6">
                    {lifecycleDates && [
                      { label: "Acta de Inicio", date: lifecycleDates.projectStart, icon: Flag, color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "Inicio Preconstrucción", date: lifecycleDates.preconStart, icon: Target, color: "text-sky-600", bg: "bg-sky-50" },
                      { label: "Fin Preconstrucción", date: lifecycleDates.preconEnd, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "Inicio Construcción", date: lifecycleDates.constStart, icon: LayoutDashboard, color: "text-torca-azul", bg: "bg-torca-azul/10" },
                      { label: "Fin Construcción", date: lifecycleDates.constEnd, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                      { label: "Beneficiarios", date: lifecycleDates.beneficiaries, icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
                      { label: "Liquidación", date: lifecycleDates.liquidation, icon: ArrowRight, color: "text-purple-600", bg: "bg-purple-50" },
                      { label: "Fecha de Corte", date: lifecycleDates.corte, icon: Activity, color: "text-slate-600", bg: "bg-slate-50" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-5 p-5 rounded-[2rem] bg-gray-50/50 border border-gray-100 group hover:bg-white hover:shadow-premium transition-all duration-300">
                        <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300", item.bg, item.color)}>
                          <item.icon size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                          <p className="text-sm font-display font-black text-violeta-dark">{item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "facturacion" && (
            <div className="bento-grid">
              <div className="md:col-span-6">
                <div className="premium-card p-8 h-full">
                  <h3 className="text-xl font-display font-bold text-violeta-dark mb-10 flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                      <Wallet size={20} />
                    </div>
                    Gestión de Anticipos
                  </h3>
                  <div className="space-y-8">
                    <div className="p-8 rounded-[2rem] bg-violeta-dark text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <DollarSign size={80} />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-torca-azul mb-3">Anticipo Girado</p>
                      <h4 className="text-4xl font-display font-bold text-white">{formatCurrency(billingStats.girado)}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Amortizado</p>
                        <p className="text-lg font-bold text-violeta-dark">{formatCurrency(billingStats.amortizado)}</p>
                      </div>
                      <div className="p-6 rounded-[1.5rem] bg-gray-50 border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Pendiente</p>
                        <p className="text-lg font-bold text-violeta-dark">{formatCurrency(billingStats.pendAmortizar)}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <span>Progreso de Amortización</span>
                        <span className="text-violeta-dark">{formatPercentage(billingStats.girado > 0 ? (billingStats.amortizado / billingStats.girado) * 100 : 0)}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <motion.div 
                          className="bg-gradient-to-r from-torca-azul to-rio-verde h-full" 
                          initial={{ width: 0 }}
                          animate={{ width: `${billingStats.girado > 0 ? (billingStats.amortizado / billingStats.girado) * 100 : 0}%` }}
                          transition={{ duration: 1.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-6">
                <div className="premium-card p-10 h-full">
                  <h3 className="text-xl font-display font-bold text-violeta-dark mb-10 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                      <BarChart2 size={20} />
                    </div>
                    Estado de Facturación
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
{ 
                      name: "Constructor", 
                      Ejecutado: selectedUF ? selectedUF.constructorContract.executed : unidadesFuncionales.reduce((acc, uf) => acc + uf.constructorContract.executed, 0),
                      Facturado: selectedUF ? selectedUF.constructorContract.invoiced : unidadesFuncionales.reduce((acc, uf) => acc + uf.constructorContract.invoiced, 0),
                    },
                    { 
                      name: "Interventoría", 
                      Ejecutado: selectedUF ? selectedUF.interventoriaContract.executed : unidadesFuncionales.reduce((acc, uf) => acc + uf.interventoriaContract.executed, 0),
                      Facturado: selectedUF ? selectedUF.interventoriaContract.invoiced : unidadesFuncionales.reduce((acc, uf) => acc + uf.interventoriaContract.invoiced, 0),
                    },
                      ]} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} tickFormatter={(val) => `$${(val/1e9).toFixed(1)}B`} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: number) => formatCurrency(val)}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
                        <Bar dataKey="Ejecutado" fill="#61B1E3" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Facturado" fill="#74C6D3" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
<div className="mt-10 grid grid-cols-2 gap-4">
                    <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <p className="text-[10px] font-bold text-blue-700 uppercase tracking-tight mb-1">Eficiencia Constructor</p>
                      <p className="text-xl font-display font-bold text-blue-900">
                        {formatPercentage(((selectedUF ? selectedUF.constructorContract.invoiced : unidadesFuncionales.reduce((acc, uf) => acc + uf.constructorContract.invoiced, 0)) / (selectedUF ? selectedUF.constructorContract.executed : unidadesFuncionales.reduce((acc, uf) => acc + uf.constructorContract.executed, 0)) * 100 || 0)}
                      </p>
                    </div>
                    <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight mb-1">Eficiencia Interventoría</p>
                      <p className="text-xl font-display font-bold text-emerald-900">
                        {formatPercentage(((selectedUF ? selectedUF.interventoriaContract.invoiced : unidadesFuncionales.reduce((acc, uf) => acc + uf.interventoriaContract.invoiced, 0)) / (selectedUF ? selectedUF.interventoriaContract.executed : unidadesFuncionales.reduce((acc, uf) => acc + uf.interventoriaContract.executed, 0)) * 100 || 0)}
                      </p>
                    </div>
                  </div>
                </div>
        </div>
      </AnimatePresence>
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
              <a 
                href="https://www.google.com/maps/d/viewer?mid=1qaBGL3U1L4IxtPmtckJsT2JzveDd_FM" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 bg-white/95 backdrop-blur-md text-violeta-dark rounded-xl border border-white/50 shadow-premium hover:bg-torca-azul hover:text-white transition-all group/btn"
              >
                <ExternalLink size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Ver Detalles</span>
              </a>
            </div>
          </div>
</div>
        </div>

      {/* Detailed Financial Matrix Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-4">
          <div>
            <h3 className="text-2xl font-display font-bold text-violeta-dark tracking-tight">Matriz de Seguimiento</h3>
            <p className="text-sm text-gray-500 font-medium">Consolidado contractual y financiero detallado</p>
          </div>
        </div>
        <div className="premium-card p-2 overflow-hidden">
          <DetailedFinancialTable />
        </div>
      </div>

      {/* UF Grid Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-end px-4">
          <div>
            <h3 className="text-2xl font-display font-bold text-violeta-dark tracking-tight">Unidades Funcionales</h3>
            <p className="text-sm text-gray-500 font-medium">Gestión individualizada por frente de obra</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {unidadesFuncionales.map((uf, i) => (
            const isSelected = selectedUFIds.includes(uf.id);
            return (
              <motion.div
                key={uf.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setSelectedUFIds([uf.id]);
                  // Navigation: Setting the UF takes shows the detail view in ExecutiveSummary
                  // which functions as the "Project Info" view the user requested.
                }}
                className="group cursor-pointer"
              >
                <div className={cn(
                  "premium-card p-0 overflow-hidden transition-all duration-500 group-hover:-translate-y-2",
                  isSelected ? "ring-2 ring-torca-azul shadow-2xl shadow-torca-azul/20" : "hover:shadow-2xl hover:shadow-torca-azul/10"
                )}>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-xl text-violeta-dark group-hover:text-torca-azul transition-colors truncate">{uf.id}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate mt-1">{uf.contractor}</p>
                      </div>
                      <div className={cn(
                        "p-3 rounded-2xl shrink-0",
                        uf.status === "ok" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {uf.status === "ok" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gray-50/50 p-5 rounded-[1.5rem] border border-gray-100">
                        <div className="flex justify-between items-end mb-2">
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Avance Económico</p>
                          <p className="text-[10px] font-bold text-torca-azul">{formatPercentage(uf.financialProgress)}</p>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
                          <div 
                            className="absolute top-0 left-0 bg-torca-azul/20 h-full" 
                            style={{ width: `${uf.financialProgrammed}%` }} 
                          />
                          <div 
                            className="absolute top-0 left-0 bg-torca-azul h-full" 
                            style={{ width: `${uf.financialProgress}%` }} 
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">Meta: {formatPercentage(uf.financialProgrammed)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Oct 2024</span>
                      </div>
                      <div className={cn(
                        "flex items-center gap-2 transition-all",
                        isSelected ? "text-torca-azul font-black" : "text-gray-600 group-hover:translate-x-1 group-hover:text-violeta-dark"
                      )}>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{isSelected ? "Seleccionado" : "Ver Detalles"}</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
