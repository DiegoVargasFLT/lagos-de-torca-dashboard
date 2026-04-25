# 📊 Análisis: Estructura Supabase vs Dashboard Requirements

## ✅ CAMPOS CRÍTICOS QUE SÍ TENEMOS EN SUPABASE

### 1. **Unidades Funcionales** (`unidades_funcionales` + `vista_resumen_proyecto`)
| Dashboard Field | Supabase Source | Status |
|-----------------|-----------------|--------|
| `id` | `unidades_funcionales.id` | ✅ |
| `name` | `unidades_funcionales.nombre_contrato` | ✅ |
| `contractor` | `contratos.nombre_empresa` (WHERE tipo='Constructor') | ✅ |
| `interventoria` | `contratos.nombre_empresa` (WHERE tipo='Interventor') | ✅ |
| `status` | `unidades_funcionales.estado` | ⚠️ Mapear: "Construcción"→"ok", "Pre-Construcción"→"warning" |
| `statusText` | `unidades_funcionales.estado` | ✅ |
| `startDate`, `endDate` | `vista_resumen_proyecto.fecha_inicio/fin_proyecto` | ✅ |
| `valor_contrato_inicial` | `vista_resumen_proyecto.valor_contrato_inicial` | ✅ |
| `valor_contrato_actual` | `vista_resumen_proyecto.valor_contrato_actual` | ✅ |
| `avance_fisico_pct` | `vista_resumen_proyecto.avance_fisico_pct` | ✅ |
| `valor_ejecutado_pagado` | `vista_resumen_proyecto.valor_ejecutado_pagado` | ✅ |

---

### 2. **Contratos y Valores** (`contratos` + `vista_tabla_apu_pdf`)
| Dashboard Field | Supabase Source | Status |
|-----------------|-----------------|--------|
| `constructorContract.value` | `contratos.valor_inicial` (WHERE tipo='Constructor') | ✅ |
| `constructorContract.executed` | ❌ **FALTA** - Necesitas campo `valor_ejecutado` en `contratos` |
| `constructorContract.invoiced` | ❌ **FALTA** - Necesitas campo `valor_facturado` en `contratos` |
| `interventoriaContract.value` | `contratos.valor_inicial` (WHERE tipo='Interventor') | ✅ |
| `interventoriaContract.executed` | ❌ **FALTA** |
| `interventoriaContract.invoiced` | ❌ **FALTA** |
| `anticipo_girado` | `contratos.anticipo_girado` | ✅ |
| `anticipo_amortizado` | `contratos.anticipo_amortizado` | ✅ |

**🔴 CAMPOS FALTANTES EN `contratos`:**
```sql
ALTER TABLE contratos 
  ADD COLUMN valor_ejecutado NUMERIC DEFAULT 0,
  ADD COLUMN valor_facturado NUMERIC DEFAULT 0;
```

---

### 3. **Curva S - Avance Físico/Financiero** (`avance_curva_s`)
| Dashboard Field | Supabase Source | Status |
|-----------------|-----------------|--------|
| `month` | `avance_curva_s.fecha_corte` | ✅ (formato: "2024-01-31") |
| `programmed` | `avance_curva_s.pct_avance` (WHERE tipo='Programado') | ✅ |
| `executed` | `avance_curva_s.pct_avance` (WHERE tipo='Ejecutado') | ✅ |
| `invoiced` | ❌ **FALTA** - Necesitas campo `pct_facturado` o calcularlo |
| `valor_acumulado` | `avance_curva_s.valor_acumulado` | ✅ |

**⚠️ PROBLEMA:** La tabla `avance_curva_s` tiene `tipo_curva` con valores como "Programado Inicial", pero necesitas:
- Programado Inicial
- Reprogramación 1, 2, 3, 4, 5
- Ejecutado Real
- Facturado

**🔴 CAMPOS FALTANTES:**
```sql
-- Opción 1: Agregar columna para facturado
ALTER TABLE avance_curva_s 
  ADD COLUMN pct_facturado NUMERIC DEFAULT 0;

-- Opción 2: Crear registros con tipo_curva='Facturado'
```

---

### 4. **Cronograma y Hitos** (`cronograma` + `vista_cronograma_jerarquico`)
| Dashboard Field | Supabase Source | Status |
|-----------------|-----------------|--------|
| `milestones[].title` | `cronograma.nombre_tarea` (WHERE hito_id IS NOT NULL) | ⚠️ Necesitas tabla `hitos` separada o flag |
| `milestones[].date` | `cronograma.fecha_fin` | ✅ |
| `milestones[].responsible` | ❌ **FALTA** - Campo `responsable` en `cronograma` |
| `milestones[].status` | ❌ **FALTA** - Campo `estado` (completed/upcoming/delayed) |
| `preconstructionStart`, etc. | ❌ **FALTA** - Necesitas tabla `uf_fases` con fechas fase |

