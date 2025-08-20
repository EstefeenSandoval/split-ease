import React from 'react';

function Caracteristicas() {
  const features = [
    {
      title: "División Inteligente",
      description: "Algoritmos avanzados para dividir gastos de manera equitativa entre todos los participantes."
    },
    {
      title: "Gestión de Grupos",
      description: "Crea y administra grupos para diferentes ocasiones: viajes, cenas, eventos especiales."
    },
    {
      title: "Historial Completo",
      description: "Mantén un registro detallado de todos los gastos y transacciones realizadas."
    },
    {
      title: "Notificaciones",
      description: "Recibe alertas sobre pagos pendientes y nuevos gastos agregados al grupo."
    },
    {
      title: "Múltiples Monedas",
      description: "Soporte para diferentes monedas con conversión automática en tiempo real."
    },
    {
      title: "Informes Detallados",
      description: "Genera reportes personalizados para analizar patrones de gasto del grupo."
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' }}>
        Características de SplitEase
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '2rem',
        marginTop: '2rem'
      }}>
        {features.map((feature, index) => (
          <div key={index} style={{
            backgroundColor: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>
              {feature.title}
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Caracteristicas;
