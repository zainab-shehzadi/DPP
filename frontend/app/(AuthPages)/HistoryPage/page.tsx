"use client"; // <-- Ensures this file is treated as a client component

import Image from 'next/image';
import { FaBell } from 'react-icons/fa';
import React, { useState,useEffect,useRef } from "react";
import Cookies from "js-cookie"; 
import Sidebar from "@/components/Sidebar";
import { toast } from "react-toastify";
interface DocumentType {
  _id: string;
  originalName: string;
  fileUrl?: string; 
  uploadedAt: Date; 
}
export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [facilities, setFacilities] = useState<string[]>([]); 
  const [email, setEmail] = useState<string | null>(null);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [documents, setDocuments] = useState<DocumentType[]>([]); 
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
  
    useEffect(() => {
 
      const storedEmail = Cookies.get("email");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }, []);
  useEffect(() => {
    const fetchFacilities = async () => {
      if (!email) {
        setFacilities([]);
        return;
      }
  
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tags1`, {
          method: "POST", 
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email }) 
        });
  
        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
          const data = await response.json();
  
          if (Array.isArray(data)) {
            setFacilities(data); 
          } else {
            console.error("Fetched data is not an array:", data);
            setFacilities([]); 
          }
        } else {
          console.error("Unexpected response format or server error:", response.statusText);
          setFacilities([]);
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
        setFacilities([]); 
      }
    };
  
    fetchFacilities();
  }, [email]);
    const fetchDocumentDetails = async (id) => {
      try {
  
          const safeEmail = email ?? "";
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tags-with-descriptions`, {
            method: "POST", 
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: safeEmail, id })
          });
  
          if (!response.ok) {
              setTagsData([]);
              toast.error("Error: Failed to fetch document details.");
              return;
          }
  
          const data = await response.json();
        
          if (!data.tags || !Array.isArray(data.tags)) {
            
              console.error("❌ API Error: `data.tags` is undefined or not an array:", data);
              return;
          }
  
     
          const formattedTags = data.tags.map((tag) => ({
              id: tag.id || tag._id || "Missing ID",
              tag: tag.tag,
              shortDesc: tag.shortDescription || " No Short Description",
              longDesc: tag.longDescription || " No Long Description",
              solution: tag.solution && tag.solution.trim() !== "" ? tag.solution : " No Solution", 
              policies: tag.policies || " No Policies",
              task: tag.task || [],
          }));
  
          // ✅ Ensure ID is present in logs
          formattedTags.forEach((tag, index) => {
              console.log(`🔹 Tag ${index} - ID: ${tag.id}`);
          });
  
          setTagsData(formattedTags);
      } catch (error) {
          toast.error("❌ Error fetching document details:\n" );
      } finally {
          
          console.log("⏳ Loading state set to false.");
      }
  };
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const email = Cookies.get("email");
        if (!email) {
          console.error("Error: Email not found in cookies!");
          return;
        }
  
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/docs`, {
          method: "POST", 
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email }) 
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setDocuments(data); 
        }
      } catch (error) {
        toast.error("Error fetching documents:");
      }
    };
  
    fetchDocuments();
  }, []);
  const name = Cookies.get("name"); 

  return (
    <div className="flex flex-col lg:flex-row">
   

      {/* Mobile Toggle Button */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
        <div className="h-12 w-12 bg-cover bg-center" style={{ backgroundImage: "url('/assets/logo.avif')" }}></div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex items-center justify-between mb-6 w-full flex-wrap">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
            Hello, <span className="text-blue-900 capitalize">{name}</span>
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
{tagsData.length > 0 ? (
  tagsData.map((tagItem, index) => (
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
          layout="intrinsic"
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
          {tagItem.tag} {/* Display tag name */}
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
  ))
) : (
  <div className="flex items-center justify-center p-4 bg-gray-100 rounded-[15px] shadow-md border border-gray-300">
    <p className="text-gray-600 font-semibold">
      Please select a document first.
    </p>
  </div>
)}


</div>


</div>




     
      </div>
    </div>
  );
}
