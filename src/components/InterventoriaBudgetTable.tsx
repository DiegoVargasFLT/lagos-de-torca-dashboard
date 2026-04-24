import React, { useState, useRef } from "react";
import { formatCurrency, formatPercentage, cn } from "../lib/utils";
import { DollarSign, Download, FileSpreadsheet, Eye, EyeOff, ShieldCheck, FileCheck, Search, Info, ChevronDown, ChevronRight } from "lucide-react";
import { exportAsImage, exportToExcel } from "../lib/exportUtils";

interface BudgetChapter {
  item: string;
  description: string;
  isHeader?: boolean;
  isSubHeader?: boolean;
  unitValue?: number;
  initial: { qty: number; total: number };
  v1: { qty: number; total: number };
  v2: { qty: number; total: number };
  v3: { qty: number; total: number };
  actas: { qty: number; total: number }[];
}

type TabType = "control" | "presupuesto" | "facturacion";

interface InterventoriaBudgetTableProps {
  uf: any;
}

export const InterventoriaBudgetTable: React.FC<InterventoriaBudgetTableProps> = ({ uf }) => {
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

  // Specialized data for Interventoría
  const budgetData: BudgetChapter[] = [
    { 
      item: "1", 
      description: "DIRECCIÓN DE OBRA Y GESTIÓN", 
      isHeader: true, 
      unitValue: 0,
      initial: { qty: 1, total: 450000000 }, 
      v1: { qty: 1, total: 450000000 }, 
      v2: { qty: 1, total: 480000000 }, 
      v3: { qty: 1, total: 500000000 },
      actas: [{ qty: 0.2, total: 100000000 }, { qty: 0.2, total: 100000000 }, { qty: 0.1, total: 50000000 }]
    },
    { 
      item: "1.1", 
      description: "PERSONAL ESPECIALISTA SENIOR", 
      isSubHeader: true, 
      unitValue: 35000000,
      initial: { qty: 10, total: 350000000 }, 
      v1: { qty: 10, total: 350000000 }, 
      v2: { qty: 11, total: 385000000 }, 
      v3: { qty: 12, total: 420000000 },
      actas: [{ qty: 2, total: 70000000 }, { qty: 2, total: 70000000 }, { qty: 1, total: 35000000 }]
    },
    { 
      item: "1.2", 
      description: "PERSONAL TÉCNICO Y DE APOYO", 
      isSubHeader: true, 
      unitValue: 8000000,
      initial: { qty: 12.5, total: 100000000 }, 
      v1: { qty: 12.5, total: 100000000 }, 
      v2: { qty: 11.8, total: 95000000 }, 
      v3: { qty: 10, total: 80000000 },
      actas: [{ qty: 3.75, total: 30000000 }, { qty: 3.75, total: 30000000 }, { qty: 1.8, total: 15000000 }]
    },
    { 
      item: "2", 
      description: "ENSAYOS Y CONTROL DE CALIDAD", 
      isHeader: true, 
      initial: { qty: 1, total: 120000000 }, 
      v1: { qty: 1, total: 120000000 }, 
      v2: { qty: 1, total: 120000000 }, 
      v3: { qty: 1, total: 120000000 },
      actas: [{ qty: 0.15, total: 18000000 }, { qty: 0.1, total: 12000000 }, { qty: 0, total: 0 }]
    },
    { 
      item: "2.1", 
      description: "ENSAYOS DE LABORATORIO EXTERNO", 
      isSubHeader: true, 
      unitValue: 500000,
      initial: { qty: 240, total: 120000000 }, 
      v1: { qty: 240, total: 120000000 }, 
      v2: { qty: 240, total: 120000000 }, 
      v3: { qty: 240, total: 120000000 },
      actas: [{ qty: 36, total: 18000000 }, { qty: 24, total: 12000000 }, { qty: 0, total: 0 }]
    },
    { 
      item: "3", 
      description: "GASTOS GENERALES Y LOGÍSTICA", 
      isHeader: true, 
      initial: { qty: 1, total: 180000000 }, 
      v1: { qty: 1, total: 180000000 }, 
      v2: { qty: 1, total: 195000000 }, 
      v3: { qty: 1, total: 200000000 },
      actas: [{ qty: 0.5, total: 100000000 }, { qty: 0.1, total: 20000000 }, { qty: 0, total: 0 }]
    }
  ];

  const visibleRows = budgetData.filter(row => {
    if (row.isHeader) return true;
    const parentId = row.item.split('.')[0];
    return !collapsedHeaders.has(parentId);
  });

  const calculateTotals = () => {
    const totals = {
      initial: 0, v1: 0, v2: 0, v3: 0, facturado: 0,
      actas: [0, 0, 0]
    };

    budgetData.forEach(row => {
      if (row.isSubHeader) {
        totals.initial += row.initial.total;
        totals.v1 += row.v1.total;
        totals.v2 += row.v2.total;
        totals.v3 += row.v3.total;
        totals.facturado += row.actas.reduce((a, b) => a + b.total, 0);
        row.actas.forEach((acta, i) => { if (totals.actas[i] !== undefined) totals.actas[i] += acta.total; });
      }
    });

    return totals;
  };

  const totals = calculateTotals();

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
    }));
    exportToExcel(dataToExport, `Interventoria_Presupuesto_${uf.id}`, 'Presupuesto');
  };

  const renderControlTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-[#f8fafc] text-[9px] uppercase tracking-widest text-slate-800 border-b border-gray-200">
            <th className="py-6 px-6 font-black w-[80px] text-center sticky left-0 bg-[#f8fafc] z-10 border-r border-gray-200">Item</th>
            <th className="py-6 px-6 font-black w-[400px] sticky left-[80px] bg-[#f8fafc] z-10 border-r border-gray-200">Descripción / Capítulo</th>
            <th className="py-6 px-4 font-black text-center bg-blue-50/30 border-r border-gray-200">P. Inicial</th>
            <th className="py-6 px-4 font-black text-center bg-blue-100/50 border-r border-gray-400">P. Vigente (V3)</th>
            <th className="py-6 px-4 font-black text-center bg-indigo-50 border-r border-gray-200">Facturado</th>
            <th className="py-6 px-4 font-black text-center bg-indigo-50/50">Pend. Facturar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {visibleRows.map((row, idx) => {
            const facturadoTotal = row.actas.reduce((a, b) => a + b.total, 0);
            const pendFacturar = row.v3.total - facturadoTotal;
            const isCollapsed = collapsedHeaders.has(row.item);
            
            return (
              <tr key={idx} className={cn("group hover:bg-gray-50/50 transition-all", row.isHeader ? "bg-blue-100/10" : "bg-white")}>
                <td className={cn("py-4 px-6 text-[10px] font-black text-center sticky left-0 z-10 border-r border-gray-100", row.isHeader ? "bg-blue-600 text-white" : "bg-white text-gray-700")}>
                  {row.item}
                </td>
                <td className={cn("py-4 px-6 text-[11px] font-bold sticky left-[80px] z-10 border-r border-gray-200 shadow-[4px_0_10px_rgba(0,0,0,0.02)]", row.isHeader ? "bg-blue-600 text-white uppercase" : "bg-white text-gray-700", row.isSubHeader && !row.isHeader ? "pl-12" : "")}>
                   <div className="flex items-center gap-2">
                    {row.isHeader && (
                      <button onClick={() => toggleHeader(row.item)}>
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                    {row.description}
                  </div>
                </td>
                <td className="py-4 px-4 text-[10px] font-mono font-bold text-gray-800 text-right bg-blue-50/10 border-r border-gray-100">{formatCurrency(row.initial.total)}</td>
                <td className="py-4 px-4 text-[11px] font-mono font-black text-right border-r border-gray-300 bg-blue-100/20 text-blue-900">{formatCurrency(row.v3.total)}</td>
                <td className="py-4 px-4 text-[10px] font-mono font-bold text-indigo-700 text-right bg-indigo-50/20 border-r border-gray-100">{formatCurrency(facturadoTotal)}</td>
                <td className={cn("py-4 px-4 text-[10px] font-mono font-black text-right", pendFacturar > 0 ? "text-amber-600" : "text-emerald-600")}>
                  {formatCurrency(pendFacturar)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="sticky bottom-0 z-20">
          <tr className="bg-blue-600 text-white font-display border-t-2 border-white/20">
            <td className="py-5 px-6 text-center font-black sticky left-0 bg-blue-600 z-10 border-r border-white/10">TOTAL</td>
            <td className="py-5 px-6 text-xs font-black uppercase tracking-[0.2em] sticky left-[80px] bg-blue-600 z-10 border-r border-white/10 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">INTERVENTORÍA {uf.id}</td>
            <td className="py-5 px-4 text-[11px] font-mono font-black text-right border-r border-white/5 bg-white/5">{formatCurrency(totals.initial)}</td>
            <td className="py-5 px-4 text-[12px] font-mono font-black text-right border-r border-white/10 bg-white/10">{formatCurrency(totals.v3)}</td>
            <td className="py-5 px-4 text-[11px] font-mono font-black text-right border-r border-white/5 bg-white/5">{formatCurrency(totals.facturado)}</td>
            <td className="py-5 px-4 text-[11px] font-mono font-black text-right bg-amber-400/20 text-amber-400">{formatCurrency(totals.v3 - totals.facturado)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  const renderDetailedTable = (type: "presupuesto" | "facturacion") => {
    let columns = type === "presupuesto" 
      ? ["P. Inicial", "P. Versión 1", "P. Versión 2", "P. Vigente (V3)"]
      : ["Acta 1", "Acta 2", "Acta 3", "Acumulado"];

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1240px]">
          <thead>
            <tr className="bg-[#f8fafc] text-[9px] uppercase tracking-widest text-slate-800 border-b border-gray-200">
              <th rowSpan={2} className="py-6 px-6 font-black w-[80px] text-center sticky left-0 bg-[#f8fafc] z-20 border-r border-gray-200 border-b">Item</th>
              <th rowSpan={2} className="py-6 px-6 font-black w-[350px] sticky left-[80px] bg-[#f8fafc] z-20 border-r border-gray-300 border-b">Descripción</th>
              <th rowSpan={2} className="py-6 px-6 font-black text-center border-r border-gray-200 border-b bg-gray-50/50">V. Unitario</th>
              {columns.map((col, i) => (
                <th key={i} colSpan={2} className={cn("py-4 px-4 font-black text-center border-r border-gray-200 border-b", i % 2 === 0 ? "bg-blue-50/30" : "bg-white")}>{col}</th>
              ))}
            </tr>
            <tr className="bg-[#f8fafc] text-[8px] uppercase tracking-[0.1em] text-slate-600 border-b border-gray-200">
              {columns.map((_, i) => (
                <React.Fragment key={i}>
                  <th className="py-2 px-4 font-bold text-center border-r border-gray-100">Cant.</th>
                  <th className="py-2 px-4 font-black text-center border-r border-gray-100">Total</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleRows.map((row, idx) => {
              const dataPoints = type === "presupuesto" 
                ? [row.initial, row.v1, row.v2, row.v3]
                : [...row.actas, { qty: row.actas.reduce((a, b) => a + b.qty, 0), total: row.actas.reduce((a, b) => a + b.total, 0) }];

              return (
                <tr key={idx} className={cn("group transition-all", row.isHeader ? "bg-blue-50/10" : "bg-white")}>
                  <td className={cn("py-3 px-6 text-[10px] font-black text-center sticky left-0 z-10 border-r border-gray-100", row.isHeader ? "bg-blue-600 text-white" : "bg-white text-gray-700")}>{row.item}</td>
                  <td className={cn("py-3 px-6 text-[11px] font-bold sticky left-[80px] z-10 border-r border-gray-300", row.isHeader ? "bg-blue-600 text-white uppercase" : "bg-white text-gray-700", row.isSubHeader && !row.isHeader ? "pl-10 text-blue-800" : "")}>{row.description}</td>
                  <td className="py-3 px-4 text-[10px] font-mono text-center border-r border-gray-100 text-slate-500">{!row.isHeader && formatCurrency(row.unitValue || 0)}</td>
                  {dataPoints.map((dp, i) => (
                    <React.Fragment key={i}>
                      <td className="py-3 px-4 text-[10px] font-mono text-right border-r border-gray-50 text-slate-600">{!row.isHeader && dp.qty.toLocaleString()}</td>
                      <td className="py-3 px-4 text-[10px] font-mono font-bold text-right border-r border-gray-100 text-blue-900">{formatCurrency(dp.total)}</td>
                    </React.Fragment>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot className="sticky bottom-0 z-20">
            <tr className="bg-blue-600 text-white border-t-2 border-white/20">
              <td className="py-4 px-6 text-center font-black sticky left-0 bg-blue-600 z-10 border-r border-white/10">TOTAL</td>
              <td className="py-4 px-6 text-[10px] font-black uppercase sticky left-[80px] bg-blue-600 z-10 border-r border-white/10">INTERVENTORÍA {uf.id}</td>
              <td className="py-4 px-4 bg-white/5 border-r border-white/5"></td>
              {type === "presupuesto" ? (
                [totals.initial, totals.v1, totals.v2, totals.v3].map((val, i) => (
                  <React.Fragment key={i}>
                    <td className="bg-white/5 border-r border-white/5"></td>
                    <td className="py-4 px-4 text-[10px] font-mono font-black text-right border-r border-white/10">{formatCurrency(val)}</td>
                  </React.Fragment>
                ))
              ) : (
                [...totals.actas, totals.facturado].map((val, i) => (
                  <React.Fragment key={i}>
                    <td className="bg-white/5 border-r border-white/5"></td>
                    <td className="py-4 px-4 text-[10px] font-mono font-black text-right border-r border-white/10">{formatCurrency(val)}</td>
                  </React.Fragment>
                ))
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700" ref={tableRef}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-display font-black text-blue-900">Análisis Interventoría <span className="text-gray-400 font-medium">| {uf.id}</span></h2>
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 no-print">
          {(["control", "presupuesto", "facturacion"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all", activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-blue-600")}>
              {tab === "control" ? "Matriz Control" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="premium-card p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 border-b border-gray-100 bg-white flex justify-between items-center">
          <h3 className="text-xl font-display font-bold text-gray-800">
            {activeTab === "control" && "Matriz de Control Interventoría"}
            {activeTab === "presupuesto" && "Detalle de Versiones Presupuestales"}
            {activeTab === "facturacion" && "Actas y Facturación Interventoría"}
          </h3>
          <div className="flex items-center gap-2 no-print text-gray-300">
            <button onClick={expandAll} className="p-1 hover:bg-gray-50 rounded"><ChevronDown size={20} /></button>
            <button onClick={collapseAll} className="p-1 hover:bg-gray-50 rounded"><ChevronRight size={20} /></button>
          </div>
        </div>
        {activeTab === "control" && renderControlTable()}
        {activeTab !== "control" && renderDetailedTable(activeTab)}
      </div>

      <div className="flex justify-center gap-4 no-print">
         <button onClick={expandAll} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-display font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
          <ChevronDown size={18} /> Desplegar Todo
        </button>
        <button onClick={collapseAll} className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-display font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-gray-50 transition-all flex items-center gap-3">
          <ChevronRight size={18} /> Contraer Todo
        </button>
      </div>

      <div className="flex justify-end gap-3 no-print">
        <button onClick={handleExportExcel} className="p-3 text-emerald-600 bg-white border border-emerald-100 rounded-2xl hover:bg-emerald-50 transition-all shadow-sm">
          <FileSpreadsheet size={24} />
        </button>
        <button onClick={() => exportAsImage(tableRef, `Interventoria_${uf.id}`)} className="p-3 text-blue-600 bg-white border border-blue-100 rounded-2xl hover:bg-blue-50 transition-all shadow-sm">
          <Download size={24} />
        </button>
      </div>
    </div>
  );
};
