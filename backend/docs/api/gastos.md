# API de Gastos - Split Ease

## Descripción
Esta API permite gestionar gastos y categorías dentro de los grupos de Split Ease. Los usuarios pueden crear, ver, editar y eliminar gastos, así como manejar sus divisiones entre participantes.

## Endpoints Disponibles

### Categorías

#### `GET /api/gastos/categorias`
Obtiene todas las categorías disponibles para clasificar gastos.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Categorías obtenidas correctamente.",
  "categorias": [
    {
      "id_categoria": 1,
      "nombre": "Comida",
      "descripcion": "Gastos relacionados con alimentos y restaurantes"
    }
  ]
}
```

#### `POST /api/gastos/categorias`
Crea una nueva categoría de gastos.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre": "Nueva Categoría",
  "descripcion": "Descripción opcional"
}
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Categoría creada correctamente.",
  "id_categoria": 11
}
```

### Gastos

#### `POST /api/gastos`
Crea un nuevo gasto en un grupo.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_grupo": 1,
  "descripcion": "Cena en restaurante",
  "monto_total": 120.50,
  "id_categoria": 1,
  "fecha_gasto": "2025-09-24T19:30:00Z",
  "participantes": [1, 2, 3],
  "tipo_division": "equitativa",
  "id_pagador": 1,
  "moneda": "MXN"
}
```

**Nota:** El campo `id_pagador` es opcional. Si no se especifica, el pagador será el usuario autenticado que realiza la petición. El pagador debe ser un miembro activo del grupo.

**Para división personalizada:**
```json
{
  "id_grupo": 1,
  "descripcion": "Cena en restaurante",
  "monto_total": 120.50,
  "id_categoria": 1,
  "fecha_gasto": "2025-09-24T19:30:00Z",
  "participantes": [1, 2, 3],
  "tipo_division": "monto_fijo",
  "id_pagador": 1,
  "montos_personalizados": [
    {"id_usuario": 1, "monto": 50.00},
    {"id_usuario": 2, "monto": 30.50},
    {"id_usuario": 3, "monto": 40.00}
  ],
  "moneda": "MXN"
}
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Gasto creado correctamente.",
  "id_gasto": 123
}
```

#### `GET /api/gastos/grupo/:id_grupo`
Obtiene todos los gastos de un grupo específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Gastos obtenidos correctamente.",
  "gastos": [
    {
      "id_gasto": 1,
      "descripcion": "Cena en restaurante",
      "monto_total": 120.50,
      "fecha_gasto": "2025-09-24T19:30:00Z",
      "fecha_registro": "2025-09-24T20:00:00Z",
      "estado": "pendiente",
      "moneda": "MXN",
      "nombre_pagador": "Juan Pérez",
      "id_pagador": 1,
      "categoria": "Comida",
      "id_categoria": 1
    }
  ]
}
```

#### `GET /api/gastos/:id_gasto`
Obtiene el detalle completo de un gasto específico, incluyendo sus divisiones.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Detalle de gasto obtenido correctamente.",
  "gasto": {
    "id_gasto": 1,
    "id_grupo": 1,
    "descripcion": "Cena en restaurante",
    "monto_total": 120.50,
    "fecha_gasto": "2025-09-24T19:30:00Z",
    "fecha_registro": "2025-09-24T20:00:00Z",
    "estado": "pendiente",
    "moneda": "MXN",
    "nombre_pagador": "Juan Pérez",
    "id_pagador": 1,
    "categoria": "Comida",
    "id_categoria": 1,
    "divisiones": [
      {
        "id_gasto": 1,
        "id_usuario": 1,
        "monto_asignado": 40.17,
        "pagado": 1,
        "fecha_pago": "2025-09-24T20:30:00Z",
        "tipo_division": "equitativa",
        "nombre_usuario": "Juan Pérez"
      },
      {
        "id_gasto": 1,
        "id_usuario": 2,
        "monto_asignado": 40.17,
        "pagado": 0,
        "fecha_pago": null,
        "tipo_division": "equitativa",
        "nombre_usuario": "María García"
      }
    ]
  }
}
```

#### `PUT /api/gastos/:id_gasto`
Actualiza un gasto existente. Solo el pagador puede editar el gasto.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "descripcion": "Cena en restaurante italiano",
  "monto_total": 150.00,
  "id_categoria": 1,
  "fecha_gasto": "2025-09-24T19:30:00Z"
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Gasto actualizado correctamente."
}
```

#### `DELETE /api/gastos/:id_gasto`
Elimina un gasto. Solo el pagador puede eliminar el gasto.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Gasto eliminado correctamente."
}
```

#### `PUT /api/gastos/:id_gasto/pagar`
Marca la división del usuario autenticado como completamente pagada.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (Vacío)

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Marcado como pagado correctamente."
}
```

**Notas:**
- Este endpoint marca la DIVISIÓN COMPLETA del usuario como pagada.
- El pagador tiene su división marcada automáticamente como pagada al crear el gasto.
- Cuando TODAS las divisiones están pagadas, el estado del gasto cambia automáticamente a "confirmado".

---

### Pagos Parciales

