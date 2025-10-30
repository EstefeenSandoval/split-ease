import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CrearGastoModal } from '../components/grupos';
import { construirURLEstatico } from '../config/api';
import API_ENDPOINTS from '../config/api';
import './Gastos.css';

const Gastos = () => {
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [mostrarModalCrearGasto, setMostrarModalCrearGasto] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [cargandoGasto, setCargandoGasto] = useState(false);
  const [mostrarModalMiembros, setMostrarModalMiembros] = useState(false);
  const [miembrosGrupo, setMiembrosGrupo] = useState([]);
  const [grupoParaMostrarMiembros, setGrupoParaMostrarMiembros] = useState(null);

  // Cargar grupos al montar el componente
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
        // Cargar el número de miembros para cada grupo
        const gruposConMiembros = await Promise.all(
          data.grupos.map(async (grupo) => {
            try {
              const participantesResponse = await fetch(
                API_ENDPOINTS.grupos.obtenerParticipantes(grupo.id_grupo),
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              if (participantesResponse.ok) {
                const participantesData = await participantesResponse.json();
                return {
                  ...grupo,
                  cantidad_miembros: participantesData.participantes?.length || 0
                };
              }
              return grupo;
            } catch (error) {
              console.error(`Error al cargar miembros del grupo ${grupo.id_grupo}:`, error);
              return grupo;
            }
          })
        );
        
        setGrupos(gruposConMiembros);
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

  const handleSeleccionarGrupo = (grupo) => {
    setGrupoSeleccionado(grupo);
    cargarDetallesGrupo(grupo.id_grupo);
    setMostrarModalCrearGasto(true);
  };

  const cargarDetallesGrupo = async (idGrupo) => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar categorías
      const categoriesResponse = await fetch(
        API_ENDPOINTS.gastos.categorias,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategorias(categoriesData.categorias || []);
      }

      // Cargar participantes del grupo usando el endpoint correcto
      const participantesResponse = await fetch(
        API_ENDPOINTS.grupos.obtenerParticipantes(idGrupo),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (participantesResponse.ok) {
        const participantesData = await participantesResponse.json();
        setParticipantes(participantesData.participantes || []);
      }
    } catch (error) {
      console.error('Error cargando detalles del grupo:', error);
      toast.error('Error al cargar los detalles del grupo');
    }
  };

  const handleCrearGasto = async (formData) => {
    try {
      setCargandoGasto(true);
      const token = localStorage.getItem('token');

      // Agregar el ID del grupo al formulario
      const gastoData = {
        ...formData,
        id_grupo: grupoSeleccionado.id_grupo
      };

      const response = await fetch(API_ENDPOINTS.gastos.crear, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gastoData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Gasto creado correctamente');
        setMostrarModalCrearGasto(false);
        setGrupoSeleccionado(null);
        // Reiniciar para poder crear otro gasto
        cargarGrupos();
      } else {
        toast.error(data.error || 'Error al crear el gasto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setCargandoGasto(false);
    }
  };

  const handleCerrarModal = () => {
    setMostrarModalCrearGasto(false);
    setGrupoSeleccionado(null);
  };

  const handleVerMiembros = async (grupo) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        API_ENDPOINTS.grupos.obtenerParticipantes(grupo.id_grupo),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMiembrosGrupo(data.participantes || []);
        setGrupoParaMostrarMiembros(grupo);
        setMostrarModalMiembros(true);
      } else {
        toast.error('Error al cargar los miembros');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const handleCerrarModalMiembros = () => {
    setMostrarModalMiembros(false);
    setMiembrosGrupo([]);
    setGrupoParaMostrarMiembros(null);
  };

  // Si tenemos un grupo seleccionado, mostrar solo el modal
  if (grupoSeleccionado && mostrarModalCrearGasto) {
    return (
      <div className="gastos-container gastos-modal-view">
        <CrearGastoModal
          isOpen={mostrarModalCrearGasto}
          onClose={handleCerrarModal}
          onCrear={handleCrearGasto}
          participantes={participantes}
          categorias={categorias}
        />
      </div>
    );
  }

  // Vista de selección de grupo
  return (
    <div className="gastos-container">
      <div className="gastos-header">
        <h1>Crear Nuevo Gasto</h1>
        <p className="gastos-subtitle">
          Selecciona un grupo para crear un nuevo gasto
        </p>
      </div>

      {cargando ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando grupos...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={cargarGrupos} className="btn-reintentar">
            Reintentar
          </button>
        </div>
      ) : grupos.length === 0 ? (
        <div className="sin-grupos-container">
          <div className="sin-grupos-content">
            <h2>No tienes grupos disponibles</h2>
            <p>Necesitas estar en un grupo para crear gastos. Crea o únete a un grupo primero.</p>
            <a href="/grupos" className="btn-ir-grupos">
              Ir a Mis Grupos
            </a>
          </div>
        </div>
      ) : (
        <div className="gastos-grupos-grid">
          {grupos.map(grupo => (
            <div key={grupo.id_grupo} className="grupo-card-gasto">
              <div className="grupo-card-header-gasto">
                <h3>{grupo.nombre_grupo}</h3>
                <button 
                  className="grupo-badge-button"
                  onClick={() => handleVerMiembros(grupo)}
                  title="Ver miembros del grupo"
                >
                  <FontAwesomeIcon icon={faUsers} />
                  {grupo.cantidad_miembros || 0}
                </button>
              </div>

              {grupo.descripcion && (
                <p className="grupo-descripcion-gasto">{grupo.descripcion}</p>
              )}

              <div className="grupo-info-gasto">
                <p className="grupo-creador-gasto">
                  Creador: <strong>{grupo.creador_nombre}</strong>
                </p>
              </div>

              <button
                className="btn-crear-en-grupo"
                onClick={() => handleSeleccionarGrupo(grupo)}
                disabled={cargandoGasto}
              >
                <FontAwesomeIcon icon={faPlus} /> 
                Crear Gasto
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Miembros */}
      {mostrarModalMiembros && grupoParaMostrarMiembros && (
        <div className="modal-overlay" onClick={handleCerrarModalMiembros}>
          <div className="modal-content miembros-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button 
                className="modal-close-button"
                onClick={handleCerrarModalMiembros}
                title="Cerrar"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <h2>Miembros de {grupoParaMostrarMiembros.nombre_grupo}</h2>
            </div>

            <div className="miembros-list">
              {miembrosGrupo.length === 0 ? (
                <p className="sin-miembros">No hay miembros en este grupo</p>
              ) : (
                miembrosGrupo.map(miembro => (
                  <div key={miembro.id_usuario} className="miembro-item">
                    <div className="miembro-avatar">
                      {miembro.foto_perfil ? (
                        <img 
                          src={construirURLEstatico(miembro.foto_perfil)} 
                          alt={miembro.nombre || miembro.nombre_usuario}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.querySelector('.miembro-avatar-placeholder').style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="miembro-avatar-placeholder" style={{ display: miembro.foto_perfil ? 'none' : 'flex' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="miembro-info">
                      <p className="miembro-nombre">{miembro.nombre || miembro.nombre_usuario}</p>
                      <p className="miembro-email">{miembro.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gastos;
