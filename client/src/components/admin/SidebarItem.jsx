import React from 'react'

const SidebarItem = ({icon: Icon, label, active, onClick}) => {
  return (
    <div>
      <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${
          active
            ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    </div>
  );
};

export default SidebarItem
