"use client"; // Ensure this is a client component

import Image from "next/image";
import { FaBell } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import authProtectedRoutes from "@/hoc/authProtectedRoutes";
import { FaCloudUploadAlt } from "react-icons/fa"; 
import Cookies from "js-cookie";
import DateDisplay from "@/components/date";
import UserDropdown from "@/components/profile-dropdown";
import Notification from "@/components/Notification";
function facilitySetting() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [noOfBeds, setNoOfBeds] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null); // Email from cookies
  const [isRequestSent, setIsRequestSent] = useState(false); // Track request status
  const [status, setStatus] = useState<string | null>(null); // Track admin approval status
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [message, setMessage] = useState(""); // Message to display success/error

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
      setEmail(storedEmail); // Set email state if found in cookies
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) return;

      setLoading(true);
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
        setNoOfBeds(data.noOfBeds ? data.noOfBeds.toString() : ""); // Convert noOfBeds to string if it's not null/undefined
        setStatus(data?.status || "");
      } catch (error) {
        console.error("Error fetching user data:"); // Log the error message
      } finally {
        setLoading(false); // Set loading state to false when the request is complete
      }
    };

    fetchUserData();
  }, [email]);

  const requestAdminApproval = async () => {
    try {
      setLoading(true);
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

      console.log("Approval request sent");
      setIsRequestSent(true);
      setLoading(false);
    } catch (error) {
      console.error("Error sending approval request:", error);
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setMessage(""); // Clear any previous messages

      // Prepare the data to send
      const updatedData = {
        email,
        facilityName,
        facilityAddress,
        noOfBeds: Number(noOfBeds), // Convert to number if necessary
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

      // Reset editing state
      setIsEditing(false);
      setMessage("Data successfully updated."); // Set success message

      // Clear the message after 3 seconds (3000 ms)
      setTimeout(() => {
        setMessage(""); // Clear the message
      }, 3000);
    } catch (error) {
      console.error("Error saving changes:", error);
      setMessage("Failed to save changes. Please try again."); // Set error message

      // Clear the error message after 3 seconds
      setTimeout(() => {
        setMessage(""); // Clear the message
      }, 2000);
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const handleEditClick = () => {
    requestAdminApproval();
  };

  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
        <div
          className="h-12 w-12 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/logo-dpp1.png')" }}
        ></div>
      </div>

      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Hello, <span className="text-blue-900 capitalize">{name}</span>
          </h2>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Notification />
            <UserDropdown />
          </div>
        </header>

        {/* Date Display */}
        <div className="flex justify-end pr-12 sm:pr-48 mb-4">
          <DateDisplay />
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-3/4 h-12 sm:h-20 bg-[#002F6C] mt-2 rounded-lg mx-auto"></div>

        {/* User Information Section */}
        <div className="w-full sm:w-3/4 mx-auto mt-8">
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            {/* Profile Section */}
            <div className="flex flex-col sm:flex-row items-center mb-6">
              <Image
                src="/assets/profile-pic.png"
                width={80}
                height={80}
                className="rounded-full"
                alt="Profile Picture"
              />
              <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
                <h3 className="text-xl font-bold capitalize">{name}</h3>
                <div>
                  {email ? (
                    <p className="text-gray-500">{email}</p> // Display email if fetched successfully
                  ) : (
                    <p>No email found.</p> // Fallback if no email is found
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div>
              {/* Email Field */}
              <div className="mb-4">
                {/* Email Label */}
                <label htmlFor="email" className="block text-black-900">
                  Email
                </label>

                {/* Non-Editable Email Field */}
                <input
                  type="email"
                  id="email"
                  placeholder="Loading email..."
                  value={email || ""} // Display the fetched email value
                  readOnly // Make it non-editable
                  className="mt-2 w-full h-[49px] p-2 rounded-[7.5px] bg-[#F9F9F9] "
                />
              </div>

              {/* Facility Name */}
              <div className="mb-4">
                <label htmlFor="facilityName" className="block text-black-900">
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
                  Facility Address
                </label>
                <select
                  id="facilityAddress"
                  value={facilityAddress}
                  onChange={(e) => setFacilityAddress(e.target.value)}
                  className={`mt-2 w-full h-[49px] p-2 rounded-[7.5px] ${
                    status === "approve" ? "bg-[#e2f3ff]" : "bg-[#F9F9F9]"
                  } transition-all text-gray-700`}
                  disabled={status !== "approve"} // Enable if status is "approve"
                >
                  <option value="">Select Facility Address</option>
                  <option value="address1">Address 1</option>
                  <option value="address2">Address 2</option>
                  <option value="address3">Address 3</option>
                  <option value="address4">Address 4</option>
                </select>
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
                  Request has been sent. Please check your email for approval.
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
    </div>
  );
}
export default authProtectedRoutes(facilitySetting);
