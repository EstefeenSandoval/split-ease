import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ParticipantCard from './ParticipantCard';
import API_ENDPOINTS from '../config/api';
import './DetalleGrupo.css';

const DetalleGrupo = ({ grupo, onVolver, onEditar, onEliminar }) => {
  const [participantes, setParticipantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);

  useEffect(() => {
    cargarParticipantes();
    obtenerUsuarioActual();
  }, [grupo.id_grupo]);

  const obtenerUsuarioActual = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsuarioActual(payload);
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  };

  const cargarParticipantes = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.grupos.obtenerParticipantes(grupo.id_grupo), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setParticipantes(data.participantes);
      } else {
        toast.error(data.error || 'Error al cargar participantes');
        setError(data.error || 'Error al cargar participantes');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarParticipante = async (idUsuario) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este participante del grupo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.grupos.eliminarParticipante(grupo.id_grupo, idUsuario), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Participante eliminado correctamente');
        cargarParticipantes(); // Recargar la lista
      } else {
        toast.error(data.error || 'Error al eliminar participante');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(grupo.codigo_invitacion);
    toast.success('Código copiado al portapapeles');
  };

  const esAdminActual = usuarioActual && grupo.id_creador === usuarioActual.id_usuario;

  return (
    <div className="detalle-grupo">
      <div className="detalle-header">
        <button className="btn-volver" onClick={onVolver}>
          ← Volver a Mis Grupos
        </button>
        
        <div className="grupo-info">
          <h1>{grupo.nombre_grupo}</h1>
          {grupo.descripcion && (
            <p className="grupo-descripcion">{grupo.descripcion}</p>
          )}
          <p className="grupo-creador">
            Creado por: <strong>{grupo.creador_nombre}</strong>
          </p>
          <p className="grupo-fecha">
            Fecha de creación: {new Date(grupo.fecha_creacion).toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className="grupo-acciones">
          {esAdminActual && (
            <>
              <button className="btn-editar" onClick={() => onEditar(grupo)}>
                ✏️ Editar
              </button>
              <button className="btn-eliminar-grupo" onClick={() => onEliminar(grupo)}>
                🗑️ Eliminar Grupo
              </button>
            </>
          )}
          
          <button 
            className="btn-codigo"
            onClick={() => setMostrarCodigo(!mostrarCodigo)}
          >
            {mostrarCodigo ? '🔒 Ocultar' : '🔗 Mostrar'} Código
          </button>
        </div>
      </div>

      {mostrarCodigo && (
        <div className="codigo-invitacion">
          <h3>Código de Invitación</h3>
          <div className="codigo-container">
            <code>{grupo.codigo_invitacion}</code>
            <button className="btn-copiar" onClick={copiarCodigo}>
              📋 Copiar
            </button>
          </div>
          <p className="codigo-info">
            Comparte este código con otras personas para que se unan al grupo.
          </p>
        </div>
      )}

      <div className="participantes-section">
        <h2>Participantes ({participantes.length})</h2>
        
        {cargando ? (
          <div className="loading">Cargando participantes...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="participantes-lista">
            {participantes.map(participante => (
              <ParticipantCard
                key={participante.id_usuario}
                participante={participante}
                esAdmin={esAdminActual}
                puedeEliminar={esAdminActual && participante.id_usuario !== grupo.id_creador}
                onEliminar={handleEliminarParticipante}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleGrupo;
