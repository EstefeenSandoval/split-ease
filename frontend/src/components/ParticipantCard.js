import React, { useState } from 'react';
import './ParticipantCard.css';

const ParticipantCard = ({ participante, esAdmin, puedeEliminar, onEliminar }) => {
  const [imagenError, setImagenError] = useState(false);

  const formatearUltimoLogin = (fechaLogin) => {
    if (!fechaLogin) return 'Nunca se ha conectado';
    
    const fecha = new Date(fechaLogin);
    const ahora = new Date();
    const diferencia = ahora - fecha;
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (minutos < 60) {
      return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    } else if (horas < 24) {
      return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    } else if (dias < 7) {
      return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
    } else {
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const obtenerFotoPerfil = () => {
    if (imagenError) {
      return '/logo.png';
    }
    
    if (participante.foto_perfil) {
      // Verificar si la URL ya incluye el protocolo y host
      if (participante.foto_perfil.startsWith('http')) {
        return participante.foto_perfil;
      } else {
        // Si es una ruta relativa, agregar el host
        return `http://localhost:3100${participante.foto_perfil}`;
      }
    }
    return '/logo.png'; // Imagen por defecto
  };

  const manejarErrorImagen = (e) => {
    console.log('Error al cargar imagen:', obtenerFotoPerfil());
    setImagenError(true);
    e.target.src = '/logo.png';
  };

  return (
    <div className="participant-card">
      <div className="participant-avatar">
        <img 
          src={obtenerFotoPerfil()} 
          alt={`Foto de ${participante.nombre}`}
          onError={manejarErrorImagen}
          style={{
            objectFit: 'cover',
            width: '60px',
            height: '60px',
            borderRadius: '50%'
          }}
        />
        {participante.rol === 'administrador' && (
          <div className="admin-badge">Admin</div>
        )}
      </div>
      
      <div className="participant-info">
        <h4>{participante.nombre}</h4>
        <p className="participant-email">{participante.email}</p>
        <p className="participant-last-login">
          {formatearUltimoLogin(participante.ultimo_login)}
        </p>
        <p className="participant-join-date">
          Miembro desde: {new Date(participante.fecha_union).toLocaleDateString('es-ES')}
        </p>
      </div>
      
      {puedeEliminar && (
        <div className="participant-actions">
          <button 
            className="btn-eliminar"
            onClick={() => onEliminar(participante.id_usuario)}
            title={participante.rol === 'administrador' ? 'No puedes eliminar a un administrador' : 'Eliminar participante'}
            disabled={participante.rol === 'administrador'}
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default ParticipantCard;
