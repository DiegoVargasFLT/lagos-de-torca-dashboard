import { UFData, GlobalStats, Alert, Milestone, SCurvePoint, ReprogrammingMarker } from '../types';
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
  obtenerReprogramacionesPorUF
} from './supabaseService';

// =====================================================
// ADAPTADORES: Supabase → Dashboard
// =====================================================

// Mapear estado de UF a status del dashboard
const mapStatus = (estado: string, avanceFisico: number): 'ok' | 'warning' | 'critical' => {
  const estadoLower = estado.toLowerCase();
  
  if (estadoLower.includes('liquidación') || estadoLower.includes('entrega')) return 'ok';
  if (estadoLower.includes('construcción')) {
    if (avanceFisico >= 70) return 'ok';
    if (avanceFisico >= 30) return 'warning';
    return 'critical';
  }
  if (estadoLower.includes('pre-construcción') || estadoLower.includes('inicio')) return 'warning';
  
  return 'warning';
};

// Mapear alertas de Supabase a formato Dashboard
const mapAlerts = (alertasSupabase: any[]): Alert[] => {
  return alertasSupabase.map((a, index) => ({
    id: index + 1,
    type: a.tipo,
    title: a.titulo,
    uf: a.unidades_funcionales?.nombre_contrato || 'UF',
    description: a.descripcion || '',
    impact: a.impacto || '',
    action: a.accion_mitigante || '',
    date: new Date(a.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }));
};

// Mapear hitos de Supabase a formato Dashboard
const mapMilestones = (hitosSupabase: any[]): Milestone[] => {
  return hitosSupabase.map((h, index) => ({
    id: index + 1,
    title: h.titulo,
    date: h.fecha,
    responsible: h.responsable || 'Sin responsable',
    status: h.estado
  }));
};

// Mapear curva S de Supabase a formato Dashboard
const mapSCurve = (avanceSupabase: any[]): SCurvePoint[] => {
  // Agrupar por fecha_corte
  const groupedByDate: Record<string, any> = {};
  
  avanceSupabase.forEach(row => {
    const dateKey = row.fecha_corte;
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = {
        month: new Date(dateKey).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).toUpperCase().replace('.', ''),
        programmed: 0,
        executed: 0,
        invoiced: 0
      };
    }
    
    // Mapear tipo_curva a campos
    const tipoLower = row.tipo_curva.toLowerCase();
    if (tipoLower.includes('programado') || tipoLower.includes('inicial')) {
      groupedByDate[dateKey].programmed = row.pct_avance;
    } else if (tipoLower.includes('ejecutado')) {
      groupedByDate[dateKey].executed = row.pct_avance;
    }
    
    // Usar pct_facturado si existe
    if (row.pct_facturado > 0) {
      groupedByDate[dateKey].invoiced = row.pct_facturado;
    }
  });
  
  return Object.values(groupedByDate).sort((a, b) => {
    const dateA = new Date(avanceSupabase.find(x => 
      x.fecha_corte.includes(b.month) || false
    )?.fecha_corte || '2000-01-01');
    const dateB = new Date(avanceSupabase.find(x => 
      x.fecha_corte.includes(a.month) || false
    )?.fecha_corte || '2000-01-01');
    return dateA.getTime() - dateB.getTime();
  });
};

// Mapear reprogramaciones de Supabase a formato Dashboard
const mapReprogrammingMarkers = (reprogramacionesSupabase: any[]): ReprogrammingMarker[] => {
  return reprogramacionesSupabase.map(r => ({
    month: new Date(r.fecha).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).toUpperCase().replace('.', ''),
    label: r.descripcion || `Reprogramación ${r.numero}`
  }));
};

// Obtener fechas de fases
const getFaseDate = (fases: any[], faseName: string, field: 'fecha_inicio' | 'fecha_fin'): string => {
  const fase = fases.find(f => f.fase === faseName);
  if (!fase || !fase[field]) {
    return new Date().toISOString().split('T')[0];
  }
  return fase[field];
};

// =====================================================
// DATA FETCHING: Principal
// =====================================================

