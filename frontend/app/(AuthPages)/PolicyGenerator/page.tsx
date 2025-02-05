"use client"; // <-- Add this line to mark this file as a client component

import Image from 'next/image';
import {  FaUpload,  FaFileAlt,  FaUser,  FaBell } from 'react-icons/fa';
import React, { useState } from "react";

import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
 
  const [selectedFacility, setSelectedFacility] = useState("F-12346");
  const [visibleCount, setVisibleCount] = useState(3); // Number of facilities shown by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const facilities = ["F-12349", "F-12346", "F-12388", "F-12648", "F-12448"];
  
  const handleShowMore = () => {
    // Show all facilities when the arrow is clicked
    setVisibleCount(facilities.length);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col lg:flex-row">
      
      {/* Mobile Toggle Button */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
        <div className="h-12 w-12 bg-cover bg-center" style={{ backgroundImage: "url('/assets/logo.avif')" }}></div>
      </div>

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
      <header className="flex items-center justify-between mb-6 w-full flex-wrap">
  {/* Left Side: "Hello, User" */}
  <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
    Hello, <span className="text-blue-900">User</span>
  </h2>
  
  {/* Right Side: Notification Icon and Profile */}
  <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
    {/* Notification Icon */}
    <FaBell className="text-gray-500 text-base sm:text-lg lg:text-xl" />

    {/* Profile Picture and Username */}
    <div className="flex items-center border border-gray-300 p-1 sm:p-2 rounded-md space-x-2">
      <Image
        src="/assets/image.png"
        width={28}        // Smaller size for mobile screens
        height={28}       // Smaller size for mobile screens
        className="rounded-full sm:w-10 sm:h-10 lg:w-12 lg:h-12" // Adjust size for larger screens
        alt="User Profile"
      />
      <span className="text-gray-800 text-sm sm:text-base lg:text-lg">User</span>
    </div>
  </div>
</header>


        {/* Facility Tabs */}
        <div className="flex items-center space-x-2 overflow-auto w-full">
  <h3 className="text-xl font-bold text-blue-900">Facility</h3>

  {/* Display only `visibleCount` items initially */}
  <div className="flex space-x-2 overflow-auto">
    {facilities.slice(0, visibleCount).map((facility) => (
      <button
        key={facility}
        onClick={() => setSelectedFacility(facility)}
        className={`px-4 py-2 rounded-md transition-all duration-150 text-xs sm:text-sm lg:text-base whitespace-nowrap ${
          selectedFacility === facility
            ? "border-2 border-dark-blue text-gray-800"
            : "text-gray-500"
        } hover:border-2 hover:border-dark-blue hover:bg-white`}
      >
        {facility}
      </button>
    ))}
  </div>

  {/* Show the arrow button only if there are more items to display */}
  {visibleCount < facilities.length && (
    <button onClick={handleShowMore} className="px-2">
      <span className="text-blue-900">➔</span>
    </button>
  )}

  {/* Upload Button aligned to the right */}
  <button className="flex items-center bg-blue-900 text-white px-4 py-2 sm:px-6 sm:py-3 border border-blue-900 rounded-lg text-xs sm:text-sm md:text-base shadow-md transition-colors duration-300 ml-auto">
    <FaUpload className="mr-2" />
    <span>Upload PDF</span>
  </button>
</div>


        <div className="w-full border-t border-gray-300 mt-4" style={{ borderColor: '#E0E0E0' }}></div>

        
        <div className="flex flex-col md:flex-row justify-center mt-4 md:mt-8 space-y-4 md:space-y-0 md:space-x-4">
  {/* Left Container */}
  <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full max-w-full md:max-w-md lg:max-w-lg xl:max-w-3xl h-auto flex flex-col justify-between">
    <div>
      <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55] mb-4 lg:mb-12">F-12347</h4>
      <p
        className="text-sm sm:text-base lg:text-lg font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Lorem ipsum dolor sit amet consectetur. Tortor enim id phasellus ac amet quam integer. Id maecenas tortor tristique vel pretium eget. Sed commodo varius mauris mi consequat ac tincidunt facilisis vel.
        Senectus duis pulvinar sed mauris ornare elit sed neque. Eu leo bibendum molestie congue fusce consequat eu volutpat enim. Pharetra egestas arcu morbi augue. Id pellentesque lectus velit nibh amet lacus risus a commodo. Vitae nibh eget euismod purus orci. Lacus ac velit morbi pellentesque. Iaculis pellentesque risus sagittis vivamus.
        Tempus amet morbi et tellus feugiat a feugiat elit dui. Arcu euismod nibh auctor eu gravida. Risus non cras
      </p>

      <p
        className="text-sm sm:text-base lg:text-lg font-light leading-relaxed text-[#33343E]"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Lorem ipsum dolor sit amet consectetur. Tortor enim id phasellus ac amet quam integer. Id maecenas tortor tristique vel pretium eget. Sed commodo varius mauris mi consequat ac tincidunt facilisis vel.
        Senectus duis pulvinar sed mauris ornare elit sed neque. Eu leo bibendum molestie congue fusce consequat eu volutpat
      </p>
    </div>
    <button className="bg-blue-900 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg self-end mt-4 text-xs sm:text-sm lg:text-base">Generate Policy</button>
  </div>

  {/* Right Container */}
  <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full max-w-full md:max-w-md lg:max-w-lg xl:max-w-3xl h-auto flex flex-col justify-between">
    <div>
      <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#002F6C] mb-4 lg:mb-12">Policy</h4>
      <p
        className="text-sm sm:text-base lg:text-lg font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Lorem ipsum dolor sit amet consectetur. Tortor enim id phasellus ac amet quam integer. Id maecenas tortor tristique vel pretium eget. Sed commodo varius mauris mi consequat ac tincidunt facilisis vel.
        Senectus duis pulvinar sed mauris ornare elit sed neque. Eu leo bibendum molestie congue fusce consequat eu volutpat enim. Pharetra egestas arcu morbi augue. Id pellentesque lectus velit nibh amet lacus risus a commodo. Vitae nibh eget euismod purus orci. Lacus ac velit morbi pellentesque. Iaculis pellentesque risus sagittis vivamus.
        Tempus amet morbi et tellus feugiat a feugiat elit dui. Arcu euismod nibh auctor eu gravida. Risus non cras
      </p>

      <p
        className="text-sm sm:text-base lg:text-lg font-light leading-relaxed text-[#33343E]"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Lorem ipsum dolor sit amet consectetur. Tortor enim id phasellus ac amet quam integer. Id maecenas tortor tristique vel pretium eget. Sed commodo varius mauris mi consequat ac tincidunt facilisis vel.
        Senectus duis pulvinar sed mauris ornare elit sed neque. Eu leo bibendum molestie congue fusce consequat eu volutpat
      </p>
    </div>
    <div className="flex space-x-3 sm:space-x-5 mt-4 lg:mt-8">
      <button className="text-[#002F6C] hover:text-blue-900 text-sm sm:text-base"><FaFileAlt /></button>
      <button className="text-[#002F6C] hover:text-blue-900 text-sm sm:text-base"><FaUpload /></button>
      <button className="text-[#002F6C] hover:text-blue-900 text-sm sm:text-base"><FaUser /></button>
    </div>
  </div>
</div>

      </div>
    </div>
  );
}
