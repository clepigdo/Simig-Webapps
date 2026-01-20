import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ title, children, footerText, footerLinkText, footerLinkTo }) => {
  return (
    <div className="bg-gradient-to-b from-simig-light to-simig-dark min-h-screen flex items-center justify-center px-4 py-10">
      <main className="relative bg-gray-100 rounded-lg shadow-xl w-full max-w-sm p-8 pt-16 mt-8">
        
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-simig-dark rounded-full flex items-center justify-center border-4 border-simig-light shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
        </div>

        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-600">{title}</h1>
        </div>

        {children}

        <div className="text-center mt-6 text-sm text-gray-500 font-medium">
            {footerText} <Link to={footerLinkTo} className="text-simig-dark font-bold hover:underline">{footerLinkText}</Link>
        </div>

      </main>
    </div>
  );
};

export default AuthLayout;