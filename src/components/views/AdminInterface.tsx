import React, { useState } from "react";
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit3, 
  Building2, 
  TrendingUp, 
  Image as ImageIcon, 
  Calendar, 
  DollarSign, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  HardHat,
  Wallet,
  Camera,
  Layers,
  FileBox
} from "lucide-react";
import { Card } from "../Card";
import { cn, formatCurrency } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "../../context/DashboardContext";

type AdminSection = 
  | "new_uf" 
  | "construction_budget" 
  | "obra_progress" 
  | "new_image" 
  | "cut_off" 
  | "new_budget";

interface SectionMeta {
  id: AdminSection;
  label: string;
  icon: any;
  description: string;
  color: string;
}

const adminSections: SectionMeta[] = [
  { id: "new_uf", label: "Nueva Unidad Funcional", icon: Building2, description: "Registrar un nuevo frente de obra", color: "text-blue-600 bg-blue-50" },
  { id: "construction_budget", label: "Presupuesto Construcción", icon: HardHat, description: "Modificar valores de obra y contratos", color: "text-emerald-600 bg-emerald-50" },
  { id: "obra_progress", label: "Nuevo Avance de Obra", icon: TrendingUp, description: "Ingresar porcentajes de ejecución real", color: "text-amber-600 bg-amber-50" },
  { id: "new_image", label: "Registro Fotográfico", icon: Camera, description: "Almacenar nuevas evidencias visuales", color: "text-purple-600 bg-purple-50" },
  { id: "cut_off", label: "Corte de Avance", icon: Calendar, description: "Definir fecha de corte del reporte", color: "text-red-600 bg-red-50" },
  { id: "new_budget", label: "Nuevo Presupuesto", icon: Wallet, description: "Cargar rubros presupuestales", color: "text-indigo-600 bg-indigo-50" },
];

