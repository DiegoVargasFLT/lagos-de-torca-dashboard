import React from "react";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Wallet, 
  ShieldAlert, 
  Library,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  ShieldCheck
} from "lucide-react";
import { cn } from "../lib/utils";
import { View } from "../types";

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  { id: "resumen", label: "Centro de Control", icon: LayoutDashboard, description: "Vista general y cockpit" },
  { id: "programacion", label: "Cronograma y Avance", icon: CalendarDays, description: "Tiempos y progreso" },
  { id: "costos", label: "Gestión Financiera", icon: Wallet, description: "Presupuesto y costos" },
  { id: "alertas", label: "Riesgos y Alertas", icon: ShieldAlert, description: "Seguridad y atención" },
  { id: "documentacion", label: "Biblioteca Técnica", icon: Library, description: "Planos y documentos" },
  { id: "configuracion", label: "Configuración", icon: Settings, description: "Ajustes del sistema" },
  { id: "admin", label: "Administración", icon: ShieldCheck, description: "Gestión de datos" },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, setIsOpen }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside 
      className={cn(
        "bg-violeta-dark text-white h-screen transition-all duration-500 flex flex-col fixed lg:sticky top-0 z-[70] no-print shadow-2xl",
        isCollapsed ? "w-20" : "w-72",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-violeta-dark/50 backdrop-blur-xl">
        {(!isCollapsed || isOpen) && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-torca-azul to-rio-verde flex items-center justify-center shadow-lg shadow-torca-azul/20">
              <Zap size={20} className="text-violeta-dark fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-tight leading-tight">LAGOS DE TORCA</span>
              <span className="text-[10px] text-rio-verde font-bold uppercase tracking-widest opacity-80">PMO Dashboard</span>
            </div>
          </div>
        )}
        {isCollapsed && !isOpen && (
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-torca-azul to-rio-verde flex items-center justify-center mx-auto shadow-lg shadow-torca-azul/20">
            <Zap size={20} className="text-violeta-dark fill-current" />
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-xl transition-all hidden lg:block text-gray-400 hover:text-white"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-white/10 text-white shadow-inner" 
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 w-1 h-full bg-torca-azul" />
              )}
              <item.icon size={22} className={cn(
                "transition-all duration-500 group-hover:scale-110 flex-shrink-0",
                isActive ? "text-torca-azul drop-shadow-[0_0_8px_rgba(97,177,227,0.5)]" : "text-gray-500 group-hover:text-rio-verde"
              )} />
              {(!isCollapsed || isOpen) && (
                <div className="flex flex-col items-start text-left">
                  <span className={cn(
                    "text-[13px] font-semibold tracking-tight transition-colors",
                    isActive ? "text-white" : "text-white/70 group-hover:text-white"
                  )}>{item.label}</span>
                  <span className="text-[10px] text-white/70 font-medium group-hover:text-white/90 transition-colors">{item.description}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-white/5 bg-violeta-dark/30">
        <div className={cn(
          "bg-white/5 rounded-2xl p-3 flex items-center gap-4 border border-white/5 transition-all hover:bg-white/10 cursor-pointer",
          (isCollapsed && !isOpen) && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-torca-azul/20 to-rio-verde/20 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-torca-azul">DM</span>
          </div>
          {(!isCollapsed || isOpen) && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white">Diego M.</p>
              <p className="text-[10px] text-rio-verde font-bold uppercase tracking-wider">Administrador</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
