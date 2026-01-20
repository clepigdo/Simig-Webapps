import React, { useState } from 'react';
import Sidebar from '../organisms/Sidebar';
import Header from '../organisms/Header';
import { useUser } from '../../context/userContext'; // Import Hook Context

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  
  // AMBIL DATA GLOBAL (Instan, tidak perlu loading lagi)
  const { user, loading } = useUser();

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 1024) {
        setIsDesktopExpanded(!isDesktopExpanded);
    } else {
        setIsSidebarOpen(!isSidebarOpen);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        isDesktopExpanded={isDesktopExpanded} 
        toggleSidebarMobile={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300">
        {/* Kirim data user ke Header lewat props */}
        <Header 
            toggleSidebar={handleSidebarToggle} 
            user={user} 
            loading={loading} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
        </main>

        <footer className="bg-white border-t p-4 text-center text-xs text-gray-500">
            &copy; 2026 Sistem SIMIG. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;