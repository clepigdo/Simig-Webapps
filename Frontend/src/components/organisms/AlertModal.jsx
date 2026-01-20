import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, type, title, message, onConfirm, showCancel = false, confirmText = "Oke", cancelText = "Batal" }) => {
  if (!isOpen) return null;

  // Tentukan Icon & Warna berdasarkan Tipe
  let Icon = Info;
  let colorClass = "text-blue-500";
  let bgIconClass = "bg-blue-100";
  let btnColorClass = "bg-[#1586FF] hover:bg-blue-600";

  if (type === 'success') {
    Icon = CheckCircle;
    colorClass = "text-green-500";
    bgIconClass = "bg-green-100";
    btnColorClass = "bg-green-500 hover:bg-green-600";
  } else if (type === 'error') {
    Icon = XCircle;
    colorClass = "text-red-500";
    bgIconClass = "bg-red-100";
    btnColorClass = "bg-red-500 hover:bg-red-600";
  } else if (type === 'warning' || type === 'delete') {
    Icon = AlertTriangle;
    colorClass = "text-red-500";
    bgIconClass = "bg-red-100";
    btnColorClass = "bg-red-500 hover:bg-red-600";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100 animate-fade-in-up">
        
        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div className={`${bgIconClass} p-4 rounded-full`}>
            <Icon className={`w-12 h-12 ${colorClass}`} />
          </div>
        </div>

        {/* TITLE & MESSAGE */}
        <h3 className={`text-xl font-bold mb-2 ${colorClass}`}>{title}</h3>
        <p className="text-gray-600 font-medium mb-6">
          {message}
        </p>

        {/* BUTTONS */}
        <div className="flex justify-center gap-3">
          {showCancel && (
            <button 
              onClick={onClose} 
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-6 rounded-lg shadow transition-colors w-full"
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={onConfirm || onClose} 
            className={`${btnColorClass} text-white font-bold py-2.5 px-6 rounded-lg shadow transition-colors w-full`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AlertModal;