import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { API_ENDPOINTS, construirURLEstatico } from '../config/api';
import { isNativeApp } from '../utils/platform';
import './Opciones.css';

const Opciones = () => {
  const navigate = useNavigate();
  const isNative = isNativeApp();
  
  const [userProfile, setUserProfile] = useState({
    id_usuario: '',
    nombre: '',
    email: '',
    foto_perfil: null,
    email_verificado: false
  });

  const [originalProfile, setOriginalProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingVerificationMessage, setPendingVerificationMessage] = useState(null);

  // const [setSettings] = useState({
  //   language: 'es',
  //   currency: 'MXN',
  //   autoConversion: true
  // });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    loadUserData();
  }, []);

  // Detectar cambios en el perfil
  useEffect(() => {
    if (originalProfile.nombre) {
      const hasProfileChanges = 
        userProfile.nombre !== originalProfile.nombre ||
        userProfile.email !== originalProfile.email ||
        userProfile.foto_perfil !== originalProfile.foto_perfil;
      setHasChanges(hasProfileChanges);
    }
  }, [userProfile, originalProfile]);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      const response = await fetch(API_ENDPOINTS.usuarios.validar, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.usuario) {
        const userData = {
          id_usuario: data.usuario.id_usuario,
          nombre: data.usuario.nombre,
          email: data.usuario.email,
          foto_perfil: data.usuario.foto_perfil,
          email_verificado: data.usuario.email_verificado || false
        };
        setUserProfile(userData);
        setOriginalProfile(userData);
      } else {
        toast.error('Error al cargar datos del usuario');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error de conexión al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // const handleSettingsChange = (field, value) => {
  //   setSettings(prev => ({
  //     ...prev,
  //     [field]: value
  //   }));
  // };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos PNG, JPG o GIF');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo debe ser menor a 5MB');
        return;
      }

      // Crear URL temporal para preview y guardar el archivo
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserProfile(prev => ({
          ...prev,
          foto_perfil: e.target.result,
          newProfilePicFile: file // Guardar el archivo para subirlo
        }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const obtenerFotoPerfilUrl = (fotoUrl) => {
    return construirURLEstatico(fotoUrl);
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) {
      toast.info('No hay cambios para guardar');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No se encontró token de autenticación');
        setIsSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append('nombre', userProfile.nombre);
      formData.append('email', userProfile.email);
      if (userProfile.newProfilePicFile) {
        formData.append('foto_perfil', userProfile.newProfilePicFile);
      }

      const response = await fetch(API_ENDPOINTS.usuarios.actualizarPerfil, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Error al actualizar el perfil');
        setIsSaving(false);
        return;
      }

      // Check if verification is pending (for name/email changes)
      if (data.requiereVerificacion) {
        setPendingVerificationMessage(data.mensaje);
        // Update photo if it was changed (photo doesn't require verification)
        if (data.usuario && data.usuario.foto_perfil !== originalProfile.foto_perfil) {
          setUserProfile(prev => ({
            ...prev,
            nombre: originalProfile.nombre,
            email: originalProfile.email,
            foto_perfil: data.usuario.foto_perfil,
            newProfilePicFile: null
          }));
          setOriginalProfile(prev => ({
            ...prev,
            foto_perfil: data.usuario.foto_perfil
          }));
          // Actualizar localStorage con la nueva foto
          const storedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
          storedUser.foto_perfil = data.usuario.foto_perfil;
          localStorage.setItem('usuario', JSON.stringify(storedUser));
          window.dispatchEvent(new Event('profileUpdated'));
        } else {
          // Reset to original if no photo change
          setUserProfile({ ...originalProfile });
        }
        setHasChanges(false);
        setIsSaving(false);
        return;
      }

      // Actualizar localStorage con nuevos datos
      const updatedUser = {
        nombre: data.usuario.nombre,
        foto_perfil: data.usuario.foto_perfil
      };
      localStorage.setItem('usuario', JSON.stringify(updatedUser));

      // Disparar evento personalizado para actualizar otros componentes
      window.dispatchEvent(new Event('profileUpdated'));

      // Actualizar estado local
      setUserProfile(prev => ({
        ...prev,
        foto_perfil: data.usuario.foto_perfil,
        newProfilePicFile: null
      }));
      setOriginalProfile({
        ...originalProfile,
        nombre: data.usuario.nombre,
        email: data.usuario.email,
        foto_perfil: data.usuario.foto_perfil
      });

      setHasChanges(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error de conexión al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const resetChanges = () => {
    setUserProfile({ ...originalProfile });
    setHasChanges(false);
  };

  // Función para tomar foto con la cámara (solo móvil nativo)
  const handleTakePhoto = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      
      const image = await Camera.getPhoto({
        quality: 100,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera, // Permite elegir entre cámara y galería
        width: 1024,
        height: 1024,
        correctOrientation: true,
        presentationStyle: 'fullscreen'
      });

      if (image.dataUrl) {
        // Convertir dataUrl a File para subir
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });

        setUserProfile(prev => ({
          ...prev,
          foto_perfil: image.dataUrl,
          newProfilePicFile: file
        }));
        setHasChanges(true);
        toast.success('Foto capturada correctamente');
      }
    } catch (error) {
      if (error.message !== 'User cancelled photos app') {
        console.error('Error taking photo:', error);
        toast.error('Error al tomar la foto');
      }
    }
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Haptics not available
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    toast.info('Sesión cerrada correctamente');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="opciones-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="opciones-container">
      <div className="opciones-header">
        <h1>Configuración de Cuenta</h1>
        <p>Gestiona tu perfil y personaliza tu experiencia en SplitEase</p>
      </div>

      {/* Perfil de Usuario */}
      <div className="section profile-section-container">
        <div className="section-header">
          <h2>
            <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Perfil de Usuario
          </h2>
          {hasChanges && (
            <span className="changes-indicator">Cambios pendientes</span>
          )}
        </div>
        
        <div className="profile-content">
          <div className="avatar-section">
            <div className="avatar-container">
              <div className="avatar">
                {userProfile.foto_perfil ? (
                  <img 
                    src={obtenerFotoPerfilUrl(userProfile.foto_perfil)} 
                    alt="Foto de perfil" 
                    className="avatar-img"
                    onError={(e) => {
                      console.log('Error al cargar imagen en opciones:', obtenerFotoPerfilUrl(userProfile.foto_perfil));
                      e.target.style.display = 'none';
                      e.target.parentNode.querySelector('.avatar-placeholder').style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="avatar-placeholder" style={{ display: userProfile.foto_perfil ? 'none' : 'flex' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="avatar-overlay">
                  <label htmlFor="profile-picture" className="avatar-upload-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="avatar-input"
                  />
                </div>
              </div>
              <p className="avatar-help-text">
                {isNative ? 'Toma una foto o selecciona de tu galería' : 'Haz clic para cambiar tu foto de perfil'}
              </p>
              {isNative && (
                <button 
                  type="button" 
                  className="btn-take-photo"
                  onClick={handleTakePhoto}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Tomar Foto
                </button>
              )}
            </div>
          </div>
          
          <div className="profile-form">
            {/* Email verification warning */}
            {!userProfile.email_verificado && (
              <div className="verification-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="verification-warning-text">
                  <span className="verification-warning-title">Email no verificado</span>
                  <span className="verification-warning-subtitle">Verifica tu correo para poder editar tu nombre o email. Puedes cambiar tu foto de perfil sin restricciones.</span>
                </div>
              </div>
            )}

            {/* Pending verification message */}
            {pendingVerificationMessage && (
              <div className="pending-verification-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="pending-message-text">
                  <span className="pending-message-title">Confirmación requerida</span>
                  <span className="pending-message-subtitle">{pendingVerificationMessage}</span>
                </div>
                <button 
                  type="button" 
                  className="dismiss-message"
                  onClick={() => setPendingVerificationMessage(null)}
                >
                  ✕
                </button>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={userProfile.nombre}
                  onChange={(e) => handleProfileChange('nombre', e.target.value)}
                  className={`input-field ${!userProfile.email_verificado ? 'disabled' : ''}`}
                  placeholder="Tu nombre completo"
                  disabled={!userProfile.email_verificado}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={userProfile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className={`input-field ${!userProfile.email_verificado ? 'disabled' : ''}`}
                  placeholder="tu@email.com"
                  disabled={!userProfile.email_verificado}
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Botones de acción */}
      <div className="action-section">
        {hasChanges && (
          <button
            onClick={resetChanges}
            className="btn btn-secondary"
            disabled={isSaving}
          >
            Cancelar cambios
          </button>
        )}
        <button
          onClick={handleSaveChanges}
          className={`btn btn-primary ${hasChanges ? 'has-changes' : ''}`}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <>
              <div className="btn-spinner"></div>
              Guardando...
            </>
          ) : (
            <>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar cambios
            </>
          )}
        </button>
      </div>

      {/* Sección de Cerrar Sesión - Solo móvil nativo */}
      {isNative && (
        <div className="section logout-section">
          <button
            onClick={handleLogout}
            className="btn btn-logout"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default Opciones;