"use client";

import Image from 'next/image';
import { FaBell } from 'react-icons/fa';
import React, { useState, useEffect ,useRef } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

import Sidebar from "@/components/Sidebar";
interface Facility {
  tag?: string;
  solution?: string;
}
interface DocumentType {
  _id: string;
  originalName: string;
  fileUrl?: string; 
  uploadedAt: Date; 
}

export default function Dashboard() {

  const [tagsData, setTagsData] = useState<{
    id: number;
    tag: string;
    status:string;
    shortDesc: string;
    longDesc: string;
    solution: string;
    policies: string;
    task: string;
  }[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]); 
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const [dropdownOpen1, setDropdownOpen1] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tag, setTags] = useState<string[]>([]);
  const [solution, setSolutions] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [email, setEmail] = useState<string | null>(null); 
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [noOfBeds, setNoOfBeds] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
const [selectedTag, setSelectedTag] = useState<string | null>(null); 

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  const toggleDropdown1 = () => {
    setDropdownOpen1(!dropdownOpen1);
  };
useEffect(() => {
  const fetchDocuments = async () => {
    try {
      const email = Cookies.get("email");
      if (!email) {
        console.error("Error: Email not found in cookies!");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/docs?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      console.log("API Response:", data); 
  
      if (Array.isArray(data)) {
        setDocuments(data); 
      } else {
        console.error("Unexpected API response format", data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  fetchDocuments();
}, []);
  // Helper function to get cookies
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  useEffect(() => {
  
    const storedEmail = getCookie("email");
    if (storedEmail) {
      setEmail(storedEmail); 
    }
  }, []);
const handleTagClick = async (tagName, tagId) => {
    try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tag-details?tagId=${tagId}&tagName=${encodeURIComponent(tagName)}`;
        console.log("📡 API Request URL:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`API Error - Status: ${response.status}`);
        }

        const result = await response.json();
        let newSolution = result.solution || [];
        if (!Array.isArray(newSolution)) newSolution = [newSolution];
        setSolutions(newSolution);
    
    } catch (error) {
        console.error("❌ Error fetching tag details:", error);
        toast.error(`Error`);
    }
};
  const fetchDocumentDetails = async (id) => {
    try {
        console.log(`📤 Fetching Details for Document ID: ${id}`);

        const safeEmail = email ?? "";
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tags-with-descriptions?email=${encodeURIComponent(safeEmail)}&id=${encodeURIComponent(id)}`;
        const response = await fetch(apiUrl);
      

        if (!response.ok) {
            console.error(`❌ Failed to fetch document details: ${response.statusText}`);
            setTagsData([]);
            alert("Error: Failed to fetch document details.");
            return;
        }

        const data = await response.json();
      
        if (!data.tags || !Array.isArray(data.tags)) {
          
            console.error("❌ API Error: `data.tags` is undefined or not an array:", data);
            return;
        }

        // ✅ Ensure the correct ID field is used
        const formattedTags = data.tags.map((tag) => ({
            id: tag.id || tag._id || "❌ Missing ID",
            tag: tag.tag,
            shortDesc: tag.shortDescription || "❌ No Short Description",
            longDesc: tag.longDescription || "❌ No Long Description",
            solution: tag.solution && tag.solution.trim() !== "" ? tag.solution : "❌ No Solution",  // ✅ Handle empty solution
            policies: tag.policies || "❌ No Policies",
            task: tag.task || [],
        }));

        // ✅ Ensure ID is present in logs
        formattedTags.forEach((tag, index) => {
            console.log(`🔹 Tag ${index} - ID: ${tag.id}`);
        });

        setTagsData(formattedTags);
        console.log("✅ Updated Tags Data:", formattedTags);
       

    } catch (error) {
        console.error("❌ Error fetching document details:", error);
        alert("❌ Error fetching document details:\n" );
    } finally {
        
        console.log("⏳ Loading state set to false.");
    }
};

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) return; 


      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/${email}` 
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }

        const data = await response.json(); 
        console.log("Fetched user data:", data);

        setFacilityName(data.facilityName || "");
        setFacilityAddress(data.facilityAddress || "");
        setNoOfBeds(data.noOfBeds ? data.noOfBeds.toString() : "");
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {

      }
    };

    fetchUserData();
  }, [email]); 

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
          <div className="relative ml-2 sm:ml-4 lg:ml-6" ref={dropdownRef}>
  <button
    onClick={toggleDropdown}
    className="flex items-center bg-[#244979] text-white font-semibold text-sm px-3 py-2 rounded-lg"
  >
    <span className="font-[Plus Jakarta Sans]">Documents</span>
    <svg
      className="w-4 h-4 ml-2 transition-transform duration-200"
      fill="currentColor"
      viewBox="0 0 20 20"
      style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      ></path>
    </svg>
  </button>

  {/* Dropdown Menu */}
  {dropdownOpen && (
    <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-50 border border-gray-200">
      {documents.length > 0 ? (
        documents.map((doc, index) => {
          return (
            <button
              key={doc._id || index} 
              onClick={() => {
                fetchDocumentDetails(doc._id);
                setDropdownOpen(false); 
              }}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 text-xs sm:text-sm"
            >
              {doc.originalName || "Untitled Document"}
            </button>
          );
        })
      ) : (
        <p className="px-4 py-2 text-gray-500 text-xs sm:text-sm">No documents found.</p>
      )}
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
              <button
                onClick={() => setDropdownOpen1(!dropdownOpen1)} 
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

              {/* Dropdown */}
  {dropdownOpen1 && (
    <div
      className="absolute mt-2 w-full max-w-[190px] bg-white border border-gray-300 rounded-lg shadow-lg z-10"
      style={{
        maxHeight: "200px",
        overflowY: "auto",
      }}
    >
      <ul className="flex flex-col divide-y divide-gray-200">
        {tagsData.map((item, index) => (
          <li
            key={item.id || index}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-all duration-300 hover:shadow-md"
            onClick={() => {
              setSelectedTag(item.tag); // Update the selected tag
              handleTagClick(item.tag, item.id);
              setDropdownOpen1(false);
            }}
          >
            <div>
              <strong>{item.tag}</strong>
            </div>
          </li>
        ))}
      </ul>
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
      {Array.isArray(solution) && solution.length > 0 ? (
      solution.map((policy, index) => (
        <li key={index}>
          {policy}
        </li>
      ))
    ) : (
      <li>No Plan of Correction available.</li>
    )}
        
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
