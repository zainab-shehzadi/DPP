"use client"; 

import Image from 'next/image';
import React, { useState ,useEffect} from "react";
import axios from 'axios';
import Link from "next/link"; 
import Sidebar from "@/components/Admin-sidebar";
import authProtectedRoutes from '@/hoc/authProtectedRoutes';
import DateDisplay from '@/components/date';

interface User {
  _id: string;
  createdAt: string;
  firstname: string;
  email: string;
}

const Adduser = () => {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [users, setUser] = useState<User[]>([]);

useEffect(() => {
  axios.get("https://dpp-backend.vercel.app/api/users/User123")
    .then(response => {
      console.log('Fetched User Data:', response.data);
      setUser(response.data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}, []);
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      
    
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
  <img src="/assets/logo-dpp1.png" alt="Logo" className="h-8 w-auto" />
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
            <div className="flex items-center border border-gray-300 p-2 rounded-md space-x-2">
              <Image src="/assets/image.png" width={40} height={40} className="rounded-full" alt="User Profile" />
              <span className="text-gray-800">User</span>
            </div>
          </div>
        </header>

        {/* Date Display */}
        <div className="flex justify-end pr-4 sm:pr-12 lg:pr-48 mb-4"><DateDisplay/></div>

        {/* Progress Bar */}
        <div className="w-full sm:w-3/4 h-6 sm:h-12 lg:h-10 bg-[#002F6C] mt-2 rounded-lg mx-auto mb-8"></div>

        {/* Add User Section */}
        <div className="w-full sm:w-3/4 mx-auto text-center mb-10">
          <h3  className="font-bold text-black-800 opacity-80 text-2xl sm:text-2xl lg:text-3xl"
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        Add User
          </h3>
          <p className="text-gray-900 text-sm sm:text-base lg:text-md leading-[25.2px] opacity-40 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
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
            
            <th className="px-6 py-6 text-left font-sm font-semibold">User ID</th>
            <th className="px-6 py-4 text-left font-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left  font-sm font-semibold">User Name</th>
            <th className="px-6 py-4 text-left font-sm font-semibold">Email Address</th>
          </tr>
        </thead>
        <tbody>
  {[...new Map(users.map(user => [user._id, user])).values()] // Remove duplicates
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort in descending order
    .map((user, index) => (
      <tr key={user._id} className="hover:bg-gray-100 border-b border-[#F2F2F2] text-gray-900">
        
        <td className="py-4 px-6 text-blue-700 font-sm">#{user._id}</td>
        <td className="py-4 px-6 text-gray-500 font-sm">{user.createdAt}</td>
        <td className="py-4 px-6 text-gray-500 font-sm">{user.firstname}</td>
        <td className="py-4 px-6 text-gray-500 font-sm">{user.email}</td>
      </tr>
    ))}
</tbody>

      </table>
    </div>
      </div>
    </div>
  );
}

export default Adduser;
