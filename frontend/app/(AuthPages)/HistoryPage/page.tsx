"use client"; // <-- Ensures this file is treated as a client component

import Image from 'next/image';
import { FaBell } from 'react-icons/fa';
import React, { useState,useEffect } from "react";

import Sidebar from "@/components/Sidebar";




export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [facilities, setFacilities] = useState<string[]>([]); // Explicitly set the type to string[]
  const [email, setEmail] = useState<string | null>(null); // Email from localStorage

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
 

    // Helper function to get cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };
  
    useEffect(() => {
      // Retrieve email from cookies on component mount
      const storedEmail = getCookie("email");
      if (storedEmail) {
        setEmail(storedEmail); // Set the email state if found in cookies
      }
    }, []);
  useEffect(() => {
    const fetchFacilities = async () => {
      if (!email) {
        setFacilities([]); // Set facilities to an empty array if email is missing
        return;
      }
  
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tags1?email=${encodeURIComponent(email)}`
        );
  
        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("Fetched facilities for email:", data);
  
          if (Array.isArray(data)) {
            setFacilities(data); // Set facilities if data is an array
          } else {
            console.error("Fetched data is not an array:", data);
            setFacilities([]); // Fallback to an empty array
          }
        } else {
          console.error("Unexpected response format or server error:", response.statusText);
          setFacilities([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
        setFacilities([]); // Fallback to an empty array
      }
    };
  
    fetchFacilities();
  }, [email]);

  return (
    <div className="flex flex-col lg:flex-row">
   

      {/* Mobile Toggle Button */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
        <div className="h-12 w-12 bg-cover bg-center" style={{ backgroundImage: "url('/assets/logo.avif')" }}></div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex items-center justify-between mb-6 w-full flex-wrap">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
            Hello, <span className="text-blue-900">User</span>
          </h2>
          
          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
            <FaBell className="text-gray-500 text-base sm:text-lg lg:text-xl" />
            <div className="flex items-center border border-gray-300 p-1 sm:p-2 rounded-md space-x-2">
              <Image
                src="/assets/image.png"
                width={28}
                height={28}
                className="rounded-full sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                alt="User Profile"
              />
              <span className="text-gray-800 text-sm sm:text-base lg:text-lg">User</span>
            </div>
          </div>
        </header>

        {/* Facility Dropdown and Tabs Container */}
        <div className="flex items-center space-x-4 mt-4 lg:mt-8 ml-4 lg:ml-10 justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-900">Facility</h3>
            <div className="relative ml-4 sm:ml-6 lg:ml-10">
              <button 
                onClick={toggleDropdown} 
                className="flex items-center bg-blue-900 text-white font-semibold text-[11px] leading-[14px] px-4 py-2 rounded-lg"
              >
                <span className="font-[Plus Jakarta Sans]">Lorem Ipsum</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a 1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg">
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200 text-sm sm:text-base md:text-lg">Option 1</a>
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200 text-sm sm:text-base md:text-lg">Option 2</a>
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200 text-sm sm:text-base md:text-lg">Option 3</a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full border-t border-gray-300 mt-4" style={{ borderColor: '#E0E0E0' }}></div>


{/* Task Detail Container */}
<div
  className="bg-white p-6 rounded-lg shadow-md mx-auto mt-8 sm:mt-10 w-full max-w-[1400px]"
  style={{
    borderRadius: '16px',
    border: '1px solid #E0E0E0',
  }}
>
<div
  className="grid gap-6 justify-items-center sm:justify-items-start p-4"
  style={{
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', // Responsive columns with minimum width
  }}
>
  {facilities.map((facility, index) => (
    <div
      key={index}
      className="flex items-center justify-between p-4 bg-white rounded-[15px] shadow-md border border-gray-200"
      style={{
        width: '100%',
        height: '100px',
      }}
    >
      {/* Icon and Text */}
      <div className="flex items-center justify-center space-x-2">
        <Image
          src="/assets/doc.png"
          alt="File Icon"
          layout="intrinsic" // Automatically adjusts based on the image's natural dimensions
          width={32}
          height={32}
        />
        <span
          className="font-bold text-[16px] sm:text-[20px] md:text-[24px] leading-[22px] sm:leading-[26px] md:leading-[30.24px]"
          style={{
            color: '#494D55',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          {facility} {/* Dynamically rendering facility name */}
        </span>
      </div>

      {/* Menu Icon */}
      <button className="text-black">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="5"
          height="20"
          viewBox="0 0 5 20"
          fill="currentColor"
        >
          <circle cx="2.5" cy="3" r="1.5" /> {/* Top dot */}
          <circle cx="2.5" cy="10" r="1.5" /> {/* Middle dot */}
          <circle cx="2.5" cy="17" r="1.5" /> {/* Bottom dot */}
        </svg>
      </button>
    </div>
  ))}
</div>


</div>




     
      </div>
    </div>
  );
}
