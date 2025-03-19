import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaClipboard,
  FaClock,
  FaUser,
  FaBuilding,
  FaCreditCard,
  FaSignOutAlt,
} from "react-icons/fa";

const MobileSidebar = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path) => {
    router.push(path);
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
              <li
                onClick={() => handleNavigation("/Dashboard")}
                className={`flex items-center cursor-pointer ${
                  pathname === "/Dashboard" ? "text-blue-700" : ""
                }`}
              >
                <FaBuilding className="mr-2" /> Dashboard
              </li>
              
              <li onClick={() => handleNavigation("/UploadDoc")} className="flex items-center cursor-pointer">
                <FaClock className="mr-2" /> POC AI
              </li>

              <li onClick={() => handleNavigation("/HistoryPage")} className="flex items-center cursor-pointer">
                <FaClipboard className="mr-2" /> History
              </li>

              <li onClick={() => handleNavigation("/DailySummaries")} className="flex items-center cursor-pointer">
                <FaClock className="mr-2" /> Daily Summaries
              </li>

              <li onClick={() => handleNavigation("/InsightPage")} className="flex items-center cursor-pointer">
                <FaCreditCard className="mr-2" /> Insights
              </li>

              <li onClick={() => handleNavigation("/TaskListPage")} className="flex items-center cursor-pointer">
                <FaClipboard className="mr-2" /> Task List
              </li>

              {/* Settings */}
              <li onClick={() => setSettingsOpen(!settingsOpen)} className="flex items-center cursor-pointer">
                <FaUser className="mr-2" /> Settings
              </li>
              {settingsOpen && (
                <ul className="ml-4 space-y-4 text-blue-900 font-medium">
                  <li onClick={() => handleNavigation("/profileSettting")} className="flex items-center cursor-pointer">
                    <FaUser className="mr-2" /> Profile Settings
                  </li>
                  <li onClick={() => handleNavigation("/facilitySetting")} className="flex items-center cursor-pointer">
                    <FaBuilding className="mr-2" /> Facility Settings
                  </li>
                </ul>
              )}

              {/* Logout */}
              <li onClick={handleLogout} className="flex items-center cursor-pointer text-red-600">
                <FaSignOutAlt className="mr-2" /> Logout
              </li>
            </ul>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
