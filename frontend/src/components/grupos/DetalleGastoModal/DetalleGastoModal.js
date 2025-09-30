import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faEye, 
  faUser, 
  faCalendarAlt, 
  faTag, 
  faCreditCard,
  faCheck,
  faTrashAlt,
  faClock,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import './DetalleGastoModal.css';

const DetalleGastoModal = ({ 
  isOpen, 
  onClose, 
  gasto, 
  usuarioActual, 
  onMarcarPagado, 
  onEliminar 
}) => {
  if (!isOpen || !gasto) return null;

  const esPagador = usuarioActual && gasto.id_pagador === usuarioActual.id_usuario;
  
  const fechaFormateada = new Date(gasto.fecha_gasto).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const horaFormateada = new Date(gasto.fecha_gasto).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const fechaRegistroFormateada = new Date(gasto.fecha_registro).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
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

  const totalPagado = gasto.divisiones?.filter(d => d.pagado === 1).length || 0;
  const totalParticipantes = gasto.divisiones?.length || 0;
  const porcentajePagado = totalParticipantes > 0 ? (totalPagado / totalParticipantes) * 100 : 0;

  const divisionUsuarioActual = gasto.divisiones?.find(d => d.id_usuario === usuarioActual?.id_usuario);

  const handleMarcarPagado = () => {
    onMarcarPagado(gasto.id_gasto);
  };

  const handleEliminar = () => {
    onEliminar(gasto.id_gasto);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detalle-gasto-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faEye} /> Detalle del Gasto
          </h2>
          <button className="btn-cerrar" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="detalle-gasto-content">
          {/* Información principal del gasto */}
          <div className="gasto-info-principal">
            <div className="gasto-header-info">
              <h3 className="gasto-descripcion">{gasto.descripcion}</h3>
              <div className={`gasto-estado ${getEstadoClase(gasto.estado)}`}>
                <FontAwesomeIcon icon={getEstadoIcono(gasto.estado)} />
                <span>{getEstadoTexto(gasto.estado)}</span>
              </div>
            </div>
            
            <div className="gasto-monto-principal">
              <span className="monto-total">${parseFloat(gasto.monto_total).toFixed(2)}</span>
              <span className="moneda">{gasto.moneda || 'MXN'}</span>
            </div>
          </div>

          {/* Detalles del gasto */}
          <div className="gasto-detalles-grid">
            <div className="detalle-item">
              <FontAwesomeIcon icon={faUser} className="detalle-icono" />
              <div className="detalle-content">
                <span className="detalle-label">Pagado por</span>
                <span className="detalle-valor">{gasto.nombre_pagador}</span>
              </div>
            </div>

            <div className="detalle-item">
              <FontAwesomeIcon icon={faTag} className="detalle-icono" />
              <div className="detalle-content">
                <span className="detalle-label">Categoría</span>
                <span className="detalle-valor">{gasto.categoria}</span>
              </div>
            </div>

            <div className="detalle-item">
              <FontAwesomeIcon icon={faCalendarAlt} className="detalle-icono" />
              <div className="detalle-content">
                <span className="detalle-label">Fecha del gasto</span>
                <span className="detalle-valor">{fechaFormateada}</span>
                <span className="detalle-secundario">{horaFormateada}</span>
              </div>
            </div>

            <div className="detalle-item">
              <FontAwesomeIcon icon={faCreditCard} className="detalle-icono" />
              <div className="detalle-content">
                <span className="detalle-label">Registrado el</span>
                <span className="detalle-valor">{fechaRegistroFormateada}</span>
              </div>
            </div>
          </div>

          {/* Progreso de pagos */}
          <div className="progreso-pagos">
            <div className="progreso-header">
              <h4>Progreso de Pagos</h4>
              <span className="progreso-texto">
                {totalPagado} de {totalParticipantes} participantes han pagado
              </span>
            </div>
            <div className="progreso-bar">
              <div 
                className="progreso-fill" 
                style={{ width: `${porcentajePagado}%` }}
              ></div>
            </div>
            <span className="progreso-porcentaje">{porcentajePagado.toFixed(0)}%</span>
          </div>

          {/* División de gastos */}
          <div className="divisiones-section">
            <h4>División del Gasto</h4>
            <div className="divisiones-lista">
              {gasto.divisiones?.map(division => (
                <div 
                  key={division.id_usuario} 
                  className={`division-item ${division.pagado ? 'pagado' : 'pendiente'} ${division.id_usuario === usuarioActual?.id_usuario ? 'usuario-actual' : ''}`}
                >
                  <div className="division-usuario">
                    <FontAwesomeIcon icon={faUser} className="usuario-icono" />
                    <span className="usuario-nombre">{division.nombre_usuario}</span>
                    {division.id_usuario === usuarioActual?.id_usuario && (
                      <span className="tu-badge">Tú</span>
                    )}
                  </div>
                  
                  <div className="division-monto">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="monto-icono" />
                    <span className="monto-asignado">
                      ${parseFloat(division.monto_asignado).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="division-estado">
                    {division.pagado ? (
                      <div className="estado-pagado">
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Pagado</span>
                        {division.fecha_pago && (
                          <span className="fecha-pago">
                            {new Date(division.fecha_pago).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="estado-pendiente">
                        <FontAwesomeIcon icon={faClock} />
                        <span>Pendiente</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="detalle-acciones">
            {gasto.estado === 'pendiente' && divisionUsuarioActual && !divisionUsuarioActual.pagado && (
              <button 
                className="btn-marcar-pagado-detalle"
                onClick={handleMarcarPagado}
              >
                <FontAwesomeIcon icon={faCheck} /> Marcar mi parte como pagada
              </button>
            )}
            
            {esPagador && gasto.estado === 'pendiente' && (
              <button 
                className="btn-eliminar-gasto-detalle"
                onClick={handleEliminar}
              >
                <FontAwesomeIcon icon={faTrashAlt} /> Eliminar Gasto
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleGastoModal;