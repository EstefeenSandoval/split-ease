/**
 * TicketScanner - Componente para escanear tickets y extraer items
 * Usa Capacitor Camera + Gemini AI para análisis OCR
 */

import React, { useState, useCallback } from 'react';
import { capturarTicket } from '../../../utils/cameraService';
import { isNativeApp } from '../../../utils/platform';
import './TicketScanner.css';

// Iconos inline SVG para evitar dependencias adicionales
const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
  </svg>
);

const ReceiptIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z"/>
    <line x1="8" y1="6" x2="16" y2="6"/>
    <line x1="8" y1="10" x2="16" y2="10"/>
    <line x1="8" y1="14" x2="12" y2="14"/>
  </svg>
);

// Límites definidos
const MAX_ITEMS = 25;
const MAX_CONCEPTO_LENGTH = 50;

// URL base de la API
const getApiBaseUrl = () => {
  const isCapacitor = window.Capacitor !== undefined;
  return process.env.REACT_APP_API_URL || 
    (isCapacitor || process.env.NODE_ENV === 'production' 
      ? 'https://backend-split-ease.up.railway.app' 
      : 'http://localhost:3100');
};

const TicketScanner = ({ participantes = [], onItemsChange, moneda = 'MXN' }) => {
  const [items, setItems] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  // Símbolo de moneda
  const currencySymbol = moneda === 'MXN' ? '$' : moneda === 'USD' ? '$' : moneda;

  // Actualizar items y notificar al padre
  const updateItems = useCallback((newItems) => {
    setItems(newItems);
    if (onItemsChange) {
      onItemsChange(newItems);
    }
  }, [onItemsChange]);

  // Escanear ticket con cámara
  const handleScan = async () => {
    setError(null);
    setIsScanning(true);

    try {
      // Capturar foto
      const imagen = await capturarTicket();
      
      // Enviar al backend para análisis
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/gastos/analizar-ticket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imagen: imagen.dataUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al analizar el ticket');
      }

      if (data.items && data.items.length > 0) {
        // Agregar items con id_usuario vacío (sin asignar)
        const newItems = data.items.map(item => ({
          ...item,
          id_usuario: '' // Sin asignar inicialmente
        }));
        updateItems([...items, ...newItems].slice(0, MAX_ITEMS));
      } else {
        setError('No se encontraron items en el ticket. Intenta con una foto más clara.');
      }
    } catch (err) {
      if (err.message === 'CANCELADO') {
        // Usuario canceló, no mostrar error
      } else {
        console.error('Error al escanear:', err);
        setError(err.message || 'Error al procesar el ticket');
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Agregar item manual
  const handleAddManual = () => {
    if (items.length >= MAX_ITEMS) {
      setError(`Máximo ${MAX_ITEMS} items permitidos`);
      return;
    }
    
    const newItem = {
      id: Date.now(),
      concepto: '',
      precio: 0,
      id_usuario: ''
    };
    updateItems([...items, newItem]);
  };

  // Actualizar concepto de un item
  const handleConceptoChange = (index, value) => {
    const newItems = [...items];
    newItems[index].concepto = value.substring(0, MAX_CONCEPTO_LENGTH);
    updateItems(newItems);
  };

  // Actualizar precio de un item
  const handlePrecioChange = (index, value) => {
    const newItems = [...items];
    const precio = parseFloat(value) || 0;
    newItems[index].precio = precio >= 0 ? precio : 0;
    updateItems(newItems);
  };

  // Asignar usuario a un item
  const handleUsuarioChange = (index, idUsuario) => {
    const newItems = [...items];
    newItems[index].id_usuario = idUsuario;
    updateItems(newItems);
  };

  // Eliminar un item
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    updateItems(newItems);
    setError(null);
  };

  // Limpiar todos los items
  const handleClearAll = () => {
    updateItems([]);
    setError(null);
  };

  // Calcular resumen por usuario
  const getSummary = () => {
    const summary = {};
    let sinAsignar = 0;

    items.forEach(item => {
      const precio = parseFloat(item.precio) || 0;
      if (item.id_usuario) {
        if (!summary[item.id_usuario]) {
          const usuario = participantes.find(p => p.id_usuario.toString() === item.id_usuario.toString());
          summary[item.id_usuario] = {
            nombre: usuario?.nombre || 'Usuario',
            total: 0,
            items: []
          };
        }
        summary[item.id_usuario].total += precio;
        summary[item.id_usuario].items.push(item.concepto);
      } else {
        sinAsignar += precio;
      }
    });

    return { porUsuario: summary, sinAsignar };
  };

  // Calcular total general
  const getTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.precio) || 0), 0);
  };

  const summary = getSummary();
  const total = getTotal();
  const hasItems = items.length > 0;

  return (
    <div className={`ticket-scanner ${hasItems ? 'has-items' : ''}`}>
      {/* Header */}
      <div className="ticket-scanner-header">
        <h4 className="ticket-scanner-title">
          <ReceiptIcon />
          Escanear Ticket (Opcional)
        </h4>
        <div className="ticket-scanner-actions">
          <button 
            type="button"
            className="btn-scan" 
            onClick={handleScan}
            disabled={isScanning}
          >
            <CameraIcon />
            {isScanning ? 'Analizando...' : (isNativeApp() ? 'Tomar Foto' : 'Subir Imagen')}
          </button>
          <button 
            type="button"
            className="btn-add-manual" 
            onClick={handleAddManual}
            disabled={items.length >= MAX_ITEMS}
          >
            <PlusIcon />
            Agregar Item
          </button>
          {hasItems && (
            <button 
              type="button"
              className="btn-clear-items" 
              onClick={handleClearAll}
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      {/* Estado de carga */}
      {isScanning && (
        <div className="scanning-indicator">
          <div className="scanning-spinner"></div>
          <span className="scanning-text">Analizando ticket con IA...</span>
        </div>
      )}

      {/* Mensaje cuando no hay items */}
      {!hasItems && !isScanning && (
        <div className="ticket-empty-state">
          <ReceiptIcon />
          <p>Toma una foto del ticket para extraer los items automáticamente, o agrégalos manualmente.</p>
        </div>
      )}

      {/* Lista de items */}
      {hasItems && !isScanning && (
        <>
          <div className="ticket-items-list">
            {items.map((item, index) => (
              <div key={item.id || index} className="ticket-item">
                <input
                  type="text"
                  className="ticket-item-concepto"
                  placeholder="Concepto"
                  value={item.concepto}
                  onChange={(e) => handleConceptoChange(index, e.target.value)}
                  maxLength={MAX_CONCEPTO_LENGTH}
                />
                <input
                  type="number"
                  className="ticket-item-precio"
                  placeholder="0.00"
                  value={item.precio || ''}
                  onChange={(e) => handlePrecioChange(index, e.target.value)}
                  min="0"
                  step="0.01"
                />
                <select
                  className="ticket-item-usuario"
                  value={item.id_usuario}
                  onChange={(e) => handleUsuarioChange(index, e.target.value)}
                >
                  <option value="">Sin asignar</option>
                  {participantes.map(p => (
                    <option key={p.id_usuario} value={p.id_usuario}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-remove-item"
                  onClick={() => handleRemoveItem(index)}
                  title="Eliminar item"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          {/* Resumen por usuario */}
          <div className="ticket-summary">
            <div className="ticket-summary-title">Resumen por persona</div>
            <div className="ticket-summary-list">
              {Object.entries(summary.porUsuario).map(([idUsuario, data]) => (
                <div key={idUsuario} className="ticket-summary-item">
                  <span className="ticket-summary-user">{data.nombre}</span>
                  <span className="ticket-summary-amount">
                    {currencySymbol}{data.total.toFixed(2)}
                  </span>
                </div>
              ))}
              {summary.sinAsignar > 0 && (
                <div className="ticket-summary-item sin-asignar">
                  <span className="ticket-summary-user">⚠️ Sin asignar</span>
                  <span className="ticket-summary-amount">
                    {currencySymbol}{summary.sinAsignar.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="ticket-total">
              <span className="ticket-total-label">Total del ticket</span>
              <span className="ticket-total-amount">
                {currencySymbol}{total.toFixed(2)}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="ticket-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default TicketScanner;
