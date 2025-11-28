import React, { useState } from 'react';
import { toast } from '../../../utils/toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import './UnirseGrupoForm.css';

const UnirseGrupoForm = ({ onUnirse, onCancelar, cargando }) => {
  const [codigoInvitacion, setCodigoInvitacion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (codigoInvitacion.trim()) {
      onUnirse(codigoInvitacion.trim());
    } else {
      toast.error('Por favor, introduce un código de invitación válido');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setCodigoInvitacion(text.trim());
        toast.success('Código pegado desde el portapapeles');
      } else {
        toast.info('El portapapeles está vacío');
      }
    } catch (err) {
      toast.error('No se pudo acceder al portapapeles');
    }
  };

  return (
    <div className="unirse-grupo-overlay">
      <div className="unirse-grupo-modal">
        <h2>Unirse a un Grupo</h2>
        <p>Introduce el código de invitación que te proporcionó el administrador del grupo.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="codigo_invitacion">Código de Invitación</label>
            <div className="input-container">
              <input
                type="text"
                id="codigo_invitacion"
                value={codigoInvitacion}
                onChange={(e) => setCodigoInvitacion(e.target.value)}
                placeholder="Introduce el código aquí..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
                required
              />
              <button
                type="button"
                className="btn-paste"
                onClick={handlePasteFromClipboard}
                title="Pegar desde portapapeles"
                disabled={cargando}
              >
                <FontAwesomeIcon icon={faClipboard} />
              </button>
            </div>
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
              className="btn-unirse"
              disabled={cargando || !codigoInvitacion.trim()}
            >
              {cargando ? 'Uniéndose...' : 'Unirse al Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnirseGrupoForm;