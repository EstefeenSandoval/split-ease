import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './CrearGrupoForm.css';

const CrearGrupoForm = ({ onCrear, onCancelar, cargando, grupoInicial }) => {
  const [formData, setFormData] = useState({
    nombre_grupo: '',
    descripcion: ''
  });

  useEffect(() => {
    if (grupoInicial) {
      setFormData({
        nombre_grupo: grupoInicial.nombre_grupo || '',
        descripcion: grupoInicial.descripcion || ''
      });
    }
  }, [grupoInicial]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nombre_grupo.trim()) {
      onCrear(formData);
    } else {
      toast.error('El nombre del grupo es obligatorio');
    }
  };

  const esEdicion = !!grupoInicial;

  return (
    <div className="crear-grupo-overlay">
      <div className="crear-grupo-modal">
        <h2>{esEdicion ? 'Editar Grupo' : 'Crear Nuevo Grupo'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre_grupo">Nombre del Grupo *</label>
            <input
              type="text"
              id="nombre_grupo"
              name="nombre_grupo"
              value={formData.nombre_grupo}
              onChange={handleChange}
              placeholder="Ej: Viaje a la playa, Gastos del departamento..."
              required
              maxLength="150"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="descripcion">Descripción (opcional)</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe el propósito del grupo..."
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancelar"
              onClick={onCancelar}
              disabled={cargando}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-crear"
              disabled={cargando || !formData.nombre_grupo.trim()}
            >
              {cargando ? (esEdicion ? 'Guardando...' : 'Creando...') : (esEdicion ? 'Guardar Cambios' : 'Crear Grupo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearGrupoForm;
