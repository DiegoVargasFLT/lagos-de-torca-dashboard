import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// UNIDADES FUNCIONALES (Proyectos)
// ============================================================================

export async function obtenerUnidadesFuncionales() {
  const { data, error } = await supabase
    .from('vista_resumen_proyecto')
    .select('*')
    .order('nombre_contrato');

  if (error) throw error;
  return data;
}

export async function obtenerUFPorId(ufId: string) {
  const { data, error } = await supabase
    .rpc('obtener_resumen_uf', { uf_id_param: ufId });

  if (error) throw error;
  return data[0];
}

// ============================================================================
// CONTRATOS
// ============================================================================

export async function obtenerContratosPorUF(ufId: string) {
  const { data, error } = await supabase
    .from('contratos')
    .select('*')
    .eq('uf_id', ufId)
    .order('tipo_contrato');

  if (error) throw error;
  return data;
}

// ============================================================================
// CRONOGRAMA Y HITOS
// ============================================================================

export async function obtenerCronogramaPorUF(ufId: string) {
  const { data, error } = await supabase
    .from('vista_cronograma_jerarquico')
    .select('*')
    .eq('uf_id', ufId)
    .order('fecha_inicio');

  if (error) throw error;
  return data;
}

export async function obtenerHitosPorUF(ufId: string) {
  const { data, error } = await supabase
    .from('hitos')
    .select('*')
    .eq('uf_id', ufId)
    .order('fecha');

  if (error) throw error;
  return data;
}

export async function obtenerFasesPorUF(ufId: string) {
  const { data, error } = await supabase
    .from('uf_fases')
    .select('*')
    .eq('uf_id', ufId)
    .order('fecha_inicio');

  if (error) throw error;
  return data;
}

// ============================================================================
// PRESUPUESTO Y APU
// ============================================================================

export async function obtenerAPUPorUF(ufId: string) {
  const { data, error } = await supabase
    .from('vista_tabla_apu_pdf')
    .select('*')
    .eq('uf_id', ufId)
    .order('capitulo_nombre,item_codigo');

  if (error) throw error;
  return data;
}

export async function obtenerVersionesPresupuesto(ufId: string) {
  const { data: items, error: itemsError } = await supabase
    .from('presupuesto_items')
    .select('id')
    .eq('uf_id', ufId)
    .limit(1);

  if (itemsError) throw itemsError;

  const { data, error } = await supabase
    .from('presupuesto_cantidades')
    .select('version')
    .in('item_id', (items || []).map(i => i.id))
    .distinct();

  if (error) throw error;
  return data?.map(v => v.version) || [];
}

// ============================================================================
// CURVA S (AVANCE)
// ============================================================================

export async function obtenerCurvaSPorUF(ufId: string) {
  const { data, error } = await supabase
    .from('vista_avance_comparativo')
    .select('*')
    .eq('uf_id', ufId)
    .order('fecha_corte');

  if (error) throw error;
  return data;
}

export async function obtenerReprogramacionesPorUF(ufId: string) {
  const { data, error } = await supabase
    .from('reprogramaciones')
    .select('*')
    .eq('uf_id', ufId)
    .order('fecha');

  if (error) throw error;
  return data;
}

// ============================================================================
// ACTAS DE PAGO
// ============================================================================

export async function obtenerActasPorUF(ufId: string) {
  const { data, error } = await supabase
    .from('actas_pago')
    .select('*')
    .eq('uf_id', ufId)
    .order('numero_acta');

  if (error) throw error;
  return data;
}

export async function obtenerResumenActasPorUF(ufId: string) {
  const { data, error } = await supabase
    .from('vista_actas_resumen')
    .select('*')
    .eq('uf_id', ufId)
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerItemsActa(actaId: string) {
  const { data, error } = await supabase
    .from('actas_pago_items')
    .select('*, presupuesto_items(item_codigo, descripcion, unidad)')
    .eq('acta_id', actaId);

  if (error) throw error;
  return data;
}

// ============================================================================
// ALERTAS Y RIESGOS
// ============================================================================

export async function obtenerAlertasPorUF(ufId: string) {
  const { data, error } = await supabase
    .from('alertas')
    .select('*')
    .eq('uf_id', ufId)
    .eq('estado', 'activa')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================================
// INSERCIÓN DE DATOS (para el dashboard)
// ============================================================================

export async function crearUF(nombre_contrato: string, rol: string, descripcion: string) {
  const { data, error } = await supabase
    .from('unidades_funcionales')
    .insert([{ nombre_contrato, rol, descripcion, estado: 'Pre-Construcción' }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function crearContrato(ufId: string, nombreEmpresa: string, tipo: string, nit: string) {
  const { data, error } = await supabase
    .from('contratos')
    .insert([{
      uf_id: ufId,
      nombre_empresa: nombreEmpresa,
      tipo_contrato: tipo,
      nit,
      valor_inicial: 0
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function crearActaPago(ufId: string, numeroActa: number, fechaActa: string, costoDirecto: number) {
  const { data, error } = await supabase
    .from('actas_pago')
    .insert([{
      uf_id: ufId,
      numero_acta: numeroActa,
      fecha_acta: fechaActa,
      costo_directo: costoDirecto,
      estado_acta: 'Borrador'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function crearAlerta(ufId: string, titulo: string, tipo: string, descripcion: string) {
  const { data, error } = await supabase
    .from('alertas')
    .insert([{
      uf_id: ufId,
      titulo,
      tipo,
      descripcion,
      estado: 'activa'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// ACTUALIZACIÓN DE DATOS
// ============================================================================

export async function actualizarUF(ufId: string, updates: any) {
  const { data, error } = await supabase
    .from('unidades_funcionales')
    .update(updates)
    .eq('id', ufId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function actualizarActaPago(actaId: string, updates: any) {
  const { data, error } = await supabase
    .from('actas_pago')
    .update(updates)
    .eq('id', actaId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export function suscribirseAActas(ufId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`actas:${ufId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'actas_pago',
      filter: `uf_id=eq.${ufId}`
    }, callback)
    .subscribe();
}

export function suscribirseAUF(ufId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`uf:${ufId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'unidades_funcionales',
      filter: `id=eq.${ufId}`
    }, callback)
    .subscribe();
}
