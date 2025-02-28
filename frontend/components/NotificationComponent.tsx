"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Error fetching notifications:", err));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">All Notifications</h1>

      {notifications.length > 0 ? (
        <ul className="space-y-3">
          {notifications.map((notification, index) => (
            <li key={index} className="p-4 border rounded-lg shadow-sm bg-white">
              <p>{notification.message}</p>
              {notification.timestamp && (
                <small className="text-gray-500">
                  {new Date(notification.timestamp).toLocaleString()}
                </small>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No notifications found.</p>
      )}

      <button
        className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg"
        onClick={() => router.back()}
      >
        Back
      </button>
    </div>
  );
};

export default NotificationsPage;
