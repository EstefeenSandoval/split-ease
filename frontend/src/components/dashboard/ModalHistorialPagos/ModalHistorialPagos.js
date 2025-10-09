import React from 'react';
import './ModalHistorialPagos.css';

const ModalHistorialPagos = ({ isOpen, onClose, historial, idGasto }) => {
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(parseFloat(valor));
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-historial" onClick={(e) => e.stopPropagation()}>
        <div className="modal-historial-header">
          <h2>📋 Historial de Pagos</h2>
          <button onClick={onClose} className="modal-historial-close">
            ✕
          </button>
        </div>

        <div className="modal-historial-body">
          {historial && historial.pagos && historial.pagos.length > 0 ? (
            <>
              <div className="historial-resumen">
                <p>Total de pagos: <strong>{historial.totalPagos}</strong></p>
              </div>

              <div className="historial-timeline">
                {historial.pagos.map((pago, index) => (
                  <div key={pago.idPago} className="historial-item">
                    <div className="historial-item-marker">
                      <div className={`historial-item-dot ${pago.tipoPago}`}>
                        {pago.tipoPago === 'completo' ? '✓' : '$'}
                      </div>
                      {index < historial.pagos.length - 1 && (
                        <div className="historial-item-line"></div>
                      )}
                    </div>

                    <div className="historial-item-card">
                      <div className="historial-item-header">
                        <span className={`historial-item-tipo ${pago.tipoPago}`}>
                          {pago.tipoPago === 'completo' ? '✅ Pago Completo' : '💰 Pago Parcial'}
                        </span>
                        <span className="historial-item-monto">
                          {formatearMoneda(pago.monto)}
                        </span>
                      </div>

                      <div className="historial-item-detalles">
                        <p className="historial-item-descripcion">
                          {pago.descripcion}
                        </p>

                        <div className="historial-item-participantes">
                          <span>👤 <strong>De:</strong> {pago.nombrePagador}</span>
                          <span>👤 <strong>Para:</strong> {pago.nombreReceptor}</span>
                        </div>

                        {pago.tipoPago === 'parcial' && (
                          <div className="historial-item-progreso">
                            <div className="progreso-info-historial">
                              <span>Deuda total: {formatearMoneda(pago.montoTotalDeuda)}</span>
                              <span>Saldo restante: {formatearMoneda(pago.saldoRestante)}</span>
                            </div>
                          </div>
                        )}

                        <span className="historial-item-fecha">
                          🕒 {formatearFecha(pago.fechaPago)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="historial-vacio">
              <p>No hay historial de pagos disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalHistorialPagos;
