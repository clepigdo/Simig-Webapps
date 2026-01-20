import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Beranda from './pages/Beranda';
import DataBarang from './pages/DataBarang';
import BarangMasuk from './pages/BarangMasuk';
import BarangKeluar from './pages/BarangKeluar';
import KelolaKategori from './pages/KelolaKategori';
import Laporan from './pages/Laporan';
import SettingProfil from './pages/SettingProfil';
import ProtectedRoute from './components/templates/ProtectedRoute';
import ManajemenPengguna from './pages/ManajemenPengguna';

// Komponen Helper untuk Cek Role
const AdminRoute = ({ children }) => {
  const role = localStorage.getItem('role');
  return role === 'admin' ? children : <Navigate to="/beranda" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rute Private (Login Dulu) */}
        <Route element={<ProtectedRoute />}>
            <Route path="/beranda" element={<Beranda />} />
            <Route path="/data-barang" element={<DataBarang />} />
            
            {/* RUTE KHUSUS ADMIN (Diproteksi) */}
            <Route path="/barang-masuk" element={
              <AdminRoute><BarangMasuk /></AdminRoute>
            } />
            <Route path="/barang-keluar" element={
              <AdminRoute><BarangKeluar /></AdminRoute>
            } />
            <Route path="/kategori" element={
              <AdminRoute><KelolaKategori /></AdminRoute>
            } />
            <Route path="/manajemen-user" element={
              <AdminRoute><ManajemenPengguna /></AdminRoute>
            } />
            
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/profil" element={<SettingProfil />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;