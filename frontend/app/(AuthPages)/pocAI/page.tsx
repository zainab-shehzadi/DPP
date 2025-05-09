"use client";
import React, { useState, useEffect, useRef, use } from "react";
import DateDisplay from "@/components/date";
import Sidebar from "@/components/Sidebar";
import UserDropdown from "@/components/profile-dropdown";
import { FaFileAlt, FaSlash } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import Notification from "@/components/Notification";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import authProtectedRoutes from "@/hoc/authProtectedRoutes";
import HeaderWithToggle from "@/components/HeaderWithToggle";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import TagDetailsView from "@/components/Modals/TagDetailView";
import HeaderBar from "@/components/HeaderBar";
import { set } from "mongoose";
import POCAllySection from "@/components/Modals/POCAllSections";
export interface TagResponseType {
  heading_sections?: any[];
  solution?: string[];
  supporting_references?: any[];
  Department?: any[];
  policies?: any[];
  task?: any[];
}

export interface TagType {
  _id: string;
  tag: string;
  shortDescription: string;
  longDescription: string;
  docPolicy?: string;
  status: "not assigned" | "assigned";
  pocStatus: "not approved" | "approved";
  response: TagResponseType;
}
interface DocumentType {
  _id: string;
  originalName: string;
  fileUrl?: string;
  uploadedAt: Date;
  tags: TagType[];
}

