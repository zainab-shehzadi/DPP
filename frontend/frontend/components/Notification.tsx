"use client";

import React, { useEffect, useState,useRef } from "react";
import { FaBell } from "react-icons/fa";
import io from "socket.io-client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL as string, {
  transports: ["websocket"],
});

const NotificationIcon = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();
  const notificationRef = useRef<HTMLDivElement | null>(null); 
  useEffect(() => {
    const email = Cookies.get("email"); 
  
    if (!email) return; 
  
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?email=${encodeURIComponent(email)}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => setNotifications(data.notifications)) // Fetch only notifications array
      .catch((err) => console.error("Error fetching notifications:", err));
  }, []);
  

  useEffect(() => {
    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    const email = Cookies.get("email");

    socket.on("documentUploaded", (data) => {
      const newNotification = { 
        message: data.message, 
        documentId: data.documentId,
        email: email // Include email here
      };
    
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: newNotification.message, 
          email: newNotification.email 
        }),
      })
        .then((response) => response.json())
        .then((savedNotification) => {
          setNotifications((prev) => [savedNotification, ...prev]);
        })
        .catch((err) => console.error("Error saving documentUploaded notification:", err));
    });
    

    return () => {
      socket.off("notification");
      socket.off("documentUploaded");
    };
  }, []);

  const handleMarkAsRead = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&  // ✅ Ensure it's not null
        !notificationRef.current.contains(event.target as Node) // ✅ Fix "never" error
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="relative"  ref={notificationRef}>
      <div className="relative cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
        <FaBell className="text-gray-500 text-base sm:text-lg lg:text-xl" />
        {notifications.length > 0 && <span className="absolute top-0 right-0 h-3 w-3 bg-red-600 rounded-full"></span>}
      </div>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            <>
              {notifications.slice(0, 5).map((notification, index) => (
                <div
                  key={notification.documentId || index}
                  className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 border-b flex justify-between items-center"
                >
                  <div>
                    <p>{notification.message}</p>
                    {notification.timestamp && (
                      <small className="text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </small>
                    )}
                  </div>
                  <button
                    className="ml-4 text-blue-500 hover:text-blue-700 text-xs"
                    onClick={() => handleMarkAsRead(index)}
                  >
                    Mark as Read
                  </button>
                </div>
              ))}

              {/* See All Notifications Button */}
              <button
                className="w-full text-center text-blue-900 font-semibold py-2 hover:bg-gray-100 border-t"
                onClick={() => router.push("/notification")}
              >
                See All Notifications
              </button>
            </>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">No new notifications.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
