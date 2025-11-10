import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faCheck,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { construirURLEstatico } from '../../../config/api';
import './GastoCardExpandida.css';

const GastoCardExpandida = ({
  gasto,
  usuarioActual,
  onEditar,
  onEliminar,
  onPagar
}) => {
  const esPagador = usuarioActual && gasto.id_pagador === usuarioActual.id_usuario;
  const estaPagado = gasto.estado === 'confirmado';
  
  // Verificar si el usuario actual tiene una división pendiente
  const divisionUsuario = gasto.divisiones?.find(
    div => div.id_usuario === usuarioActual?.id_usuario
  );
  const tieneDivisionPendiente = divisionUsuario && divisionUsuario.pagado === 0;

  const handlePagarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('CLICK DETECTADO EN BOTÓN PAGAR');
    if (typeof onPagar === 'function') {
      onPagar();
    }
  };

  const fechaFormateada = new Date(gasto.fecha_gasto).toLocaleDateString('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`gce-card ${estaPagado ? 'pagado' : 'pendiente'}`}>
      <div className="gce-header">
        <div className="gce-info">
          <h3 className="gce-descripcion">{gasto.descripcion}</h3>
          <p className="gce-categoria">{gasto.categoria || 'Sin categoría'}</p>
        </div>
        <div className={`gce-badge ${estaPagado ? 'pagado' : 'pendiente'}`}>
          <FontAwesomeIcon icon={estaPagado ? faCheck : faClock} />
          <span>{estaPagado ? 'Pagado' : 'Pendiente'}</span>
        </div>
      </div>

      <div className="gce-monto">
        <span className="gce-monto-label">Monto:</span>
        <span className="gce-monto-valor">${parseFloat(gasto.monto_total).toFixed(2)}</span>
        <span className="gce-moneda">{gasto.moneda || 'MXN'}</span>
      </div>

      <div className="gce-detalles">
        <div className="gce-detalle-item">
          <span className="gce-detalle-label">Pagador:</span>
          <span className="gce-detalle-valor">
            {gasto.nombre_pagador}
            {esPagador && <span className="gce-etiqueta-tu">(Tú)</span>}
          </span>
        </div>
        <div className="gce-detalle-item">
          <span className="gce-detalle-label">Fecha:</span>
          <span className="gce-detalle-valor">{fechaFormateada}</span>
        </div>
      </div>

      {gasto.participantes && gasto.participantes.length > 0 && (
        <div className="gce-participantes">
          <span className="gce-participantes-label">Dividido entre {gasto.participantes.length} personas</span>
          <div className="gce-participantes-preview">
            {gasto.participantes.slice(0, 3).map((participante, idx) => (
              <div key={idx} className="gce-avatar" title={participante.nombre || participante.nombre_usuario}>
                {participante.foto_perfil ? (
                  <img 
                    src={construirURLEstatico(participante.foto_perfil)} 
                    alt={participante.nombre || participante.nombre_usuario}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.querySelector('.gce-avatar-placeholder')?.style.setProperty('display', 'flex', 'important');
                    }}
                  />
                ) : null}
                <div className="gce-avatar-placeholder" style={{ display: participante.foto_perfil ? 'none' : 'flex' }}>
                  {(participante.nombre || participante.nombre_usuario || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            ))}
            {gasto.participantes.length > 3 && (
              <div className="gce-avatar gce-avatar-mas">
                <span>+{gasto.participantes.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="gce-acciones">
        {tieneDivisionPendiente && !estaPagado && (
          <button
            type="button"
            className="gce-btn gce-btn-pagar"
            onClick={handlePagarClick}
            data-tooltip="Pagar mi parte"
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          >
            <FontAwesomeIcon icon={faCheck} />
            <span>Pagar</span>
          </button>
        )}

        <button
          className="gce-btn gce-btn-editar"
          onClick={onEditar}
          disabled={estaPagado}
          data-tooltip={estaPagado ? "No se puede editar" : "Editar gasto"}
        >
          <FontAwesomeIcon icon={faEdit} />
          <span>Editar</span>
        </button>

        <button
          className="gce-btn gce-btn-eliminar"
          onClick={onEliminar}
          disabled={esPagador && estaPagado}
          data-tooltip={esPagador && estaPagado ? "No se puede eliminar" : "Eliminar gasto"}
        >
          <FontAwesomeIcon icon={faTrash} />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );
};

export default GastoCardExpandida;
