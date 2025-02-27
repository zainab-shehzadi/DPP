"use client"; 

import Image from 'next/image';
import { FaUpload, FaFileAlt,FaUser, FaBell } from 'react-icons/fa';
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Dashboard() {
 
  const [selectedFacility, setSelectedFacility] = useState("F-12346");
  const [visibleCount, setVisibleCount] = useState(3); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const [dropdownOpen, setDropdownOpen] = useState(false); 
 const [activeTab, setActiveTab] = useState("POC AI Ally");
 const [selectedDate, setSelectedDate] = useState(new Date());
 const [dropdownOpen1, setDropdownOpen1] = useState(false); 
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleDropdown1 = () => setDropdownOpen1(!dropdownOpen1);

  const facilities = ["F-12349", "F-12346", "F-12388", "F-12648", "F-12448"];
  const router = useRouter();
  const handleShowMore = () => {
    // Show all facilities when the arrow is clicked
    setVisibleCount(facilities.length);
  };
  const handleNavigateToTags = () => {
    router.push("/Tags"); 
  };
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
 const handleCopy = () => {
    navigator.clipboard.writeText("Sample Content"); 
    toast.success("Content copied!"); 
  };

  const handleEdit = () => {
    toast.success("Edit triggered!");
  };
  const handleNavigateToPolicy = () => {
    router.push("/PolicyGenerator"); 
  };
  return (
    <div className="flex flex-col lg:flex-row">
      

      {/* Mobile Toggle Button */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
        <div className="h-12 w-12 bg-cover bg-center" style={{ backgroundImage: "url('/assets/logo-dpp1.png')" }}></div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

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


<div className="flex flex-col lg:flex-row flex-wrap items-start lg:items-center space-y-4 lg:space-y-0 space-x-0 lg:space-x-4 mt-4 lg:mt-8 ml-4 lg:ml-10 justify-between">
  {/* Facility Dropdown */}
  <div className="flex items-center space-x-4 w-full lg:w-auto">
    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-900">
      Facility
    </h3>
    <div className="relative ml-4 sm:ml-6 lg:ml-10">
      <button
        onClick={toggleDropdown}
        className="flex items-center bg-[#244979] text-white font-semibold text-[11px] sm:text-[12px] md:text-[14px] leading-[14px] px-4 py-2 rounded-lg"
      >
        <span className="font-[Plus Jakarta Sans]">Lorem Ipsum</span>
        <svg
          className="w-3 h-3 sm:w-4 sm:h-4 ml-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute mt-2 w-40 sm:w-48 md:w-56 bg-white shadow-lg rounded-lg">
          <a
            href="#"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-200 text-xs sm:text-sm md:text-base"
          >
            Option 1
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-200 text-xs sm:text-sm md:text-base"
          >
            Option 2
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-200 text-xs sm:text-sm md:text-base"
          >
            Option 3
          </a>
        </div>
      )}
    </div>
  </div>

  {/* Tabs */}
  <div className="flex flex-wrap items-center space-x-2 w-full lg:w-auto mt-4 lg:mt-0">
    {facilities.slice(0, visibleCount - 1).map((facility) => (
      <button
        key={facility}
        onClick={() => setSelectedFacility(facility)}
        className={`px-4 py-2 rounded-md text-xs sm:text-sm lg:text-base whitespace-nowrap transition-all duration-150 ${
          selectedFacility === facility
            ? "border-2 border-blue-900 text-black bg-white"
            : "border border-transparent text-gray-500 hover:border-blue-900 hover:text-black"
        }`}
      >
        {facility}
      </button>
    ))}

    {/* Show More */}
    {visibleCount < facilities.length ? (
      <button
        onClick={handleShowMore}
        className="px-4 py-2 text-blue-900 text-xs sm:text-sm lg:text-base"
      >
        &gt;
      </button>
    ) : (
      <button
        key={facilities[visibleCount - 1]}
        onClick={() => setSelectedFacility(facilities[visibleCount - 1])}
        className={`px-4 py-2 rounded-md text-xs sm:text-sm lg:text-base whitespace-nowrap transition-all duration-150 ${
          selectedFacility === facilities[visibleCount - 1]
            ? "border-2 border-blue-900 text-black bg-white"
            : "border border-transparent text-gray-500 hover:border-blue-900 hover:text-black"
        }`}
      >
        {facilities[visibleCount - 1]}
      </button>
    )}
  </div>
  {/* Facility Tabs */}
  <div className="flex flex-col items-center w-50 lg:w-auto mx-auto">
    {/* Tab Buttons */}
    <div className="flex items-center justify-center space-x-4 sm:space-x-6 lg:space-x-8">
      <button
        onClick={() => setActiveTab("POC AI Ally")}
        className={`pb-2 ${
          activeTab === "POC AI Ally"
            ? "text-blue-900 font-semibold"
            : "text-gray-700 font-medium"
        } text-xs sm:text-sm md:text-base lg:text-lg`}
      >
        POC AI Ally
      </button>

      <button
        onClick={() => setActiveTab("Tags")}
        className={`pb-2 ${
          activeTab === "Tags"
            ? "text-blue-900 font-semibold"
            : "text-gray-700 font-medium"
        } text-xs sm:text-sm md:text-base lg:text-lg`}
      >
        Tags
      </button>
    </div>

    {/* Progress Bar */}
    <div className="relative w-full mt-2">
      {/* Gray Background Line */}
      <div className="absolute h-[3px] w-full bg-gray-300 rounded-full"></div>
      {/* Active Blue Line */}
      {activeTab === "POC AI Ally" && (
        <div
          className="absolute h-[3px] bg-blue-900 rounded-full transition-all duration-300"
          style={{ width: "50%" }}
        ></div>
      )}
      {activeTab === "Tags" && (
        <div
          className="absolute h-[3px] bg-blue-900 rounded-full transition-all duration-300"
          style={{ width: "50%", left: "50%" }}
        ></div>
      )}
    </div>
  </div>
  {/* Date */}
  <div className="relative flex items-center space-x-2 w-full lg:w-auto mt-4 lg:mt-0">
    <button
      onClick={toggleDropdown1}
      className="flex items-center bg-[#244979] text-white px-4 py-2 rounded-lg shadow-md text-xs sm:text-sm md:text-base font-semibold space-x-2"
    >
      <svg
        className="w-4 h-4 sm:w-5 sm:h-5"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M3 8h18M21 5h-3V3a1 1 0 00-2 0v2H8V3a1 1 0 00-2 0v2H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V6a1 1 0 00-1-1zm0 4H3v10h18V9z"></path>
      </svg>
      <span>{selectedDate.toLocaleDateString("en-GB")}</span>
      <svg
        className="w-4 h-4 sm:w-5 sm:h-5"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        ></path>
      </svg>
    </button>

    {dropdownOpen1 && (
      <div className="absolute top-12 left-[-30%] md:left-[-50%] z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-[250px] sm:w-[300px] lg:w-[350px]">
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => {
            if (date) {
              setSelectedDate(date);
            }
            setDropdownOpen1(false);
          }}
          inline
        />
      </div>
    )}
  </div>
