import React from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { ExecutiveSummary } from "./components/views/ExecutiveSummary";
import { KPIIndicators } from "./components/views/KPIIndicators";
import { CostControl } from "./components/views/CostControl";
import { Scheduling } from "./components/views/Scheduling";
import { AlertsRisks } from "./components/views/AlertsRisks";
import { Documents } from "./components/views/Documents";
import { ConfigControl } from "./components/views/ConfigControl";
import { AdminInterface } from "./components/views/AdminInterface";
import { DashboardProvider, useDashboard } from "./context/DashboardContext";
import { motion, AnimatePresence } from "motion/react";

const DashboardContent: React.FC = () => {
  const { currentView, setCurrentView, selectedUFId, selectedUFIds } = useDashboard();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const renderView = () => {
    switch (currentView) {
      case "resumen":
        return <ExecutiveSummary />;
      case "costos":
        return <CostControl />;
      case "programacion":
        return <Scheduling />;
      case "alertas":
        return <AlertsRisks />;
      case "documentacion":
        return <Documents />;
      case "configuracion":
        return <ConfigControl />;
      case "admin":
        return <AdminInterface />;
      default:
        return <ExecutiveSummary />;
    }
  };

  const getTitle = () => {
    let ufPrefix = "";
    if (selectedUFId) {
      ufPrefix = `[${selectedUFId}] `;
    } else if (selectedUFIds.length > 1) {
      ufPrefix = `[${selectedUFIds.length} UFs] `;
    }
    
    switch (currentView) {
      case "resumen": return `${ufPrefix}Centro de Control`;
      case "costos": return `${ufPrefix}Gestión Financiera`;
      case "programacion": return `${ufPrefix}Cronograma y Avance`;
      case "alertas": return `${ufPrefix}Riesgos y Alertas`;
      case "documentacion": return `${ufPrefix}Biblioteca Técnica`;
      case "admin": return "Interfaz Administrativa";
      default: return "Dashboard";
    }
  };

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar 
          title={getTitle()} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <div className="py-8 md:py-16 px-4 md:px-12 max-w-[1600px] mx-auto w-full space-y-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentView}-${selectedUFId || 'consolidated'}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="mt-auto py-12 px-8 border-t border-gray-100 bg-violeta-dark text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-torca-azul via-rio-verde to-violeta-aereo" />
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-torca-azul rounded-lg flex items-center justify-center">
                  <span className="text-violeta-dark font-black text-xs">LT</span>
                </div>
                <p className="text-lg font-display font-bold tracking-tight">PMO Lagos de Torca</p>
              </div>
              <p className="text-xs text-torca-azul font-bold uppercase tracking-widest">Última actualización: 17/10/2025 | v1.0.4</p>
            </div>
            <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-torca-azul transition-all hover:translate-y-[-2px]">Soporte Técnico</a>
              <a href="#" className="hover:text-torca-azul transition-all hover:translate-y-[-2px]">Guía de Usuario</a>
              <a href="#" className="hover:text-torca-azul transition-all hover:translate-y-[-2px]">Privacidad</a>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">© 2024 Lagos de Torca</p>
              <p className="text-[10px] text-white/20 mt-1">Desarrollado para la Gerencia de Proyecto</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default App;
