/**
 * Script de pruebas para el módulo de notificaciones
 * 
 * Este script prueba todos los endpoints de la API de notificaciones.
 * Ejecutar con Node.js después de iniciar el servidor backend.
 * 
 * Uso: node test-notificaciones.js
 */

const BASE_URL = 'http://localhost:3100/api/notificaciones';

// ============================================
// CONFIGURACIÓN - Cambiar estos valores
// ============================================
const TOKEN = 'tu-token-jwt-aqui'; // Obtén un token válido iniciando sesión
const ID_USUARIO = 1; // ID del usuario para las pruebas

// ============================================
// Utilidades
// ============================================

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logTest(testName) {
  console.log('\n' + '='.repeat(50));
  log(`TEST: ${testName}`, 'cyan');
  console.log('='.repeat(50));
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : BASE_URL + endpoint;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();
  
  return { response, data };
}

// ============================================
// Tests
// ============================================

async function test1_CrearNotificacion() {
  logTest('1. Crear una nueva notificación');

  const body = {
    id_usuario: ID_USUARIO,
    tipo_notificacion: 'GASTO_AGREGADO',
    mensaje: 'Notificación de prueba - Nuevo gasto agregado',
    url_destino: '/grupos/1/gastos'
  };

  try {
    const { response, data } = await request('', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    if (data.success) {
      log('✓ Notificación creada exitosamente', 'green');
      console.log('Datos:', JSON.stringify(data.data, null, 2));
      return data.data.id_notificacion;
    } else {
      log('✗ Error al crear notificación: ' + data.error, 'red');
      return null;
    }
  } catch (error) {
    log('✗ Error en la petición: ' + error.message, 'red');
    return null;
  }
}

async function test2_ObtenerNotificaciones() {
  logTest('2. Obtener todas las notificaciones del usuario');

  try {
    const { response, data } = await request(`/usuario/${ID_USUARIO}`);

    if (data.success) {
      log(`✓ Se obtuvieron ${data.count} notificaciones`, 'green');
      console.log('Primeras 3 notificaciones:');
      data.data.slice(0, 3).forEach((notif, i) => {
        console.log(`\n${i + 1}. ${notif.tipo_notificacion}`);
        console.log(`   Mensaje: ${notif.mensaje}`);
        console.log(`   Leída: ${notif.leida ? 'Sí' : 'No'}`);
      });
      return data.count > 0;
    } else {
      log('✗ Error al obtener notificaciones: ' + data.error, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error en la petición: ' + error.message, 'red');
    return false;
  }
}

async function test3_ObtenerNoLeidas() {
  logTest('3. Obtener notificaciones no leídas');

  try {
    const { response, data } = await request(`/usuario/${ID_USUARIO}/no-leidas`);

    if (data.success) {
      log(`✓ Se encontraron ${data.count} notificaciones no leídas`, 'green');
      
      if (data.count > 0) {
        console.log('\nNotificaciones no leídas:');
        data.data.forEach((notif, i) => {
          console.log(`${i + 1}. ${notif.mensaje}`);
        });
      }
      
      return data.count;
    } else {
      log('✗ Error al obtener notificaciones no leídas: ' + data.error, 'red');
      return 0;
    }
  } catch (error) {
    log('✗ Error en la petición: ' + error.message, 'red');
    return 0;
  }
}

async function test4_ContarNoLeidas() {
  logTest('4. Contar notificaciones no leídas');

  try {
    const { response, data } = await request(`/usuario/${ID_USUARIO}/count`);

    if (data.success) {
      log(`✓ Total de notificaciones no leídas: ${data.total}`, 'green');
      return data.total;
    } else {
      log('✗ Error al contar notificaciones: ' + data.error, 'red');
      return 0;
    }
  } catch (error) {
    log('✗ Error en la petición: ' + error.message, 'red');
    return 0;
  }
}

async function test5_ObtenerNotificacionPorId(idNotificacion) {
  logTest('5. Obtener una notificación específica');

  if (!idNotificacion) {
    log('⚠ No se proporcionó ID de notificación', 'yellow');
    return false;
  }

  try {
    const { response, data } = await request(`/${idNotificacion}`);

    if (data.success) {
      log('✓ Notificación obtenida exitosamente', 'green');
      console.log('Datos:', JSON.stringify(data.data, null, 2));
      return true;
    } else {
      log('✗ Error al obtener notificación: ' + data.error, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error en la petición: ' + error.message, 'red');
    return false;
  }
}

async function test6_MarcarComoLeida(idNotificacion) {
  logTest('6. Marcar notificación como leída');

  if (!idNotificacion) {
    log('⚠ No se proporcionó ID de notificación', 'yellow');
    return false;
  }

  try {
    const { response, data } = await request(`/${idNotificacion}/marcar-leida`, {
      method: 'PUT'
    });

    if (data.success) {
      log('✓ Notificación marcada como leída', 'green');
      console.log('Fecha de lectura:', data.data?.fecha_lectura);
      return true;
    } else {
      log('✗ Error al marcar como leída: ' + data.error, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error en la petición: ' + error.message, 'red');
    return false;
  }
}

async function test7_MarcarTodasLeidas() {
  logTest('7. Marcar todas las notificaciones como leídas');

  try {
    const { response, data } = await request(`/usuario/${ID_USUARIO}/marcar-todas-leidas`, {
      method: 'PUT'
    });

    if (data.success) {
      log(`✓ ${data.affectedRows} notificaciones marcadas como leídas`, 'green');
      return true;
    } else {
      log('✗ Error al marcar todas como leídas: ' + data.error, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error en la petición: ' + error.message, 'red');
    return false;
  }
}

async function test8_EliminarNotificacion(idNotificacion) {
  logTest('8. Eliminar una notificación');

  if (!idNotificacion) {
    log('⚠ No se proporcionó ID de notificación', 'yellow');
    return false;
  }

  try {
    const { response, data } = await request(`/${idNotificacion}`, {
      method: 'DELETE'
    });

    if (data.success) {
      log('✓ Notificación eliminada exitosamente', 'green');
      return true;
    } else {
      log('✗ Error al eliminar notificación: ' + data.error, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error en la petición: ' + error.message, 'red');
    return false;
  }
}

async function test9_CrearNotificacionesMultiples() {
  logTest('9. Crear múltiples notificaciones de diferentes tipos');

  const notificaciones = [
    {
      id_usuario: ID_USUARIO,
      tipo_notificacion: 'INVITACIÓN',
      mensaje: 'Te han invitado al grupo "Viaje a la playa"',
      url_destino: '/grupos/10'
    },
    {
      id_usuario: ID_USUARIO,
      tipo_notificacion: 'PAGO_REALIZADO',
      mensaje: 'María realizó un pago de $150.00',
      url_destino: '/grupos/5/pagos'
    },
    {
      id_usuario: ID_USUARIO,
      tipo_notificacion: 'SALDO_CAMBIADO',
      mensaje: 'Tu saldo cambió a -$50.00',
      url_destino: '/grupos/3'
    }
  ];

  let exitos = 0;

  for (const notif of notificaciones) {
    try {
      const { response, data } = await request('', {
        method: 'POST',
        body: JSON.stringify(notif)
      });

      if (data.success) {
        exitos++;
        log(`✓ Notificación "${notif.tipo_notificacion}" creada`, 'green');
      }
    } catch (error) {
      log(`✗ Error al crear "${notif.tipo_notificacion}": ${error.message}`, 'red');
    }
  }

  log(`\nTotal creadas: ${exitos}/${notificaciones.length}`, exitos === notificaciones.length ? 'green' : 'yellow');
  return exitos;
}

async function test10_EliminarNotificacionesLeidas() {
  logTest('10. Eliminar todas las notificaciones leídas');

  try {
    const { response, data } = await request(`/usuario/${ID_USUARIO}/eliminar-leidas`, {
      method: 'DELETE'
    });

    if (data.success) {
      log(`✓ ${data.affectedRows} notificaciones leídas eliminadas`, 'green');
      return true;
    } else {
      log('✗ Error al eliminar notificaciones leídas: ' + data.error, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error en la petición: ' + error.message, 'red');
    return false;
  }
}

async function test11_ValidacionTipoNotificacion() {
  logTest('11. Validación de tipo de notificación inválido');

  const body = {
    id_usuario: ID_USUARIO,
    tipo_notificacion: 'TIPO_INVALIDO',
    mensaje: 'Esta notificación no debería crearse'
  };

  try {
    const { response, data } = await request('', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    if (!data.success) {
      log('✓ La validación funciona correctamente', 'green');
      console.log('Error esperado:', data.error);
      return true;
    } else {
      log('✗ La validación NO está funcionando', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Error en la petición: ' + error.message, 'red');
    return false;
  }
}

// ============================================
// Ejecutar todas las pruebas
// ============================================

async function ejecutarPruebas() {
  console.log('\n');
  log('╔════════════════════════════════════════════════╗', 'cyan');
  log('║   TEST SUITE - MÓDULO DE NOTIFICACIONES       ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  
  log(`\nConfiguración:`, 'yellow');
  log(`• URL Base: ${BASE_URL}`, 'yellow');
  log(`• ID Usuario: ${ID_USUARIO}`, 'yellow');
  log(`• Token: ${TOKEN.substring(0, 20)}...`, 'yellow');

  const resultados = {
    total: 0,
    exitosos: 0,
    fallidos: 0
  };

  // Ejecutar tests secuencialmente
  let idNotificacion = null;

  // Test 1: Crear notificación
  resultados.total++;
  idNotificacion = await test1_CrearNotificacion();
  if (idNotificacion) resultados.exitosos++;
  else resultados.fallidos++;

  await esperar(500);

  // Test 2: Obtener todas
  resultados.total++;
  if (await test2_ObtenerNotificaciones()) resultados.exitosos++;
  else resultados.fallidos++;

  await esperar(500);

  // Test 3: Obtener no leídas
  resultados.total++;
  const countNoLeidas = await test3_ObtenerNoLeidas();
  if (countNoLeidas >= 0) resultados.exitosos++;
  else resultados.fallidos++;

  await esperar(500);

  // Test 4: Contar no leídas
  resultados.total++;
  if (await test4_ContarNoLeidas() >= 0) resultados.exitosos++;
  else resultados.fallidos++;

  await esperar(500);

  // Test 5: Obtener por ID
  resultados.total++;
  if (await test5_ObtenerNotificacionPorId(idNotificacion)) resultados.exitosos++;
  else resultados.fallidos++;

  await esperar(500);

  // Test 6: Marcar como leída
  resultados.total++;
  if (await test6_MarcarComoLeida(idNotificacion)) resultados.exitosos++;
  else resultados.fallidos++;

  await esperar(500);

  // Test 9: Crear múltiples
  resultados.total++;
  if (await test9_CrearNotificacionesMultiples() > 0) resultados.exitosos++;
  else resultados.fallidos++;

  await esperar(500);

  // Test 7: Marcar todas como leídas
  resultados.total++;
  if (await test7_MarcarTodasLeidas()) resultados.exitosos++;
  else resultados.fallidos++;

  await esperar(500);

  // Test 10: Eliminar leídas
  resultados.total++;
  if (await test10_EliminarNotificacionesLeidas()) resultados.exitosos++;
  else resultados.fallidos++;

  await esperar(500);

  // Test 11: Validación
  resultados.total++;
  if (await test11_ValidacionTipoNotificacion()) resultados.exitosos++;
  else resultados.fallidos++;

  await esperar(500);

  // Test 8: Eliminar notificación
  resultados.total++;
  if (await test8_EliminarNotificacion(idNotificacion)) resultados.exitosos++;
  else resultados.fallidos++;

  // Resumen
  console.log('\n');
  log('╔════════════════════════════════════════════════╗', 'cyan');
  log('║              RESUMEN DE PRUEBAS                ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  
  log(`\nTotal de pruebas: ${resultados.total}`, 'cyan');
  log(`Exitosas: ${resultados.exitosos}`, 'green');
  log(`Fallidas: ${resultados.fallidos}`, resultados.fallidos > 0 ? 'red' : 'green');
  
  const porcentaje = ((resultados.exitosos / resultados.total) * 100).toFixed(1);
  log(`\nPorcentaje de éxito: ${porcentaje}%`, porcentaje === '100.0' ? 'green' : 'yellow');

  console.log('\n');
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ejecutar
ejecutarPruebas().catch(error => {
  log('\n✗ Error fatal en las pruebas: ' + error.message, 'red');
  console.error(error);
});