</div>


<div className="w-full border-t border-gray-300 mt-4" style={{ borderColor: '#E0E0E0' }}></div>

<div className="flex flex-col lg:flex-row justify-center mt-4 lg:mt-8 space-y-4 lg:space-y-0 lg:space-x-4">
  
  {/* Left Container */}
  <div
  className="bg-white shadow-lg p-4 sm:p-6 flex flex-col justify-between w-full lg:w-[600px] h-auto rounded-lg border border-[#E0E0E0] mx-auto"
>
  <div>
    <h4 className="font-bold text-blue-900 text-lg mb-4">Tags</h4>

    {/* Tag Button */}
    <button
      className="flex justify-between items-center w-full max-w-[190px] h-[40px] px-4 rounded-lg text-sm sm:text-base mb-2"
      style={{ backgroundColor: '#CCE2FF', borderRadius: '12px' }}
    >
      <span>F-12347</span>
      <span className="text-gray-500">⋮</span>
    </button>

    <div
      className="mt-4 text-[14px] leading-[17.64px] font-light"
      style={{ color: '#33343E', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      <p>F-12347 defines dolor sit amet consectetur. Tortor enim id phasellus ac amet quam integer.</p>
      <p>Id maecenas tortor tristique vel pretium eget. Sed commodo varius mauris mi consequat ac tincidunt facilisis vel.</p>
    </div>
  </div>
  <button
        onClick={handleNavigateToPolicy}
        className="flex items-center justify-center bg-[#002F6C] text-white w-[200px] h-[40px] rounded-lg text-sm shadow-md transition-colors duration-300"
      >
        <FaFileAlt className="mr-2" />
        <span>Generate Policy</span>
      </button>
</div>


  {/* Center Container */}
  <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
    <div>
    <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55] mb-3 lg:mb-12">F-12347</h4>
      <p
        className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Lorem ipsum dolor sit amet consectetur. Tortor enim id phasellus ac amet quam integer. Id maecenas tortor tristique vel pretium eget. Sed commodo varius mauris mi consequat ac tincidunt facilisis vel.
        Senectus duis pulvinar sed mauris ornare elit sed neque. Eu leo bibendum molestie congue fusce consequat eu volutpat enim. Pharetra egestas arcu morbi augue. Id pellentesque lectus velit nibh amet lacus risus a commodo. Vitae nibh eget euismod purus orci. Lacus ac velit morbi pellentesque. Iaculis pellentesque risus sagittis vivamus.
        Tempus amet morbi et tellus feugiat a feugiat elit dui. Arcu euismod nibh auctor eu gravida. Risus non cras
      </p>

    
    </div>
   
  </div>

  {/* Right Container */}
  <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
  <div className="flex items-center justify-between mb-8">
  {/* Heading */}
  <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#002F6C]">
    Plan Of Correction
  </h4>

  {/* Action Buttons */}
  <div className="flex space-x-4">
    {/* Copy Icon */}
    <button
  onClick={handleCopy}
  className="text-blue-800 hover:text-blue-600 transition-colors"
>
<Image
  src="/assets/Group.png" // Replace with the correct path to your image
  alt="Edit Icon"
  width={24} // Set the required width
  height={24} // Set the required height
  className="w-6 h-6"
/>


</button>

    {/* Edit Icon */}
  <button
  onClick={handleEdit}
  className="text-blue-800 hover:text-blue-600 transition-colors"
>
  <Image
    src="/assets/tabler_copy.png" // Replace with the correct path to your image
    alt="Edit Icon"
    className="w-6 h-6"
    width={24} // Set the required width
    height={24} // Set the required height
  />
</button>

  </div>
</div>

{/* Paragraphs */}
<div className="mb-8">
<p
        className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Lorem ipsum dolor sit amet consectetur. Tortor enim id phasellus ac amet quam integer. Id maecenas tortor tristique vel pretium eget. Sed commodo varius mauris mi consequat ac tincidunt facilisis vel.
        Senectus duis pulvinar sed mauris ornare elit sed neque. Eu leo bibendum molestie congue fusce consequat eu volutpat enim. Pharetra egestas arcu morbi augue. Id pellentesque lectus velit nibh amet lacus risus a commodo. Vitae nibh eget euismod purus orci. Lacus ac velit morbi pellentesque. Iaculis pellentesque risus sagittis vivamus.
        Tempus amet morbi et tellus feugiat a feugiat elit dui. Arcu euismod nibh auctor eu gravida. Risus non cras
      </p>

      <p
        className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E]"
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

{/* Bottom Buttons */}
<div className="flex justify-end space-x-4 mt-4">
    <button className="flex items-center justify-center border border-[#002F6C] text-[#002F6C] px-4 py-2 rounded-lg text-sm shadow-md transition-colors duration-300 hover:bg-gray-100">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-4 h-4 mr-2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10l4.553 4.553-4.553 4.553m-6-9L4.447 14.553 9 19"
        />
      </svg>
      Assign Tasks
    </button>
    <button
            onClick={handleNavigateToTags}
            className="flex items-center justify-center bg-[#002F6C] text-white px-4 py-2 rounded-lg text-sm shadow-md transition-colors duration-300"
          >
            Approve
          </button>
</div>
      </div>
    </div>
  );
}
