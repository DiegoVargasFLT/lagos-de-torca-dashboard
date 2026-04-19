import React from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Folder, 
  Clock, 
  ChevronRight,
  FileCheck,
  FileWarning,
  FilePlus,
  Globe,
  Layout
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";
import { cn } from "../../lib/utils";
import { Card } from "../Card";
import { motion } from "motion/react";

export const Documents: React.FC = () => {
  const { selectedUFId } = useDashboard();

  const categories = [
    { label: "Actas de Obra", count: 124, icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Otrosíes", count: 12, icon: FilePlus, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Informes Mensuales", count: 48, icon: FileText, color: "text-torca-azul", bg: "bg-torca-azul/5" },
    { label: "Planos y Diseños", count: 356, icon: Folder, color: "text-violeta-dark", bg: "bg-violeta-aereo/5" },
  ];

  const recentDocuments = [
    { id: 1, name: "Acta de Inicio UF3 - Consorcio Sabana.pdf", date: "15/10/2024", size: "2.4 MB", type: "Acta", uf: "UF3" },
    { id: 2, name: "Informe Mensual Interventoría MAB - Septiembre.pdf", date: "10/10/2024", size: "15.8 MB", type: "Informe", uf: "UF2A" },
    { id: 3, name: "Otrosí No. 4 - Adición Presupuestal UF1.pdf", date: "05/10/2024", size: "1.1 MB", type: "Otrosí", uf: "UF1" },
    { id: 4, name: "Diseño Hidráulico EBAR UF5 - Versión Final.dwg", date: "28/09/2024", size: "45.2 MB", type: "Diseño", uf: "UF5_E" },
    { id: 5, name: "Acta de Vecindad - Tramo 4 Guaymaral.pdf", date: "20/09/2024", size: "8.4 MB", type: "Acta", uf: "UF5_G" },
  ];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-violeta-dark tracking-tight">Biblioteca Técnica</h2>
          <p className="text-sm text-gray-500 font-medium">Repositorio centralizado de documentos, planos e informes</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-white hover:shadow-premium transition-all group">
            <div className="p-2 bg-violeta-aereo/10 rounded-xl text-violeta-dark group-hover:scale-110 transition-transform">
              <FilePlus size={18} />
            </div>
            <span className="text-xs font-bold text-violeta-dark uppercase tracking-widest">Cargar Documento</span>
          </button>
        </div>
      </div>

      {/* External Platforms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-10 bg-gradient-to-br from-azul-oceano to-violeta-dark text-white border-none shadow-2xl shadow-violeta-aereo/20 group cursor-pointer relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Layout size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 group-hover:scale-110 transition-transform">
                <Layout size={28} className="text-white" />
              </div>
              <div className="p-2 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={16} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-display font-bold mb-3 tracking-tight">Plataforma 360</h3>
            <p className="text-sm text-white/70 mb-8 leading-relaxed font-medium max-w-sm">
              Acceda al visor geográfico y seguimiento detallado de predios y avance de obra en tiempo real.
            </p>
            <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-torca-azul group-hover:text-white transition-colors">
              Explorar Visor 360
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="premium-card p-10 bg-white group cursor-pointer relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Globe size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className="p-4 bg-torca-azul/10 rounded-2xl border border-torca-azul/10 group-hover:scale-110 transition-transform">
                <Globe size={28} className="text-torca-azul" />
              </div>
              <div className="p-2 bg-gray-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={16} className="text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-display font-bold text-violeta-dark mb-3 tracking-tight">Portal Lagos de Torca</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium max-w-sm">
              Portal oficial del megaproyecto con información pública, noticias y avances para la comunidad.
            </p>
            <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-azul-oceano group-hover:text-rio-verde transition-colors">
              Visitar Sitio Web
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="premium-card p-8 group hover:shadow-2xl transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", cat.bg, cat.color)}>
                  <cat.icon size={24} />
                </div>
                <span className="text-3xl font-display font-bold text-violeta-dark">{cat.count}</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">{cat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Documents List */}
      <div className="premium-card p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violeta-aereo/10 rounded-2xl text-violeta-dark">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-violeta-dark tracking-tight">Documentos Recientes</h3>
              <p className="text-sm text-gray-500 font-medium">Últimos archivos cargados al sistema</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nombre, UF o tipo..." 
                className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-torca-azul/10 focus:bg-white transition-all"
              />
            </div>
            <button className="p-3 bg-gray-50 text-gray-500 hover:text-torca-azul rounded-2xl border border-gray-100 hover:bg-white hover:shadow-premium transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {recentDocuments.map((doc, i) => (
            <motion.div 
              key={doc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100 group hover:bg-white hover:shadow-premium transition-all gap-6"
            >
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-torca-azul shadow-sm group-hover:scale-110 group-hover:bg-torca-azul group-hover:text-white transition-all duration-500">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-violeta-dark group-hover:text-torca-azul transition-colors truncate max-w-md">{doc.name}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="text-[10px] font-bold text-torca-azul bg-torca-azul/10 px-3 py-1 rounded-lg uppercase tracking-widest">{doc.uf}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} />
                      {doc.date}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{doc.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                <button className="p-3 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Descargar">
                  <Download size={20} />
                </button>
                <button className="p-3 text-gray-400 hover:text-torca-azul hover:bg-torca-azul/5 rounded-xl transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <button className="w-full mt-10 py-4 rounded-2xl border border-dashed border-gray-200 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:border-torca-azul hover:text-torca-azul hover:bg-torca-azul/5 transition-all flex items-center justify-center gap-3">
          Ver repositorio completo de documentos
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
