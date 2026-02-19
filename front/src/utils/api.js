import axios from 'axios';

// Créer une instance Axios pour l'API REST
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // URL de base de votre API REST
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;