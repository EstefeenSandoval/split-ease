import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft, faFilter, faSync } from '@fortawesome/free-solid-svg-icons';
import GastoCard from '../GastoCard/GastoCard';
import CrearGastoModal from '../CrearGastoModal/CrearGastoModal';
import DetalleGastoModal from '../DetalleGastoModal/DetalleGastoModal';
import API_ENDPOINTS from '../../../config/api';
import './GrupoGastos.css';

const GrupoGastos = ({ grupo, onVolver, participantes }) => {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarCrearModal, setMostrarCrearModal] = useState(false);
  const [mostrarDetalleModal, setMostrarDetalleModal] = useState(false);
  const [gastoSeleccionado, setGastoSeleccionado] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [usuarioActual, setUsuarioActual] = useState(null);

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

  const cargarGastos = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.gastos.obtenerPorGrupo(grupo.id_grupo), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setGastos(data.gastos || []);
      } else {
        toast.error(data.error || 'Error al cargar gastos');
        setError(data.error || 'Error al cargar gastos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  }, [grupo.id_grupo]);

  const cargarCategorias = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.gastos.categorias, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCategorias(data.categorias || []);
      } else {
        console.error('Error al cargar categorías:', data.error);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  useEffect(() => {
    obtenerUsuarioActual();
    cargarGastos();
    cargarCategorias();
  }, [grupo.id_grupo, cargarGastos, cargarCategorias]);

  const handleCrearGasto = async (datosGasto) => {
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
          id_grupo: grupo.id_grupo
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Gasto creado correctamente');
        setMostrarCrearModal(false);
        cargarGastos(); // Recargar gastos
      } else {
        toast.error(data.error || 'Error al crear gasto');
        throw new Error(data.error || 'Error al crear gasto');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error; // Re-throw para que el modal maneje el error
    }
  };

  const handleVerDetalle = async (gasto) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.gastos.obtenerPorId(gasto.id_gasto), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setGastoSeleccionado(data.gasto);
        setMostrarDetalleModal(true);
      } else {
        toast.error(data.error || 'Error al cargar detalle del gasto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const handleMarcarPagado = async (gastoId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.gastos.marcarPagado(gastoId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Marcado como pagado correctamente');
        cargarGastos(); // Recargar gastos
      } else {
        toast.error(data.error || 'Error al marcar como pagado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const handleEliminarGasto = async (gastoId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.gastos.eliminar(gastoId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Gasto eliminado correctamente');
        cargarGastos(); // Recargar gastos
        if (mostrarDetalleModal) {
          setMostrarDetalleModal(false);
        }
      } else {
        toast.error(data.error || 'Error al eliminar gasto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const gastosFiltrados = gastos.filter(gasto => 
    !filtroCategoria || gasto.id_categoria.toString() === filtroCategoria
  );

  const totalGastos = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto_total), 0);

  return (
    <div className="grupo-gastos">
      <div className="gastos-header">
        <button className="btn-volver" onClick={onVolver}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al Grupo
        </button>
        
        <div className="gastos-info">
          <h1>Gastos de {grupo.nombre_grupo}</h1>
          <div className="gastos-stats">
            <div className="stat-item">
              <span className="stat-label">Total de gastos:</span>
              <span className="stat-value">{gastos.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Monto total:</span>
              <span className="stat-value">${totalGastos.toFixed(2)} MXN</span>
            </div>
          </div>
        </div>

        <div className="gastos-acciones">
          <button 
            className="btn-crear-gasto"
            onClick={() => setMostrarCrearModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Nuevo Gasto
          </button>
          <button 
            className="btn-recargar"
            onClick={cargarGastos}
            disabled={cargando}
          >
            <FontAwesomeIcon icon={faSync} spin={cargando} /> Actualizar
          </button>
        </div>
      </div>

      <div className="gastos-filtros">
        <div className="filtro-categoria">
          <FontAwesomeIcon icon={faFilter} />
          <select 
            value={filtroCategoria} 
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="gastos-contenido">
        {cargando ? (
          <div className="loading">Cargando gastos...</div>
        ) : error ? (
          <div className="error">
            {error}
            <button onClick={cargarGastos} className="btn-reintentar">
              Reintentar
            </button>
          </div>
        ) : gastosFiltrados.length === 0 ? (
          <div className="sin-gastos">
            <h2>No hay gastos aún</h2>
            <p>Comienza creando el primer gasto para este grupo.</p>
            <button 
              className="btn-crear-gasto"
              onClick={() => setMostrarCrearModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} /> Crear primer gasto
            </button>
          </div>
        ) : (
          <div className="gastos-lista">
            {gastosFiltrados.map(gasto => (
              <GastoCard
                key={gasto.id_gasto}
                gasto={gasto}
                usuarioActual={usuarioActual}
                onVerDetalle={() => handleVerDetalle(gasto)}
                onMarcarPagado={() => handleMarcarPagado(gasto.id_gasto)}
                onEliminar={() => handleEliminarGasto(gasto.id_gasto)}
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

      <DetalleGastoModal
        isOpen={mostrarDetalleModal}
        onClose={() => setMostrarDetalleModal(false)}
        gasto={gastoSeleccionado}
        usuarioActual={usuarioActual}
        onMarcarPagado={handleMarcarPagado}
        onEliminar={handleEliminarGasto}
      />
    </div>
  );
};

export default GrupoGastos;