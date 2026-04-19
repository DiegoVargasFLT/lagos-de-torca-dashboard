import React, { useState } from "react";
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Activity, AlertCircle,
  AlertTriangle, CheckCircle2, Clock, ChevronRight, Camera, Video,
  FileText, BarChart2, LayoutDashboard, CalendarDays, Wallet,
  ShieldAlert, ShieldCheck, Globe, ExternalLink, Flag, Target, ArrowRight
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { globalStats, ufData } from "../../data/mockData";
import { formatCurrency, formatPercentage, cn } from "../../lib/utils";
import { Card } from "../Card";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Legend,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from 'html-to-image';
import { Download } from "lucide-react";
import { DetailedFinancialTable } from "../DetailedFinancialTable";

export const ExecutiveSummary: React.FC = () => {
  const { selectedUFIds, setSelectedUFIds, filteredUFData, isConsolidated } = useDashboard();
  const [activeTab, setActiveTab] = useState<"financiero" | "curva" | "cronograma" | "facturacion" | "alertas">("financiero");
  const contractRef = React.useRef<HTMLDivElement>(null);

  const exportAsImage = async (ref: React.RefObject<HTMLDivElement | null>, title: string) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `${title}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al exportar imagen:', err);
    }
  };

  const selectedUF = selectedUFIds.length === 1 ? filteredUFData[0] : null;

  // --- CÁLCULOS SEGUROS CON ENCADENAMIENTO OPCIONAL ---
  
  const stats = isConsolidated ? {
    totalContractual: filteredUFData.reduce((acc, uf) => acc + (uf?.constructorContract?.value || 0) + (uf?.interventoriaContract?.value || 0), 0),
    totalExecuted: filteredUFData.reduce((acc, uf) => acc + (uf?.constructorContract?.executed || 0) + (uf?.interventoriaContract?.executed || 0), 0),
    globalExecution: filteredUFData.length > 0 ? (filteredUFData.reduce((acc, uf) => acc + (uf?.financialProgress || 0), 0) / filteredUFData.length) : 0,
    activeUFs: filteredUFData.length,
    totalUFs: ufData.length
  } : null;

  const billingStats = React.useMemo(() => {
    if (selectedUF) return {
      girado: selectedUF.anticipoGirado || 0,
      amortizado: selectedUF.anticipoAmortizado || 0,
      pendAmortizar: (selectedUF.anticipoGirado || 0) - (selectedUF.anticipoAmortizado || 0)
    };
    return {
      girado: filteredUFData.reduce((acc, uf) => acc + (uf.anticipoGirado || 0), 0),
      amortizado: filteredUFData.reduce((acc, uf) => acc + (uf.anticipoAmortizado || 0), 0),
      pendAmortizar: filteredUFData.reduce((acc, uf) => acc + ((uf.anticipoGirado || 0) - (uf.anticipoAmortizado || 0)), 0)
    };
  }, [selectedUF, filteredUFData]);

  // ... (El resto del componente sigue igual en estructura, pero asegúrate de que las llamadas sean seguras)
  
  // Ejemplo de corrección dentro del render:
  // Cambia: {selectedUF.constructorContract.value}
  // Por: {selectedUF?.constructorContract?.value || 0}