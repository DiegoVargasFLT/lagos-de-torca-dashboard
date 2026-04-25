-- =====================================================
-- SCRIPT SQL: COMPLETAR ESTRUCTURA SUPABASE
-- Proyecto: Lagos de Torca Dashboard
-- =====================================================

-- =====================================================
-- 1. TABLAS NUEVAS
-- =====================================================

-- Tabla: alertas (para módulo de Alertas y Riesgos)
CREATE TABLE IF NOT EXISTS alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uf_id UUID REFERENCES unidades_funcionales(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('critical', 'warning', 'info')),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  impacto TEXT,
  accion_mitigante TEXT,
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'resuelta')),
  fecha_creacion DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertas_uf_id ON alertas(uf_id);
CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas(estado);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas(tipo);

-- Tabla: reprogramaciones (marcadores de reprogramación Curva S)
CREATE TABLE IF NOT EXISTS reprogramaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uf_id UUID REFERENCES unidades_funcionales(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL CHECK (numero BETWEEN 1 AND 6),
  fecha DATE NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reprogramaciones_uf_id ON reprogramaciones(uf_id);

-- Tabla: uf_fases (fechas de fases del ciclo de vida)
CREATE TABLE IF NOT EXISTS uf_fases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uf_id UUID REFERENCES unidades_funcionales(id) ON DELETE CASCADE,
  fase TEXT NOT NULL CHECK (fase IN (
    'preconstruccion', 
    'construccion', 
    'entrega', 
    'liquidacion'
  )),
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uf_fases_uf_id ON uf_fases(uf_id);

-- Tabla: hitos (milestones del cronograma)
CREATE TABLE IF NOT EXISTS hitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uf_id UUID REFERENCES unidades_funcionales(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  fecha DATE NOT NULL,
  responsable TEXT,
  estado TEXT DEFAULT 'upcoming' CHECK (estado IN ('completed', 'upcoming', 'delayed')),
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hitos_uf_id ON hitos(uf_id);
CREATE INDEX IF NOT EXISTS idx_hitos_estado ON hitos(estado);

-- =====================================================
-- 2. CAMPOS NUEVOS EN TABLAS EXISTENTES
-- =====================================================

-- Agregar campos a tabla: contratos
ALTER TABLE contratos 
  ADD COLUMN IF NOT EXISTS valor_ejecutado NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_facturado NUMERIC DEFAULT 0;

-- Agregar campo a tabla: avance_curva_s
ALTER TABLE avance_curva_s 
  ADD COLUMN IF NOT EXISTS pct_facturado NUMERIC DEFAULT 0;

-- Agregar campos a tabla: cronograma
ALTER TABLE cronograma 
  ADD COLUMN IF NOT EXISTS responsable TEXT,
  ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'upcoming',
  ADD COLUMN IF NOT EXISTS es_hito BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 3. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_contratos_uf_id ON contratos(uf_id);
CREATE INDEX IF NOT EXISTS idx_contratos_tipo ON contratos(tipo_contrato);
CREATE INDEX IF NOT EXISTS idx_avance_uf_id ON avance_curva_s(uf_id);
CREATE INDEX IF NOT EXISTS idx_avance_tipo_curva ON avance_curva_s(tipo_curva);
CREATE INDEX IF NOT EXISTS idx_cronograma_uf_id ON cronograma(uf_id);
CREATE INDEX IF NOT EXISTS idx_actas_uf_id ON actas_pago(uf_id);
CREATE INDEX IF NOT EXISTS idx_actas_estado ON actas_pago(estado_acta);
CREATE INDEX IF NOT EXISTS idx_presupuesto_uf_id ON presupuesto_items(uf_id);
CREATE INDEX IF NOT EXISTS idx_presupuesto_cantidades_item_id ON presupuesto_cantidades(item_id);

-- =====================================================
-- 4. FUNCIONES PARA CÁLCULOS EN SERVIDOR (RPC)
-- =====================================================

-- Función: Calcular avance financiero de una UF
CREATE OR REPLACE FUNCTION calcular_avance_financiero(uf_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_contrato NUMERIC;
  total_ejecutado NUMERIC;
BEGIN
  SELECT COALESCE(SUM(valor_inicial), 0) INTO total_contrato
  FROM contratos WHERE uf_id = uf_id_param;
  
  SELECT COALESCE(SUM(valor_ejecutado), 0) INTO total_ejecutado
  FROM contratos WHERE uf_id = uf_id_param;
  
  IF total_contrato = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((total_ejecutado / total_contrato) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Función: Calcular avance físico de una UF
CREATE OR REPLACE FUNCTION calcular_avance_fisico(uf_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  avance NUMERIC;
BEGIN
  SELECT COALESCE(MAX(pct_avance), 0) INTO avance
  FROM avance_curva_s 
  WHERE uf_id = uf_id_param 
    AND tipo_curva LIKE '%Ejecutado%';
  
  RETURN ROUND(avance, 2);
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener resumen consolidado de una UF
CREATE OR REPLACE FUNCTION obtener_resumen_uf(uf_id_param UUID)
RETURNS TABLE (
  id UUID,
  nombre_contrato TEXT,
  estado TEXT,
  valor_contrato_inicial NUMERIC,
  valor_contrato_actual NUMERIC,
  valor_ejecutado NUMERIC,
  valor_facturado NUMERIC,
  anticipo_girado NUMERIC,
  anticipo_amortizado NUMERIC,
  avance_fisico_pct NUMERIC,
  avance_financiero_pct NUMERIC,
  fecha_inicio_proyecto DATE,
  fecha_fin_proyecto DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uf.id,
    uf.nombre_contrato,
    uf.estado,
    COALESCE((SELECT SUM(c.valor_inicial) FROM contratos c WHERE c.uf_id = uf.id), 0) as valor_contrato_inicial,
    COALESCE((SELECT SUM(c.valor_inicial) FROM contratos c WHERE c.uf_id = uf.id), 0) as valor_contrato_actual,
    COALESCE((SELECT SUM(c.valor_ejecutado) FROM contratos c WHERE c.uf_id = uf.id), 0) as valor_ejecutado,
    COALESCE((SELECT SUM(c.valor_facturado) FROM contratos c WHERE c.uf_id = uf.id), 0) as valor_facturado,
    COALESCE((SELECT SUM(c.anticipo_girado) FROM contratos c WHERE c.uf_id = uf.id), 0) as anticipo_girado,
    COALESCE((SELECT SUM(c.anticipo_amortizado) FROM contratos c WHERE c.uf_id = uf.id), 0) as anticipo_amortizado,
    COALESCE((SELECT MAX(pct_avance) FROM avance_curva_s acs WHERE acs.uf_id = uf.id AND acs.tipo_curva LIKE '%Ejecutado%'), 0) as avance_fisico_pct,
    COALESCE((SELECT SUM(c.valor_ejecutado) FROM contratos c WHERE c.uf_id = uf.id), 0) / 
      NULLIF(COALESCE((SELECT SUM(c.valor_inicial) FROM contratos c WHERE c.uf_id = uf.id), 0), 0) * 100 as avance_financiero_pct,
    (SELECT MIN(fecha_inicio) FROM uf_fases f WHERE f.uf_id = uf.id) as fecha_inicio_proyecto,
    (SELECT MAX(fecha_fin) FROM uf_fases f WHERE f.uf_id = uf.id) as fecha_fin_proyecto
  FROM unidades_funcionales uf
  WHERE uf.id = uf_id_param OR uf_id_param IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener curva S consolidada
CREATE OR REPLACE FUNCTION obtener_curva_s(uf_id_param UUID)
RETURNS TABLE (
  fecha_corte DATE,
  tipo_curva TEXT,
  pct_avance NUMERIC,
  pct_facturado NUMERIC,
  valor_acumulado NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    acs.fecha_corte,
    acs.tipo_curva,
    acs.pct_avance,
    acs.pct_facturado,
    acs.valor_acumulado
  FROM avance_curva_s acs
  WHERE acs.uf_id = uf_id_param OR uf_id_param IS NULL
  ORDER BY acs.fecha_corte, acs.tipo_curva;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Trigger: Actualizar valor_ejecutado cuando se inserta/actualiza acta de pago
CREATE OR REPLACE FUNCTION actualizar_valor_ejecutado_contrato()
RETURNS TRIGGER AS $$
DECLARE
  contrato_id_var UUID;
  tipo_contrato_var TEXT;
  total_ejecutado NUMERIC;
  total_facturado NUMERIC;
BEGIN
  -- Determinar qué contrato actualizar
  SELECT c.id, c.tipo_contrato INTO contrato_id_var, tipo_contrato_var
  FROM contratos c
  WHERE c.uf_id = COALESCE(NEW.uf_id, OLD.uf_id)
    AND c.tipo_contrato = 'Constructor'
  LIMIT 1;
  
  IF contrato_id_var IS NOT NULL THEN
    -- Calcular total ejecutado (suma de actas pagadas)
    SELECT COALESCE(SUM(neto_a_pagar), 0) INTO total_ejecutado
    FROM actas_pago
    WHERE uf_id = COALESCE(NEW.uf_id, OLD.uf_id)
      AND estado_acta IN ('Pagada', 'Aprobada');
    
    -- Calcular total facturado
    SELECT COALESCE(SUM(neto_a_pagar), 0) INTO total_facturado
    FROM actas_pago
    WHERE uf_id = COALESCE(NEW.uf_id, OLD.uf_id);
    
    -- Actualizar contrato
    UPDATE contratos
    SET 
      valor_ejecutado = total_ejecutado,
      valor_facturado = total_facturado,
      updated_at = NOW()
    WHERE id = contrato_id_var;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actas_pago
DROP TRIGGER IF EXISTS trigger_actualizar_ejecutado_actas ON actas_pago;
CREATE TRIGGER trigger_actualizar_ejecutado_actas
  AFTER INSERT OR UPDATE OR DELETE ON actas_pago
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_valor_ejecutado_contrato();

-- Trigger: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas con updated_at
DROP TRIGGER IF EXISTS trigger_updated_at_alertas ON alertas;
CREATE TRIGGER trigger_updated_at_alertas
  BEFORE UPDATE ON alertas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_hitos ON hitos;
CREATE TRIGGER trigger_updated_at_hitos
  BEFORE UPDATE ON hitos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- =====================================================
-- 6. VISTAS PARA CONSULTAS CONSOLIDADAS
-- =====================================================

-- Vista: Resumen completo de proyecto
CREATE OR REPLACE VIEW vista_resumen_proyecto_v2 AS
SELECT 
  uf.id,
  uf.nombre_contrato,
  uf.rol,
  uf.estado,
  uf.descripcion,
  (SELECT MIN(fecha_inicio) FROM uf_fases f WHERE f.uf_id = uf.id) as fecha_inicio_proyecto,
  (SELECT MAX(fecha_fin) FROM uf_fases f WHERE f.uf_id = uf.id) as fecha_fin_proyecto,
  COALESCE((SELECT EXTRACT(DAY FROM (MAX(fecha_fin) - MIN(fecha_inicio))) FROM uf_fases f WHERE f.uf_id = uf.id), 0) as duracion_dias_proyecto,
  COALESCE((SELECT SUM(c.valor_inicial) FROM contratos c WHERE c.uf_id = uf.id), 0) as valor_contrato_inicial,
  COALESCE((SELECT SUM(c.valor_inicial) FROM contratos c WHERE c.uf_id = uf.id), 0) as valor_contrato_actual,
  COALESCE((SELECT SUM(c.valor_ejecutado) FROM contratos c WHERE c.uf_id = uf.id), 0) as valor_ejecutado,
  COALESCE((SELECT SUM(c.valor_facturado) FROM contratos c WHERE c.uf_id = uf.id), 0) as valor_facturado,
  COALESCE((SELECT SUM(c.anticipo_girado) FROM contratos c WHERE c.uf_id = uf.id), 0) as anticipo_girado,
  COALESCE((SELECT SUM(c.anticipo_amortizado) FROM contratos c WHERE c.uf_id = uf.id), 0) as anticipo_amortizado,
  COALESCE((SELECT MAX(pct_avance) FROM avance_curva_s acs WHERE acs.uf_id = uf.id AND acs.tipo_curva LIKE '%Ejecutado%'), 0) as avance_fisico_pct,
  COALESCE((SELECT SUM(ap.neto_a_pagar) FROM actas_pago ap WHERE ap.uf_id = uf.id), 0) as valor_ejecutado_pagado,
  (SELECT COUNT(*) FROM alertas a WHERE a.uf_id = uf.id AND a.estado = 'activa') as alertas_activas,
  uf.created_at,
  uf.updated_at
FROM unidades_funcionales uf;

-- Vista: Consolidado de alertas por UF
CREATE OR REPLACE VIEW vista_alertas_consolidado AS
SELECT 
  uf.id as uf_id,
  uf.nombre_contrato,
  COUNT(CASE WHEN a.tipo = 'critical' AND a.estado = 'activa' THEN 1 END) as alertas_criticas,
  COUNT(CASE WHEN a.tipo = 'warning' AND a.estado = 'activa' THEN 1 END) as alertas_warning,
  COUNT(CASE WHEN a.tipo = 'info' AND a.estado = 'activa' THEN 1 END) as alertas_info,
  COUNT(CASE WHEN a.estado = 'activa' THEN 1 END) as total_alertas_activas
FROM unidades_funcionales uf
LEFT JOIN alertas a ON uf.id = a.uf_id
GROUP BY uf.id, uf.nombre_contrato;

-- =====================================================
-- 7. DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Insertar fases de ejemplo para las UFs existentes
-- UF1: 4ff88277-a69a-442a-93a4-cd427ece3665
INSERT INTO uf_fases (uf_id, fase, fecha_inicio, fecha_fin) VALUES
  ('4ff88277-a69a-442a-93a4-cd427ece3665', 'preconstruccion', '2026-04-17', '2026-04-20'),
  ('4ff88277-a69a-442a-93a4-cd427ece3665', 'construccion', '2026-04-21', '2026-04-22'),
  ('4ff88277-a69a-442a-93a4-cd427ece3665', 'entrega', '2026-04-23', '2026-04-23'),
  ('4ff88277-a69a-442a-93a4-cd427ece3665', 'liquidacion', '2026-04-24', '2026-04-30')
ON CONFLICT DO NOTHING;

-- Insertar hitos de ejemplo
INSERT INTO hitos (uf_id, titulo, fecha, responsable, estado) VALUES
  ('4ff88277-a69a-442a-93a4-cd427ece3665', 'Inicio de Obra', '2026-04-21', 'Ing. Carlos R.', 'completed'),
  ('4ff88277-a69a-442a-93a4-cd427ece3665', 'Cierre de Obra Civil', '2026-04-23', 'Ing. Carlos R.', 'upcoming'),
  ('87d554f0-b594-421b-8f39-98e861d3b756', 'Pavimentación Tramo Norte', '2024-11-20', 'Ing. Luis P.', 'delayed'),
  ('87d554f0-b594-421b-8f39-98e861d3b756', 'Instalación de Luminarias', '2025-02-10', 'Eléctricos S.A.', 'upcoming')
ON CONFLICT DO NOTHING;

-- Insertar alertas de ejemplo
INSERT INTO alertas (uf_id, tipo, titulo, descripcion, impacto, accion_mitigante, estado) VALUES
  ('87d554f0-b594-421b-8f39-98e861d3b756', 'warning', 'Desviación Financiera UF2A (-2.57%)', 
   'Se observa una desviación negativa en la ejecución financiera respecto al programado.',
   'Riesgo flujo de caja', 'Revisar cronograma facturación', 'activa'),
  ('87d554f0-b594-421b-8f39-98e861d3b756', 'warning', 'Pendiente por Facturar UF2A',
   'Existe un volumen alto de obra ejecutada no facturada.',
   'Acumulación facturación', 'Plan facturación acelerada', 'activa'),
  ('e7b5ca14-6de2-47a4-8a62-210ba1f54a66', 'critical', 'Amortización Anticipo UF5 (0.00%)',
   'No se ha iniciado la amortización del anticipo según cronograma.',
   'Incumplimiento contractual', 'Verificación urgente con contratista', 'activa')
ON CONFLICT DO NOTHING;

-- Insertar reprogramaciones de ejemplo
INSERT INTO reprogramaciones (uf_id, numero, fecha, descripcion) VALUES
  ('87d554f0-b594-421b-8f39-98e861d3b756', 1, '2024-03-15', 'Reprogramación por condiciones climáticas'),
  ('87d554f0-b594-421b-8f39-98e861d3b756', 2, '2024-09-01', 'Ajuste por cambios en diseño'),
  ('87d554f0-b594-421b-8f39-98e861d3b756', 3, '2025-03-01', 'Reprogramación final')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
