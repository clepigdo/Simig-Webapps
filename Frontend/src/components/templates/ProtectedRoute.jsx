import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Cek apakah token ada di penyimpanan browser
  const token = localStorage.getItem('access_token');

  // Jika token ada, izinkan masuk (Outlet). Jika tidak, lempar ke Login (Navigate to /)
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;