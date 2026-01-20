import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/templates/DashboardLayout';
import api from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Laporan = () => {
  const [periode, setPeriode] = useState('bulanan');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/reports/?period=${periode}`);
        setData(response.data);
      } catch (error) {
        console.error("Gagal ambil laporan:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [periode]);

  const formatRp = (val) => "Rp " + new Intl.NumberFormat("id-ID").format(val);

  // ================= CONFIG CHART PENJUALAN (BARANG KELUAR) -> HIJAU (CUAN) =================
  const pieDataOut = {
    labels: data?.pie_chart?.labels || [],
    datasets: [{
        data: data?.pie_chart?.data || [],
        // Warna Hijau (Profit/Income)
        backgroundColor: ['#10B981', '#059669', '#047857', '#34D399', '#6EE7B7', '#065F46'], 
        borderWidth: 1,
    }],
  };

  const barDataOut = {
    labels: data?.bar_chart?.labels || [], 
    datasets: [{
        label: 'Barang Keluar (Kg)',
        data: data?.bar_chart?.data || [],
        backgroundColor: '#10B981', // Hijau Emerald
        borderRadius: 4,
    }],
  };

  // ================= CONFIG CHART PEMBELIAN (BARANG MASUK) -> MERAH (KULAK) =================
  const pieDataIn = {
    labels: data?.pie_chart_in?.labels || [], 
    datasets: [{
        data: data?.pie_chart_in?.data || [],
        // Warna Merah (Expense/Modal Keluar)
        backgroundColor: ['#F87171', '#EF4444', '#B91C1C', '#FCA5A5', '#FECACA', '#991B1B'], 
        borderWidth: 1,
    }],
  };

  const barDataIn = {
    labels: data?.bar_chart_in?.labels || [], 
    datasets: [{
        label: 'Barang Masuk (Kg)',
        data: data?.bar_chart_in?.data || [],
        backgroundColor: '#EF4444', // Merah
        borderRadius: 4,
    }],
  };

  // ================= OPTIONS CHARTS =================
  const pieChartOptions = {
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
    }
  };

  const barChartOptions = {
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
    },
    scales: {
        y: { beginAtZero: true }
    }
  };

  return (
    <DashboardLayout>
        <h2 className="text-2xl font-bold text-black mb-6">Laporan & Statistik</h2>

        {/* --- PILIH PERIODE --- */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 border border-gray-200">
            <div className="bg-[#1586FF] text-white font-bold py-3 px-6 text-center text-lg">
                Filter Periode Laporan
            </div>
            <div className="p-6">
                <select 
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white"
                >
                    <option value="mingguan">Mingguan (7 Hari Terakhir)</option>
                    <option value="bulanan">Bulanan (4 Minggu)</option>
                    <option value="tahunan">Tahunan (12 Bulan)</option>
                </select>
            </div>
        </div>

        {/* ================= SECTION 1: PENJUALAN (BARANG KELUAR) - HIJAU ================= */}
        <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-green-500 rounded-full"></span> 
                Statistik Barang Keluar (Penjualan)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart Keluar */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-200">
                    <div className="bg-green-500 text-white font-bold py-2 px-4 text-sm">
                        Proporsi Kategori Terlaris
                    </div>
                    <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
                        {loading ? <p className="text-gray-400 italic">Memuat...</p> : (
                            data?.pie_chart?.data.length > 0 ? 
                            <div className="w-full h-64 relative"><Pie data={pieDataOut} options={pieChartOptions} /></div> : 
                            <p className="text-gray-400 italic">Data kosong.</p>
                        )}
                    </div>
                </div>

                {/* Bar Chart Keluar */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-200">
                    <div className="bg-green-500 text-white font-bold py-2 px-4 text-sm">
                        Trend Volume Keluar
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-end min-h-[300px]">
                        {loading ? <p className="text-gray-400 italic text-center">Memuat...</p> : (
                            <div className="w-full h-64 relative"><Bar data={barDataOut} options={barChartOptions} /></div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* ================= SECTION 2: PEMBELIAN (BARANG MASUK) - MERAH ================= */}
        <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                Statistik Barang Masuk (Pembelian)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart Masuk */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-200">
                    <div className="bg-red-500 text-white font-bold py-2 px-4 text-sm">
                        Proporsi Kategori Masuk
                    </div>
                    <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
                        {loading ? <p className="text-gray-400 italic">Memuat...</p> : (
                            data?.pie_chart_in?.data.length > 0 ? 
                            <div className="w-full h-64 relative"><Pie data={pieDataIn} options={pieChartOptions} /></div> : 
                            <p className="text-gray-400 italic">Belum ada data barang masuk.</p>
                        )}
                    </div>
                </div>

                {/* Bar Chart Masuk */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-200">
                    <div className="bg-red-500 text-white font-bold py-2 px-4 text-sm">
                        Trend Volume Masuk
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-end min-h-[300px]">
                        {loading ? <p className="text-gray-400 italic text-center">Memuat...</p> : (
                            <div className="w-full h-64 relative"><Bar data={barDataIn} options={barChartOptions} /></div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* --- SUMMARY TABLE --- */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 border border-gray-200">
            <div className="bg-yellow-500 text-white font-bold py-3 px-6 text-lg">
                Ringkasan Laporan ({loading ? "..." : data?.summary?.date_info})
            </div>
            <div className="p-6 space-y-4">
                <SummaryRow label="Total Barang Masuk (Pembelian)" value={loading ? "..." : `${data?.summary?.total_in} Kg`} color="text-red-600" />
                <SummaryRow label="Total Barang Keluar (Penjualan)" value={loading ? "..." : `${data?.summary?.total_out} Kg`} color="text-green-600" />
                <SummaryRow label="Total Pendapatan" value={loading ? "..." : formatRp(data?.summary?.revenue)} />
                <SummaryRow label="Perubahan Nilai Aset" value={loading ? "..." : formatRp(data?.summary?.asset_change)} noBorder />
            </div>
        </div>
    </DashboardLayout>
  );
};

const SummaryRow = ({ label, value, noBorder, color = "text-gray-800" }) => (
    <div className={`flex flex-col sm:flex-row pb-2 ${!noBorder && 'border-b border-gray-100'}`}>
        <span className="w-64 font-medium text-gray-700">{label}</span>
        <span className="hidden sm:block mr-4">:</span>
        <span className={`font-bold ${color}`}>{value}</span>
    </div>
);

export default Laporan;