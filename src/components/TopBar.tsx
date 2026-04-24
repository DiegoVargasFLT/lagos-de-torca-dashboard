import React from "react";
import { Bell, Search, Calendar as CalendarIcon, ChevronDown, Filter, Printer, FileSpreadsheet, Menu, Image as ImageIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { useDashboard } from "../context/DashboardContext";
import { ufData } from "../data/mockData";
import { exportToExcel, exportAsImage } from "../lib/exportUtils";

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onMenuClick, contentRef }) => {
  const { selectedUFIds, setSelectedUFIds, selectedPeriod, setSelectedPeriod, filteredUFData, currentView } = useDashboard();
  const [isUFDropdownOpen, setIsUFDropdownOpen] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportImage = () => {
    exportAsImage(contentRef, `Dashboard_${title.replace(/\s+/g, '_')}`);
  };

  const handleExportExcel = () => {
    const dataToExport = filteredUFData.map(uf => ({
      'Unidad Funcional': uf.id,
      'Nombre del Tramo': uf.name,
      'Contratista Constructor': uf.contractor,
      'Interventoría': uf.interventoria,
      'Avance Físico (%)': (uf.physicalProgress / 100).toLocaleString('en-US', {style: 'percent', minimumFractionDigits: 2}),
      'Avance Financiero (%)': (uf.financialProgress / 100).toLocaleString('en-US', {style: 'percent', minimumFractionDigits: 2}),
      'Valor Contrato Constructor': (uf.constructorContract.value).toLocaleString('es-CO', {style: 'currency', currency: 'COP'}),
      'Ejecutado Constructor': (uf.constructorContract.executed).toLocaleString('es-CO', {style: 'currency', currency: 'COP'}),
      'Facturado Constructor': (uf.constructorContract.invoiced).toLocaleString('es-CO', {style: 'currency', currency: 'COP'}),
      'Valor Contrato Interventoría': (uf.interventoriaContract.value).toLocaleString('es-CO', {style: 'currency', currency: 'COP'}),
      'Estado General': uf.statusText.toUpperCase()
    }));

    exportToExcel(dataToExport, `Reporte_Torca_${title.replace(/\s+/g, '_')}`, 'Resumen');
  };

  const toggleUF = (id: string) => {
    if (selectedUFIds.includes(id)) {
      setSelectedUFIds(selectedUFIds.filter(ufId => ufId !== id));
    } else {
      setSelectedUFIds([...selectedUFIds, id]);
    }
  };

  const selectAllUFs = () => setSelectedUFIds([]);
  
  const getUFLabel = () => {
    if (selectedUFIds.length === 0) return "Todas las UFs";
    if (selectedUFIds.length === 1) return ufData.find(u => u.id === selectedUFIds[0])?.id || "1 UF";
    return `${selectedUFIds.length} UFs seleccionadas`;
  };

  return (
    <header className="h-auto min-h-[96px] bg-white border-b border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 md:px-8 py-4 lg:py-0 sticky top-0 z-40 no-print gap-4">
      <div className="flex items-center gap-4 w-full lg:w-auto">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden text-violeta-dark"
        >
          <Menu size={24} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-lg md:text-xl font-bold text-violeta-dark uppercase tracking-tight line-clamp-1">{title}</h1>
            {selectedUFIds.length > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase hidden sm:inline-block",
                "bg-emerald-50 text-emerald-600"
              )}>
                Filtrado
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Megaproyecto Lagos de Torca • Control Ejecutivo
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-full sm:w-auto">
          {/* Period Selector */}
          <div className="relative group w-full sm:w-auto">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-violeta-dark focus:outline-none focus:ring-2 focus:ring-torca-azul/20 cursor-pointer w-full"
            >
              <option>20-Oct-24</option>
              <option>13-Oct-24</option>
              <option>06-Oct-24</option>
              <option>29-Sep-24</option>
              <option>22-Sep-24</option>
              <option>15-Sep-24</option>
            </select>
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-torca-azul pointer-events-none" size={14} />
          </div>

          {/* Multi-select UF Selector */}
          <div className="relative w-full sm:w-auto">
            <button 
              onClick={() => setIsUFDropdownOpen(!isUFDropdownOpen)}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2 min-w-[160px] text-xs font-bold text-violeta-dark focus:outline-none focus:ring-2 focus:ring-torca-azul/20 cursor-pointer w-full"
            >
              <span className="truncate mr-2">{getUFLabel()}</span>
              <Filter size={14} className="text-torca-azul" />
            </button>

            {isUFDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsUFDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-full sm:w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 py-3 px-2 overflow-hidden">
                  <div className="flex justify-between items-center px-3 mb-2 pb-2 border-b border-gray-50">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Unidades Funcionales</span>
                    <button 
                      onClick={selectAllUFs}
                      className="text-[10px] font-bold text-torca-azul hover:text-rio-verde transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {ufData.map(uf => (
                      <label 
                        key={uf.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors",
                          selectedUFIds.includes(uf.id) ? "bg-torca-azul/5" : "hover:bg-gray-50"
                        )}
                      >
                        <input 
                          type="checkbox"
                          checked={selectedUFIds.includes(uf.id)}
                          onChange={() => toggleUF(uf.id)}
                          className="w-4 h-4 rounded border-gray-300 text-torca-azul focus:ring-torca-azul"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-violeta-dark">{uf.id}</span>
                          <span className="text-[10px] text-gray-400 truncate w-40">{uf.contractor}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={handleExportImage}
            className="p-2.5 text-gray-400 hover:text-torca-azul hover:bg-torca-azul/5 rounded-xl transition-all"
            title="Exportar como Imagen"
          >
            <ImageIcon size={20} />
          </button>
          <button 
            onClick={handlePrint}
            className="p-2.5 text-gray-400 hover:text-torca-azul hover:bg-torca-azul/5 rounded-xl transition-all"
            title="Imprimir PDF"
          >
            <Printer size={20} />
          </button>
          <button 
            onClick={handleExportExcel}
            className="p-2.5 text-gray-400 hover:text-rio-verde hover:bg-rio-verde/5 rounded-xl transition-all"
            title="Exportar Excel"
          >
            <FileSpreadsheet size={20} />
          </button>
          <div className="w-px h-8 bg-gray-100 mx-2" />
          <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl relative transition-colors">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
