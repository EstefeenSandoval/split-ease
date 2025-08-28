const API_BASE_URL = 'http://localhost:3100/api';

export const API_ENDPOINTS = {
  usuarios: {
    login: `${API_BASE_URL}/usuarios/login`,
    registro: `${API_BASE_URL}/usuarios/registro`,
    perfil: `${API_BASE_URL}/usuarios/perfil`,
    validar: `${API_BASE_URL}/usuarios/validar`,
    actualizarPerfil: `${API_BASE_URL}/usuarios/perfil`
  },
  
};

export default API_ENDPOINTS;
