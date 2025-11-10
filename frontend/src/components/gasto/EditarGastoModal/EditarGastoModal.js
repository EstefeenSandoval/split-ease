import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit, faCalculator } from '@fortawesome/free-solid-svg-icons';
import { construirURLEstatico } from '../../../config/api';
import './EditarGastoModal.css';

const EditarGastoModal = ({
  isOpen,
  onClose,
  onActualizar,
  gasto,
  participantes,
  categorias,
  cargando
}) => {
  const [formData, setFormData] = useState({
    descripcion: '',
    monto_total: '',
    id_categoria: '',
    fecha_gasto: '',
    participantes: [],
    tipo_division: 'equitativa',
    montos_personalizados: [],
    moneda: 'MXN'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && gasto) {
      setFormData({
        descripcion: gasto.descripcion || '',
        monto_total: gasto.monto_total || '',
        id_categoria: gasto.id_categoria || '',
        fecha_gasto: gasto.fecha_gasto ? gasto.fecha_gasto.slice(0, 16) : '',
        participantes: gasto.participantes?.map(p => p.id_usuario) || [],
        tipo_division: gasto.tipo_division || 'equitativa',
        montos_personalizados: gasto.detalles_reparto?.map(d => ({
          id_usuario: d.id_usuario,
          monto: d.monto
        })) || [],
        moneda: gasto.moneda || 'MXN'
      });
      setErrors({});
    }
  }, [isOpen, gasto]);

  if (!isOpen || !gasto) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleParticipantesChange = (e) => {
    const { value, checked } = e.target;
    const idUsuario = parseInt(value);

    if (checked) {
      setFormData(prev => ({
        ...prev,
        participantes: [...prev.participantes, idUsuario]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        participantes: prev.participantes.filter(id => id !== idUsuario)
      }));
    }

    if (errors.participantes) {
      setErrors(prev => ({
        ...prev,
        participantes: ''
      }));
    }
  };

  const handleTipoDivisionChange = (tipo) => {
    setFormData(prev => ({
      ...prev,
      tipo_division: tipo
    }));
  };

  const handleMontoPersonalizadoChange = (idUsuario, valor) => {
    setFormData(prev => {
      const index = prev.montos_personalizados.findIndex(m => m.id_usuario === idUsuario);
      let nuevosMontos = [...prev.montos_personalizados];

      if (index !== -1) {
        nuevosMontos[index] = { id_usuario: idUsuario, monto: parseFloat(valor) || 0 };
      } else {
        nuevosMontos.push({ id_usuario: idUsuario, monto: parseFloat(valor) || 0 });
      }

      return {
        ...prev,
        montos_personalizados: nuevosMontos
      };
    });
  };

  const calcularTotalPersonalizado = () => {
    return formData.montos_personalizados.reduce((sum, m) => sum + m.monto, 0);
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

    if (!formData.fecha_gasto) {
      nuevosErrors.fecha_gasto = 'La fecha es requerida';
    }

    if (formData.participantes.length === 0) {
      nuevosErrors.participantes = 'Selecciona al menos un participante';
    }

    if (formData.tipo_division === 'monto_fijo') {
      const totalPersonalizado = calcularTotalPersonalizado();
      const montoTotal = parseFloat(formData.monto_total);

      if (Math.abs(totalPersonalizado - montoTotal) > 0.01) {
        nuevosErrors.montos_personalizados = `La suma debe ser igual a ${montoTotal.toFixed(2)}`;
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

    await onActualizar(formData);
  };

  const handleClose = () => {
    if (!cargando) {
      setFormData({
        descripcion: '',
        monto_total: '',
        id_categoria: '',
        fecha_gasto: '',
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
      <div className="modal-content editar-gasto-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faEdit} /> Editar Gasto
          </h2>
          <button
            className="btn-cerrar"
            onClick={handleClose}
            disabled={cargando}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editar-gasto-form">
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
              placeholder="Ej: Cena en restaurante..."
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
            {errors.fecha_gasto && <span className="error-message">{errors.fecha_gasto}</span>}
          </div>

          <div className="form-group">
            <label>Participantes * {errors.participantes && <span className="error-message">({errors.participantes})</span>}</label>
            <div className="participantes-lista">
              {participantes && participantes.length > 0 ? (
                participantes.map(participante => (
                  <label key={participante.id_usuario} className="participante-item">
                    <input
                      type="checkbox"
                      value={participante.id_usuario}
                      checked={formData.participantes.includes(participante.id_usuario)}
                      onChange={handleParticipantesChange}
                      disabled={cargando}
                    />
                    <div className="participante-avatar">
                      {participante.foto_perfil ? (
                        <img
                          src={construirURLEstatico(participante.foto_perfil)}
                          alt={participante.nombre}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {(participante.nombre || participante.nombre_usuario || 'U').charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="participante-info">
                      <span className="participante-nombre">
                        {participante.nombre || participante.nombre_usuario}
                      </span>
                      <span className="participante-email">
                        {participante.email}
                      </span>
                    </div>
                  </label>
                ))
              ) : (
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
                <span className="radio-label">
                  <strong>Equitativa</strong>
                  <small>Divide el total en partes iguales</small>
                </span>
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
                <span className="radio-label">
                  <strong>Monto fijo</strong>
                  <small>Asigna montos específicos a cada persona</small>
                </span>
              </label>
            </div>
          </div>

          {formData.tipo_division === 'monto_fijo' && (
            <div className="form-group">
              <label>Distribución de montos</label>
              <div className="montos-personalizados">
                {formData.participantes.map(idUsuario => {
                  const participante = participantes.find(p => p.id_usuario === idUsuario);
                  const monto = formData.montos_personalizados.find(m => m.id_usuario === idUsuario)?.monto || 0;

                  return (
                    <div key={idUsuario} className="monto-personalizado">
                      <div className="participante-avatar">
                        {participante?.foto_perfil ? (
                          <img
                            src={construirURLEstatico(participante.foto_perfil)}
                            alt={participante.nombre}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {(participante?.nombre || participante?.nombre_usuario || 'U').charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="participante-info">
                        <span className="participante-nombre">{participante?.nombre || participante?.nombre_usuario}</span>
                      </div>
                      <div className="input-with-symbol">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          value={monto}
                          onChange={(e) => handleMontoPersonalizadoChange(idUsuario, e.target.value)}
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
              className="btn-actualizar"
              disabled={cargando}
            >
              {cargando ? 'Actualizando...' : 'Actualizar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarGastoModal;
