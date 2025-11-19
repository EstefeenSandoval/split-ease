import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faClock, faUser } from '@fortawesome/free-solid-svg-icons';
import { construirURLEstatico } from '../../../config/api';
import './ModalDetallePagos.css';

const ModalDetallePagos = ({ gasto, onClose }) => {
  if (!gasto) return null;

  const divisiones = gasto.divisiones || [];
  const totalPagado = divisiones.filter(d => d.pagado === 1).length;
  const totalPendiente = divisiones.filter(d => d.pagado === 0).length;

  return (
    <div className="mdp-overlay" onClick={onClose}>
      <div className="mdp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mdp-header">
          <h2 className="mdp-titulo">Detalle de Pagos</h2>
          <button className="mdp-btn-cerrar" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="mdp-info-gasto">
          <h3 className="mdp-gasto-descripcion">{gasto.descripcion}</h3>
          <div className="mdp-gasto-monto">
            <span className="mdp-label">Total:</span>
            <span className="mdp-valor">${parseFloat(gasto.monto_total).toFixed(2)}</span>
          </div>
        </div>

        <div className="mdp-resumen">
          <div className="mdp-resumen-item mdp-pagado">
            <FontAwesomeIcon icon={faCheck} />
            <span>{totalPagado} pagado{totalPagado !== 1 ? 's' : ''}</span>
          </div>
          <div className="mdp-resumen-item mdp-pendiente">
            <FontAwesomeIcon icon={faClock} />
            <span>{totalPendiente} pendiente{totalPendiente !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="mdp-divisiones">
          <h4 className="mdp-subtitulo">Participantes</h4>
          <div className="mdp-lista">
            {divisiones.map((division, index) => (
              <div 
                key={index} 
                className={`mdp-division-item ${division.pagado === 1 ? 'pagado' : 'pendiente'}`}
              >
                <div className="mdp-participante-info">
                  <div className="mdp-avatar">
                    {division.foto_perfil ? (
                      <img 
                        src={construirURLEstatico(division.foto_perfil)} 
                        alt={division.nombre_usuario}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.querySelector('.mdp-avatar-placeholder')?.style.setProperty('display', 'flex', 'important');
                        }}
                      />
                    ) : null}
                    <div 
                      className="mdp-avatar-placeholder" 
                      style={{ display: division.foto_perfil ? 'none' : 'flex' }}
                    >
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                  </div>
                  <div className="mdp-participante-datos">
                    <span className="mdp-participante-nombre">
                      {division.nombre_usuario || division.email}
                    </span>
                    {division.fecha_pago && (
                      <span className="mdp-participante-fecha">
                        Pagado: {new Date(division.fecha_pago).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mdp-participante-monto">
                  <span className="mdp-monto-valor">
                    ${parseFloat(division.monto).toFixed(2)}
                  </span>
                  <div className={`mdp-estado ${division.pagado === 1 ? 'pagado' : 'pendiente'}`}>
                    <FontAwesomeIcon icon={division.pagado === 1 ? faCheck : faClock} />
                    <span>{division.pagado === 1 ? 'Pagado' : 'Pendiente'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mdp-footer">
          <button className="mdp-btn-ok" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetallePagos;
