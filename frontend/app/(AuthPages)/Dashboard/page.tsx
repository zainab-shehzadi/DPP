"use client";

import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaChevronDown } from "react-icons/fa";
import FacilitySelector from "../../../components/FacilitySelector/FacilitySelector.jsx";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
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
  const userRole = Cookies.get("role");
  const userEmail = Cookies.get("email");

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
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  const fetchRegionalAdminFacilities = async () => {
    if (userRole !== "Regional Admin") return;

    setLoadingFacilities(true);
    try {
      const accessToken = Cookies.get("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/regional-admin-facilities`,
        { email: userEmail },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setFacilities(response.data.facilities);

        if (response.data.facilities.length > 0 && !selectedFacility) {
          const defaultFacility = response.data.facilities[0];
          setSelectedFacility(defaultFacility);
          Cookies.set("selectedFacilityId", defaultFacility._id);
          Cookies.set("facilityName", defaultFacility.facilityName);
          Cookies.set("facilityCode", defaultFacility.facilityCode);
        }
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
      toast.error("Failed to fetch facilities");
    } finally {
      setLoadingFacilities(false);
    }
  };

  const handleFacilitySelect = (facility) => {
    setSelectedFacility(facility);
    setShowFacilityDropdown(false);

    Cookies.set("selectedFacilityId", facility._id);
    Cookies.set("facilityName", facility.facilityName);
    Cookies.set("facilityCode", facility.facilityCode);
    Cookies.set("facilityAddress", facility.facilityAddress);

    toast.success(`Switched to ${facility.facilityName}`);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer.files[0];

    if (!uploadedFile || uploadedFile.type !== "application/pdf") {
      setUploadStatus("Only PDF files are allowed!");
      return;
    }

    setFile(uploadedFile);
    setUploadStatus(`File "${uploadedFile.name}" is ready to upload.`);
  };

  const handleFileSelect = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile || uploadedFile.type !== "application/pdf") {
      setUploadStatus("Only PDF files are allowed!");
      return;
    }
    setFile(uploadedFile);
    setUploadStatus(`File "${uploadedFile.name}" is ready to upload.`);
  };

  // const handleFileUpload = async () => {
  //   if (!file) {
  //     setUploadStatus("Please select a file to upload.");
  //     setTimeout(() => setUploadStatus(""), 3000);
  //     return;
  //   }
  //   const Address = Cookies.get("facilityAddress");
  //   const accessToken = Cookies.get("token");
  //   const formData = new FormData();

  //   formData.append("address", Address || "");
  //   formData.append("file", file);

  //   if (selectedFacility) {
  //     formData.append("facilityId", selectedFacility._id);
  //   }

  //   setLoading(true);

  //   try {
  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/upload`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );

  //     if (response.status === 201) {
  //       setUploadStatus("Upload successful!");
  //       setFile(null);
  //       toggleSidebar();
  //       router.push("/pocAI");
  //       setUploadStatus("");
  //     } else {
  //       setUploadStatus("Unexpected error occurred.");
  //       setTimeout(() => setUploadStatus(""), 3000);
  //     }
  //   } catch (error: any) {
  //     const errMsg = error?.response?.data?.error;

  //     if (error.response?.status === 400) {
  //       if (errMsg === "File already exists.") {
  //         setUploadStatus("File already exists.");
  //          setFile(null); 
  //       } else if (errMsg?.includes("Address mismatch")) {
  //         setUploadStatus(
  //           "Address mismatch: Please verify the facility address."
  //         );
  //           setFile(null); 

  //       } else {
  //         setUploadStatus(errMsg || "Upload failed due to a client error.");
  //          setFile(null); 

  //       }
  //     } else {
  //       setUploadStatus("File upload failed. Please try again.");
  //        setFile(null); 
  //     }

  //     setTimeout(() => setUploadStatus(""), 3000);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleFileUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file to upload.");
      setTimeout(() => setUploadStatus(""), 3000);
      return;
    }

    const accessToken = Cookies.get("token");
    const userRole = Cookies.get("role");
    const Address = Cookies.get("facilityAddress");
    const formData = new FormData();
    formData.append("address", Address);
    formData.append("file", file);

    if (userRole === "Regional Admin") {
      if (selectedFacility && selectedFacility._id) {
        console.log(
          "Selected Facility ID (Regional Admin):",
          selectedFacility._id
        );
        formData.append("facilityId", selectedFacility._id);
      } else {
        setUploadStatus(
          "No facility selected. Please select a facility first."
        );
        setTimeout(() => setUploadStatus(""), 3000);
        return;
      }
    } else {
      const cookieFacilityId = Cookies.get("selectedFacilityId");
      if (cookieFacilityId) {
        formData.append("facilityId", cookieFacilityId);
      } else {
        setUploadStatus("Facility ID not found in cookies.");
        setTimeout(() => setUploadStatus(""), 3000);
        return;
      }
    }
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
      const errMsg = error?.response?.data?.error;

      if (error.response?.status === 400) {
        if (errMsg === "File already exists.") {
          setUploadStatus("File already exists.");
          setFile(null);
        } else if (errMsg?.includes("Address mismatch")) {
          setUploadStatus(
            "Address mismatch: Please verify the facility address."
          );
          setFile(null);
        } else {
          setUploadStatus(errMsg || "Upload failed due to a client error.");
          setFile(null);
        }
      } else {
        setUploadStatus("File upload failed. Please try again.");
        setFile(null);
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

  useEffect(() => {
    if (userRole === "Regional Admin") {
      fetchRegionalAdminFacilities();
    } else {
      const facilityName = Cookies.get("facilityName");
      if (facilityName) {
        setSelectedFacility({ facilityName });
      }
    }
  }, [userRole, userEmail]);

  const facility = Cookies.get("facilityName");
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
            
            <FacilitySelector
              onFacilityChange={(facility) => {
                console.log("Selected facility:", facility);
                // Reload data for the new facility
              }}
              showFacilityInfo={true}
            />

            <div className="w-full border-t border-gray-300 mt-4" />

            <div className="flex flex-col md:flex-row gap-4 p-4 min-h-screen">
              <div className="shadow-lg p-10 flex flex-col items-center justify-center w-full rounded-lg border border-gray-300">
                <h4 className="text-gray-500 font-semibold mb-4 text-center">
                  No <span className="text-blue-900">Plan Of Correction</span>{" "}
                  Yet
                  {userRole === "Regional Admin" && selectedFacility && (
                    <div className="text-sm mt-2">
                      for{" "}
                      <span className="text-blue-900">
                        {selectedFacility.facilityName}
                      </span>
                    </div>
                  )}
                </h4>
                <button
                  onClick={toggleSidebar}
                  className="bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mb-4"
                  disabled={userRole === "Regional Admin" && !selectedFacility}
                >
                  <span className="text-2xl mb-2">+</span>
                  <span>Create New POC</span>
                </button>

                {userRole === "Regional Admin" && !selectedFacility && (
                  <p className="text-sm text-gray-500 text-center">
                    Please select a facility to create POC
                  </p>
                )}
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
