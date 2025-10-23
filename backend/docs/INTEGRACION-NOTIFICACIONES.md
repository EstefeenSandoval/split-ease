# Guía de Integración - Módulo de Notificaciones

## 🚀 Inicio Rápido

El módulo de notificaciones ya está integrado en tu backend. Los archivos creados son:

```
backend/
├── models/
│   └── notificacionModel.js          # Consultas a la base de datos
├── controllers/
│   └── notificacionesController.js   # Lógica de negocio
├── routes/
│   └── notificaciones.js             # Definición de rutas
└── docs/
    └── api/
        └── notificaciones.md         # Documentación completa
```

## 📋 Checklist de Implementación

### 1. Verificar la Base de Datos

Asegúrate de que la tabla `NOTIFICACIONES` existe en tu base de datos:

```sql
CREATE TABLE IF NOT EXISTS NOTIFICACIONES (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo_notificacion ENUM('INVITACIÓN', 'GASTO_AGREGADO', 'PAGO_REALIZADO', 'SALDO_CAMBIADO') NOT NULL,
  mensaje TEXT NOT NULL,
  fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  fecha_lectura DATETIME,
  url_destino VARCHAR(255),
  CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario)
    REFERENCES USUARIOS(id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_usuario_leida (id_usuario, leida),
  INDEX idx_fecha_envio (fecha_envio)
);
```

### 2. Reiniciar el Servidor Backend

El módulo ya está registrado en `index.js`. Solo necesitas reiniciar el servidor:

```bash
cd backend
npm start
```

### 3. Probar los Endpoints

Usa el siguiente script de prueba o herramientas como Postman/Thunder Client:

```javascript
// test-notificaciones.js
const BASE_URL = 'http://localhost:3100/api/notificaciones';
const TOKEN = 'tu-token-jwt-aqui';

async function testNotificaciones() {
  // 1. Crear notificación
  const crearResponse = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      id_usuario: 5,
      tipo_notificacion: 'GASTO_AGREGADO',
      mensaje: 'Prueba de notificación',
      url_destino: '/grupos/1'
    })
  });
  
  const notifCreada = await crearResponse.json();
  console.log('Notificación creada:', notifCreada);

  // 2. Obtener notificaciones
  const obtenerResponse = await fetch(`${BASE_URL}/usuario/5`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  
  const notificaciones = await obtenerResponse.json();
  console.log('Notificaciones:', notificaciones);

  // 3. Marcar como leída
  if (notifCreada.success) {
    const marcarResponse = await fetch(
      `${BASE_URL}/${notifCreada.data.id_notificacion}/marcar-leida`,
      {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      }
    );
    
    const resultado = await marcarResponse.json();
    console.log('Marcada como leída:', resultado);
  }
}

testNotificaciones();
```

## 🎨 Integración en el Frontend

### Opción 1: Componente React Funcional

Crea un componente `NotificationBell.js`:

