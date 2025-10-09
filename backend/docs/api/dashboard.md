# 📊 API de Dashboard

## Descripción
El módulo de Dashboard proporciona una vista consolidada de las finanzas del usuario, incluyendo estadísticas, gráficos, listas de cobros/deudas pendientes, actividad reciente y gestión de pagos.

## URL Base
```
/api/dashboard
```

## Autenticación
Todos los endpoints requieren autenticación mediante token JWT:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 📋 Índice
1. [Dashboard Principal](#dashboard-principal)
2. [Actividad](#actividad)
3. [Pagos](#pagos)
4. [Historial de Pagos](#historial-de-pagos)

---

## Dashboard Principal

### Obtener Dashboard Personal
Obtiene un resumen completo del dashboard del usuario con KPIs, gráficos, listas y actividad reciente.

**Endpoint:** `GET /api/dashboard/personal`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta Exitosa (200):**
```json
{
  "mensaje": "Dashboard obtenido correctamente.",
  "kpis": {
    "balanceGeneral": "150.50",
    "totalTeDeben": "250.00",
    "totalQueDebes": "99.50",
    "gastosTotalesMesActual": "450.75"
  },
  "graficos": {
    "gastosPorCategoria": [
      {
        "nombre": "Restaurantes",
        "total": "180.50",
        "porcentaje": "40.0"
      },
      {
        "nombre": "Transporte",
        "total": "120.25",
        "porcentaje": "26.7"
      },
      {
        "nombre": "Entretenimiento",
        "total": "150.00",
        "porcentaje": "33.3"
      }
    ],
    "evolucionGastos": [
      {
        "mes": "2025-07",
        "mesFormateado": "Julio 2025",
        "total": "320.50"
      },
      {
        "mes": "2025-08",
        "mesFormateado": "Agosto 2025",
        "total": "410.25"
      },
      {
        "mes": "2025-09",
        "mesFormateado": "Septiembre 2025",
        "total": "450.75"
      }
    ]
  },
  "listas": {
    "cobrosPendientes": [
      {
        "idUsuarioDeudor": 3,
        "nombreDeudor": "Carlos López",
        "fotoPerfil": "/public/uploads/foto_perfil-123456.jpg",
        "montoTotal": "100.00",
        "montoPagado": "20.00",
        "monto": "80.00",
        "idGasto": 15,
        "descripcionGasto": "Cena en restaurante"
      }
    ],
    "deudasPendientes": [
      {
        "idUsuarioAcreedor": 2,
        "nombreAcreedor": "María García",
        "fotoPerfil": "/public/uploads/foto_perfil-789012.jpg",
        "montoTotal": "50.00",
        "montoPagado": "10.00",
        "monto": "40.00",
        "idGasto": 12,
        "descripcionGasto": "Compras supermercado"
      }
    ]
  },
  "actividadReciente": [
    {
      "tipo": "pago_recibido",
      "mensaje": "Has recibido un pago de $50.00 de Juan Pérez",
      "fecha": "2025-10-08T14:30:00.000Z"
    },
    {
      "tipo": "gasto_creado",
      "mensaje": "Nuevo gasto: Cena - $120.00",
      "fecha": "2025-10-07T18:45:00.000Z"
    }
  ]
}
```

**Descripción de KPIs:**
- **balanceGeneral**: Diferencia entre lo que te deben y lo que debes
- **totalTeDeben**: Total de dinero que otros usuarios te deben
- **totalQueDebes**: Total de dinero que debes a otros usuarios
- **gastosTotalesMesActual**: Suma de todos tus gastos asignados en el mes actual

**Gráficos Disponibles:**
- **gastosPorCategoria**: Distribución de gastos por categoría en el mes actual
- **evolucionGastos**: Evolución de gastos en los últimos 3 meses

**Listas:**
- **cobrosPendientes**: Personas que te deben dinero (incluye pagos parciales)
- **deudasPendientes**: Personas a las que debes dinero (incluye pagos parciales)

**Errores Posibles:**
- `401` - Token no válido o expirado
- `500` - Error interno del servidor

---

## Actividad

### Obtener Actividad Paginada
Obtiene el historial de actividad del usuario con paginación.

**Endpoint:** `GET /api/dashboard/actividad`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Parámetros de Query:**
| Parámetro | Tipo | Requerido | Por Defecto | Descripción |
|-----------|------|-----------|-------------|-------------|
| `pagina` | integer | No | 1 | Número de página (mínimo: 1) |
| `limite` | integer | No | 20 | Elementos por página (1-100) |

**Ejemplo:**
```
GET /api/dashboard/actividad?pagina=1&limite=20
```

**Respuesta Exitosa (200):**
```json
{
  "mensaje": "Actividad obtenida correctamente.",
  "actividad": [
    {
      "tipo": "pago_recibido",
      "mensaje": "Has recibido un pago parcial de $20.00 por \"Cena en restaurante\". Saldo pendiente: $30.00",
      "fecha": "2025-10-08T14:30:00.000Z",
      "url_destino": "/dashboard/gastos/15",
      "leida": 0
    },
    {
      "tipo": "pago_enviado",
      "mensaje": "Has enviado un pago completo de $50.00 por \"Compras supermercado\". Deuda saldada.",
      "fecha": "2025-10-07T10:15:00.000Z",
      "url_destino": "/dashboard/gastos/12",
      "leida": 1
    }
  ],
  "paginacion": {
    "paginaActual": 1,
    "limite": 20,
    "totalRegistros": 45,
    "totalPaginas": 3
  }
}
```

**Tipos de Actividad:**
- `pago_recibido` - Has recibido un pago
- `pago_enviado` - Has enviado un pago
- `gasto_creado` - Se creó un nuevo gasto
- `gasto_editado` - Se editó un gasto
- `usuario_unido` - Un usuario se unió a un grupo
- `cobro_pendiente` - Recordatorio de cobro pendiente

**Errores Posibles:**
- `400` - Parámetros de paginación inválidos
- `401` - Token no válido o expirado
- `500` - Error interno del servidor

---

## Pagos

### Saldar Deuda (Pago Completo o Parcial)
Registra un pago para saldar total o parcialmente una deuda. Soporta pagos parciales incrementales.

**Endpoint:** `POST /api/dashboard/pagos/saldar`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "idGasto": 15,
  "idUsuarioAcreedor": 2,
  "monto": 50.00,
  "metodo": "Transferencia bancaria"
}
```

**Parámetros del Body:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `idGasto` | integer | Sí | ID del gasto a pagar |
| `idUsuarioAcreedor` | integer | Sí | ID del usuario que recibirá el pago |
| `monto` | decimal | Sí | Monto a pagar (debe ser > 0) |
| `metodo` | string | No | Método de pago (default: "Manual") |

**Respuesta Exitosa (200):**

*Pago Completo:*
```json
{
  "mensaje": "Pago completo registrado exitosamente.",
  "pago": {
    "idPago": 123,
    "idGasto": 15,
    "idUsuarioAcreedor": 2,
    "monto": "50.00",
    "tipoPago": "completo",
    "montoTotalDeuda": "50.00",
    "saldoRestante": "0.00",
    "descripcion": "Pago completo - Cena en restaurante (Deuda saldada: $50.00)",
    "fechaPago": "2025-10-08T14:30:00.000Z"
  },
  "notificacionEnviada": true
}
```

*Pago Parcial:*
```json
{
  "mensaje": "Pago parcial registrado exitosamente.",
  "pago": {
    "idPago": 124,
    "idGasto": 15,
    "idUsuarioAcreedor": 2,
    "monto": "20.00",
    "tipoPago": "parcial",
    "montoTotalDeuda": "100.00",
    "saldoRestante": "30.00",
    "descripcion": "Pago parcial - Cena en restaurante (70.0% pagado, resta: $30.00)",
    "fechaPago": "2025-10-08T15:00:00.000Z"
  },
  "notificacionEnviada": true
}
```

**Validaciones:**
- El monto debe ser un número positivo mayor a 0
- El monto no puede exceder el saldo pendiente
- La división de gasto debe existir y pertenecer al usuario
- La deuda no debe estar completamente pagada

**Comportamiento:**
- Si el pago cubre el saldo completo → Se registra como `pago completo`
- Si el pago es menor al saldo → Se registra como `pago parcial`
- Se actualiza `monto_pagado` en la tabla `DIVISIONES_GASTO`
- Se crea una notificación para el usuario acreedor
- Se permite múltiples pagos parciales hasta saldar la deuda

**Errores Posibles:**
- `400` - Datos inválidos o monto excede saldo pendiente
- `401` - Token no válido o expirado
- `404` - División de gasto no encontrada
- `500` - Error interno del servidor

**Ejemplo de Uso - Pagos Parciales:**
```
Deuda total: $100.00
Saldo pendiente: $100.00

Pago 1: $30.00 → Saldo restante: $70.00 (30% pagado)
Pago 2: $50.00 → Saldo restante: $20.00 (80% pagado)
Pago 3: $20.00 → Saldo restante: $0.00 (100% pagado - Deuda saldada)
```

---

## Historial de Pagos

### Obtener Historial de Pagos de un Gasto
Obtiene el historial completo de pagos (completos y parciales) de un gasto específico.

**Endpoint:** `GET /api/dashboard/pagos/historial/:id_gasto`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id_gasto` | integer | ID del gasto |

**Ejemplo:**
```
GET /api/dashboard/pagos/historial/15
```

**Respuesta Exitosa (200):**
```json
{
  "mensaje": "Historial de pagos obtenido correctamente.",
  "idGasto": 15,
  "totalPagos": 3,
  "pagos": [
    {
      "idPago": 126,
      "monto": "20.00",
      "tipoPago": "completo",
      "montoTotalDeuda": "20.00",
      "saldoRestante": "0.00",
      "descripcion": "Pago completo - Cena en restaurante (Deuda saldada: $20.00)",
      "fechaPago": "2025-10-08T16:00:00.000Z",
      "nombreReceptor": "María García",
      "nombrePagador": "Juan Pérez"
    },
    {
      "idPago": 125,
      "monto": "50.00",
      "tipoPago": "parcial",
      "montoTotalDeuda": "100.00",
      "saldoRestante": "20.00",
      "descripcion": "Pago parcial - Cena en restaurante (80.0% pagado, resta: $20.00)",
      "fechaPago": "2025-10-08T15:30:00.000Z",
      "nombreReceptor": "María García",
      "nombrePagador": "Juan Pérez"
    },
    {
      "idPago": 124,
      "monto": "30.00",
      "tipoPago": "parcial",
      "montoTotalDeuda": "100.00",
      "saldoRestante": "70.00",
      "descripcion": "Pago parcial - Cena en restaurante (30.0% pagado, resta: $70.00)",
      "fechaPago": "2025-10-08T14:30:00.000Z",
      "nombreReceptor": "María García",
      "nombrePagador": "Juan Pérez"
    }
  ]
}
```

**Descripción de Campos:**
- **idPago**: Identificador único del pago
- **monto**: Monto pagado en esta transacción
- **tipoPago**: `completo` o `parcial`
- **montoTotalDeuda**: Monto total de la deuda original
- **saldoRestante**: Saldo que quedaba después de este pago
- **descripcion**: Descripción detallada del pago con contexto
- **fechaPago**: Fecha y hora del pago
- **nombreReceptor**: Usuario que recibió el pago
- **nombrePagador**: Usuario que realizó el pago

**Notas:**
- Los pagos se ordenan del más reciente al más antiguo
- Solo se muestran pagos donde el usuario autenticado es pagador o receptor
- Útil para auditar el progreso de pagos parciales

**Errores Posibles:**
- `400` - ID de gasto inválido
- `401` - Token no válido o expirado
- `404` - Gasto no encontrado
- `500` - Error interno del servidor

---

## Casos de Uso Comunes

### 1. Cargar Dashboard al Inicio
```javascript
// GET /api/dashboard/personal
// Obtiene toda la información necesaria en una sola llamada
```

### 2. Pagar una Deuda Parcialmente
```javascript
// POST /api/dashboard/pagos/saldar
{
  "idGasto": 15,
  "idUsuarioAcreedor": 2,
  "monto": 25.50,
  "metodo": "Efectivo"
}
```

### 3. Ver Historial de Pagos de una Deuda
```javascript
// GET /api/dashboard/pagos/historial/15
// Muestra todos los pagos parciales realizados
```

### 4. Cargar Más Actividad
```javascript
// GET /api/dashboard/actividad?pagina=2&limite=20
// Obtiene la siguiente página de actividad
```

---

## Estructura de Base de Datos Relacionada

### Tablas Principales
- **DIVISIONES_GASTO**: Almacena las divisiones de gastos y montos pagados
  - `monto_asignado`: Monto total asignado al usuario
  - `monto_pagado`: Monto acumulado de pagos parciales
  - `pagado`: Flag booleano (1 cuando `monto_pagado >= monto_asignado`)
  
- **PAGOS**: Registra cada transacción de pago
  - `tipo_pago`: `completo` o `parcial`
  - `monto_total_deuda`: Deuda original
  - `saldo_restante`: Saldo después del pago

- **NOTIFICACIONES**: Almacena notificaciones de actividad

### Relaciones
```
USUARIOS (1) ──── (N) PAGOS
GASTOS (1) ──── (N) DIVISIONES_GASTO
GASTOS (1) ──── (N) PAGOS
GRUPOS (1) ──── (N) GASTOS
```

---

## Notas Importantes

### Pagos Parciales
- ✅ Se permite registrar múltiples pagos parciales
- ✅ Cada pago incrementa el campo `monto_pagado`
- ✅ El sistema calcula automáticamente si es pago completo o parcial
- ✅ Se valida que no se exceda el saldo pendiente
- ✅ Cada pago genera una notificación al acreedor

### Precisión Decimal
- Todos los montos se manejan con 2 decimales
- Se usa un margen de error de $0.01 para comparaciones
- Formato: `"150.50"` (string con 2 decimales)

### Rendimiento
- El dashboard principal hace 6 consultas en paralelo
- Uso de callbacks para consolidar respuesta
- Índices recomendados en campos de búsqueda frecuente

### Seguridad
- Autenticación requerida en todos los endpoints
- Validación de pertenencia de gastos al usuario
- Sanitización de entradas numéricas
- Prevención de pagos duplicados

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025  
**Características nuevas**: Soporte completo para pagos parciales incrementales
