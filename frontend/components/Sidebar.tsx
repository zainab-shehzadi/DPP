"use client";

import React, { useState, useEffect } from "react";
import {
  FaClipboard,
  FaSignOutAlt,
  FaClock,
  FaUser,
  FaBuilding,
  FaCreditCard,
} from "react-icons/fa";
import MobileSidebar from "./MobileSidebar";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1020);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleConfirmLogout = () => {
    try {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      {isMobileView ? (
        <MobileSidebar />
      ) : (
        <nav
          className={`bg-[#002F6C] text-white min-w-[220px] w-full lg:w-52 fixed lg:h-full transition-transform transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
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

            {/* Navigation Links */}
            <ul className="space-y-2 w-full">
              <li>
                <a
                  href="#"
                  onClick={() => handleNavigation("/Dashboard")}
                  className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                    pathname === "/Dashboard"
                      ? "bg-white text-blue-900 shadow-md"
                      : "hover:bg-white hover:text-blue-900"
                  }`}
                >
                  <FaBuilding className="mr-2" />
                  Dashboard
                </a>
              </li>

              {/* <li>
                <a
                  href="#"
                  onClick={() => handleNavigation("/Dashboard")}
                  className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                    pathname === "/UploadNew2567"
                      ? "bg-white text-blue-900 shadow-md"
                      : "hover:bg-white hover:text-blue-900"
                  }`}
                >
                  <FaBuilding className="mr-2" />
                  Upload New 2567
                </a>
              </li> */}

              <li>
                <a
                  href="#"
                  onClick={() => handleNavigation("/pocAI")}
                  className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                    pathname === "/pocAI"
                      ? "bg-white text-blue-900 shadow-md"
                      : "hover:bg-white hover:text-blue-900"
                  }`}
                >
                  <FaClock className="mr-2" />
                  POC AI
                </a>
              </li>

              <li>
                <a
                  href="#"
                  onClick={() => handleNavigation("/HistoryPage")}
                  className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                    pathname === "/HistoryPage"
                      ? "bg-white text-blue-900 shadow-md"
                      : "hover:bg-white hover:text-blue-900"
                  }`}
                >
                  <FaClipboard className="mr-2" />
                  History
                </a>
              </li>

              <li>
                <a
                  href="#"
                  onClick={() => handleNavigation("/DailySummaries")}
                  className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                    pathname === "/DailySummaries"
                      ? "bg-white text-blue-900 shadow-md"
                      : "hover:bg-white hover:text-blue-900"
                  }`}
                >
                  <FaClock className="mr-2" />
                  Daily Summaries
                </a>
              </li>

              <li>
                <a
                  href="#"
                  onClick={() => handleNavigation("/InsightPage")}
                  className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                    pathname === "/InsightPage"
                      ? "bg-white text-blue-900 shadow-md"
                      : "hover:bg-white hover:text-blue-900"
                  }`}
                >
                  <FaCreditCard className="mr-2" />
                  Insights
                </a>
              </li>

              <li>
                <a
                  href="#"
                  onClick={() => handleNavigation("/TaskListPage")}
                  className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                    pathname === "/TaskListPage"
                      ? "bg-white text-blue-900 shadow-md"
                      : "hover:bg-white hover:text-blue-900"
                  }`}
                >
                  <FaClipboard className="mr-2" />
                  Task List
                </a>
              </li>

              <li>
                <a
                  href="#"
                  onClick={() => handleNavigation("/profileSettting")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm transition"
                >
                  <FaUser className="mr-2" />
                  Profile Settings
                </a>
              </li>

              <li>
                <a
                  href="#"
                  onClick={() => handleNavigation("/facilitySetting")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm transition"
                >
                  <FaBuilding className="mr-2" />
                  Facility Settings
                </a>
              </li>

              <li>
                <a
                  href="#"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm transition"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </a>
              </li>
            </ul>
          </div>

         {/* Logout Confirmation Modal */}
{isModalOpen && (
  <div
    className="fixed inset-0 z-50 w-screen min-h-screen h-full bg-[#00000035] flex justify-center items-center"
    onClick={() => setIsModalOpen(false)} // Close when clicking outside
  >
    <div
      className="bg-white p-8 text-center max-w-md w-full rounded-md shadow-lg"
      onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
    >
      <p className="text-lg font-bold text-gray-900">
        Are you sure you want to log out?
      </p>
      <div className="mt-6 flex justify-between">
        <button
          className="border border-gray-300 text-black px-6 py-2 rounded-md w-full mr-2"
          onClick={() => setIsModalOpen(false)}
        >
          Cancel
        </button>
        <button
          className="bg-[#002D62] text-white px-6 py-2 rounded-md w-full ml-2"
          onClick={handleConfirmLogout}
        >
          Log out
        </button>
      </div>
    </div>
  </div>
)}

        </nav>
      )}
    </>
  );
};

export default Sidebar;
