import React from 'react';

function ComoFunciona() {
  const steps = [
    {
      number: "1",
      title: "Crea una Cuenta",
      description: "Regístrate gratis en SplitEase y configura tu perfil personal."
    },
    {
      number: "2", 
      title: "Forma un Grupo",
      description: "Invita a tus amigos, familiares o compañeros para crear un grupo de gastos."
    },
    {
      number: "3",
      title: "Agrega Gastos",
      description: "Registra los gastos del grupo indicando quién pagó y quiénes participan."
    },
    {
      number: "4",
      title: "Divide Automáticamente",
      description: "SplitEase calcula automáticamente cuánto debe cada persona."
    },
    {
      number: "5",
      title: "Liquida Cuentas",
      description: "Realiza los pagos correspondientes y marca las deudas como saldadas."
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' }}>
        ¿Cómo Funciona SplitEase?
      </h1>
      
      <p style={{ 
        fontSize: '1.2rem', 
        textAlign: 'center', 
        color: '#666', 
        marginBottom: '3rem',
        lineHeight: '1.6'
      }}>
        Dividir gastos nunca fue tan fácil. Sigue estos simples pasos:
      </p>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem' 
      }}>
        {steps.map((step, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              backgroundColor: '#007bff',
              color: 'white',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginRight: '2rem',
              flexShrink: 0
            }}>
              {step.number}
            </div>
            <div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
                {step.title}
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6', margin: 0, fontSize: '1.1rem' }}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '2rem',
        borderRadius: '12px',
        marginTop: '3rem',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>
          ¡Es así de simple!
        </h3>
        <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Con SplitEase, administrar gastos grupales se vuelve una tarea rápida y sin complicaciones.
          ¡Comienza hoy mismo y olvídate de los cálculos manuales!
        </p>
      </div>
    </div>
  );
}

export default ComoFunciona;
