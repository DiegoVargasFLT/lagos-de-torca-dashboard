import React, { useState, useMemo } from "react";
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Activity, AlertCircle,
  AlertTriangle, CheckCircle2, Clock, ChevronRight, Camera, Video,
  FileText, BarChart2, LayoutDashboard, CalendarDays, Wallet,
  ShieldAlert, ShieldCheck, Globe, ExternalLink, Flag, Target, ArrowRight
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { ufData } from "../../data/mockData";
import { formatCurrency, formatPercentage, cn } from "../../lib/utils";
import { Card } from "../Card";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Legend,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from 'html-to-image';
import { Download } from "lucide-react";

export const ExecutiveSummary: React.FC = () => {
  const { selectedUFIds, filteredUFData, isConsolidated } = useDashboard();
  const [activeTab, setActiveTab] = useState<"financiero" | "curva" | "cronograma" | "facturacion" | "alertas">("financiero");

  // Obtener la UF seleccionada de forma segura
  const selectedUF = useMemo(() => {
    return (selectedUFIds.length === 1 && filteredUFData.length > 0) 
      ? filteredUFData.find(uf => uf.id === selectedUFIds[0]) || null 
      : null;
  }, [selectedUFIds, filteredUFData]);

  // --- CÁLCULOS SEGUROS ---
  
  const stats = useMemo(() => {
    if (isConsolidated) {
      return {
        totalContractual: (filteredUFData || []).reduce((acc, uf) => 
          acc + (uf?.constructorContract?.value ?? 0) + (uf?.interventoriaContract?.value ?? 0), 0),
        totalExecuted: (filteredUFData || []).reduce((acc, uf) => 
          acc + (uf?.constructorContract?.executed ?? 0) + (uf?.interventoriaContract?.executed ?? 0), 0),
        globalExecution: filteredUFData.length > 0 
          ? (filteredUFData.reduce((acc, uf) => acc + (uf?.financialProgress ?? 0), 0) / filteredUFData.length) 
          : 0,
        activeUFs: filteredUFData.length
      };
    }
    return {
      totalContractual: (selectedUF?.constructorContract?.value ?? 0) + (selectedUF?.interventoriaContract?.value ?? 0),
      totalExecuted: (selectedUF?.constructorContract?.executed ?? 0) + (selectedUF?.interventoriaContract?.executed ?? 0),
      globalExecution: selectedUF?.financialProgress ?? 0,
      activeUFs: 1
    };
  }, [isConsolidated, filteredUFData, selectedUF]);

  const billingStats = useMemo(() => {
    const data = selectedUF ? [selectedUF] : (filteredUFData || []);
    return {
      girado: data.reduce((acc, uf) => acc + (uf?.anticipoGirado ?? 0), 0),
      amortizado: data.reduce((acc, uf) => acc + (uf?.anticipoAmortizado ?? 0), 0),
      pendAmortizar: data.reduce((acc, uf) => acc + ((uf?.anticipoGirado ?? 0) - (uf?.anticipoAmortizado ?? 0)), 0)
    };
  }, [selectedUF, filteredUFData]);

  return (
    <div className="space-y-6">
      {/* HEADER DE RESUMEN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-violeta-dark">
            {isConsolidated ? "Resumen Ejecutivo Consolidado" : `Resumen: ${selectedUF?.id ?? "UF"}`}
          </h2>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
            {isConsolidated ? "Vista global de todas las unidades funcionales" : `Detalle técnico y financiero de ${selectedUF?.contractor ?? "la unidad"}`}
          </p>
        </div>
      </div>

      {/* CARDS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-violet-50 to-white">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Valor Total Contratado</p>
          <p className="text-2xl font-black text-violeta-dark">{formatCurrency(stats.totalContractual)}</p>
        </Card>
        
        <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Total Ejecutado</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(stats.totalExecuted)}</p>
        </Card>

        <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-blue-50 to-white">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Avance Global</p>
          <p className="text-2xl font-black text-blue-600">{formatPercentage(stats.globalExecution)}</p>
        </Card>
      </div>

      {/* Aquí iría el resto de tu contenido, usando siempre la estructura: 
          {selectedUF?.propiedad?.subpropiedad ?? valor_por_defecto}
      */}
    </div>
  );
};