import React from 'react';
import './KPICard.css';

const KPICard = ({ titulo, valor, icono, tipo }) => {
  const formatearMoneda = (valor) => {
    const numero = parseFloat(valor);
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numero);
  };

  const obtenerClaseValor = () => {
    if (tipo === 'balance') {
      const numero = parseFloat(valor);
      if (numero > 0) return 'valor-positivo';
      if (numero < 0) return 'valor-negativo';
    }
    return '';
  };

  return (
    <div className={`kpi-card ${tipo}`}>
      <div className="kpi-icono">
        {icono}
      </div>
      <div className="kpi-contenido">
        <h3 className="kpi-titulo">{titulo}</h3>
        <p className={`kpi-valor ${obtenerClaseValor()}`}>
          {formatearMoneda(valor)}
        </p>
      </div>
    </div>
  );
};

export default KPICard;
