import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { construirURLEstatico } from '../../../config/api';
import './CrearGastoModal.css';

// SVG para Crear Gasto Rápido (Plus dentro de círculo)
const SVGCrearGasto = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 9V15M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CrearGastoModal = ({ isOpen, onClose, onCrear, participantes, categorias }) => {
  // Obtener fecha actual en zona horaria GMT-6 (México)
  const obtenerFechaGMT6 = () => {
    const now = new Date();
    // Crear fecha en GMT-6
    const gmt6Date = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
    
    // Formatear como YYYY-MM-DDTHH:mm para el input datetime-local
    const year = gmt6Date.getFullYear();
    const month = String(gmt6Date.getMonth() + 1).padStart(2, '0');
    const day = String(gmt6Date.getDate()).padStart(2, '0');
    const hours = String(gmt6Date.getHours()).padStart(2, '0');
    const minutes = String(gmt6Date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    descripcion: '',
    monto_total: '',
    id_categoria: '',
    fecha_gasto: obtenerFechaGMT6(),
    participantes: [],
    tipo_division: 'equitativa',
    montos_personalizados: [],
    moneda: 'MXN',
    id_pagador: ''
  });
  const [cargando, setCargando] = useState(false);
  const [errors, setErrors] = useState({});
  const [avisoParticipantes, setAvisoParticipantes] = useState('');

  // Bloquear scroll del body cuando el modal está abierto y actualizar fecha
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Actualizar la fecha cuando el modal se abre
      setFormData(prev => ({
        ...prev,
        fecha_gasto: obtenerFechaGMT6()
      }));
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup cuando el componente se desmonta
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el pagador, actualizar participantes
    if (name === 'id_pagador') {
      setFormData(prev => {
        const nuevoPagador = parseInt(value);
        let participantesActualizados = prev.participantes.filter(id => id !== prev.id_pagador);
        
        if (nuevoPagador) {
          participantesActualizados = [...participantesActualizados, nuevoPagador];
        }
        
        return {
          ...prev,
          [name]: value,
          participantes: participantesActualizados
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleParticipanteToggle = (participanteId) => {
    // No permitir seleccionar participantes si no hay pagador seleccionado
    if (!formData.id_pagador) {
      setAvisoParticipantes('Selecciona un pagador primero');
      setTimeout(() => setAvisoParticipantes(''), 3000);
      return;
    }
    
    // No permitir deseleccionar al pagador actual
    if (participanteId === parseInt(formData.id_pagador)) {
      return;
    }
    
    setAvisoParticipantes('');
    
    setFormData(prev => {
      const participantesActualizados = prev.participantes.includes(participanteId)
        ? prev.participantes.filter(id => id !== participanteId)
        : [...prev.participantes, participanteId];
      
      // Si es división personalizada, actualizar montos
      if (prev.tipo_division === 'monto_fijo') {
        const montosActualizados = participantesActualizados.map(id => {
          const montoExistente = prev.montos_personalizados.find(m => m.id_usuario === id);
          return montoExistente || { id_usuario: id, monto: 0 };
        });
        
        return {
          ...prev,
          participantes: participantesActualizados,
          montos_personalizados: montosActualizados
        };
      }
      
      return {
        ...prev,
        participantes: participantesActualizados
      };
    });
  };

  const handleMontoPersonalizadoChange = (participanteId, monto) => {
    setFormData(prev => ({
      ...prev,
      montos_personalizados: prev.montos_personalizados.map(m =>
        m.id_usuario === participanteId ? { ...m, monto: parseFloat(monto) || 0 } : m
      )
    }));
  };

  const handleTipoDivisionChange = (tipo) => {
    setFormData(prev => {
      if (tipo === 'monto_fijo') {
        // Inicializar montos personalizados para participantes seleccionados
        const montosPersonalizados = prev.participantes.map(id => ({
          id_usuario: id,
          monto: 0
        }));
        
        return {
          ...prev,
          tipo_division: tipo,
          montos_personalizados: montosPersonalizados
        };
      } else {
        return {
          ...prev,
          tipo_division: tipo,
          montos_personalizados: []
        };
      }
    });
  };

  const calcularTotalPersonalizado = () => {
    return formData.montos_personalizados.reduce((sum, m) => sum + (m.monto || 0), 0);
  };

  const calcularMontoPorParticipante = () => {
    if (!formData.monto_total || formData.participantes.length === 0) {
      return 0;
    }
    return parseFloat(formData.monto_total) / formData.participantes.length;
  };

  const validarFormulario = () => {
    const nuevosErrors = {};
    
    if (!formData.descripcion.trim()) {
      nuevosErrors.descripcion = 'La descripción es requerida';
    }
    
    if (!formData.monto_total || parseFloat(formData.monto_total) <= 0) {
      nuevosErrors.monto_total = 'El monto debe ser mayor a 0';
    }
    
    if (!formData.id_categoria) {
      nuevosErrors.id_categoria = 'Selecciona una categoría';
    }
    
    if (!formData.id_pagador) {
      nuevosErrors.id_pagador = 'Selecciona quién pagó';
    }
    
    if (formData.participantes.length === 0) {
      nuevosErrors.participantes = 'Selecciona al menos un participante';
    }
    
    if (formData.tipo_division === 'monto_fijo') {
      const totalPersonalizado = calcularTotalPersonalizado();
      const montoTotal = parseFloat(formData.monto_total);
      
      if (Math.abs(totalPersonalizado - montoTotal) > 0.01) {
        nuevosErrors.montos_personalizados = `La suma de montos individuales (${totalPersonalizado.toFixed(2)}) debe ser igual al monto total (${montoTotal.toFixed(2)})`;
      }
    }
    
    setErrors(nuevosErrors);
    return Object.keys(nuevosErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setCargando(true);
    
    try {
      await onCrear(formData);
      // Si llegamos aquí, el gasto se creó exitosamente
      setFormData({
        descripcion: '',
        monto_total: '',
        id_categoria: '',
        fecha_gasto: obtenerFechaGMT6(),
        participantes: [],
        tipo_division: 'equitativa',
        montos_personalizados: [],
        moneda: 'MXN',
        id_pagador: ''
      });
      setErrors({});
    } catch (error) {
      // El error ya se maneja en el componente padre
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    if (!cargando) {
      setFormData({
        descripcion: '',
        monto_total: '',
        id_categoria: '',
        fecha_gasto: obtenerFechaGMT6(),
        participantes: [],
        tipo_division: 'equitativa',
        montos_personalizados: [],
        moneda: 'MXN',
        id_pagador: ''
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content crear-gasto-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <SVGCrearGasto />
            Crear Nuevo Gasto
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="crear-gasto-form">
          {/* Sección principal de información - dos columnas */}
          <div className="info-principal">
            <div className="form-group">
              <label htmlFor="descripcion">
                Descripción *
              </label>
              <input
                type="text"
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Ej: Cena, Uber, etc..."
                className={errors.descripcion ? 'error' : ''}
                disabled={cargando}
              />
              {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
            </div>

            <div className="form-row-compact">
              <div className="form-group">
                <label htmlFor="monto_total">
                  Monto *
                </label>
                <div className="input-with-symbol">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    id="monto_total"
                    name="monto_total"
                    value={formData.monto_total}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={errors.monto_total ? 'error' : ''}
                    disabled={cargando}
                  />
                </div>
                {errors.monto_total && <span className="error-message">{errors.monto_total}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="id_categoria">
                  Categoría *
                </label>
                <select
                  id="id_categoria"
                  name="id_categoria"
                  value={formData.id_categoria}
                  onChange={handleInputChange}
                  className={errors.id_categoria ? 'error' : ''}
                  disabled={cargando}
                >
                  <option value="">Seleccionar</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id_categoria} value={categoria.id_categoria}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
                {errors.id_categoria && <span className="error-message">{errors.id_categoria}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fecha_gasto">
                Fecha *
              </label>
              <input
                type="datetime-local"
                id="fecha_gasto"
                name="fecha_gasto"
                value={formData.fecha_gasto}
                onChange={handleInputChange}
                disabled={cargando}
                onKeyDown={(e) => e.preventDefault()}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
              />
            </div>

            <div className="form-group">
              <label htmlFor="id_pagador">
                ¿Quién pagó? *
              </label>
              <select
                id="id_pagador"
                name="id_pagador"
                value={formData.id_pagador}
                onChange={handleInputChange}
                className={errors.id_pagador ? 'error' : ''}
                disabled={cargando}
              >
                <option value="">Seleccionar pagador</option>
                {participantes.map(participante => (
                  <option key={participante.id_usuario} value={participante.id_usuario}>
                    {participante.nombre || participante.nombre_usuario || 'Usuario'}
                  </option>
                ))}
              </select>
              {errors.id_pagador && <span className="error-message">{errors.id_pagador}</span>}
            </div>
          </div>

          {/* Sección participantes y división */}
          <div className="seccion-participantes">
            <div className="participantes-seccion">
              <label className="seccion-titulo">Participantes * {errors.participantes && <span className="error-message">({errors.participantes})</span>}</label>
              <div className="participantes-lista">
                {participantes && participantes.length > 0 ? participantes.map(participante => {
                  const obtenerFotoPerfil = () => {
                    if (participante.foto_perfil) {
                      return construirURLEstatico(participante.foto_perfil);
                    }
                    return '/logo.png';
                  };

                  const esPagador = parseInt(formData.id_pagador) === participante.id_usuario;
                  const estaSeleccionado = formData.participantes.includes(participante.id_usuario);

                  return (
                    <label 
                      key={participante.id_usuario} 
                      className={`participante-item ${esPagador ? 'es-pagador' : ''}`}
                      title={esPagador ? 'Pagador - No se puede deseleccionar' : ''}
                    >
                      <input
                        type="checkbox"
                        checked={estaSeleccionado}
                        onChange={() => handleParticipanteToggle(participante.id_usuario)}
                        disabled={cargando || esPagador}
                      />
                      <span className="checkmark"></span>
                      <div className="participante-avatar">
                        <img 
                          src={obtenerFotoPerfil()} 
                          alt={`Foto de ${participante.nombre || participante.nombre_usuario || 'Usuario'}`}
                          onError={(e) => { e.target.src = '/logo.png'; }}
                        />
                      </div>
                      <div className="participante-info">
                        <span className="participante-nombre">
                          {participante.nombre || participante.nombre_usuario || 'Usuario'}
                          {esPagador && <span className="badge-pagador">Pagador</span>}
                        </span>
                      </div>
                    </label>
                  );
                }) : (
                  <div className="no-participantes">
                    <p>No hay participantes disponibles.</p>
                  </div>
                )}
              </div>
              {avisoParticipantes && (
                <div className="aviso-participantes">
                  {avisoParticipantes}
                </div>
              )}
            </div>

            <div className="division-seccion">
              <label className="seccion-titulo">División</label>
              <div className="division-tipos">
                <label className={`tipo-radio ${formData.tipo_division === 'equitativa' ? 'activo' : ''}`}>
                  <input
                    type="radio"
                    name="tipo_division"
                    value="equitativa"
                    checked={formData.tipo_division === 'equitativa'}
                    onChange={(e) => handleTipoDivisionChange(e.target.value)}
                    disabled={cargando || !formData.monto_total || formData.participantes.length === 0}
                  />
                  <span className="radio-checkmark"></span>
                  <div className="tipo-division-info">
                    <span className="tipo-nombre">Equitativa</span>
                    <span className="tipo-descripcion">Dividir en partes iguales</span>
                  </div>
                </label>
                
                <label className={`tipo-radio ${formData.tipo_division === 'monto_fijo' ? 'activo' : ''}`}>
                  <input
                    type="radio"
                    name="tipo_division"
                    value="monto_fijo"
                    checked={formData.tipo_division === 'monto_fijo'}
                    onChange={(e) => handleTipoDivisionChange(e.target.value)}
                    disabled={cargando || !formData.monto_total || formData.participantes.length === 0}
                  />
                  <span className="radio-checkmark"></span>
                  <div className="tipo-division-info">
                    <span className="tipo-nombre">Personalizada</span>
                    <span className="tipo-descripcion">Asignar montos específicos</span>
                  </div>
                </label>
              </div>
              {(!formData.monto_total || formData.participantes.length === 0) && (
                <p className="division-hint">
                  {!formData.monto_total && 'Ingresa un monto para habilitar la división'}
                  {formData.monto_total && formData.participantes.length === 0 && 'Selecciona participantes para habilitar la división'}
                </p>
              )}
            </div>
          </div>

          {/* Desglose de montos equitativos */}
          {formData.tipo_division === 'equitativa' && formData.participantes.length > 0 && formData.monto_total && (
            <div className="form-group montos-section">
              <label className="seccion-titulo">
                Desglose equitativo
              </label>
              <div className="montos-desglose">
                <p className="desglose-info">
                  Cada participante pagará: <strong>${calcularMontoPorParticipante().toFixed(2)}</strong>
                </p>
                <div className="desglose-participantes">
                  {formData.participantes.map(participanteId => {
                    const participante = participantes.find(p => p.id_usuario === participanteId);
                    
                    const obtenerFotoPerfil = () => {
                      if (participante?.foto_perfil) {
                        return construirURLEstatico(participante.foto_perfil);
                      }
                      return '/logo.png';
                    };
                    
                    return (
                      <div key={participanteId} className="desglose-item">
                        <div className="desglose-participante">
                          <div className="desglose-avatar">
                            <img 
                              src={obtenerFotoPerfil()} 
                              alt={`Foto de ${participante?.nombre || participante?.nombre_usuario || 'Usuario'}`}
                              onError={(e) => { e.target.src = '/logo.png'; }}
                            />
                          </div>
                          <span className="desglose-nombre">
                            {participante?.nombre || participante?.nombre_usuario || 'Usuario'}
                          </span>
                        </div>
                        <span className="desglose-monto">
                          ${calcularMontoPorParticipante().toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="desglose-total">
                  <strong>Total: ${formData.monto_total}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Montos personalizados - solo si es necesario */}
          {formData.tipo_division === 'monto_fijo' && formData.participantes.length > 0 && (
            <div className="form-group montos-section">
              <label className="seccion-titulo">
                Montos individuales
                <FontAwesomeIcon icon={faCalculator} className="calculator-icon" />
              </label>
              <div className="montos-personalizados">
                {formData.montos_personalizados.map(monto => {
                  const participante = participantes.find(p => p.id_usuario === monto.id_usuario);
                  
                  const obtenerFotoPerfil = () => {
                    if (participante?.foto_perfil) {
                      return construirURLEstatico(participante.foto_perfil);
                    }
                    return '/logo.png';
                  };
                  
                  return (
                    <div key={monto.id_usuario} className="monto-personalizado">
                      <div className="participante-con-foto">
                        <div className="participante-avatar-small">
                          <img 
                            src={obtenerFotoPerfil()} 
                            alt={`Foto de ${participante?.nombre || participante?.nombre_usuario || 'Usuario'}`}
                            onError={(e) => { e.target.src = '/logo.png'; }}
                          />
                        </div>
                        <span className="participante-nombre">
                          {participante?.nombre || participante?.nombre_usuario || 'Usuario'}
                        </span>
                      </div>
                      <div className="input-with-symbol">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          value={monto.monto}
                          onChange={(e) => handleMontoPersonalizadoChange(monto.id_usuario, e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          disabled={cargando}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="total-personalizado">
                  <strong>Total: ${calcularTotalPersonalizado().toFixed(2)}</strong>
                  {formData.monto_total && (
                    <span className={calcularTotalPersonalizado() === parseFloat(formData.monto_total) ? 'match' : 'no-match'}>
                      / ${parseFloat(formData.monto_total || 0).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              {errors.montos_personalizados && (
                <span className="error-message">{errors.montos_personalizados}</span>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-cancelar" 
              onClick={handleClose}
              disabled={cargando}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-crear"
              disabled={cargando}
            >
              {cargando ? 'Creando...' : 'Crear Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearGastoModal;
