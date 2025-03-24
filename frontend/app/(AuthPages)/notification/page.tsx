"use client";

import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Cookies from "js-cookie";
import UserDropdown from "@/components/profile-dropdown";
import DateDisplay from "@/components/date";
import { toast } from "react-toastify";
import HeaderWithToggle from "@/components/HeaderWithToggle";
export default function Dashboard() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  
//   useEffect(() => {
//     const email = Cookies.get("email"); 
  
//     if (!email) return; 
  
//     const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications`;
  
//     fetch(apiUrl, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email }), 
//     })
//       .then((response) => response.json())
//       .then((data) => setNotifications(data.notifications)) // Fetch only notifications array
//       .catch((err) => console.error("Error fetching notifications:", err));
//   }, []);
  
  useEffect(() => {
    const email = Cookies.get("email"); 
  
    if (!email) return; 
  
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?email=${encodeURIComponent(email)}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => setNotifications(data.notifications)) // Fetch only notifications array
      .catch((err) => console.error("Error fetching notifications:", err));
  }, []);
  
  const handleDeleteNotification = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/${id}`,
        { method: "DELETE" }
      );
  
      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }
  
      // Remove from state after successful deletion
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
  
      // Show success toast
      toast.success("Notification deleted successfully!", {
        position: "top-right",
        autoClose: 3000, // Toast disappears after 3 seconds
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
  
      // Show error toast
      toast.error("Failed to delete notification. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  
  
  
  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row">
      <HeaderWithToggle onToggleSidebar={() => setIsSidebarOpen(true)} />

{/* Sidebar */}
<Sidebar
  isSidebarOpen={isSidebarOpen}
  setIsSidebarOpen={setIsSidebarOpen}
/>
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex items-center justify-between mb-6 w-full flex-wrap">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
            Hello, <span className="text-blue-900 capitalize">{name}</span>
          </h2>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
            
            <UserDropdown />
          </div>
        </header>

        {/* Facility Dropdown and Tabs Container */}
        <div className="flex items-center space-x-4 mt-4 lg:mt-8 ml-4 lg:ml-10 justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-900">
              Facility
            </h3>
          </div>
          {/* Date */}
          <div className="relative flex items-center space-x-2">
            <DateDisplay />
          </div>
        </div>

        <div
          className="w-full border-t border-gray-300 mt-4"
          style={{ borderColor: "#E0E0E0" }}
        ></div>

        <h1 className="text-2xl text-blue-900 font-bold mt-10 ml-8 mb-8">
          All Notifications
        </h1>

      {/* Scrollable Notification List */}
<div className="max-h-[550px] overflow-y-auto border rounded-lg shadow-md p-4 bg-white">
  {notifications.length > 0 ? (
    <ul className="space-y-3">
      {notifications.map((notification) => (
        <li
          key={notification._id} // Correct key to prevent rendering issues
          className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 shadow-sm"
        >
          {/* Left: Notification Text */}
          <div className="flex-1">
            <p className="text-gray-800">{notification.message}</p>
            {notification.timestamp && (
              <small className="text-gray-500">
                {new Date(notification.timestamp).toLocaleString()}
              </small>
            )}
          </div>

          {/* Right: Delete Button */}
          <button
            className="ml-4 text-red-500 hover:text-red-700 text-sm"
            onClick={() => handleDeleteNotification(notification._id)} // Fix `_id`
          >
            ❌
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500 text-center">No notifications found.</p>
  )}
</div>


        {/* Back Button */}
        <button
          className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg"
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>
    </div>
  );
}
