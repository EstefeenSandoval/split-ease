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

  const formatearMonedaCorto = (valor) => {
    const num = parseFloat(valor);
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}k`;
    }
    return `$${num.toFixed(0)}`;
  };

  if (!datos || datos.length === 0) {
    return (
      <div className="grafico-linea-container">
        <h3 className="grafico-titulo">{titulo}</h3>
        <div className="grafico-vacio">
          <p> No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const valores = datos.map(d => parseFloat(d.total));
  const maxValor = Math.max(...valores);
  const minValor = Math.min(...valores);
  
  // Calcular el rango con un poco de padding
  const rango = maxValor - minValor;
  const padding = rango * 0.1 || maxValor * 0.1;
  const yMax = maxValor + padding;
  const yMin = Math.max(0, minValor - padding);
  const yRango = yMax - yMin;

  // Generar etiquetas del eje Y (4 niveles)
  const etiquetasY = [];
  for (let i = 0; i <= 3; i++) {
    const valor = yMin + (yRango * i / 3);
    etiquetasY.push({
      valor: valor,
      y: 85 - (i * 25), // De abajo hacia arriba
      label: formatearMonedaCorto(valor)
    });
  }

  const calcularAltura = (valor) => {
    if (yRango === 0) return 30;
    return ((parseFloat(valor) - yMin) / yRango) * 70;
  };

  // Configuración del gráfico
  const paddingLeft = 12;
  const paddingRight = 2;
  const usableWidth = 100 - paddingLeft - paddingRight;
  const barWidth = usableWidth / datos.length * 0.6;
  const barSpacing = usableWidth / datos.length;

  const barras = datos.map((dato, index) => {
    const altura = calcularAltura(dato.total);
    const x = paddingLeft + index * barSpacing + (barSpacing - barWidth) / 2;
    const y = 85 - altura;
    
    return {
      x,
      y,
      altura,
      width: barWidth,
      valor: dato.total,
      mes: dato.mesFormateado
    };
  });

  return (
    <div className="grafico-linea-container">
      <h3 className="grafico-titulo">{titulo}</h3>
      <div className="grafico-linea-contenido">
        <svg viewBox="0 0 100 100" className="grafico-linea-svg" preserveAspectRatio="xMidYMid meet">
          {/* Líneas horizontales de referencia */}
          {etiquetasY.map((etiqueta, index) => (
            <g key={index}>
              <line 
                x1={paddingLeft} 
                y1={etiqueta.y} 
                x2="100" 
                y2={etiqueta.y} 
                stroke="#c8e6c9" 
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
              <text
                x={paddingLeft - 2}
                y={etiqueta.y + 1}
                fontSize="3"
                fill="#596869"
                textAnchor="end"
                fontWeight="500"
              >
                {etiqueta.label}
              </text>
            </g>
          ))}

          {/* Eje X */}
          <line 
            x1={paddingLeft} 
            y1="85" 
            x2="100" 
            y2="85" 
            stroke="#80CBC4" 
            strokeWidth="0.4"
          />

          {/* Barras */}
          {barras.map((barra, index) => (
            <g key={index}>
              {/* Barra */}
              <rect
                x={barra.x}
                y={barra.y}
                width={barra.width}
                height={barra.altura}
                fill="#498467"
                rx="0.5"
                className="punto-linea"
              />
              
              {/* Etiqueta del mes debajo */}
              <text
                x={barra.x + barra.width / 2}
                y="92"
                fontSize="3.5"
                fill="#596869"
                textAnchor="middle"
                fontWeight="600"
              >
                {barra.mes}
              </text>

              {/* Valor encima de la barra */}
              <text
                x={barra.x + barra.width / 2}
                y={barra.y - 2}
                fontSize="3"
                fill="#252627"
                textAnchor="middle"
                fontWeight="600"
              >
                {formatearMonedaCorto(barra.valor)}
              </text>
            </g>
          ))}
        </svg>

        {/* Etiquetas con valores completos abajo */}
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
