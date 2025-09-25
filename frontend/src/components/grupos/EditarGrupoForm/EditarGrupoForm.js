import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../../config/api';
import './EditarGrupoForm.css';

const EditarGrupoForm = ({ isOpen, onClose, grupo, onGrupoActualizado }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (grupo) {
      setFormData({
        nombre: grupo.nombre_grupo || grupo.nombre || '',
        descripcion: grupo.descripcion || ''
      });
    }
  }, [grupo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error('El nombre del grupo es obligatorio');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.grupos.actualizar}/${grupo.id_grupo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre_grupo: formData.nombre,
          descripcion: formData.descripcion
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Grupo actualizado exitosamente');
        onGrupoActualizado(data.grupo);
        onClose();
        setFormData({ nombre: '', descripcion: '' });
      } else {
        toast.error(data.mensaje || 'Error al actualizar el grupo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al actualizar el grupo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: grupo?.nombre_grupo || grupo?.nombre || '',
      descripcion: grupo?.descripcion || ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="editar-grupo-overlay" onClick={handleCancel}>
      <div className="editar-grupo-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Editar Grupo</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre del grupo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Escribe el nombre del grupo"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción (opcional)</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Describe el propósito del grupo..."
              rows="4"
              disabled={isLoading}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancelar"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-actualizar"
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarGrupoForm;