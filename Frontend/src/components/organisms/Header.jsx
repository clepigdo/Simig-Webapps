import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/userContext'; // Import Hook Context

const Header = ({ toggleSidebar }) => {
  // --- AMBIL DATA DARI GLOBAL STATE (INSTAN) ---
  // Tidak perlu lagi pakai useState atau useEffect fetchUser di sini!
  const { user, loading } = useUser();

  // Logic Fallback Gambar & Nama
  const username = user?.username || 'Pengguna';
  
  // Gunakan foto dari database, atau avatar default jika null/loading
  const profileImg = user?.image_url 
    ? `${user.image_url}` 
    : `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`;

  return (
    <header className="h-16 bg-[#1586FF] flex items-center justify-between px-6 shadow-md z-10 flex-shrink-0">
        {/* Tombol Toggle Sidebar Mobile */}
        <div className="flex items-center">
            <button 
                onClick={toggleSidebar} 
                className="text-white hover:bg-blue-600 p-2 rounded focus:outline-none transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>
        </div>
        
        {/* Bagian Kanan Header */}
        <div className="flex items-center space-x-4">
            {/* Tombol ke Profil */}
            <Link to="/profil" className="text-white hover:text-blue-200 transition-colors">
                <Settings className="w-6 h-6" />
            </Link>
            
            {/* Bagian Foto & Nama User */}
            <div className="flex items-center space-x-3 border-l border-blue-400 pl-4">
                
                {/* FOTO PROFIL */}
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                    {loading ? (
                        <div className="w-full h-full bg-gray-300 animate-pulse"></div>
                    ) : (
                        <img 
                            src={profileImg} 
                            alt="User" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`; }}
                        />
                    )}
                </div>

                {/* NAMA USER (Hidden di HP) */}
                <span className="text-white font-medium text-sm hidden md:block">
                    {loading ? "Memuat..." : username}
                </span>
            </div>
        </div>
    </header>
  );
};

export default Header;