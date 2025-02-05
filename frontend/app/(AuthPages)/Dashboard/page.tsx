"use client"; // <-- Add this line to mark this file as a client component

import Image from "next/image";
import { FaBell } from "react-icons/fa";
import React, { useState ,useEffect} from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { useRouter ,useSearchParams } from "next/navigation"; // Correct import for App Router
import Notification from '@/components/Notification'
import Cookies from "js-cookie"; // Import js-cookie to manage cookies

interface Sidebar {
  userId: string | null; // Allow string or null
  email: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}
export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown state
  const [activeTab, setActiveTab] = useState("POC AI Ally");
  const [file, setFile] = useState(null); // Store selected file
  const [uploadStatus, setUploadStatus] = useState(""); 
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const [email, setEmail] = useState<string | null>(null); 
  const searchParams = useSearchParams(); // Hook to get query parameters


  
  const router = useRouter();

    // Helper function to get cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };
  
    

    useEffect(() => {

       // Retrieve the access token from query parameters
    const accessToken = searchParams.get("accessToken");

    if (accessToken) {
      console.log("Access Token from Query Params:", accessToken);

      // Store the access token in cookies
      Cookies.set("accessToken", accessToken, {
        expires: 1, // Expires in 1 day
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        sameSite: "Strict", // Prevent cross-site attacks
      });

      // Optionally remove the accessToken from the URL to clean up
      const currentUrl = window.location.href;
      const cleanUrl = currentUrl.split("?")[0];
      window.history.replaceState({}, document.title, cleanUrl);
    }
      // Retrieve email from cookies on component mount
      const storedEmail = getCookie("email");
      if (storedEmail) {
        setEmail(storedEmail); // Set the email state if found in cookies
      }
    }, []);
  
  const handleFileDrop = (e) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer.files[0];
  
    if (uploadedFile.type !== "application/pdf") {
      setUploadStatus("Only PDF files are allowed!");
      return;
    }
  
    setFile(uploadedFile);
    setUploadStatus(`File "${uploadedFile.name}" is ready to upload.`);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }
    if (!email) {
      setUploadStatus("Email is missing. Please sign in again.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file); // Add the file
    formData.append("email", email); // Add the email
  
    try {
      setUploadStatus("Uploading...");
  
    
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
     
      console.log("Upload response:", response.data);

     // Assuming the response contains an 'id' field
     const uploadedFileId = response.data?.documentId;

    console.log(uploadedFileId);
      // Update the status to success
      setUploadStatus("Upload successful!");
  
      // Clear the selected file
      setFile(null);
  
      // Navigate to the UploadDoc page with the email
      //router.push(`/UploadDoc`);
      router.push(`/UploadDoc?id=${uploadedFileId}`);
    } catch (error: any) {
      // Log and handle errors
      console.error(
        "Error during file upload:",
        error.response?.data || error.message
      );
      setUploadStatus("Error uploading file. Please try again.");
    }
  };
  
  const handleFileSelect = (e) => {
    const uploadedFile = e.target.files[0]; // Access the first file in the input
    if (!uploadedFile || uploadedFile.type !== "application/pdf") {
      setUploadStatus("Only PDF files are allowed!"); // Update the upload status if the file is not a PDF
      return;
    }
    setFile(uploadedFile); // Save the file in state
    setUploadStatus(`File "${uploadedFile.name}" is ready to upload.`); // Update the upload status
  };
  

  return (
    <div className="flex flex-col lg:flex-row">
  {/* Mobile Toggle Button */}
  <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
    <div
      className="h-12 w-12 bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/logo.avif')" }}
    ></div>
  </div>

  {/* Sidebar Component */}
  <Sidebar 
    isSidebarOpen={isSidebarOpen} 
    toggleSidebar={toggleSidebar} 
  />

  {/* Main Content */}
  <div className="lg:ml-64 p-4 sm:p-8 md:px-12 lg:px-16 xl:px-20 w-full">
    <header className="flex items-center justify-between mb-6 w-full flex-wrap">
      <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
        Hello, <span className="text-blue-900">User</span>
      </h2>
      <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
      < Notification/>
        <div className="flex items-center border border-gray-300 p-1 sm:p-2 rounded-md space-x-2">
          <Image
            src="/assets/image.png"
            width={28}
            height={28}
            className="rounded-full sm:w-10 sm:h-10 lg:w-12 lg:h-12"
            alt="User Profile"
          />
          <span className="text-gray-800 text-sm sm:text-base lg:text-lg">
            User
          </span>
        </div>
      </div>
    </header>

    <div className="flex flex-col lg:flex-row items-center justify-between px-4 sm:px-8 lg:px-16 mt-4 lg:mt-8 space-y-4 lg:space-y-0">
      {/* Facility Dropdown */}
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-blue-900">
          Facility
        </h3>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center bg-blue-900 text-white font-semibold text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1 sm:py-2 rounded-lg"
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
            <div className="absolute mt-2 w-full sm:w-48 bg-white shadow-lg rounded-lg">
              <a
                href="#"
                className="block px-2 sm:px-4 py-1 sm:py-2 text-gray-800 hover:bg-gray-200 text-xs sm:text-sm md:text-base"
              >
                Option 1
              </a>
              <a
                href="#"
                className="block px-2 sm:px-4 py-1 sm:py-2 text-gray-800 hover:bg-gray-200 text-xs sm:text-sm md:text-base"
              >
                Option 2
              </a>
              <a
                href="#"
                className="block px-2 sm:px-4 py-1 sm:py-2 text-gray-800 hover:bg-gray-200 text-xs sm:text-sm md:text-base"
              >
                Option 3
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Facility Tabs */}
      <div className="flex flex-col items-center w-full lg:w-auto mx-auto">
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
          <div className="absolute h-[3px] w-full bg-gray-300 rounded-full"></div>
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

      {/* Date Box */}
      <div className="flex items-center justify-center">
        <div className="bg-white border border-blue-900 px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-md text-xs sm:text-sm md:text-base lg:text-lg text-blue-900 font-semibold">
          30 November 2024
        </div>
      </div>
    </div>

    <div className="w-full border-t border-gray-300 mt-4"></div>

    {/* Main Container */}
    <div className="flex flex-col md:flex-row gap-4 p-4 min-h-screen">
      {/* Container */}
      <div className="bg-white shadow-lg p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center w-full lg:w-2/3 h-auto rounded-lg border border-gray-300">
        <h4 className="text-gray-500 text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-4 text-center">
          No <span className="text-blue-900">Plan Of Correction</span> Yet
        </h4>
        <button
          onClick={toggleSidebar}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm sm:text-base md:text-lg lg:text-xl"
        >
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl">+</span>
          <span>Create New POC</span>
        </button>
      </div>
      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          <div className="fixed top-0 right-0 h-full bg-white shadow-lg p-6 sm:p-8 md:p-10 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <h2 className="font-semibold text-gray-700 mb-2 text-lg sm:text-xl md:text-2xl lg:text-3xl">
              New <span className="text-blue-900">Plan Of Correction</span>
            </h2>
            <p className="mb-6 text-sm sm:text-base md:text-lg text-center">
              Please Upload Your Document
            </p>
            {/* Upload Section */}
            <div
              className="flex flex-col items-center justify-center border-collapse border-2 border-gray-300 rounded-lg p-4 sm:p-6 md:p-8 mb-8 w-full h-36"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <Image src="/assets/vector.png" width={50} height={50} alt="Upload Icon" />
              <p className="text-gray-500 text-xs sm:text-sm md:text-base lg:text-lg text-center">
                Drag and drop file here or{" "}
                <label htmlFor="fileInput" className="text-blue-900 cursor-pointer underline">
                  browse file
                </label>
              </p>
              <input
                id="fileInput"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            {uploadStatus && (
              <p className="text-sm sm:text-base text-gray-700 text-center mb-4">
                {uploadStatus}
              </p>
            )}
            <div className="flex justify-end w-full space-x-4">
              <button
                onClick={toggleSidebar}
                className="font-semibold hover:bg-blue-100 border px-4 py-2 rounded-lg text-sm sm:text-base md:text-lg"
              >
                Cancel
              </button>
              <button
                className="font-semibold bg-blue-900 text-white px-4 py-2 rounded-lg text-sm sm:text-base md:text-lg"
                onClick={handleFileUpload}
              >
                Review Deficiencies
              </button>
            </div>
          </div>
          <div
            className="fixed inset-0 bg-black opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
        </>
      )}
    </div>
  </div>
</div>

  );
}
