"use client";

import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import Notification from "@/components/Notification";
import UserDropdown from "@/components/profile-dropdown";
import DateDisplay from "@/components/date";
import HeaderWithToggle from "@/components/HeaderWithToggle";
import Cookies from "js-cookie";
import { useDashboardStore } from "@/stores/useDashboardStore";
import SidebarUploadPanel from "@/components/Modals/SidebarUploadPanel";
import { toast } from "react-toastify";

export default function Dashboard() {
  const router = useRouter();
  const name = Cookies.get("name");

  const {
    isSidebarOpen,
    toggleSidebar,
    file,
    setFile,
    loading,
    setLoading,
    email,
    setEmail,
    uploadStatus,
    setUploadStatus,
  } = useDashboardStore();

  const [loading1, setLoading1] = useState(true);
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer.files[0];

    if (!uploadedFile || uploadedFile.type !== "application/pdf") {
      setUploadStatus("Only PDF files are allowed!");

      return;
    }

    setFile(uploadedFile);
    setUploadStatus(`File "${uploadedFile.name}" is ready to upload.`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile || uploadedFile.type !== "application/pdf") {
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

    const accessToken = Cookies.get("token");
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 201) {
        setUploadStatus("Upload successful!");
        setFile(null);
        toggleSidebar();
        router.push("/pocAI");
        setUploadStatus("");
      } else {
        setUploadStatus("Unexpected error occurred.");
        setTimeout(() => setUploadStatus(""), 3000);
      }
    } catch (error: any) {
      if (
        error.response?.status === 400 &&
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
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading1(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  const facility= Cookies.get("facilityName");
  return (
    <div className="flex flex-col lg:flex-row">
      <HeaderWithToggle onToggleSidebar={toggleSidebar} />
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={toggleSidebar} />
      {loading1 ? (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="lg:ml-64 p-4 sm:p-8 w-full">
            <header className="flex items-center justify-between mb-6 w-full flex-wrap">
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
                Hello, <span className="text-blue-900 capitalize">{name}</span>
              </h2>
              <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
                {/* <Notification /> */}
                <UserDropdown />
              </div>
            </header>

            <div className="flex items-center space-x-4 mt-4 lg:mt-8  justify-between">
              <h3 className="text-lg lg:text-2xl font-bold text-blue-900">
                {facility}
              </h3>
              <DateDisplay />
            </div>

            <div className="w-full border-t border-gray-300 mt-4" />

            <div className="flex flex-col md:flex-row gap-4 p-4 min-h-screen">
              <div className="shadow-lg p-10 flex flex-col items-center justify-center w-full rounded-lg border border-gray-300">
                <h4 className="text-gray-500 font-semibold mb-4 text-center">
                  No <span className="text-blue-900">Plan Of Correction</span>{" "}
                  Yet
                </h4>
                <button
                  onClick={toggleSidebar}
                  className="bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mb-"
                >
                  <span className="text-2xl mb-2">+</span>
                  <span>Create New POC</span>
                </button>
              </div>

              <SidebarUploadPanel
                handleFileDrop={handleFileDrop}
                handleFileSelect={handleFileSelect}
                handleFileUpload={handleFileUpload}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
