import React, { useState, useEffect } from 'react';
import {
  KPICard,
  GraficoTorta,
  GraficoLinea,
  ListaDeudas,
  ActividadReciente,
  ModalHistorialPagos
} from '../components/dashboard';
import { API_ENDPOINTS } from '../config/api';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [paginaActividad, setPaginaActividad] = useState(1);
  const [historialModal, setHistorialModal] = useState({
    isOpen: false,
    idGasto: null,
    datos: null
  });

  // Cargar datos del dashboard
  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch(API_ENDPOINTS.dashboard.personal, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return;
        }
        throw new Error('Error al cargar el dashboard');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarMasActividad = async () => {
    try {
      const token = localStorage.getItem('token');
      const siguientePagina = paginaActividad + 1;

      const response = await fetch(
        `${API_ENDPOINTS.dashboard.actividad}?pagina=${siguientePagina}&limite=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error al cargar actividad');

      const data = await response.json();
      
      setDashboardData(prev => ({
        ...prev,
        actividadReciente: [...prev.actividadReciente, ...data.actividad]
      }));

      setPaginaActividad(siguientePagina);
    } catch (err) {
      console.error('Error al cargar más actividad:', err);
    }
  };

  const saldarDeuda = async (datosPago) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(API_ENDPOINTS.dashboard.saldarDeuda, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosPago)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar el pago');
      }

      const data = await response.json();
      alert(data.mensaje);
      
      // Recargar dashboard
      await cargarDashboard();
    } catch (err) {
      console.error('Error al saldar deuda:', err);
      alert(err.message);
    }
  };

  const verHistorialPagos = async (idGasto) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        API_ENDPOINTS.dashboard.historialPagos(idGasto),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error al cargar historial');

      const data = await response.json();
      
      setHistorialModal({
        isOpen: true,
        idGasto: idGasto,
        datos: data
      });
    } catch (err) {
      console.error('Error al cargar historial:', err);
      alert('No se pudo cargar el historial de pagos');
    }
  };

  const cerrarHistorialModal = () => {
    setHistorialModal({
      isOpen: false,
      idGasto: null,
      datos: null
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={cargarDashboard} className="boton-reintentar">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { kpis, graficos, listas, actividadReciente } = dashboardData;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Mi Dashboard</h1>
        <button onClick={cargarDashboard} className="boton-actualizar">
          🔄 Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="dashboard-kpis">
        <KPICard
          titulo="Balance General"
          valor={kpis.balanceGeneral}
          icono="💰"
          tipo="balance"
        />
        <KPICard
          titulo="Te Deben"
          valor={kpis.totalTeDeben}
          icono="📈"
          tipo="cobros"
        />
        <KPICard
          titulo="Debes"
          valor={kpis.totalQueDebes}
          icono="📉"
          tipo="deudas"
        />
        <KPICard
          titulo="Gastos del Mes"
          valor={kpis.gastosTotalesMesActual}
          icono="💸"
          tipo="gastos"
        />
      </div>

      {/* Gráficos */}
      <div className="dashboard-graficos">
        <div className="grafico-wrapper">
          <GraficoTorta
            datos={graficos.gastosPorCategoria}
            titulo="📊 Gastos por Categoría"
          />
        </div>
        <div className="grafico-wrapper">
          <GraficoLinea
            datos={graficos.evolucionGastos}
            titulo="📈 Evolución de Gastos"
          />
        </div>
      </div>

      {/* Listas de cobros y deudas */}
      <div className="dashboard-listas">
        <div className="lista-wrapper">
          <ListaDeudas
            tipo="cobros"
            datos={listas.cobrosPendientes}
            onVerHistorial={verHistorialPagos}
          />
        </div>
        <div className="lista-wrapper">
          <ListaDeudas
            tipo="deudas"
            datos={listas.deudasPendientes}
            onPagar={saldarDeuda}
            onVerHistorial={verHistorialPagos}
          />
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="dashboard-actividad">
        <ActividadReciente
          actividades={actividadReciente}
          onCargarMas={cargarMasActividad}
          paginacion={{
            paginaActual: paginaActividad,
            totalPaginas: Math.ceil(actividadReciente.length / 20) + 1
          }}
        />
      </div>

      {/* Modal de historial de pagos */}
      <ModalHistorialPagos
        isOpen={historialModal.isOpen}
        onClose={cerrarHistorialModal}
        historial={historialModal.datos}
        idGasto={historialModal.idGasto}
      />
    </div>
  );
};

export default Dashboard;