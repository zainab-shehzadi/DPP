"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Cookies from "js-cookie";
import UserDropdown from "@/components/profile-dropdown";

interface User {
  _id: string;
  createdAt: string;
  firstname: string;
  email: string;
  role: string;
  facilityName: string;
}

const Adduser = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // useEffect(() => {
  //   fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/User123`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const facilityAdmins = data.filter(
  //         (user: any) => user.role === "Facility Users"
  //       );
  //       setUsers(facilityAdmins);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching data:", error);
  //     });
  // }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/User123`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // send empty body or payload if required
          }
        );

        const data = await res.json();
        const facilityAdmins = data.filter(
          (user: any) => user.role === "Facility Users"
        );
        console.log("Fetched Users:", facilityAdmins);
        setUsers(facilityAdmins);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Pagination calculations
  const sortedUsers = [...new Map(users.map((u) => [u._id, u])).values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  // Pagination handlers
  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1;
    else if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Mobile Topbar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
        <button onClick={toggleSidebar} className="text-2xl">
          ☰
        </button>
        <img src="/assets/logo-dpp1.png" alt="Logo" className="h-8 w-auto" />
      </div>
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
          <div className="lg:ml-64 sm:p-8 w-full">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Hello, <span className="text-blue-900">{name}</span>
              </h2>
              <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
                <UserDropdown />
              </div>
            </header>

            {/* Add User Button */}
            <div className="w-full sm:w-3/4 mx-auto text-center mb-10">
              <p className="text-gray-600 text-sm sm:text-base leading-6 mb-4">
                Click the button below to add facility user
              </p>
              <Link href="/AddUser">
                <button
                  className="bg-[#002F6C] text-white px-6 py-3 rounded-md text-lg font-semibold"
                  style={{ width: "298px", height: "53px" }}
                >
                  Add Facility User
                </button>
              </Link>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto ">
              <table className="min-w-full text-left border-collapse border border-[#F2F2F2]">
                <thead>
                  <tr className="bg-gray-100 text-black border-b border-[#F2F2F2]">
                    <th className="px-6 py-6 font-semibold text-sm">Sr.N</th>
                    <th className="px-6 py-4 font-semibold text-sm">Date</th>
                    <th className="px-6 py-4 font-semibold text-sm">
                      User Name
                    </th>
                    <th className="px-6 py-4 font-semibold text-sm">
                      Email Address
                    </th>
                    <th className="px-6 py-4 font-semibold text-sm">
                      Facility
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, idx) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 border-b border-[#F2F2F2] text-gray-900 text-sm"
                    >
                      <td className="py-4 px-6 text-blue-700 font-medium">
                        {indexOfFirstUser + idx + 1}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(user.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {user.firstname}
                      </td>
                      <td className="py-4 px-6 text-gray-700">{user.email}</td>
                      <td className="py-4 px-6 text-gray-700">
                        {user.facilityName || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-blue-900 border-blue-900 hover:bg-blue-900 hover:text-white"
                }`}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded border ${
                      page === currentPage
                        ? "bg-blue-900 text-white border-blue-900"
                        : "text-blue-900 border-blue-900 hover:bg-blue-900 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded border ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-blue-900 border-blue-900 hover:bg-blue-900 hover:text-white"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Adduser;
