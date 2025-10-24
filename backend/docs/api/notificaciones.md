# API de Notificaciones - Documentación Completa

## Descripción General
Esta API permite gestionar las notificaciones de los usuarios en la aplicación Splitease. Incluye operaciones CRUD completas y funcionalidad de notificaciones en tiempo real mediante Server-Sent Events (SSE).

## Base URL
```
/api/notificaciones
```

## Autenticación
Todos los endpoints requieren autenticación mediante token JWT en el header:
```
Authorization: Bearer <token>
```

---

## Tipos de Notificación Válidos

Los siguientes tipos son válidos según el ENUM de la base de datos:
- `INVITACIÓN` - Invitación a un grupo
- `GASTO_AGREGADO` - Se agregó un nuevo gasto
- `PAGO_REALIZADO` - Se realizó un pago
- `SALDO_CAMBIADO` - Cambió el saldo del usuario

---

## Endpoints

### 1. Crear una Nueva Notificación

**POST** `/api/notificaciones`

Crea una nueva notificación para un usuario específico.

#### Request Body
```json
{
  "id_usuario": 5,
  "tipo_notificacion": "GASTO_AGREGADO",
  "mensaje": "Se agregó un nuevo gasto al grupo 'Vacaciones'",
  "url_destino": "/grupos/15/gastos"
}
```

#### Parámetros
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id_usuario | Integer | Sí | ID del usuario que recibirá la notificación |
| tipo_notificacion | String (ENUM) | Sí | Tipo de notificación (INVITACIÓN, GASTO_AGREGADO, PAGO_REALIZADO, SALDO_CAMBIADO) |
| mensaje | String | Sí | Mensaje de la notificación |
| url_destino | String | No | URL de destino al hacer clic en la notificación |

#### Response 201 (Created)
```json
{
  "success": true,
  "message": "Notificación creada exitosamente.",
  "data": {
    "id_notificacion": 1,
    "id_usuario": 5,
    "tipo_notificacion": "GASTO_AGREGADO",
    "mensaje": "Se agregó un nuevo gasto al grupo 'Vacaciones'",
    "fecha_envio": "2025-10-22T10:30:00.000Z",
    "leida": 0,
    "fecha_lectura": null,
    "url_destino": "/grupos/15/gastos"
  }
}
```

#### Response 400 (Bad Request)
```json
{
  "success": false,
  "error": "Los campos id_usuario, tipo_notificacion y mensaje son obligatorios."
}
```

#### Response 500 (Internal Server Error)
```json
{
  "success": false,
  "error": "Error al crear la notificación."
}
```

#### Ejemplo de Uso en Frontend
```javascript
const crearNotificacion = async (idUsuario, tipoNotificacion, mensaje, urlDestino = null) => {
  try {
    const response = await fetch('http://localhost:3100/api/notificaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        id_usuario: idUsuario,
        tipo_notificacion: tipoNotificacion,
        mensaje: mensaje,
        url_destino: urlDestino
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Notificación creada:', data.data);
      return data.data;
    } else {
      console.error('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return null;
  }
};

// Uso:
crearNotificacion(5, 'GASTO_AGREGADO', 'Se agregó un nuevo gasto', '/grupos/15/gastos');
```

---

### 2. Obtener Todas las Notificaciones de un Usuario

**GET** `/api/notificaciones/usuario/:id_usuario`

Obtiene todas las notificaciones de un usuario específico, ordenadas por fecha de envío descendente (más recientes primero).

#### Parámetros de URL
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id_usuario | Integer | ID del usuario |

