import React, { useState } from "react";
import { formatCurrency, formatPercentage, cn } from "../lib/utils";
import { DollarSign, Download, FileSpreadsheet, Eye, EyeOff, ShieldCheck, FileCheck, Search, Info } from "lucide-react";

interface BudgetChapter {
  item: string;
  description: string;
  isHeader?: boolean;
  isSubHeader?: boolean;
  initial: number;
  v1: number;
  v2: number;
  v3: number;
  facturado: number;
  ejecutado: number;
}

interface BudgetAnalysisTableProps {
  uf: any;
}

export const BudgetAnalysisTable: React.FC<BudgetAnalysisTableProps> = ({ uf }) => {
  const [showAllVersions, setShowAllVersions] = useState(false);

  // Mock data for the table based on Image 2
  const budgetData: BudgetChapter[] = [
    { item: "1", description: "PRELIMINARES", isHeader: true, initial: 1200000000, v1: 1200000000, v2: 1250000000, v3: 1300000000, facturado: 1200000000, ejecutado: 1250000000 },
    { item: "1.1", description: "CARRETEABLE DE ACCESO SEGMENTO 1 - A UN ANCHO DE 4M", isSubHeader: true, initial: 500000000, v1: 500000000, v2: 500000000, v3: 500000000, facturado: 450000000, ejecutado: 480000000 },
    { item: "2", description: "MOVIMIENTO DE TIERRA Y MEJORAMIENTO DE SUBRASANTE", isHeader: true, initial: 15400000000, v1: 15400000000, v2: 16000000000, v3: 16500000000, facturado: 8500000000, ejecutado: 9200000000 },
    { item: "2.1", description: "MOVIMIENTO DE TIERRA", isSubHeader: true, initial: 10000000000, v1: 10000000000, v2: 10500000000, v3: 11000000000, facturado: 5000000000, ejecutado: 6000000000 },
    { item: "2.2", description: "MEJORAMIENTO DE SUBRASANTE", isSubHeader: true, initial: 5400000000, v1: 5400000000, v2: 5500000000, v3: 5500000000, facturado: 3500000000, ejecutado: 3200000000 },
    { item: "3", description: "PAVIMENTOS", isHeader: true, initial: 12000000000, v1: 12000000000, v2: 12000000000, v3: 12200000000, facturado: 0, ejecutado: 0 },
    { item: "3.1", description: "PAVIMENTOS CORREDOR", isSubHeader: true, initial: 12000000000, v1: 12000000000, v2: 12000000000, v3: 12200000000, facturado: 0, ejecutado: 0 },
    { item: "4", description: "ESPACIO PÚBLICO", isHeader: true, initial: 8500000000, v1: 8500000000, v2: 8700000000, v3: 9000000000, facturado: 0, ejecutado: 0 },
    { item: "4.1", description: "ANDENES", isSubHeader: true, initial: 3000000000, v1: 3000000000, v2: 3100000000, v3: 3200000000, facturado: 0, ejecutado: 0 },
    { item: "4.2", description: "CICLORUTA", isSubHeader: true, initial: 2500000000, v1: 2500000000, v2: 2600000000, v3: 2800000000, facturado: 0, ejecutado: 0 },
    { item: "4.3", description: "MOBILIARIO URBANO", isSubHeader: true, initial: 1500000000, v1: 1500000000, v2: 1500000000, v3: 1500000000, facturado: 0, ejecutado: 0 },
    { item: "4.4", description: "VEGETACION E IMPLEMENTACION PAISAJISTICA", isSubHeader: true, initial: 1500000000, v1: 1500000000, v2: 1500000000, v3: 1500000000, facturado: 0, ejecutado: 0 },
    { item: "5", description: "ESTRUCTURAS", isHeader: true, initial: 25000000000, v1: 25000000000, v2: 26500000000, v3: 28000000000, facturado: 5000000000, ejecutado: 6000000000 },
    { item: "5.1", description: "DRENAJE", isSubHeader: true, initial: 4000000000, v1: 4000000000, v2: 4200000000, v3: 4500000000, facturado: 1000000000, ejecutado: 1200000000 },
    { item: "5.2", description: "PILOTES", isSubHeader: true, initial: 8000000000, v1: 8000000000, v2: 8500000000, v3: 9000000000, facturado: 2000000000, ejecutado: 2500000000 },
    { item: "5.3", description: "CONCRETOS", isSubHeader: true, initial: 13000000000, v1: 13000000000, v2: 13800000000, v3: 14500000000, facturado: 2000000000, ejecutado: 2300000000 },
    { item: "6", description: "SEÑALIZACIÓN, DEMARCACIÓN Y SEMAFORIZACIÓN", isHeader: true, initial: 1500000000, v1: 1500000000, v2: 1500000000, v3: 1600000000, facturado: 0, ejecutado: 0 },
    { item: "7", description: "REDES HUMEDAS", isHeader: true, initial: 6200000000, v1: 6200000000, v2: 6500000000, v3: 6800000000, facturado: 1200000000, ejecutado: 1500000000 },
    { item: "8", description: "REDES SECAS", isHeader: true, initial: 2500000000, v1: 2500000000, v2: 2700000000, v3: 2900000000, facturado: 500000000, ejecutado: 600000000 },
  ];

  const totalBudget = uf.constructorContract.value;
  const totalExecuted = uf.constructorContract.executed;
  const totalInvoiced = uf.constructorContract.invoiced;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Cards Header - Similar to Image 1 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <h2 className="text-2xl font-display font-black text-violeta-dark">
          Dashboard de Análisis Presupuestal <span className="text-gray-400 font-medium">| {uf.id}</span>
        </h2>
        <div className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 italic">
          {uf.contractor}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex flex-col items-center justify-center text-center group hover:bg-violeta-dark transition-all duration-300">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 group-hover:text-blue-200">VALOR DEL CONTRATO</span>
          <p className="text-2xl font-display font-black text-violeta-dark group-hover:text-white">
            {formatCurrency(totalBudget)}
          </p>
          <div className="w-12 h-1 bg-blue-100 rounded-full mt-4 group-hover:bg-blue-400 transition-colors" />
        </div>

        <div className="premium-card p-6 flex flex-col items-center justify-center text-center group hover:bg-rio-verde transition-all duration-300">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 group-hover:text-green-100">EJECUTADO ACUMULADO</span>
          <p className="text-2xl font-display font-black text-emerald-600 group-hover:text-white">
            {formatCurrency(totalExecuted)}
          </p>
          <div className="w-12 h-1 bg-emerald-100 rounded-full mt-4 group-hover:bg-green-300 transition-colors" />
        </div>

        <div className="premium-card p-6 flex flex-col items-center justify-center text-center group hover:bg-torca-azul transition-all duration-300">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 group-hover:text-blue-100">FACTURADO ACUMULADO</span>
          <p className="text-2xl font-display font-black text-blue-600 group-hover:text-white">
            {formatCurrency(totalInvoiced)}
          </p>
          <div className="w-12 h-1 bg-blue-100 rounded-full mt-4 group-hover:bg-blue-300 transition-colors" />
        </div>
      </div>

      {/* Detailed Table Component - Similar to Image 2 enhanced */}
      <div className="premium-card p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 border-b border-gray-100 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-xl font-display font-bold text-violeta-dark">Matriz de Control de Presupuesto Detallado</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">Seguimiento por Capítulos, Versiones y Ejecución</p>
            </div>
            <button 
              onClick={() => setShowAllVersions(!showAllVersions)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ml-4",
                showAllVersions ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              )}
            >
              {showAllVersions ? <EyeOff size={14} /> : <Eye size={14} />}
              {showAllVersions ? "Ocultar Versiones Anteriores" : "Ver Todas las Versiones"}
            </button>
          </div>
          <div className="flex gap-3">
             <button className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-50 text-emerald-600 transition-all text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                <FileSpreadsheet size={16} />
                Excel
             </button>
             <button className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-50 text-blue-600 transition-all text-[10px] font-black uppercase tracking-widest border border-blue-100">
                <Download size={16} />
                Imagen
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[9px] uppercase tracking-widest text-slate-800 border-b border-gray-200">
                <th className="py-6 px-6 font-black w-[80px] text-center sticky left-0 bg-[#f8fafc] z-10 border-r border-gray-200">Item</th>
                <th className="py-6 px-6 font-black w-[400px] sticky left-[80px] bg-[#f8fafc] z-10 border-r border-gray-200 shadow-[4px_0_10px_rgba(0,0,0,0.02)]">Descripción / Capítulo</th>
                
                {/* Budget Column Group */}
                <th className="py-6 px-4 font-black text-center bg-blue-50/30 border-r border-gray-200">P. Inicial</th>
                {showAllVersions && (
                  <>
                    <th className="py-6 px-4 font-black text-center bg-blue-50/50 border-r border-gray-200">P. Versión 1</th>
                    <th className="py-6 px-4 font-black text-center bg-blue-50/70 border-r border-gray-200">P. Versión 2</th>
                  </>
                )}
                <th className="py-6 px-4 font-black text-center bg-blue-100/50 border-r border-gray-400">P. Vigente (V3)</th>
                
                {/* Billing Columns */}
                <th className="py-6 px-4 font-black text-center bg-indigo-50 border-r border-gray-200">Facturado</th>
                <th className="py-6 px-4 font-black text-center bg-indigo-50/50 border-r border-gray-400">Pend. Facturar</th>
                
                {/* Execution Columns */}
                <th className="py-6 px-4 font-black text-center bg-emerald-50 border-r border-gray-200">Ejecutado</th>
                <th className="py-6 px-4 font-black text-center bg-emerald-50/50">Pend. Ejecutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {budgetData.map((row, idx) => {
                const pendFacturar = row.v3 - row.facturado;
                const pendEjecutar = row.v3 - row.ejecutado;
                
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
                      {row.description}
                    </td>
                    
                    {/* Budget Values */}
                    <td className="py-4 px-4 text-[10px] font-mono font-bold text-gray-800 text-right bg-blue-50/10 border-r border-gray-100">{formatCurrency(row.initial)}</td>
                    {showAllVersions && (
                      <>
                        <td className="py-4 px-4 text-[10px] font-mono font-bold text-gray-600 text-right bg-blue-50/20 border-r border-gray-100">{formatCurrency(row.v1)}</td>
                        <td className="py-4 px-4 text-[10px] font-mono font-bold text-gray-600 text-right bg-blue-50/30 border-r border-gray-100">{formatCurrency(row.v2)}</td>
                      </>
                    )}
                    <td className={cn(
                      "py-4 px-4 text-[11px] font-mono font-black text-right border-r border-gray-300",
                      row.isHeader ? "text-violeta-dark bg-blue-100/30" : "text-blue-900 bg-blue-100/10"
                    )}>
                      {formatCurrency(row.v3)}
                    </td>
                    
                    {/* Billing Values */}
                    <td className="py-4 px-4 text-[10px] font-mono font-bold text-indigo-700 text-right bg-indigo-50/20 border-r border-gray-100">{formatCurrency(row.facturado)}</td>
                    <td className={cn(
                      "py-4 px-4 text-[10px] font-mono font-black text-right border-r border-gray-300",
                      pendFacturar > 0 ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {formatCurrency(pendFacturar)}
                    </td>
                    
                    {/* Execution Values */}
                    <td className="py-4 px-4 text-[10px] font-mono font-bold text-emerald-700 text-right bg-emerald-50/20 border-r border-gray-100">{formatCurrency(row.ejecutado)}</td>
                    <td className={cn(
                      "py-4 px-4 text-[11px] font-mono font-black text-right",
                      pendEjecutar > 0 ? "text-red-500" : "text-emerald-600"
                    )}>
                      {formatCurrency(pendEjecutar)}
                    </td>
                  </tr>
                );
              })}
              
              {/* Grand Total Row */}
              <tr className="bg-violeta-dark text-white font-display">
                 <td className="py-6 px-6 text-center rounded-l-2xl border-r border-white/10 italic font-black">TOTAL</td>
                 <td className="py-6 px-6 text-sm font-black uppercase tracking-[0.2em] sticky left-[80px] bg-violeta-dark z-10 border-r border-white/10 italic">
                   Consolidado {uf.id}
                 </td>
                 <td className="py-6 px-4 text-xs font-mono font-black text-right bg-white/5 border-r border-white/5">{formatCurrency(totalBudget * 0.9)}</td>
                 {showAllVersions && (
                   <>
                     <td className="py-6 px-4 text-xs font-mono font-black text-right bg-white/5 border-r border-white/5">{formatCurrency(totalBudget * 0.95)}</td>
                     <td className="py-6 px-4 text-xs font-mono font-black text-right bg-white/5 border-r border-white/5">{formatCurrency(totalBudget * 0.98)}</td>
                   </>
                 )}
                 <td className="py-6 px-4 text-sm font-mono font-black text-right bg-white/10 border-r border-white/20 text-torca-azul">{formatCurrency(totalBudget)}</td>
                 
                 <td className="py-6 px-4 text-xs font-mono font-black text-right bg-white/5 border-r border-white/5">{formatCurrency(totalInvoiced)}</td>
                 <td className="py-6 px-4 text-xs font-mono font-black text-right bg-white/5 border-r border-white/20 text-amber-400">{formatCurrency(totalBudget - totalInvoiced)}</td>
                 
                 <td className="py-6 px-4 text-xs font-mono font-black text-right bg-white/5 border-r border-white/5">{formatCurrency(totalExecuted)}</td>
                 <td className="py-6 px-4 text-sm font-mono font-black text-right rounded-r-2xl text-rio-verde">{formatCurrency(totalBudget - totalExecuted)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gestión de APUs y NPs - New Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-0 overflow-hidden border-none shadow-xl">
          <div className="p-6 border-b border-gray-100 bg-white">
            <h3 className="text-lg font-display font-bold text-violeta-dark flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <ShieldCheck size={18} />
              </div>
              Gestión de APUs / NPs
            </h3>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Estado de aprobación y trámites técnicos</p>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: "Aprobados por FLT", count: 142, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "En Revisión Interventoría", count: 28, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "En Elaboración Constructor", count: 15, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Aprobados Socios", count: 112, color: "text-indigo-600", bg: "bg-indigo-50" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={cn("w-2 h-10 rounded-full", item.bg.replace('/10', ''))} />
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{item.label}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Procedimientos actuales</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={cn("text-xl font-display font-black", item.color)}>{item.count}</span>
                  <div className="w-10 h-0.5 bg-gray-100 rounded-full group-hover:w-16 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interventoría Billing Tracking */}
        <div className="premium-card p-0 overflow-hidden border-none shadow-xl">
          <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center">
            <div>
              <h3 className="text-lg font-display font-bold text-violeta-dark flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <FileCheck size={18} />
                </div>
                Facturación Interventoría
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Versiones vs. Facturado Real</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[9px] uppercase tracking-widest text-gray-500 border-b border-gray-100">
                  <th className="py-4 px-6 font-black">Actividad</th>
                  <th className="py-4 px-4 font-black text-right">Presupuestado</th>
                  <th className="py-4 px-4 font-black text-right">Facturado</th>
                  <th className="py-4 px-4 font-black text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                {[
                  { act: "Personal Especialista", budget: 450000000, invoiced: 380000000, status: "V3 Aprobado" },
                  { act: "Administración Sede", budget: 120000000, invoiced: 120000000, status: "V2 Aprobado" },
                  { act: "Ensayos de Laboratorio", budget: 85000000, invoiced: 45000000, status: "V3 Aprobado" },
                  { act: "Transporte y Equipos", budget: 156000000, invoiced: 98000000, status: "V1 Aprobado" },
                ].map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 group transition-all">
                    <td className="py-4 px-6 font-bold text-gray-700">{item.act}</td>
                    <td className="py-4 px-4 font-mono font-bold text-right text-gray-500">{formatCurrency(item.budget)}</td>
                    <td className="py-4 px-4 font-mono font-black text-right text-blue-600">{formatCurrency(item.invoiced)}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-black text-[8px] uppercase ring-1 ring-blue-100">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50/50 font-black">
                  <td className="py-4 px-6 uppercase italic">Total Interventoría</td>
                  <td className="py-4 px-4 text-right text-gray-600">{formatCurrency(811000000)}</td>
                  <td className="py-4 px-4 text-right text-blue-700">{formatCurrency(643000000)}</td>
                  <td className="py-4 px-4 text-center text-blue-700 tracking-tighter italic uppercase text-[8px]">{formatPercentage(79.2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
