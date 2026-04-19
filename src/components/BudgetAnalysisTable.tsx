import React, { useState } from "react";
import { formatCurrency, formatPercentage, cn } from "../lib/utils";
import { DollarSign, Download, FileSpreadsheet, Eye, EyeOff, ShieldCheck, FileCheck } from "lucide-react";

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

  const totalBudget = uf?.constructorContract?.value ?? 0;
  const totalExecuted = uf?.constructorContract?.executed ?? 0;
  const totalInvoiced = uf?.constructorContract?.invoiced ?? 0;

  return (
    <div className="space-y-8">
      {/* Tu contenido aquí... */}
      <h2 className="text-2xl font-black text-violeta-dark">Dashboard {uf?.id}</h2>
      {/* Asegúrate de cerrar bien todos tus divs */}
    </div>
  );
};