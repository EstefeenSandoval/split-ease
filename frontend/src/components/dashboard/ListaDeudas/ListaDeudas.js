import React, { useState } from 'react';
import { STATIC_BASE_URL } from '../../../config/api';
import './ListaDeudas.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faArrowTrendDown,
  faHandHoldingDollar,
  faHandHoldingHand
} from '@fortawesome/free-solid-svg-icons';


const ListaDeudas = ({ tipo, datos, onPagar, onVerHistorial }) => {
  const [pagandoId, setPagandoId] = useState(null);
  const [montoPago, setMontoPago] = useState('');
  const [metodoPago, setMetodoPago] = useState('Transferencia bancaria');

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(parseFloat(valor));
  };

  const obtenerURLFoto = (ruta) => {
    if (!ruta) return null;
    if (ruta.startsWith('http')) return ruta;
    return `${STATIC_BASE_URL}${ruta}`;
  };

  const calcularProgreso = (montoPagado, montoTotal) => {
    const pagado = parseFloat(montoPagado);
    const total = parseFloat(montoTotal);
    if (total === 0) return 0;
    return (pagado / total) * 100;
  };

  const handleIniciarPago = (deuda) => {
    setPagandoId(deuda.idGasto);
    setMontoPago(deuda.monto);
  };

  const handleCancelarPago = () => {
    setPagandoId(null);
    setMontoPago('');
    setMetodoPago('Transferencia bancaria');
  };

  const handleConfirmarPago = async (deuda) => {
    const monto = parseFloat(montoPago);
    if (isNaN(monto) || monto <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    if (monto > parseFloat(deuda.monto)) {
      alert('El monto no puede ser mayor al saldo pendiente');
      return;
    }

    await onPagar({
      idGasto: deuda.idGasto,
      idUsuarioAcreedor: deuda.idUsuarioAcreedor,
      monto: monto,
      metodo: metodoPago
    });

    handleCancelarPago();
  };

  const titulo = tipo === 'cobros'
    ? (<><FontAwesomeIcon icon={faHandHoldingHand} style={{ color: 'var(--verde-profundo)', marginRight: 8 }} />Te Deben</>)
    : (<><FontAwesomeIcon icon={faHandHoldingDollar} style={{ color: 'var(--verde-profundo)', marginRight: 8 }} />Debes</>);
  const vacio = tipo === 'cobros' ? 'No tienes cobros pendientes' : 'No tienes deudas pendientes';

  if (datos.length === 0) {
    return (
      <div className="lista-deudas-container">
        <h3 className="lista-deudas-titulo">{titulo}</h3>
        <div className="lista-deudas-vacia">
          <p>{vacio}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lista-deudas-container">
      <h3 className="lista-deudas-titulo">{titulo}</h3>
      <div className="lista-deudas">
        {datos.map((deuda) => {
          const progreso = calcularProgreso(deuda.montoPagado, deuda.montoTotal);
          const esPagosParciales = parseFloat(deuda.montoPagado) > 0;
          const usuario = tipo === 'cobros' 
            ? { nombre: deuda.nombreDeudor, foto: deuda.fotoPerfil, id: deuda.idUsuarioDeudor }
            : { nombre: deuda.nombreAcreedor, foto: deuda.fotoPerfil, id: deuda.idUsuarioAcreedor };

          return (
            <div key={`${tipo}-${deuda.idGasto}-${usuario.id}`} className="deuda-item">
              <div className="deuda-header">
                <div className="deuda-usuario">
                  {usuario.foto ? (
                    <img
                      src={obtenerURLFoto(usuario.foto)}
                      alt={usuario.nombre}
                      className="deuda-avatar"
                    />
                  ) : (
                    <div className="deuda-avatar-placeholder">
                      {usuario.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="deuda-info">
                    <h4 className="deuda-nombre">{usuario.nombre}</h4>
                    <p className="deuda-descripcion">{deuda.descripcionGasto}</p>
                  </div>
                </div>
                <div className="deuda-monto-container">
                  <span className={`deuda-monto ${tipo}`}>
                    {formatearMoneda(deuda.monto)}
                  </span>
                  {esPagosParciales && (
                    <span className="deuda-total-label">
                      de {formatearMoneda(deuda.montoTotal)}
                    </span>
                  )}
                </div>
              </div>

              {esPagosParciales && (
                <div className="deuda-progreso">
                  <div className="progreso-info">
                    <span className="progreso-label">Progreso del pago</span>
                    <span className="progreso-porcentaje">{progreso.toFixed(0)}%</span>
                  </div>
                  <div className="progreso-barra">
                    <div 
                      className="progreso-relleno"
                      style={{ width: `${progreso}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="deuda-acciones">
                {tipo === 'deudas' && (
                  <>
                    {pagandoId === deuda.idGasto ? (
                      <div className="pago-form">
                        <div className="pago-form-group">
                          <label>Monto a pagar:</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={deuda.monto}
                            value={montoPago}
                            onChange={(e) => setMontoPago(e.target.value)}
                            className="pago-input"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="pago-form-group">
                          <label>Método de pago:</label>
                          <select
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            className="pago-select"
                          >
                            <option value="Transferencia bancaria">Transferencia bancaria</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                        <div className="pago-form-botones">
                          <button
                            onClick={() => handleConfirmarPago(deuda)}
                            className="boton-confirmar"
                          >
                            ✓ Confirmar
                          </button>
                          <button
                            onClick={handleCancelarPago}
                            className="boton-cancelar"
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleIniciarPago(deuda)}
                        className="boton-pagar"
                      >
                         Pagar
                      </button>
                    )}
                  </>
                )}
                {esPagosParciales && (
                  <button
                    onClick={() => onVerHistorial(deuda.idGasto)}
                    className="boton-historial"
                  >
                     Ver Historial
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListaDeudas;
