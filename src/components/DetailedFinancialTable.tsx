import React, { useRef, useCallback, useState } from "react";
import { ufData } from "../data/mockData";
import { formatCurrency, formatPercentage, cn, formatDateProject } from "../lib/utils";
import { Card } from "./Card";
import { TrendingUp, TrendingDown, Minus, Download, FileJson, Image as ImageIcon, ChevronDown, ChevronRight } from "lucide-react";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";

const ProgressIcon = ({ value }: { value: number }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-bold">{formatPercentage(value)}</span>
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            value > 90 ? "bg-emerald-500" : value > 50 ? "bg-torca-azul" : "bg-amber-500"
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
};

const DifferenceCell = ({ progress, programmed }: { progress: number, programmed: number }) => {
  const diff = progress - programmed;
  let Icon = TrendingUp;

  if (diff < -3) {
    Icon = TrendingDown;
  } else if (diff < 0) {
    Icon = Minus;
  }

  return (
    <div className={cn("flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg font-bold shadow-sm", 
      diff < -3 ? "bg-red-100 text-red-800" : diff < 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
    )}>
      <Icon size={13} strokeWidth={3} />
      <span className="text-[11px]">{formatPercentage(diff)}</span>
    </div>
  );
};

interface RowProps {
  key?: React.Key;
  label: string;
  values: (string | number | React.ReactNode)[];
  isHeader?: boolean;
  isSubHeader?: boolean;
  className?: string;
  onToggle?: () => void;
  isCollapsed?: boolean;
}

const Row = ({ label, values, isHeader = false, isSubHeader = false, className = "", onToggle, isCollapsed }: RowProps) => (
  <tr className={cn(
    "border-b border-gray-300 transition-all group",
    isHeader ? "bg-azul-oceano text-white font-bold" : "",
    isSubHeader ? "bg-gray-100 text-black font-black border-l-8 border-l-torca-azul cursor-pointer hover:bg-gray-200" : "",
    className
  )}
  onClick={isSubHeader ? onToggle : undefined}
  >
    <td 
      colSpan={isSubHeader ? values.length + 1 : 1}
      className={cn(
        "py-2 px-3.5 text-[11px] transition-colors",
        isSubHeader ? "sticky left-0 z-10 bg-inherit" : "sticky left-0 z-10 bg-white font-bold text-black border-r border-gray-400 min-w-[200px] shadow-[4px_0_10px_rgba(0,0,0,0.05)]",
        isHeader ? "bg-azul-oceano shadow-none border-r-azul-oceano/20 text-white" : ""
      )}
    >
      <span className={cn(
        "flex items-center gap-2",
        isSubHeader ? "pl-2 uppercase tracking-[0.2em] text-[12px] font-black" : ""
      )}>
        {isSubHeader && (
          <span className="text-torca-azul">
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </span>
        )}
        {label}
      </span>
    </td>
    {!isSubHeader && values.map((val, i) => (
      <td key={i} className={cn(
        "py-2 px-3.5 text-[11px] text-center min-w-[120px] font-bold border-r border-gray-300",
        isHeader ? "text-white" : "text-black"
      )}>
        {val}
      </td>
    ))}
  </tr>
);

