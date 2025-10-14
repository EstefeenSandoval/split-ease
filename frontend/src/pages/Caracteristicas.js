import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalculator,
  faUsers,
  faReceipt,
  faBell,
  faShieldHalved,
  faMobileScreenButton
} from '@fortawesome/free-solid-svg-icons';

// Importa la hoja de estilos específica del componente
import './Caracteristicas.css';

// Lista de características (features)
const features = [
  {
    icon: faCalculator,
    title: "División Inteligente",
    description: "Posibilidad de dividir gastos de manera equitativa o parcial entre todos los participantes. Olvídate de las calculadoras complicadas."
  },
  {
    icon: faUsers,
    title: "Gestión de Grupos",
    description: "Crea y administra grupos para diferentes ocasiones: viajes, cenas, eventos especiales. Todo en un solo lugar."
  },
  {
    icon: faReceipt,
    title: "Historial Completo",
    description: "Accede al Dashboard que te permite tener un registro detallado de todos los gastos y transacciones realizadas."
  },
  {
    icon: faBell,
    title: "Notificaciones",
    description: "Recibe alertas sobre pagos pendientes y nuevos gastos agregados al grupo. Mantente siempre informado."
  },
  {
    icon: faShieldHalved,
    title: "Seguridad",
    description: "Tus datos están protegidos, la privacidad es nuestra prioridad."
  },
  {
    icon: faMobileScreenButton,
    title: "Acceso Móvil",
    description: "Disponible en dispositivos iOS y Android. Gestiona tus gastos desde cualquier lugar y en cualquier momento."
  }
];

function Caracteristicas({ onOpenModal }) {

  return (
    <div className="caracteristicas-section">
      <div className="container">
        
        {/* Encabezado */}
          <h1 className="section-title">
            Características de SplitEase
          </h1>
          
        
        {/* Features Grid */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              // La animación se dispara usando los keyframes globales de index.css
              style={{
                animation: `slideUp 0.6s ease-out ${index * 0.08}s both`,
                zIndex: 1
              }}
            >
              {/* Top accent line */}
              <div className="accent-line" />

              {/* Icon */}
              <div className="feature-icon">
                <FontAwesomeIcon icon={feature.icon} />
              </div>

              <h3 className="feature-title">
                {feature.title}
              </h3>
              <p className="feature-desc">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="cta-box">
          <h2 className="cta-title">
            ¿Listo para simplificar tus gastos?
          </h2>
          <p className="cta-subtitle">
            Únete a los usuarios que ya dividen sus gastos sin complicaciones
          </p>
          <button
            // Clases globales de botón definidas en index.css
            className="btn btn-primary"
            onClick={() => onOpenModal('register')}
          >
            ¡Empezar Gratis Ahora!
          </button>
        </div>
      </div>
    </div>
  );
}

export default Caracteristicas;