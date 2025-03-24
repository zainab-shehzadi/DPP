"use client";

import React from "react";

interface HeaderWithToggleProps {
  onToggleSidebar: () => void;
}

const HeaderWithToggle: React.FC<HeaderWithToggleProps> = ({ onToggleSidebar }) => {
  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
      <button
        onClick={onToggleSidebar}
        className="text-white text-2xl focus:outline-none"
      >
        ☰
      </button>
      <img src="/assets/logo-dpp1.png" alt="Logo" className="h-8 w-auto" />
    </div>
  );
};

export default HeaderWithToggle;
