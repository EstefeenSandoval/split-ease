import React, { useState, useEffect } from 'react';
import { toast } from '../../../utils/toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import API_ENDPOINTS from '../../../config/api';
import './PagarGastoModal.css';

export const PagarGastoModal = ({ 
  isOpen, 
  onClose, 
  gasto, 
  onConfirmar, 
  cargando,
  usuarioActual
}) => {
  const [tipoPago, setTipoPago] = useState('completo'); // 'completo' o 'parcial'
  const [montoParcial, setMontoParcial] = useState('');
  const [idUsuarioReceptor, setIdUsuarioReceptor] = useState('');
  const [cargandoLocal, setCargandoLocal] = useState(false);
  
  // Encontrar la división del usuario actual
  const divisionUsuario = gasto?.divisiones?.find(
    div => div.id_usuario === usuarioActual?.id_usuario
  );
  const montoUsuario = parseFloat(divisionUsuario?.monto || 0);

  useEffect(() => {
    // Resetear el formulario cuando se abre el modal
    if (isOpen && gasto) {
      setTipoPago('completo');
      setMontoParcial('');
      setIdUsuarioReceptor(gasto.id_pagador || '');
    }
  }, [isOpen, gasto]);

  if (!isOpen || !gasto) {
    return null;
  }

  const handlePagoCompleto = async () => {
    try {
      setCargandoLocal(true);
      await onConfirmar();
    } finally {
      setCargandoLocal(false);
    }
  };

  const handlePagoParcial = async () => {
    if (!montoParcial || parseFloat(montoParcial) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    const monto = parseFloat(montoParcial);

    if (monto > montoUsuario) {
      toast.error(`El monto no puede ser mayor a tu deuda de $${montoUsuario.toFixed(2)}`);
      return;
    }

    try {
      setCargandoLocal(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_ENDPOINTS.gastos.base}/${gasto.id_gasto}/pago-parcial`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id_usuario_receptor: parseInt(idUsuarioReceptor),
            monto: monto
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`¡Pago parcial de $${monto.toFixed(2)} registrado!`);
        setMontoParcial('');
        // Recargar sin cerrar para permitir más pagos
        if (onConfirmar) {
          await onConfirmar();
        }
      } else {
        toast.error(data.error || 'Error al procesar el pago parcial');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setCargandoLocal(false);
    }
  };

  const isLoading = cargando || cargandoLocal;

  return (
    <div className="modal-overlay pagar-modal-overlay" onClick={onClose}>
      <div className="modal-content pagar-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header pagar-modal-header">
          <h2>Pagar Gasto</h2>
          <button
            className="modal-close-button"
            onClick={onClose}
            title="Cerrar"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="pagar-modal-body">
          {/* Información del gasto */}
          <div className="pagar-info-gasto">
            <h3>{gasto.descripcion}</h3>
            <div className="pagar-monto-info">
              <div className="info-item">
                <span className="label">Categoría:</span>
                <span className="valor">{gasto.categoria || 'Sin categoría'}</span>
              </div>
              <div className="info-item">
                <span className="label">Monto Total:</span>
                <span className="valor">${parseFloat(gasto.monto_total).toFixed(2)}</span>
              </div>
              <div className="info-item">
                <span className="label">Tu Deuda:</span>
                <span className="valor valor-tu-deuda">${parseFloat(montoUsuario).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Selector de tipo de pago */}
          <div className="pagar-tipo-selector">
            <label className="selector-option">
              <input
                type="radio"
                name="tipoPago"
                value="completo"
                checked={tipoPago === 'completo'}
                onChange={(e) => setTipoPago(e.target.value)}
                disabled={isLoading}
              />
              <span className="selector-label">
                <strong>Pago Completo</strong>
                <small>Marcar toda tu deuda como pagada de una sola vez</small>
              </span>
            </label>

            <label className="selector-option">
              <input
                type="radio"
                name="tipoPago"
                value="parcial"
                checked={tipoPago === 'parcial'}
                onChange={(e) => setTipoPago(e.target.value)}
                disabled={isLoading}
              />
              <span className="selector-label">
                <strong>Pago Parcial</strong>
                <small>Enviar dinero progresivamente hasta completar el pago</small>
              </span>
            </label>
          </div>

          {/* Formulario según tipo de pago */}
          {tipoPago === 'completo' ? (
            <div className="pagar-completo-section">
              <div className="pagar-resumen">
                <p>Marcarás tu parte como completamente pagada.</p>
                <div className="pagar-breakdown">
                  <div className="breakdown-item">
                    <span>Monto a Pagar:</span>
                    <strong>${parseFloat(montoUsuario).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="pagar-parcial-section">
              <div className="form-group">
                <label htmlFor="montoParcial">Monto a Enviar (Máximo: ${parseFloat(montoUsuario).toFixed(2)})</label>
                <div className="monto-input-group">
                  <span className="currency-symbol">$</span>
                  <input
                    id="montoParcial"
                    type="number"
                    min="0"
                    max={montoUsuario}
                    step="0.01"
                    placeholder="0.00"
                    value={montoParcial}
                    onChange={(e) => setMontoParcial(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Botones de cantidad rápida */}
              <div className="pagar-quick-amounts">
                <button
                  className="quick-amount-btn"
                  onClick={() => {
                    setMontoParcial((montoUsuario / 2).toFixed(2));
                  }}
                  disabled={isLoading}
                  title={`Pagar 50% de $${montoUsuario.toFixed(2)}`}
                >
                  50%
                </button>
                <button
                  className="quick-amount-btn"
                  onClick={() => {
                    setMontoParcial(parseFloat(montoUsuario).toFixed(2));
                  }}
                  disabled={isLoading}
                  title={`Pagar 100% de $${montoUsuario.toFixed(2)}`}
                >
                  100%
                </button>
              </div>

              <div className="pagar-resumen-parcial">
                {montoParcial && (
                  <div className="resumen-item">
                    <span>Pagarás:</span>
                    <strong>${parseFloat(montoParcial).toFixed(2)}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="pagar-modal-footer">
            <button
              className="btn-cancelar"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>

            {tipoPago === 'completo' ? (
              <button
                className="btn-pagar-completo"
                onClick={handlePagoCompleto}
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : `Pagar $${parseFloat(montoUsuario).toFixed(2)}`}
              </button>
            ) : (
              <button
                className="btn-pagar-parcial"
                onClick={handlePagoParcial}
                disabled={isLoading || !montoParcial || parseFloat(montoParcial) <= 0}
              >
                {isLoading ? 'Procesando...' : `Enviar $${parseFloat(montoParcial || 0).toFixed(2)}`}
              </button>
            )}
          </div>

          {/* Información adicional */}
          <div className="pagar-info-adicional">
            <p className="info-text">
              <strong>💡 Tip:</strong> Usa pagos parciales para documentar transferencias múltiples o abonos progresivos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagarGastoModal;