export const DetailedFinancialTable: React.FC = () => {
  const ufs = ufData;
  const tableRef = useRef<HTMLDivElement>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (label: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(label)) {
      newCollapsed.delete(label);
    } else {
      newCollapsed.add(label);
    }
    setCollapsedSections(newCollapsed);
  };

  const expandAll = () => setCollapsedSections(new Set());
  const collapseAll = () => {
    setCollapsedSections(new Set([
      "Cronograma del Proyecto",
      "Valor del Contrato",
      "Desempeño Financiero",
      "Gestión de Facturación",
      "Seguimiento de Control",
      "Facturación Realizada"
    ]));
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Matriz de Control");

    // Define colors
    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };
    const subheaderFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    const whiteFont: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFFFF' }, bold: true };
    const blackFont: Partial<ExcelJS.Font> = { color: { argb: 'FF000000' }, bold: true };
    const normalFont: Partial<ExcelJS.Font> = { color: { argb: 'FF000000' } };

    // Structure defining rows, values, and styles
    interface ExportRow {
      label: string;
      values: (string | number)[];
      type: 'header' | 'subheader' | 'data';
      format?: string;
    }

    const rows: ExportRow[] = [
      { label: "UNIDAD FUNCIONAL", values: ufs.map(uf => uf.id), type: 'header' },
      { label: "CONSTRUCTOR (RAZÓN SOCIAL)", values: ufs.map(uf => uf.contractor), type: 'header' },
      
      { label: "Cronograma del Proyecto", values: ufs.map(() => ""), type: 'subheader' },
      { label: "Inicio", values: ufs.map(uf => formatDateProject(uf.startDate)), type: 'data' },
      { label: "Inicio Preconstrucción", values: ufs.map(uf => formatDateProject(uf.preconstructionStart)), type: 'data' },
      { label: "Fin Preconstrucción", values: ufs.map(uf => formatDateProject(uf.preconstructionEnd)), type: 'data' },
      { label: "Inicio Construcción", values: ufs.map(uf => formatDateProject(uf.constructionStart)), type: 'data' },
      { label: "Fin Construcción", values: ufs.map(uf => formatDateProject(uf.constructionEnd)), type: 'data' },
      
      { label: "Valor del Contrato", values: ufs.map(() => ""), type: 'subheader' },
      { label: "$ Inversión Inicial", values: ufs.map(uf => uf.constructorContract.value * 0.8), type: 'data', format: '"$"#,##0' },
      { label: "$ Adiciones de Obra", values: ufs.map(uf => uf.constructorContract.value * 0.2), type: 'data', format: '"$"#,##0' },
      { label: "$ Valor Final", values: ufs.map(uf => uf.constructorContract.value), type: 'data', format: '"$"#,##0' },
      
      { label: "Desempeño Financiero", values: ufs.map(() => ""), type: 'subheader' },
      { label: "$ Programado Acum.", values: ufs.map(uf => (uf.financialProgrammed / 100) * uf.constructorContract.value), type: 'data', format: '"$"#,##0' },
      { label: "$ Ejecutado Real", values: ufs.map(uf => uf.constructorContract.executed), type: 'data', format: '"$"#,##0' },
      { label: "% Programado", values: ufs.map(uf => uf.financialProgrammed / 100), type: 'data', format: '0.0%' },
      { label: "% Ejecutado", values: ufs.map(uf => uf.financialProgress / 100), type: 'data', format: '0.0%' },
      
      { label: "Gestión de Facturación", values: ufs.map(() => ""), type: 'subheader' },
      { label: "$ Facturado", values: ufs.map(uf => uf.constructorContract.invoiced), type: 'data', format: '"$"#,##0' },
      { label: "% Facturación", values: ufs.map(uf => (uf.constructorContract.invoiced / uf.constructorContract.value)), type: 'data', format: '0.0%' },
      { label: "$ Por Facturar", values: ufs.map(uf => uf.constructorContract.executed - uf.constructorContract.invoiced), type: 'data', format: '"$"#,##0' },
      
      { label: "INTERVENTORÍA (RAZÓN SOCIAL)", values: ufs.map(uf => uf.interventoria), type: 'header' },
      { label: "Seguimiento de Control", values: ufs.map(() => ""), type: 'subheader' },
      { label: "$ Valor Contractual", values: ufs.map(uf => uf.interventoriaContract.value), type: 'data', format: '"$"#,##0' },
      { label: "$ Ejecución Financiera", values: ufs.map(uf => uf.interventoriaContract.executed), type: 'data', format: '"$"#,##0' },
      { label: "Facturación Realizada", values: ufs.map(() => ""), type: 'subheader' },
      { label: "$ Facturado a la fecha", values: ufs.map(uf => uf.interventoriaContract.invoiced), type: 'data', format: '"$"#,##0' },
      { label: "% Avance Facturación", values: ufs.map(uf => (uf.interventoriaContract.invoiced / uf.interventoriaContract.value)), type: 'data', format: '0.0%' },
    ];

    rows.forEach((rowData) => {
      const row = worksheet.addRow([rowData.label, ...rowData.values]);
      
      // Styling
      if (rowData.type === 'header') {
        row.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = whiteFont;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } } };
        });
        row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (rowData.type === 'subheader') {
        row.eachCell((cell) => {
          cell.fill = subheaderFill;
          cell.font = blackFont;
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        });
        // Merge subheader row cells for better look
        worksheet.mergeCells(row.number, 1, row.number, ufs.length + 1);
      } else {
        row.eachCell((cell, colNumber) => {
          cell.font = colNumber === 1 ? blackFont : normalFont;
          cell.alignment = colNumber === 1 ? { horizontal: 'left' } : { horizontal: 'center' };
          if (colNumber > 1 && rowData.format) {
            cell.numFmt = rowData.format;
          }
          cell.border = { 
            bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
            right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
          };
        });
      }
    });

    // Auto-width adjustment
    worksheet.columns.forEach((column, i) => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(30, maxLength + 5);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Matriz_Control_Contractual_Financiero.xlsx");
  };

  const exportToImage = useCallback(() => {
    if (tableRef.current === null) return;

    toPng(tableRef.current, { cacheBust: true, backgroundColor: '#fff' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'Matriz_Control_Financial.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error al exportar imagen:', err);
      });
  }, [tableRef]);

  const renderSection = (title: string, contentRows: { label: string, values: (string | number | React.ReactNode)[], className?: string }[]) => {
    const isCollapsed = collapsedSections.has(title);
    return (
      <>
        <Row 
          label={title} 
          values={ufs.map(() => "")} 
          isSubHeader 
          onToggle={() => toggleSection(title)}
          isCollapsed={isCollapsed}
        />
        {!isCollapsed && contentRows.map((row, idx) => (
          <Row key={idx} label={row.label} values={row.values} className={row.className} />
        ))}
      </>
    );
  };

  return (
    <Card className="p-0 overflow-hidden border-none shadow-premium rounded-[2rem]">
      <div className="p-6 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-bold text-black">Matriz de Control Contractual y Financiero</h3>
          <p className="text-xs text-gray-700 font-bold">Consolidado estratégico por Unidad Funcional (UF)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2 no-print">
            <button 
              onClick={expandAll}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-black uppercase rounded-lg transition-all"
              title="Expandir Todo"
            >
              <ChevronDown size={14} />
              Desplegar
            </button>
            <button 
              onClick={collapseAll}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-black uppercase rounded-lg transition-all"
              title="Contraer Todo"
            >
              <ChevronRight size={14} />
              Contraer
            </button>
          </div>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            <Download size={14} />
            Exportar Excel
          </button>
          <button 
            onClick={exportToImage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            <ImageIcon size={14} />
            Exportar Imagen
          </button>
        </div>
      </div>
      
      <div ref={tableRef} className="overflow-x-auto overflow-y-hidden custom-scrollbar bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-20 shadow-sm">
            <Row 
              label="UNIDAD FUNCIONAL" 
              values={ufs.map(uf => uf.id)} 
              isHeader 
            />
          </thead>
          <tbody>
            <Row label="CONSTRUCTOR (RAZÓN SOCIAL)" values={ufs.map(uf => uf.contractor)} isHeader className="bg-azul-oceano/90" />
            
            {renderSection("Cronograma del Proyecto", [
              { label: "Inicio", values: ufs.map(uf => formatDateProject(uf.startDate)) },
              { label: "Inicio Preconstrucción", values: ufs.map(uf => formatDateProject(uf.preconstructionStart)) },
              { label: "Fin Preconstrucción", values: ufs.map(uf => formatDateProject(uf.preconstructionEnd)) },
              { label: "Inicio Construcción", values: ufs.map(uf => formatDateProject(uf.constructionStart)) },
              { label: "Fin Construcción", values: ufs.map(uf => formatDateProject(uf.constructionEnd)) },
            ])}
            
            {renderSection("Valor del Contrato", [
              { label: "$ Inversión Inicial", values: ufs.map(uf => formatCurrency(uf.constructorContract.value * 0.8)) },
              { label: "$ Adiciones de Obra", values: ufs.map(uf => formatCurrency(uf.constructorContract.value * 0.2)) },
              { label: "$ Valor Final", values: ufs.map(uf => formatCurrency(uf.constructorContract.value)), className: "bg-gray-50/30 font-bold" },
            ])}
            
            {renderSection("Desempeño Financiero", [
              { label: "$ Programado Acum.", values: ufs.map(uf => formatCurrency((uf.financialProgrammed / 100) * uf.constructorContract.value)) },
              { label: "$ Ejecutado Real", values: ufs.map(uf => formatCurrency(uf.constructorContract.executed)) },
              { label: "% Programado", values: ufs.map(uf => <ProgressIcon value={uf.financialProgrammed} />) },
              { label: "% Ejecutado", values: ufs.map(uf => <ProgressIcon value={uf.financialProgress} />) },
              { label: "% Diferencia", values: ufs.map(uf => (
                <DifferenceCell progress={uf.financialProgress} programmed={uf.financialProgrammed} />
              )), className: "bg-white" },
            ])}
            
            {renderSection("Gestión de Facturación", [
              { label: "$ Facturado", values: ufs.map(uf => formatCurrency(uf.constructorContract.invoiced)) },
              { label: "% Facturación", values: ufs.map(uf => <ProgressIcon value={(uf.constructorContract.invoiced / uf.constructorContract.value) * 100} />) },
              { label: "$ Por Facturar", values: ufs.map(uf => formatCurrency(uf.constructorContract.executed - uf.constructorContract.invoiced)), className: "text-blue-900 font-black bg-blue-50/50" },
            ])}
            
            <Row label="INTERVENTORÍA (RAZÓN SOCIAL)" values={ufs.map(uf => uf.interventoria)} isHeader className="bg-azul-oceano/90" />
            
            {renderSection("Seguimiento de Control", [
              { label: "$ Valor Contractual", values: ufs.map(uf => formatCurrency(uf.interventoriaContract.value)) },
              { label: "$ Ejecución Financiera", values: ufs.map(uf => formatCurrency(uf.interventoriaContract.executed)) },
            ])}
            
            {renderSection("Facturación Realizada", [
              { label: "$ Facturado a la fecha", values: ufs.map(uf => formatCurrency(uf.interventoriaContract.invoiced)) },
              { label: "% Avance Facturación", values: ufs.map(uf => <ProgressIcon value={(uf.interventoriaContract.invoiced / uf.interventoriaContract.value) * 100} />) },
            ])}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
