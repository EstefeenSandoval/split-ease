import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CrearGrupoForm from '../components/CrearGrupoForm';
import UnirseGrupoForm from '../components/UnirseGrupoForm';
import EditarGrupoForm from '../components/EditarGrupoForm';
import EliminarGrupoModal from '../components/EliminarGrupoModal';
import DetalleGrupo from '../components/DetalleGrupo';
import API_ENDPOINTS from '../config/api';
import './Grupos.css';

const Grupos = () => {
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarCrearForm, setMostrarCrearForm] = useState(false);
  const [mostrarUnirseForm, setMostrarUnirseForm] = useState(false);
  const [mostrarEditarForm, setMostrarEditarForm] = useState(false);
  const [mostrarEliminarModal, setMostrarEliminarModal] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [editandoGrupo, setEditandoGrupo] = useState(null);

  useEffect(() => {
    cargarGrupos();
  }, []);

  const cargarGrupos = async () => {
    try {
      setCargando(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No estás autenticado');
        return;
      }

      const response = await fetch(API_ENDPOINTS.grupos.obtener, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setGrupos(data.grupos);
      } else {
        toast.error(data.error || 'Error al cargar grupos');
        setError(data.error || 'Error al cargar grupos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  const handleCrearGrupo = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.grupos.crear, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Grupo creado correctamente');
        setGrupos(prevGrupos => [...prevGrupos, data.grupo]);
        setMostrarCrearForm(false);
      } else {
        toast.error(data.error || 'Error al crear grupo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const handleUnirseGrupo = async (codigoInvitacion) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.grupos.unirse, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codigo_invitacion: codigoInvitacion })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Te has unido al grupo correctamente');
        setGrupos(prevGrupos => [...prevGrupos, data.grupo]);
        setMostrarUnirseForm(false);
      } else {
        toast.error(data.error || 'Error al unirse al grupo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const handleEditarGrupo = (grupo) => {
    setEditandoGrupo(grupo);
    setMostrarEditarForm(true);
  };

  const handleEliminarGrupo = (grupo) => {
    setEditandoGrupo(grupo);
    setMostrarEliminarModal(true);
  };

  const onGrupoActualizado = (grupoActualizado) => {
    setGrupos(grupos.map(g => (g.id_grupo === grupoActualizado.id_grupo ? grupoActualizado : g)));
    if (grupoSeleccionado && grupoSeleccionado.id_grupo === grupoActualizado.id_grupo) {
      setGrupoSeleccionado(grupoActualizado);
    }
  };

  const onGrupoEliminado = (idGrupoEliminado) => {
    setGrupos(grupos.filter(g => g.id_grupo !== idGrupoEliminado));
    if (grupoSeleccionado && grupoSeleccionado.id_grupo === idGrupoEliminado) {
      setGrupoSeleccionado(null);
    }
  };

  if (grupoSeleccionado) {
    return (
      <>
        <DetalleGrupo
          grupo={grupoSeleccionado}
          onVolver={() => setGrupoSeleccionado(null)}
          onEditar={handleEditarGrupo}
          onEliminar={handleEliminarGrupo}
        />
        
        {/* Modales para editar y eliminar grupo */}
        <EditarGrupoForm
          isOpen={mostrarEditarForm}
          onClose={() => {
            setMostrarEditarForm(false);
            setEditandoGrupo(null);
          }}
          grupo={editandoGrupo}
          onGrupoActualizado={onGrupoActualizado}
        />

        <EliminarGrupoModal
          isOpen={mostrarEliminarModal}
          onClose={() => {
            setMostrarEliminarModal(false);
            setEditandoGrupo(null);
          }}
          grupo={editandoGrupo}
          onGrupoEliminado={onGrupoEliminado}
        />
      </>
    );
  }

  return (
    <div className="grupos-container">
      <div className="grupos-header">
        <h1>Mis Grupos</h1>
        <div className="grupos-acciones">
          <button 
            className="btn-crear-grupo"
            onClick={() => setMostrarCrearForm(true)}
          >
            ➕ Crear Grupo
          </button>
          <button 
            className="btn-unirse-grupo"
            onClick={() => setMostrarUnirseForm(true)}
          >
            🔗 Unirse a Grupo
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="loading">Cargando grupos...</div>
      ) : error ? (
        <div className="error">
          {error}
          <button onClick={cargarGrupos} className="btn-reintentar">
            Reintentar
          </button>
        </div>
      ) : grupos.length === 0 ? (
        <div className="sin-grupos">
          <h2>No tienes grupos aún</h2>
          <p>Crea tu primer grupo o únete a uno existente para empezar a gestionar gastos compartidos.</p>
          <div className="acciones-vacias">
            <button 
              className="btn-crear-grupo"
              onClick={() => setMostrarCrearForm(true)}
            >
              ➕ Crear mi primer grupo
            </button>
            <button 
              className="btn-unirse-grupo"
              onClick={() => setMostrarUnirseForm(true)}
            >
              🔗 Unirse con código
            </button>
          </div>
        </div>
      ) : (
        <div className="grupos-grid">
          {grupos.map(grupo => (
            <div key={grupo.id_grupo} className="grupo-card">
              <div className="grupo-card-header">
                <h3>{grupo.nombre_grupo}</h3>
                <span className="grupo-fecha">
                  {new Date(grupo.fecha_creacion).toLocaleDateString('es-ES')}
                </span>
              </div>
              
              {grupo.descripcion && (
                <p className="grupo-descripcion">{grupo.descripcion}</p>
              )}
              
              <div className="grupo-info">
                <p className="grupo-creador">
                  Creador: <strong>{grupo.creador_nombre}</strong>
                </p>
              </div>
              
              <div className="grupo-card-acciones">
                <button 
                  className="btn-ver-detalle"
                  onClick={() => setGrupoSeleccionado(grupo)}
                >
                  👁️ Ver Detalle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarCrearForm && (
        <CrearGrupoForm
          onCrear={handleCrearGrupo}
          onCancelar={() => setMostrarCrearForm(false)}
          cargando={false}
        />
      )}

      {mostrarUnirseForm && (
        <UnirseGrupoForm
          onUnirse={handleUnirseGrupo}
          onCancelar={() => setMostrarUnirseForm(false)}
          cargando={false}
        />
      )}
    </div>
  );
};

export default Grupos;