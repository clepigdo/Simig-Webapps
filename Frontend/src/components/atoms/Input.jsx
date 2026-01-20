import React from 'react';

const Input = ({ type = "text", className = "", ...props }) => {
  return (
    <input
      type={type}
      // Style disesuaikan agar cocok untuk Form & Modal (ada border abu-abu)
      className={`w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-simig-blue focus:ring-1 focus:ring-simig-blue transition-colors shadow-sm ${className}`}
      
      // PENTING: ...props ini akan meneruskan 'name', 'value', 'onChange' ke input asli
      {...props}
    />
  );
};

export default Input;