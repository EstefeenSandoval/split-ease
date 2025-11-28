import React, { useState, useEffect, useCallback } from 'react';
import { toast } from '../../../utils/toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSync,
  faCheck,
  faClock,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import GastoCardExpandida from '../GastoCardExpandida/GastoCardExpandida';
import CrearGastoModal from '../CrearGastoModal/CrearGastoModal';
import EditarGastoModal from '../EditarGastoModal/EditarGastoModal';
import { PagarGastoModal } from '../PagarGastoModal/PagarGastoModal';
import API_ENDPOINTS from '../../../config/api';
import './ListaGastos.css';

const ListaGastos = ({ grupo, participantes, categorias }) => {
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, pendientes, pagados
  const [usuarioActual, setUsuarioActual] = useState(null);
  
  // Modales
  const [mostrarCrearModal, setMostrarCrearModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [mostrarPagarModal, setMostrarPagarModal] = useState(false);
  const [gastoSeleccionado, setGastoSeleccionado] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  const cargarGastos = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(
        API_ENDPOINTS.gastos.obtenerPorGrupo(grupo.id_grupo),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setGastos(data.gastos || []);
      } else {
        setError(data.error || 'Error al cargar gastos');
        toast.error(data.error || 'Error al cargar gastos');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
      toast.error('Error de conexión');
    } finally {
      setCargando(false);
    }
  }, [grupo.id_grupo]);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarGastos();
    cargarUsuarioActual();
  }, [cargarGastos]);

  const cargarUsuarioActual = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.usuarios.perfil, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarioActual(data.usuario);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  const handleCrearGasto = async (formData) => {
    try {
      setCargandoAccion(true);
      const token = localStorage.getItem('token');

      const gastoData = {
        ...formData,
        id_grupo: grupo.id_grupo
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
        setMostrarCrearModal(false);
        cargarGastos();
      } else {
        toast.error(data.error || 'Error al crear el gasto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setCargandoAccion(false);
    }
  };

  const handleEditarGasto = async (formData) => {
    if (!gastoSeleccionado) return;

    try {
      setCargandoAccion(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        API_ENDPOINTS.gastos.actualizar(gastoSeleccionado.id_gasto),
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Gasto actualizado correctamente');
        setMostrarEditarModal(false);
        setGastoSeleccionado(null);
        cargarGastos();
      } else {
        toast.error(data.error || 'Error al actualizar el gasto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setCargandoAccion(false);
    }
  };

  const handleMarcarPagado = async () => {
    if (!gastoSeleccionado) return;

    try {
      setCargandoAccion(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        API_ENDPOINTS.gastos.marcarPagado(gastoSeleccionado.id_gasto),
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Gasto marcado como pagado');
        setMostrarPagarModal(false);
        setGastoSeleccionado(null);
        cargarGastos();
      } else {
        toast.error(data.error || 'Error al marcar como pagado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setCargandoAccion(false);
    }
  };

  const handleEliminarGasto = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      return;
    }

    try {
      setCargandoAccion(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        API_ENDPOINTS.gastos.eliminar(id),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        toast.success('Gasto eliminado correctamente');
        cargarGastos();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al eliminar el gasto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Filtrar gastos según estado
  const gastosFiltrados = gastos.filter(gasto => {
    if (filtroEstado === 'pendientes') return gasto.estado === 'pendiente';
    if (filtroEstado === 'pagados') return gasto.estado === 'confirmado';
    return true;
  });

  // Calcular estadísticas
  const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto_total || 0), 0);
  const totalPendiente = gastos
    .filter(g => g.estado === 'pendiente')
    .reduce((sum, g) => sum + parseFloat(g.monto_total || 0), 0);
  const totalPagado = gastos
    .filter(g => g.estado === 'confirmado')
    .reduce((sum, g) => sum + parseFloat(g.monto_total || 0), 0);

  const handleAbrirEditar = (gasto) => {
    setGastoSeleccionado(gasto);
    setMostrarEditarModal(true);
  };

  const handleAbrirPagar = (gasto) => {
    setGastoSeleccionado(gasto);
    setMostrarPagarModal(true);
  };

  return (
    <div className="lista-gastos-container">
      {/* Header con estadísticas */}
      <div className="gastos-header-section">
        <div className="gastos-titulo">
          <h2>Gastos de {grupo.nombre_grupo}</h2>
          <p className="gastos-descripcion">Gestiona todos los gastos del grupo</p>
        </div>

        <div className="gastos-estadisticas">
          <div className="estadistica-item">
            <div className="estadistica-icon total">
              <FontAwesomeIcon icon={faMoneyBillWave} />
            </div>
            <div className="estadistica-content">
              <span className="estadistica-label">Total de gastos</span>
              <span className="estadistica-valor">${totalGastos.toFixed(2)}</span>
            </div>
          </div>

          <div className="estadistica-item">
            <div className="estadistica-icon pendiente">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="estadistica-content">
              <span className="estadistica-label">Pendientes</span>
              <span className="estadistica-valor">${totalPendiente.toFixed(2)}</span>
            </div>
          </div>

          <div className="estadistica-item">
            <div className="estadistica-icon pagado">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <div className="estadistica-content">
              <span className="estadistica-label">Pagados</span>
              <span className="estadistica-valor">${totalPagado.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones y Filtros */}
      <div className="gastos-acciones-section">
        <div className="filtro-estado">
          <label htmlFor="filtro-estado">Filtrar por estado:</label>
          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">Todos los gastos</option>
            <option value="pendientes">Solo pendientes</option>
            <option value="pagados">Solo pagados</option>
          </select>
        </div>

        <div className="botones-acciones">
          <button
            className="btn-recargar"
            onClick={cargarGastos}
            disabled={cargando || cargandoAccion}
            title="Recargar gastos"
          >
            <FontAwesomeIcon icon={faSync} spin={cargando} />
            Recargar
          </button>

          <button
            className="btn-crear-gasto"
            onClick={() => setMostrarCrearModal(true)}
            disabled={cargandoAccion}
          >
            <FontAwesomeIcon icon={faPlus} />
            Nuevo Gasto
          </button>
        </div>
      </div>

      {/* Lista de gastos */}
      <div className="gastos-lista-section">
        {cargando ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando gastos...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={cargarGastos} className="btn-reintentar">
              Reintentar
            </button>
          </div>
        ) : gastos.length === 0 ? (
          <div className="sin-gastos">
            <h3>No hay gastos aún</h3>
            <p>Comienza creando el primer gasto para este grupo</p>
            <button
              className="btn-crear-gasto-grande"
              onClick={() => setMostrarCrearModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Crear primer gasto
            </button>
          </div>
        ) : gastosFiltrados.length === 0 ? (
          <div className="sin-resultados">
            <h3>No hay gastos con ese filtro</h3>
            <p>Intenta cambiar el filtro o crear un nuevo gasto</p>
          </div>
        ) : (
          <div className="gastos-grid">
            {gastosFiltrados.map(gasto => (
              <GastoCardExpandida
                key={gasto.id_gasto}
                gasto={gasto}
                usuarioActual={usuarioActual}
                onEditar={() => handleAbrirEditar(gasto)}
                onEliminar={() => handleEliminarGasto(gasto.id_gasto)}
                onPagar={() => handleAbrirPagar(gasto)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <CrearGastoModal
        isOpen={mostrarCrearModal}
        onClose={() => setMostrarCrearModal(false)}
        onCrear={handleCrearGasto}
        participantes={participantes}
        categorias={categorias}
      />

      <EditarGastoModal
        isOpen={mostrarEditarModal}
        onClose={() => {
          setMostrarEditarModal(false);
          setGastoSeleccionado(null);
        }}
        onActualizar={handleEditarGasto}
        gasto={gastoSeleccionado}
        participantes={participantes}
        categorias={categorias}
        cargando={cargandoAccion}
      />

      <PagarGastoModal
        isOpen={mostrarPagarModal}
        onClose={() => {
          setMostrarPagarModal(false);
          setGastoSeleccionado(null);
        }}
        gasto={gastoSeleccionado}
        onConfirmar={handleMarcarPagado}
        cargando={cargandoAccion}
        usuarioActual={usuarioActual}
      />
    </div>
  );
};

export default ListaGastos;
