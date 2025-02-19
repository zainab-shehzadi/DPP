"use client";

import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaHome,
  FaClipboard,
  FaUserPlus,
  FaFileAlt,
  FaClock,
  FaCog,
  FaUser,
  FaBuilding,
  FaCreditCard,
} from "react-icons/fa";

import MobileSidebar from "./MobileSidebar";
import { useRouter } from "next/navigation"; // Correct import for App Router

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [email, setEmail] = useState<string | null>(null); // Email from localStorage
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const router = useRouter();

  const handleNavigation = (path: string) => {
    setActiveItem(path); // Set the active item
    router.push(path);
  };
  const handleLogout = () => {
    try {
      // Remove the token cookie by setting it with an expired date
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      console.log("Token cookie removed.");

      // Optionally clear client-side storage
      localStorage.clear(); // Clear all localStorage (if used)
      sessionStorage.clear(); // Clear all sessionStorage (if used)

      // Redirect to Login page
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred. Please try again.");
    }
  };
  useEffect(() => {
    setActiveItem(window.location.pathname);
  }, []);

  // Check if screen width is below 1020px
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1020);
    };

    handleResize(); // Initialize state on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleUserSettingsNavigation = async () => {
    if (!email) {
      console.error("Email is missing or not provided.");
     
      return;
    }
  
    console.log(`Fetching role for email: ${email}`);
    try {
      // Fetch user role
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/role/${email}`);
  
      if (!response.ok) {
        const errorData = await response.json(); // Attempt to read error details from the response
        //console.error("Failed to fetch user role:", errorData);
  
        // Handle case where user does not exist
        if (response.status === 404) {
          alert("User does not exist. Please check the email and try again.");
        } else {
          throw new Error(errorData.message || "Failed to fetch user role.");
        }
        return;
      }
  
      const data = await response.json();
      console.log("User role fetched:", data.role);
  
      // Check if user role is "user"
      if (data.role === "Supervisor") {
        handleNavigation(`profileSettting`);
      } else {
        alert("Access denied. Only users can access this section.");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      alert("Failed to verify user role. Please try again.");
    }
  };
  return (
    <>
      {/* Conditionally render Mobile Sidebar */}
      {isMobileView ? (
        <MobileSidebar />
      ) : (
        <nav
          className={`bg-[#002F6C] text-white min-w-[250px] w-full lg:w-64 fixed lg:h-full transition-transform transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          
          {/* Scrollable Sidebar Content */}
          <div className="h-full flex flex-col overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 px-4 py-4">
            {/* Logo */}
           
            <div
  className="mb-8 w-28 h-10 bg-cover bg-center hidden lg:block" // Adjusted width & height
  style={{ backgroundImage: "url('/assets/logo-dpp1.png')" }}
></div>

            <ul className="space-y-2 w-full">
              {/* Dashboard */}
              <li className="w-full">
                <a
                  href="#"
                  onClick={() => setDashboardOpen(!dashboardOpen)}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaTachometerAlt className="mr-2" />
                  Dashboard
                </a>
                {dashboardOpen && (
  <ul className="ml-4 space-y-2"> {/* Reduced spacing for compact layout */}
    
    {/* Upload New 2567 */}
    <li>
      <a
        href="#"
        onClick={() => handleNavigation("/Dashboard")}
        className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition 
          ${activeItem === "/Dashboard" ? "bg-white text-blue-900 shadow-md" : "hover:bg-white hover:text-blue-900"}`}
      >
        <FaUser className="mr-2" />
        Upload New 2567
      </a>
    </li>

    {/* History */}
    <li>
      <a
        href="#"
        onClick={() => handleNavigation("/HistoryPage")}
        className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition 
          ${activeItem === "/HistoryPage" ? "bg-white text-blue-900 shadow-md" : "hover:bg-white hover:text-blue-900"}`}
      >
        <FaBuilding className="mr-2" />
        History
      </a>
    </li>

    {/* Task Assigned */}
    <li>
      <a
        href="#"
        onClick={() => handleNavigation("/TaskListPage")}
        className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition 
          ${activeItem === "/TaskListPage" ? "bg-white text-blue-900 shadow-md" : "hover:bg-white hover:text-blue-900"}`}
      >
        <FaUser className="mr-2" />
        Task Assigned
      </a>
    </li>

    {/* Insights */}
    <li>
      <a
        href="#"
        onClick={() => handleNavigation("/InsightPage")}
        className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition 
          ${activeItem === "/InsightPage" ? "bg-white text-blue-900 shadow-md" : "hover:bg-white hover:text-blue-900"}`}
      >
        <FaCreditCard className="mr-2" />
        Insights
      </a>
    </li>

  </ul>
)}

              </li>

              {/* Homepage */}
              <li className="w-full">
                <a
                  href="#"
                  onClick={() => handleNavigation("/landing")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaHome className="mr-2" />
                  Homepage
                </a>
              </li>

              {/* Add New User */}
              <li className="w-full">
                <a
                  href="#"
                  onClick={() => handleNavigation("/AddNewUser")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaUserPlus className="mr-2" />
                  Add New User
                </a>
              </li>

              {/* Insights */}
              <li className="w-full">
                <a
                  href="#"
                  onClick={() => handleNavigation("/InsightPage")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaCreditCard className="mr-2" />
                  Insights
                </a>
              </li>

              {/* Task List */}
              <li className="w-full">
                <a
                  href="#"
                  onClick={() => handleNavigation("/TaskDetailPage")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaClipboard className="mr-2" />
                  Task List
                </a>
              </li>

              {/* Daily Summaries */}
              <li className="w-full">
                <a
                  href="#"
                  onClick={() => handleNavigation("/DailySummaries")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaClock className="mr-2" />
                  Daily Summaries
                </a>
              </li>

              {/* Settings */}
              <li className="w-full">
                <a
                  href="#"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaCog className="mr-2" />
                  Settings
                </a>
                {settingsOpen && (
  <ul className="ml-4 space-y-2"> {/* Reduced spacing for better fit */}
    
    {/* Profile Settings */}
    <li>
      <a
        href="#"
        onClick={handleUserSettingsNavigation} // ✅ Corrected handler
        className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm transition"
      >
        <FaUser className="mr-2" />
        Profile Settings
      </a>
    </li>

    {/* Facility Settings */}
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

    {/* User Settings */}
    <li>
      <a
        href="#"
        onClick={() => handleNavigation("/UserSetting")}
        className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm transition"
      >
        <FaUser className="mr-2" />
        User Settings
      </a>
    </li>

    {/* Billing */}
    <li>
      <a
        href="#"
        onClick={() => handleNavigation("/Billing")} // ✅ Added correct navigation
        className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm transition"
      >
        <FaCreditCard className="mr-2" />
        Billing
      </a>
    </li>

  </ul>
)}

              </li>

              {/* Logout */}
              <li className="w-full">
                <a
                  href="#"
                  onClick={() => handleNavigation("/landing")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaClipboard className="mr-2" />
                  Survey Prep
                </a>
              </li>
              <li className="w-full">
                <a
                  href="#"
                  onClick={() => handleLogout()}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaClipboard className="mr-2" />
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </>
  );
};

export default Sidebar;

















<div className="mb-8 flex justify-center items-center">
  <img 
    src="/logo-dpp1.png" 
    alt="Logo" 
    className="w-32 h-auto max-h-12 object-contain" 
  />
</div>
