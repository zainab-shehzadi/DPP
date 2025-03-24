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
import Logout from "./logoutConfirmation";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1020);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobileView) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobileView]);

  // Auto logout after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handleConfirmLogout(), 30 * 60 * 1000);
    };
    ["mousemove", "keypress", "click", "scroll"].forEach((event) =>
      window.addEventListener(event, resetTimer)
    );
    resetTimer();
    return () => {
      ["mousemove", "keypress", "click", "scroll"].forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      clearTimeout(timeout);
    };
  }, []);

  const handleConfirmLogout = () => {
    try {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };
  useEffect(() => {
    if (pathname === "/profileSettting" || pathname === "/facilitySetting") {
      setIsSettingsOpen(true);
    }
  }, [pathname]);

  const navLinks = [
    { path: "/Dashboard", label: "Dashboard", icon: <FaBuilding /> },
    { path: "/pocAI", label: "POC AI", icon: <FaClock /> },
    { path: "/HistoryPage", label: "History", icon: <FaClipboard /> },
    { path: "/DailySummaries", label: "Daily Summaries", icon: <FaClock /> },
    { path: "/InsightPage", label: "Insights", icon: <FaCreditCard /> },
    { path: "/TaskListPage", label: "Task List", icon: <FaClipboard /> },
    { path: "/state", label: "States", icon: <FaClipboard /> },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isSidebarOpen && isMobileView && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`bg-[#002F6C] text-white w-[220px] fixed z-50 top-0 left-0 h-full transform transition-transform duration-300 ${
          isMobileView
            ? isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto max-h-screen px-4 py-4">
          {/* Logo */}
          <div className="mb-8 flex justify-center items-center">
            <img
              src="/assets/logo-dpp1.png"
              alt="Logo"
              className="w-32 h-auto max-h-12 object-contain"
            />
          </div>

          {/* Navigation Links */}
          <ul className="space-y-2 w-full flex-grow">
            {navLinks.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                    pathname === item.path
                      ? "bg-white text-blue-900 shadow-md"
                      : "hover:bg-white hover:text-blue-900"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}

            {/* Settings Dropdown */}

            <li>
              <button
                onClick={() => setIsSettingsOpen((prev) => !prev)}
                className={`flex items-center justify-between w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition hover:bg-white hover:text-blue-900`}
              >
                <div className="flex items-center">
                  <FaCog className="mr-2" />
                  Settings
                </div>
                <span>{isSettingsOpen ? "▲" : "▼"}</span>
              </button>

              {isSettingsOpen && (
                <ul className="mt-2 ml-4 space-y-2">
                  <li>
                    <button
                      onClick={() => handleNavigation("/profileSettting")}
                      className={`flex items-center w-full py-2 px-3 rounded-md text-xs lg:text-sm font-medium transition ${
                        pathname === "/profileSettting"
                          ? "bg-white text-blue-900 shadow-md"
                          : "hover:bg-blue-50 hover:text-blue-900"
                      }`}
                    >
                      <FaUser className="mr-2" />
                      Profile Settings
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation("/facilitySetting")}
                      className={`flex items-center w-full py-2 px-3 rounded-md text-xs lg:text-sm font-medium transition ${
                        pathname === "/facilitySetting"
                          ? "bg-white text-blue-900 shadow-md"
                          : "hover:bg-blue-50 hover:text-blue-900"
                      }`}
                    >
                      <FaBuilding className="mr-2" />
                      Facility Settings
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>

          {/* Logout */}
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

      {/* Logout Modal */}
      <Logout
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleConfirmLogout={handleConfirmLogout}
      />
    </>
  );
};

export default Sidebar;
