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
import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Logout from "./logoutConfirmation";

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
                  onClick={() => handleNavigation("/facilitySetting")}
                  className={`flex items-center w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                    pathname === "/facilitySetting"
                      ? "bg-white text-blue-900 shadow-md"
                      : "hover:bg-white hover:text-blue-900"
                  }`}
                >
                  <FaBuilding className="mr-2" />
                  Facility Settings
                </button>
              </li>
            
              <li>
                <button
                  onClick={() => handleNavigation("/profileSettting")}
                  className={`flex items-center w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition ${
                    pathname === "/profileSettting"
                      ? "bg-white text-blue-900 shadow-md"
                      : "hover:bg-white hover:text-blue-900"
                  }`}
                >
                  <FaUser className="mr-2" />
                  Profile Settings
                </button>
              </li>
          

              <li>
              <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center w-full py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm transition"
                >
                  <FaBuilding className="mr-2" />
                 Log out
                </button>
              </li>
            </ul>
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
