"use client"; // <-- Add this line to mark this file as a client component

import Image from 'next/image';
import { FaBell } from 'react-icons/fa';
import React, { useState, useEffect } from "react";

import Sidebar from "@/components/Sidebar";
interface Facility {
  tag?: string;
  solution?: string;
}
export default function Dashboard() {


  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown state
  const [dropdownOpen1, setDropdownOpen1] = useState(false); // Dropdown state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tag, setTags] = useState<string[]>([]);
  const [solution, setSolutions] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [email, setEmail] = useState<string | null>(null); // Email from localStorage
  const [selectedTag, setSelectedTag] = useState<string>(""); // Track selected tag
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [noOfBeds, setNoOfBeds] = useState("");


  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  const toggleDropdown1 = () => {
    setDropdownOpen1(!dropdownOpen1);
  };

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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tags2?email=${encodeURIComponent(email)}`
        );

        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
          const data: any = await response.json();
          console.log("Fetched facilities for email:", data);

          if (Array.isArray(data)) {
            // Initialize arrays for tags and solutions
            const tags: string[] = [];
            const solutions: string[] = [];

            // Loop through the fetched data to separate tags and solutions
            data.forEach((facility: Facility) => {
              if (typeof facility.tag === "string" && typeof facility.solution === "string") {
                tags.push(facility.tag);
                solutions.push(facility.solution);
              }
            });

            setFacilities(data); // Set facilities as fetched data (optional)
            setTags(tags); // Set tags array
            setSolutions(solutions); // Set solutions array
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) return; // Ensure email is available before making the request


      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/${email}` // Use the API base URL from environment variables
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }

        const data = await response.json(); // Parse the response as JSON
        console.log("Fetched user data:", data);

        // Safely update the state with data, using empty strings if values are undefined or null
        setFacilityName(data.facilityName || "");
        setFacilityAddress(data.facilityAddress || "");
        setNoOfBeds(data.noOfBeds ? data.noOfBeds.toString() : ""); // Convert noOfBeds to string if it's not null/undefined
      } catch (error) {
        console.error("Error fetching user data:", error); // Log the error message
      } finally {

      }
    };

    fetchUserData(); // Call the async function
  }, [email]); // Dependency on email to trigger the effect when email changes

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

        {/* Facility Dropdown */}
        <div className="flex items-center space-x-4 mt-4 lg:mt-8 ml-4 lg:ml-10">
          <h3 className="text-xl font-bold text-blue-900">Facility</h3>
          <div className="relative">
            <button onClick={toggleDropdown} className="flex items-center bg-blue-900 text-white px-4 py-2 rounded-lg">
              <span>Lorem Ipsum</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg">
                <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Option 1</a>
                <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Option 2</a>
                <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Option 3</a>
              </div>
            )}
          </div>
        </div>


        {/* Facility Details Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 mx-auto mt-20" style={{ width: '100%', maxWidth: '1314px', height: 'auto', borderRadius: '16px', border: '1px solid #E0E0E0' }}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            {/* Left Section */}
            <div className="flex-1 text-center md:text-left">
              <p className="font-normal text-sm md:text-base lg:text-lg leading-5 md:leading-6 lg:leading-7 text-gray-900">
                Facility Name: <span className="text-gray-700">{facilityName}</span>
              </p>
              <p className="font-normal text-sm md:text-base lg:text-lg leading-5 md:leading-6 lg:leading-7 text-black">
                Facility Address: <span className="text-gray-700">{facilityAddress}</span>
              </p>
              <p className="font-normal text-sm md:text-base lg:text-lg leading-5 md:leading-6 lg:leading-7 text-black">
                Facility Number: <span className="text-gray-700">{noOfBeds}</span>
              </p>
            </div>




            <div className="relative ml-4 sm:ml-6 lg:ml-10">
              {/* Button to show the selected tag */}
              <button
                onClick={() => setDropdownOpen1(!dropdownOpen1)} // Toggle dropdown
                className="flex items-center text-white font-semibold text-[11px] leading-[14px] px-4 py-2 rounded-lg"
              >
                <span className={`font-[Plus Jakarta Sans] font-bold text-[40px] leading-[50.4px] text-[#494D55]`}>
                  {selectedTag || "Select Tag"}
                </span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a 1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen1 && (
                <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg z-10">
                  {facilities.length > 0 ? (
                    facilities
                      .filter((facility) => typeof facility.tag === 'string' && facility.tag !== selectedTag)
                      .map((facility, index) => (
                        <a
                          key={index}
                          onClick={() => {
                            setSelectedTag(facility.tag as string); // Assert that tag is a string
                            setDropdownOpen1(false); // Close dropdown
                          }}
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-200 text-sm sm:text-base md:text-lg cursor-pointer"
                        >
                          {facility.tag}
                        </a>
                      ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm sm:text-base md:text-lg">
                      No tags available
                    </div>
                  )}
                </div>
              )}
            </div>





            {/* Right Section */}
            <div className="flex-1 text-center md:text-right">
              <p className="text-gray-700 text-sm md:text-base lg:text-lg">30 November 2024</p>
            </div>
          </div>


          <div className="text-gray-600 space-y-4">
            {selectedTag && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-10"></h3>
                <p className="text-gray-600 mt-2">
                  {
                    // Find the corresponding facility solution based on the selected tag
                    facilities.find(facility => facility.tag === selectedTag)?.solution || 'No solution available.'
                  }
                </p>
              </>
            )}
          </div>
        </div>

        {/* More Content or Sections can go here */}
      </div>
    </div>
  );
}
