import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  obtenerUnidadesFuncionales,
  obtenerUFPorId,
  obtenerContratosPorUF,
  obtenerCronogramaPorUF,
  obtenerHitosPorUF,
  obtenerFasesPorUF,
  obtenerAPUPorUF,
  obtenerCurvaSPorUF,
  obtenerActasPorUF,
  obtenerResumenActasPorUF,
  obtenerAlertasPorUF,
  obtenerReprogramacionesPorUF,
  suscribirseAUF,
  suscribirseAActas
} from '@/lib/supabaseService';

type ViewType = 'resumen' | 'costos' | 'programacion' | 'alertas' | 'documentacion' | 'configuracion' | 'admin';

interface DashboardContextType {
  // Navegación
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedUFId: string | null;
  setSelectedUFId: (id: string | null) => void;
  selectedUFIds: string[];
  setSelectedUFIds: (ids: string[]) => void;
  
  // Datos principales
  unidadesFuncionales: any[];
  ufSeleccionada: any;
  contratos: any[];
  cronograma: any[];
  hitos: any[];
  fases: any[];
  apu: any[];
  curvaS: any[];
  actas: any[];
  resumenActas: any;
  alertas: any[];
  reprogramaciones: any[];
  
  // Acciones
  recargarDatos: (ufId: string) => Promise<void>;
  
  // Estados
  loading: boolean;
  error: string | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // Navegación
  const [currentView, setCurrentView] = useState<ViewType>('resumen');
  const [selectedUFId, setSelectedUFId] = useState<string | null>(null);
  const [selectedUFIds, setSelectedUFIds] = useState<string[]>([]);

  // Datos principales
  const [unidadesFuncionales, setUnidadesFuncionales] = useState([]);
  const [ufSeleccionada, setUFSeleccionada] = useState<any>(null);
  const [contratos, setContratos] = useState([]);
  const [cronograma, setCronograma] = useState([]);
  const [hitos, setHitos] = useState([]);
  const [fases, setFases] = useState([]);
  const [apu, setAPU] = useState([]);
  const [curvaS, setCurvaS] = useState([]);
  const [actas, setActas] = useState([]);
  const [resumenActas, setResumenActas] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [reprogramaciones, setReprogramaciones] = useState([]);
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar UFs al montar
  useEffect(() => {
    cargarUnidadesFuncionales();
  }, []);

  // Cargar datos cuando cambia la UF seleccionada
  useEffect(() => {
    if (selectedUFId) {
      recargarDatos(selectedUFId);
    }
  }, [selectedUFId]);

  async function cargarUnidadesFuncionales() {
    try {
      setLoading(true);
      const data = await obtenerUnidadesFuncionales();
      setUnidadesFuncionales(data || []);
      
      // Seleccionar la primera UF por defecto
      if (data && data.length > 0) {
        setSelectedUFId(data[0].id);
        setSelectedUFIds([data[0].id]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error cargando proyectos';
      setError(errorMsg);
      console.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function recargarDatos(ufId: string) {
    try {
      setLoading(true);
      setError(null);

      // Cargar todos los datos en paralelo
      const [
        uf,
        contratosData,
        cronogramaData,
        hitosData,
        fasesData,
        apuData,
        curvaSData,
        actasData,
        resumenData,
        alertasData,
        reprogData
      ] = await Promise.all([
        obtenerUFPorId(ufId),
        obtenerContratosPorUF(ufId),
        obtenerCronogramaPorUF(ufId),
        obtenerHitosPorUF(ufId),
        obtenerFasesPorUF(ufId),
        obtenerAPUPorUF(ufId),
        obtenerCurvaSPorUF(ufId),
        obtenerActasPorUF(ufId),
        obtenerResumenActasPorUF(ufId),
        obtenerAlertasPorUF(ufId),
        obtenerReprogramacionesPorUF(ufId)
      ]);

      setUFSeleccionada(uf);
      setContratos(contratosData || []);
      setCronograma(cronogramaData || []);
      setHitos(hitosData || []);
      setFases(fasesData || []);
      setAPU(apuData || []);
      setCurvaS(curvaSData || []);
      setActas(actasData || []);
      setResumenActas(resumenData);
      setAlertas(alertasData || []);
      setReprogramaciones(reprogData || []);

      // Suscribirse a cambios en tiempo real
      const subUF = suscribirseAUF(ufId, () => {
        recargarDatos(ufId);
      });

      const subActas = suscribirseAActas(ufId, () => {
        recargarDatos(ufId);
      });

      // Cleanup de subscripciones
      return () => {
        subUF.unsubscribe();
        subActas.unsubscribe();
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error cargando datos';
      setError(errorMsg);
      console.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  const value: DashboardContextType = {
    // Navegación
    currentView,
    setCurrentView,
    selectedUFId,
    setSelectedUFId,
    selectedUFIds,
    setSelectedUFIds,
    
    // Datos
    unidadesFuncionales,
    ufSeleccionada,
    contratos,
    cronograma,
    hitos,
    fases,
    apu,
    curvaS,
    actas,
    resumenActas,
    alertas,
    reprogramaciones,
    
    // Acciones
    recargarDatos,
    
    // Estados
    loading,
    error
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe usarse dentro de DashboardProvider');
  }
  return context;
}