export const AdminInterface: React.FC = () => {
  const { filteredUFData, updateUFData } = useDashboard();
  const [activeSection, setActiveSection] = useState<AdminSection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Functional inputs for interconnection
  const [selectedUfId, setSelectedUfId] = useState<string>("");
  const [valueA, setValueA] = useState<string>("");
  const [valueB, setValueB] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Expert Security Validation
    if ((activeSection === "construction_budget" || activeSection === "obra_progress") && !selectedUfId) {
      alert("⚠️ Validación de Seguridad: Unidad Funcional no seleccionada.");
      return;
    }

    setIsSubmitting(true);

    // Business Logic: Reflect changes globally
    if (activeSection === "construction_budget" && selectedUfId) {
      updateUFData(selectedUfId, {
        constructorContract: {
          ...filteredUFData.find(u => u.id === selectedUfId)!.constructorContract,
          value: parseFloat(valueA) || 0
        }
      });
    }

    if (activeSection === "obra_progress" && selectedUfId) {
      updateUFData(selectedUfId, {
        physicalProgress: parseFloat(valueA) || 0
      });
    }

    // Success Sequence
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveSection(null);
        setSelectedUfId("");
        setValueA("");
        setValueB("");
      }, 2000);
    }, 1000);
  };

  const renderForm = () => {
    switch (activeSection) {
      case "new_uf":
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Identificador UF (ej. UF 10)</label>
                <input type="text" className="input-premium" placeholder="UF XX" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Nombre del Tramo</label>
                <input type="text" className="input-premium" placeholder="Ej: Conexión Av. Boyacá" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Contratista Constructor</label>
                <input type="text" className="input-premium" placeholder="Nombre de la empresa" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Nombre Interventoría</label>
                <input type="text" className="input-premium" placeholder="Consorcio Interventor" required />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button 
                type="button" 
                onClick={() => setActiveSection(null)}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-all font-display"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? "Procesando..." : <div className="flex items-center gap-2"><Save size={18} /> Crear UF</div>}
              </button>
            </div>
          </form>
        );
      case "construction_budget":
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Seleccionar UF</label>
                <select 
                  value={selectedUfId}
                  onChange={(e) => setSelectedUfId(e.target.value)}
                  className="input-premium opacity-100"
                  required
                >
                  <option value="">Seleccione una Unidad...</option>
                  {filteredUFData.map(uf => <option key={uf.id} value={uf.id}>{uf.id} - {uf.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Adición/Modificación de Obra ($)</label>
                <input 
                  type="number" 
                  value={valueA}
                  onChange={(e) => setValueA(e.target.value)}
                  className="input-premium" 
                  placeholder="0.00" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Nuevo Valor Contractual ($)</label>
                <input 
                  type="number" 
                  value={valueB}
                  onChange={(e) => setValueB(e.target.value)}
                  className="input-premium" 
                  placeholder="0.00" 
                />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Justificación técnica</label>
                <textarea className="input-premium min-h-[120px] resize-none" placeholder="Motivo de la modificación presupuestal..."></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button type="button" onClick={() => setActiveSection(null)} className="px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl font-display">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? "Guardando..." : <div className="flex items-center gap-2"><Save size={18} /> Actualizar Presupuesto</div>}
              </button>
            </div>
          </form>
        );
      case "obra_progress":
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Frente de Obra</label>
                <select 
                  value={selectedUfId}
                  onChange={(e) => setSelectedUfId(e.target.value)}
                  className="input-premium appearance-none"
                  required
                >
                  <option value="">Seleccione frente...</option>
                  {filteredUFData.map(uf => <option key={uf.id} value={uf.id}>{uf.id}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">% Avance Físico Actual</label>
                <input 
                  type="number" 
                  step="0.01" 
                  max="100" 
                  value={valueA}
                  onChange={(e) => setValueA(e.target.value)}
                  className="input-premium" 
                  placeholder="0.00%" 
                  required
                />
              </div>
              <div className="space-y-2 text-slate-400 italic">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Valor Ejecutado ($)</label>
                <input type="number" className="input-premium opacity-50 cursor-not-allowed" placeholder="Calculado automáticamente" disabled />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Reporte de Novedades</label>
                <textarea className="input-premium h-24 resize-none" placeholder="Observaciones de campo..."></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button type="button" onClick={() => setActiveSection(null)} className="px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl font-display">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? "Enviando..." : <div className="flex items-center gap-2"><CheckCircle2 size={18} /> Registrar Avance</div>}
              </button>
            </div>
          </form>
        );
      case "new_image":
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-16 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-torca-azul/5 hover:border-torca-azul transition-all group cursor-pointer">
                <div className="p-6 bg-white rounded-3xl shadow-premium mb-6 group-hover:scale-110 transition-transform">
                  <Camera size={40} className="text-torca-azul" />
                </div>
                <p className="text-base font-bold text-violeta-dark font-display">Suelte las fotografías aquí</p>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-2">JPG, PNG, WEBP • Hasta 10MB</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Asociar a UF</label>
                  <select className="input-premium appearance-none">
                    {filteredUFData.map(uf => <option key={uf.id} value={uf.id}>{uf.id}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Categoría</label>
                  <select className="input-premium appearance-none">
                    <option>Hito Constructivo</option>
                    <option>Gestión Social</option>
                    <option>Gestión Ambiental</option>
                    <option>Seguridad y Salud</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button type="button" onClick={() => setActiveSection(null)} className="px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl font-display">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                 <div className="flex items-center gap-2"><Plus size={18} /> Subir Imagen</div>
              </button>
            </div>
          </form>
        );
      case "cut_off":
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="max-w-xl mx-auto space-y-8 p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col items-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mb-2">
                <Calendar size={40} />
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-display font-bold text-violeta-dark">Programar Corte de Avance</h4>
                <p className="text-sm text-gray-500 mt-2 font-medium">Esta acción congelará los indicadores actuales y generará una nueva semana de reporte.</p>
              </div>
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-violeta-dark uppercase tracking-widest text-center block">Semana de Reporte (Domingo)</label>
                  <input type="text" className="w-full px-6 py-5 rounded-3xl border-2 border-slate-200 font-display font-black text-center text-3xl text-violeta-dark focus:border-red-500 outline-none transition-all shadow-inner-soft" placeholder="20-Oct-24" />
                </div>
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                  <AlertCircle size={24} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800 font-bold leading-relaxed italic text-left">
                    ADVERTENCIA: Una vez ejecutado el corte, la información de la semana anterior quedará bloqueada en el historial maestro para auditoría.
                  </p>
                </div>
              </div>
              <div className="w-full flex flex-col gap-4">
                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-display font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-red-200 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {isSubmitting ? "Ejecutando Corte..." : "Efectuar Corte de Periodo"}
                </button>
                <button type="button" onClick={() => setActiveSection(null)} className="w-full py-4 text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-violeta-dark transition-colors">
                  Volver al Selector Principal
                </button>
              </div>
            </div>
          </form>
        );
      case "new_budget":
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Cargar Estructura Presupuestal (Batch)</label>
                <div className="border-4 border-dashed border-indigo-100 rounded-[3rem] p-16 bg-indigo-50/20 flex flex-col items-center hover:bg-indigo-50/40 hover:border-indigo-300 transition-all cursor-pointer group">
                  <div className="p-6 bg-white rounded-3xl shadow-premium mb-4 group-hover:scale-110 transition-transform">
                    <FileBox size={40} className="text-indigo-600" />
                  </div>
                  <p className="text-base font-bold text-violeta-dark font-display">Subir archivo .XLSX o .CSV</p>
                  <p className="text-xs text-gray-400 font-medium mt-2">Siga la plantilla oficial PMO 2025</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Nombre del Rubro</label>
                  <input type="text" className="input-premium" placeholder="Ej: Obra Gris" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-violeta-dark uppercase tracking-widest">Asignación Presupuestal Global ($)</label>
                  <input type="number" className="input-premium" placeholder="$ 0.00" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button type="button" onClick={() => setActiveSection(null)} className="px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl font-display">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? "Cargando..." : <div className="flex items-center gap-2"><Plus size={18} /> Agregar Presupuesto</div>}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-4">
      {/* Module Title Section */}
      <div className="flex justify-between items-end gap-6 px-4">
        <div>
          <span className="text-[10px] font-black text-torca-azul uppercase tracking-[0.3em] mb-2 block">Módulo Master Admin</span>
          <h2 className="text-4xl font-display font-bold text-violeta-dark tracking-tight">Interfaz Administrativa</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Gestión centralizada de indicadores y parámetros del Megaproyecto</p>
        </div>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-violeta-dark/5 rounded-2xl border border-violeta-dark/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-violeta-dark uppercase tracking-widest">Terminal Administrativa Segura</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeSection ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4"
          >
            {adminSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="group relative flex flex-col items-start p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-premium transition-all duration-500 hover:shadow-2xl hover:border-torca-azul/30 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                  <section.icon size={120} />
                </div>
                <div className={cn("p-4 rounded-2xl mb-6 transition-transform group-hover:scale-110", section.color)}>
                  <section.icon size={28} />
                </div>
                <h3 className="text-xl font-display font-bold text-violeta-dark mb-2">{section.label}</h3>
                <p className="text-[11px] text-gray-500 font-medium text-left leading-relaxed mb-6 italic">{section.description}</p>
                <div className="flex items-center gap-2 text-torca-azul font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Configurar <ChevronRight size={14} />
                </div>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="px-4"
          >
            <Card className="p-0 overflow-hidden border-none shadow-premium rounded-[3rem]">
              <div className="flex flex-col md:flex-row">
                {/* Form Sidebar */}
                <div className="w-full md:w-80 bg-violeta-dark p-10 text-white relative">
                  <button 
                    onClick={() => setActiveSection(null)}
                    className="mb-10 text-white/50 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    <ChevronRight size={14} className="rotate-180" /> Volver al menú
                  </button>
                  <div className={cn(
                    "p-4 rounded-2xl w-fit mb-6", 
                    adminSections.find(s => s.id === activeSection)?.color.split(' ')[1] || "bg-white/10"
                  )}>
                    {activeSection && React.createElement(adminSections.find(s => s.id === activeSection)!.icon, { size: 28, className: "text-white" })}
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4">{adminSections.find(s => s.id === activeSection)?.label}</h3>
                  <p className="text-xs text-white/60 font-medium leading-relaxed italic">Complete los campos requeridos para actualizar la base de datos maestra del proyecto.</p>
                  
                  <div className="mt-20 pt-10 border-t border-white/10 hidden md:block">
                    <p className="text-[10px] font-black text-rio-verde uppercase tracking-widest mb-4">Información del Sistema</p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] opacity-70">
                        <span>Usuario</span>
                        <span>Diego M.</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] opacity-70">
                        <span>Rol</span>
                        <span className="text-rio-verde font-bold">Admin Master</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Form Content */}
                <div className="flex-1 p-10 md:p-14 bg-white relative">
                  {showSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-10 left-10 right-10 z-20 bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 shadow-xl"
                    >
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-emerald-900 leading-none">Información guardada exitosamente</p>
                        <p className="text-xs text-emerald-700 font-medium mt-1">La base de datos se ha sincronizado correctamente.</p>
                      </div>
                    </motion.div>
                  )}
                  {renderForm()}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        <div className="p-6 bg-white/50 rounded-3xl border border-gray-100 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-violeta-dark uppercase tracking-widest mb-1">Estructura UF</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Mantenga los identificadores de UF estandarizados (UF 1 al UF 9).</p>
          </div>
        </div>
        <div className="p-6 bg-white/50 rounded-3xl border border-gray-100 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Camera size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-violeta-dark uppercase tracking-widest mb-1">Formatos Media</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Suba solo archivos en alta resolución para reportes de gerencia.</p>
          </div>
        </div>
        <div className="p-6 bg-white/50 rounded-3xl border border-gray-100 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Save size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-violeta-dark uppercase tracking-widest mb-1">Sincronización</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Los cambios se reflejan en tiempo real en todos los módulos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
