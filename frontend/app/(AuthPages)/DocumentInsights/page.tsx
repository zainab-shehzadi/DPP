"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import UserDropdown from "@/components/profile-dropdown";
import Sidebar from "@/components/Sidebar";
import DateDisplay from "@/components/date";
import Notification from "@/components/Notification";
import HeaderWithToggle from "@/components/HeaderWithToggle";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface DocumentType {
  _id: string;
  originalName: string;
  fileUrl?: string;
  uploadedAt: Date;
}
interface User {
  _id: string;
  createdAt: string;
  firstname: string;
  lastname?: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [documents, setDocuments] = useState<DocumentType[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const fetchUserDocuments = async (userId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/user-docs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setDocuments(data); // ✅ store all documents
      } else {
        toast.error(data.message || "Failed to fetch user documents");
        setDocuments([]);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      toast.error("Failed to fetch user documents");
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/User123`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched users:", data);

        // ✅ Filter Facility Admins only
        const facilityAdmins = data.filter(
          (user: any) => user.role === "Facility Admin"
        );

        console.log("Facility Admins:", facilityAdmins);
        setUsers(facilityAdmins);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row">
      <HeaderWithToggle onToggleSidebar={toggleSidebar} />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {loading ? (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600" />
        </div>
      ) : (
        <div className="lg:ml-64 p-4 sm:p-8 w-full">
          <header className="flex items-center justify-between mb-6 flex-wrap">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
              Hello, <span className="text-blue-900 capitalize">{name}</span>
            </h2>
            <div className="flex items-center space-x-4">
              {/* <Notification /> */}
              <UserDropdown />
            </div>
          </header>

          <div className="flex items-center justify-between mb-6 ">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg lg:text-2xl font-bold text-blue-900">
                Facility
              </h3>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center bg-[#244979] text-white text-sm px-3 py-2 rounded-lg"
                >
                  {(() => {
                    const selectedUser = users.find(
                      (u) => u._id === selectedUserId
                    );
                    return selectedUser
                      ? `${selectedUser.firstname} ${
                          selectedUser.lastname || ""
                        }`
                      : "Select Facility Admin";
                  })()}

                  <svg
                    className="w-4 h-4 ml-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{
                      transform: dropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-lg z-50 border border-gray-200">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center px-4 py-2 hover:bg-gray-200"
                      >
                        <button
                          onClick={async () => {
                            setSelectedUserId(user._id);
                            await fetchUserDocuments(user._id);
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left text-gray-800 text-sm"
                        >
                          {user.firstname} {user.lastname || ""}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DateDisplay />
          </div>

          <div className="border-t border-gray-300 mt-4" />

          {/* Document Cards with Count & Styling */}
          <div className="bg-white p-6 rounded-lg shadow-md mx-auto mt-8 w-auto border border-gray-200">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Documents
            </h3>

            <div
              className="grid gap-6 p-2"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <div
                    key={doc._id}
                    className="flex flex-col items-start bg-gray-50 border border-gray-300  p-4"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Image
                        src="/assets/box.png"
                        alt="Doc Icon"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                      <span className="text-lg font-semibold text-blue-900">
                        Document {index + 1}
                      </span>
                    </div>

                    <p className="text-gray-700 text-md truncate w-full">
                      Document Name: {doc.originalName || "Untitled Document"}
                    </p>

                    <p className="text-md text-gray-400 mt-1">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-600 py-8 col-span-full">
                  No documents found for the selected admin.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
