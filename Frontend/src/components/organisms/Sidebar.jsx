import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { LayoutDashboard, Table, ChevronDown, ShoppingCart, Truck, Tags, FileText, LogOut, Box, Search, AlertTriangle, Users } from 'lucide-react';

const Sidebar = ({ isOpen, isDesktopExpanded, toggleSidebarMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Pop Up Logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userRole = localStorage.getItem('role'); 

  const isActive = (path) => location.pathname === path ? "bg-simig-active text-white" : "text-simig-text hover:text-white hover:bg-simig-input";

  const handleLogout = (e) => {
    e.preventDefault(); 
    setShowLogoutModal(true); // Buka Pop Up
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate('/');
    setShowLogoutModal(false);
  };

  const handleSearch = (e) => {
      if (e) e.preventDefault();
      if (searchQuery.trim()) {
          navigate('/data-barang', { state: { globalSearch: searchQuery } });
      }
  };

  return (
    <>
      {isOpen && (
        <div onClick={toggleSidebarMobile} className="fixed inset-0 bg-black opacity-50 z-20 lg:hidden"></div>
      )}

      {/* --- MODAL CUSTOM LOGOUT (Modern) --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100 animate-fade-in-up">
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-4 rounded-full">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Keluar</h3>
                <p className="text-gray-600 font-medium mb-6">
                    Apakah Anda yakin ingin keluar dari sistem?
                </p>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => setShowLogoutModal(false)} 
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-6 rounded-lg shadow transition-colors w-full"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={confirmLogout} 
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg shadow transition-colors w-full"
                    >
                        Keluar
                    </button>
                </div>
            </div>
        </div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 bg-simig-sidebar text-white transition-all duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 flex flex-col shrink-0 ${isDesktopExpanded ? 'w-64' : 'w-20'}`}>
        
        {/* LOGO AREA */}
        <div className="h-20 flex items-center px-5 bg-simig-sidebar shadow-sm border-b border-gray-800 overflow-hidden whitespace-nowrap">
            <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-simig-light rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                    <Box className="text-white w-6 h-6" />
                </div>
                <h1 className={`text-xl font-bold tracking-wide text-white transition-opacity duration-300 ${!isDesktopExpanded && 'opacity-0 hidden'}`}>
                    Sistem SIMIG
                </h1>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 no-scrollbar">
            <div className={`flex items-center mb-6 transition-all duration-300 ${!isDesktopExpanded && 'hidden'}`}>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)} 
                    placeholder="Cari Barang..." 
                    className="w-full bg-simig-input text-sm text-gray-300 rounded-l-md px-4 py-2.5 focus:outline-none placeholder-gray-500 border border-transparent focus:border-gray-600 transition-colors" 
                />
                <button onClick={handleSearch} className="bg-simig-input text-gray-400 px-3 py-2.5 rounded-r-md border-l border-gray-600 hover:text-white hover:bg-gray-700 transition h-full flex items-center">
                    <Search className="w-4 h-4" />
                </button>
            </div>
            
            <div className={`text-xs text-gray-500 font-bold uppercase tracking-wider mb-4 px-2 block ${!isDesktopExpanded && 'hidden'}`}>
                Menu Utama
            </div>

            <nav className="space-y-2">
                <Link to="/beranda" className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive('/beranda')}`}>
                    <LayoutDashboard className="w-5 h-5 shrink-0" />
                    <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${!isDesktopExpanded && 'hidden'}`}>Beranda</span>
                </Link>

                <Link to="/data-barang" className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive('/data-barang')}`}>
                    <Table className="w-5 h-5 shrink-0" />
                    <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${!isDesktopExpanded && 'hidden'}`}>Data Barang</span>
                </Link>

                {userRole === 'admin' && (
                    <>
                        <div className="relative">
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 text-simig-text hover:text-white hover:bg-simig-input rounded-lg transition-colors focus:outline-none"
                            >
                                <div className="flex items-center">
                                    <Box className="w-5 h-5 shrink-0" />
                                    <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${!isDesktopExpanded && 'hidden'}`}>Kelola Barang</span>
                                </div>
                                {isDesktopExpanded && (
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                )}
                            </button>
                            
                            {(isDropdownOpen && isDesktopExpanded) && (
                                <div className="mt-1 space-y-1 ml-2 transition-all">
                                    <Link to="/barang-masuk" className={`flex items-center pl-10 pr-4 py-2 text-sm rounded-lg transition-colors ${isActive('/barang-masuk') === "bg-simig-active text-white" ? "text-white" : "text-gray-500 hover:text-white"}`}>
                                        <ShoppingCart className="w-4 h-4 mr-2" /> 
                                        Barang Masuk
                                    </Link>
                                    <Link to="/barang-keluar" className={`flex items-center pl-10 pr-4 py-2 text-sm rounded-lg transition-colors ${isActive('/barang-keluar') === "bg-simig-active text-white" ? "text-white" : "text-gray-500 hover:text-white"}`}>
                                        <Truck className="w-4 h-4 mr-2" /> 
                                        Barang Keluar
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link to="/kategori" className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive('/kategori')}`}>
                            <Tags className="w-5 h-5 shrink-0" />
                            <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${!isDesktopExpanded && 'hidden'}`}>Kelola Kategori</span>
                        </Link>

                        <Link to="/manajemen-user" className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive('/manajemen-user')}`}>
                            <Users className="w-5 h-5 shrink-0" />
                            <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${!isDesktopExpanded && 'hidden'}`}>Manajemen User</span>
                        </Link>
                    </>
                )}

                <Link to="/laporan" className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive('/laporan')}`}>
                    <FileText className="w-5 h-5 shrink-0" />
                    <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${!isDesktopExpanded && 'hidden'}`}>Laporan</span>
                </Link>

                <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-simig-text hover:text-red-400 hover:bg-simig-input rounded-lg transition-colors focus:outline-none">
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${!isDesktopExpanded && 'hidden'}`}>
                        Keluar
                    </span>
                </button>
            </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;