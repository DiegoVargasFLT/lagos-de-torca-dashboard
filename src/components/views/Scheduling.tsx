import React from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight,
  GanttChart,
  Target,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  Users,
  Flag
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { ufData } from "../../data/mockData";
import { formatPercentage, cn, formatCurrency } from "../../lib/utils";
import { Card } from "../Card";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine,
  Label
} from "recharts";
import { motion } from "motion/react";
import { toPng } from 'html-to-image';

export const Scheduling: React.FC = () => {
  const { filteredUFData, selectedUF, isConsolidated } = useDashboard();

  const scurveRef = React.useRef<HTMLDivElement>(null);
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const milestonesRef = React.useRef<HTMLDivElement>(null);

  const exportAsImage = async (ref: React.RefObject<HTMLDivElement>, fileName: string) => {
    if (ref.current === null) return;
    try {
      const dataUrl = await toPng(ref.current, { backgroundColor: '#ffffff', cacheBust: true });
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    }
  };

  const allMilestones = filteredUFData.flatMap(uf => uf.milestones.map(m => ({ ...m, ufId: uf.id })));
  const upcomingMilestones = allMilestones
    .filter(m => m.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Consolidated S-Curve for construction phase - SUM money values then derive percentage
  const consolidatedSCurve = React.useMemo(() => {
    const points: any[] = [];
    const totalGlobalValue = filteredUFData.reduce((acc, uf) => 
      acc + uf.constructorContract.value + uf.interventoriaContract.value, 0);

    filteredUFData.forEach(uf => {
      const ufTotalVal = uf.constructorContract.value + uf.interventoriaContract.value;
      uf.constructionSCurve.forEach((p, i) => {
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
        points[i].programmedMoney += (p.programmed / 100) * ufTotalVal;
        points[i].programmedInitialMoney += ((p.programmedInitial || p.programmed) / 100) * ufTotalVal;
        points[i].reprogramming1Money += ((p.reprogramming1 || p.programmedInitial || p.programmed) / 100) * ufTotalVal;
        points[i].reprogramming2Money += ((p.reprogramming2 || p.reprogramming1 || p.programmedInitial || p.programmed) / 100) * ufTotalVal;
        points[i].reprogramming3Money += ((p.reprogramming3 || p.reprogramming2 || p.reprogramming1 || p.programmedInitial || p.programmed) / 100) * ufTotalVal;
        points[i].reprogramming4Money += ((p.reprogramming4 || p.reprogramming3 || p.reprogramming2 || p.reprogramming1 || p.programmedInitial || p.programmed) / 100) * ufTotalVal;
        points[i].reprogramming5Money += ((p.reprogramming5 || p.reprogramming4 || p.reprogramming3 || p.reprogramming2 || p.reprogramming1 || p.programmedInitial || p.programmed) / 100) * ufTotalVal;
        points[i].executedMoney += (p.executed / 100) * ufTotalVal;
        points[i].invoicedMoney += (p.invoiced / 100) * ufTotalVal;
      });
    });

    // Derive percentages back for the graph lines if needed, but we'll use Money to sum
    return points.map(p => ({
      ...p,
      programmed: (p.programmedMoney / totalGlobalValue) * 100,
      programmedInitial: (p.programmedInitialMoney / totalGlobalValue) * 100,
      reprogramming1: (p.reprogramming1Money / totalGlobalValue) * 100,
      reprogramming2: (p.reprogramming2Money / totalGlobalValue) * 100,
      reprogramming3: (p.reprogramming3Money / totalGlobalValue) * 100,
      reprogramming4: (p.reprogramming4Money / totalGlobalValue) * 100,
      reprogramming5: (p.reprogramming5Money / totalGlobalValue) * 100,
      executed: (p.executedMoney / totalGlobalValue) * 100,
      invoiced: (p.invoicedMoney / totalGlobalValue) * 100,
    }));
  }, [filteredUFData]);

  const markers = React.useMemo(() => {
    let rawMarkers = [];
    if (selectedUF) rawMarkers = selectedUF.reprogrammingMarkers || [];
    else rawMarkers = filteredUFData[0]?.reprogrammingMarkers || [];
    
    // Ensure chronological order for segmentation logic
    return [...rawMarkers].sort((a, b) => a.month.localeCompare(b.month));
  }, [selectedUF, filteredUFData]);

  const chartData = React.useMemo(() => {
    const baseData = selectedUF ? selectedUF.constructionSCurve : consolidatedSCurve;
    const totalVal = selectedUF 
      ? (selectedUF.constructorContract.value + selectedUF.interventoriaContract.value)
      : filteredUFData.reduce((acc, uf) => acc + uf.constructorContract.value + uf.interventoriaContract.value, 0);

    const m = markers.map(marker => marker.month);

    return baseData.map(point => {
      const pInitialMoney = ((point.programmedInitial || point.programmed) / 100) * totalVal;
      const r1Money = ((point.reprogramming1 || point.reprogramming5 || point.programmed) / 100) * totalVal;
      const r2Money = ((point.reprogramming2 || point.reprogramming5 || point.programmed) / 100) * totalVal;
      const r3Money = ((point.reprogramming3 || point.reprogramming5 || point.programmed) / 100) * totalVal;
      const r4Money = ((point.reprogramming4 || point.reprogramming5 || point.programmed) / 100) * totalVal;
      const r5Money = ((point.reprogramming5 || point.programmed) / 100) * totalVal;

      const executedMoney = (point.executed / 100) * totalVal;
      const invoicedMoney = (point.invoiced / 100) * totalVal;

      // Piecewise construction requested: 
      // Reprog 1 goes to Line 1. Reprog 2 starts at Line 1 ends at Line 2. etc.
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
        currentProgrammed, // For Tooltip
        
        // Segmented lines for visual continuity/history logic
        pInitialMoney: currentMonth <= (m[0] || 'ZZZ') ? pInitialMoney : undefined,
        r1Money: (m[0] && currentMonth >= m[0] && currentMonth <= (m[1] || 'ZZZ')) ? r1Money : undefined,
        r2Money: (m[1] && currentMonth >= m[1] && currentMonth <= (m[2] || 'ZZZ')) ? r2Money : undefined,
        r3Money: (m[2] && currentMonth >= m[2] && currentMonth <= (m[3] || 'ZZZ')) ? r3Money : undefined,
        r4Money: (m[3] && currentMonth >= m[3] && currentMonth <= (m[4] || 'ZZZ')) ? r4Money : undefined,
        r5Money: (m[4] && currentMonth >= m[4]) ? r5Money : undefined,
      };
    });
  }, [selectedUF, consolidatedSCurve, filteredUFData, markers]);

  const summaryData = React.useMemo(() => {
    const totalProgrammedMoney = filteredUFData.reduce((acc, uf) => 
      acc + (uf.constructorContract.value + uf.interventoriaContract.value), 0);
    const totalExecutedMoney = filteredUFData.reduce((acc, uf) => 
      acc + (uf.constructorContract.executed + uf.interventoriaContract.executed), 0);
    const totalInvoicedContratista = filteredUFData.reduce((acc, uf) => 
      acc + uf.constructorContract.invoiced, 0);
    const totalInvoicedInterventoria = filteredUFData.reduce((acc, uf) => 
      acc + uf.interventoriaContract.invoiced, 0);

    const progFinanciero = 100.00;
    const ejecFinanciero = (totalExecutedMoney / totalProgrammedMoney) * 100;

    return {
      valProgramado: totalProgrammedMoney,
      valEjecutado: totalExecutedMoney,
      progFinanciero: progFinanciero,
      ejecFinanciero: ejecFinanciero,
      diferencia: ejecFinanciero - progFinanciero,
      valFacturadoContratista: totalInvoicedContratista,
      valFacturadoInterventoria: totalInvoicedInterventoria
    };
  }, [filteredUFData]);

  // Calculate Master Timeline items with absolute temporal positioning
  const timelineData = React.useMemo(() => {
    const allDates = filteredUFData.flatMap(uf => [
      new Date(uf.startDate),
      new Date(uf.endDate)
    ]);
    if (allDates.length === 0) return { minDate: new Date(), maxDate: new Date(), items: [] };

    const minDateRaw = new Date(Math.min(...allDates.map(d => d.getTime())));
    // Set minDate to start of that year for better visualization
    const minDate = new Date(minDateRaw.getFullYear(), 0, 1);
    
    const maxDateRaw = new Date(Math.max(...allDates.map(d => d.getTime())));
    // Set maxDate to end of that year
    const maxDate = new Date(maxDateRaw.getFullYear(), 11, 31);
    
    const totalDuration = maxDate.getTime() - minDate.getTime();

    const items = filteredUFData.map(uf => {
      const getShift = (dateStr: string) => 
        ((new Date(dateStr).getTime() - minDate.getTime()) / totalDuration) * 100;
      
      const getWidth = (startStr: string, endStr: string) => 
        ((new Date(endStr).getTime() - new Date(startStr).getTime()) / totalDuration) * 100;

      return {
        id: uf.id,
        contractor: uf.contractor,
        progress: uf.financialProgress,
        phases: [
          { label: "Preconstrucción", start: getShift(uf.preconstructionStart), width: getWidth(uf.preconstructionStart, uf.preconstructionEnd), color: "bg-[#61B1E3]" },
          { label: "Construcción", start: getShift(uf.constructionStart), width: getWidth(uf.constructionStart, uf.constructionEnd), color: "bg-[#003366]" },
          { label: "Entrega", start: getShift(uf.deliveryStart), width: getWidth(uf.deliveryStart, uf.deliveryEnd), color: "bg-[#10b981]" },
          { label: "Liquidación", start: getShift(uf.liquidationStart), width: getWidth(uf.liquidationStart, uf.liquidationEnd), color: "bg-[#8b5cf6]" },
        ]
      };
    });

    const years = [];
    for (let y = minDate.getFullYear(); y <= maxDate.getFullYear(); y++) {
      years.push(y);
    }

    return { minDate, maxDate, totalDuration, items, years };
  }, [filteredUFData]);

  // Calculate key milestone dates
  const milestoneDates = React.useMemo(() => {
    if (filteredUFData.length === 0) return null;

    const findMin = (arr: Date[]) => new Date(Math.min(...arr.map(d => d.getTime())));
    const findMax = (arr: Date[]) => new Date(Math.max(...arr.map(d => d.getTime())));

    return {
      projectStart: findMin(filteredUFData.map(uf => new Date(uf.startDate))),
      preconStart: findMin(filteredUFData.map(uf => new Date(uf.preconstructionStart))),
      preconEnd: findMax(filteredUFData.map(uf => new Date(uf.preconstructionEnd))),
      constructionStart: findMin(filteredUFData.map(uf => new Date(uf.constructionStart))),
      constructionEnd: findMax(filteredUFData.map(uf => new Date(uf.constructionEnd))),
      deliveryStart: findMin(filteredUFData.map(uf => new Date(uf.deliveryStart))),
      deliveryEnd: findMax(filteredUFData.map(uf => new Date(uf.deliveryEnd))),
      liquidationEnd: findMax(filteredUFData.map(uf => new Date(uf.liquidationEnd)))
    };
  }, [filteredUFData]);

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase();
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-violeta-dark tracking-tight">Cronograma y Avance</h2>
          <p className="text-sm text-gray-500 font-medium">Seguimiento temporal y cumplimiento de hitos estratégicos</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-torca-azul/10 rounded-xl text-torca-azul">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                {!isConsolidated ? "Fecha de Corte (Hoy)" : "Fecha de Corte"}
              </p>
              <p className="text-sm font-bold text-violeta-dark">
                {!isConsolidated ? formatDateShort(new Date()) : "10 Abr 2026"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Milestone Dates Panel */}
      {milestoneDates && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {[
            { 
              label: "Inicio Proyecto", 
              date: formatDateShort(milestoneDates.projectStart), 
              icon: <Clock size={16} />, 
              color: "text-blue-600",
              sub: "Hito Contractual"
            },
            { 
              label: "Inicio Precon.", 
              date: formatDateShort(milestoneDates.preconStart), 
              icon: <Target size={16} />, 
              color: "text-torca-azul",
              sub: "Arranque"
            },
            { 
              label: "Fin Precon.", 
              date: formatDateShort(milestoneDates.preconEnd), 
              icon: <CheckCircle2 size={16} />, 
              color: "text-sky-500",
              sub: "Estudios"
            },
            { 
              label: "Inicio Const.", 
              date: formatDateShort(milestoneDates.constructionStart), 
              icon: <LayoutDashboard size={16} />, 
              color: "text-[#003366]",
              sub: "Obra Civil"
            },
            { 
              label: "Fin Const.", 
              date: formatDateShort(milestoneDates.constructionEnd), 
              icon: <Flag size={16} />, 
              color: "text-[#003366]",
              sub: "Cierre Físico"
            },
            { 
              label: "Beneficiarios", 
              date: isConsolidated 
                ? `${formatDateShort(milestoneDates.deliveryStart)} - ${formatDateShort(milestoneDates.deliveryEnd)}`
                : formatDateShort(milestoneDates.deliveryStart), 
              icon: <Users size={16} />, 
              color: "text-emerald-600",
              sub: "Entregas"
            },
            { 
              label: "Liquidación", 
              date: formatDateShort(milestoneDates.liquidationEnd), 
              icon: <ArrowRight size={16} />, 
              color: "text-purple-600",
              sub: "Cierre Adm."
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="premium-card p-4 flex flex-col items-center text-center gap-3 group hover:bg-violeta-dark transition-all duration-500 cursor-default border-violeta-dark/5"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:bg-white/10 group-hover:text-white bg-gray-50",
                item.color
              )}>
                {item.icon}
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-600 group-hover:text-white/60 uppercase tracking-widest leading-none mb-1.5 transition-colors">
                  {item.label}
                </p>
                <p className="text-xs font-display font-black text-violeta-dark group-hover:text-white transition-colors truncate w-full">
                  {item.date}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <div className="premium-card p-10 overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div>
            <h3 className="text-xl font-display font-bold text-violeta-dark flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-xl text-blue-600">
                <GanttChart size={20} />
              </div>
              Línea de Tiempo Maestra
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">Despliegue temporal absoluto por Unidad Funcional</p>
          </div>
          <div className="flex flex-wrap gap-6">
            {[
              { label: "Preconstrucción", color: "bg-[#61B1E3]" },
              { label: "Construcción", color: "bg-[#003366]" },
              { label: "Entrega", color: "bg-[#10b981]" },
              { label: "Liquidación", color: "bg-[#8b5cf6]" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-md shadow-sm", item.color)} />
                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8 relative pb-20 pt-8">
          {/* Vertical Year Dividers */}
          <div className="absolute inset-0 pointer-events-none">
            {timelineData.years.map((year) => {
              const yearStart = new Date(year, 0, 1);
              const left = ((yearStart.getTime() - timelineData.minDate.getTime()) / timelineData.totalDuration) * 100;
              return (
                <div key={year} className="absolute h-full border-l border-gray-200" style={{ left: `${left}%` }}>
                  <span className="absolute bottom-[-15px] left-0 text-[10px] font-black text-gray-600 tracking-[0.3em] pl-2">{year}</span>
                </div>
              );
            })}
          </div>

          {timelineData.items.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 group"
            >
              <div className="flex justify-between items-end mb-3 font-display">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violeta-dark text-white flex items-center justify-center font-black text-[10px] shadow-lg group-hover:scale-110 transition-transform">
                    {item.id}
                  </div>
                  <div>
                    <span className="text-xs font-black text-violeta-dark uppercase tracking-tight block leading-none">{item.contractor}</span>
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1 block">Ejecución Física: {formatPercentage(item.progress)}</span>
                  </div>
                </div>
              </div>

              {/* Multi-phase Bar */}
              <div className="h-8 bg-gray-50/50 rounded-xl relative border border-gray-100/50 shadow-inner group-hover:shadow-md transition-shadow duration-300">
                {item.phases.map((phase, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "absolute top-1 bottom-1 rounded-md transition-all duration-700 shadow-sm flex items-center justify-center overflow-hidden",
                      phase.color
                    )}
                    style={{ 
                      left: `${phase.start}%`, 
                      width: `${phase.width}%` 
                    }}
                  >
                    {phase.width > 12 && (
                      <span className="text-[7px] font-black text-white/50 uppercase tracking-tighter truncate px-1 relative z-10">
                        {phase.label}
                      </span>
                    )}
                    
                    {/* Progress indicator inner for Construction phase */}
                    {phase.label === "Construcción" && (
                      <motion.div 
                        className="absolute inset-0 bg-white/20 z-0"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1.5, delay: 1 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
          
          {/* Today Indicator */}
          {new Date().getTime() >= timelineData.minDate.getTime() && new Date().getTime() <= timelineData.maxDate.getTime() && (
            <div 
              className="absolute top-0 bottom-6 w-0.5 bg-red-500 z-20 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
              style={{ 
                left: `${((new Date().getTime() - timelineData.minDate.getTime()) / timelineData.totalDuration) * 100}%` 
              }}
            >
              <div className="absolute top-[-35px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full whitespace-nowrap uppercase tracking-widest shadow-xl ring-4 ring-white">
                Hoy: 17 Abr 26
              </div>
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-red-500 shadow-xl ring-2 ring-white" />
            </div>
          )}
        </div>
      </div>

      {/* S-Curve Section - Full Width - Only if UF selected */}
      {selectedUF && (
        <div className="premium-card p-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-xl font-display font-bold text-violeta-dark flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <TrendingUp size={20} />
              </div>
              Curva S Consolidada
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Avance económico acumulado vs. programación vigente</p>
          </div>
          <button 
            onClick={() => exportAsImage(scurveRef, 'Curva-S')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-4 py-2 rounded-lg transition-colors border border-gray-200"
          >
            Exportar Imagen
          </button>
        </div>
        
        <div ref={scurveRef} className="bg-white p-4 rounded-xl">
          <div className="flex flex-col items-center mb-8">
            <h3 className="text-sm font-black text-gray-600 uppercase tracking-[0.3em]">CURVA S PROGRAMA DE CONSTRUCCIÓN</h3>
          </div>
          <div className="h-[700px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 60, left: 40, bottom: 80 }}>
              <CartesianGrid strokeDasharray="1 1" vertical={true} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={{ stroke: '#94a3b8' }} 
                tickLine={{ stroke: '#94a3b8' }} 
                tick={{ fontSize: 8, fontWeight: 600, fill: '#64748b' }}
                interval={0}
                angle={-90}
                textAnchor="end"
                height={70}
                dy={10}
              />
              <YAxis 
                axisLine={{ stroke: '#94a3b8' }} 
                tickLine={{ stroke: '#94a3b8' }} 
                tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                tickFormatter={(val) => `$${(val/1e6).toLocaleString()}`}
                width={80}
              >
                <Label value="Millones" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} offset={-20} />
              </YAxis>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '0.8rem', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                  padding: '16px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)'
                }}
                formatter={(val: number, name: string) => {
                  if (name === "VALOR PROGRAMADO ACTUAL") return [formatCurrency(val), "PROGRAMADO"];
                  if (name === "$ EJECUTADO ACUM") return [formatCurrency(val), "EJECUTADO"];
                  if (name === "$ FACTURADO ACUM") return [formatCurrency(val), "FACTURADO"];
                  return [null, ""];
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                layout="horizontal"
                iconType="rect"
                formatter={(value) => <span className="text-slate-800 font-bold ml-1">{value}</span>}
                wrapperStyle={{ fontSize: '7px', paddingTop: '50px' }} 
              />
              
              {/* Vertical Markers labels matching image style */}
              {markers.map((marker, i) => (
                <ReferenceLine 
                  key={i} 
                  x={marker.month} 
                  stroke={
                    i === 0 ? "#fbbf24" : // Yellow
                    i === 1 ? "#3b82f6" : // Blue
                    i === 2 ? "#22d3ee" : // Cyan
                    i === 3 ? "#10b981" : // Green
                    "#000000" // Black for final
                  } 
                  strokeWidth={2.5}
                >
                  <Label 
                    value={marker.label} 
                    position="center"
                    fill="#0f172a" 
                    fontSize={10} 
                    fontWeight="black" 
                    angle={-90}
                    dx={-10}
                  />
                </ReferenceLine>
              ))}

              {/* Order of lines in Legend and rendering */}
              <Line type="monotone" dataKey="pInitialMoney" name="VALOR PROGRAMADO INICIAL" stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="r1Money" name="VALOR REPROGRAMACIÓN 1" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="r2Money" name="VALOR REPROGRAMACIÓN 2" stroke="#d97706" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="r3Money" name="VALOR REPROGRAMACIÓN 3" stroke="#b45309" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="r4Money" name="VALOR REPROGRAMACIÓN 4" stroke="#92400e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="r5Money" name="VALOR REPROGRAMACIÓN FINAL" stroke="#1e40af" strokeWidth={3} dot={false} />
              
              <Line type="monotone" dataKey="currentProgrammed" name="VALOR PROGRAMADO ACTUAL" stroke="#d97706" strokeWidth={4} dot={false} activeDot={{ r: 8, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }} />
              
              <Line type="monotone" dataKey="executedMoney" name="$ EJECUTADO ACUM" stroke="#10b981" strokeWidth={4} dot={false} />
              <Line type="monotone" dataKey="invoicedMoney" name="$ FACTURADO ACUM" stroke="#7c3aed" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )}

      {/* Summary table below the S-Curve as requested */}
      <div className="premium-card p-0 flex flex-col overflow-hidden">
        <div className="bg-[#003366] p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-display font-bold">Resumen de Avance</h3>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-1">Consolidado contractual vigente</p>
          </div>
          <button 
            onClick={() => exportAsImage(summaryRef, 'Resumen-Avance')}
            className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-colors border border-white/20"
          >
            Exportar Imagen
          </button>
        </div>
        <div ref={summaryRef} className="bg-white">
          <div className="flex-1">
            <table className="w-full text-left border-collapse">
              <tbody>
                {[
                  { label: "Valor programado", value: formatCurrency(summaryData.valProgramado), isMoney: true },
                  { label: "Valor Ejecutado", value: formatCurrency(summaryData.valEjecutado), isMoney: true },
                  { label: "% Programado (Financiero)", value: "100,00%", isMoney: false },
                  { label: "% Ejecutado (Financiero)", value: "99,80%", isMoney: false },
                  { label: "Valor Facturado Contratista", value: formatCurrency(summaryData.valFacturadoContratista), isMoney: true },
                  { label: "Valor Facturado Interventoría", value: formatCurrency(summaryData.valFacturadoInterventoria), isMoney: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-[11px] font-bold text-gray-700 uppercase tracking-tight">{row.label}</td>
                    <td className="py-4 px-6 text-[12px] font-black text-black text-right font-mono">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Ejecución Financiera Acum.</span>
              <span className="text-lg font-black text-[#10b981] font-mono">{formatPercentage(summaryData.ejecFinanciero)}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, summaryData.ejecFinanciero)}%` }}
                transition={{ duration: 1.5 }}
                className="h-full bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Activities Table - Now dynamic based on selection */}
      <div ref={milestonesRef}>
        <Card className="p-0 overflow-hidden border-none shadow-premium rounded-[2rem]">
          <div className="bg-[#003366] p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-display font-bold uppercase tracking-tight">Cronograma {selectedUF ? selectedUF.id : "Global"} Proyectos Torca</h3>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest mt-1">Detalle de hitos y dependencias de obra (Versión Estratégica)</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => exportAsImage(milestonesRef, 'Cronograma-Detallado')}
                className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-colors border border-white/20"
              >
                Exportar Imagen
              </button>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-50/20 rounded-sm" />
                  <span>Resumen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white/5 rounded-sm" />
                  <span>Hito</span>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto overflow-y-hidden custom-scrollbar bg-white">
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
              <thead className="bg-[#f1f5f9] border-b-2 border-gray-200">
                <tr>
                  <th className="py-4 px-8 text-[11px] font-black text-[#003366] uppercase tracking-widest w-[400px]">Nombre de tarea</th>
                  <th className="py-4 px-6 text-[11px] font-black text-[#003366] uppercase tracking-widest text-center w-[120px]">Duración</th>
                  <th className="py-4 px-6 text-[11px] font-black text-[#003366] uppercase tracking-widest text-center w-[120px]">Comienza</th>
                  <th className="py-4 px-6 text-[11px] font-black text-[#003366] uppercase tracking-widest text-center w-[120px]">Fin</th>
                  <th className="py-4 px-6 text-[11px] font-black text-[#003366] uppercase tracking-widest text-center w-[120px]">% Prog.</th>
                  <th className="py-4 px-6 text-[11px] font-black text-[#003366] uppercase tracking-widest text-center w-[120px]">% Ejec.</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Inicio Proyecto", duration: "0 días", start: "30/08/21", end: "30/08/21", prog: "100%", ejec: "100%", type: "milestone" },
                  { name: `CRONOGRAMA ${selectedUF ? selectedUF.id : "GLOBAL"}`, duration: "1550 días", start: "30/08/21", end: "27/11/25", prog: "98%", ejec: "94%", type: "summary" },
                  { name: "DISEÑOS", duration: "1160 días", start: "30/08/21", end: "01/11/24", prog: "100%", ejec: "100%", type: "subsummary" },
                  { name: "LIBERACIONES AMBIENTALES", duration: "1176 días", start: "30/08/21", end: "17/11/24", prog: "100%", ejec: "98%", type: "subsummary" },
                  { name: "LIBERACIONES PREDIALES", duration: "1246 días", start: "30/08/21", end: "26/01/25", prog: "100%", ejec: "96%", type: "subsummary" },
                  { name: "PREOPERATIVOS", duration: "254 días", start: "02/04/22", end: "12/12/22", prog: "100%", ejec: "100%", type: "subsummary" },
                  { name: "CONSTRUCCIÓN", duration: "1053 días", start: "10/01/23", end: "27/11/25", prog: "85%", ejec: "78%", type: "summary" },
                  { name: "ESTRUCTURAS PRINCIPALES", duration: "780 días", start: "11/04/23", end: "30/06/25", prog: "92%", ejec: "88%", type: "subsummary" },
                  { name: "CIMENTACIÓN Y PILOTAJE", duration: "732 días", start: "30/05/23", end: "30/06/25", prog: "100%", ejec: "100%", type: "task", indent: true },
                  { name: "Hito Terminación Cimentación", duration: "0 días", start: "30/06/25", end: "30/06/25", prog: "100%", ejec: "100%", type: "milestone", indent: true },
                  { name: "SUPERESTRUCTURA", duration: "872 días", start: "10/01/23", end: "30/06/25", prog: "80%", ejec: "72%", type: "subsummary" },
                  { name: "VIGAS Y CABEZALES", duration: "842 días", start: "10/01/23", end: "30/06/25", prog: "85%", ejec: "78%", type: "task", indent: true },
                  { name: "EQUIPAMIENTO URBANO", duration: "752 días", start: "09/05/23", end: "30/06/25", prog: "60%", ejec: "52%", type: "subsummary" },
                  { name: "COMPONENTES GLOBALES", duration: "581 días", start: "19/05/23", end: "30/06/25", prog: "65%", ejec: "60%", type: "subsummary" },
                  { name: "Liquidación de Obra", duration: "90 días", start: "29/08/25", end: "30/12/25", prog: "0%", ejec: "0%", type: "task" },
                  { name: "Fin Proyecto", duration: "0 días", start: "27/11/25", end: "30/12/25", prog: "100%", ejec: "100%", type: "milestone" },
                ].map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={cn(
                      "border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-all group",
                      row.type === "summary" ? "bg-blue-50/20" : "",
                      row.type === "subsummary" ? "bg-[#f8fafc]" : ""
                    )}
                  >
                    <td className={cn(
                      "py-4 px-8 text-[11px] font-bold border-r border-gray-50",
                      row.type === "summary" ? "text-[#003366] font-black uppercase tracking-tight text-[12px]" : "text-gray-700",
                      row.type === "subsummary" ? "text-blue-900 uppercase tracking-widest text-[10px] font-black pl-10" : "",
                      row.indent ? "pl-16 font-medium text-gray-500 italic" : "",
                      row.type === "milestone" ? "text-torca-azul italic" : ""
                    )}>
                      {row.name}
                    </td>
                    <td className="py-4 px-6 text-[11px] font-bold text-gray-600 text-center border-r border-gray-50">{row.duration}</td>
                    <td className="py-4 px-6 text-[11px] font-black text-[#334155] text-center border-r border-gray-50">{row.start}</td>
                    <td className="py-4 px-6 text-[11px] font-black text-[#334155] text-center border-r border-gray-50">{row.end}</td>
                    <td className="py-4 px-6 text-[11px] font-black text-blue-600 text-center border-r border-gray-50">{row.prog}</td>
                    <td className="py-4 px-6 text-[11px] font-black text-emerald-600 text-center">{row.ejec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Analysis and Milestones Section - At the end as requested */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Critical Path Analysis */}
        <div className="premium-card p-8">
          <h3 className="text-xl font-display font-bold text-violeta-dark mb-8 flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <AlertTriangle size={20} />
            </div>
            Ruta Crítica
          </h3>
          <div className="space-y-6">
            {filteredUFData.slice(0, 4).map((uf) => (
              <div key={uf.id} className="p-6 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-premium transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-display font-bold text-violeta-dark">{uf.id}</span>
                  <span className={cn(
                    "text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                    uf.physicalProgress < uf.physicalProgrammed ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {uf.physicalProgress < uf.physicalProgrammed ? "En Riesgo" : "Al Día"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium italic">
                  "{uf.criticalPathComments}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="premium-card p-8 lg:col-span-2">
          <h3 className="text-xl font-display font-bold text-violeta-dark mb-10 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <Target size={20} />
            </div>
            Hitos Críticos Consolidados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingMilestones.slice(0, 6).map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-5 p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-premium transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-torca-azul/5 flex items-center justify-center text-torca-azul group-hover:bg-torca-azul group-hover:text-white transition-all duration-500">
                  <Calendar size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-violeta-dark truncate">{milestone.title}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold text-torca-azul bg-torca-azul/10 px-2 py-0.5 rounded-lg uppercase tracking-widest">{milestone.ufId}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{milestone.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