#### Response 200 (OK)
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id_notificacion": 5,
      "id_usuario": 5,
      "tipo_notificacion": "PAGO_REALIZADO",
      "mensaje": "Juan realizó un pago de $50.00",
      "fecha_envio": "2025-10-22T15:45:00.000Z",
      "leida": 0,
      "fecha_lectura": null,
      "url_destino": "/grupos/15/pagos"
    },
    {
      "id_notificacion": 4,
      "id_usuario": 5,
      "tipo_notificacion": "GASTO_AGREGADO",
      "mensaje": "Se agregó un nuevo gasto al grupo 'Vacaciones'",
      "fecha_envio": "2025-10-22T10:30:00.000Z",
      "leida": 1,
      "fecha_lectura": "2025-10-22T12:00:00.000Z",
      "url_destino": "/grupos/15/gastos"
    }
  ]
}
```

#### Response 400 (Bad Request)
```json
{
  "success": false,
  "error": "El id_usuario debe ser un número válido."
}
```

#### Ejemplo de Uso en Frontend
```javascript
const obtenerNotificaciones = async (idUsuario) => {
  try {
    const response = await fetch(`http://localhost:3100/api/notificaciones/usuario/${idUsuario}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`Total de notificaciones: ${data.count}`);
      return data.data;
    } else {
      console.error('Error:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
};

// Uso:
const notificaciones = await obtenerNotificaciones(5);
```

---

### 3. Obtener Notificaciones No Leídas de un Usuario

**GET** `/api/notificaciones/usuario/:id_usuario/no-leidas`

Obtiene solo las notificaciones no leídas (leida = 0) de un usuario, ordenadas por fecha de envío descendente.

#### Parámetros de URL
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id_usuario | Integer | ID del usuario |

#### Response 200 (OK)
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id_notificacion": 5,
      "id_usuario": 5,
      "tipo_notificacion": "PAGO_REALIZADO",
      "mensaje": "Juan realizó un pago de $50.00",
      "fecha_envio": "2025-10-22T15:45:00.000Z",
      "leida": 0,
      "fecha_lectura": null,
      "url_destino": "/grupos/15/pagos"
    },
    {
      "id_notificacion": 3,
      "id_usuario": 5,
      "tipo_notificacion": "INVITACIÓN",
      "mensaje": "Te han invitado al grupo 'Cena de amigos'",
      "fecha_envio": "2025-10-22T09:15:00.000Z",
      "leida": 0,
      "fecha_lectura": null,
      "url_destino": "/grupos/20"
    }
  ]
}
```

#### Ejemplo de Uso en Frontend
```javascript
const obtenerNotificacionesNoLeidas = async (idUsuario) => {
  try {
    const response = await fetch(`http://localhost:3100/api/notificaciones/usuario/${idUsuario}/no-leidas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`Notificaciones no leídas: ${data.count}`);
      return data.data;
    } else {
      console.error('Error:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    return [];
  }
};

// Uso:
const noLeidas = await obtenerNotificacionesNoLeidas(5);
```

---

### 4. Contar Notificaciones No Leídas

**GET** `/api/notificaciones/usuario/:id_usuario/count`

Obtiene el número total de notificaciones no leídas de un usuario. Útil para mostrar un badge en el frontend.

#### Parámetros de URL
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id_usuario | Integer | ID del usuario |

#### Response 200 (OK)
```json
{
  "success": true,
  "total": 3
}
```

#### Ejemplo de Uso en Frontend
```javascript
const contarNotificacionesNoLeidas = async (idUsuario) => {
  try {
    const response = await fetch(`http://localhost:3100/api/notificaciones/usuario/${idUsuario}/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return data.total;
    } else {
      console.error('Error:', data.error);
      return 0;
    }
  } catch (error) {
    console.error('Error al contar notificaciones no leídas:', error);
    return 0;
  }
};

