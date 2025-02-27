"use client"; // <-- Add this line to mark this file as a client component

import Image from 'next/image';
import { FaTachometerAlt, FaHome, FaRobot, FaUpload, FaUserPlus, FaFileAlt, FaCog, FaUser, FaBuilding, FaCreditCard, FaBell } from 'react-icons/fa';
import React, { useState } from "react";


export default function Dashboard() {
  const [isEditing, setIsEditing] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleDashboardClick = () => {
    setDashboardOpen(!dashboardOpen);
    setSettingsOpen(false);
  };

  const handleSettingsClick = () => {
    setSettingsOpen(!settingsOpen);
    setDashboardOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
  
     
      <nav className="bg-[#002F6C] text-white w-full lg:w-64 flex flex-col items-center px-4 py-8 lg:fixed lg:h-full">
        <div className="mb-8 w-full h-24 bg-cover bg-center" style={{ backgroundImage: "url('/assets/logo-dpp1.png')" }}></div>
        <ul className="space-y-5 w-full flex flex-col items-center">
          <li className="w-full">
            <a
              href="#"
              onClick={handleDashboardClick}
              className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-center text-medium leading-6"
            >
              <FaTachometerAlt className="mr-2" />
              Dashboard
            </a>
            {dashboardOpen && (
              <ul className="ml-4 space-y-4">
                <li>
                  <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
                    <FaUser className="mr-2" />
                    Upload New 2567
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
                    <FaBuilding className="mr-2" />
                    History
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
                    <FaUser className="mr-2" />
                    Task Assigned
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
                    <FaCreditCard className="mr-2" />
                    Calendar
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
                    <FaCreditCard className="mr-2" />
                    Insights
                  </a>
                </li>
              </ul>
            )}
          </li>
          <li className="w-full">
            <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
              <FaHome className="mr-2" />
              Homepage
            </a>
          </li>
          <li className="w-full">
            <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
              <FaRobot className="mr-2" />
              POC AI
            </a>
          </li>
          <li className="w-full">
            <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
              <FaUpload className="mr-2" />
              Upload Document
            </a>
          </li>
          <li className="w-full">
            <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
              <FaUserPlus className="mr-2" />
              Add New User
            </a>
          </li>
          <li className="w-full">
            <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
              <FaFileAlt className="mr-2" />
              Daily Summaries
            </a>
          </li>
          <li className="w-full">
            <a
              href="#"
              onClick={handleSettingsClick}
              className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6"
            >
              <FaCog className="mr-2" />
              Settings
            </a>
            {settingsOpen && (
              <ul className="ml-4 space-y-4">
                <li>
                  <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
                    <FaUser className="mr-2" />
                    Profile Settings
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
                    <FaBuilding className="mr-2" />
                    Facility Settings
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
                    <FaUser className="mr-2" />
                    User Settings
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center py-2 px-4 hover:bg-white hover:text-blue-900 rounded-md font-poppins font-bold text-medium leading-6">
                    <FaCreditCard className="mr-2" />
                    Billing
                  </a>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Hello, <span className="text-blue-900">User</span>
          </h2>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <FaBell className="text-gray-500 text-lg" />
            <div className="flex items-center border border-gray-300 p-2 rounded-md space-x-2">
              <Image
                src="/assets/image.png" // Replace with your own image path
                width={40}
                height={40}
                className="rounded-full"
                alt="User Profile"
              />
              <span className="text-gray-800">User</span>
            </div>
          </div>
        </header>
        
        {/* Date Display */}
        <div className="flex justify-end pr-12 sm:pr-48 mb-4">
          <div className="border-2 border-black px-5 py-3 rounded-lg shadow-md text-sm bg-white">
            <span className="text-black">30 November 2024</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-3/4 h-12 sm:h-20 bg-[#002F6C] mt-2 rounded-lg mx-auto"></div>

        {/* User Information Section */}
        <div className="w-full sm:w-3/4 mx-auto mt-8">
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row items-center mb-6">
              <Image
                src="/assets/user.png" // Replace with your own image path
                width={100}
                height={100}
                className="rounded-full"
                alt="Profile Picture"
              />
              <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
                <h3 className="text-xl font-bold">Alexa Rawles</h3>
                <p className="text-gray-500">alexarawles@gmail.com</p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-auto">
                <button
                  className="bg-blue-900 text-white px-6 py-2 rounded-md"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700">Full Name</label>
                <input type="text" placeholder="Your First Name" className="mt-2 w-full h-[49px] p-2 rounded-[7.5px] bg-[#F9F9F9]" />
              </div>
              <div>
                <label className="block text-gray-700">Last Name</label>
                <input type="text" placeholder="Your Last Name" className="mt-2 w-full h-[49px] p-2 rounded-[7.5px] bg-[#F9F9F9]" />
              </div>
              <div>
                <label className="block text-gray-700">Gender</label>
                <select className="mt-2 w-full h-[49px] p-2 rounded-[7.5px] bg-[#F9F9F9] text-gray-700">
                  <option value="" className="text-gray-400">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Facility Name</label>
                <select className="mt-2 w-full h-[49px] p-2 rounded-[7.5px] bg-[#F9F9F9] text-gray-700">
                  <option value="">Select Facility Name</option>
                  <option value="facility1">Facility One</option>
                  <option value="facility2">Facility Two</option>
                  <option value="facility3">Facility Three</option>
                  <option value="facility4">Facility Four</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700">No Of Beds</label>
                <select className="mt-2 w-full h-[49px] p-2 rounded-[7.5px] bg-[#F9F9F9] text-gray-700">
                  <option value="">Select Number of Beds</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Facility Address</label>
                <select className="mt-2 w-full h-[49px] p-2 rounded-[7.5px] bg-[#F9F9F9] text-gray-700">
                  <option value="">Select Facility Address</option>
                  <option value="address1">123 Main St, City</option>
                  <option value="address2">456 Elm St, City</option>
                  <option value="address3">789 Oak St, City</option>
                  <option value="address4">101 Pine St, City</option>
                </select>
              </div>
            </div>

            {/* Email and Document Upload Section */}
            <div className="mt-6">
              <h4 className="font-bold text-gray-700">My Email Address</h4>
              <div className="flex items-center mt-2">
                <Image src="/assets/sms.jpg" width={30} height={30} alt="Email Icon" />
                <p className="ml-2 text-gray-500">alexarawles@gmail.com</p>
              </div>

              <h4 className="mt-6 font-bold text-gray-700">Add Documents (Optional)</h4>
              <div className="mt-2 w-full h-40 rounded-3xl flex flex-col justify-center items-center text-gray-500 bg-[#F9F9F9] border border-[#E0E0E0]">
                <Image src="/assets/vector.png" width={40} height={40} alt="Upload Icon" />
                <p className="mt-2">
                  Drag and drop file here or <span className="text-[#002F6C] font-semibold">browse file</span>
                </p>
              </div>
            </div>

            {/* Done Button */}
            <div className="mt-6 text-center">
              <button className="bg-blue-900 text-white px-8 py-2 rounded-md">Done</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