**🔴 CAMPOS FALTANTES EN `cronograma`:**
```sql
ALTER TABLE cronograma 
  ADD COLUMN responsable TEXT,
  ADD COLUMN estado TEXT DEFAULT 'upcoming', -- completed, upcoming, delayed
  ADD COLUMN es_hito BOOLEAN DEFAULT FALSE;
```

**🔴 TABLA FALTANTE: `uf_fases`** (para fechas de fases del ciclo de vida):
```sql
CREATE TABLE uf_fases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uf_id UUID REFERENCES unidades_funcionales(id),
  fase TEXT NOT NULL, -- 'preconstruccion', 'construccion', 'entrega', 'liquidacion'
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5. **Alertas y Riesgos** 
| Dashboard Field | Supabase Source | Status |
|-----------------|-----------------|--------|
| `alerts[].title` | ❌ **FALTA** - Necesitas tabla `alertas` |
| `alerts[].type` | ❌ **FALTA** - (critical/warning/info) |
| `alerts[].description` | ❌ **FALTA** |
| `alerts[].uf` | ❌ **FALTA** - FK a UF |
| `alerts[].impact` | ❌ **FALTA** |
| `alerts[].action` | ❌ **FALTA** |
| `alerts[].date` | ❌ **FALTA** |

**🔴 TABLA FALTANTE: `alertas`**
```sql
CREATE TABLE alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uf_id UUID REFERENCES unidades_funcionales(id),
  tipo TEXT NOT NULL, -- critical, warning, info
  titulo TEXT NOT NULL,
  descripcion TEXT,
  impacto TEXT,
  accion_mitigante TEXT,
  estado TEXT DEFAULT 'activa', -- activa, resuelta
  fecha_creacion DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6. **Reprogramming Markers** (Reprogramaciones)
| Dashboard Field | Supabase Source | Status |
|-----------------|-----------------|--------|
| `reprogrammingMarkers[].month` | ❌ **FALTA** - Necesitas tabla `reprogramaciones` |
| `reprogrammingMarkers[].label` | ❌ **FALTA** |

**🔴 TABLA FALTANTE: `reprogramaciones`**
```sql
CREATE TABLE reprogramaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uf_id UUID REFERENCES unidades_funcionales(id),
  numero INTEGER NOT NULL, -- 1, 2, 3, 4, 5
  fecha DATE NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 7. **Actas de Pago** (`actas_pago` + `actas_pago_items`) ✅ **BIEN!
| Dashboard Field | Supabase Source | Status |
|-----------------|-----------------|--------|
| `numero_acta` | `actas_pago.numero_acta` | ✅ |
| `fecha_acta` | `actas_pago.fecha_acta` | ✅ |
| `valor_acta` | `actas_pago.neto_a_pagar` | ✅ |
| `estado` | `actas_pago.estado_acta` | ✅ |
| `periodo_inicio`, `periodo_fin` | `actas_pago.periodo_inicio/fin` | ✅ |
| Items del acta | `actas_pago_items` | ✅ |

**✅ ESTA TABLA ESTÁ COMPLETA**

---

### 8. **Presupuesto** (`presupuesto_items` + `presupuesto_cantidades`) ✅ **BIEN!
| Dashboard Field | Supabase Source | Status |
|-----------------|-----------------|--------|
| `item_codigo` | `presupuesto_items.item_codigo` | ✅ |
| `descripcion` | `presupuesto_items.descripcion` | ✅ |
| `unidad` | `presupuesto_items.unidad` | ✅ |
| `valor_unitario` | `presupuesto_items.valor_unitario` | ✅ |
| `cantidad` | `presupuesto_cantidades.cantidad` | ✅ |
| `version` | `presupuesto_cantidades.version` | ✅ |

**✅ ESTA ESTRUCTURA ESTÁ COMPLETA**

---

## 🔴 RESUMEN: LO QUE FALTA AGREGAR EN SUPABASE

### **Tablas Nuevas a Crear (4)**

1. **`alertas`** - Para el módulo de Alertas y Riesgos
2. **`reprogramaciones`** - Para marcadores de reprogramación en Curva S
3. **`uf_fases`** - Para fechas de fases (preconstrucción, construcción, etc.)
4. **`hitos`** (opcional) - O agregar campos a `cronograma`

### **Campos Nuevos en Tablas Existentes (3)**

1. **`contratos`**:
   ```sql
   ALTER TABLE contratos 
     ADD COLUMN valor_ejecutado NUMERIC DEFAULT 0,
     ADD COLUMN valor_facturado NUMERIC DEFAULT 0;
   ```

2. **`avance_curva_s`**:
   ```sql
   ALTER TABLE avance_curva_s 
     ADD COLUMN pct_facturado NUMERIC DEFAULT 0;
   ```

3. **`cronograma`**:
   ```sql
   ALTER TABLE cronograma 
     ADD COLUMN responsable TEXT,
     ADD COLUMN estado TEXT DEFAULT 'upcoming',
     ADD COLUMN es_hito BOOLEAN DEFAULT FALSE;
   ```

---

## 🎯 RECOMENDACIONES DE ARQUITECTURA

### **1. Cero Redundancia - Actualización Automática**

Para que cuando un ingeniero cambie una fecha, todo se actualice automático:

**✅ Usa VISTAS en Supabase:**
```sql
-- Vista que calcula fechas del proyecto basadas en el MIN/MAX de las fases
CREATE OR REPLACE VIEW vista_fechas_proyecto AS
SELECT 
  uf.id,
  MIN(fase.fecha_inicio) as fecha_inicio_proyecto,
  MAX(fase.fecha_fin) as fecha_fin_proyecto,
  -- ... más cálculos
