"use client"; // <-- Add this line to mark this file as a client component

import Image from "next/image";
import { FaBell } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Admin-sidebar";
import { toast } from "react-toastify";
import authProtectedRoutes from "@/hoc/authProtectedRoutes";
import axios from "axios";
import DateDisplay from "@/components/date";
interface User {
  _id: string;
  createdAt: string;
  firstname: string;
  lastname: string;
  Position: string;
  role: string;
  DepartmentName: string;
  email: string;
}

const usersetting = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Selected user to edit
  const [successMessage, setSuccessMessage] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState("");

  const departmentPositions = {
    "Business Office": [
      "Office Manager",
      "Biller",
      "Payroll",
      "Reception",
      "Admissions",
    ],
    "Director of Admissions": ["Liaison"],
    Activities: ["Director of Activities", "Activity Staff"],
    Maintenance: ["Director of Maintenance", "Maintenance Staff"],
    Dietary: ["Director of Dietary", "Dietitian", "Dietary Staff"],
    Therapy: ["Director of Therapy", "Therapy Staff"],
    Laundry: ["Laundry Supervisor"],
    Housekeeping: ["Housekeeping Supervisor"],
    "Case Management": ["Case Manager"],
    MDS: ["Director of MDS", "MDS Staff"],
    Nursing: [
      "Director of Nursing",
      "Assistant Director of Nursing",
      "Unit Manager",
    ],
    Administration: ["Administrator", "Administrator in Training"],
    "Social Services": ["Social Services Director", "Social Services Staff"],
    "Staff Development Department": ["Staff Development Coordinator"],
    "Nursing Department": ["Nursing Development Coordinator"],
    "Quality Assurance Department": ["Nursing Development Coordinator"],
  };

  const roleCategories = {
    leadership: ["Director", "Manager", "Supervisor"],
    supporting: ["Staff", "Assistant", "Liaison"],
  };
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const leadershipRoles = roleCategories.leadership;
  const supportingRoles = roleCategories.supporting;
  const positions = departmentName
    ? departmentPositions[departmentName] || []
    : [];
  const getAllUser = async () => {
    try {
      const response = await axios.get(
        "https://dpp-backend.vercel.app/api/users/User123"
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getAllUser();
  }, []);

  const handleUpdate = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/fetch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: userId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setSelectedUser(userData);
      setDepartmentName(userData.DepartmentName || "");
      setPosition(userData.Position || "");
      setRole(userData.role || "");

      // Open modal
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data. Please try again.");
    }
  };
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedUser._id) {
      toast.error("User ID is required to update the user.");
      return;
    }

    try {
      const id = selectedUser._id;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, ...selectedUser }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update user");
      }

      // Update UI after successful update
      setUsers(
        users.map((user) =>
          user._id === selectedUser._id ? { ...user, ...selectedUser } : user
        )
      );

      toast.success("User updated successfully");
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    }
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };
  const handleDelete = async (id: string | null) => {
    setIsDeleteModalOpen(false);
    if (!id) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }), // Send id in the request body
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete user with ID: ${id}`);
      }
      setUsers(users.filter((user) => user._id !== id));
      toast.success("User deleted successfully!");
      setIsDeleteModalOpen(false); // Close the confirmation modal after successful deletion
    } catch (error) {
      toast.error("Error deleting user");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Hello, <span className="text-blue-900">User</span>
          </h2>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <FaBell className="text-gray-500 text-lg" />
            <div className="flex items-center border border-gray-300 p-2 rounded-md space-x-2">
              <Image
                src="/assets/image.png"
                width={40}
                height={40}
                className="rounded-full"
                alt="User Profile"
              />
              <span className="text-gray-800">User</span>
            </div>
          </div>
        </header>

        {/* Date Display */}
        <div className="flex justify-end pr-4 sm:pr-12 lg:pr-48 mb-4"><DateDisplay/></div>
        
        {/* Progress Bar */}
        <div className="w-full sm:w-3/4 h-6 sm:h-12 lg:h-18 bg-[#002F6C] mt-2 rounded-lg mx-auto mb-8"></div>
        <div className="overflow-y-auto mx-auto max-w-[980px]">
          <table className="max-w-[1200px] w-full text-left border-collapse border border-[#F2F2F2]">
            <thead>
              <tr className="bg-gray-100 text-black border-b border-[#F2F2F2]">
                <th className="px-6 py-6 text-left font-semibold text-sm">
                  Select
                </th>
                <th className="px-6 py-6 text-left font-semibold text-sm">
                  User ID
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Date
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  User Name
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Email Address
                </th>
                <th className="px-6 py-4 text-left font-semibold text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {[...new Map(users.map((user) => [user._id, user])).values()] // Remove duplicates
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                ) // Sort in descending order
                .map((user, index) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-100 border-b border-[#F2F2F2] text-gray-900"
                  >
                    <td className="py-5 px-8">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4 px-6 text-blue-700 text-sm">
                      #{user._id}
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">
                      {user.createdAt}
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">
                      {user.firstname}
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">{user.email}</td>
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          className="text-blue-500 hover:text-blue-700 text-sm"
                          onClick={() => handleUpdate(user._id)}
                          title="Update User"
                        >
                          <Image
                            src="/assets/update.png"
                            alt="Update"
                            width={16}
                            height={16}
                            style={{ width: "auto", height: "auto" }}
                          />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteClick(user._id)}
                          title="Delete User"
                        >
                          <Image
                            src="/assets/delete.png"
                            alt="Delete"
                            width={16}
                            height={16}
                            style={{ width: "auto", height: "auto" }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {isDeleteModalOpen && (
  <div
    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
    onClick={() => setIsDeleteModalOpen(false)} // Close when clicking outside
  >
    <div
      className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
      onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
    >
      <h2 className="text-md font-semibold text-gray-800 text-center">
        Are you sure you want to delete this user?
      </h2>

      <div className="flex justify-end space-x-4 mt-4">
        <button
          onClick={() => setIsDeleteModalOpen(false)}
          className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400"
        >
          No
        </button>
        <button
          onClick={() => handleDelete(userToDelete)}
          className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-700"
        >
          Yes
        </button>
      </div>
    </div>
  </div>
)}

      {/* Update Modal */}
      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleModalClose}
        >
          <div
            className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg space-y-6 overflow-y-auto max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-gray-800 text-center">
              Update User
            </h2>
            {successMessage && (
              <div
                className="mb-4 rounded-lg bg-green-100 px-4 py-2 text-green-700 border border-green-500"
                role="alert"
              >
                {successMessage}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {/* Email */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>

              {/* First Name */}
              <div className="mb-4">
                <label
                  htmlFor="firstname"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstname"
                  value={selectedUser.firstname}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      firstname: e.target.value,
                    })
                  }
                  className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>

              {/* Last Name */}
              <div className="mb-4">
                <label
                  htmlFor="lastname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastname"
                  value={selectedUser.lastname || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      lastname: e.target.value,
                    })
                  }
                  className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-gray-700">Department</label>
                <select
                  value={selectedUser.DepartmentName || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      DepartmentName: e.target.value,
                    })
                  }
                  className="mt-2 w-full p-2 rounded-md bg-[#e2f3ff]"
                >
                  <option value="" disabled>
                    Select a Department
                  </option>
                  {Object.keys(departmentPositions).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-gray-700">Position</label>
                <select
                  value={selectedUser.Position || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      Position: e.target.value,
                    })
                  }
                  className="mt-2 w-full p-2 rounded-md bg-[#e2f3ff]"
                >
                  <option value="" disabled>
                    {positions.length
                      ? "Select a Position"
                      : "Select a Department First"}
                  </option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="block text-gray-700">Role</label>
                <select
                  value={selectedUser.role || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                  className="mt-2 w-full p-2 rounded-md bg-[#e2f3ff]"
                >
                  <option value="" disabled>
                    Select a Role
                  </option>
                  <optgroup label="Leadership Roles">
                    {leadershipRoles.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Supporting Roles">
                    {supportingRoles.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-900 text-white py-2 px-6 rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default authProtectedRoutes(usersetting);
