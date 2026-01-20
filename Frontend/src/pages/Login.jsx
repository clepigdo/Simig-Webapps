import React, { useState, useEffect } from 'react';
import AuthLayout from '../components/templates/AuthLayout';
import Input from '../components/atoms/Input';
import PasswordInput from '../components/molecules/PasswordInput';
import Button from '../components/atoms/Button';
import api from '../api'; 
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // STATE ERROR MODAL
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => { localStorage.clear(); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await api.post('/users/login/', { username, password });
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('username', response.data.username);
        navigate('/beranda');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            setErrorMessage("Username atau Password salah!");
        } else {
            setErrorMessage("Gagal Login. Periksa koneksi server.");
        }
        setShowErrorModal(true);
    }
  };

  return (
    <>
      {/* POP UP ERROR MODERN */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100 animate-fade-in-up">
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-4 rounded-full">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-red-500 mb-2">Login Gagal</h3>
                <p className="text-gray-600 font-medium mb-6">{errorMessage}</p>
                <button onClick={() => setShowErrorModal(false)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg shadow w-full">
                    Coba Lagi
                </button>
            </div>
        </div>
      )}

      <AuthLayout title="Login" footerText="Belum punya akun?" footerLinkText="Daftar Sekarang" footerLinkTo="/register">
        <form onSubmit={handleLogin} className="space-y-4">
          <div><Input placeholder="Nama Pengguna" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
          <PasswordInput placeholder="Kata Sandi" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="mt-2">Login</Button>
        </form>
      </AuthLayout>
    </>
  );
};
export default Login;