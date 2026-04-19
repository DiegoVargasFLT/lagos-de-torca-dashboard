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
import { motion } from "motion/react";

export const ExecutiveSummary: React.FC = () => {
  const { selectedUFIds, filteredUFData, isConsolidated } = useDashboard();
  
  // Cálculo seguro de stats
  const stats = useMemo(() => {
    const data = filteredUFData || [];
    const totalContractual = data.reduce((acc, uf) => 
      acc + (uf?.constructorContract?.value ?? 0) + (uf?.interventoriaContract?.value ?? 0), 0);
    const totalExecuted = data.reduce((acc, uf) => 
      acc + (uf?.constructorContract?.executed ?? 0) + (uf?.interventoriaContract?.executed ?? 0), 0);
    const globalExecution = data.length > 0 
      ? (data.reduce((acc, uf) => acc + (uf?.financialProgress ?? 0), 0) / data.length) 
      : 0;

    return { totalContractual, totalExecuted, globalExecution };
  }, [filteredUFData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-violet-50 to-white">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Valor Total Contratado</p>
          <p className="text-2xl font-black text-violeta-dark">{formatCurrency(stats.totalContractual ?? 0)}</p>
        </Card>
        
        <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Total Ejecutado</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(stats.totalExecuted ?? 0)}</p>
        </Card>

        <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-blue-50 to-white">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Avance Global</p>
          <p className="text-2xl font-black text-blue-600">{formatPercentage(stats.globalExecution ?? 0)}</p>
        </Card>
      </div>
    </div>
  );
};