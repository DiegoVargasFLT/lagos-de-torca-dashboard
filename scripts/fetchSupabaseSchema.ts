import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fetchSchema() {
  console.log('🔌 Conectando a Supabase...\n')

  // Lista exacta de tablas y vistas proporcionada por el usuario
  const possibleTables = [
    // Tablas (10)
    'unidades_funcionales',
    'cronograma',
    'presupuesto_items',
    'presupuesto_cantidades',
    'avance_curva_s',
    'actas_pago',
    'actas_pago_items',
    'usuarios',
    'contratos',
    'comentarios_cambios',
    // Vistas (5)
    'vista_tabla_apu_pdf',
    'vista_cronograma_jerarquico',
    'vista_actas_resumen',
    'vista_avance_comparativo',
    'vista_resumen_proyecto'
  ]

  const foundTables: string[] = []
  const notFoundTables: string[] = []

  console.log('🔍 Buscando tablas y vistas...\n')
  
  for (const tableName of possibleTables) {
    const { error } = await supabase.from(tableName).select('*').limit(1)
    if (!error) {
      foundTables.push(tableName)
    } else {
      notFoundTables.push(tableName)
    }
  }

  // Mostrar resultados
  console.log(`\n✅ Tablas/Vistas encontradas (${foundTables.length}):`)
  foundTables.forEach(t => console.log(`   - ${t}`))

  if (foundTables.length === 0) {
    console.log('\n⚠️ No se encontraron tablas.')
    console.log('\nPor favor, dime los nombres EXACTOS de tus 10 tablas y 5 vistas en Supabase')
    console.log('Puedes verlos en: https://supabase.com/dashboard/project/xrhezewmfplobafjfzni/editor\n')
    return
  }

  // Para cada tabla encontrada, obtener estructura y datos
  for (const tableName of foundTables) {
    console.log(`\n${'━'.repeat(50)}`)
    console.log(`📋 TABLA/VISTA: ${tableName}`)
    console.log(`${'━'.repeat(50)}`)

    // Contar registros
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log(`⚠️ Error al contar: ${countError.message}`)
    } else {
      console.log(`📦 Registros: ${count}`)
    }

    // Obtener muestra de datos
    const { data: sample, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(5)

    if (sampleError) {
      console.log(`⚠️ Error al obtener muestra: ${sampleError.message}`)
    } else if (sample && sample.length > 0) {
      console.log(`\n📄 Columnas: ${Object.keys(sample[0]).join(', ')}`)
      console.log(`\n📄 Muestra (primer registro):`)
      console.log(JSON.stringify(sample[0], null, 2))
    }
  }

  console.log(`\n\n${'═'.repeat(50)}`)
  console.log(`✅ RESUMEN: ${foundTables.length} tablas/vistas encontradas`)
  console.log(`${'═'.repeat(50)}\n`)
}

fetchSchema()
