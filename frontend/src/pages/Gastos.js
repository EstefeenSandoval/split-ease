import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ListaGastos, CrearGastoModal } from '../components/gasto';
import { construirURLEstatico } from '../config/api';
import API_ENDPOINTS from '../config/api';
import './Gastos.css';

// SVG para Gestionar Gastos (Lista de gastos)
const SVGGestionarGastos = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6.75H15M9 12H15M9 17.25H15M4.5 6.75H4.507M4.5 12H4.507M4.5 17.25H4.507" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// SVG para Crear Gasto Rápido (Plus dentro de círculo)
const SVGCrearGasto = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 9V15M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Gastos = () => {
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [mostrarModalMiembros, setMostrarModalMiembros] = useState(false);
  const [miembrosGrupo, setMiembrosGrupo] = useState([]);
  const [grupoParaMostrarMiembros, setGrupoParaMostrarMiembros] = useState(null);
  const [mostrarCrearGastoRapido, setMostrarCrearGastoRapido] = useState(false);
  const [grupoParaGastoRapido, setGrupoParaGastoRapido] = useState(null);

  // Cargar grupos al montar el componente
  useEffect(() => {
    cargarGrupos();
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.gastos.categorias, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategorias(data.categorias || []);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

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
                const participantes = participantesData.participantes || [];
                return {
                  ...grupo,
                  cantidad_miembros: participantes.length,
                  _miembros_nombres: participantes.slice(0, 3).map(p => p.nombre || p.nombre_usuario)
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

  const handleSeleccionarGrupo = async (grupo) => {
    setGrupoSeleccionado(grupo);
    await cargarDetallesGrupo(grupo.id_grupo);
  };

  const cargarDetallesGrupo = async (idGrupo) => {
    try {
      const token = localStorage.getItem('token');

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

  const obtenerNombresTooltip = (grupo) => {
    if (grupo.cantidad_miembros === 0) {
      return 'Sin miembros';
    }
    if (grupo._miembros_nombres && grupo._miembros_nombres.length > 0) {
      return grupo._miembros_nombres.slice(0, 3).join(', ');
    }
    return `${grupo.cantidad_miembros} ${grupo.cantidad_miembros === 1 ? 'miembro' : 'miembros'}`;
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

  const handleCrearGastoRapido = async (grupo) => {
    setGrupoParaGastoRapido(grupo);
    setMostrarCrearGastoRapido(true);
    await cargarDetallesGrupo(grupo.id_grupo);
  };

  const handleCerrarCrearGastoRapido = () => {
    setMostrarCrearGastoRapido(false);
    setGrupoParaGastoRapido(null);
  };

  const handleCrearGastoRapidoSubmit = async (datosGasto) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.gastos.crear, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...datosGasto,
          id_grupo: grupoParaGastoRapido.id_grupo
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Gasto creado correctamente');
        handleCerrarCrearGastoRapido();
        cargarGrupos();
      } else {
        toast.error(data.error || 'Error al crear gasto');
        throw new Error(data.error || 'Error al crear gasto');
      }
    } catch (error) {
      console.error('Error al crear gasto:', error);
      toast.error('Error de conexión al crear gasto');
    }
  };

  // Si tenemos un grupo seleccionado, mostrar lista de gastos
  if (grupoSeleccionado) {
    return (
      <div className="gastos-container gastos-container-detalle">
        <div className="gastos-header-detalle">
          <button
            className="btn-volver-detalle"
            onClick={() => setGrupoSeleccionado(null)}
            title="Volver a la lista de grupos"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className="gastos-titulo-detalle">
            <h1>Gestión de Gastos</h1>
          </div>
        </div>

        <ListaGastos
          grupo={grupoSeleccionado}
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
        <h1>Gastos por Grupo</h1>
        <p>Selecciona un grupo para ver, crear, editar, eliminar o pagar gastos</p>
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
                  data-tooltip={obtenerNombresTooltip(grupo)}
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

              <div className="grupo-acciones-gasto">
                <button
                  className="btn-crear-rapido-gasto"
                  onClick={() => handleCrearGastoRapido(grupo)}
                  title="Crear gasto rápidamente en este grupo"
                >
                  <SVGCrearGasto />
                  Crear Gasto
                </button>

                <button
                  className="btn-crear-en-grupo"
                  onClick={() => handleSeleccionarGrupo(grupo)}
                >
                  <SVGGestionarGastos />
                  Gestionar Gastos
                </button>
              </div>
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

      {/* Modal de Crear Gasto Rápido */}
      {mostrarCrearGastoRapido && grupoParaGastoRapido && (
        <CrearGastoModal
          isOpen={mostrarCrearGastoRapido}
          onClose={handleCerrarCrearGastoRapido}
          onCrear={handleCrearGastoRapidoSubmit}
          participantes={participantes}
          categorias={categorias}
          grupoId={grupoParaGastoRapido.id_grupo}
        />
      )}
    </div>
  );
};

export default Gastos;
