import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/templates/DashboardLayout';
import StatCard from '../components/molecules/StatCard'; 
import api from '../api';
import { Wallet, Package, AlertTriangle, ArrowUp } from 'lucide-react'; 

const Beranda = () => {
  const [data, setData] = useState({
    total_asset: 0,
    total_stock: 0, // Ini sekarang adalah Total Berat (Kg)
    lowest_stock_item: { name: '-', stock: 0 },
    income_month: 0,
    recent_in: [],
    recent_out: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/');
        setData(response.data);
      } catch (error) {
        console.error("Gagal ambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatRp = (val) => "Rp " + new Intl.NumberFormat("id-ID").format(val);

  return (
    <DashboardLayout>
        <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Beranda</h2>
        </div>
        
        {/* --- SECTION 1: STATISTIC CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
                title="Total Aset Gudang" 
                value={loading ? "..." : formatRp(data.total_asset)} 
                colorClass="bg-[#1586FF]" 
                icon={<Wallet className="w-6 h-6" />}
            />
            <StatCard 
                title="Pendapatan Bulan Ini" 
                value={loading ? "..." : formatRp(data.income_month)} 
                colorClass="bg-[#22C55E]" 
                icon={<ArrowUp className="w-6 h-6" />}
            />
            {/* LABEL DIUBAH */}
            <StatCard 
                title="Total Berat Gudang" 
                value={loading ? "..." : `${parseFloat(data.total_stock).toFixed(2)} Kg`} 
                colorClass="bg-[#FACC15]" 
                icon={<Package className="w-6 h-6" />}
            />
            <StatCard 
                title="Stok Menipis" 
                value={loading ? "..." : (parseFloat(data.lowest_stock_item.stock) <= 0 && data.lowest_stock_item.name === '-') ? "Aman" : `${data.lowest_stock_item.name} (${parseFloat(data.lowest_stock_item.stock).toFixed(2)} Kg)`} 
                colorClass="bg-[#EF4444]" 
                icon={<AlertTriangle className="w-6 h-6" />}
            />
        </div>

        {/* --- SECTION 2: TABEL BARANG MASUK --- */}
        <div className="bg-white rounded shadow-sm mb-8 border-t-4 border-[#1586FF]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-black">Barang masuk bulan ini</h3>
            </div>
            <div className="overflow-x-auto p-5">
                <table className="w-full text-sm text-center border-collapse border border-gray-300">
                    <thead className="bg-gray-50 text-black font-bold">
                        <tr>
                            <th className="border border-gray-300 px-4 py-3">Tanggal</th>
                            <th className="border border-gray-300 px-4 py-3">Nama Barang</th>
                            <th className="border border-gray-300 px-4 py-3">Jumlah (Kg)</th>
                            <th className="border border-gray-300 px-4 py-3">Catatan</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        {loading ? (
                            <tr><td colSpan="4" className="py-4">Memuat data...</td></tr>
                        ) : data.recent_in.length === 0 ? (
                            <tr><td colSpan="4" className="py-4">Belum ada data masuk.</td></tr>
                        ) : (
                            data.recent_in.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="border border-gray-300 px-4 py-3">{item.date}</td>
                                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">{item.product_name}</td>
                                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-600">+{item.quantity} Kg</td>
                                    <td className="border border-gray-300 px-4 py-3 text-gray-500 italic">{item.notes || "-"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* --- SECTION 3: TABEL BARANG KELUAR --- */}
        <div className="bg-white rounded shadow-sm mb-8 border-t-4 border-[#EF4444]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-black">Barang keluar bulan ini</h3>
            </div>
            <div className="overflow-x-auto p-5">
                <table className="w-full text-sm text-center border-collapse border border-gray-300">
                    <thead className="bg-gray-50 text-black font-bold">
                        <tr>
                            <th className="border border-gray-300 px-4 py-3">Tanggal</th>
                            <th className="border border-gray-300 px-4 py-3">Nama Barang</th>
                            <th className="border border-gray-300 px-4 py-3">Jumlah (Kg)</th>
                            <th className="border border-gray-300 px-4 py-3">Catatan</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        {loading ? (
                            <tr><td colSpan="4" className="py-4">Memuat data...</td></tr>
                        ) : data.recent_out.length === 0 ? (
                            <tr><td colSpan="4" className="py-4">Belum ada data keluar.</td></tr>
                        ) : (
                            data.recent_out.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="border border-gray-300 px-4 py-3">{item.date}</td>
                                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">{item.product_name}</td>
                                    <td className="border border-gray-300 px-4 py-3 font-bold text-red-600">-{item.quantity} Kg</td>
                                    <td className="border border-gray-300 px-4 py-3 text-gray-500 italic">{item.notes || "-"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </DashboardLayout>
  );
};

export default Beranda;