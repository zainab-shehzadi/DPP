"use client";

import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaHome,
  FaClipboard,
  FaUserPlus,
  FaFileAlt,
  FaSignOutAlt,
  FaClock,
  FaCog,
  FaUser,
  FaBuilding,
  FaQuestionCircle,
  FaCreditCard,
} from "react-icons/fa";

import MobileSidebar from "./MobileSidebar";
import { useRouter } from "next/navigation"; // Correct import for App Router
import Cookies from "js-cookie"; 
interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [email, setEmail] = useState<string | null>(null); 
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    setActiveItem(path); 
    router.push(path);
  };
  const handleConfirmLogout= () => {
    try {
    
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      console.log("Token cookie removed.");
      localStorage.clear(); 
      sessionStorage.clear(); 

      router.push("/LoginPage");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred. Please try again.");
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
  const handleUserSettingsNavigation = async () => {
    const email = Cookies.get("email");
    const role =Cookies.get("role");
    if (!email) {
      console.error("Email is missing or not provided.");
      return;
    }
  
    console.log(`Fetching role for email: ${email}`);
    try {
      // Fetch user role
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/role/${email}`);
  
      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 404) {
          alert("User does not exist. Please check the email and try again.");
        } else {
          throw new Error(errorData.message || "Failed to fetch user role.");
        }
        return;
      }
  
      const data = await response.json();
      console.log("User role fetched:", data.role);
  
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

      {isMobileView ? (
        <MobileSidebar />
      ) : (
        <nav
  className={`bg-[#002F6C] text-white min-w-[220px] w-full lg:w-52 fixed lg:h-full transition-transform transform ${
    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  } lg:translate-x-0`}
>

          
    
<div className="h-full flex flex-col overflow-y-auto max-h-screen px-4 py-4 scrollbar-hide">

          <div className="mb-8 flex justify-center items-center">
  <img 
    src="/assets/logo-dpp1.png" 
    alt="Logo" 
    className="w-32 h-auto max-h-12 object-contain" 
  />
</div>


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
  <ul className="ml-4 space-y-2">
  
    <li>
      <a
        href="#"
        onClick={() => handleNavigation("/Dashboard")}
        className={`flex items-center py-2 px-3 rounded-md font-semibold text-xs lg:text-sm transition 
          ${activeItem === "/Dashboard" ? "bg-white text-blue-900 shadow-md" : "hover:bg-white hover:text-blue-900"}`}
      >
        <FaUser className="mr-3" />
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


  {/* POC AI */}
  <li className="w-full">
                <a
                  href="#"
                  onClick={() => handleNavigation("/UploadDoc")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaClock className="mr-2" />
                  POC AI
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
                  onClick={() => handleNavigation("/TaskListPage")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaClipboard className="mr-2" />
                  Task List
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
  <ul className="ml-4 space-y-2"> 
    
    {/* Profile Settings */}
    <li>
      <a
        href="#"
        onClick={handleUserSettingsNavigation} 
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

  </ul>
)}

              </li>

              {/* survey prep */}
              <li className="w-full">
                <a
                  href="#"
                  // onClick={() => handleNavigation("/landing")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                >
                  <FaClipboard className="mr-2" />
                  Survey Prep
                </a>
              </li>
                  {/**/}
                  <li className="w-full">
                <a
                  href="#"
                  // onClick={() => handleNavigation("/landing")}
                  className="flex items-center py-2 px-3 hover:bg-white hover:text-blue-900 rounded-md font-semibold text-xs lg:text-sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </a>
              </li>
           {/* Logout Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 z-50 w-screen min-h-screen h-full bg-[#00000035] flex justify-center items-center">
          <div className="fixed top-[50%]  bg-white p-6  text-center w-[400px]">
          
            <p className="text-lg font-bold text-gray-900 text-left">Are you sure you want to log Out?</p>
            <p className="text-sm text-gray-500 text-left">You'll be signed out of your account. Make sure you've saved your work before continuing.</p>
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
            </ul>
          </div>
        </nav>
      )}
    </>
  );
};

export default Sidebar;
