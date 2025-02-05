"use client";

import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaHome,
  FaClipboard ,
  FaUserPlus,
  FaFileAlt,
  FaClock,
  FaCog,
  FaUser,
  FaBuilding,
  FaCreditCard,
} from "react-icons/fa";
interface SidebarProps {

  isSidebarOpen: boolean;
 
}
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

  const router = useRouter(); // Moved inside the component
  
  const handleDashboardClick = () => {
    setDashboardOpen(!dashboardOpen);
    setSettingsOpen(false);
  };

  const handleSettingsClick = () => {
    setSettingsOpen(!settingsOpen);
    setDashboardOpen(false);
  };

  const handleNavigation = (path: string) => {
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
      router.push("/Login");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred. Please try again.");
    }
  };

 // Helper function to get cookies
 const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

useEffect(() => {
  // Retrieve email from cookies on component mount
  const storedEmail = getCookie("email");
  if (storedEmail) {
    setEmail(storedEmail); // Set the email state if found in cookies
  }
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

  // Check if screen width is below 1020px
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1020);
    };

    // Set initial value and add resize event listener
    handleResize(); // Initialize state on mount
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Conditionally render Mobile Sidebar if screen width is <= 1020px */}
      
      {isMobileView ? (
        <MobileSidebar />
      ) : (
        <nav
          className={`bg-[#002F6C] text-white w-full lg:w-64 flex flex-col items-center px-4 py-8 lg:fixed lg:h-full transition-transform transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div
            className="mb-8 w-full h-24 bg-cover bg-center hidden lg:block"
            style={{ backgroundImage: "url('/assets/logo.avif')" }}
          ></div>
          <ul className="space-y-5 w-full flex flex-col items-center">
            <li className="w-full">
              <a
                href="#"
                onClick={handleDashboardClick}
                className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
              >
                <FaTachometerAlt className="mr-2" />
                Dashboard
              </a>
              {dashboardOpen && (
                <ul className="ml-4 space-y-4">
                  <li>
                    <a
                      href="#"
                      onClick={() => handleNavigation("/Dashboard")}
                      className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
                    >
                      <FaUser className="mr-2" />
                      Upload New 2567
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={() => handleNavigation("/HistoryPage")}
                      className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
                    >
                      <FaBuilding className="mr-2" />
                      History
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={() => handleNavigation("/TaskListPage")}
                      className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
                    >
                      <FaUser className="mr-2" />
                      Task Assigned
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={() => handleNavigation("/InsightPage")}
                      className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
                    >
                      <FaCreditCard className="mr-2" />
                      Insights
                    </a>
                  </li>
                </ul>
              )}
            </li>
            <li className="w-full">
              <a
                href="#"
                onClick={() => handleNavigation("/landing")}
                className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
              >
                <FaHome className="mr-2" />
                Homepage
              </a>
            </li>
           
           
          
            <li className="w-full">
              <a
                href="#"
                onClick={() => handleNavigation("/AddNewUser")}
                className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
              >
                <FaUserPlus className="mr-2" />
                Add New User
              </a>
            </li>
            <li className="w-full">
                    <a
                      href="#"
                      onClick={() => handleNavigation("/InsightPage")}
                      className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
                    >
                      <FaCreditCard className="mr-2" />
                      Insights
                    </a>
                  </li>
            <li className="w-full">
              <a
                href="#"
                onClick={() => handleNavigation("/TaskDetailPage")}
                className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
              >
                <FaUserPlus className="mr-2" />
                Task List
              </a>
            </li>
            <li className="w-full">
      <a
        href="#"
        onClick={() => handleNavigation("/DailySummaries")}
        className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
      >
        <FaClock className="mr-2" /> {/* Updated to clock icon */}
        Daily Summaries
      </a>
    </li>
            <li className="w-full">
              <a
                href="#"
                onClick={handleSettingsClick}
                className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
              >
                <FaCog className="mr-2" />
                Settings
              </a>
              {settingsOpen && (
                <ul className="ml-4 space-y-4">
                  <li>
                    <a
                      href="#"
                      
                      onClick={handleUserSettingsNavigation} // Updated handler for User Settings
                      className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
                    >
                      <FaUser className="mr-2" />
                      Profile Settings
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                  
                      onClick={() => handleNavigation("/facilitySetting")}
                      className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
                    >
                      <FaBuilding className="mr-2" />
                      Facility Settings
                    </a>
                  </li>
                  <li>
      <a
        href="#"
        onClick={() => handleNavigation("/UserSetting")}
        className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
      >
        <FaUser className="mr-2" />
        User Settings
      </a>
    </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
                    >
                      <FaCreditCard className="mr-2" />
                      Billing
                    </a>
                  </li>
                </ul>
              )}
            </li>
            <li className="w-full">
      <a
        href="#"
        onClick={() => handleNavigation("/landing")}
        className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
      >
        <FaClipboard className="mr-2" /> {/* Updated icon */}
        Survey Prep
      </a>
    </li>

    <li className="w-full">
      <a
        href="#"
        onClick={handleLogout}
        className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-bold text-medium leading-6"
      >
        <FaClipboard className="mr-2" />
        Logout
      </a>
    </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default Sidebar;