```jsx
import React, { useState, useEffect } from 'react';
import './NotificationBell.css';

const NotificationBell = () => {
  const [count, setCount] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrar, setMostrar] = useState(false);

  const idUsuario = JSON.parse(localStorage.getItem('usuario'))?.id_usuario;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!idUsuario) return;

    const cargarNotificaciones = async () => {
      try {
        const response = await fetch(
          `http://localhost:3100/api/notificaciones/usuario/${idUsuario}/no-leidas`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        const data = await response.json();
        
        if (data.success) {
          setNotificaciones(data.data);
          setCount(data.count);
        }
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      }
    };

    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 30000); // Cada 30s

    return () => clearInterval(interval);
  }, [idUsuario, token]);

  const marcarLeida = async (idNotificacion, urlDestino) => {
    try {
      await fetch(
        `http://localhost:3100/api/notificaciones/${idNotificacion}/marcar-leida`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setNotificaciones(prev => 
        prev.filter(n => n.id_notificacion !== idNotificacion)
      );
      setCount(prev => Math.max(0, prev - 1));

      if (urlDestino) {
        window.location.href = urlDestino;
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  return (
    <div className="notification-bell">
      <button 
        className="bell-button"
        onClick={() => setMostrar(!mostrar)}
      >
        🔔
        {count > 0 && <span className="badge">{count}</span>}
      </button>

      {mostrar && (
        <div className="notification-dropdown">
          <h4>Notificaciones</h4>
          {notificaciones.length === 0 ? (
            <p className="empty">No hay notificaciones nuevas</p>
          ) : (
            <ul>
              {notificaciones.map(notif => (
                <li 
                  key={notif.id_notificacion}
                  onClick={() => marcarLeida(notif.id_notificacion, notif.url_destino)}
                >
                  <span className="icon">
                    {notif.tipo_notificacion === 'INVITACIÓN' && '📨'}
                    {notif.tipo_notificacion === 'GASTO_AGREGADO' && '💰'}
                    {notif.tipo_notificacion === 'PAGO_REALIZADO' && '✅'}
                    {notif.tipo_notificacion === 'SALDO_CAMBIADO' && '📊'}
                  </span>
                  <div className="content">
                    <p>{notif.mensaje}</p>
                    <small>{new Date(notif.fecha_envio).toLocaleString()}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
```

CSS para el componente (`NotificationBell.css`):

```css
.notification-bell {
  position: relative;
}

.bell-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  position: relative;
}

.bell-button .badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
}

.notification-dropdown {
  position: absolute;
  right: 0;
  top: 40px;
  width: 350px;
  max-height: 500px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  overflow: hidden;
  z-index: 1000;
}

.notification-dropdown h4 {
  margin: 0;
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.notification-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

.notification-dropdown li {
  display: flex;
  align-items: start;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-dropdown li:hover {
  background: #f8f9fa;
}

.notification-dropdown .icon {
  font-size: 24px;
  margin-right: 10px;
}

.notification-dropdown .content {
  flex: 1;
}

.notification-dropdown .content p {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
}

.notification-dropdown .content small {
  color: #666;
  font-size: 12px;
}

.notification-dropdown .empty {
  padding: 30px;
  text-align: center;
  color: #999;
}
```

### Opción 2: JavaScript Vanilla

```javascript
// notificaciones.js
class NotificacionesManager {
  constructor(idUsuario, containerId = 'notificaciones-container') {
    this.idUsuario = idUsuario;
    this.container = document.getElementById(containerId);
    this.token = localStorage.getItem('token');
    this.baseURL = 'http://localhost:3100/api/notificaciones';
    this.notificaciones = [];
    this.count = 0;
    
    this.init();
  }

  init() {
    this.renderBell();
    this.cargarNotificaciones();
    
    // Actualizar cada 30 segundos
    setInterval(() => this.cargarNotificaciones(), 30000);
  }

  renderBell() {
    this.container.innerHTML = `
      <div class="notification-bell">
        <button id="bell-btn" class="bell-button">
          🔔
          <span id="notif-badge" class="badge" style="display: none;">0</span>
        </button>
        <div id="notif-dropdown" class="notification-dropdown" style="display: none;">
          <h4>Notificaciones</h4>
          <div id="notif-list"></div>
        </div>
      </div>
    `;

    document.getElementById('bell-btn').addEventListener('click', () => {
      this.toggleDropdown();
    });
  }

  async cargarNotificaciones() {
    try {
      const response = await fetch(
        `${this.baseURL}/usuario/${this.idUsuario}/no-leidas`,
        {
          headers: { 'Authorization': `Bearer ${this.token}` }
        }
      );

      const data = await response.json();

      if (data.success) {
        this.notificaciones = data.data;
        this.count = data.count;
        this.actualizarBadge();
        this.renderNotificaciones();
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  }

  actualizarBadge() {
    const badge = document.getElementById('notif-badge');
    if (this.count > 0) {
      badge.textContent = this.count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  renderNotificaciones() {
    const lista = document.getElementById('notif-list');
    
    if (this.notificaciones.length === 0) {
      lista.innerHTML = '<p class="empty">No hay notificaciones nuevas</p>';
      return;
    }

    lista.innerHTML = this.notificaciones.map(notif => `
      <div class="notif-item" data-id="${notif.id_notificacion}" data-url="${notif.url_destino || ''}">
        <span class="icon">${this.getIcon(notif.tipo_notificacion)}</span>
        <div class="content">
          <p>${notif.mensaje}</p>
          <small>${new Date(notif.fecha_envio).toLocaleString()}</small>
        </div>
      </div>
    `).join('');

    // Agregar event listeners
    lista.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const url = item.dataset.url;
        this.marcarLeida(id, url);
      });
    });
  }

  getIcon(tipo) {
    const icons = {
      'INVITACIÓN': '📨',
      'GASTO_AGREGADO': '💰',
      'PAGO_REALIZADO': '✅',
      'SALDO_CAMBIADO': '📊'
    };
    return icons[tipo] || '📬';
  }

  async marcarLeida(idNotificacion, urlDestino) {
    try {
      await fetch(
        `${this.baseURL}/${idNotificacion}/marcar-leida`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${this.token}` }
        }
      );

      // Actualizar lista local
      this.notificaciones = this.notificaciones.filter(
        n => n.id_notificacion != idNotificacion
      );
      this.count = this.notificaciones.length;
      
      this.actualizarBadge();
      this.renderNotificaciones();

      if (urlDestino) {
        window.location.href = urlDestino;
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }

  toggleDropdown() {
    const dropdown = document.getElementById('notif-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }
}

// Uso:
// const idUsuario = JSON.parse(localStorage.getItem('usuario')).id_usuario;
// const notificacionesManager = new NotificacionesManager(idUsuario);
```

## 🔔 Notificaciones del Navegador

Para mostrar notificaciones del navegador cuando llegue una nueva:

```javascript
// Solicitar permiso
async function solicitarPermisoNotificaciones() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

// Mostrar notificación
function mostrarNotificacionNavegador(titulo, mensaje, url) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notif = new Notification(titulo, {
      body: mensaje,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'splitease-notif'
    });

    notif.onclick = () => {
      window.focus();
      if (url) window.location.href = url;
      notif.close();
    };
  }
}

// Ejemplo de uso al recibir nueva notificación
function onNuevaNotificacion(notificacion) {
  mostrarNotificacionNavegador(
    'Nueva notificación - Splitease',
    notificacion.mensaje,
    notificacion.url_destino
  );
}
```

## 🚀 Integración Automática en Eventos

### Al crear un gasto, notificar a los participantes:

```javascript
// En tu función de crear gasto
async function crearGasto(datosGasto, participantes) {
  // ... código para crear el gasto ...
  
  const idGasto = resultadoCreacion.id_gasto;
  const nombreGrupo = resultadoCreacion.nombre_grupo;
  const idGrupo = resultadoCreacion.id_grupo;

  // Notificar a todos los participantes
  const promesasNotificaciones = participantes.map(participante => 
    fetch('http://localhost:3100/api/notificaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id_usuario: participante.id_usuario,
        tipo_notificacion: 'GASTO_AGREGADO',
        mensaje: `Se agregó un nuevo gasto al grupo '${nombreGrupo}'`,
        url_destino: `/grupos/${idGrupo}/gastos`
      })
    })
  );

  await Promise.all(promesasNotificaciones);
}
```

### Al realizar un pago:

```javascript
async function registrarPago(datosPago) {
  // ... código para registrar el pago ...
  
  // Obtener participantes del grupo
  const participantes = await obtenerParticipantesGrupo(datosPago.id_grupo);
  
  // Notificar a todos excepto quien pagó
  const notificaciones = participantes
    .filter(p => p.id_usuario !== datosPago.id_usuario_pago)
    .map(participante =>
      fetch('http://localhost:3100/api/notificaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_usuario: participante.id_usuario,
          tipo_notificacion: 'PAGO_REALIZADO',
          mensaje: `${datosPago.nombre_usuario} realizó un pago de $${datosPago.monto}`,
          url_destino: `/grupos/${datosPago.id_grupo}`
        })
      })
    );

  await Promise.all(notificaciones);
}
```

## 🎯 Mejores Prácticas

1. **Limitar consultas**: No consultes las notificaciones en cada renderizado. Usa intervalos razonables (30-60 segundos).

2. **Usar SSE para tiempo real**: Si necesitas actualizaciones instantáneas, implementa Server-Sent Events.

3. **Limpiar notificaciones antiguas**: Implementa un botón para eliminar notificaciones leídas.

4. **Agrupar notificaciones**: Si hay múltiples notificaciones del mismo tipo, considera agruparlas.

5. **Feedback visual**: Muestra un indicador de carga mientras se procesan las acciones.

6. **Manejo de errores**: Siempre maneja los errores de red apropiadamente.

## 🐛 Troubleshooting

### Las notificaciones no aparecen
- Verifica que el servidor backend esté corriendo.
- Revisa la consola del navegador para errores.
- Confirma que el token JWT sea válido.

### El badge no se actualiza
- Verifica que el intervalo de actualización esté funcionando.
- Comprueba que la respuesta del servidor sea correcta.

### SSE no funciona
- Asegúrate de que el servidor soporte conexiones persistentes.
- Verifica la configuración de CORS.
- Implementa reconexión automática.

## 📚 Recursos Adicionales

- Documentación completa: `backend/docs/api/notificaciones.md`
- Código fuente: `backend/models/notificacionModel.js`
- Controladores: `backend/controllers/notificacionesController.js`
- Rutas: `backend/routes/notificaciones.js`

---

¡Tu módulo de notificaciones está listo para usar! 🎉
