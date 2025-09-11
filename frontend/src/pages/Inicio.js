import React from 'react';

function Inicio() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Bienvenido a SplitEase</h1>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#555' }}>
        La manera más fácil y rápida de dividir gastos entre amigos, familia o compañeros de trabajo.
      </p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>¿Por qué elegir SplitEase?</h2>
        <ul style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#666' }}>
          <li>✅ Divide gastos de manera equitativa</li>
          <li>✅ Rastrea quién debe qué a quién</li>
          <li>✅ Simplifica los pagos entre grupos</li>
          <li>✅ Mantén un historial de todos tus gastos</li>
        </ul>
      </div>
    </div>
  );
}

export default Inicio;
