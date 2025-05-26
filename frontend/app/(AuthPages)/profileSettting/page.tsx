"use client"; // Mark this as a client component

import Image from "next/image";
import { useRef } from "react";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import authProtectedRoutes from "@/hoc/authProtectedRoutes";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import UserDropdown from "@/components/profile-dropdown";
import DateDisplay from "@/components/date";
import HeaderWithToggle from "@/components/HeaderWithToggle";
import { departmentPositions, roles } from "@/constants/dpp";
import { useProfileStore } from "@/stores/useUserStore";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importing Eye icons

function profileSetting() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [DepartmentName, setDepartmentName] = useState("");
  const [Position, setPosition] = useState("");
  const [role, setRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setImageUrl, imageUrl } = useProfileStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const positions = DepartmentName
    ? departmentPositions[DepartmentName] || []
    : [];
  // Function to toggle password visibility
  const toggleCurrentPassword = () =>
    setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  useEffect(() => {
    const storedEmail = Cookies.get("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (email) {
      fetchUserData();
    }
  }, [email]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch user data.");
      const data = await response.json();
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setDepartmentName(data.DepartmentName || "");
      setPosition(data.Position || "");
      setRole(data.role || "");
    } catch (error) {
      toast.error("Failed to fetch user data. Please try again.");
    }
  };
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill all password fields.");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match.");
    }

    setPasswordLoading(true);

    try {
      const token = Cookies.get("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      toast.success("Password changed successfully.");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Error changing password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSave = async () => {
    const updatedData = {
      firstname: firstName,
      lastname: lastName,
      // role,
      Position,
      DepartmentName,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/email`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, ...updatedData }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user data.");
      }

      const responseData = await response.json();

      if (responseData.firstname) {
        Cookies.set("name", responseData.firstname);
      }

      toast.success("User data updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update user data. Please try again.");
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // ✅
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 1) {
      toast.error("Image size exceeds 1 MB. Please choose a smaller file.");
      return;
    }

    try {
      const base64Image = await toBase64(file);
      const token = Cookies.get("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/upload-profile-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profileImage: base64Image }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Image upload failed.";

        try {
          const errorData = await response.json();
          if (
            errorData?.error?.toLowerCase().includes("entity too large") ||
            errorData?.message?.toLowerCase().includes("entity too large")
          ) {
            errorMessage =
              "Image is too large. Please choose a file under 1 MB.";
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch {}

        toast.error(errorMessage);
        return;
      }

      const data = await response.json();
      if (data?.profileImage) {
        setImageUrl(data.profileImage);
      }

      toast.success("Profile image saved successfully.");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

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

        const data = await response.json();
        if (data?.profileImage) {
          setImageUrl(data.profileImage); // ✅ shows new image instantly
        }
      } catch (error) {
        console.error("Fetch profile image error:", error);
      }
    };

    if (email) {
      fetchProfileImage();
    }
  }, [email]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row h-screen z-[-1]">
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
                Hello,{" "}
                <span className="text-blue-900 capitalize">
                  {name || "User"}
                </span>
              </h2>
              <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
                {/* <Notification /> */}
                <UserDropdown />
              </div>
            </header>
            <div className="flex justify-end pr-10 md:pr-12 mb-4">
              <div className="relative flex items-center space-x-2">
                <DateDisplay />
              </div>
            </div>
            <div className="px-12">
              <div className="w-ful h-12 sm:h-20 bg-[#002F6C] mt-2 rounded-lg mx-auto"></div>
              <div className="w-full  mx-auto mt-8 z-[-1]">
                <section className="bg-white p-6 rounded-lg shadow-md relative">
                  <div className="flex flex-col sm:flex-row items-center mb-6 relative">
                    <div className="relative w-[80px] h-[80px]">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          width={80}
                          height={80}
                          className="rounded-full object-cover"
                          alt="Profile Picture"
                        />
                      ) : (
                        <div className="w-[80px] h-[80px] rounded-full bg-gray-200" />
                      )}

                      <div
                        className="absolute -top-2 -left-1 bg-white rounded-full p-2 shadow cursor-pointer"
                        onClick={handleImageClick}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-800"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z"
                          />
                        </svg>
                      </div>

                      {/* Hidden Input for Image Upload */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {/* Name & Email */}
                    <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
                      <h3 className="text-xl font-bold capitalize">{name}</h3>
                      <p className="text-gray-500">{email}</p>
                    </div>

                    {/* Edit Button */}
                    <button
                      className="absolute top-6 right-6 bg-blue-900 text-white px-6 py-2 rounded-md"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!isEditing}
                        className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!isEditing}
                        className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Department</label>
                      <select
                        value={DepartmentName}
                        disabled={!isEditing}
                        onChange={(e) => setDepartmentName(e.target.value)}
                        className="pmt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
                      >
                        <option value="">Select Department</option>
                        {Object.keys(departmentPositions).map((key) => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700">Position</label>
                      <select
                        value={Position}
                        disabled={!isEditing || !positions.length}
                        onChange={(e) => setPosition(e.target.value)}
                        className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
                      >
                        <option value="">
                          {positions.length
                            ? "Select Position"
                            : "Select Department First"}
                        </option>
                        {positions.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* <div>
                      <label className="block text-gray-700">Role</label>
                      <select
                        value={role}
                        disabled={!isEditing}
                        onChange={(e) => setRole(e.target.value)}
                        className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
                      >
                        <option value="">Select Role</option>
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div> */}
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="mt-4 text-blue-900 font-bold underline text-lg"
                  >
                    Change Password
                  </button>
                  <div className="mt-12">
                    <p className="font-semibold mt-2 text-black">
                      View{" "}
                      <a
                        href="/privacypolicy"
                        className="text-blue-900 underline hover:text-blue-700"
                      >
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a
                        href="/termCondition"
                        className="text-blue-900 underline hover:text-blue-700"
                      >
                        Terms and Conditions
                      </a>
                      .
                    </p>
                  </div>

                  {isEditing && (
                    <div className="mt-6 text-center">
                      <button
                        className="bg-blue-900 text-white px-6 py-2 rounded-md"
                        onClick={() => {
                          handleSave();
                          setIsEditing(false);
                        }}
                      >
                        Save
                      </button>
                    </div>
                  )}
                  {showPasswordModal && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                      onClick={() => setShowPasswordModal(false)}
                    >
                      <div
                        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
                        onClick={(e) => e.stopPropagation()} // prevent closing modal when clicking inside
                      >
                        <h3 className="text-2xl font-bold mb-4 text-blue-900">
                          Change Password
                        </h3>

                        <div className="space-y-4">
                          {/* Current Password Field */}
                          <div>
                            <label className="block text-gray-700">
                              Current Password
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type={showCurrentPassword ? "text" : "password"} // Toggle password visibility
                                value={currentPassword}
                                onChange={(e) =>
                                  setCurrentPassword(e.target.value)
                                }
                                className="w-full p-2 border rounded mt-1"
                              />
                              <span
                                className="absolute right-2 cursor-pointer"
                                onClick={toggleCurrentPassword}
                              >
                                {showCurrentPassword ? (
                                  <FaEyeSlash className="text-gray-500" />
                                ) : (
                                  <FaEye className="text-gray-500" />
                                )}
                              </span>
                            </div>
                          </div>

                          {/* New Password Field */}
                          <div>
                            <label className="block text-gray-700">
                              New Password
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type={showNewPassword ? "text" : "password"} // Toggle password visibility
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 border rounded mt-1"
                              />
                              <span
                                className="absolute right-2 cursor-pointer"
                                onClick={toggleNewPassword}
                              >
                                {showNewPassword ? (
                                  <FaEyeSlash className="text-gray-500" />
                                ) : (
                                  <FaEye className="text-gray-500" />
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Confirm New Password Field */}
                          <div>
                            <label className="block text-gray-700">
                              Confirm New Password
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type={showConfirmPassword ? "text" : "password"} // Toggle password visibility
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
                                className="w-full p-2 border rounded mt-1"
                              />
                              <span
                                className="absolute right-2 cursor-pointer"
                                onClick={toggleConfirmPassword}
                              >
                                {showConfirmPassword ? (
                                  <FaEyeSlash className="text-gray-500" />
                                ) : (
                                  <FaEye className="text-gray-500" />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                          <button
                            onClick={() => setShowPasswordModal(false)}
                            className="px-5 py-2 border rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleChangePassword}
                            disabled={passwordLoading}
                            className="bg-blue-900 text-white px-5 py-3 rounded  disabled:opacity-50"
                          >
                            {passwordLoading ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default authProtectedRoutes(profileSetting);
