import React from 'react';

const Button = ({ children, type = "button", onClick, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-simig-btn hover:bg-blue-800 text-white font-semibold py-3 rounded shadow-md transition duration-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;