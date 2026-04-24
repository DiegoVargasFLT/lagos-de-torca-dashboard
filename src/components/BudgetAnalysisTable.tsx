import React, { useState, useRef } from "react";
import { formatCurrency, formatPercentage, cn } from "../lib/utils";
import { DollarSign, Download, FileSpreadsheet, Eye, EyeOff, ShieldCheck, FileCheck, Search, Info, ChevronDown, ChevronRight } from "lucide-react";
import { exportAsImage, exportToExcel } from "../lib/exportUtils";

interface BudgetChapter {
  item: string;
  description: string;
  isHeader?: boolean;
  isSubHeader?: boolean;
  unitValue?: number; // Added unit value
  initial: { qty: number; total: number };
  v1: { qty: number; total: number };
  v2: { qty: number; total: number };
  v3: { qty: number; total: number };
  // Actas for Facturación
  actas: { qty: number; total: number }[];
  // Semanas for Ejecución
  semanas: { qty: number; total: number }[];
}

type TabType = "control" | "presupuesto" | "facturacion" | "ejecucion";

interface BudgetAnalysisTableProps {
  uf: any;
}

export const BudgetAnalysisTable: React.FC<BudgetAnalysisTableProps> = ({ uf }) => {
  const [activeTab, setActiveTab] = useState<TabType>("control");
  const [collapsedHeaders, setCollapsedHeaders] = useState<Set<string>>(new Set());
  const tableRef = useRef<HTMLDivElement>(null);

  const toggleHeader = (item: string) => {
    const newCollapsed = new Set(collapsedHeaders);
    if (newCollapsed.has(item)) {
      newCollapsed.delete(item);
    } else {
      newCollapsed.add(item);
    }
    setCollapsedHeaders(newCollapsed);
  };

  // Expanded mock data for the table with detailed versions and quantities
  const budgetData: BudgetChapter[] = [
    { 
      item: "1", 
      description: "PRELIMINARES", 
      isHeader: true, 
      unitValue: 0,
      initial: { qty: 1, total: 1200000000 }, 
      v1: { qty: 1, total: 1200000000 }, 
      v2: { qty: 1, total: 1250000000 }, 
      v3: { qty: 1, total: 1300000000 },
      actas: [{ qty: 0.5, total: 600000000 }, { qty: 0.3, total: 360000000 }, { qty: 0.12, total: 240000000 }],
      semanas: [{ qty: 0.1, total: 120000000 }, { qty: 0.15, total: 180000000 }, { qty: 0.1, total: 120000000 }]
    },
    { 
      item: "1.1", 
      description: "CARRETEABLE DE ACCESO SEGMENTO 1 - A UN ANCHO DE 4M", 
      isSubHeader: true, 
      unitValue: 500000000,
      initial: { qty: 1, total: 500000000 }, 
      v1: { qty: 1, total: 500000000 }, 
      v2: { qty: 1, total: 500000000 }, 
      v3: { qty: 1, total: 500000000 },
      actas: [{ qty: 0.8, total: 400000000 }, { qty: 0.1, total: 50000000 }, { qty: 0, total: 0 }],
      semanas: [{ qty: 0.4, total: 200000000 }, { qty: 0.4, total: 200000000 }, { qty: 0.1, total: 50000000 }]
    },
    { 
      item: "1.2", 
      description: "INSTALACIONES PROVISIONALES Y CAMPAMENTOS", 
      isSubHeader: true, 
      unitValue: 700000000,
      initial: { qty: 1, total: 700000000 }, 
      v1: { qty: 1, total: 700000000 }, 
      v2: { qty: 750000000, total: 750000000 }, 
      v3: { qty: 800000000, total: 800000000 },
      actas: [{ qty: 1, total: 800000000 }, { qty: 0, total: 0 }, { qty: 0, total: 0 }],
      semanas: [{ qty: 0.5, total: 400000000 }, { qty: 0.5, total: 400000000 }, { qty: 0, total: 0 }]
    },
    { 
      item: "2", 
      description: "MOVIMIENTO DE TIERRA Y MEJORAMIENTO DE SUBRASANTE", 
      isHeader: true, 
      unitValue: 0,
      initial: { qty: 1, total: 15400000000 }, 
      v1: { qty: 1, total: 15400000000 }, 
      v2: { qty: 1, total: 16000000000 }, 
      v3: { qty: 1, total: 16500000000 },
      actas: [{ qty: 0.4, total: 6600000000 }, { qty: 0.1, total: 1650000000 }, { qty: 0.05, total: 825000000 }],
      semanas: [{ qty: 0.05, total: 825000000 }, { qty: 0.1, total: 1650000000 }, { qty: 0.1, total: 1650000000 }]
    },
    { 
      item: "2.1", 
      description: "EXCAVACIONES MECÁNICAS", 
      isSubHeader: true, 
      unitValue: 22000,
      initial: { qty: 250000, total: 5500000000 }, 
      v1: { qty: 250000, total: 5500000000 }, 
      v2: { qty: 270000, total: 5940000000 }, 
      v3: { qty: 300000, total: 6600000000 },
      actas: [{ qty: 150000, total: 3300000000 }, { qty: 20000, total: 440000000 }, { qty: 0, total: 0 }],
      semanas: [{ qty: 10000, total: 220000000 }, { qty: 15000, total: 330000000 }, { qty: 10000, total: 220000000 }]
    },
    { 
      item: "2.2", 
      description: "RELLENOS CON MATERIAL SELECCIONADO", 
      isSubHeader: true, 
      unitValue: 65000,
      initial: { qty: 152307, total: 9900000000 }, 
      v1: { qty: 152307, total: 9900000000 }, 
      v2: { qty: 154769, total: 10060000000 }, 
      v3: { qty: 152307, total: 9900000000 },
      actas: [{ qty: 50000, total: 3250000000 }, { qty: 15000, total: 975000000 }, { qty: 0, total: 0 }],
      semanas: [{ qty: 10000, total: 650000000 }, { qty: 10000, total: 650000000 }, { qty: 10000, total: 650000000 }]
    },
    { 
      item: "3", 
      description: "ESTRUCTURAS DE PAVIMENTO", 
      isHeader: true, 
      unitValue: 0,
      initial: { qty: 1, total: 22400000000 }, 
      v1: { qty: 1, total: 22400000000 }, 
      v2: { qty: 1, total: 23000000000 }, 
      v3: { qty: 1, total: 24500000000 },
      actas: [{ qty: 0.1, total: 2450000000 }, { qty: 0, total: 0 }, { qty: 0, total: 0 }],
      semanas: [{ qty: 0.05, total: 1225000000 }, { qty: 0.05, total: 1225000000 }, { qty: 0, total: 0 }]
    },
    { 
      item: "3.1", 
      description: "SUBBASE GRANULAR", 
      isSubHeader: true, 
      unitValue: 120000,
      initial: { qty: 83333, total: 10000000000 }, 
      v1: { qty: 83333, total: 10000000000 }, 
      v2: { qty: 85000, total: 10200000000 }, 
      v3: { qty: 91666, total: 11000000000 },
      actas: [{ qty: 10000, total: 1200000000 }, { qty: 0, total: 0 }, { qty: 0, total: 0 }],
      semanas: [{ qty: 5000, total: 600000000 }, { qty: 5000, total: 600000000 }, { qty: 0, total: 0 }]
    },
    { 
      item: "3.2", 
      description: "BASE GRANULAR", 
      isSubHeader: true, 
      unitValue: 165000,
      initial: { qty: 75151, total: 12400000000 }, 
      v1: { qty: 75151, total: 12400000000 }, 
      v2: { qty: 77575, total: 12800000000 }, 
      v3: { qty: 81818, total: 13500000000 },
      actas: [{ qty: 5000, total: 825000000 }, { qty: 0, total: 0 }, { qty: 0, total: 0 }],
      semanas: [{ qty: 2500, total: 412500000 }, { qty: 2500, total: 412500000 }, { qty: 0, total: 0 }]
    },
    { 
      item: "4", 
      description: "ESTRUCTURAS PRINCIPALES", 
      isHeader: true, 
      unitValue: 0,
      initial: { qty: 1, total: 45000000000 }, 
      v1: { qty: 1, total: 45000000000 }, 
      v2: { qty: 1, total: 45000000000 }, 
      v3: { qty: 1, total: 45000000000 },
      actas: [{ qty: 0.05, total: 2250000000 }, { qty: 0.05, total: 2250000000 }, { qty: 0.1, total: 4500000000 }],
      semanas: [{ qty: 0.02, total: 900000000 }, { qty: 0.02, total: 900000000 }, { qty: 0.02, total: 900000000 }]
    },
  ];

  const visibleRows = budgetData.filter(row => {
    if (row.isHeader) return true;
    const parentId = row.item.split('.')[0];
    return !collapsedHeaders.has(parentId);
  });

  const calculateTotals = () => {
    const totals = {
      initial: 0,
      v1: 0,
      v2: 0,
      v3: 0,
      facturado: 0,
      ejecutado: 0,
      actas: [0, 0, 0],
      semanas: [0, 0, 0]
    };

    budgetData.forEach(row => {
      // Sum only subheaders to avoid double counting with headers
      if (row.isSubHeader) {
        totals.initial += row.initial.total;
        totals.v1 += row.v1.total;
        totals.v2 += row.v2.total;
        totals.v3 += row.v3.total;
        totals.facturado += row.actas.reduce((a, b) => a + b.total, 0);
        totals.ejecutado += row.semanas.reduce((a, b) => a + b.total, 0);
        
        row.actas.forEach((acta, i) => {
          if (totals.actas[i] !== undefined) totals.actas[i] += acta.total;
        });
        
        row.semanas.forEach((sem, i) => {
          if (totals.semanas[i] !== undefined) totals.semanas[i] += sem.total;
        });
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  const totalBudget = totals.v3;
  const totalExecuted = totals.ejecutado;
  const totalInvoiced = totals.facturado;

  const expandAll = () => setCollapsedHeaders(new Set());
  const collapseAll = () => {
    const allHeaderItems = budgetData.filter(row => row.isHeader).map(row => row.item);
    setCollapsedHeaders(new Set(allHeaderItems));
  };

  const handleExportExcel = () => {
    const dataToExport = budgetData.map(row => ({
      'Item': row.item,
      'Descripción': row.description,
      'P. Inicial (Total)': row.initial.total,
      'P. Vigente V3 (Total)': row.v3.total,
      'Facturado Total': row.actas.reduce((acc, a) => acc + a.total, 0),
      'Ejecutado Total': row.semanas.reduce((acc, s) => acc + s.total, 0),
    }));
    exportToExcel(dataToExport, `Detalle_Presupuesto_${uf.id}`, 'Presupuesto');
  };

  const renderControlTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1240px]">
        <thead>
          <tr className="bg-[#f8fafc] text-[9px] uppercase tracking-widest text-slate-800 border-b border-gray-200">
            <th className="py-6 px-6 font-black w-[80px] text-center sticky left-0 bg-[#f8fafc] z-10 border-r border-gray-200">Item</th>
            <th className="py-6 px-6 font-black w-[400px] sticky left-[80px] bg-[#f8fafc] z-10 border-r border-gray-200 shadow-[4px_0_10px_rgba(0,0,0,0.02)]">Descripción / Capítulo</th>
            <th className="py-6 px-4 font-black text-center bg-blue-50/30 border-r border-gray-200">P. Inicial</th>
            <th className="py-6 px-4 font-black text-center bg-blue-100/50 border-r border-gray-400">P. Vigente (V3)</th>
            
            <th className="py-6 px-4 font-black text-center bg-emerald-50 border-r border-gray-200">Ejecutado</th>
            <th className="py-6 px-4 font-black text-center bg-emerald-50/50 border-r border-gray-400">Pend. Ejecutar</th>
            
            <th className="py-6 px-4 font-black text-center bg-indigo-50 border-r border-gray-200">Facturado</th>
            <th className="py-6 px-4 font-black text-center bg-indigo-50/50">Pend. Facturar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {visibleRows.map((row, idx) => {
            const facturadoTotal = row.actas.reduce((a, b) => a + b.total, 0);
            const ejecutadoTotal = row.semanas.reduce((a, b) => a + b.total, 0);
            const pendFacturar = row.v3.total - facturadoTotal;
            const pendEjecutar = row.v3.total - ejecutadoTotal;
            const isCollapsed = collapsedHeaders.has(row.item);
            
            return (
              <tr 
                key={idx} 
                className={cn(
                  "group hover:bg-gray-50/50 transition-all",
                  row.isHeader ? "bg-violeta-dark/5" : "",
                  row.isSubHeader ? "bg-blue-50/10" : "bg-white"
                )}
              >
                <td className={cn(
                  "py-4 px-6 text-[10px] font-black text-center sticky left-0 z-10 border-r border-gray-100",
                  row.isHeader ? "bg-violeta-dark text-white" : "bg-white text-gray-700 group-hover:bg-gray-50 transition-colors"
                )}>
                  {row.item}
                </td>
                <td className={cn(
                  "py-4 px-6 text-[11px] font-bold sticky left-[80px] z-10 border-r border-gray-200 shadow-[4px_0_10px_rgba(0,0,0,0.02)]",
                  row.isHeader ? "bg-violeta-dark text-white uppercase tracking-wider" : "bg-white text-gray-700 group-hover:bg-gray-50 transition-colors",
                  row.isSubHeader ? "pl-12 text-[10px] italic font-black text-blue-800" : ""
                )}>
                  <div className="flex items-center gap-2">
                    {row.isHeader && (
                      <button 
                        onClick={() => toggleHeader(row.item)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                    {row.description}
                  </div>
                </td>
                <td className="py-4 px-4 text-[10px] font-mono font-bold text-gray-800 text-right bg-blue-50/10 border-r border-gray-100">{formatCurrency(row.initial.total)}</td>
                <td className={cn(
                  "py-4 px-4 text-[11px] font-mono font-black text-right border-r border-gray-300",
                  row.isHeader ? "text-violeta-dark bg-blue-100/30" : "text-blue-900 bg-blue-100/10"
                )}>
                  {formatCurrency(row.v3.total)}
                </td>
                
                <td className="py-4 px-4 text-[10px] font-mono font-bold text-emerald-700 text-right bg-emerald-50/20 border-r border-gray-100">{formatCurrency(ejecutadoTotal)}</td>
                <td className={cn(
                  "py-4 px-4 text-[11px] font-mono font-black text-right border-r border-gray-300",
                  pendEjecutar > 0 ? "text-red-500" : "text-emerald-600"
                )}>
                  {formatCurrency(pendEjecutar)}
                </td>

                <td className="py-4 px-4 text-[10px] font-mono font-bold text-indigo-700 text-right bg-indigo-50/20 border-r border-gray-100">{formatCurrency(facturadoTotal)}</td>
                <td className={cn(
                  "py-4 px-4 text-[10px] font-mono font-black text-right",
                  pendFacturar > 0 ? "text-amber-600" : "text-emerald-600"
                )}>
                  {formatCurrency(pendFacturar)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="sticky bottom-0 z-20">
          <tr className="bg-violeta-dark text-white font-display border-t-2 border-white/20">
            <td className="py-5 px-6 text-center font-black sticky left-0 bg-violeta-dark z-10 border-r border-white/10">TOTAL</td>
            <td className="py-5 px-6 text-xs font-black uppercase tracking-[0.2em] sticky left-[80px] bg-violeta-dark z-10 border-r border-white/10 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">CONSOLIDADO {uf.id}</td>
            <td className="py-5 px-4 text-[11px] font-mono font-black text-right border-r border-white/5 bg-white/5">{formatCurrency(totals.initial)}</td>
            <td className="py-5 px-4 text-[12px] font-mono font-black text-right border-r border-white/10 bg-white/10 text-torca-azul">{formatCurrency(totals.v3)}</td>
            
            <td className="py-5 px-4 text-[11px] font-mono font-black text-right border-r border-white/5 bg-white/5">{formatCurrency(totals.ejecutado)}</td>
            <td className="py-5 px-4 text-[11px] font-mono font-black text-right border-r border-white/5 bg-rio-verde/20 text-rio-verde">{formatCurrency(totals.v3 - totals.ejecutado)}</td>
            
            <td className="py-5 px-4 text-[11px] font-mono font-black text-right border-r border-white/5 bg-white/5">{formatCurrency(totals.facturado)}</td>
            <td className="py-5 px-4 text-[11px] font-mono font-black text-right bg-amber-400/20 text-amber-400">{formatCurrency(totals.v3 - totals.facturado)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  const renderDetailedTable = (type: "presupuesto" | "facturacion" | "ejecucion") => {
    let columns: string[] = [];

    if (type === "presupuesto") {
      columns = ["P. Inicial", "P. Versión 1", "P. Versión 2", "P. Vigente (V3)"];
    } else if (type === "facturacion") {
      columns = ["Acta 1", "Acta 2", "Acta 3", "Acumulado Presente Acta"];
    } else {
      columns = ["Corte Sem 1", "Corte Sem 2", "Corte Sem 3", "Acumulado"];
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1500px]">
          <thead>
            {/* Primary Header */}
            <tr className="bg-[#f8fafc] text-[9px] uppercase tracking-widest text-slate-800 border-b border-gray-200">
              <th rowSpan={2} className="py-6 px-6 font-black w-[80px] text-center sticky left-0 bg-[#f8fafc] z-20 border-r border-gray-200 border-b">Item</th>
              <th rowSpan={2} className="py-6 px-6 font-black w-[350px] sticky left-[80px] bg-[#f8fafc] z-20 border-r border-gray-300 border-b shadow-[4px_0_10px_rgba(0,0,0,0.02)]">Descripción / Capítulo</th>
              <th rowSpan={2} className="py-6 px-6 font-black text-center border-r border-gray-200 border-b bg-gray-50/50">V. Unitario</th>
              
              {columns.map((col, i) => (
                <th key={i} colSpan={2} className={cn(
                  "py-4 px-4 font-black text-center border-r border-gray-200 border-b",
                  i % 2 === 0 ? "bg-blue-50/30" : "bg-white"
                )}>
                  {col}
                </th>
              ))}
            </tr>
            {/* Sub-header for Qty/Total */}
            <tr className="bg-[#f8fafc] text-[8px] uppercase tracking-[0.1em] text-slate-600 border-b border-gray-200">
              {columns.map((_, i) => (
                <React.Fragment key={i}>
                  <th className={cn("py-2 px-4 font-bold text-center border-r border-gray-100", i % 2 === 0 ? "bg-blue-50/30" : "bg-white")}>Cant.</th>
                  <th className={cn("py-2 px-4 font-black text-center border-r border-gray-100", i % 2 === 0 ? "bg-blue-50/30" : "bg-white")}>Total</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleRows.map((row, idx) => {
              const isCollapsed = collapsedHeaders.has(row.item);
              const dataPoints = type === "presupuesto" 
                ? [row.initial, row.v1, row.v2, row.v3]
                : type === "facturacion"
                ? [...row.actas, { qty: row.actas.reduce((a, b) => a + b.qty, 0), total: row.actas.reduce((a, b) => a + b.total, 0) }]
                : [...row.semanas, { qty: row.semanas.reduce((a, b) => a + b.qty, 0), total: row.semanas.reduce((a, b) => a + b.total, 0) }];

              return (
                <tr key={idx} className={cn(
                  "group transition-all",
                  row.isHeader ? "bg-violeta-dark/5" : "bg-white"
                )}>
                  <td className={cn(
                    "py-3 px-6 text-[10px] font-black text-center sticky left-0 z-10 border-r border-gray-100",
                    row.isHeader ? "bg-violeta-dark text-white" : "bg-white text-gray-700 font-mono group-hover:bg-gray-50"
                  )}>
                    {row.item}
                  </td>
                  <td className={cn(
                    "py-3 px-6 text-[11px] font-bold sticky left-[80px] z-10 border-r border-gray-300 shadow-[4px_0_10px_rgba(0,0,0,0.02)]",
                    row.isHeader ? "bg-violeta-dark text-white uppercase" : "bg-white text-gray-700 group-hover:bg-gray-50",
                    row.isSubHeader && !row.isHeader ? "pl-10 text-blue-800" : ""
                  )}>
                    <div className="flex items-center gap-2">
                      {row.isHeader && (
                        <button onClick={() => toggleHeader(row.item)}>
                          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                      {row.description}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[10px] font-mono text-center border-r border-gray-100 text-slate-500">
                    {!row.isHeader && formatCurrency(row.unitValue || 0)}
                  </td>
                  {dataPoints.map((dp, i) => (
                    <React.Fragment key={i}>
                      <td className="py-3 px-4 text-[10px] font-mono text-right border-r border-gray-50 text-slate-600">
                        {!row.isHeader && dp.qty.toLocaleString()}
                      </td>
                      <td className={cn(
                        "py-3 px-4 text-[10px] font-mono font-bold text-right border-r border-gray-100",
                        row.isHeader ? "text-violeta-dark" : "text-blue-900"
                      )}>
                        {formatCurrency(dp.total)}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot className="sticky bottom-0 z-20">
            <tr className="bg-violeta-dark text-white border-t-2 border-white/20">
              <td className="py-4 px-6 text-center font-black sticky left-0 bg-violeta-dark z-10 border-r border-white/10">TOTAL</td>
              <td className="py-4 px-6 text-[10px] font-black uppercase sticky left-[80px] bg-violeta-dark z-10 border-r border-white/10 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">CONSOLIDADO {uf.id}</td>
              <td className="py-4 px-4 bg-white/5 border-r border-white/5"></td>
              {type === "presupuesto" ? (
                <>
                  <React.Fragment>
                    <td className="bg-white/5 border-r border-white/5"></td>
                    <td className="py-4 px-4 text-[10px] font-mono font-black text-right border-r border-white/10">{formatCurrency(totals.initial)}</td>
                  </React.Fragment>
                  <React.Fragment>
                    <td className="bg-white/5 border-r border-white/5"></td>
                    <td className="py-4 px-4 text-[10px] font-mono font-black text-right border-r border-white/10">{formatCurrency(totals.v1)}</td>
                  </React.Fragment>
                  <React.Fragment>
                    <td className="bg-white/5 border-r border-white/5"></td>
                    <td className="py-4 px-4 text-[10px] font-mono font-black text-right border-r border-white/10">{formatCurrency(totals.v2)}</td>
                  </React.Fragment>
                  <React.Fragment>
                    <td className="bg-white/5 border-r border-white/5"></td>
                    <td className="py-4 px-4 text-[11px] font-mono font-black text-right text-torca-azul">{formatCurrency(totals.v3)}</td>
                  </React.Fragment>
                </>
              ) : type === "facturacion" ? (
                <>
                  {totals.actas.map((total, i) => (
                    <React.Fragment key={i}>
                      <td className="bg-white/5 border-r border-white/5"></td>
                      <td className="py-4 px-4 text-[10px] font-mono font-black text-right border-r border-white/10">{formatCurrency(total)}</td>
                    </React.Fragment>
                  ))}
                  <React.Fragment>
                    <td className="bg-white/5 border-r border-white/5"></td>
                    <td className="py-4 px-4 text-[11px] font-mono font-black text-right text-amber-400">{formatCurrency(totals.facturado)}</td>
                  </React.Fragment>
                </>
              ) : (
                <>
                  {totals.semanas.map((total, i) => (
                    <React.Fragment key={i}>
                      <td className="bg-white/5 border-r border-white/5"></td>
                      <td className="py-4 px-4 text-[10px] font-mono font-black text-right border-r border-white/10">{formatCurrency(total)}</td>
                    </React.Fragment>
                  ))}
                  <React.Fragment>
                    <td className="bg-white/5 border-r border-white/5"></td>
                    <td className="py-4 px-4 text-[11px] font-mono font-black text-right text-rio-verde">{formatCurrency(totals.ejecutado)}</td>
                  </React.Fragment>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" ref={tableRef}>
      {/* Summary Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <h2 className="text-2xl font-display font-black text-violeta-dark">
          Dashboard de Análisis Presupuestal <span className="text-gray-400 font-medium">| {uf.id}</span>
        </h2>
        <div className="flex items-center gap-4 no-print">
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
            {(["control", "presupuesto", "facturacion", "ejecucion"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all",
                  activeTab === tab ? "bg-white text-torca-azul shadow-sm" : "text-gray-500 hover:text-torca-azul"
                )}
              >
                {tab === "control" ? "Matriz Control" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExportExcel}
            className="p-2.5 text-gray-400 hover:text-emerald-600 bg-white border border-gray-100 rounded-xl transition-all shadow-sm"
          >
            <FileSpreadsheet size={20} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="premium-card p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 border-b border-gray-100 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-xl font-display font-bold text-violeta-dark">
                {activeTab === "control" && "Matriz de Control de Presupuesto Detallado"}
                {activeTab === "presupuesto" && "Detalle de Versiones Presupuestales"}
                {activeTab === "facturacion" && "Detalle de Actas y Facturación"}
                {activeTab === "ejecucion" && "Seguimiento Semanal de Ejecución"}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">
                {activeTab === "control" && "Seguimiento por Capítulos y Ejecución Consolidada"}
                {activeTab === "presupuesto" && "Variación de Cantidades y Valores por Versión"}
                {activeTab === "facturacion" && "Avance de Facturación por Periodo Fiscal"}
                {activeTab === "ejecucion" && "Control de Cantidades Ejecutadas Semana a Semana"}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4 no-print text-gray-300">
              <button onClick={expandAll} className="px-2 py-1 hover:bg-gray-50 rounded transition-colors" title="Desplegar Todo">
                <ChevronDown size={18} />
              </button>
              <button onClick={collapseAll} className="px-2 py-1 hover:bg-gray-50 rounded transition-colors" title="Contraer Todo">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {activeTab === "control" && renderControlTable()}
        {activeTab !== "control" && renderDetailedTable(activeTab)}
      </div>

      {/* Botones de apoyo (Expandir/Contraer Todo Adicionales) */}
      <div className="flex justify-center gap-4 no-print">
        <button 
          onClick={expandAll}
          className="px-8 py-3 bg-violeta-dark text-white rounded-2xl font-display font-bold text-xs uppercase tracking-widest shadow-xl shadow-violeta-dark/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <ChevronDown size={18} />
          Desplegar Todos los Niveles
        </button>
        <button 
          onClick={collapseAll}
          className="px-8 py-3 bg-white border border-gray-200 text-violeta-dark rounded-2xl font-display font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <ChevronRight size={18} />
          Contraer Todos los Niveles
        </button>
      </div>
      
      <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 shadow-inner">
        <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
          <DollarSign size={24} />
        </div>
        <div>
          <h4 className="text-sm font-display font-bold text-violeta-dark">Estado General Presupuestal</h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">La disponibilidad presupuestal de la {uf.id} se encuentra dentro de los márgenes operativos definidos.</p>
        </div>
      </div>
    </div>
  );
};