function docUpload() {
  const [tagsData, setTagsData] = useState<
    {
      id: number;
      tag: string;
      status: string;
      shortDesc: string;
      longDesc: string;
      solution: string;
      policies: string;
      stat;
      task: string;
    }[]
  >([]);
  const [token, setToken] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(
    null
  );
  const [tagData, setTagData] = useState<TagType | null>(null);

  const descRef = useRef<HTMLDivElement>(null);
  const correctionRef = useRef<HTMLDivElement>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  // const [selectedDocument, setSelectedDocument] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedID, setSelectedID] = useState<number | string | null>(null);
  const [selectedLongDesc, setSelectedLongDesc] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPPolicy] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("POC AI Ally");
  const [solution, setSolution] = useState("");
  const [dropdownOpen1, setDropdownOpen1] = useState(false);
  const [accessToken123, setAccessToken] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [refreshToken, setrefreshToken] = useState<string | null>(null);
  const [dropdownOpen2, setDropdownOpen2] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const scrollToCorrection = () => {
    correctionRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToTopOfDesc = () => {
    descRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    const token = Cookies.get("token");
    setToken(token);
  }, []);

  useEffect(() => {
    const storedAccessToken = Cookies.get("accessToken");
    const storedRefreshToken = Cookies.get("refreshToken");
    const storedEmail = Cookies.get("email");

    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }
    if (storedRefreshToken) {
      setrefreshToken(storedRefreshToken);
    }
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      console.error("Email not found in cookies.");
    }
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          console.error("Access token not found!");
          return;
        }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/docs`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        console.log("data", data);

        if (Array.isArray(data)) {
          setDocuments(data);
        } else {
          console.error("Invalid response:", data);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Error fetching documents");
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };
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

  const handleNavigateToTags = () => {
    router.push("/Tags");
  };

  const isAuthenticated = async () => {
    try {
      const safeEmail = email ?? "";

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/users/get-access-token?email=${encodeURIComponent(safeEmail)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      console.log("Response:", response);

      // const response = await fetch(
      //   `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/get-access-token`,
      //   {
      //     method: "POST",
      //     credentials: "include",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ email: safeEmail }),
      //   }
      // );

      const data = await response.json();
      const accessToken = data.accessToken;

      const refreshToken = data.refreshToken;

      if (!accessToken) {
        toast.error("Please log in with Google for assigned tasks.");
        router.push("/login");
        return false;
      }
      Cookies.set("accessToken", accessToken, { expires: 7 });
      Cookies.set("refreshToken", refreshToken, { expires: 30 });
      handleAssignTask();
      return true;
    } catch (error) {
      toast.error("Please log in with Google for assigned tasks.");
      router.push("/login");
      return false;
    }
  };
  const handleAssignTask = async () => {
    if (!selectedTask || selectedTask.length === 0) {
      toast.error("Please select at least one task before assigning.");
      return;
    }
    try {
      const accessToken = accessToken123;
      const tasks = selectedTask.map((taskSummary, index) => {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + index * 2);
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 48);

        return {
          summary: taskSummary,
          status: "pending",
          start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
          end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
        };
      });
      const saveResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/save-tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tagId: selectedID,
            tasks,
            //docId: selectedDocumentId, // Ensure this is a valid variable, not a function
          }),
        }
      );

      if (!saveResponse.ok) {
        const error = await saveResponse.json();
        toast.error("Failed to save tasks:", error);
        return;
      }

      const savedTasks = await saveResponse.json();

      for (let task of tasks) {
        const calendarResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/create-event`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(task),
          }
        );

        if (!calendarResponse.ok) {
          const error = await calendarResponse.json();
          console.error("Failed to create event:", error);
          continue;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/update-status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tagId: selectedID,
              status: "assigned",
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to update status");
        }
        setStatus(result.status);
      }

      toast.success("Events created successfully.");
    } catch (error) {
      toast.error(
        "An error occurred while assigning tasks. Check the console for details."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSidebarOpen(true);

    console.log({ selectedTag, selectedLongDesc, selectedID });

    if (![selectedTag, selectedLongDesc, selectedID].every(Boolean)) {
      toast.error("Please select a tag and ensure all fields are filled.");
      setIsSidebarOpen(false);
      return;
    }

    setIsSidebarLoading(true); // ✅ Start sidebar-specific loading

    const token = Cookies.get("token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/generatesol`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            documentId: selectedDocument?._id,
            tagId: selectedID,
            query: `I belong to Tag ${selectedTag}, "${selectedLongDesc}", `,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error - Status: ${response.status}`);
      }

      const result = await response.json();

      const updatedTag = result.tag;
      console.log("Updated Tag:", updatedTag);

      if (updatedTag) {
        setSolution(updatedTag.response.solution || []);
        setSelectedTask(updatedTag.response.task || []);
        setSelectedPPolicy(updatedTag.response.policies || []);

        setSelectedDocument((prevDoc) => {
          if (!prevDoc) return prevDoc;

          const updatedTags = prevDoc.tags.map((tag) =>
            tag._id === updatedTag._id ? updatedTag : tag
          );

          return { ...prevDoc, tags: updatedTags };
        });
      }

      setAnswer1("");
      setAnswer2("");
      toast.success("Solution generated and tags updated successfully!");
    } catch (error) {
      console.error("Generate error:", error);
      toast.error("An error occurred while generating the solution.");
    } finally {
      // ✅ End loading and close sidebar after slight delay
      setTimeout(() => {
        setIsSidebarLoading(false);
        setIsSidebarOpen(false);
      }, 1500);
    }
  };

  const handleTagClick = (tagName: string, tagId: string) => {
    setSelectedTag(tagName);
    setSelectedID(tagId);
    const tag = selectedDocument?.tags.find((t) => t._id === tagId);
    if (tag) {
      setTagData(tag);
      setSelectedTag(tag.tag);
      setSelectedLongDesc(tag.longDescription);
    }
  };

  const handleCheckboxChange = (docId) => {
    setSelectedDocs((prevSelected) =>
      prevSelected.includes(docId)
        ? prevSelected.filter((id) => id !== docId)
        : [...prevSelected, docId]
    );
  };
  const handleSelectDocument = (doc: DocumentType) => {
    setSelectedDocument(doc);
    setDropdownOpen(false);
  };

  const deleteDocuments = async (documentIds: string[]) => {
    if (!documentIds || documentIds.length === 0 || !email) {
      console.error("Missing required parameters: documentIds or email");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/delete-documents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentIds, email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Documents deleted successfully:", data);
        setDocuments(data);
        setSelectedDocs([]);
      } else {
        toast.error("Failed to delete documents:", data.message);
      }
    } catch (error) {
      console.error("Error deleting documents:", error);
    }
  };
  const handleDeleteSelected = () => {
    if (selectedDocs.length === 0) return;
    setSelectedDocument("Select Document");
    setSelectedDescription("");
    setSelectedLongDesc("");
    setSolution("");
    setSelectedPPolicy("");

    deleteDocuments(selectedDocs);
    setSelectedTag("Select Tag");

    setSelectedDocs([]);
    setDropdownOpen(false);
  };
  const toggleDropdown2 = () => {
    if (!selectedDocument) {
      toast.warning("Please select a document first!");
      return;
    }
    setDropdownOpen2(!dropdownOpen2);
  };
  const toggleDropdown1 = () => setDropdownOpen1(!dropdownOpen1);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleCopy = () => {
    if (boxRef.current) {
      const textToCopy = (boxRef.current as HTMLDivElement).innerText;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast.success("Content copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };
  const handleEdit = () => {
    if (boxRef.current) {
      setEditedText(boxRef.current.innerText);
      setIsModalOpen(true);
    }
  };
  const handleSaveChanges = async () => {
    if (!boxRef.current || !selectedDocumentId || !selectedID) {
      toast.error("❌ Missing required data. Please try again.");
      return;
    }

    const updatedSolution = editedText.trim() === "" ? null : editedText.trim(); // ✅ Convert empty text to null
    const safeEmail = email ?? ""; // Ensure email is not undefined
    const documentId = selectedDocumentId;
    const tagId = selectedID;

    // ✅ Log request data before sending
    console.log("Sending API request with:", {
      email: safeEmail,
      id: documentId,
      tagId: tagId,
      solution: updatedSolution,
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/updateSolution`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: safeEmail,
            id: documentId,
            tagId: tagId,
            solution: updatedSolution, // ✅ Sends null if empty
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text(); // Get more error details
        console.error(
          `❌ Failed to save changes: ${response.status} ${response.statusText}`,
          errorText
        );
        toast.error(
          `❌ Failed to save changes: ${response.status} ${response.statusText}`
        );
        return;
      }

      const data = await response.json();
      console.log("✅ Successfully updated:", data);

      let newSolution = data.updatedSolution || [];

      setTagsData((prevTags) =>
        prevTags.map((tag) =>
          tag.id.toString() === tagId.toString()
            ? { ...tag, solution: newSolution }
            : tag
        )
      );

      setSolution(newSolution);
      setEditedText(newSolution ? newSolution.join("\n") : ""); // ✅ Handle null safely

      toast.success("✅ Plan of Correction updated successfully!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ Error saving data:", error);
      toast.error(
        "❌ Failed to save changes. Please check your connection and try again."
      );
    }
  };
  const handleApprove = async () => {
    if (!selectedID) return toast.error("No tag selected to approve");
    if (!selectedDocumentId)
      return toast.error("No document selected to approve");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/update-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tagId: selectedID,
            status: "approved",
            docId: selectedDocumentId,
            email: email,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      const result = await response.json();
      toast.success("✅ Tag approved!");

      setTagsData((prev) =>
        prev.map((tag) =>
          tag.id === selectedID ? { ...tag, status: "approved" } : tag
        )
      );
      setStatus("approved");
    } catch (err) {
      console.error(" Error:", err);
      toast.error("❌ Failed to approve tag.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
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
            <HeaderBar />

            <div className="flex items-center space-x-4 mt-4 lg:mt-8 ml-4 lg:ml-10 justify-between z-[-1]">
              <div className="flex items-center space-x-4">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-900">
                  Facility
                </h3>
                <div
                  className="relative ml-2 sm:ml-4 lg:ml-6"
                  ref={dropdownRef}
                >
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center bg-[#244979] text-white font-semibold text-sm px-3 py-2 rounded-lg"
                  >
                    <span className="font-[Plus Jakarta Sans]">
                      {selectedDocument?.originalName || "Select Document"}
                    </span>
                    <svg
                      className="w-4 h-4 ml-2 transition-transform duration-200"
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
                      ></path>
                    </svg>
                  </button>
                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-lg z-50 border border-gray-200">
                      {documents.length > 0 ? (
                        <>
                          {documents.map((doc, index) => (
                            <div
                              key={doc._id || index}
                              className="flex items-center px-4 py-2 hover:bg-gray-200"
                            >
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={selectedDocs.includes(doc._id)}
                                onChange={() => handleCheckboxChange(doc._id)}
                              />
                              <button
                                onClick={() => handleSelectDocument(doc)}
                                className="w-full text-left text-gray-800 text-xs sm:text-sm"
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
                        </>
                      ) : (
                        <p className="px-4 py-2 text-gray-500 text-xs sm:text-sm">
                          No documents found.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Facility Tabs */}
              <div className="flex flex-col items-center w-full lg:w-auto mx-auto">
                {/* Tab Buttons */}
                <div className="flex items-center justify-center space-x-4 sm:space-x-6 lg:space-x-8">
                  <button
                    onClick={() => setActiveTab("POC AI Ally")}
                    className={`pb-2 ${
                      activeTab === "POC AI Ally"
                        ? "text-blue-900 font-semibold"
                        : "text-gray-700 font-medium"
                    } text-xs sm:text-sm md:text-base lg:text-lg`}
                  >
                    POC AI Ally
                  </button>

                  <button
                    onClick={() => setActiveTab("Tags")}
                    className={`pb-2 ${
                      activeTab === "Tags"
                        ? "text-blue-900 font-semibold"
                        : "text-gray-700 font-medium"
                    } text-xs sm:text-sm md:text-base lg:text-lg`}
                  >
                    Tags
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full mt-2">
                  <div className="absolute h-[3px] w-full bg-gray-300 rounded-full"></div>

                  <div
                    className="absolute h-[3px] bg-blue-900 rounded-full transition-all duration-300"
                    style={{
                      width: "50%",
                      left: activeTab === "POC AI Ally" ? "0%" : "50%",
                    }}
                  ></div>
                </div>
              </div>

              <div className="relative flex items-center space-x-2">
                <DateDisplay />
              </div>
            </div>

            {activeTab === "POC AI Ally" &&
              (() => {
                return (
                  <POCAllySection
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedDocument={selectedDocument}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    handleTagClick={handleTagClick}
                    selectedLongDesc={selectedLongDesc}
                    scrollToCorrection={scrollToCorrection}
                    scrollToTopOfDesc={scrollToTopOfDesc}
                    descRef={descRef}
                    correctionRef={correctionRef}
                    tagData={tagData}
                    solution={solution}
                    handleCopy={handleCopy}
                    handleEdit={handleEdit}
                    isSidebarOpen={isSidebarOpen}
                    loading={loading}
                    isSidebarLoading={isSidebarLoading}
                    toggleSidebar={toggleSidebar}
                    answer1={answer1}
                    setAnswer1={setAnswer1}
                    answer2={answer2}
                    setAnswer2={setAnswer2}
                    handleSubmit={handleSubmit}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    editedText={editedText}
                    setEditedText={setEditedText}
                    handleSaveChanges={handleSaveChanges}
                    boxRef={boxRef}
                    handleApprove={handleApprove}
                    handleNavigateToTags={handleNavigateToTags}
                    isAuthenticated={isAuthenticated}
                  />
                );
              })()}
            {activeTab === "Tags" &&
              (() => {
                return (
                  <TagDetailsView
                    selectedTag={selectedTag || ""}
                    selectedLongDesc={selectedLongDesc || ""}
                    tagsData={tagsData}
                    handleTagClick={handleTagClick}
                    setDropdownOpen2={setDropdownOpen2}
                  />
                );
              })()}
          </div>
        </>
      )}
    </div>
  );
}
export default authProtectedRoutes(docUpload);
