"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Cookies from "js-cookie";
import UserDropdown from "@/components/profile-dropdown";

interface User {
  _id: string;
  facilityAdmin: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    facilityCode: string;
    facilityName: string;
    facilityAddress: string;
    departmentName: string;
    position: string;
    status: string;
    priceType: string;
    priceCycle: string;
  };
  requestType: string;
  requestedAt: string;
  status: "pending" | "approve" | "rejected";
}

const AddRegionalAdmin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [sortBy, setSortBy] = useState("facilityCode");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facilityCodeFilter, setFacilityCodeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [facilityCodes, setFacilityCodes] = useState<string[]>([]);

  const usersPerPage = 10;

  // const fetchFacilityCodes = async () => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/facility-codes`
  //     );
  //     const data = await response.json();
  //     if (data.success) {
  //       setFacilityCodes(data.facilityCodes);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching facility codes:", error);
  //   }
  // };

  const fetchFacilityCodes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/facility-codes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setFacilityCodes(data.facilityCodes);
      }
    } catch (error) {
      console.error("Error fetching facility codes:", error);
    }
  };

  // const fetchRequests = async () => {
  //   setLoading(true);
  //   try {
  //     const queryParams = new URLSearchParams({
  //       page: currentPage.toString(),
  //       limit: usersPerPage.toString(),
  //       sortBy,
  //       sortOrder,
  //       ...(statusFilter !== "all" && { status: statusFilter }),
  //       ...(facilityCodeFilter && { facilityCode: facilityCodeFilter }),
  //       ...(searchTerm && { search: searchTerm }),
  //     });

  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/requests?${queryParams}`
  //     );
  //     const data = await response.json();

  //     if (data.success) {
  //       setUsers(data.data);
  //       setTotalPages(data.pagination.totalPages);
  //       setTotalRequests(data.pagination.totalRequests);
  //     } else {
  //       console.error("Error fetching requests:", data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching requests:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const requestBody = {
        page: currentPage,
        limit: usersPerPage,
        sortBy,
        sortOrder,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(facilityCodeFilter && { facilityCode: facilityCodeFilter }),
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalRequests(data.pagination.totalRequests);
      } else {
        console.error("Error fetching requests:", data.message);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    newStatus: "approve" | "rejected"
  ) => {
    setUpdating(requestId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/request/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchRequests();
        toast.success(`Request ${newStatus} successfully!`);
      } else {
        toast.error(
          `Error ${
            newStatus === "approve" ? "approving" : "rejecting"
          } request: ${data.message}`
        );
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Error updating request status");
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchFacilityCodes();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [
    currentPage,
    sortBy,
    sortOrder,
    statusFilter,
    facilityCodeFilter,
    searchTerm,
  ]);

  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1;
    else if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRequests();
  };

  const name = Cookies.get("name");

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
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

      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Hello, <span className="text-blue-900">{name}</span>
          </h2>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
            <UserDropdown />
          </div>
        </header>

        <div className="w-full sm:w-3/4 mx-auto text-center mb-10">
          <p className="text-gray-600 text-sm sm:text-base leading-6 mb-4">
            Click the button below to add regional admin
          </p>
          <Link href="/RegionalAdmin">
            <button
              className="bg-[#002F6C] text-white px-6 py-3 rounded-md text-lg font-semibold"
              style={{ width: "298px", height: "53px" }}
            >
              Add Regional Admin
            </button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <form
            onSubmit={handleSearch}
            className="flex flex-wrap gap-4 items-end"
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, facility..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approve">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility Code
              </label>
              <select
                value={facilityCodeFilter}
                onChange={(e) => setFacilityCodeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Facilities</option>
                {facilityCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#002F6C] text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Showing {users.length} of {totalRequests} requests
        </div>

        {loading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse border border-[#F2F2F2]">
                <thead>
                  <tr className="bg-gray-100 text-black border-b border-[#F2F2F2]">
                    <th className="px-6 py-4 font-semibold text-sm">Sr.No</th>
                    <th
                      className="px-6 py-4 font-semibold text-sm cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort("requestedAt")}
                    >
                      Date {getSortIcon("requestedAt")}
                    </th>
                    <th
                      className="px-6 py-4 font-semibold text-sm cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort("facilityCode")}
                    >
                      Facility Code {getSortIcon("facilityCode")}
                    </th>
                    <th
                      className="px-6 py-4 font-semibold text-sm cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort("adminName")}
                    >
                      Admin Name {getSortIcon("adminName")}
                    </th>
                    <th className="px-6 py-4 font-semibold text-sm">Email</th>
                    <th className="px-6 py-4 font-semibold text-sm">
                      Facility Name
                    </th>
                    <th
                      className="px-6 py-4 font-semibold text-sm cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort("status")}
                    >
                      Status {getSortIcon("status")}
                    </th>
                    <th className="px-6 py-4 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...users]
                    .sort(
                      (a, b) =>
                        new Date(b.requestedAt).getTime() -
                        new Date(a.requestedAt).getTime()
                    )
                    .map((user, index) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 border-b text-gray-900 text-sm"
                      >
                        <td className="py-4 px-6 text-blue-700 font-medium">
                          {(currentPage - 1) * usersPerPage + index + 1}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {new Date(user.requestedAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="py-4 px-6 text-gray-700 font-medium">
                          {user.facilityAdmin.facilityCode}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {user.facilityAdmin.firstname}{" "}
                          {user.facilityAdmin.lastname}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {user.facilityAdmin.email}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {user.facilityAdmin.facilityName}
                        </td>
                        <td className="py-4 px-6">
                          <span className={getStatusBadge(user.status)}>
                            {user.status.charAt(0).toUpperCase() +
                              user.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {user.status === "pending" ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  updateRequestStatus(user._id, "approve")
                                }
                                disabled={updating === user._id}
                                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                              >
                                {updating === user._id
                                  ? "Updating..."
                                  : "Approve"}
                              </button>
                              <button
                                onClick={() =>
                                  updateRequestStatus(user._id, "rejected")
                                }
                                disabled={updating === user._id}
                                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
                              >
                                {updating === user._id
                                  ? "Updating..."
                                  : "Reject"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">
                              {user.status === "approve"
                                ? "Approve"
                                : "Rejected"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-white bg-[#002F6C] hover:bg-blue-700"
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
                        ? "bg-[#002F6C] text-white"
                        : "text-white bg-[#002F6C] hover:bg-blue-700"
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
                    : "text-white bg-[#002F6C] hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddRegionalAdmin;
