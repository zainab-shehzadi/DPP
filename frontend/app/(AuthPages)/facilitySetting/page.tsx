"use client"; // Ensure this is a client component

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import authProtectedRoutes from "@/hoc/authProtectedRoutes";
import { FaCloudUploadAlt } from "react-icons/fa";
import Cookies from "js-cookie";
import HeaderWithToggle from "@/components/HeaderWithToggle";
import DateDisplay from "@/components/date";
import UserDropdown from "@/components/profile-dropdown";
import Notification from "@/components/Notification";
import { toast } from "react-toastify";
function facilitySetting() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [noOfBeds, setNoOfBeds] = useState("");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");

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
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/fetch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch user data. Status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Fetched user data:", data);

        setFacilityName(data.facilityName || "");
        setFacilityAddress(data.facilityAddress || "");
        setNoOfBeds(data.noOfBeds ? data.noOfBeds.toString() : "");
        setStatus(data?.status || "");
      } catch (error) {
        console.error("Error fetching user data:");
      }
    };

    fetchUserData();
  }, [email]);
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/get-profile-image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile image");

        const data = await response.json();
        if (data?.profileImage) {
          setImageUrl(data.profileImage);
        }
      } catch (error) {
        console.error("Fetch profile image error:", error);
      }
    };

    if (email) {
      fetchProfileImage();
    }
  }, [email]);
  const requestAdminApproval = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/request-edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) throw new Error("Failed to send approval request");

      toast.success("Approval request sent");
      setIsRequestSent(true);
    } catch (error) {
      console.error("Error sending approval request:", error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setMessage("");

      const updatedData = {
        email,
        facilityName,
        facilityAddress,
        noOfBeds: Number(noOfBeds),
      };
      console.log(updatedData);
      // Make the API request
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Update successful:", result);
      setIsEditing(false);
      toast.success("Data successfully updated.");
    } catch (error) {
      console.error("Error saving changes:", error);
      setMessage("Failed to save changes. Please try again.");
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  const handleEditClick = () => {
    requestAdminApproval();
  };

  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <HeaderWithToggle onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {loading ? (
        <div className="flex items-center justify-center w-full h-screen ma-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="lg:ml-64 p-4 sm:p-8 w-full">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Hello, <span className="text-blue-900 capitalize">{name}</span>
              </h2>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <Notification />
                <UserDropdown />
              </div>
            </header>

            <div className="flex justify-end pr-12 sm:pr-48 mb-4">
              <DateDisplay />
            </div>
            <div className="w-full sm:w-3/4 h-12 sm:h-20 bg-[#002F6C] mt-2 rounded-lg mx-auto"></div>

            <div className="w-full sm:w-3/4 mx-auto mt-8">
              <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                {/* Profile Section */}
                <div className="flex flex-col sm:flex-row items-center mb-6">
                  <Image
                    src={imageUrl || "/assets/profile-icon.png"}
                    width={80}
                    height={80}
                    className="rounded-full"
                    alt="Profile Picture"
                  />
                  <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
                    <h3 className="text-xl font-bold capitalize">{name}</h3>
                    <div>
                      {email ? (
                        <p className="text-gray-500">{email}</p>
                      ) : (
                        <p>No email found.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-black-900">
                      Email
                    </label>

                    {/* Non-Editable Email Field */}
                    <input
                      type="email"
                      id="email"
                      placeholder="Loading email..."
                      value={email || ""}
                      readOnly
                      className="mt-2 w-full h-[49px] p-2 rounded-[7.5px] bg-[#F9F9F9] "
                    />
                  </div>

                  {/* Facility Name */}
                  <div className="mb-4">
                    <label
                      htmlFor="facilityName"
                      className="block text-black-900"
                    >
                      Facility Name
                    </label>
                    <select
                      id="facilityName"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      className={`mt-2 w-full h-[49px] p-2 rounded-[7.5px] ${
                        status === "approve" ? "bg-[#e2f3ff]" : "bg-[#F9F9F9]"
                      } transition-all text-gray-700`}
                      disabled={status !== "approve"} // Enable if status is "approve"
                    >
                      <option value="">Select Facility Name</option>
                      <option value="facility1">Facility1</option>
                      <option value="facility2">Facility2</option>
                      <option value="facility3">Facility3</option>
                      <option value="facility4">Facility4</option>
                    </select>
                  </div>

                  {/* Number of Beds */}
                  <div className="mb-4">
                    <label htmlFor="noOfBeds" className="block text-black-900">
                      No Of Beds
                    </label>
                    <select
                      id="noOfBeds"
                      value={noOfBeds}
                      onChange={(e) => setNoOfBeds(e.target.value)}
                      className={`mt-2 w-full h-[49px] p-2 rounded-[7.5px] ${
                        status === "approve" ? "bg-[#e2f3ff]" : "bg-[#F9F9F9]"
                      } transition-all text-gray-700`}
                      disabled={status !== "approve"} // Enable if status is "approve"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>

                  {/* Facility Address */}
                  <div className="mb-4">
                    <label
                      htmlFor="facilityAddress"
                      className="block text-black-900"
                    >
                      Facility
                    </label>
                    <input
                      type="text"
                      id="facilityAddress"
                      value={facilityAddress}
                      onChange={(e) => setFacilityAddress(e.target.value)}
                      placeholder="Enter Facility Address"
                      className={`mt-2 w-full h-[49px] p-2 rounded-[7.5px] ${
                        status === "approve" ? "bg-[#e2f3ff]" : "bg-[#F9F9F9]"
                      } transition-all text-gray-700`}
                      disabled={status !== "approve"} 
                    />
                  </div>
                </div>
                {/* Status */}
                <div className="mb-4 mt-4">
                  <label htmlFor="status" className="block text-black-900">
                    Status
                  </label>
                  <input
                    type="text"
                    id="status"
                    value={status || ""}
                    readOnly
                    className="mt-2 w-full h-[49px] p-2 rounded-[7.5px] bg-[#F9F9F9] text-gray-700"
                  />
                </div>

                {/* File Upload Section */}
                <div className="mt-6">
                  <h4 className="font-bold text-gray-700">
                    Facilities Policies (Optional)
                  </h4>
                  <div className="mt-2 w-full h-40 rounded-3xl flex flex-col justify-center items-center text-gray-500 bg-[#F9F9F9] border border-[#E0E0E0]">
                    <FaCloudUploadAlt size={50} className="text-gray-600" />
                    <p className="mt-2">
                      Drag and drop file here or{" "}
                      <span className="text-[#002F6C] font-semibold">
                        browse file
                      </span>
                    </p>
                  </div>
                </div>

                {/* Message Display */}
                <div className="mt-4">
                  {message && (
                    <p
                      className={`text-center ${
                        message.includes("successfully")
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {message}
                    </p>
                  )}
                </div>
                {/* Edit/Save Button */}
                <div className="mt-6 text-center">
                  {/* Show message if request has been sent */}
                  {isRequestSent && (
                    <div className="text-green-600 mb-4">
                      Request has been sent. Please check your email for
                      approval.
                    </div>
                  )}

                  {/* Button logic based on status */}
                  {status === "approve" ? (
                    <button
                      className={`bg-blue-900 text-white px-6 py-2 rounded-md ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={
                        isEditing ? handleSaveChanges : () => setIsEditing(true)
                      } // Call save or toggle editing
                      disabled={loading}
                    >
                      {isEditing ? "Save" : "Edit"}
                    </button>
                  ) : status === "pending" ? (
                    <button
                      className={`bg-yellow-500 text-white px-6 py-2 rounded-md ${
                        loading || isRequestSent
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={handleEditClick} // Send request
                      disabled={loading || isRequestSent}
                    >
                      {isRequestSent ? "Request Sent" : "Send Request"}
                    </button>
                  ) : status === "reject" ? (
                    <div>
                      <div className="text-red-600 mb-4">
                        Your request was rejected. You cannot edit the fields.
                      </div>
                      <button
                        className="bg-gray-500 text-white px-6 py-2 rounded-md cursor-not-allowed opacity-50"
                        disabled
                      >
                        Request Rejected
                      </button>
                    </div>
                  ) : (
                    <button
                      className="bg-gray-500 text-white px-6 py-2 rounded-md cursor-not-allowed opacity-50"
                      disabled
                    >
                      Unknown Status
                    </button>
                  )}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default authProtectedRoutes(facilitySetting);
