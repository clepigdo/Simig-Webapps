import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/templates/DashboardLayout';
import Modal from '../components/organisms/Modal';
import Input from '../components/atoms/Input';
import { Plus, Edit, Trash2, Save, X, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api';
import { useLocation, useNavigate } from 'react-router-dom';

const DataBarang = () => {
  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Pagination & Search
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // State Modals Input/Hapus
  const [showModalForm, setShowModalForm] = useState(false); 
  const [showModalHapus, setShowModalHapus] = useState(false);
  
  // State Modals Flow
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNavigateModal, setShowNavigateModal] = useState(false); // Modal tawaran ke barang masuk

  // --- STATE TOAST (BLACK PILL) ---
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // State Form Data
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
      name: '',
      category: '',
      color: '',
      weight: '',
      price_per_kg: '',
  });

  const location = useLocation(); 
  const navigate = useNavigate(); 
  const userRole = localStorage.getItem('role');

  // --- 1. HANDLE SEARCH GLOBAL ---
  useEffect(() => {
    if (location.state?.globalSearch) {
        setSearchTerm(location.state.globalSearch);
    }
  }, [location.state]);

  // --- 2. GET DATA ---
  const fetchData = async () => {
      try {
          const [resProducts, resCategories] = await Promise.all([
              api.get('/products/'),
              api.get('/categories/')
          ]);
          setProducts(resProducts.data);
          setCategories(resCategories.data);
      } catch (error) {
          console.error("Gagal ambil data:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, []);

  // --- 3. FILTER & PAGINATION ---
  const filteredProducts = products.filter((item) => {
      if (!searchTerm) return true;
      return (
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- TRIGGER TOAST HELPER ---
  const triggerToast = (msg) => {
      setToastMessage(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
  };

  // --- LOGIC 1: PRA-SIMPAN ---
  const handlePreSimpan = () => {
      if(!formData.name || !formData.category || !formData.price_per_kg) {
          alert("Mohon lengkapi Nama, Kategori, dan Harga.");
          return;
      }
      setShowModalForm(false);
      setShowConfirmModal(true);
  };

  // --- LOGIC 2: EKSEKUSI SIMPAN ---
  const handleProcessSave = async () => {
      const dataToSend = { ...formData, weight: formData.weight || 0 };

      try {
          if (isEdit) {
              await api.put(`/products/${currentId}/`, dataToSend);
              fetchData();
              setShowConfirmModal(false);
              triggerToast("Data berhasil diperbarui!"); // TOAST EDIT
          } else {
              await api.post('/products/', dataToSend);
              fetchData();
              setShowConfirmModal(false); 
              setShowNavigateModal(true); // Khusus Add, tampilkan tawaran navigasi
          }
      } catch (error) {
          const msg = error.response?.data ? JSON.stringify(error.response.data) : "Pastikan koneksi aman.";
          alert("Gagal menyimpan data: " + msg);
          setShowConfirmModal(false);
          setShowModalForm(true);
      }
  };

  // --- LOGIC 3: NAVIGASI ---
  const handleNavigateToBarangMasuk = () => { setShowNavigateModal(false); navigate('/barang-masuk'); };
  const handleStayInDataBarang = () => { setShowNavigateModal(false); triggerToast("Data berhasil ditambahkan!"); };

  // --- LOGIC HAPUS ---
  const handleHapus = async () => {
      try {
          await api.delete(`/products/${currentId}/`);
          fetchData();
          setShowModalHapus(false);
          triggerToast("Data berhasil dihapus!"); // TOAST HAPUS
      } catch (error) {
          console.error("Gagal hapus:", error);
          alert("Gagal menghapus data.");
      }
  };

  // --- HELPER FUNCTIONS ---
  const openModalTambah = () => {
      setIsEdit(false);
      setFormData({ name: '', category: '', color: '', weight: '', price_per_kg: '' });
      setShowModalForm(true);
  };

  const openModalEdit = (item) => {
      setIsEdit(true);
      setCurrentId(item.id);
      setFormData({
          name: item.name,
          category: item.category,
          color: item.color,
          weight: item.weight,
          price_per_kg: item.price_per_kg,
      });
      setShowModalForm(true);
  };

  const openModalHapus = (id) => { setCurrentId(id); setShowModalHapus(true); };
  
  const closeModal = () => {
      setShowModalForm(false);
      setShowModalHapus(false);
      setShowConfirmModal(false);
      setShowNavigateModal(false);
  };

  const formatRp = (val) => "Rp " + new Intl.NumberFormat("id-ID").format(val);
  const getCategoryName = (id) => { 
      // eslint-disable-next-line
      const cat = categories.find(c => c.id == id);
      return cat ? cat.name : '-'; 
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, itemsPerPage]);

  return (
    <DashboardLayout>
        <h2 className="text-2xl font-bold text-black mb-6">Data Barang</h2>

        {userRole === 'admin' && (
            <button 
                onClick={openModalTambah}
                className="bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm mb-6 flex items-center gap-2 transition-colors"
            >
                <Plus className="w-4 h-4" /> Tambah Barang
            </button>
        )}

        {/* --- CARD TABLE --- */}
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
                            <th className="border border-gray-300 px-4 py-3">Nama Barang</th>
                            <th className="border border-gray-300 px-4 py-3">Kategori</th>
                            <th className="border border-gray-300 px-4 py-3">Warna</th>
                            <th className="border border-gray-300 px-4 py-3">Total Berat (Kg)</th>
                            <th className="border border-gray-300 px-4 py-3">Harga/Kg</th>
                            <th className="border border-gray-300 px-4 py-3">Total Nilai(Rp)</th>
                            {userRole === 'admin' && (
                                <th className="border border-gray-300 px-4 py-3 w-32">Aksi</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        {loading ? (
                            <tr><td colSpan={userRole === 'admin' ? 8 : 7} className="py-4 border border-gray-300">Memuat data...</td></tr>
                        ) : currentData.length === 0 ? (
                            <tr><td colSpan={userRole === 'admin' ? 8 : 7} className="py-4 border border-gray-300">Data tidak ditemukan.</td></tr>
                        ) : (
                            currentData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{startIndex + index + 1}</td>
                                    <td className="border border-gray-300 px-4 py-2 font-medium text-black">{item.name}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.category_name}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.color}</td>
                                    <td className="border border-gray-300 px-4 py-2 font-bold">{item.weight} Kg</td>
                                    <td className="border border-gray-300 px-4 py-2">{formatRp(item.price_per_kg)}</td>
                                    <td className="border border-gray-300 px-4 py-2 font-bold text-gray-700">{formatRp(item.total_value)}</td>
                                    
                                    {userRole === 'admin' && (
                                        <td className="border border-gray-300 px-4 py-2">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => openModalEdit(item)} className="bg-[#10b981] hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors">
                                                    <Edit className="w-3 h-3" /> Edit
                                                </button>
                                                <button onClick={() => openModalHapus(item.id)} className="bg-[#dc3545] hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 font-medium transition-colors">
                                                    <Trash2 className="w-3 h-3" /> Hapus
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div>Showing {currentData.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries</div>
                <div className="flex border border-gray-300 rounded overflow-hidden">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-500 border-r border-gray-300 disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1 bg-[#0d6efd] text-white border-r border-gray-300">{currentPage}</button>
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-500 disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>

        {/* --- MODAL FORM --- */}
        {showModalForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 transform transition-all animate-fade-in-down">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2">
                            {isEdit ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEdit ? "Edit Barang" : "Tambah Barang"}
                        </h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 space-y-3">
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Nama Barang</label>
                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Masukkan Nama Barang" className="w-full border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Kategori</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700 bg-white focus:ring-0 focus:border-blue-500"><option value="">-- Pilih Kategori --</option>{categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Warna</label>
                            <Input name="color" value={formData.color} onChange={handleChange} placeholder="Masukkan Warna" className="w-full border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Harga/Kg</label>
                            <Input type="number" name="price_per_kg" value={formData.price_per_kg} onChange={handleChange} placeholder="Contoh: 1000000" className="w-full border-gray-300" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-white rounded-b-lg">
                        <button onClick={closeModal} className="bg-[#dc3545] hover:bg-red-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors"><X className="w-4 h-4" /> Batal</button>
                        <button onClick={handlePreSimpan} className="bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors"><Save className="w-4 h-4" /> Simpan</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL KONFIRMASI --- */}
        {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 transform transition-all animate-fade-in-down">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black">Konfirmasi Data Barang</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-600 mb-4">Silakan periksa kembali data barang berikut sebelum disimpan.</p>
                        <div className="bg-gray-50 rounded border border-gray-200 p-4 space-y-2">
                            <div className="flex justify-between border-b border-gray-200 pb-1"><span className="font-bold text-gray-700">Nama:</span> <span>{formData.name}</span></div>
                            <div className="flex justify-between border-b border-gray-200 pb-1"><span className="font-bold text-gray-700">Kategori:</span> <span>{getCategoryName(formData.category)}</span></div>
                            <div className="flex justify-between"><span className="font-bold text-gray-700">Harga/Kg:</span> <span>{formatRp(formData.price_per_kg)}</span></div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300">
                        <button onClick={() => { setShowConfirmModal(false); setShowModalForm(true); }} className="bg-[#dc3545] hover:bg-red-600 text-white font-bold py-2 px-6 rounded shadow-sm">Batal</button>
                        <button onClick={handleProcessSave} className="bg-[#0d6efd] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow-sm">Konfirmasi</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL TAWARAN KE BARANG MASUK (KHUSUS ADD) --- */}
        {showNavigateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 transform transition-all animate-fade-in-down text-center p-6">
                    <div className="flex justify-center mb-4"><div className="bg-green-100 p-4 rounded-full animate-bounce"><CheckCircle className="w-12 h-12 text-green-600" /></div></div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Berhasil!</h3>
                    <p className="text-gray-600 mb-6 font-medium">Lanjut isi <b>Barang Masuk</b>?</p>
                    <div className="flex justify-center gap-3">
                        <button onClick={handleStayInDataBarang} className="bg-[#dc3545] text-white font-bold py-2 px-6 rounded shadow-sm">Tidak</button>
                        <button onClick={handleNavigateToBarangMasuk} className="bg-[#0d6efd] text-white font-bold py-2 px-6 rounded shadow-sm">Ya</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL HAPUS --- */}
        {showModalHapus && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 transform transition-all animate-fade-in-down">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2"><Trash2 className="w-5 h-5"/> Hapus Barang</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6">
                        <p className="text-black font-bold text-base">Apakah anda yakin ingin menghapus data barang ini?</p>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300">
                        <button onClick={closeModal} className="bg-[#dc3545] hover:bg-red-600 text-white font-bold py-2 px-6 rounded shadow-sm">Batal</button>
                        <button onClick={handleHapus} className="bg-[#0d6efd] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow-sm">Hapus</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- TOAST SUCCESS (BLACK PILL) --- */}
        {showToast && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-bounce transform transition-all">
                    <CheckCircle className="w-6 h-6 text-green-400" /> 
                    <span className="font-bold text-lg">{toastMessage}</span>
                </div>
            </div>
        )}

    </DashboardLayout>
  );
};

export default DataBarang;