import React from 'react';

const StatCard = ({ title, value, colorClass, children }) => {
  return (
    <div className={`${colorClass} rounded shadow-lg text-white overflow-hidden flex flex-col`}>
      <div className="bg-black/20 py-2 px-4 text-center">
        <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
      </div>
      <div className="flex-1 flex items-center justify-center py-8">
        <span className="text-2xl font-bold">{value}</span>
      </div>
    </div>
  );
};

export default StatCard;