FROM unidades_funcionales uf
LEFT JOIN uf_fases fase ON uf.id = fase.uf_id
GROUP BY uf.id;
```

**✅ Usa TRIGGERS para recalcular valores:**
```sql
-- Trigger que actualiza valor_ejecutado en contratos cuando se inserta un acta
CREATE OR REPLACE FUNCTION actualizar_valor_ejecutado()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contratos
  SET valor_ejecutado = (
    SELECT SUM(neto_a_pagar) 
    FROM actas_pago 
    WHERE uf_id = NEW.uf_id AND estado_acta = 'Pagada'
  )
  WHERE id = NEW.contrato_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### **2. Cálculos Exactos - Lógica en Servidor**

**✅ Usa Funciones en Supabase para cálculos complejos:**
```sql
-- Función que calcula el % de avance financiero
CREATE OR REPLACE FUNCTION calcular_avance_financiero(uf_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_contrato NUMERIC;
  total_ejecutado NUMERIC;
BEGIN
  SELECT SUM(valor_inicial) INTO total_contrato
  FROM contratos WHERE uf_id = uf_id_param;
  
  SELECT SUM(valor_ejecutado) INTO total_ejecutado
  FROM contratos WHERE uf_id = uf_id_param;
  
  RETURN (total_ejecutado / total_contrato) * 100;
END;
$$ LANGUAGE plpgsql;
```

**✅ Usa RPC (Remote Procedure Call) desde React:**
```typescript
// En el frontend
const { data } = await supabase.rpc('calcular_avance_financiero', { 
  uf_id_param: ufId 
});
// data = 87.45 (porcentaje calculado en servidor)
```

---

### **3. Frontend Hiper-rápido**

**✅ Agrega índices a todas las FKs:**
```sql
CREATE INDEX idx_contratos_uf_id ON contratos(uf_id);
CREATE INDEX idx_avance_uf_id ON avance_curva_s(uf_id);
CREATE INDEX idx_cronograma_uf_id ON cronograma(uf_id);
CREATE INDEX idx_actas_uf_id ON actas_pago(uf_id);
```

**✅ Usa vistas materializadas para datos consolidados:**
```sql
CREATE MATERIALIZED VIEW vista_consolidado_diario AS
SELECT 
  uf.id,
  SUM(c.valor_ejecutado) as total_ejecutado,
  SUM(c.valor_facturado) as total_facturado,
  -- ... más cálculos
FROM unidades_funcionales uf
JOIN contratos c ON uf.id = c.uf_id
GROUP BY uf.id;

-- Refresh diario o manual
REFRESH MATERIALIZED VIEW vista_consolidado_diario;
```

---

## 📋 PLAN DE ACCIÓN

### **Fase 1: Completar Estructura (Prioridad ALTA)**
- [ ] Crear tabla `alertas`
- [ ] Crear tabla `reprogramaciones`
- [ ] Crear tabla `uf_fases`
- [ ] Agregar campos a `contratos` (valor_ejecutado, valor_facturado)
- [ ] Agregar campos a `cronograma` (responsable, estado, es_hito)
- [ ] Agregar campo a `avance_curva_s` (pct_facturado)

### **Fase 2: Automatización (Prioridad MEDIA)**
- [ ] Crear triggers para actualización automática de valores
- [ ] Crear funciones RPC para cálculos en servidor
- [ ] Crear vistas para consolidación de datos
- [ ] Agregar índices a FKs

### **Fase 3: Conectar Dashboard (Prioridad MEDIA)**
- [ ] Crear servicios TypeScript para consultar Supabase
- [ ] Reemplazar `mockData.ts` por llamadas a Supabase
- [ ] Actualizar `DashboardContext` para usar datos reales
- [ ] Implementar polling/realtime para actualizaciones

---

## 🚀 ¿LISTO PARA EMPEZAR?

Dime si quieres que:
1. **Genere los scripts SQL** para crear las tablas y campos faltantes
2. **Cree los servicios TypeScript** para conectar el dashboard
3. **Ambas cosas**

¡Quedo atento!
