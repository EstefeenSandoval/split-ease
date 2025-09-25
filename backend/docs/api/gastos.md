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
  "moneda": "MXN"
}
```

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
Marca la división del usuario autenticado como pagada.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Marcado como pagado correctamente."
}
```

## Códigos de Error Comunes

- **400 Bad Request**: Datos inválidos o faltantes
- **401 Unauthorized**: Token inválido o faltante
- **403 Forbidden**: No tienes permisos para realizar esta acción
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Recurso ya existe (ej: categoría duplicada)
- **500 Internal Server Error**: Error interno del servidor

## Notas Importantes

1. **Autenticación**: Todos los endpoints requieren un token JWT válido.
2. **Permisos**: Solo los miembros activos de un grupo pueden ver y crear gastos en ese grupo.
3. **Divisiones**: Los gastos se dividen automáticamente entre los participantes especificados.
4. **Tipos de División**:
   - `equitativa`: El monto se divide igualmente entre todos los participantes
   - `monto_fijo`: Cada participante paga un monto específico
5. **Monedas**: Por defecto se usa 'MXN', pero se puede especificar otra moneda.
6. **Estados**: Los gastos pueden estar en estado 'pendiente', 'confirmado' o 'cancelado'.

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