import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/templates/DashboardLayout';
import Input from '../components/atoms/Input';
import { Plus, Edit, Trash2, Save, X, Search, CheckCircle, Users } from 'lucide-react';
import api from '../api';

const ManajemenPengguna = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE PAGINATION & SEARCH ---
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // --- MODALS STATE ---
  const [showModalForm, setShowModalForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- FORM STATE ---
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ 
      username: '', 
      full_name: '', 
      email: '', 
      password: '', 
      role: 'user' 
  });

  // --- FETCH DATA ---
  const fetchUsers = async () => {
      try {
          const response = await api.get('/users/manage/');
          setUsers(response.data);
      } catch (error) {
          console.error("Gagal ambil data user:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchUsers();
  }, []);

  // --- FILTER & PAGINATION ---
  const filteredUsers = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // --- HANDLERS ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSimpan = async (e) => {
      e.preventDefault();
      try {
          if (isEdit) {
              await api.put(`/users/manage/${currentId}/`, formData);
              setSuccessMessage("User berhasil diperbarui!");
          } else {
              await api.post('/users/manage/', formData);
              setSuccessMessage("User berhasil ditambahkan!");
          }
          fetchUsers();
          setShowModalForm(false);
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 1500);
      } catch (error) {
          alert("Gagal menyimpan data (Username mungkin sudah ada).");
      }
  };

  const handleHapus = async () => {
      try {
          await api.delete(`/users/manage/${currentId}/`);
          fetchUsers();
          setShowDeleteModal(false);
          setSuccessMessage("User berhasil dihapus!");
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 1500);
      } catch (error) {
          alert("Gagal menghapus user.");
      }
  };

  // --- HELPER ---
  const openModalTambah = () => { 
      setIsEdit(false); 
      setFormData({ username: '', full_name: '', email: '', password: '', role: 'user' }); 
      setShowModalForm(true); 
  };

  const openModalEdit = (item) => { 
      setIsEdit(true); 
      setCurrentId(item.id); 
      setFormData({ ...item, password: '' }); 
      setShowModalForm(true); 
  };

  const openModalHapus = (id) => { setCurrentId(id); setShowDeleteModal(true); };
  const closeModal = () => { setShowModalForm(false); setShowDeleteModal(false); };
  
  useEffect(() => { setCurrentPage(1); }, [searchTerm, itemsPerPage]);

  return (
    <DashboardLayout>
        <h2 className="text-2xl font-bold text-black mb-6">Manajemen Pengguna</h2>

        <button 
            onClick={openModalTambah}
            className="bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm mb-6 flex items-center gap-2 transition-colors"
        >
            <Plus className="w-4 h-4" /> Tambah User
        </button>

        {/* --- CARD TABLE (BORDER ATAS BIRU) --- */}
        <div className="bg-white shadow-md rounded-sm border-t-4 border-t-[#0d6efd] p-5">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 text-sm text-gray-700">
                <div className="flex items-center mb-2 md:mb-0">
                    <span className="mr-2">Show</span>
                    <select 
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="border border-gray-300 rounded p-1 focus:outline-none focus:border-blue-500"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span className="ml-2">entries</span>
                </div>
                <div className="flex items-center">
                    <span className="mr-2">Search:</span>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center border-collapse border border-gray-300">
                    <thead className="bg-white text-black font-bold">
                        <tr>
                            <th className="border border-gray-300 px-4 py-3 w-10">#</th>
                            <th className="border border-gray-300 px-4 py-3">Username</th>
                            <th className="border border-gray-300 px-4 py-3">Nama Lengkap</th>
                            <th className="border border-gray-300 px-4 py-3">Email</th>
                            <th className="border border-gray-300 px-4 py-3">Role</th>
                            <th className="border border-gray-300 px-4 py-3 w-40">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        {loading ? (
                            <tr><td colSpan="6" className="py-4 border border-gray-300">Memuat data...</td></tr>
                        ) : currentData.length === 0 ? (
                            <tr><td colSpan="6" className="py-4 border border-gray-300">Data tidak ditemukan.</td></tr>
                        ) : (
                            currentData.map((user, idx) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{startIndex + idx + 1}</td>
                                    <td className="border border-gray-300 px-4 py-2 font-medium text-black">{user.username}</td>
                                    <td className="border border-gray-300 px-4 py-2">{user.full_name || '-'}</td>
                                    <td className="border border-gray-300 px-4 py-2">{user.email || '-'}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openModalEdit(user)} className="bg-[#10b981] hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors">
                                                <Edit className="w-3 h-3" /> Edit
                                            </button>
                                            <button onClick={() => openModalHapus(user.id)} className="bg-[#dc3545] hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors">
                                                <Trash2 className="w-3 h-3" /> Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div>Showing {currentData.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries</div>
                <div className="flex border border-gray-300 rounded overflow-hidden">
                    <button 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-500 border-r border-gray-300 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button className="px-3 py-1 bg-[#0d6efd] text-white border-r border-gray-300">
                        {currentPage}
                    </button>
                    <button 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>

        {/* --- MODAL FORM USER (GARIS BORDER JELAS) --- */}
        {showModalForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 transform transition-all animate-fade-in-down">
                    
                    {/* Header dengan Garis Bawah Tegas (gray-300) */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2">
                            {isEdit ? <Edit className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                            {isEdit ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                        </h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSimpan}>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-black mb-1">Username</label>
                                <Input name="username" value={formData.username} onChange={handleChange} required className="w-full border-gray-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-black mb-1">Nama Lengkap</label>
                                <Input name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full border-gray-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-black mb-1">Email</label>
                                <Input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-gray-300" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-black mb-1">Role</label>
                                <select 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 text-gray-700 bg-white focus:ring-0 focus:border-blue-500"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-black mb-1">
                                    Password {isEdit && <span className="text-gray-400 font-normal text-xs">(Kosongkan jika tidak ingin mengubah)</span>}
                                </label>
                                <Input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border-gray-300" />
                            </div>
                        </div>

                        {/* Footer dengan Garis Atas Tegas (gray-300) */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-white rounded-b-lg">
                            <button 
                                type="button" 
                                onClick={closeModal} 
                                className="bg-[#dc3545] hover:bg-red-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors"
                            >
                                <X className="w-4 h-4" /> Batal
                            </button>
                            <button 
                                type="submit" 
                                className="bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors"
                            >
                                <Save className="w-4 h-4" /> Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* --- MODAL HAPUS (GARIS BORDER JELAS) --- */}
        {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 transform transition-all animate-fade-in-down">
                    
                    {/* Header dengan Garis Bawah Tegas (gray-300) */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2">
                            <Trash2 className="w-5 h-5" /> Hapus Pengguna
                        </h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <p className="text-black font-bold text-base">
                            Apakah anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>

                    {/* Footer dengan Garis Atas Tegas (gray-300) */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-white rounded-b-lg">
                        <button 
                            onClick={closeModal} 
                            className="bg-[#dc3545] hover:bg-red-600 text-white font-bold py-2 px-6 rounded shadow-sm transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleHapus} 
                            className="bg-[#0d6efd] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow-sm transition-colors"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL SUKSES (TOAST) --- */}
        {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-bounce transform transition-all">
                    <CheckCircle className="w-6 h-6 text-green-400" /> 
                    <span className="font-bold text-lg">{successMessage}</span>
                </div>
            </div>
        )}

    </DashboardLayout>
  );
};

export default ManajemenPengguna;