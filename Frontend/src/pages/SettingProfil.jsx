import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/templates/DashboardLayout';
import Input from '../components/atoms/Input';
import { Edit, Lock, Image, Trash2, Save, X, CheckCircle, XCircle } from 'lucide-react';
import api from '../api';

const SettingProfil = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ id: '', username: '', full_name: '', email: '', image_url: null });
  
  // --- STATE MODALS ---
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [showModalFoto, setShowModalFoto] = useState(false);

  // --- STATE ALERT/TOAST ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [message, setMessage] = useState('');

  // --- STATE FORMS ---
  const [editForm, setEditForm] = useState({ username: '', full_name: '' });
  const [passForm, setPassForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("Tidak ada file yang dipilih");

  // --- FETCH DATA ---
  const fetchProfile = async () => {
      try { 
          const response = await api.get('/users/profile/'); 
          setUserData(response.data); 
          setEditForm({ 
              username: response.data.username, 
              full_name: response.data.full_name || '' 
          }); 
      } catch (error) { 
          console.error(error); 
      } finally { 
          setLoading(false); 
      }
  };

  useEffect(() => { fetchProfile(); }, []);

  // --- HANDLERS ---
  const triggerSuccess = (msg) => { setMessage(msg); setShowSuccessModal(true); setTimeout(() => setShowSuccessModal(false), 2000); };
  const triggerError = (msg) => { setMessage(msg); setShowErrorModal(true); };

  const handleUpdateProfil = async () => {
      try { 
          await api.put('/users/profile/', editForm); 
          triggerSuccess("Profil berhasil diperbarui!"); 
          window.dispatchEvent(new Event('profile-updated')); // Trigger update sidebar foto
          fetchProfile(); 
          setShowModalEdit(false); 
      } catch (error) { 
          triggerError("Gagal update profil."); 
      }
  };

  const handleChangePassword = async () => {
      if (passForm.new_password !== passForm.confirm_password) { triggerError("Password konfirmasi tidak cocok!"); return; }
      try { 
          await api.put('/users/profile/change-password/', passForm); 
          triggerSuccess("Kata sandi berhasil diubah!"); 
          setPassForm({ old_password: '', new_password: '', confirm_password: '' }); 
          setShowModalPassword(false); 
      } catch (error) { 
          triggerError("Password lama salah atau terjadi kesalahan."); 
      }
  };

  const handleUploadFoto = async () => {
      if (!selectedFile) return;
      const formData = new FormData(); 
      formData.append('image', selectedFile);
      try { 
          const response = await api.put('/users/profile/upload-image/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
          triggerSuccess("Foto berhasil diganti!"); 
          window.dispatchEvent(new Event('profile-updated')); 
          setUserData({ ...userData, image_url: response.data.image_url }); 
          setShowModalFoto(false); 
          setSelectedFile(null); 
          setFileName("Tidak ada file yang dipilih");
      } catch (error) { 
          triggerError("Gagal upload foto."); 
      }
  };

  const handleFileChange = (e) => { 
      if(e.target.files[0]) { 
          setSelectedFile(e.target.files[0]); 
          setFileName(e.target.files[0].name); 
      } 
  };

  const resetForms = () => {
      setEditForm({ username: userData.username, full_name: userData.full_name });
      setPassForm({ old_password: '', new_password: '', confirm_password: '' });
      setSelectedFile(null);
      setFileName("Tidak ada file yang dipilih");
  };

  const closeModal = () => {
      setShowModalEdit(false);
      setShowModalPassword(false);
      setShowModalFoto(false);
      resetForms();
  };

  if (loading) return <DashboardLayout><div className="p-6">Loading Profil...</div></DashboardLayout>;

  return (
    <DashboardLayout>
        {/* --- TITLE --- */}
        <h2 className="text-2xl font-bold text-black mb-6">Profil</h2>

        {/* --- ACTION BUTTONS --- */}
        <div className="flex flex-wrap gap-4 mb-6">
            <button 
                onClick={() => setShowModalEdit(true)} 
                className="bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors"
            >
                <Edit className="w-4 h-4" /> Edit Profil
            </button>
            <button 
                onClick={() => setShowModalPassword(true)} 
                className="bg-[#10b981] hover:bg-green-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors"
            >
                <Lock className="w-4 h-4" /> Ganti Kata Sandi
            </button>
            <button 
                onClick={() => setShowModalFoto(true)} 
                className="bg-[#f59e0b] hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors"
            >
                <Image className="w-4 h-4" /> Ganti Foto
            </button>
        </div>
        
        {/* --- PROFILE CARDS CONTAINER --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT CARD: FOTO (Border Top Blue) */}
            <div className="bg-white shadow-md rounded-sm border-t-4 border-t-[#0d6efd] p-6 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200">
                    <img 
                        src={userData.image_url ? `${userData.image_url}` : "https://via.placeholder.com/150"} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} 
                    />
                </div>
            </div>

            {/* RIGHT CARD: DETAIL DATA (Border Top Blue) */}
            <div className="md:col-span-2 bg-white shadow-md rounded-sm border-t-4 border-t-[#0d6efd] p-8">
                <table className="w-full text-base">
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="py-4 font-bold text-black w-1/3">ID Profil</td>
                            <td className="py-4 font-bold text-black px-2">:</td>
                            <td className="py-4 text-black">{userData.id}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-4 font-bold text-black w-1/3">Nama Pengguna</td>
                            <td className="py-4 font-bold text-black px-2">:</td>
                            <td className="py-4 text-black">{userData.username}</td>
                        </tr>
                        <tr>
                            <td className="py-4 font-bold text-black w-1/3">Nama Lengkap</td>
                            <td className="py-4 font-bold text-black px-2">:</td>
                            <td className="py-4 text-black">{userData.full_name || '-'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* ================= MODALS ================= */}

        {/* --- 1. MODAL EDIT PROFIL --- */}
        {showModalEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 transform transition-all animate-fade-in-down">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2"><Edit className="w-5 h-5"/> Edit Profil</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Nama Pengguna</label>
                            <Input value={editForm.username} onChange={(e)=>setEditForm({...editForm, username: e.target.value})} className="w-full border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Nama Lengkap</label>
                            <Input value={editForm.full_name} onChange={(e)=>setEditForm({...editForm, full_name: e.target.value})} className="w-full border-gray-300" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-white rounded-b-lg">
                        <button onClick={resetForms} className="bg-[#dc3545] hover:bg-red-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2"><Trash2 className="w-4 h-4" /> Reset</button>
                        <button onClick={handleUpdateProfil} className="bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- 2. MODAL GANTI PASSWORD --- */}
        {showModalPassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 transform transition-all animate-fade-in-down">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2"><Lock className="w-5 h-5"/> Ganti Kata Sandi</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Kata Sandi Lama</label>
                            <Input type="password" value={passForm.old_password} onChange={(e)=>setPassForm({...passForm, old_password: e.target.value})} className="w-full border-gray-300" placeholder="Masukkan Kata Sandi Lama" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Kata Sandi Baru</label>
                            <Input type="password" value={passForm.new_password} onChange={(e)=>setPassForm({...passForm, new_password: e.target.value})} className="w-full border-gray-300" placeholder="Masukkan Kata Sandi Baru" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Ulangi Kata Sandi</label>
                            <Input type="password" value={passForm.confirm_password} onChange={(e)=>setPassForm({...passForm, confirm_password: e.target.value})} className="w-full border-gray-300" placeholder="Ulangi Kata Sandi Baru" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-white rounded-b-lg">
                        <button onClick={resetForms} className="bg-[#dc3545] hover:bg-red-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2"><Trash2 className="w-4 h-4" /> Reset</button>
                        <button onClick={handleChangePassword} className="bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- 3. MODAL GANTI FOTO --- */}
        {showModalFoto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 transform transition-all animate-fade-in-down">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2"><Image className="w-5 h-5"/> Ganti Foto</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <label className="block text-sm font-bold text-black mb-1">Foto Baru</label>
                        <div className="flex items-center gap-3">
                            <label className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded cursor-pointer border border-gray-300 font-medium text-sm">
                                Pilih File
                                <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                            </label>
                            <span className="text-gray-500 text-sm italic">{fileName}</span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-white rounded-b-lg">
                        <button onClick={resetForms} className="bg-[#dc3545] hover:bg-red-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2"><Trash2 className="w-4 h-4" /> Reset</button>
                        <button onClick={handleUploadFoto} className="bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- TOAST SUCCESS --- */}
        {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                    <CheckCircle className="w-6 h-6 text-green-400" /> 
                    <span className="font-bold text-lg">{message}</span>
                </div>
            </div>
        )}

        {/* --- ERROR MODAL --- */}
        {showErrorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
                    <div className="flex justify-center mb-3"><XCircle className="w-12 h-12 text-red-500" /></div>
                    <p className="text-gray-800 font-medium">{message}</p>
                    <button onClick={()=>setShowErrorModal(false)} className="mt-5 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded shadow">Tutup</button>
                </div>
            </div>
        )}

    </DashboardLayout>
  );
};

export default SettingProfil;