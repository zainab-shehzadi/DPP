"use client"; // <-- Add this line to mark this file as a client component

import Image from "next/image";
import { FaBell } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import axios from "axios";
import DateDisplay from "@/components/date";
import { departmentPositions, departmentLabels, roles } from "@/constants/dpp";
import Sidebar from "@/components/Sidebar";
import UserDropdown from "@/components/profile-dropdown";
interface User {
  _id: string;
  createdAt: string;
  firstname: string;
  lastname: string;
  Position: string;
  role: string;
  DepartmentName: string;
  facilityName: string;
  email: string;
}

export default function UserSetting() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [DepartmentName, setDepartmentName] = useState("");
  const [roleFilter, setRoleFilter] = useState("Facility Users");

  const [role, setRole] = useState("");
  const Positions = DepartmentName
    ? departmentPositions[DepartmentName] || []
    : [];
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const filteredUsers =
    roleFilter === "All"
      ? users
      : users.filter((user) => user.role === roleFilter);
  const totalUsers = filteredUsers.filter((u) =>
    ["Facility Users"].includes(u.role)
  ).length;

  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // const getAllUser = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/User123`
  //     );
  //     setUsers(response.data);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  const getAllUser = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/User123`,
        {} // empty body
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    getAllUser();
  }, []);

  const handleUpdate = async (userId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/fetch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId }),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch user data");
      const userData = await response.json();
      if (userData.role === "Facility Users") {
        const facilityRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/facility-admins`,
          {
            method: "POST", // changed to POST
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // send empty body or payload if required
          }
        );
        const facilityList = await facilityRes.json();
        console.log("facilityList: ", facilityList);
        setFacilities(
          facilityList?.facilities?.map((f) => f.facilityName) || []
        );
      } else {
        setFacilities([]);
      }

      setSelectedUser({
        ...userData,
        DepartmentName: userData.DepartmentName || "",
        Position: userData.Position || "",
        facility: userData.facilityName || "",
      });

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
      // Destructure role out, and pick relevant fields including DepartmentName and Position
      const {
        _id,
        firstname,
        lastname,
        email,
        DepartmentName,
        Position,
        facilityName,
        role,
        ...rest
      } = selectedUser;

      const payload = {
        id: _id,
        firstname,
        lastname,
        email,
        DepartmentName,
        Position,
        facilityName,
        ...rest,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update user");
      }
      setUsers(
        users.map((user) => (user._id === _id ? { ...user, ...payload } : user))
      );

      toast.success("User updated successfully");
      setTimeout(() => setIsModalOpen(false), 1000);
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
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete user with ID: ${id}`);
      }
      setUsers(users.filter((user) => user._id !== id));
      toast.success("User deleted successfully!");
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Error deleting user");
    }
  };
  const roleFromCookie = Cookies.get("role")?.toLowerCase();
  const visibleUsers =
    roleFromCookie === "facility admin"
      ? users.filter((u) => u.role.toLowerCase() === "user")
      : users; // else show all

  const name = Cookies.get("name");
  return (
    <div className="flex flex-col lg:flex-row h-screen">
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
          {/* Main Content */}
          <div className="lg:ml-64 p-4 sm:p-8 w-full overflow-x-hidden">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Hello, <span className="text-blue-900">{name}</span>
              </h2>
              <div className="flex items-center space-x-4">
                {/* <Notification /> */}
                <UserDropdown />
              </div>
            </header>

            {roleFromCookie !== "facility admin" && (
              <div className="flex justify-start items-center gap-3 mb-6 mt-20">
                <label
                  htmlFor="roleFilter"
                  className="text-blue-900 font-extrabold text-xl "
                >
                  Filter by Role:
                </label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => {
                    const selectedRole = e.target.value;
                    setLoading(true);
                    setRoleFilter(selectedRole);
                    setTimeout(() => {
                      setLoading(false);
                    }, 300);
                  }}
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  {/* <option value="Facility Admin">Facility Admin</option> */}
                  <option value="Facility Users">Facility Users</option>
                </select>
              </div>
            )}

            {loading ? (
              <div className="text-center text-blue-900 font-semibold mt-4">
                Loading users...
              </div>
            ) : (
              <>{/* Render your filtered users here */}</>
            )}

            {/* Progress Bar */}
            <div className="w-full h-[60px] bg-[#002F6C] mt-2 rounded-lg mx-auto mb-8"></div>
            <div className=" overflow-x-auto mx-auto w-full max-w-full">
              <table className="min-w-[1000px] w-full  border-collapse border border-[#F2F2F2]">
                <thead>
                  <tr className="bg-gray-100 text-black border-b border-[#F2F2F2]">
                    <th className="px-6 py-6 text-left font-semibold text-sm">
                      User ID
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-sm">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-sm">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-sm">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-sm">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {["Facility Admin", "Facility Users"].map((roleGroup) => {
                    const roleUsers = filteredUsers
                      .filter((u) => u.role === roleGroup)
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      );

                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const paginatedUsers = roleUsers.slice(
                      startIndex,
                      startIndex + itemsPerPage
                    );

                    if (paginatedUsers.length === 0) return null;

                    return (
                      <React.Fragment key={roleGroup}>
                  

                        {paginatedUsers.map((user, idx) => (
                          <tr
                            key={user._id}
                            className="border-b border-[#F2F2F2] text-gray-900"
                          >
                            <td className="py-4 px-6 text-blue-700 text-sm">
                              {startIndex + idx + 1}
                            </td>
                            <td className="py-4 px-6 text-gray-500 text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6 text-gray-500 text-sm">
                              {user.firstname}
                            </td>
                            <td className="py-4 px-6 text-gray-500 text-sm">
                              {user.email}
                            </td>
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
                                    width={14}
                                    height={14}
                                  />
                                </button>

                                {/* Show Delete button only if user is NOT a Facility Admin */}
                                {user.role !== "Facility Admin" && (
                                  <button
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteClick(user._id)}
                                    title="Delete User"
                                  >
                                    <Image
                                      src="/assets/delete.png"
                                      alt="Delete"
                                      width={14}
                                      height={14}
                                    />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 gap-2 text-sm font-medium text-gray-700">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md border ${
                    currentPage === 1
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-white hover:bg-blue-100 border-blue-900 text-blue-900"
                  }`}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-md border ${
                        currentPage === pageNum
                          ? "bg-blue-900 text-white border-blue-900"
                          : "bg-white text-blue-900 hover:bg-blue-100 border-blue-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md border ${
                    currentPage === totalPages
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-white hover:bg-blue-100 border-blue-900 text-blue-900"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white p-5 rounded-lg shadow-lg w-full max-w-sm space-y-6"
            onClick={(e) => e.stopPropagation()}
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

              <div>
                <label className="block text-gray-700">Department</label>
                <select
                  value={selectedUser?.DepartmentName || ""}
                  onChange={(e) =>
                    setSelectedUser((prev) => ({
                      ...prev!,
                      DepartmentName: e.target.value,
                      Position: "",
                    }))
                  }
                  className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
                >
                  <option value="">Select Department</option>
                  {Object.keys(departmentPositions).map((key) => (
                    <option key={key} value={key}>
                      {departmentLabels[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700">Position</label>
                <select
                  value={selectedUser?.Position || ""}
                  onChange={(e) =>
                    setSelectedUser((prev) => ({
                      ...prev!,
                      Position: e.target.value,
                    }))
                  }
                  disabled={!selectedUser?.DepartmentName}
                  className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
                >
                  <option value="">
                    {selectedUser?.DepartmentName
                      ? "Select Position"
                      : "Select Department First"}
                  </option>
                  {(
                    departmentPositions[selectedUser?.DepartmentName || ""] ||
                    []
                  ).map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser?.role === "Facility Users" && (
                <div>
                  <label className="block text-gray-700">Assign Facility</label>
                  <select
                    value={selectedUser?.facilityName || ""}
                    onChange={(e) =>
                      setSelectedUser((prev) => ({
                        ...prev!,
                        facilityName: e.target.value,
                      }))
                    }
                    className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
                  >
                    <option value="">Select Facility</option>
                    {facilities.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-gray-700">Role</label>
                <input
                  type="text"
                  value={selectedUser.role}
                  disabled
                  className="mt-2 w-full p-2 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

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
                  className="bg-blue-900 text-white py-2 px-6 rounded-md hover:bg-blue-900"
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
}
