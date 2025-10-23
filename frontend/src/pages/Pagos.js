import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, construirURLEstatico } from '../config/api';
import './Pagos.css';

/**
 * Página de Historial de Pagos
 * Muestra todos los pagos relacionados con un gasto específico
 */
const Pagos = () => {
  const { idGasto } = useParams();
  const navigate = useNavigate();
  
  const [pagos, setPagos] = useState([]);
  const [gastoInfo, setGastoInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener foto de perfil
  const obtenerFotoPerfilUrl = (fotoUrl) => {
    return construirURLEstatico(fotoUrl);
  };

  // Cargar historial de pagos
  useEffect(() => {
    const cargarHistorialPagos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(API_ENDPOINTS.dashboard.historialPagos(idGasto), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok) {
          setPagos(data.pagos || []);
          setGastoInfo(data.gastoInfo || null);
        } else {
          setError(data.error || 'Error al cargar el historial de pagos');
        }
      } catch (err) {
        console.error('Error al cargar historial de pagos:', err);
        setError('No se pudo conectar con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    if (idGasto) {
      cargarHistorialPagos();
    }
  }, [idGasto, navigate]);

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener icono según tipo de pago
  const getIconoPago = (tipoPago) => {
    switch (tipoPago) {
      case 'total':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="pago-icon-svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'parcial':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="pago-icon-svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="pago-icon-svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
    }
  };

  // Obtener etiqueta según tipo de pago
  const getEtiquetaPago = (tipoPago) => {
    switch (tipoPago) {
      case 'total':
        return 'Pago Total';
      case 'parcial':
        return 'Pago Parcial';
      default:
        return 'Pago';
    }
  };

  if (isLoading) {
    return (
      <div className="pagos-page">
        <div className="pagos-loading">
          <div className="pagos-spinner"></div>
          <p>Cargando historial de pagos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pagos-page">
        <div className="pagos-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="pagos-error-icon-svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="pagos-btn-back"
            onClick={() => navigate(-1)}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pagos-page">
      {/* Header */}
      <div className="pagos-header">
        <button 
          className="pagos-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <div className="pagos-header-content">
          <h1 className="pagos-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '32px', height: '32px', display: 'inline-block', marginRight: '12px', verticalAlign: 'middle' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Historial de Pagos
          </h1>
          {gastoInfo && (
            <p className="pagos-subtitle">{gastoInfo.descripcion}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pagos-content">
        {pagos.length === 0 ? (
          <div className="pagos-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="pagos-empty-icon-svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3>No hay pagos registrados</h3>
            <p>Aún no se han realizado pagos para este gasto.</p>
          </div>
        ) : (
          <div className="pagos-list">
            {pagos.map((pago, index) => (
              <div key={pago.idPago || index} className="pago-card">
                <div className="pago-card-header">
                  <div className="pago-icon">{getIconoPago(pago.tipoPago)}</div>
                  <div className="pago-info">
                    <h3 className="pago-tipo">{getEtiquetaPago(pago.tipoPago)}</h3>
                    <p className="pago-fecha">{formatearFecha(pago.fecha)}</p>
                  </div>
                  <div className="pago-monto-principal">
                    <span className="pago-monto">${parseFloat(pago.monto).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pago-card-body">
                  <div className="pago-detalle">
                    <span className="pago-label">De:</span>
                    <div className="pago-usuario">
                      <div className="pago-usuario-avatar">
                        {pago.fotoPagador ? (
                          <>
                            <img 
                              src={obtenerFotoPerfilUrl(pago.fotoPagador)} 
                              alt={pago.nombrePagador}
                              className="pago-avatar-img"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="pago-avatar-placeholder" style={{ display: 'none' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          </>
                        ) : (
                          <div className="pago-avatar-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="pago-usuario-nombre">{pago.nombrePagador}</span>
                    </div>
                  </div>
                  
                  <div className="pago-detalle">
                    <span className="pago-label">Para:</span>
                    <div className="pago-usuario">
                      <div className="pago-usuario-avatar">
                        {pago.fotoReceptor ? (
                          <>
                            <img 
                              src={obtenerFotoPerfilUrl(pago.fotoReceptor)} 
                              alt={pago.nombreReceptor}
                              className="pago-avatar-img"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="pago-avatar-placeholder" style={{ display: 'none' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          </>
                        ) : (
                          <div className="pago-avatar-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="pago-usuario-nombre">{pago.nombreReceptor}</span>
                    </div>
                  </div>

                  {pago.descripcion && (
                    <div className="pago-detalle">
                      <span className="pago-label">Descripción:</span>
                      <span className="pago-value">{pago.descripcion}</span>
                    </div>
                  )}

                  <div className="pago-stats">
                    <div className="pago-stat">
                      <span className="pago-stat-label">Deuda total</span>
                      <span className="pago-stat-value">
                        ${parseFloat(pago.montoTotalDeuda).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="pago-stat">
                      <span className="pago-stat-label">Saldo restante</span>
                      <span className={`pago-stat-value ${parseFloat(pago.saldoRestante) === 0 ? 'pago-stat-value-zero' : ''}`}>
                        ${parseFloat(pago.saldoRestante).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {parseFloat(pago.saldoRestante) === 0 && (
                    <div className="pago-badge-completado">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Deuda saldada
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagos;