// Uso: Actualizar badge en el componente
const actualizarBadge = async () => {
  const total = await contarNotificacionesNoLeidas(5);
  document.getElementById('notif-badge').textContent = total;
};
```

---

### 5. Obtener una Notificación Específica

**GET** `/api/notificaciones/:id_notificacion`

Obtiene los detalles de una notificación específica por su ID.

#### Parámetros de URL
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id_notificacion | Integer | ID de la notificación |

#### Response 200 (OK)
```json
{
  "success": true,
  "data": {
    "id_notificacion": 5,
    "id_usuario": 5,
    "tipo_notificacion": "PAGO_REALIZADO",
    "mensaje": "Juan realizó un pago de $50.00",
    "fecha_envio": "2025-10-22T15:45:00.000Z",
    "leida": 0,
    "fecha_lectura": null,
    "url_destino": "/grupos/15/pagos"
  }
}
```

#### Response 404 (Not Found)
```json
{
  "success": false,
  "error": "Notificación no encontrada."
}
```

#### Ejemplo de Uso en Frontend
```javascript
const obtenerNotificacion = async (idNotificacion) => {
  try {
    const response = await fetch(`http://localhost:3100/api/notificaciones/${idNotificacion}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error al obtener notificación:', error);
    return null;
  }
};

// Uso:
const notificacion = await obtenerNotificacion(5);
```

---

### 6. Marcar Notificación como Leída

**PUT** `/api/notificaciones/:id_notificacion/marcar-leida`

Marca una notificación específica como leída (leida = 1) y establece la fecha de lectura actual.

#### Parámetros de URL
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id_notificacion | Integer | ID de la notificación |

#### Response 200 (OK)
```json
{
  "success": true,
  "message": "Notificación marcada como leída exitosamente.",
  "data": {
    "id_notificacion": 5,
    "id_usuario": 5,
    "tipo_notificacion": "PAGO_REALIZADO",
    "mensaje": "Juan realizó un pago de $50.00",
    "fecha_envio": "2025-10-22T15:45:00.000Z",
    "leida": 1,
    "fecha_lectura": "2025-10-22T16:00:00.000Z",
    "url_destino": "/grupos/15/pagos"
  }
}
```

#### Response 404 (Not Found)
```json
{
  "success": false,
  "error": "Notificación no encontrada."
}
```

#### Ejemplo de Uso en Frontend
```javascript
const marcarComoLeida = async (idNotificacion) => {
  try {
    const response = await fetch(`http://localhost:3100/api/notificaciones/${idNotificacion}/marcar-leida`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Notificación marcada como leída');
      return data.data;
    } else {
      console.error('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return null;
  }
};

// Uso: Marcar como leída al hacer clic
const handleNotificationClick = async (idNotificacion, urlDestino) => {
  await marcarComoLeida(idNotificacion);
  window.location.href = urlDestino;
};
```

---

### 7. Marcar Todas las Notificaciones como Leídas

**PUT** `/api/notificaciones/usuario/:id_usuario/marcar-todas-leidas`

Marca todas las notificaciones no leídas de un usuario como leídas.

#### Parámetros de URL
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id_usuario | Integer | ID del usuario |

#### Response 200 (OK)
```json
{
  "success": true,
  "message": "Todas las notificaciones fueron marcadas como leídas exitosamente.",
  "affectedRows": 3
}
```

#### Ejemplo de Uso en Frontend
```javascript
const marcarTodasComoLeidas = async (idUsuario) => {
  try {
    const response = await fetch(`http://localhost:3100/api/notificaciones/usuario/${idUsuario}/marcar-todas-leidas`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`Se marcaron ${data.affectedRows} notificaciones como leídas`);
      return true;
    } else {
      console.error('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    return false;
  }
};

// Uso: Botón "Marcar todas como leídas"
document.getElementById('mark-all-read').addEventListener('click', async () => {
  const success = await marcarTodasComoLeidas(5);
  if (success) {
    // Actualizar UI
    location.reload();
  }
});
```

---

### 8. Eliminar una Notificación Específica

**DELETE** `/api/notificaciones/:id_notificacion`

Elimina una notificación específica de la base de datos.

#### Parámetros de URL
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id_notificacion | Integer | ID de la notificación |

#### Response 200 (OK)
```json
{
  "success": true,
  "message": "Notificación eliminada exitosamente."
}
```

#### Response 404 (Not Found)
```json
{
  "success": false,
  "error": "Notificación no encontrada."
}
```

#### Ejemplo de Uso en Frontend
```javascript
const eliminarNotificacion = async (idNotificacion) => {
  try {
    const response = await fetch(`http://localhost:3100/api/notificaciones/${idNotificacion}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Notificación eliminada');
      return true;
    } else {
      console.error('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return false;
  }
};

// Uso: Botón eliminar
const handleDelete = async (idNotificacion) => {
  if (confirm('¿Estás seguro de eliminar esta notificación?')) {
    const success = await eliminarNotificacion(idNotificacion);
    if (success) {
      // Remover del DOM
      document.getElementById(`notif-${idNotificacion}`).remove();
    }
  }
};
```

---

### 9. Eliminar Todas las Notificaciones Leídas

**DELETE** `/api/notificaciones/usuario/:id_usuario/eliminar-leidas`

Elimina todas las notificaciones leídas de un usuario específico.

#### Parámetros de URL
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id_usuario | Integer | ID del usuario |

#### Response 200 (OK)
```json
{
  "success": true,
  "message": "Notificaciones leídas eliminadas exitosamente.",
  "affectedRows": 5
}
```

#### Ejemplo de Uso en Frontend
```javascript
const eliminarNotificacionesLeidas = async (idUsuario) => {
  try {
    const response = await fetch(`http://localhost:3100/api/notificaciones/usuario/${idUsuario}/eliminar-leidas`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`Se eliminaron ${data.affectedRows} notificaciones leídas`);
      return true;
    } else {
      console.error('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error al eliminar notificaciones leídas:', error);
    return false;
  }
};

// Uso: Botón "Limpiar notificaciones leídas"
document.getElementById('clear-read').addEventListener('click', async () => {
  if (confirm('¿Eliminar todas las notificaciones leídas?')) {
    const success = await eliminarNotificacionesLeidas(5);
    if (success) {
      location.reload();
    }
  }
});
```

---

### 10. Stream de Notificaciones en Tiempo Real (SSE)

**GET** `/api/notificaciones/usuario/:id_usuario/stream`

Establece una conexión de Server-Sent Events (SSE) para recibir notificaciones en tiempo real. El servidor envía actualizaciones cada 10 segundos con las notificaciones no leídas del usuario.

#### Parámetros de URL
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id_usuario | Integer | ID del usuario |

#### Response (Event Stream)
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

#### Formato de Eventos
```
data: {"type":"notificaciones","count":2,"data":[{...}]}

```

#### Ejemplo de Uso en Frontend
```javascript
class NotificationService {
  constructor(idUsuario) {
    this.idUsuario = idUsuario;
    this.eventSource = null;
    this.onNotification = null;
  }

  // Iniciar la conexión SSE
  connect() {
    const token = localStorage.getItem('token');
    const url = `http://localhost:3100/api/notificaciones/usuario/${this.idUsuario}/stream`;
    
    this.eventSource = new EventSource(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notificaciones' && this.onNotification) {
          this.onNotification(data.data, data.count);
        }
      } catch (error) {
        console.error('Error al procesar notificación:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('Error en SSE:', error);
      this.disconnect();
      
      // Reintentar conexión después de 5 segundos
      setTimeout(() => this.connect(), 5000);
    };

    console.log('Conexión SSE establecida');
  }

  // Desconectar
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('Conexión SSE cerrada');
    }
  }

  // Establecer callback para nuevas notificaciones
  setOnNotification(callback) {
    this.onNotification = callback;
  }
}

// Uso en un componente React
import { useEffect, useState } from 'react';

function NotificationComponent({ idUsuario }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const service = new NotificationService(idUsuario);
    
    service.setOnNotification((notificaciones, count) => {
      setNotificaciones(notificaciones);
      setCount(count);
      
      // Mostrar notificación de navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        if (notificaciones.length > 0) {
          const ultimaNotif = notificaciones[0];
          new Notification('Nueva notificación', {
            body: ultimaNotif.mensaje,
            icon: '/icon-notification.png'
          });
        }
      }
    });

    service.connect();

    // Cleanup al desmontar
    return () => {
      service.disconnect();
    };
  }, [idUsuario]);

  return (
    <div>
      <div className="notification-badge">{count}</div>
      <ul>
        {notificaciones.map(notif => (
          <li key={notif.id_notificacion}>
            {notif.mensaje}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Uso en JavaScript Vanilla
const notificationService = new NotificationService(5);

notificationService.setOnNotification((notificaciones, count) => {
  // Actualizar badge
  document.getElementById('notif-badge').textContent = count;
  
  // Actualizar lista de notificaciones
  const lista = document.getElementById('notif-list');
  lista.innerHTML = '';
  
  notificaciones.forEach(notif => {
    const li = document.createElement('li');
    li.textContent = notif.mensaje;
    lista.appendChild(li);
  });
});

notificationService.connect();

// Desconectar al cerrar sesión o salir de la página
window.addEventListener('beforeunload', () => {
  notificationService.disconnect();
});
```

---

## Ejemplos Completos de Integración

### Componente React Completo de Notificaciones

```jsx
import React, { useState, useEffect } from 'react';
import './Notificaciones.css';

const API_BASE_URL = 'http://localhost:3100/api';

const Notificaciones = ({ idUsuario }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);

  const token = localStorage.getItem('token');

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notificaciones/usuario/${idUsuario}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setNotificaciones(data.data);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  // Contar no leídas
  const contarNoLeidas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notificaciones/usuario/${idUsuario}/count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setNoLeidas(data.total);
      }
    } catch (error) {
      console.error('Error al contar no leídas:', error);
    }
  };

  // Marcar como leída y navegar
  const handleClick = async (notificacion) => {
    if (!notificacion.leida) {
      try {
        await fetch(`${API_BASE_URL}/notificaciones/${notificacion.id_notificacion}/marcar-leida`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Actualizar estado local
        setNotificaciones(prev =>
          prev.map(n =>
            n.id_notificacion === notificacion.id_notificacion
              ? { ...n, leida: 1 }
              : n
          )
        );
        
        contarNoLeidas();
      } catch (error) {
        console.error('Error al marcar como leída:', error);
      }
    }

    if (notificacion.url_destino) {
      window.location.href = notificacion.url_destino;
    }
  };

  // Marcar todas como leídas
  const marcarTodasLeidas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notificaciones/usuario/${idUsuario}/marcar-todas-leidas`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotificaciones(prev =>
          prev.map(n => ({ ...n, leida: 1 }))
        );
        setNoLeidas(0);
      }
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  // Eliminar notificación
  const eliminarNotificacion = async (idNotificacion) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notificaciones/${idNotificacion}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotificaciones(prev =>
          prev.filter(n => n.id_notificacion !== idNotificacion)
        );
        contarNoLeidas();
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarNotificaciones();
    contarNoLeidas();
  }, [idUsuario]);

  // Actualizar periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      contarNoLeidas();
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [idUsuario]);

  return (
    <div className="notificaciones-container">
      <button
        className="notificaciones-btn"
        onClick={() => setMostrar(!mostrar)}
      >
        🔔
        {noLeidas > 0 && <span className="badge">{noLeidas}</span>}
      </button>

      {mostrar && (
        <div className="notificaciones-panel">
          <div className="notificaciones-header">
            <h3>Notificaciones</h3>
            {noLeidas > 0 && (
              <button onClick={marcarTodasLeidas} className="btn-small">
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notificaciones-lista">
            {cargando ? (
              <p>Cargando...</p>
            ) : notificaciones.length === 0 ? (
              <p className="sin-notificaciones">No tienes notificaciones</p>
            ) : (
              notificaciones.map(notif => (
                <div
                  key={notif.id_notificacion}
                  className={`notificacion-item ${!notif.leida ? 'no-leida' : ''}`}
                >
                  <div
                    className="notificacion-contenido"
                    onClick={() => handleClick(notif)}
                  >
                    <div className="notificacion-tipo">
                      {notif.tipo_notificacion === 'INVITACIÓN' && '📨'}
                      {notif.tipo_notificacion === 'GASTO_AGREGADO' && '💰'}
                      {notif.tipo_notificacion === 'PAGO_REALIZADO' && '✅'}
                      {notif.tipo_notificacion === 'SALDO_CAMBIADO' && '📊'}
                    </div>
                    <div className="notificacion-texto">
                      <p>{notif.mensaje}</p>
                      <small>
                        {new Date(notif.fecha_envio).toLocaleString()}
                      </small>
                    </div>
                  </div>
                  <button
                    className="btn-eliminar"
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarNotificacion(notif.id_notificacion);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificaciones;
```

### Utilidad Helper para Crear Notificaciones

```javascript
// utils/notificationHelper.js

const API_BASE_URL = 'http://localhost:3100/api';

/**
 * Helper para crear notificaciones fácilmente desde cualquier parte del código
 */
class NotificationHelper {
  
  /**
   * Notificar a un usuario sobre una invitación a grupo
   */
  static async notificarInvitacion(idUsuario, nombreGrupo, idGrupo) {
    return await this.crearNotificacion(
      idUsuario,
      'INVITACIÓN',
      `Te han invitado al grupo '${nombreGrupo}'`,
      `/grupos/${idGrupo}`
    );
  }

  /**
   * Notificar sobre un nuevo gasto agregado
   */
  static async notificarGastoAgregado(idUsuario, nombreGrupo, idGrupo, nombreGasto) {
    return await this.crearNotificacion(
      idUsuario,
      'GASTO_AGREGADO',
      `Se agregó el gasto '${nombreGasto}' al grupo '${nombreGrupo}'`,
      `/grupos/${idGrupo}/gastos`
    );
  }

  /**
   * Notificar sobre un pago realizado
   */
  static async notificarPagoRealizado(idUsuario, nombreUsuarioPago, monto, nombreGrupo, idGrupo) {
    return await this.crearNotificacion(
      idUsuario,
      'PAGO_REALIZADO',
      `${nombreUsuarioPago} realizó un pago de $${monto.toFixed(2)} en '${nombreGrupo}'`,
      `/grupos/${idGrupo}/pagos`
    );
  }

  /**
   * Notificar sobre cambio de saldo
   */
  static async notificarSaldoCambiado(idUsuario, nuevoSaldo, nombreGrupo, idGrupo) {
    const mensaje = nuevoSaldo >= 0
      ? `Tu saldo en '${nombreGrupo}' es ahora de +$${nuevoSaldo.toFixed(2)}`
      : `Debes $${Math.abs(nuevoSaldo).toFixed(2)} en '${nombreGrupo}'`;

    return await this.crearNotificacion(
      idUsuario,
      'SALDO_CAMBIADO',
      mensaje,
      `/grupos/${idGrupo}`
    );
  }

  /**
   * Método base para crear una notificación
   */
  static async crearNotificacion(idUsuario, tipoNotificacion, mensaje, urlDestino = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/notificaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id_usuario: idUsuario,
          tipo_notificacion: tipoNotificacion,
          mensaje: mensaje,
          url_destino: urlDestino
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Notificación creada:', data.data);
        return data.data;
      } else {
        console.error('Error al crear notificación:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error al crear notificación:', error);
      return null;
    }
  }

  /**
   * Notificar a múltiples usuarios
   */
  static async notificarMultiplesUsuarios(idsUsuarios, tipoNotificacion, mensaje, urlDestino = null) {
    const promesas = idsUsuarios.map(idUsuario =>
      this.crearNotificacion(idUsuario, tipoNotificacion, mensaje, urlDestino)
    );

    return await Promise.all(promesas);
  }
}

export default NotificationHelper;

// Ejemplo de uso:
// import NotificationHelper from './utils/notificationHelper';
//
// // Al crear un gasto, notificar a todos los participantes
// const participantes = [5, 7, 12, 15];
// await NotificationHelper.notificarMultiplesUsuarios(
//   participantes,
//   'GASTO_AGREGADO',
//   'Se agregó un nuevo gasto al grupo Vacaciones',
//   '/grupos/20/gastos'
// );
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos o faltantes |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## Notas Importantes

1. **Autenticación**: Todos los endpoints requieren un token JWT válido.

2. **Seguridad**: 
   - Todas las consultas usan parámetros preparados para prevenir SQL injection.
   - Los datos de entrada son validados y sanitizados.

3. **Formato de Fechas**: 
   - Las fechas se devuelven en formato ISO 8601 (UTC).
   - Ejemplo: `"2025-10-22T10:30:00.000Z"`

4. **Valores Booleanos**:
   - `leida`: 0 = no leída, 1 = leída
   - Se almacena como `TINYINT(1)` en MySQL

5. **SSE (Server-Sent Events)**:
   - La conexión se mantiene abierta.
   - El servidor envía actualizaciones cada 10 segundos.
   - Se recomienda implementar reconexión automática en caso de error.

6. **Notificaciones del Navegador**:
   - Para mostrar notificaciones del navegador, solicita permiso primero:
   ```javascript
   if ('Notification' in window && Notification.permission !== 'granted') {
     Notification.requestPermission();
   }
   ```

7. **Performance**:
   - El endpoint `/count` es más ligero que obtener todas las notificaciones.
   - Úsalo para actualizar badges sin traer toda la data.

8. **Limpieza de Datos**:
   - Considera implementar un job que elimine notificaciones antiguas automáticamente.
   - O proporciona una función para que el usuario elimine notificaciones leídas.

---

## Testing con cURL

### Crear notificación
```bash
curl -X POST http://localhost:3100/api/notificaciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"id_usuario":5,"tipo_notificacion":"GASTO_AGREGADO","mensaje":"Test","url_destino":"/test"}'
```

### Obtener notificaciones
```bash
curl -X GET http://localhost:3100/api/notificaciones/usuario/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Marcar como leída
```bash
curl -X PUT http://localhost:3100/api/notificaciones/1/marcar-leida \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Eliminar notificación
```bash
curl -X DELETE http://localhost:3100/api/notificaciones/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Soporte

Para más información sobre la implementación, consulta:
- Backend: `/backend/controllers/notificacionesController.js`
- Modelos: `/backend/models/notificacionModel.js`
- Rutas: `/backend/routes/notificaciones.js`
