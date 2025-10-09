import React from 'react';
import './GraficoLinea.css';

const GraficoLinea = ({ datos, titulo }) => {
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(parseFloat(valor));
  };

  if (datos.length === 0) {
    return (
      <div className="grafico-linea-container">
        <h3 className="grafico-titulo">{titulo}</h3>
        <div className="grafico-vacio">
          <p>📈 No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const valores = datos.map(d => parseFloat(d.total));
  const maxValor = Math.max(...valores);
  const minValor = Math.min(...valores);
  const rango = maxValor - minValor;

  const calcularY = (valor) => {
    if (rango === 0) return 50;
    return 90 - ((parseFloat(valor) - minValor) / rango) * 70;
  };

  const ancho = 100;
  const espaciado = ancho / (datos.length - 1 || 1);

  const puntos = datos.map((dato, index) => ({
    x: index * espaciado,
    y: calcularY(dato.total),
    valor: dato.total,
    mes: dato.mesFormateado
  }));

  const lineaPath = puntos
    .map((punto, index) => `${index === 0 ? 'M' : 'L'} ${punto.x} ${punto.y}`)
    .join(' ');

  const areaPath = `${lineaPath} L ${puntos[puntos.length - 1].x} 95 L 0 95 Z`;

  return (
    <div className="grafico-linea-container">
      <h3 className="grafico-titulo">{titulo}</h3>
      <div className="grafico-linea-contenido">
        <svg viewBox="0 0 100 100" className="grafico-linea-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#667eea" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Líneas de grid */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeWidth="0.2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.2" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#e2e8f0" strokeWidth="0.2" />

          {/* Área bajo la línea */}
          <path
            d={areaPath}
            fill="url(#areaGradient)"
          />

          {/* Línea principal */}
          <path
            d={lineaPath}
            fill="none"
            stroke="#667eea"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos */}
          {puntos.map((punto, index) => (
            <g key={index}>
              <circle
                cx={punto.x}
                cy={punto.y}
                r="1.5"
                fill="white"
                stroke="#667eea"
                strokeWidth="0.5"
                className="punto-linea"
                data-mes={punto.mes}
                data-valor={formatearMoneda(punto.valor)}
              />
            </g>
          ))}
        </svg>

        <div className="grafico-linea-etiquetas">
          {datos.map((dato, index) => (
            <div key={index} className="etiqueta-mes">
              <span className="etiqueta-mes-nombre">{dato.mesFormateado}</span>
              <span className="etiqueta-mes-valor">{formatearMoneda(dato.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraficoLinea;
