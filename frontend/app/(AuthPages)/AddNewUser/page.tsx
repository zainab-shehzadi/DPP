"use client"; // <-- Add this line to mark this file as a client component

import Image from 'next/image';
import { FaBell } from 'react-icons/fa';
import React, { useState ,useEffect} from "react";

import Link from "next/link"; // Correct import for Link
import Sidebar from "@/components/Sidebar";

// Define the User interface
interface User {
  _id: string;
  createdAt: string;
  firstname: string;
  email: string;
}

const Dashboard = () => {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [users, setUser] = useState<User[]>([]);

  
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/User123`) // Replace 'User123' with a valid user ID from your database
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched User Data:', data); // Log the fetched data
        setUser(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      
    
       {/* Mobile Toggle Button */}
       <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
        <div className="h-12 w-12 bg-cover bg-center" style={{ backgroundImage: "url('/assets/logo.avif')" }}></div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />


      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Hello, <span className="text-blue-900">User</span>
          </h2>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <FaBell className="text-gray-500 text-lg" />
            <div className="flex items-center border border-gray-300 p-2 rounded-md space-x-2">
              <Image src="/assets/image.png" width={40} height={40} className="rounded-full" alt="User Profile" />
              <span className="text-gray-800">User</span>
            </div>
          </div>
        </header>

        {/* Date Display */}
        <div className="flex justify-end pr-4 sm:pr-12 lg:pr-48 mb-4">
          <div className="border-2 border-black px-5 py-3 rounded-lg shadow-md text-sm bg-white">
            <span className="text-black">30 November 2024</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-3/4 h-6 sm:h-12 lg:h-20 bg-[#002F6C] mt-2 rounded-lg mx-auto mb-8"></div>

        {/* Add User Section */}
        <div className="w-full sm:w-3/4 mx-auto text-center mb-10">
          <h3  className="font-bold text-black-800 opacity-80 text-2xl sm:text-3xl lg:text-4xl"
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        Add User
          </h3>
          <p className="text-gray-900 text-sm sm:text-base lg:text-lg leading-[25.2px] opacity-40 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Click the button below to Add User
          </p>
          <Link href="/AddUser">
          <button
 className="w-full bg-[#002F6C] text-white px-4 py-3 rounded-lg sm:rounded-md text-sm sm:text-base font-semibold"
 style={{ width: '298px', height: '53px', borderRadius: '7.49px' }}
>
 Add User
</button>

          </Link>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto mx-auto max-w-[1130px]">
      <table className="min-w-full text-left border-collapse border border-[#F2F2F2]">
        <thead>
          <tr className="bg-gray-100 text-black border-b border-[#F2F2F2]">
            <th className="px-6 py-6 text-left font-semibold">Select</th>
            <th className="px-6 py-6 text-left font-semibold">User ID</th>
            <th className="px-6 py-4 text-left font-semibold">Date</th>
            <th className="px-6 py-4 text-left font-semibold">User Name</th>
            <th className="px-6 py-4 text-left font-semibold">Email Address</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} className="hover:bg-gray-100 border-b border-[#F2F2F2] text-gray-900">
              <td className="py-5 px-8">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
              </td>
              <td className="py-4 px-6 text-blue-700 font-medium">#{user._id}</td>
              <td className="py-4 px-6 text-gray-500">{user.createdAt}</td>
              <td className="py-4 px-6 text-gray-500">{user.firstname}</td>
              <td className="py-4 px-6 text-gray-500">{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      </div>
    </div>
  );
}

export default Dashboard;
