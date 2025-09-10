import React, { useState } from 'react';
import { toast } from 'react-toastify';
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

  return (
    <div className="unirse-grupo-overlay">
      <div className="unirse-grupo-modal">
        <h2>Unirse a un Grupo</h2>
        <p>Introduce el código de invitación que te proporcionó el administrador del grupo.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="codigo_invitacion">Código de Invitación</label>
            <input
              type="text"
              id="codigo_invitacion"
              value={codigoInvitacion}
              onChange={(e) => setCodigoInvitacion(e.target.value)}
              placeholder="Introduce el código aquí..."
              required
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
