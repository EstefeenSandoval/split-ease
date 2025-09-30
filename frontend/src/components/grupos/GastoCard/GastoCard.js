import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faTrashAlt, 
  faCheck, 
  faClock, 
  faUser,
  faCalendarAlt,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import './GastoCard.css';

const GastoCard = ({ 
  gasto, 
  usuarioActual, 
  onVerDetalle, 
  onMarcarPagado, 
  onEliminar 
}) => {
  const esPagador = usuarioActual && gasto.id_pagador === usuarioActual.id_usuario;
  const fechaFormateada = new Date(gasto.fecha_gasto).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaFormateada = new Date(gasto.fecha_gasto).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getEstadoClase = (estado) => {
    switch (estado) {
      case 'confirmado': return 'estado-confirmado';
      case 'cancelado': return 'estado-cancelado';
      default: return 'estado-pendiente';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'confirmado': return 'Confirmado';
      case 'cancelado': return 'Cancelado';
      default: return 'Pendiente';
    }
  };

  const getEstadoIcono = (estado) => {
    switch (estado) {
      case 'confirmado': return faCheck;
      case 'cancelado': return faTrashAlt;
      default: return faClock;
    }
  };

  return (
    <div className="gasto-card">
      <div className="gasto-card-header">
        <div className="gasto-info-principal">
          <h3 className="gasto-descripcion">{gasto.descripcion}</h3>
          <div className={`gasto-estado ${getEstadoClase(gasto.estado)}`}>
            <FontAwesomeIcon icon={getEstadoIcono(gasto.estado)} />
            <span>{getEstadoTexto(gasto.estado)}</span>
          </div>
        </div>
        <div className="gasto-monto">
          <span className="monto-valor">${parseFloat(gasto.monto_total).toFixed(2)}</span>
          <span className="monto-moneda">{gasto.moneda || 'MXN'}</span>
        </div>
      </div>

      <div className="gasto-detalles">
        <div className="detalle-item">
          <FontAwesomeIcon icon={faUser} className="detalle-icono" />
          <span className="detalle-label">Pagado por:</span>
          <span className="detalle-valor">{gasto.nombre_pagador}</span>
        </div>
        
        <div className="detalle-item">
          <FontAwesomeIcon icon={faTag} className="detalle-icono" />
          <span className="detalle-label">Categoría:</span>
          <span className="detalle-valor">{gasto.categoria}</span>
        </div>
        
        <div className="detalle-item">
          <FontAwesomeIcon icon={faCalendarAlt} className="detalle-icono" />
          <span className="detalle-label">Fecha:</span>
          <span className="detalle-valor">{fechaFormateada} - {horaFormateada}</span>
        </div>
      </div>

      <div className="gasto-acciones">
        <button 
          className="btn-ver-detalle"
          onClick={onVerDetalle}
          title="Ver detalles del gasto"
        >
          <FontAwesomeIcon icon={faEye} /> Ver Detalle
        </button>
        
        {gasto.estado === 'pendiente' && (
          <button 
            className="btn-marcar-pagado"
            onClick={onMarcarPagado}
            title="Marcar mi parte como pagada"
          >
            <FontAwesomeIcon icon={faCheck} /> Marcar Pagado
          </button>
        )}
        
        {esPagador && gasto.estado === 'pendiente' && (
          <button 
            className="btn-eliminar-gasto"
            onClick={onEliminar}
            title="Eliminar gasto (solo el pagador)"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        )}
      </div>
    </div>
  );
};

export default GastoCard;