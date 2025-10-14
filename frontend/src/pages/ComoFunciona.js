import React from 'react';
import './ComoFunciona.css';

function ComoFunciona({ onOpenModal }) {
  const steps = [
    {
      number: "1",
      title: "Crea tu Cuenta",
      description: "Regístrate gratis y configura tu perfil en segundos. ¡Listo para usar!"
    },
    {
      number: "2", 
      title: "Forma tus Grupos",
      description: "Invita a tus amigos, familiares o compañeros. Crea grupos para viajes, cenas de hogar."
    },
    {
      number: "3",
      title: "Registra Gastos Fácilmente",
      description: "Añade cualquier gasto, categoriza, e indica quién pagó y quiénes participan."
    },
    {
      number: "4",
      title: "Visualiza y Calcula",
      description: "Obtén un resumen claro de quién debe a quién y cuánto, con balances actualizados al instante."
    },
    {
      number: "5",
      title: "Recibe Notificaciones",
      description: "Mantente al tanto de tus gastos y deudas con notificaciones en tiempo real."
    },
    {
      number: "6",
      title: "Liquida y Relájate",
      description: "Usa nuestras opciones integradas para saldar deudas rápidamente y sin complicaciones."
    }
  ];

  return (
    <div className="como-funciona-container">
      <div className="como-funciona-wrapper">
        
        {/* Sección del Título */}
        <div className="como-funciona-header">
          <h1 className="como-funciona-title">
            Divide cuentas, no amistades
          </h1>
          <p className="como-funciona-subtitle">
            Repartir gastos con amigos nunca fue fácil. Sigue estos simples pasos:
          </p>
        </div>

        {/* Contenedor de la cuadrícula de pasos */}
        <div className="como-funciona-grid">
          {steps.map((step) => (
            <div key={step.number} className="como-funciona-card">
              {/* Número estilizado */}
              <div className="como-funciona-number">
                {String(step.number).padStart(2, '0')}
              </div>
              
              {/* Contenido de texto de la tarjeta */}
              <div className="como-funciona-content">
                <h3 className="como-funciona-step-title">
                  {step.title}
                </h3>
                <p className="como-funciona-description">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}

export default ComoFunciona;