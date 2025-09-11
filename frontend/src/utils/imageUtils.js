// Utilidad para manejar URLs de fotos de perfil
export const obtenerURLFotoPerfil = (fotoUrl) => {
  if (!fotoUrl) return null;
  
  // Si es un data URL (para preview), devolverlo directamente
  if (fotoUrl.startsWith('data:')) {
    return fotoUrl;
  }
  
  // Verificar si la URL ya incluye el protocolo y host
  if (fotoUrl.startsWith('http')) {
    return fotoUrl;
  } else {
    // Si es una ruta relativa, agregar el host
    return `http://localhost:3100${fotoUrl}`;
  }
};

// Componente de imagen de perfil con manejo de errores
export const ImagenPerfil = ({ 
  fotoUrl, 
  nombre, 
  className = '', 
  size = '60px',
  fallbackIcon = true,
  onError = null 
}) => {
  const manejarError = (e) => {
    console.log('Error al cargar imagen:', obtenerURLFotoPerfil(fotoUrl));
    e.target.style.display = 'none';
    const placeholder = e.target.parentNode.querySelector('.foto-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
    if (onError) onError(e);
  };

  return (
    <div className={`imagen-perfil-container ${className}`} style={{ position: 'relative' }}>
      {fotoUrl ? (
        <img 
          src={obtenerURLFotoPerfil(fotoUrl)} 
          alt={`Foto de ${nombre}`}
          className="imagen-perfil"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover'
          }}
          onError={manejarError}
        />
      ) : null}
      <div 
        className="foto-placeholder" 
        style={{ 
          display: fotoUrl ? 'none' : 'flex',
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}
      >
        {fallbackIcon && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '60%', height: '60%' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default { obtenerURLFotoPerfil, ImagenPerfil };