#### `POST /api/gastos/:id_gasto/pago-parcial`
Registra un pago parcial entre usuarios. Útil para pagos progresivos en lugar de marcar una división como completamente pagada.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_usuario_receptor": 2,
  "monto": 50.00
}
```

**Parámetros:**
- `id_gasto`: ID del gasto (en la URL)
- `id_usuario_receptor`: ID del usuario que recibe el pago
- `monto`: Cantidad a pagar (debe ser un número positivo)

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Pago parcial registrado correctamente.",
  "id_pago": 5
}
```

**Ejemplo de Casos de Uso:**
1. **Gasto de 300 MXN entre 3 personas (100 c/u)**
   - Usuario 1 (pagador) ya está pagado (100 MXN) automáticamente
   - Usuario 2 puede hacer un pago parcial de 50 MXN al pagador
   - Luego hacer otro pago parcial de 50 MXN para completar su deuda
   - Usuario 3 hace un pago de 100 MXN de una sola vez

#### `GET /api/gastos/:id_gasto/pagos`
Obtiene todos los pagos parciales realizados para un gasto específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Pagos obtenidos correctamente.",
  "pagos": [
    {
      "id_pago": 1,
      "id_usuario_pagador": 2,
      "id_usuario_receptor": 1,
      "monto": 50.00,
      "fecha_pago": "2025-09-25T14:30:00Z",
      "descripcion": "Pago parcial para gasto: Cena en restaurante",
      "nombre_pagador": "María García",
      "nombre_receptor": "Juan Pérez"
    },
    {
      "id_pago": 2,
      "id_usuario_pagador": 3,
      "id_usuario_receptor": 1,
      "monto": 100.00,
      "fecha_pago": "2025-09-26T15:00:00Z",
      "descripcion": "Pago parcial para gasto: Cena en restaurante",
      "nombre_pagador": "Pedro López",
      "nombre_receptor": "Juan Pérez"
    }
  ]
}
```

#### `GET /api/gastos/grupo/:id_grupo/pagos-pendientes`
Obtiene todos los pagos (realizados y pendientes) del usuario autenticado en un grupo específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Pagos obtenidos correctamente.",
  "pagos": [
    {
      "id_pago": 1,
      "id_usuario_pagador": 2,
      "id_usuario_receptor": 1,
      "id_gasto": 5,
      "monto": 50.00,
      "fecha_pago": "2025-09-25T14:30:00Z",
      "descripcion": "Pago parcial para gasto: Cena en restaurante",
      "nombre_pagador": "María García",
      "nombre_receptor": "Juan Pérez"
    }
  ]
}
```

---



- **400 Bad Request**: Datos inválidos o faltantes
- **401 Unauthorized**: Token inválido o faltante
- **403 Forbidden**: No tienes permisos para realizar esta acción
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Recurso ya existe (ej: categoría duplicada)
- **500 Internal Server Error**: Error interno del servidor

### Ejemplos de Prueba en Postman

#### 1. Pago Completo
```json
PUT /api/gastos/5/pagar
Headers: Authorization: Bearer <token>
Body: (Vacío)
```

#### 2. Pago Parcial
```json
POST /api/gastos/5/pago-parcial
Headers: Authorization: Bearer <token>
Body:
{
  "id_usuario_receptor": 1,
  "monto": 50.00
}
```

#### 3. Ver Pagos de un Gasto
```json
GET /api/gastos/5/pagos
Headers: Authorization: Bearer <token>
```

#### 4. Ver Pagos del Usuario en un Grupo
```json
GET /api/gastos/grupo/1/pagos-pendientes
Headers: Authorization: Bearer <token>
```

---

## Notas Importantes

1. **Autenticación**: Todos los endpoints requieren un token JWT válido.
2. **Permisos**: Solo los miembros activos de un grupo pueden ver y crear gastos en ese grupo.
3. **Divisiones**: Los gastos se dividen automáticamente entre los participantes especificados.
4. **Tipos de División**:
   - `equitativa`: El monto se divide igualmente entre todos los participantes
   - `monto_fijo`: Cada participante paga un monto específico
5. **Monedas**: Por defecto se usa 'MXN', pero se puede especificar otra moneda.
6. **Estados**: Los gastos pueden estar en estado 'pendiente', 'confirmado' o 'cancelado'.
7. **Pagos Parciales vs División Completa**:
   - **Marcar como Pagado** (`PUT /api/gastos/:id_gasto/pagar`): Marca la división completa del usuario como pagada de una sola vez.
   - **Pago Parcial** (`POST /api/gastos/:id_gasto/pago-parcial`): Registra pagos incrementales. Útil para usuarios que pagan poco a poco.
8. **Sistema de Pagos**: 
   - Los pagos parciales se registran en la tabla PAGOS como un historial de transacciones.
   - No afectan automáticamente el estado de las divisiones, son solo registros de movimientos de dinero.
   - El usuario puede usar pagos parciales para documentar cada transferencia o puede usar "Marcar como Pagado" cuando termina de pagar su deuda completa.

## Categorías Predefinidas

El sistema incluye las siguientes categorías por defecto:
- Comida
- Transporte  
- Entretenimiento
- Vivienda
- Compras
- Salud
- Educación
- Viajes
- Servicios
- Otros