export const fetchUFData = async (): Promise<UFData[]> => {
  try {
    // Obtener todas las UFs con resumen
    const ufsResumen = await obtenerUnidadesFuncionales();
    
    const ufDataPromises = ufsResumen.map(async (ufResumen: any) => {
      // Obtener contratos
      const [contratoConstructor, contratoInterventoria] = await Promise.all([
        obtenerContratosPorUF(ufResumen.id).then(contratos => 
          contratos.find(c => c.tipo_contrato === 'Constructor')
        ),
        obtenerContratosPorUF(ufResumen.id).then(contratos => 
          contratos.find(c => c.tipo_contrato === 'Interventor')
        )
      ]);

      // Obtener fases
      const fases = await obtenerFasesPorUF(ufResumen.id);

      // Obtener avance (curva S)
      const avance = await obtenerCurvaSPorUF(ufResumen.id);

      // Obtener hitos
      const hitos = await obtenerHitosPorUF(ufResumen.id);

      // Obtener alertas
      const alertas = await obtenerAlertasPorUF(ufResumen.id);

      // Obtener reprogramaciones
      const reprogramaciones = await obtenerReprogramacionesPorUF(ufResumen.id);

      // Calcular avances usando RPC
      const avanceFisico = 75; // Valor de ejemplo, debería obtenerse de Supabase
      const avanceFinanciero = 80; // Valor de ejemplo, debería obtenerse de Supabase

      // Construir objeto UFData
      const ufData: UFData = {
        id: ufResumen.id,
        name: ufResumen.nombre_contrato,
        contractor: contratoConstructor?.nombre_empresa || 'Sin asignar',
        interventoria: contratoInterventoria?.nombre_empresa || 'Sin asignar',
        status: mapStatus(ufResumen.estado, avanceFisico),
        statusText: ufResumen.estado,
        physicalProgress: avanceFisico,
        physicalProgrammed: avanceFisico + 5, // Programado = físico + 5% (ajustar según lógica de negocio)
        financialProgress: avanceFinanciero,
        financialProgrammed: avanceFinanciero + 3, // Programado financiero (ajustar)
        constructorContract: {
          name: contratoConstructor?.nombre_empresa || 'Constructor',
          value: contratoConstructor?.valor_inicial || 0,
          executed: contratoConstructor?.valor_ejecutado || 0,
          invoiced: contratoConstructor?.valor_facturado || 0
        },
        interventoriaContract: {
          name: contratoInterventoria?.nombre_empresa || 'Interventoría',
          value: contratoInterventoria?.valor_inicial || 0,
          executed: contratoInterventoria?.valor_ejecutado || 0,
          invoiced: contratoInterventoria?.valor_facturado || 0
        },
        startDate: getFaseDate(fases, 'preconstruccion', 'fecha_inicio'),
        endDate: getFaseDate(fases, 'liquidacion', 'fecha_fin'),
        preconstructionStart: getFaseDate(fases, 'preconstruccion', 'fecha_inicio'),
        preconstructionEnd: getFaseDate(fases, 'preconstruccion', 'fecha_fin'),
        constructionStart: getFaseDate(fases, 'construccion', 'fecha_inicio'),
        constructionEnd: getFaseDate(fases, 'construccion', 'fecha_fin'),
        deliveryStart: getFaseDate(fases, 'entrega', 'fecha_inicio'),
        deliveryEnd: getFaseDate(fases, 'entrega', 'fecha_fin'),
        liquidationStart: getFaseDate(fases, 'liquidacion', 'fecha_inicio'),
        liquidationEnd: getFaseDate(fases, 'liquidacion', 'fecha_fin'),
        anticipoGirado: contratoConstructor?.anticipo_girado || 0,
        anticipoAmortizado: contratoConstructor?.anticipo_amortizado || 0,
        milestones: mapMilestones(hitos),
        alerts: mapAlerts(alertas),
        sCurve: mapSCurve(avance),
        constructionSCurve: mapSCurve(avance), // Misma data, diferente formato si es necesario
        reprogrammingMarkers: mapReprogrammingMarkers(reprogramaciones),
        criticalPathComments: `La ${ufResumen.nombre_contrato} se encuentra en fase ${ufResumen.estado}. Ruta crítica actualizada según último reporte.`,
        media: {
          photos: [],
          videos: []
        }
      };

      return ufData;
    });

    const ufData = await Promise.all(ufDataPromises);
    return ufData;
  } catch (error) {
    console.error('Error fetching UF data:', error);
    throw error;
  }
};

export const fetchGlobalStats = async (ufData: UFData[]): Promise<GlobalStats> => {
  const totalContractual = ufData.reduce((acc, uf) => 
    acc + (uf.constructorContract.value || 0) + (uf.interventoriaContract.value || 0), 0
  );
  
  const totalExecuted = ufData.reduce((acc, uf) => 
    acc + (uf.constructorContract.executed || 0) + (uf.interventoriaContract.executed || 0), 0
  );
  
  const globalExecution = ufData.length > 0 
    ? ufData.reduce((acc, uf) => acc + uf.financialProgress, 0) / ufData.length 
    : 0;

  return {
    totalContractual,
    totalExecuted,
    globalExecution,
    activeUFs: ufData.filter(uf => uf.status === 'ok').length,
    totalUFs: ufData.length
  };
};

export const fetchAllAlerts = async (): Promise<Alert[]> => {
  try {
    // Esta función se implementará completamente cuando se tenga la conexión a Supabase
    return [];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
};
