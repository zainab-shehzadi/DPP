"use client";

import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import io from "socket.io-client";
import Cookies from "js-cookie";

const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL as string, {
  transports: ["websocket"],
});

const NotificationIcon = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
  
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications`;
    console.log("Fetching notifications from:", apiUrl); 

    fetch(apiUrl)
      .then((response) => {
        console.log("Response Status:", response.status); 
        return response.json();
      })
      .then((data) => {
        console.log("Fetched Notifications:", data); 
        setNotifications(data);
      })
      .catch((err) => console.error("Error fetching notifications:", err));
  }, []);

  useEffect(() => {
    // Listen for general notification events
    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    const email = Cookies.get("email");

    socket.on("documentUploaded", (data) => {
      const newNotification = {
        message: data.message,
        documentName: data.documentName,
        documentId: data.documentId,
      };

      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newNotification.message,
        }),
      })
        .then((response) => response.json())
        .then((savedNotification) => {
          setNotifications((prev) => [savedNotification, ...prev]);
        })
        .catch((err) =>
          console.error("Error saving documentUploaded notification:", err)
        );
    });

    socket.on("solutionGenerated", (data) => {
      const newNotification = {
        message: data.message,
        solution: data.solution,
      };

      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newNotification.message,
          email,
        }),
      })
        .then((response) => response.json())
        .then((savedNotification) => {
          setNotifications((prev) => [savedNotification, ...prev]);
        })
        .catch((err) =>
          console.error("Error saving solutionGenerated notification:", err)
        );
    });

    socket.on("taskGenerated", (data) => {
      const newNotification = {
        message: data.message,
        task: data.task,
      };

      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newNotification.message }),
      })
        .then((response) => response.json())
        .then((savedNotification) => {
          setNotifications((prev) => [savedNotification, ...prev]);
        })
        .catch((err) =>
          console.error("Error saving taskGenerated notification:", err)
        );
    });

    return () => {
      socket.off("notification");
      socket.off("documentUploaded");
      socket.off("solutionGenerated");
      socket.off("taskGenerated");
    };
  }, []);

  const handleMarkAsRead = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative">
      <div
        className="relative cursor-pointer"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <FaBell className="text-gray-500 text-base sm:text-lg lg:text-xl" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-3 w-3 bg-red-600 rounded-full"></span>
        )}
      </div>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
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
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No new notifications.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
