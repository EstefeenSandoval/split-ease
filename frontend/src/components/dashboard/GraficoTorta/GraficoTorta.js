import React from 'react';
import './GraficoTorta.css';

const GraficoTorta = ({ datos, titulo }) => {
  const colores = [
    '#667eea',
    '#43e97b',
    '#fa709a',
    '#4facfe',
    '#f093fb',
    '#feca57',
    '#48dbfb',
    '#ff6b6b',
    '#a29bfe',
    '#00b894'
  ];

  const calcularTotal = () => {
    return datos.reduce((sum, item) => sum + parseFloat(item.total), 0);
  };

  const total = calcularTotal();

  const crearSegmentos = () => {
    let acumulado = 0;
    return datos.map((item, index) => {
      const porcentaje = (parseFloat(item.total) / total) * 100;
      const angulo = (porcentaje / 100) * 360;
      const inicio = acumulado;
      acumulado += angulo;

      return {
        ...item,
        porcentaje,
        angulo,
        inicio,
        color: colores[index % colores.length]
      };
    });
  };

  const segmentos = datos.length > 0 ? crearSegmentos() : [];

  const crearPathSVG = (segmento) => {
    const { inicio, angulo } = segmento;
    const radioExterno = 100;
    const radioInterno = 60;

    const anguloRad1 = ((inicio - 90) * Math.PI) / 180;
    const anguloRad2 = ((inicio + angulo - 90) * Math.PI) / 180;

    const x1 = 120 + radioExterno * Math.cos(anguloRad1);
    const y1 = 120 + radioExterno * Math.sin(anguloRad1);
    const x2 = 120 + radioExterno * Math.cos(anguloRad2);
    const y2 = 120 + radioExterno * Math.sin(anguloRad2);
    const x3 = 120 + radioInterno * Math.cos(anguloRad2);
    const y3 = 120 + radioInterno * Math.sin(anguloRad2);
    const x4 = 120 + radioInterno * Math.cos(anguloRad1);
    const y4 = 120 + radioInterno * Math.sin(anguloRad1);

    const largeArcFlag = angulo > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radioExterno} ${radioExterno} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${radioInterno} ${radioInterno} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(parseFloat(valor));
  };

  if (datos.length === 0) {
    return (
      <div className="grafico-torta-container">
        <h3 className="grafico-titulo">{titulo}</h3>
        <div className="grafico-vacio">
          <p>📊 No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grafico-torta-container">
      <h3 className="grafico-titulo">{titulo}</h3>
      <div className="grafico-contenido">
        <div className="grafico-svg-wrapper">
          <svg viewBox="0 0 240 240" className="grafico-svg">
            <g className="segmentos">
              {segmentos.map((segmento, index) => (
                <path
                  key={index}
                  d={crearPathSVG(segmento)}
                  fill={segmento.color}
                  className="segmento"
                  data-nombre={segmento.nombre}
                  data-valor={formatearMoneda(segmento.total)}
                  data-porcentaje={`${segmento.porcentaje.toFixed(1)}%`}
                />
              ))}
            </g>
            <circle cx="120" cy="120" r="50" fill="white" />
            <text
              x="120"
              y="115"
              textAnchor="middle"
              className="grafico-total-label"
            >
              Total
            </text>
            <text
              x="120"
              y="130"
              textAnchor="middle"
              className="grafico-total-valor"
            >
              {formatearMoneda(total)}
            </text>
          </svg>
        </div>
        <div className="grafico-leyenda">
          {segmentos.map((segmento, index) => (
            <div key={index} className="leyenda-item">
              <div
                className="leyenda-color"
                style={{ backgroundColor: segmento.color }}
              ></div>
              <div className="leyenda-info">
                <span className="leyenda-nombre">{segmento.nombre}</span>
                <span className="leyenda-valor">
                  {formatearMoneda(segmento.total)}
                  <span className="leyenda-porcentaje">
                    ({segmento.porcentaje.toFixed(1)}%)
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraficoTorta;
