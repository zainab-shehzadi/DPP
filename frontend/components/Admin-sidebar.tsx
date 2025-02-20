"use client";

import React, { useState, useEffect } from "react";
import {
  FaClipboard,
  FaUserPlus,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaBuilding,

} from "react-icons/fa";
import { toast } from "react-toastify";

import MobileSidebar from "./MobileSidebar";
import { useRouter } from "next/navigation"; // Correct import for Next.js App Router


interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    setActiveItem(path);
    router.push(path);
  };

  const handleConfirmLogout = () => {
    try {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    } catch (error) {
      toast.error("Error during logout");
    }
  };

  useEffect(() => {
    setActiveItem(window.location.pathname);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1020);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isMobileView ? (
        <MobileSidebar />
      ) : (
        <nav
          className={`bg-[#002F6C] text-white min-w-[220px] w-full lg:w-52 fixed lg:h-full transition-transform transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 overflow-hidden`}
        >
          <div className="h-full flex flex-col overflow-y-auto max-h-screen px-4 py-4 scrollbar-hide">
            {/* Logo */}
            <div className="mb-8 flex justify-center items-center">
              <img
                src="/assets/logo-dpp1.png"
                alt="Logo"
                className="w-32 h-auto max-h-12 object-contain"
              />
            </div>

            <ul className="space-y-2 w-full">
            <li className="w-full">
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      handleNavigation("/AddNewUser");
    }}
    className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm ${
      activeItem === "/AddNewUser" ? "bg-white text-blue-900" : "hover:bg-white hover:text-blue-900"
    }`}
  >
    <FaUserPlus className="mr-2" />
    Add New User
  </a>
</li>

<li className="w-full">
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      handleNavigation("/UserSetting");
    }}
    className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm ${
      activeItem === "/UserSetting" ? "bg-white text-blue-900" : "hover:bg-white hover:text-blue-900"
    }`}
  >
    <FaCog className="mr-2" />
    User Setting
  </a>
</li>

<li className="w-full">
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      setIsModalOpen(true);
    }}
    className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm ${
      isModalOpen ? "bg-white text-blue-900" : "hover:bg-white hover:text-blue-900"
    }`}
  >
    <FaSignOutAlt className="mr-2" />
    Logout
  </a>
</li>

            </ul>
          </div>
        </nav>
      )}

      {/* Logout Confirmation Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          aria-hidden="true"
        >
          <div className="bg-white p-6 text-center w-[400px] rounded-lg shadow-lg">
            <p className="text-lg font-bold text-gray-900 text-left">
              Are you sure you want to log out?
            </p>
            <p className="text-sm text-gray-500 text-left">
              You'll be signed out of your account. Make sure you've saved your
              work before continuing.
            </p>
            <div className="mt-6 flex justify-between">
              <button
                className="border border-gray-300 px-6 py-2 rounded-md text-gray-600 bg-white hover:bg-gray-100 transition w-full mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#002D62] text-white px-6 py-2 rounded-md hover:bg-[#001A40] transition w-full ml-2"
                onClick={handleConfirmLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
