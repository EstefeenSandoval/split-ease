import React from 'react';
import './KPICard.css';

const KPICard = ({ icono, titulo, valor, tipo }) => {
  const formatearMoneda = (valor) => {
    const numero = parseFloat(valor);
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numero);
  };

  const esNegativo = parseFloat(valor) < 0;
  const esBalance = tipo === 'balance' || titulo.toLowerCase().includes('balance');

  return (
    <div className="kpi-card">
      <div className="kpi-icono">
        {icono}
      </div>
      <div className="kpi-contenido">
        <h3 className="kpi-titulo">{titulo}</h3>
        <p className={`kpi-valor ${esBalance && esNegativo ? 'kpi-valor-negativo' : ''}`}>
          {formatearMoneda(valor)}
        </p>
      </div>
    </div>
  );
};

export default KPICard;
