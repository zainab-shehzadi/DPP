import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import {
  FaTachometerAlt,
  FaHome,
  FaClipboard,
  FaUserPlus,
  FaClock,
  FaCog,
  FaUser,
  FaBuilding,
  FaCreditCard,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

const MobileSidebar = () => {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const router = useRouter();

  const handleDashboardClick = () => {
    setDashboardOpen(!dashboardOpen);
    setSettingsOpen(false);
  };

  const handleSettingsClick = () => {
    setSettingsOpen(!settingsOpen);
    setDashboardOpen(false);
  };

  const handleNavigation = (path) => {
    if (navigator.onLine) {
      router.push(path);
    } else {
      alert("No internet connection. Please check your network.");
    }
  };
  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger>
          <Menu />
        </SheetTrigger>
        <SheetContent className="bg-white">
          <SheetHeader>
            <ul className="flex flex-col gap-6 mt-6 text-blue-900 font-bold">
              {/* Dashboard */}
              <li onClick={handleDashboardClick} className="flex items-center cursor-pointer">
                <FaTachometerAlt className="mr-2" /> Dashboard
              </li>
              {dashboardOpen && (
                <ul className="ml-4 space-y-4 text-blue-900 font-medium">
                  <li onClick={() => handleNavigation("/Dashboard")} className="flex items-center cursor-pointer">
                    <FaUser className="mr-2" /> Upload New 2567
                  </li>
                  <li onClick={() => handleNavigation("/HistoryPage")} className="flex items-center cursor-pointer">
                    <FaBuilding className="mr-2" /> History
                  </li>
                  <li onClick={() => handleNavigation("/TaskListPage")} className="flex items-center cursor-pointer">
                    <FaUser className="mr-2" /> Task Assigned
                  </li>
                  <li onClick={() => handleNavigation("/InsightPage")} className="flex items-center cursor-pointer">
                    <FaCreditCard className="mr-2" /> Insights
                  </li>
                </ul>
              )}

              {/* Homepage */}
              <li onClick={() => handleNavigation("/landing")} className="flex items-center cursor-pointer">
                <FaHome className="mr-2" /> Homepage
              </li>

              {/* Add New User */}
              <li onClick={() => handleNavigation("/AddNewUser")} className="flex items-center cursor-pointer">
                <FaUserPlus className="mr-2" /> Add New User
              </li>

              {/* Task List */}
              <li onClick={() => handleNavigation("/TaskDetailPage")} className="flex items-center cursor-pointer">
                <FaClipboard className="mr-2" /> Task List
              </li>

              {/* Daily Summaries */}
              <li onClick={() => handleNavigation("/DailySummaries")} className="flex items-center cursor-pointer">
                <FaClock className="mr-2" /> Daily Summaries
              </li>

              {/* Settings */}
              <li onClick={handleSettingsClick} className="flex items-center cursor-pointer">
                <FaCog className="mr-2" /> Settings
              </li>
              {settingsOpen && (
                <ul className="ml-4 space-y-4 text-blue-900 font-medium">
                  <li onClick={() => handleNavigation("/profileSettting")} className="flex items-center cursor-pointer">
                    <FaUser className="mr-2" /> Profile Settings
                  </li>
                  <li onClick={() => handleNavigation("/facilitySetting")} className="flex items-center cursor-pointer">
                    <FaBuilding className="mr-2" /> Facility Settings
                  </li>
                  <li onClick={() => handleNavigation("/UserSetting")} className="flex items-center cursor-pointer">
                    <FaUser className="mr-2" /> User Settings
                  </li>
                  <li className="flex items-center cursor-pointer">
                    <FaCreditCard className="mr-2" /> Billing
                  </li>
                </ul>
              )}

              {/* Survey Prep */}
              <li onClick={() => handleNavigation("/landing")} className="flex items-center cursor-pointer">
                <FaClipboard className="mr-2" /> Survey Prep
              </li>

              {/* Logout */}
              <li onClick={handleLogout} className="flex items-center cursor-pointer">
                <FaClipboard className="mr-2" /> Logout
              </li>
            </ul>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
