import React from "react";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Moon, 
  Sun,
  ChevronRight,
  Save
} from "lucide-react";
import { Card } from "../Card";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";

export const ConfigControl: React.FC = () => {
  const sections = [
    { id: "perfil", label: "Perfil de Usuario", icon: User, description: "Gestione su información personal y preferencias de visualización." },
    { id: "notificaciones", label: "Notificaciones", icon: Bell, description: "Configure alertas críticas, de advertencia e informes programados." },
    { id: "seguridad", label: "Seguridad y Accesos", icon: Shield, description: "Administre contraseñas, autenticación de dos factores y permisos." },
    { id: "datos", label: "Fuentes de Datos", icon: Database, description: "Conexiones con SAP, Primavera P6 y otras plataformas de gestión." },
    { id: "idioma", label: "Idioma y Región", icon: Globe, description: "Configure el formato de fecha, moneda y zona horaria." },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-violeta-dark tracking-tight">Configuración</h2>
          <p className="text-sm text-gray-500 font-medium">Personalice su experiencia en el Dashboard Lagos de Torca</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="premium-card px-8 py-4 bg-torca-azul text-violeta-dark rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-rio-verde transition-all shadow-xl shadow-torca-azul/20 flex items-center gap-3 group">
            <Save size={18} className="group-hover:scale-110 transition-transform" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="premium-card p-8 group hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-[0.02] group-hover:scale-110 transition-transform duration-700">
                <section.icon size={120} />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-8">
                  <div className="p-5 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-torca-azul/10 group-hover:text-torca-azul transition-all duration-500">
                    <section.icon size={28} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xl font-display font-bold text-violeta-dark group-hover:text-torca-azul transition-colors">{section.label}</h4>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{section.description}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 text-gray-300 group-hover:bg-torca-azul group-hover:text-white group-hover:translate-x-2 transition-all duration-500">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="premium-card p-10 bg-gray-50/50 border-dashed border-2 border-gray-200">
        <div className="flex justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white rounded-2xl shadow-premium text-violeta-dark">
              <Moon size={24} />
            </div>
            <div>
              <p className="text-lg font-display font-bold text-violeta-dark">Modo Oscuro</p>
              <p className="text-sm text-gray-500 font-medium">Cambie la interfaz a tonos oscuros para reducir la fatiga visual.</p>
            </div>
          </div>
          <button className="w-16 h-8 bg-gray-200 rounded-full relative transition-colors group">
            <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-premium group-hover:scale-110 transition-all" />
          </button>
        </div>
      </div>

      <div className="pt-12 border-t border-gray-100 flex flex-wrap justify-center gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-center">
        <span className="hover:text-torca-azul cursor-pointer transition-colors">Acerca de PMO Lagos de Torca</span>
        <span className="hover:text-torca-azul cursor-pointer transition-colors">Política de Privacidad</span>
        <span className="hover:text-torca-azul cursor-pointer transition-colors">Términos de Servicio</span>
      </div>
    </div>
  );
};
