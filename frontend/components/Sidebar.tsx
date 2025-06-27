"use client";

import React, { useState, useEffect } from "react";
import {
  FaUserPlus,
  FaSignOutAlt,
  FaCog,
  FaClipboard,
  FaClock,
  FaUser,
  FaBuilding,
  FaCreditCard,
  FaChartBar,
  FaMapMarkedAlt,
  FaUsersCog,
  FaFileAlt,
  FaList,
} from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import Logout from "./logoutConfirmation";
import Cookies from "js-cookie";
import Link from "next/link";
import { set } from "mongoose";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [userRole, setUserRole] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const router = useRouter();

  const pathname = usePathname();

  const allNavigationLinks = [
    {
      path: "/Dashboard",
      label: "Dashboard",
      icon: <FaChartBar />,
      roles: ["Regional Admin", "Facility Admin", "Super Admin"],
    },
    {
      path: "/pocAI",
      label: "POC AI",
      icon: <FaFileAlt />,
      roles: ["Regional Admin", "Facility Admin", "Super Admin"],
    },
    {
      path: "/DocumentInsights",
      label: "Document Insights",
      icon: <FaMapMarkedAlt />,
      roles: ["Regional Admin"],
    },
    {
      path: "/TaskListPage",
      label: "Task List",
      icon: <FaList />,
      roles: [
        "Regional Admin",
        "Facility Admin",
        "Facility Users",
        "Super Admin",
      ],
    },
    {
      path: "/DailySummaries",
      label: "Daily Summaries",
      icon: <FaClock />,
      roles: ["Regional Admin", "Facility Admin", "Super Admin"],
    },
    {
      path: "/facility",
      label: "Facilities",
      icon: <FaBuilding />,
      roles: ["Super Admin"],
    },
    {
      path: "/RegionalAdminRequests",
      label: "Regional Admin Request",
      icon: <FaBuilding />,
      roles: ["Facility Admin"],
    },
    {
      path: "/AddRegionalAdmin",
      label: "Add Regional Admin",
      icon: <FaUserPlus />,
      roles: ["Super Admin"],
    },
    {
      path: "/AddNewUser",
      label: "Add Facility User",
      icon: <FaUserPlus />,
      roles: ["Regional Admin", "Facility Admin", "Super Admin"],
    },
    {
      path: "/AddNewAdmin",
      label: "Add Facility Admin",
      icon: <FaUserPlus />,
      roles: ["Regional Admin", "Super Admin"],
    },
    {
      path: "/UserSetting",
      label: "User Settings",
      icon: <FaUsersCog />,
      roles: ["Regional Admin", "Facility Admin", "Super Admin"],
    },
    {
      path: "/HistoryPage",
      label: "History",
      icon: <FaClipboard />,
      roles: ["Regional Admin", "Facility Admin","Super Admin"],
    },
    {
      path: "/InsightPage",
      label: "Insights",
      icon: <FaCreditCard />,
      roles: ["Regional Admin", "Facility Admin", "Super Admin"],
    },
  ];

  const getSettingsOptions = () => {
    const options = [
      {
        path: "/profileSettting",
        label: "Profile Settings",
        icon: <FaUser />,
        roles: ["Regional Admin", "Facility Admin", "Facility Users"],
      },
    ];

    if (userRole === "Facility Admin") {
      options.push({
        path: "/facilitySetting",
        label: "Facility Settings",
        icon: <FaBuilding />,
        roles: ["Facility Admin"],
      });
    }

    return options;
  };

  useEffect(() => {
    const userRole = Cookies.get("role") || "";
    setUserRole(userRole);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1020);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileView) setIsSidebarOpen(false);
  }, [pathname, isMobileView]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handleConfirmLogout(), 30 * 60 * 1000); // 30 min
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
      toast.error("Error during logout");
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const getAvailableLinks = () => {
    if (!userRole) return [];
    return allNavigationLinks.filter((link) => link.roles.includes(userRole));
  };

  return (
    <>
      {isSidebarOpen && isMobileView && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <nav
        className={`bg-[#002F6C] text-white w-[250px] fixed z-50 top-0 left-0 h-full transform transition-transform duration-300 ${
          isMobileView
            ? isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto max-h-screen px-4 py-4">
          {/* <div className="mb-8 flex justify-center items-center">
            <img
              src="/assets/logo-dpp1.png"
              alt="Logo"
              className="w-32 h-auto max-h-12 object-contain"
            />
          </div> */}
          <div className="mb-8 flex justify-center items-center">
            <img
              src="/assets/logo-dpp1.png"
              alt="Logo"
              className="w-32 h-auto max-h-12 object-contain cursor-pointer"
              onClick={() => router.push("/Dashboard")}
            />
          </div>
          <div className="mb-4 px-3 py-2 rounded-md text-center">
            <span className="text-xl font-extrabold underline">{userRole}</span>
          </div>

          <ul className="space-y-2 w-full flex-grow">
            {getAvailableLinks().map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center w-full py-2 px-3 rounded-md font-semibold text-sm lg:text-sm transition ${
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

            <li>
              <button
                onClick={() => setIsSettingsOpen((prev) => !prev)}
                className="flex items-center justify-between w-full py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition hover:bg-white hover:text-blue-900"
              >
                <div className="flex items-center">
                  <FaCog className="mr-2" />
                  Settings
                </div>
                <span>{isSettingsOpen ? "▲" : "▼"}</span>
              </button>
              {isSettingsOpen && (
                <ul className="mt-2 ml-4 space-y-2">
                  {getSettingsOptions().map((option) => (
                    <li key={option.path}>
                      <button
                        onClick={() => handleNavigation(option.path)}
                        className={`flex items-center w-full py-2 px-3 rounded-md text-xs lg:text-sm font-medium transition ${
                          pathname === option.path
                            ? "bg-white text-blue-900 shadow-md"
                            : "hover:bg-blue-50 hover:text-blue-900"
                        }`}
                      >
                        {option.icon}
                        <span className="ml-2">{option.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>

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

      <Logout
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleConfirmLogout={handleConfirmLogout}
      />
    </>
  );
};

export default Sidebar;
