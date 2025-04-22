"use client";

import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa"; // Import the built-in upload icon
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { useRouter, useSearchParams } from "next/navigation";
import Notification from "@/components/Notification";
import UserDropdown from "@/components/profile-dropdown";
import DateDisplay from "@/components/date";
import HeaderWithToggle from "@/components/HeaderWithToggle";
import Cookies from "js-cookie";

interface Sidebar {
  userId: string | null;
  email: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}
export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("POC AI Ally");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const [email, setEmail] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    if (accessToken) {
      console.log("Access Token from Query Params:", accessToken);
      Cookies.set("accessToken", accessToken, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      const currentUrl = window.location.href;
      const cleanUrl = currentUrl.split("?")[0];
      window.history.replaceState({}, document.title, cleanUrl);
    }

    const storedEmail = Cookies.get("email");

    if (storedEmail) {
      setEmail(storedEmail);
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
      setTimeout(() => setUploadStatus(""), 3000);
      return;
    }

    if (!email) {
      setUploadStatus("Email is missing. Please sign in again.");
      setTimeout(() => setUploadStatus(""), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setUploadStatus("Upload successful!");
        setFile(null);
        router.push(`/pocAI`);
      } else {
        setUploadStatus("Unexpected error occurred.");
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.error === "File already exists."
      ) {
        setUploadStatus("File already exists.");
      } else {
        setUploadStatus("File upload failed. Please try again.");
      }
      setTimeout(() => setUploadStatus(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile || uploadedFile.type !== "application/pdf") {
      setUploadStatus("Only PDF files are allowed!");
      return;
    }
    setFile(uploadedFile);
    setUploadStatus(`File "${uploadedFile.name}" is ready to upload.`);
  };
  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row">
      <HeaderWithToggle onToggleSidebar={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 md:px-12 lg:px-16 xl:px-20 w-full">
        <header className="flex items-center justify-between mb-6 w-full flex-wrap">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
            Hello, <span className="text-blue-900 capitalize">{name}</span>
          </h2>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
            <Notification />
            <UserDropdown />
          </div>
        </header>
        {/* Facility Dropdown and Tabs */}
        <div className="flex items-center space-x-4 mt-4 lg:mt-8 ml-4 lg:ml-10 justify-between">
          {/* Facility Dropdown */}
          <div className="flex items-center space-x-4">
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-900">
              Facility
            </h3>
          </div>

          {/* Date */}
          <div className="relative flex items-center space-x-2">
            <DateDisplay />
          </div>
        </div>

        <div className="w-full border-t border-gray-300 mt-4"></div>

        {/* Main Container */}
        <div className="flex flex-col md:flex-row gap-4 p-4 min-h-screen">
          {/* Container */}
          <div className="shadow-lg p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center w-full  h-auto rounded-lg border border-gray-300">
            <h4 className="text-gray-500 text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-4 text-center">
              No <span className="text-blue-900">Plan Of Correction</span> Yet
            </h4>
            <button
              onClick={toggleSidebar}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm sm:text-base md:text-lg lg:text-xl"
            >
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl">
                +
              </span>
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
                  <FaCloudUploadAlt size={50} className="text-gray-600" />

                  <p className="text-gray-500 text-xs sm:text-sm md:text-base lg:text-lg text-center">
                    Drag and drop file here or{" "}
                    <label
                      htmlFor="fileInput"
                      className="text-blue-900 cursor-pointer underline"
                    >
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
                  {loading ? (
                    <div className="flex flex-col items-center justify-center w-full h-[300px]">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-900 mb-4"></div>
                      <p className="text-sm text-gray-600 font-medium">
                        Please wait...
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-end w-full space-x-4">
                      {/* Cancel Button */}
                      <button
                        onClick={toggleSidebar}
                        className="font-semibold hover:bg-blue-100 border px-4 py-2 rounded-lg text-sm sm:text-base md:text-lg"
                      >
                        Cancel
                      </button>

                      {/* Review Button */}
                      <button
                        className="font-semibold bg-blue-900 text-white px-4 py-2 rounded-lg text-sm sm:text-base md:text-lg"
                        onClick={handleFileUpload}
                      >
                        Review Deficiencies
                      </button>
                    </div>
                  )}
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
