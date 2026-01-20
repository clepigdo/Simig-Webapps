import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/templates/DashboardLayout';
import Modal from '../components/organisms/Modal'; // Kita override di bawah
import Input from '../components/atoms/Input';
import { Plus, Printer, Edit, Trash2, Save, X, Truck, CheckCircle } from 'lucide-react';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const BarangKeluar = () => {
  // --- STATE ---
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Pagination & Search
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModalForm, setShowModalForm] = useState(false);
  const [showModalHapus, setShowModalHapus] = useState(false);
  const [showModalCetak, setShowModalCetak] = useState(false); 
  
  // Modal State Flow Simpan
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Form Data
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
      product: '', 
      date: new Date().toISOString().split('T')[0], 
      quantity: '',
      notes: ''
  });

  const [bulanSelected, setBulanSelected] = useState(""); 

  // --- 1. GET DATA ---
  const fetchData = async () => {
      try {
          const [resTrans, resProd] = await Promise.all([
              api.get('/transactions-out/'),
              api.get('/products/')
          ]);
          setTransactions(resTrans.data);
          setProducts(resProd.data);
      } catch (error) {
          console.error("Gagal ambil data:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. FILTER & PAGINATION ---
  const filteredData = transactions.filter(item => 
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- TRIGGER TOAST ---
  const triggerToast = (msg) => {
      setToastMessage(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
  };

  // --- LOGIC PRE-SIMPAN (VALIDASI STOK) ---
  const handlePreSimpan = () => {
      if (!formData.product || !formData.date || !formData.quantity) {
          alert("Harap lengkapi Tanggal, Barang, dan Jumlah.");
          return;
      }

      // Validasi Stok (Khusus Tambah Baru)
      if (!isEdit) {
          const selectedProduct = products.find(p => p.id === parseInt(formData.product));
          const qtyKeluar = parseFloat(formData.quantity);
          const sisaBerat = parseFloat(selectedProduct?.weight || 0);
          
          if (selectedProduct && qtyKeluar > sisaBerat) {
              alert(`Gagal! Stok tidak cukup.\nSisa di gudang: ${sisaBerat} Kg\nDiminta: ${qtyKeluar} Kg`);
              return;
          }
      }

      setShowModalForm(false);
      setShowConfirmModal(true);
  };

  // --- LOGIC SIMPAN (EKSEKUSI) ---
  const handleProcessSave = async () => {
      try {
          if (isEdit) {
            await api.put(`/transactions-out/${currentId}/`, formData);
            triggerToast("Data barang keluar diperbarui!");
          } else {
            await api.post('/transactions-out/', formData);
            triggerToast("Barang keluar berhasil dicatat!");
          }
          fetchData();
          setShowConfirmModal(false);
      } catch (error) {
          console.error("Gagal simpan:", error.response);
          alert("Gagal menyimpan data.");
          setShowConfirmModal(false);
          setShowModalForm(true); 
      }
  };

  // --- HAPUS DATA ---
  const handleHapus = async () => {
      try {
          await api.delete(`/transactions-out/${currentId}/`);
          fetchData();
          setShowModalHapus(false);
          triggerToast("Transaksi dihapus, stok dikembalikan.");
      } catch (error) {
          console.error("Gagal hapus:", error);
          alert("Gagal menghapus data.");
      }
  };

  // --- LOGIKA CETAK PDF ---
  const handleProcessCetak = () => {
      if (!bulanSelected) {
          alert("Silakan pilih bulan terlebih dahulu!");
          return;
      }
      const dataToPrint = transactions.filter(item => item.date.split('-')[1] === bulanSelected);
      if (dataToPrint.length === 0) { alert(`Tidak ada transaksi pada bulan ini.`); return; }

      try {
          const doc = new jsPDF();
          doc.text(`Laporan Barang Keluar`, 14, 20);
          const tableColumn = ["No", "Tanggal", "Nama Barang", "Jumlah (Kg)", "Catatan"];
          const tableRows = dataToPrint.map((item, index) => [
              index + 1, item.date, item.product_name, item.quantity, item.notes || "-"
          ]);
          autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30, theme: 'grid' });
          doc.save(`Laporan_Keluar.pdf`);
          setShowModalCetak(false); 
      } catch (error) { alert("Gagal Cetak."); }
  };

  // --- HELPER ---
  const getProductName = (id) => { const prod = products.find(p => p.id == id); return prod ? prod.name : '-'; };
  const openModalTambah = () => { setIsEdit(false); setFormData({ product: '', date: new Date().toISOString().split('T')[0], quantity: '', notes: '' }); setShowModalForm(true); };
  const openModalEdit = (item) => { setIsEdit(true); setCurrentId(item.id); setFormData({ product: item.product, date: item.date, quantity: item.quantity, notes: item.notes }); setShowModalForm(true); };
  const openModalHapus = (id) => { setCurrentId(id); setShowModalHapus(true); };
  const closeModal = () => { setShowModalForm(false); setShowModalHapus(false); setShowModalCetak(false); setShowConfirmModal(false); };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, itemsPerPage]);

  return (
    <DashboardLayout>
        <h2 className="text-2xl font-bold text-black mb-6">Barang Keluar</h2>

        <div className="flex flex-wrap gap-4 mb-6">
            <button onClick={openModalTambah} className="bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Tambah Barang Keluar
            </button>
            <button onClick={() => setShowModalCetak(true)} className="bg-[#10b981] hover:bg-green-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors">
                <Printer className="w-4 h-4" /> Cetak Barang Keluar
            </button>
        </div>

        {/* --- CARD TABLE (BORDER ATAS BIRU) --- */}
        <div className="bg-white shadow-md rounded-sm border-t-4 border-t-[#0d6efd] p-5">
            
            {/* Header Table */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 text-sm text-gray-700">
                <div className="flex items-center mb-2 md:mb-0">
                    <span className="mr-2">Show</span>
                    <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="border border-gray-300 rounded p-1 focus:outline-none focus:border-blue-500">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
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

            {/* Table (GRID BORDER) */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center border-collapse border border-gray-300">
                    <thead className="bg-white text-black font-bold">
                        <tr>
                            <th className="border border-gray-300 px-4 py-3 w-10">#</th>
                            <th className="border border-gray-300 px-4 py-3">Tanggal</th>
                            <th className="border border-gray-300 px-4 py-3">Nama Barang</th>
                            <th className="border border-gray-300 px-4 py-3">Jumlah (Kg)</th>
                            <th className="border border-gray-300 px-4 py-3">Catatan</th>
                            <th className="border border-gray-300 px-4 py-3 w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        {loading ? (
                            <tr><td colSpan="6" className="py-4 border border-gray-300">Memuat data...</td></tr>
                        ) : currentData.length === 0 ? (
                            <tr><td colSpan="6" className="py-4 border border-gray-300">Belum ada transaksi.</td></tr>
                        ) : (
                            currentData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{startIndex + index + 1}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.date}</td>
                                    <td className="border border-gray-300 px-4 py-2 font-medium text-black">{item.product_name}</td>
                                    {/* JUMLAH WARNA MERAH */}
                                    <td className="border border-gray-300 px-4 py-2 font-bold text-red-600">-{item.quantity} Kg</td>
                                    <td className="border border-gray-300 px-4 py-2 italic text-gray-500">{item.notes || "-"}</td>
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
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div>Showing {currentData.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries</div>
                <div className="flex border border-gray-300 rounded overflow-hidden">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-500 border-r border-gray-300 disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1 bg-[#0d6efd] text-white border-r border-gray-300">{currentPage}</button>
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-500 disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>

        {/* --- MODAL FORM (STYLE HEADER & FOOTER LINES) --- */}
        {showModalForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 transform transition-all animate-fade-in-down">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2">
                            {isEdit ? <Edit className="w-5 h-5"/> : <Truck className="w-5 h-5"/>} 
                            {isEdit ? "Edit Barang Keluar" : "Catat Barang Keluar"}
                        </h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Tanggal</label>
                            <Input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Pilih Barang</label>
                            <select 
                                name="product" 
                                value={formData.product} 
                                onChange={handleChange} 
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:ring-0 focus:border-blue-500" 
                                required
                            >
                                <option value="">-- Pilih Barang --</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name} (Sisa: {p.weight} Kg)</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Jumlah Keluar (Kg)</label>
                            <Input type="number" step="any" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Contoh: 20" required className="w-full border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Catatan</label>
                            <textarea 
                                name="notes" 
                                value={formData.notes} 
                                onChange={handleChange} 
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:ring-0 focus:border-blue-500" 
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-white rounded-b-lg">
                        <button onClick={closeModal} className="bg-[#dc3545] hover:bg-red-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors">
                            <X className="w-4 h-4" /> Batal
                        </button>
                        <button onClick={handlePreSimpan} className="bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2 transition-colors">
                            <Save className="w-4 h-4" /> Simpan
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL KONFIRMASI --- */}
        {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 transform transition-all animate-fade-in-down">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black">Konfirmasi</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-600 mb-4">Silakan periksa kembali data barang keluar berikut.</p>
                        <div className="bg-gray-50 rounded border border-gray-200 p-4 space-y-2">
                            <div className="flex justify-between border-b border-gray-200 pb-1"><span className="font-bold text-gray-700">Tanggal:</span> <span>{formData.date}</span></div>
                            <div className="flex justify-between border-b border-gray-200 pb-1"><span className="font-bold text-gray-700">Barang:</span> <span>{getProductName(formData.product)}</span></div>
                            <div className="flex justify-between"><span className="font-bold text-gray-700">Jumlah:</span> <span>{formData.quantity} Kg</span></div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-white rounded-b-lg">
                        <button onClick={() => { setShowConfirmModal(false); setShowModalForm(true); }} className="bg-[#dc3545] hover:bg-red-600 text-white font-bold py-2 px-6 rounded shadow-sm">Batal</button>
                        <button onClick={handleProcessSave} className="bg-[#0d6efd] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow-sm">Konfirmasi</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL HAPUS --- */}
        {showModalHapus && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 transform transition-all animate-fade-in-down">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2"><Trash2 className="w-5 h-5"/> Hapus Transaksi</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6">
                        <p className="text-black font-bold text-base">Apakah anda yakin? Berat barang akan dikembalikan ke gudang.</p>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-white rounded-b-lg">
                        <button onClick={closeModal} className="bg-[#dc3545] hover:bg-red-600 text-white font-bold py-2 px-6 rounded shadow-sm">Batal</button>
                        <button onClick={handleHapus} className="bg-[#0d6efd] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow-sm">Hapus</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL CETAK --- */}
        {showModalCetak && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 transform transition-all animate-fade-in-down">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2"><Printer className="w-5 h-5"/> Cetak Laporan</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                    </div>
                    <div className="p-6">
                        <label className="block text-sm font-bold text-black mb-2">Pilih Bulan</label>
                        <select 
                            value={bulanSelected} 
                            onChange={(e) => setBulanSelected(e.target.value)} 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:ring-0 focus:border-blue-500"
                        >
                            <option value="">-- Pilih Bulan --</option>
                            <option value="01">Januari</option>
                            <option value="02">Februari</option>
                            <option value="03">Maret</option>
                            <option value="04">April</option>
                            <option value="05">Mei</option>
                            <option value="06">Juni</option>
                            <option value="07">Juli</option>
                            <option value="08">Agustus</option>
                            <option value="09">September</option>
                            <option value="10">Oktober</option>
                            <option value="11">November</option>
                            <option value="12">Desember</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-white rounded-b-lg">
                        <button onClick={() => setBulanSelected("")} className="bg-[#dc3545] hover:bg-red-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2"><Trash2 className="w-4 h-4" /> Reset</button>
                        <button onClick={handleProcessCetak} className="bg-[#0d6efd] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center gap-2"><Printer className="w-4 h-4" /> Cetak</button>
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

export default BarangKeluar;