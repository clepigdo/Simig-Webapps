import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fungsi fetch profile yg dipanggil sekali saja saat aplikasi start
    const fetchProfile = async () => {
        try {
            const response = await api.get('/users/profile/');
            setUser(response.data);
        } catch (error) {
            console.error("Gagal load profile", error);
            // Jangan set user null jika error, biarkan state sebelumnya atau handle logout
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        
        // Listener khusus jika ada update profil (dari halaman SettingProfil)
        const handleProfileUpdate = () => fetchProfile();
        window.addEventListener('profile-updated', handleProfileUpdate);

        return () => {
            window.removeEventListener('profile-updated', handleProfileUpdate);
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, refetchUser: fetchProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);