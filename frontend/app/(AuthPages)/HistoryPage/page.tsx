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

interface DeficiencyType {
  _id: string;
  Tag: string;
  Description: string;
  Deficiency: string;
  Solution?: Record<string, string>;
  status?: "pending" | "approved" | "assigned";
}

interface DocumentType {
  _id: string;
  originalName: string;
  fileUrl?: string;
  uploadedAt: Date;
  deficiencies?: DeficiencyType[];
}

export default function Dashboard() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [tagsData, setTagsData] = useState<DeficiencyType[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleTagClick = (tagItem: DeficiencyType) => {
    if (!selectedDocumentId) {
      toast.error("Please select a document first.");
      return;
    }

    localStorage.setItem("selectedTag", tagItem.Tag);
    localStorage.setItem("selectedTagID", tagItem._id);
    localStorage.setItem("selectedDocumentId", selectedDocumentId);
    router.push("/pocAI");
  };

  const handleCheckboxChange = (docId: string) => {
    setSelectedDocs((prevSelected) =>
      prevSelected.includes(docId)
        ? prevSelected.filter((id) => id !== docId)
        : [...prevSelected, docId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedDocs.length === 0 || !email) return;
    deleteDocuments(selectedDocs);
    setSelectedDocument("Select Document");
    setSelectedDocs([]);
    setDropdownOpen(false);
  };

  const deleteDocuments = async (documentIds: string[]) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/delete-documents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentIds, email }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success("Documents deleted successfully");
        setDocuments(data);
      } else {
        toast.error("Failed to delete documents");
      }
    } catch (err) {
      console.error("Error deleting documents:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const storedEmail = Cookies.get("email");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  // useEffect(() => {
  //   const fetchDocuments = async () => {
  //     try {
  //       const token = Cookies.get("token");
  //       if (!token) {
  //         toast.error("Token missing");
  //         return;
  //       }

  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/docs`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       const data = await res.json();

  //       if (Array.isArray(data) && data.length > 0) {
  //         setDocuments(data);

  //         // ✅ Auto-select first document
  //         const firstDoc = data[0];
  //         setSelectedDocument(firstDoc.originalName);
  //         setSelectedDocumentId(firstDoc._id);
  //         setTagsData(firstDoc.deficiencies || []);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching documents:", err);
  //       toast.error("Failed to load documents");
  //     }
  //   };

  //   fetchDocuments();
  // }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = Cookies.get("token");
        const facilityId = Cookies.get("selectedFacilityId");
        if (!token) {
          console.error("Access token not found!");
          return;
        }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/docs`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ facilityId }),
          }
        );

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setDocuments(data);

      
          const firstDoc = data[0];
          setSelectedDocument(firstDoc.originalName);
          setSelectedDocumentId(firstDoc._id);
          setTagsData(firstDoc.deficiencies.data || []);
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
        toast.error("Failed to load documents");
      }
    };

    fetchDocuments();
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
                  {selectedDocument || "Select Document"}
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
                    {documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center px-4 py-2 hover:bg-gray-200"
                      >
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={selectedDocs.includes(doc._id)}
                          onChange={() => handleCheckboxChange(doc._id)}
                        />
                        <button
                          onClick={() => {
                            setSelectedDocument(doc.originalName);
                            setSelectedDocumentId(doc._id);
                            setTagsData(doc.deficiencies || []);
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left text-gray-800 text-sm"
                        >
                          {doc.originalName || "Untitled Document"}
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleDeleteSelected}
                      disabled={selectedDocs.length === 0}
                      className={`block w-full text-center px-4 py-2 mt-2 font-semibold ${
                        selectedDocs.length > 0
                          ? "bg-red-600 text-white"
                          : "bg-gray-400 text-gray-300"
                      } rounded-b-lg`}
                    >
                      Delete Selected
                    </button>
                  </div>
                )}
              </div>
            </div>
            <DateDisplay />
          </div>

          <div className="border-t border-gray-300 mt-4" />

          {/* Tag Cards */}
          <div className="bg-white p-6 rounded-lg shadow-md mx-auto mt-8 w-auto border border-gray-200">
            <div
              className="grid gap-4 p-4"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              }}
            >
              {tagsData.length > 0 ? (
                tagsData.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-start bg-white border border-gray-300 rounded-xl shadow-sm p-3 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleTagClick(item)}
                  >
                    <div className="flex items-center space-x-2">
                      <Image
                        src="/assets/box.png"
                        alt="File Icon"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                      <span className="font-semibold text-gray-800 text-sm truncate max-w-[100px]">
                        {item.Tag}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-600 py-8 col-span-full">
                  Please select a document to see deficiencies.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
