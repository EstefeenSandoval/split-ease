import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { API_ENDPOINTS } from '../config/api';
import './EliminarGrupoModal.css';

const EliminarGrupoModal = ({ isOpen, onClose, grupo, onGrupoEliminado }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleEliminar = async () => {
    const nombreGrupo = grupo?.nombre_grupo || grupo?.nombre || '';
    if (confirmText !== nombreGrupo) {
      toast.error('El nombre del grupo no coincide');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.grupos.eliminar}/${grupo.id_grupo}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Grupo eliminado exitosamente');
        onGrupoEliminado(grupo.id_grupo);
        onClose();
        setConfirmText('');
      } else {
        toast.error(data.mensaje || 'Error al eliminar el grupo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al eliminar el grupo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmText('');
    onClose();
  };

  if (!isOpen || !grupo) return null;

  const nombreGrupo = grupo?.nombre_grupo || grupo?.nombre || '';
  const canDelete = confirmText === nombreGrupo && !isLoading;

  return (
    <div className="eliminar-grupo-overlay" onClick={handleCancel}>
      <div className="eliminar-grupo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
        
        <h2>Eliminar Grupo</h2>
        
        <div className="warning-content">
          <p>
            Estás a punto de eliminar el grupo <strong>"{nombreGrupo}"</strong>.
          </p>
          
          <div className="warning-box">
            <p>
              <strong><FontAwesomeIcon icon={faExclamationTriangle} /> Esta acción es permanente e irreversible.</strong>
            </p>
            <ul>
              <li>Se eliminarán todos los participantes del grupo</li>
              <li>Se perderán todos los datos asociados</li>
              <li>No podrás recuperar esta información</li>
            </ul>
          </div>

          <div className="confirmation-section">
            <label htmlFor="confirmText">
              Para confirmar, escribe el nombre del grupo: <strong>{nombreGrupo}</strong>
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe el nombre del grupo aquí"
              disabled={isLoading}
              className="confirm-input"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-cancelar"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-eliminar"
            onClick={handleEliminar}
            disabled={!canDelete}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Grupo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliminarGrupoModal;
