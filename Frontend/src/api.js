import axios from 'axios';

const api = axios.create({
  // Gunakan variabel environment, kalau tidak ada pakai localhost (fallback)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// --- INTERCEPTOR (Penyegat Request) ---
// Sebelum request dikirim, fungsi ini akan mencegatnya
api.interceptors.request.use(
  (config) => {
    // Ambil token dari Local Storage
    const token = localStorage.getItem('access_token');
    
    // Kalau token ada, tempelkan ke Header 'Authorization'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;