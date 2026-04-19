import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { View, UFData } from "../types";
// Importamos el cliente de supabase (asegúrate de tenerlo configurado en un archivo lib/supabase.ts)
import { supabase } from "../lib/supabase"; 

interface DashboardContextType {
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedUFIds: string[];
  setSelectedUFIds: (ids: string[]) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  filteredUFData: UFData[];
  isConsolidated: boolean;
  selectedUFId: string | null;
  selectedUF: UFData | null;
  isLoading: boolean; // Añadido para saber cuando carga
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<View>("resumen");
  const [selectedUFIds, setSelectedUFIds] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Abril 2026");
  const [ufData, setUfData] = useState<UFData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // EFECTO MAESTRO: Carga toda la información de la base de datos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Hacemos un JOIN masivo de todas las tablas conectadas
      const { data, error } = await supabase
        .from('unidades_funcionales')
        .select(`
          *,
          contratos (
            *,
            actas_facturacion (*),
            presupuesto_versiones (
              *,
              presupuesto_actividades (*)
            )
          ),
          programacion_versiones (
            *,
            programacion_semanal (*)
          ),
          hitos (*),
          alertas_riesgos (*)
        `);

      if (error) {
        console.error("Error cargando datos de Supabase:", error);
      } else if (data) {
        // Mapeo simple de los datos de la DB a tu interfaz de Typescript
        const transformedData: UFData[] = data.map((uf: any) => ({
          id: uf.id,
          name: uf.nombre,
          contractor: uf.contratos.find((c: any) => c.tipo_contrato === 'Constructor')?.nombre_empresa || "N/A",
          interventoria: uf.contratos.find((c: any) => c.tipo_contrato === 'Interventoría')?.nombre_empresa || "N/A",
          status: uf.semaforo,
          statusText: uf.estado_actual,
          physicalProgress: uf.avance_fisico_global,
          physicalProgrammed: 100, // Valor de referencia
          financialProgress: uf.avance_financiero_global,
          financialProgrammed: 100,
          startDate: uf.fecha_inicio_proye,
          endDate: uf.fecha_fin_proye,
          // Aquí extraemos los hitos y alertas que vienen de la DB
          milestones: uf.hitos || [],
          alerts: uf.alertas_riesgos || [],
          // Asignamos el contrato del constructor para los cálculos de costos
          constructorContract: {
            value: uf.contratos[0]?.valor_inicial || 0,
            executed: uf.contratos[0]?.actas_facturacion?.reduce((acc: any, curr: any) => acc + curr.valor_ejecutado_periodo, 0) || 0,
            invoiced: uf.contratos[0]?.actas_facturacion?.reduce((acc: any, curr: any) => acc + curr.valor_facturado_periodo, 0) || 0,
          }
        }));

        setUfData(transformedData);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const filteredUFData = selectedUFIds.length === 0 
    ? ufData 
    : ufData.filter(uf => selectedUFIds.includes(uf.id));

  const isConsolidated = selectedUFIds.length === 0 || selectedUFIds.length > 1;
  const selectedUFId = selectedUFIds.length === 1 ? selectedUFIds[0] : null;
  const selectedUF = selectedUFIds.length === 1 ? filteredUFData[0] : null;

  return (
    <DashboardContext.Provider value={{
      currentView,
      setCurrentView,
      selectedUFIds,
      setSelectedUFIds,
      selectedPeriod,
      setSelectedPeriod,
      filteredUFData,
      isConsolidated,
      selectedUFId,
      selectedUF,
      isLoading
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard debe usarse dentro de un DashboardProvider");
  }
  return context;
};