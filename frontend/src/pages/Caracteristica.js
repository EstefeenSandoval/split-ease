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

import './Caracteristica.css';

const featureList = [
  {
    id: 'division-inteligente',
    icon: faCalculator,
    title: 'División inteligente',
    description:
      'Reparte los gastos de forma equitativa o personalizada en segundos, sin hojas de cálculo ni cuentas manuales.'
  },
  {
    id: 'gestion-grupos',
    icon: faUsers,
    title: 'Gestión de grupos',
    description:
      'Crea grupos para viajes, eventos o gastos recurrentes y mantén a todos organizados en un solo lugar.'
  },
  {
    id: 'historial-completo',
    icon: faReceipt,
    title: 'Historial completo',
    description:
      'Consulta reportes claros con todos los movimientos, saldos pendientes y pagos confirmados.'
  },
  {
    id: 'alertas',
    icon: faBell,
    title: 'Alertas inteligentes',
    description:
      'Recibe notificaciones oportunas cuando haya gastos nuevos, recordatorios de pago o actualizaciones importantes.'
  },
  {
    id: 'seguridad',
    icon: faShieldHalved,
    title: 'Seguridad reforzada',
    description:
      'Protegemos cada dato con cifrado y mejores prácticas de privacidad para que gestiones tus finanzas con confianza.'
  },
  {
    id: 'acceso-movil',
    icon: faMobileScreenButton,
    title: 'Acceso móvil',
    description:
      'Usa SplitEase en iOS y Android y mantente al tanto de tus gastos compartidos sin importar dónde estés.'
  }
];

const Caracteristica = ({ onOpenModal }) => {
  return (
    <section className="caracteristica-section">
      <div className="caracteristica-shell">
        <header className="caracteristica-header">
          <h1 className="caracteristica-heading">Gestiona gastos compartidos sin complicaciones</h1>
          <p className="caracteristica-lead">
            Automatiza cálculos, guarda cada detalle y mantén a tu equipo alineado desde cualquier dispositivo.
          </p>
        </header>

        <div className="caracteristica-grid">
          {featureList.map((feature, index) => (
            <article
              key={feature.id}
              className="caracteristica-card"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="caracteristica-cardAccent" aria-hidden="true" />
              <div className="caracteristica-cardIcon">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <h3 className="caracteristica-cardTitle">{feature.title}</h3>
              <p className="caracteristica-cardCopy">{feature.description}</p>
            </article>
          ))}
        </div>

        <div className="caracteristica-cta">
          <div className="caracteristica-ctaCopy">
            <h2>¿Listo para empezar?</h2>
            <p>Únete gratis y descubre cómo SplitEase simplifica cada reembolso y saldo compartido.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary caracteristica-ctaButton"
            onClick={() => onOpenModal?.('register')}
          >
            Crear mi cuenta
          </button>
        </div>
      </div>
    </section>
  );
};

export default Caracteristica;
