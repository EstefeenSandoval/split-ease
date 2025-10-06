import React, { useState } from 'react'; // Importa useState

function ComoFunciona({ onOpenModal }) {
  const [isButtonHovered, setIsButtonHovered] = useState(false); // Estado para el hover

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
    }
    ,
    {
      number: "6",
      title: "Liquida y Relájate",
      description: "Usa nuestras opciones integradas para saldar deudas rápidamente y sin complicaciones."
    }
  ];

  return (
    // Contenedor principal con el fondo degradado de tu marca
    <div style={{ 
      background: 'linear-gradient(135deg, #bcebcb 0%, #f0f9f2 100%)',
      padding: '4rem 2rem', // Más padding vertical
      minHeight: '100vh',
      fontFamily: 'sans-serif' // Se recomienda definir una fuente global
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Sección del Título */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ 
            color: '#356859', // Verde Fuerte (Acento Principal)
            fontSize: '2.8rem', 
            fontWeight: 'bold',
            marginBottom: '1rem' 
          }}>
            Divide cuentas, no amistades
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#596869', // Gris Oscuro (Texto Principal)
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Repartir gastos con amigos nunca fue fácil. Sigue estos simples pasos:
          </p>
        </div>

        {/* Contenedor de la cuadrícula de pasos (Grid Layout) */}
        <div style={{ 
          display: 'grid',
          // Crea columnas que se ajustan automáticamente. En pantallas grandes serán 2, en pequeñas 1.
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
          gap: '2.5rem' // Espacio entre las tarjetas
        }}>
          {steps.map((step) => (
            // Tarjeta individual
            <div key={step.number} style={{
              display: 'flex',
              alignItems: 'center', 
              backgroundColor: '#FDFFF7', // Blanco Hueso (Fondos de Tarjetas)
              padding: '2.5rem',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e0e0e0'
            }}>
              {/* Número estilizado */}
              <div style={{
                color: '#356859', // Verde Fuerte (Acento Principal)
                fontSize: '4rem',
                fontWeight: 'bold',
                marginRight: '1.5rem',
                lineHeight: '1'
              }}>
                {String(step.number).padStart(2, '0')}
              </div>
              
              {/* Contenido de texto de la tarjeta */}
              <div>
                <h3 style={{ 
                    color: '#498467', // Verde Principal (Títulos)
                    marginBottom: '0.5rem', 
                    fontSize: '1.5rem',
                    fontWeight: '600'
                }}>
                  {step.title}
                </h3>
                <p style={{ 
                    color: '#596869', // Gris Medio (Texto Secundario)
                    lineHeight: '1.6', 
                    margin: 0, 
                    fontSize: '1rem' 
                }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de Llamada a la Acción (CTA) */}
        <div style={{
          textAlign: 'center',
          marginTop: '5rem',
          padding: '2rem'
        }}>
          <h2 style={{
            color: '#498467', // Verde Principal (Títulos)
            fontSize: '2.2rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>
            ¿Listo para simplificar tus finanzas?
          </h2>

          <button 
            style={{
              backgroundColor: '#356859',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Transición más suave
              boxShadow: isButtonHovered 
                ? '0 8px 25px rgba(53, 104, 89, 0.4)' // Sombra más pronunciada en hover
                : '0 4px 15px rgba(53, 104, 89, 0.3)',
              transform: isButtonHovered ? 'translateY(-3px)' : 'translateY(0)', // Efecto de elevación
            }} 
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            onClick={() => onOpenModal('register')}
          >
            ¡Empezar Gratis Ahora!
          </button>
          
        </div>

      </div>
    </div>
  );
}

export default ComoFunciona;