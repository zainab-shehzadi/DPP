

"use client";

import React, { useState, useEffect } from "react";
import {
  FaClipboard,
  FaClock,
  FaUser,
  FaBuilding,
  FaCreditCard,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import MobileSidebar from "./MobileSidebar";
import Logout from "./logoutConfirmation";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Handle responsive behavior
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1020);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto logout after 30 minutes of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handleConfirmLogout(), 30 * 60 * 1000); 
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer(); // Start timer

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      clearTimeout(timeout);
    };
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleConfirmLogout = () => {
    try {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
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
            <div className="flex-grow">
              <ul className="space-y-2 w-full">
                <li>
                  <button
                    onClick={() => handleNavigation("/Dashboard")}
                    className={`flex items-center w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                      pathname === "/Dashboard"
                        ? "bg-white text-blue-900 shadow-md"
                        : "hover:bg-white hover:text-blue-900"
                    }`}
                  >
                    <FaBuilding className="mr-2" />
                    Dashboard
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavigation("/pocAI")}
                    className={`flex items-center w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                      pathname === "/pocAI"
                        ? "bg-white text-blue-900 shadow-md"
                        : "hover:bg-white hover:text-blue-900"
                    }`}
                  >
                    <FaClock className="mr-2" />
                    POC AI
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavigation("/HistoryPage")}
                    className={`flex items-center w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                      pathname === "/HistoryPage"
                        ? "bg-white text-blue-900 shadow-md"
                        : "hover:bg-white hover:text-blue-900"
                    }`}
                  >
                    <FaClipboard className="mr-2" />
                    History
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/DailySummaries")}
                    className={`flex items-center w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                      pathname === "/DailySummaries"
                        ? "bg-white text-blue-900 shadow-md"
                        : "hover:bg-white hover:text-blue-900"
                    }`}
                  >
                    <FaClock className="mr-2" />
                    Daily Summaries
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavigation("/InsightPage")}
                    className={`flex items-center w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                      pathname === "/InsightPage"
                        ? "bg-white text-blue-900 shadow-md"
                        : "hover:bg-white hover:text-blue-900"
                    }`}
                  >
                    <FaCreditCard className="mr-2" />
                    Insights
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavigation("/TaskListPage")}
                    className={`flex items-center w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                      pathname === "/TaskListPage"
                        ? "bg-white text-blue-900 shadow-md"
                        : "hover:bg-white hover:text-blue-900"
                    }`}
                  >
                    <FaClipboard className="mr-2" />
                    Task List
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/state")}
                    className={`flex items-center w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                      pathname === "/state"
                        ? "bg-white text-blue-900 shadow-md"
                        : "hover:bg-white hover:text-blue-900"
                    }`}
                  >
                    <FaClipboard className="mr-2" />
                    States
                  </button>
                </li>
                {/* Settings with Sub-menu */}
                <li>
                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`flex items-center justify-between w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                      isSettingsOpen ||
                      pathname === "/facilitySetting" ||
                      pathname === "/profileSettting"
                        ? "bg-white text-blue-900 shadow-md"
                        : "hover:bg-white hover:text-blue-900"
                    }`}
                  >
                    <div className="flex items-center">
                      <FaCog className="mr-2" />
                      Settings
                    </div>
                    <span>{isSettingsOpen ? "▲" : "▼"}</span>
                  </button>

                  {/* Sub-menu (Facility & Profile Settings) */}
                  {isSettingsOpen && (
                    <ul className="mt-2 ml-4 space-y-2">
                      <li>
                        <button
                          onClick={() => {
                            handleNavigation("/facilitySetting");
                            setIsSettingsOpen(false); // Close dropdown
                          }}
                          className={`flex items-center w-full py-2 px-3 rounded-md text-xs lg:text-sm transition ${
                            pathname === "/facilitySetting"
                              ? "bg-blue-100 text-blue-900 shadow-md"
                              : "hover:bg-blue-50 hover:text-blue-900"
                          }`}
                        >
                          <FaBuilding className="mr-2" />
                          Facility Settings
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            handleNavigation("/profileSettting");
                            setIsSettingsOpen(false); // Close dropdown
                          }}
                          className={`flex items-center w-full py-2 px-3 rounded-md text-xs lg:text-sm transition ${
                            pathname === "/profileSettting"
                              ? "bg-blue-100 text-blue-900 shadow-md"
                              : "hover:bg-blue-50 hover:text-blue-900"
                          }`}
                        >
                          <FaUser className="mr-2" />
                          Profile Settings
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>

            {/* Logout Button - Always at the Bottom */}
            <div className="mt-auto">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center w-full py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm transition"
              >
                <FaSignOutAlt className="mr-2" />
                Log out
              </button>
            </div>
          </div>
        </nav>
      )}
      <Logout
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleConfirmLogout={handleConfirmLogout}
      />
    </>
  );
};

export default Sidebar;
