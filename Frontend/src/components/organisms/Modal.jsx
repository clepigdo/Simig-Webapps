import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = "max-w-2xl" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300">
      
      <div className={`bg-white rounded-lg shadow-xl w-full ${size} mx-4 overflow-hidden transform transition-all duration-300 scale-100`}>
        
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {title}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors">
                <X className="w-6 h-6" /> 
            </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;