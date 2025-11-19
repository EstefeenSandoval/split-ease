import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faCheck,
  faClock,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { construirURLEstatico } from '../../../config/api';
import ModalDetallePagos from '../ModalDetallePagos/ModalDetallePagos';
import './GastoCardExpandida.css';

const GastoCardExpandida = ({
  gasto,
  usuarioActual,
  onEditar,
  onEliminar,
  onPagar
}) => {
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  
  const esPagador = usuarioActual && gasto.id_pagador === usuarioActual.id_usuario;
  
  // Verificar si el usuario actual tiene una división pendiente
  const divisionUsuario = gasto.divisiones?.find(
    div => div.id_usuario === usuarioActual?.id_usuario
  );
  const tieneDivisionPendiente = divisionUsuario && divisionUsuario.pagado === 0;
  
  // El estado del gasto para el usuario actual depende de si ya pagó su parte
  const estaPagadoParaMi = divisionUsuario ? divisionUsuario.pagado === 1 : false;
  
  // Calcular estadísticas de pagos
  const totalParticipantes = gasto.divisiones?.length || 0;
  const participantesPagados = gasto.divisiones?.filter(d => d.pagado === 1).length || 0;
  const participantesPendientes = totalParticipantes - participantesPagados;

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
    <>
      <div className={`gce-card ${estaPagadoParaMi ? 'pagado' : 'pendiente'}`}>
        <div className="gce-header">
          <div className="gce-info">
            <h3 className="gce-descripcion">{gasto.descripcion}</h3>
            <p className="gce-categoria">{gasto.categoria || 'Sin categoría'}</p>
          </div>
          <div className={`gce-badge ${estaPagadoParaMi ? 'pagado' : 'pendiente'}`}>
            <FontAwesomeIcon icon={estaPagadoParaMi ? faCheck : faClock} />
            <span>{estaPagadoParaMi ? 'Pagado' : 'Pendiente'}</span>
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
        <div className="gce-participantes" onClick={() => setMostrarModalDetalle(true)} style={{ cursor: 'pointer' }}>
          <span className="gce-participantes-label">
            Dividido entre {gasto.participantes.length} personas
            {participantesPagados > 0 && (
              <span className="gce-participantes-stats">
                {' • '}
                <span className="gce-stat-pagado">{participantesPagados} pagado{participantesPagados !== 1 ? 's' : ''}</span>
                {participantesPendientes > 0 && (
                  <>
                    {' • '}
                    <span className="gce-stat-pendiente">{participantesPendientes} pendiente{participantesPendientes !== 1 ? 's' : ''}</span>
                  </>
                )}
              </span>
            )}
          </span>
          <div className="gce-participantes-preview">
            {gasto.participantes.slice(0, 3).map((participante, idx) => {
              const divisionPart = gasto.divisiones?.find(d => d.id_usuario === participante.id_usuario);
              const estaPagado = divisionPart?.pagado === 1;
              return (
                <div 
                  key={idx} 
                  className={`gce-avatar ${estaPagado ? 'gce-avatar-pagado' : 'gce-avatar-pendiente'}`} 
                  title={`${participante.nombre || participante.nombre_usuario} - ${estaPagado ? 'Pagado' : 'Pendiente'}`}
                >
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
                  {estaPagado && <div className="gce-avatar-check"><FontAwesomeIcon icon={faCheck} /></div>}
                </div>
              );
            })}
            {gasto.participantes.length > 3 && (
              <div className="gce-avatar gce-avatar-mas">
                <span>+{gasto.participantes.length - 3}</span>
              </div>
            )}
            <button className="gce-btn-ver-detalle" title="Ver detalle de pagos">
              <FontAwesomeIcon icon={faInfoCircle} />
            </button>
          </div>
        </div>
      )}

      <div className="gce-acciones">
        {tieneDivisionPendiente && (
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
          disabled={gasto.estado === 'confirmado'}
          data-tooltip={gasto.estado === 'confirmado' ? "No se puede editar" : "Editar gasto"}
        >
          <FontAwesomeIcon icon={faEdit} />
          <span>Editar</span>
        </button>

        <button
          className="gce-btn gce-btn-eliminar"
          onClick={onEliminar}
          disabled={esPagador && gasto.estado === 'confirmado'}
          data-tooltip={esPagador && gasto.estado === 'confirmado' ? "No se puede eliminar" : "Eliminar gasto"}
        >
          <FontAwesomeIcon icon={faTrash} />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
    
    {mostrarModalDetalle && (
      <ModalDetallePagos 
        gasto={gasto} 
        onClose={() => setMostrarModalDetalle(false)} 
      />
    )}
    </>
  );
};

export default GastoCardExpandida;
