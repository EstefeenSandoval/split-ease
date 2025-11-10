import React, { useState } from 'react'; // <--- 1. Importar useState
import './GraficoTorta.css';

const GraficoTorta = ({ datos, titulo }) => {
  // --- 2. Añadir estados para el tooltip ---
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const colores = [
    '#BCEBCB', // verde-principal
    '#80CBC4', // verde-agua
    '#66BB6A', // verde-brillante
    '#FFB74D', // naranja-miel
    '#81D4FA', // azul-suave
    '#CE93D8', // lila-suave
    '#AED581', // verde-lima
    '#C8E6C9', // verde-claro
    '#FFF59D', // amarillo-suave
    '#FFB3BA'  // rosa-coral-suave
  ];

  const prepararDatos = () => {
    if (datos.length <= 10) {
      return datos;
    }
    const datosOrdenados = [...datos].sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
    const top9 = datosOrdenados.slice(0, 9);
    const otros = datosOrdenados.slice(9);
    const totalOtros = otros.reduce((sum, item) => sum + parseFloat(item.total), 0);
    return [
      ...top9,
      {
        nombre: 'Otros',
        total: totalOtros
      }
    ];
  };

  const datosLimitados = prepararDatos();

  const calcularTotal = () => {
    return datosLimitados.reduce((sum, item) => sum + parseFloat(item.total), 0);
  };

  const total = calcularTotal();

  const crearSegmentos = () => {
    let acumulado = 0;
    return datosLimitados.map((item, index) => {
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

  const segmentos = datosLimitados.length > 0 ? crearSegmentos() : [];

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

  // --- 3. Añadir manejadores de eventos ---
  const handleMouseEnter = (e, segmento) => {
    setHoveredSegment(segmento);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    // Actualiza la posición mientras el mouse se mueve sobre el segmento
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };


  if (datos.length === 0) {
    return (
      <div className="grafico-torta-container">
        <h3 className="grafico-titulo">{titulo}</h3>
        <div className="grafico-vacio">
          <p> No hay datos disponibles </p>
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
                  // --- 4. Asignar los manejadores ---
                  onMouseEnter={(e) => handleMouseEnter(e, segmento)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
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

      {/* --- 5. Renderizar el Tooltip --- */}
      {hoveredSegment && (
        <div 
          className="grafico-tooltip" 
          style={{ 
            position: 'fixed', // Posición fija en la pantalla
            top: tooltipPos.y,
            left: tooltipPos.x,
            // Pequeño offset para que no esté justo bajo el cursor
            transform: 'translate(15px, 15px)', 
          }}
        >
          <div 
            className="leyenda-color" 
            style={{ backgroundColor: hoveredSegment.color }}
          ></div>
          <span className="tooltip-nombre">{hoveredSegment.nombre}</span>
          <span className="tooltip-porcentaje">
            {hoveredSegment.porcentaje.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default GraficoTorta;