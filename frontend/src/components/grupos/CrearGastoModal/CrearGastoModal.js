import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faCalculator } from '@fortawesome/free-solid-svg-icons';
import { construirURLEstatico } from '../../../config/api';
import './CrearGastoModal.css';

const CrearGastoModal = ({ isOpen, onClose, onCrear, participantes, categorias }) => {
  const [formData, setFormData] = useState({
    descripcion: '',
    monto_total: '',
    id_categoria: '',
    fecha_gasto: new Date().toISOString().slice(0, 16), // formato datetime-local
    participantes: [],
    tipo_division: 'equitativa',
    montos_personalizados: [],
    moneda: 'MXN'
  });
  const [cargando, setCargando] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleParticipanteToggle = (participanteId) => {
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
        fecha_gasto: new Date().toISOString().slice(0, 16),
        participantes: [],
        tipo_division: 'equitativa',
        montos_personalizados: [],
        moneda: 'MXN'
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
        fecha_gasto: new Date().toISOString().slice(0, 16),
        participantes: [],
        tipo_division: 'equitativa',
        montos_personalizados: [],
        moneda: 'MXN'
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
            <FontAwesomeIcon icon={faPlus} /> Crear Nuevo Gasto
          </h2>
          <button 
            className="btn-cerrar" 
            onClick={handleClose}
            disabled={cargando}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="crear-gasto-form">
          <div className="form-group">
            <label htmlFor="descripcion">
              Descripción del gasto *
            </label>
            <input
              type="text"
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Ej: Cena en restaurante, Uber al aeropuerto..."
              className={errors.descripcion ? 'error' : ''}
              disabled={cargando}
            />
            {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="monto_total">
                Monto total *
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
                <option value="">Seleccionar categoría</option>
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
              Fecha y hora del gasto *
            </label>
            <input
              type="datetime-local"
              id="fecha_gasto"
              name="fecha_gasto"
              value={formData.fecha_gasto}
              onChange={handleInputChange}
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label>Participantes * {errors.participantes && <span className="error-message">({errors.participantes})</span>}</label>
            <div className="participantes-lista">
              {participantes && participantes.length > 0 ? participantes.map(participante => {
                const obtenerFotoPerfil = () => {
                  if (participante.foto_perfil) {
                    return construirURLEstatico(participante.foto_perfil);
                  }
                  return '/logo.png'; // Imagen por defecto
                };

                return (
                  <label key={participante.id_usuario} className="participante-item">
                    <input
                      type="checkbox"
                      checked={formData.participantes.includes(participante.id_usuario)}
                      onChange={() => handleParticipanteToggle(participante.id_usuario)}
                      disabled={cargando}
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
                      </span>
                      <span className="participante-email">
                        {participante.email || 'Email no disponible'}
                      </span>
                    </div>
                  </label>
                );
              }) : (
                <div className="no-participantes">
                  <p>No hay participantes disponibles en este grupo.</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Tipo de división</label>
            <div className="division-tipos">
              <label className="tipo-radio">
                <input
                  type="radio"
                  name="tipo_division"
                  value="equitativa"
                  checked={formData.tipo_division === 'equitativa'}
                  onChange={(e) => handleTipoDivisionChange(e.target.value)}
                  disabled={cargando}
                />
                <span className="radio-checkmark"></span>
                <span>División equitativa</span>
              </label>
              
              <label className="tipo-radio">
                <input
                  type="radio"
                  name="tipo_division"
                  value="monto_fijo"
                  checked={formData.tipo_division === 'monto_fijo'}
                  onChange={(e) => handleTipoDivisionChange(e.target.value)}
                  disabled={cargando}
                />
                <span className="radio-checkmark"></span>
                <span>Montos personalizados</span>
              </label>
            </div>
          </div>

          {formData.tipo_division === 'monto_fijo' && formData.participantes.length > 0 && (
            <div className="form-group">
              <label>
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