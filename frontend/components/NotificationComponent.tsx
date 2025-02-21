"use client"
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL);

const NotificationComponent: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [message, setMessage] = useState('');

useEffect(() => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications`; // Corrected Template Literal

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched Notifications:", data);
      setNotifications(data);
    })
    .catch(async (err) => {
      console.error("Error fetching notifications:", err);
      try {
        const textResponse = await fetch(apiUrl).then((res) => res.text());
        console.log("Raw Response (Not JSON):", textResponse);
      } catch (error) {
        console.error("Error fetching raw response:", error);
      }
    });
}, []);


  // Listen for new notifications
  useEffect(() => {
    socket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('notification');
    };
  }, []);

  // Handle notification creation
  const handleSendNotification = async () => {
    if (!message.trim()) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    setMessage('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>In-App Notifications</h2>
      <div>
        <input
          type="text"
          placeholder="Enter notification message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleSendNotification}>Send Notification</button>
      </div>

      <ul style={{ marginTop: '20px', listStyle: 'none', padding: 0 }}>
        {notifications.map((notification, index) => (
          <li
            key={notification._id || index}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              marginBottom: '10px',
              borderRadius: '5px',
            }}
          >
            {notification.message}
            <br />
            <small>{new Date(notification.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationComponent;
