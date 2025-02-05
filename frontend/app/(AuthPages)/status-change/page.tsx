"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from "js-cookie";
const StatusChange = () => {
  const searchParams = useSearchParams(); // Get search params from URL
  const email1 = searchParams.get('email');
  const status = searchParams.get('status'); // Extract 'status' param
  const [email, setEmail] = useState<string | null>(null); // Email from cookies
  const [message, setMessage] = useState('');

  // Helper function to get cookies
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`); 
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  useEffect(() => {
    // Retrieve email from cookies on component mount
    const storedEmail = Cookies.get("email");
    console.log(storedEmail);
    if (storedEmail) {
      setEmail(storedEmail); // Set email state if found in cookies
    }
  }, []);

  useEffect(() => {
    if (status === 'approve') {
      setMessage(`The facility for the following email has been successfully approved:`);
    } else if (status === 'reject') {
      setMessage(`The facility for the following email has been rejected:`);
    }
    
    // Call API to update the status and send email only when status and email are available
    const updateStatus = async () => {
      if (status && email) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/status-update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, email }),
          });
          
          const data = await response.json();
          if (data.success) {
            console.log('Status updated and email sent successfully.');
          } else {
            console.error('Failed to update status and send email:', data.message);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };

    updateStatus();
  }, [status, email]); // Only run when status or email changes

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Status Change</h1>
        <p className="text-md font-semibold text-gray-700 mb-2">
          <span className="font-bold">Email:</span> <span className="text-blue-600">{email1}</span>
        </p>
        <p className="text-md font-semibold text-gray-700">
          <span className="font-bold">Status:</span> <span className={`text-${status === 'approve' ? 'green' : 'red'}-600`}>{status}</span>
        </p>
      </div>
    </div>
  );
};

export default StatusChange;
