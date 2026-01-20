import React, { useState, useEffect } from 'react';
import AuthLayout from '../components/templates/AuthLayout';
import Input from '../components/atoms/Input';
import PasswordInput from '../components/molecules/PasswordInput';
import Button from '../components/atoms/Button';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => { localStorage.clear(); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await api.post('/users/register/', { username, password, full_name: fullName });
        setShowSuccessModal(true);
    } catch (error) {
        let msg = "Terjadi kesalahan.";
        if (error.response?.data?.username) msg = "Username sudah digunakan.";
        else if (error.response?.data?.password) msg = "Password terlalu lemah.";
        setErrorMessage(msg);
        setShowErrorModal(true);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in-up">
                <div className="flex justify-center mb-4"><div className="bg-green-100 p-4 rounded-full"><CheckCircle className="w-12 h-12 text-green-500" /></div></div>
                <h3 className="text-xl font-bold text-green-500 mb-2">Registrasi Berhasil!</h3>
                <p className="text-gray-600 mb-6">Silakan Login dengan akun baru Anda.</p>
                <button onClick={() => navigate('/')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg w-full">Login Sekarang</button>
            </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="flex justify-center mb-4"><div className="bg-red-100 p-4 rounded-full"><XCircle className="w-12 h-12 text-red-500" /></div></div>
                <h3 className="text-xl font-bold text-red-500 mb-2">Registrasi Gagal</h3>
                <p className="text-gray-600 mb-6">{errorMessage}</p>
                <button onClick={() => setShowErrorModal(false)} className="bg-red-500 text-white py-2 px-6 rounded-lg w-full">Tutup</button>
            </div>
        </div>
      )}

      <AuthLayout title="Register User" footerText="Sudah punya akun?" footerLinkText="Login Sekarang" footerLinkTo="/">
        <form onSubmit={handleRegister} className="space-y-4">
          <div><Input placeholder="Nama Lengkap" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
          <div><Input placeholder="Nama Pengguna (Username)" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
          <PasswordInput placeholder="Kata Sandi" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="mt-4" disabled={loading}>{loading ? "Mendaftar..." : "Daftar Sekarang"}</Button>
        </form>
      </AuthLayout>
    </>
  );
};
export default Register;