import React from 'react';
import './ActividadReciente.css';

const ActividadReciente = ({ actividades, onCargarMas, paginacion }) => {
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora - date;
    const segundos = Math.floor(diff / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 7) {
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined
      });
    } else if (dias > 0) {
      return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    } else if (horas > 0) {
      return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    } else if (minutos > 0) {
      return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    } else {
      return 'Ahora mismo';
    }
  };

  const obtenerIcono = (tipo) => {
    const iconos = {
      pago_recibido: '💰',
      pago_enviado: '💸',
      gasto_creado: '➕',
      gasto_editado: '✏️',
      usuario_unido: '👤',
      cobro_pendiente: '⏰'
    };
    return iconos[tipo] || '📌';
  };

  if (actividades.length === 0) {
    return (
      <div className="actividad-reciente-container">
        <h3 className="actividad-titulo">📋 Actividad Reciente</h3>
        <div className="actividad-vacia">
          <p>No hay actividad reciente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="actividad-reciente-container">
      <h3 className="actividad-titulo">📋 Actividad Reciente</h3>
      <div className="actividad-lista">
        {actividades.map((actividad, index) => (
          <div
            key={index}
            className={`actividad-item ${!actividad.leida ? 'no-leida' : ''}`}
          >
            <div className="actividad-icono">
              {obtenerIcono(actividad.tipo)}
            </div>
            <div className="actividad-contenido">
              <p className="actividad-mensaje">{actividad.mensaje}</p>
              <span className="actividad-fecha">
                {formatearFecha(actividad.fecha)}
              </span>
            </div>
            {!actividad.leida && <div className="actividad-badge"></div>}
          </div>
        ))}
      </div>

      {paginacion && paginacion.paginaActual < paginacion.totalPaginas && (
        <div className="actividad-footer">
          <button onClick={onCargarMas} className="boton-cargar-mas">
            Cargar más actividad
          </button>
          <span className="paginacion-info">
            Página {paginacion.paginaActual} de {paginacion.totalPaginas}
          </span>
        </div>
      )}
    </div>
  );
};

export default ActividadReciente;
