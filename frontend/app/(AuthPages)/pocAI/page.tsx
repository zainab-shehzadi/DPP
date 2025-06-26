"use client";
import React, { useState, useEffect, useRef, use } from "react";
import DateDisplay from "@/components/date";
import Sidebar from "@/components/Sidebar";

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

function docUpload() {
  const [token, setToken] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(
    null
  );
  const [policy, setPolicy] = useState<string[]>([]);
  const [selectedPolicyID, setSelectedPolicyID] = useState<string | null>(null);
  const [AIPolicy, setAIPolicy] = useState<string[]>([]);
  const [data, setData] = useState<any>(null);
  const [supportingData, setSupportingData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"Tags" | "POC AI Ally">(
    "POC AI Ally"
  );
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const boxRef = React.useRef<HTMLUListElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedID, setSelectedID] = useState<number | string | null>(null);
  const [selectedLongDesc, setSelectedLongDesc] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [solution, setSolution] = useState<string[]>([]);
  const [dropdownOpen1, setDropdownOpen1] = useState(false);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [dropdownOpen2, setDropdownOpen2] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const matchingDeficiency = selectedDocument?.deficiencies?.data?.find(
    (def) => def?.Tag === selectedTag
  );
  useEffect(() => {
    const token = Cookies.get("token");
    setToken(token);
  }, []);

  // useEffect(() => {
  //   const fetchDocuments = async () => {
  //     try {
  //       const token = Cookies.get("token");
  //       if (!token) {
  //         console.error("Access token not found!");
  //         return;
  //       }
  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/docs`,
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       const data = await res.json();
  //       console.log("data", data);

  //       if (Array.isArray(data)) {
  //         setDocuments(data);
  //       } else {
  //       }
  //     } catch (error) {
  //       console.error("Error fetching documents:", error);
  //       toast.error("Error fetching documents");
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
        console.log("Response:", res);
        const data = await res.json();
        console.log("data", data);

        if (Array.isArray(data)) {
          setDocuments(data);
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

      return true;
    } catch (error) {
      toast.error("Please log in with Google for assigned tasks.");
      router.push("/login");
      return false;
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSidebarOpen(true);
    setIsSidebarLoading(true);

    // Update matchingDeficiency access
    const matchingDeficiency = selectedDocument?.deficiencies?.data?.find(
      (def) => def.Tag === selectedTag
    );

    const payload = {
      fileId: selectedDocumentId,
      tags: selectedTag ? [selectedTag] : [],
      deficiencies: matchingDeficiency?.Deficiency
        ? [matchingDeficiency.Deficiency]
        : [],
    };

    console.log("Payload:", payload);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/get-poc-api`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error - Status: ${response.status}`);
      }

      const result = await response.json();

      // 🔹 DEBUG: Check the actual response structure
      console.log("Full API Result:", result);
      console.log("Result data type:", typeof result.data);
      console.log("Is result.data an array?", Array.isArray(result.data));

      // Handle different response structures
      let dataArray = [];
      if (Array.isArray(result.data)) {
        dataArray = result.data;
      } else if (Array.isArray(result)) {
        dataArray = result;
      } else if (result.data && Array.isArray(result.data.data)) {
        dataArray = result.data.data;
      } else {
        console.error("Unexpected response structure:", result);
        toast.error("Unexpected response format from server.");
        return;
      }

      const normalize = (tag: string) => tag.replace(/\s+/g, "").trim();
      const matched = dataArray.find(
        (item: any) => normalize(item.Tag) === normalize(selectedTag || "")
      );

      setData(dataArray);
      if (matched?.Solution?.length) {
        setSolution(matched.Solution);
        console.log("Solution:", matched.Solution);
      } else {
        setSolution([]);
      }

      setAnswer1("");
      setAnswer2("");

      toast.success("Solution generated and tags updated successfully!");
    } catch (error) {
      console.error("Generate error:", error);
      toast.error("An error occurred while generating the solution.");
    } finally {
      setTimeout(() => {
        setIsSidebarLoading(false);
        setIsSidebarOpen(false);
      }, 1500);
    }
  };
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSidebarOpen(true);
  //   setIsSidebarLoading(true);

  //   const payload = {
  //     fileId: selectedDocumentId,
  //     tags: selectedTag ? [selectedTag] : [],
  //     deficiencies: matchingDeficiency?.Deficiency
  //       ? [matchingDeficiency.Deficiency]
  //       : [],
  //   };

  //   console.log("Payload:", payload);
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/get-poc-api`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`API Error - Status: ${response.status}`);
  //     }

  //     const result = await response.json();
  //     console.log("API Result:", result.data);
  //     const normalize = (tag: string) => tag.replace(/\s+/g, "").trim();
  //     const matched = result.data.find(
  //       (item: any) => normalize(item.Tag) === normalize(selectedTag || "")
  //     );

  //     setData(result.data);
  //     if (matched?.Solution?.length) {
  //       setSolution(matched.Solution);
  //       console.log("Solution:", matched.Solution);
  //     } else {
  //       setSolution([]);
  //     }

  //     setAnswer1("");
  //     setAnswer2("");

  //     toast.success("Solution generated and tags updated successfully!");
  //   } catch (error) {
  //     console.error("Generate error:", error);
  //     toast.error("An error occurred while generating the solution.");
  //   } finally {
  //     setTimeout(() => {
  //       setIsSidebarLoading(false);
  //       setIsSidebarOpen(false);
  //     }, 1500);
  //   }
  // };
  const handleTagClick = (tag: string, defId: string) => {
    setSelectedTag(tag);
    setSelectedID(defId);
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
    setSelectedDocumentId(doc._id);
    setDropdownOpen(false);
  };

  const handleDeleteSelected = async () => {
    const token = Cookies.get("token");

    if (!selectedDocs || selectedDocs.length === 0 || !token) {
      toast.error("Missing token or document IDs");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/delete-documents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ documentIds: selectedDocs }),
        }
      );
      if (response.ok) {
        toast.success(" Documents deleted successfully");
        setDocuments((prevDocs) =>
          prevDocs.filter((doc) => !selectedDocs.includes(doc._id))
        );
        setSelectedDocs([]);
        setSelectedDocument(null);
        setDropdownOpen(false);
      } else {
        toast.error(" Failed to delete documents");
      }
    } catch (error) {
      console.error("Error deleting documents:", error);
      toast.error(" Something went wrong.");
    }
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
      const textToCopy = (boxRef.current as HTMLUListElement).innerText;
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
  if (!boxRef.current) return;

  // ✅ FIXED: Correct path for matchingDeficiency
  const matchingDeficiency = selectedDocument?.deficiencies?.data?.find(
    (def) => def.Tag === selectedTag
  );

  const fallbackDeficiency = data?.find((d: any) => d.Tag === selectedTag);

  const solutionToRender =
    matchingDeficiency?.Solution &&
    typeof matchingDeficiency.Solution === "object"
      ? matchingDeficiency.Solution
      : fallbackDeficiency?.Solution &&
        typeof fallbackDeficiency.Solution === "object"
      ? fallbackDeficiency.Solution
      : null;

  if (!solutionToRender) {
    toast.error("No solution data to edit.");
    return;
  }

  try {
    const formattedText = Object.entries(solutionToRender)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    setEditedText(formattedText);
    setIsModalOpen(true);
  } catch (err) {
    toast.error("Failed to prepare data for editing.");
  }
};

const handleSaveChanges = async () => {
  if (!boxRef.current || !selectedDocumentId || !selectedID) {
    toast.error("Missing required data. Please try again.");
    return;
  }

  const token = Cookies.get("token");
  if (!token) {
    toast.error("User not authenticated.");
    return;
  }

  // ✅ FIXED: Get fresh matchingDeficiency reference
  const matchingDeficiency = selectedDocument?.deficiencies?.data?.find(
    (def) => def.Tag === selectedTag
  );

  // 🔄 Convert textarea back to object format
  const lines = editedText.trim().split("\n");
  const solutionObject = {};

  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length > 0) {
      solutionObject[key.trim()] = rest.join(":").trim();
    }
  }

  const updatedSolution =
    Object.keys(solutionObject).length > 0 ? solutionObject : null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/updateSolution`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          tagId: selectedID,
          solution: updatedSolution,
        }),
      }
    );

    const data = await response.json();
    const newSolution = data.updatedSolution || {};

    setSolution(newSolution);
    setSelectedDocument((prev) => {
      const updatedData = prev.deficiencies.data.map((def) =>
        def.Tag === selectedTag ? { ...def, Solution: newSolution } : def
      );
      
      return {
        ...prev,
        deficiencies: {
          ...prev.deficiencies,
          data: updatedData
        }
      };
    });

    const formattedText = Object.entries(newSolution)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    setEditedText(formattedText);
    toast.success("Plan of Correction updated successfully!");
    setIsModalOpen(false);
  } catch (error) {
    console.error("❌ Error saving data:", error);
    toast.error(
      "❌ Failed to save changes. Please check your connection and try again."
    );
  }
};
  const handleTabClick = (tabName: any) => {
    if (tabName === "Tags" && !selectedDocument) {
      toast.error("Please select a document first.");
      return;
    }
    setActiveTab(tabName);
  };

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!selectedTag || !matchingDeficiency?.Deficiency) return;

      const token = Cookies.get("token");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/fetch-policy-by-tag`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              tag: selectedTag,
              deficiency: matchingDeficiency.Deficiency,
              fileID: selectedDocument?._id,
            }),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch policy.");
        }
        const data = await res.json();

        const firstPolicy = data.policy?.[0];

        // ✅ Set policy ID properly
        if (firstPolicy?._id) {
          setSelectedPolicyID(firstPolicy._id);
          console.log("Policy ID:", firstPolicy._id);
        } else {
          setSelectedPolicyID(null);
        }
        setAIPolicy(firstPolicy?.updatedPolicy?.solution_policies || []);
        setSupportingData(
          firstPolicy?.updatedPolicy?.supporting_references || []
        );
        setPolicy(firstPolicy?.policies || []);
      } catch (error) {
        console.error("Error fetching policy:", error);
      }
    };

    fetchPolicy();
  }, [selectedTag, matchingDeficiency]);

  const navigateToPOCTab = (tag: string, def: string, fullData: any) => {
    setSelectedTag(tag);
    setSelectedDocument(fullData);
    setActiveTab("POC AI Ally");
  };

  useEffect(() => {
    const savedTag = localStorage.getItem("selectedTag");
    const savedDocId = localStorage.getItem("selectedDocumentId");
    const selectedTagID = localStorage.getItem("selectedTagID");

    if (savedTag && savedDocId && documents.length > 0) {
      const matchedDoc = documents.find((doc) => doc._id === savedDocId);
      if (matchedDoc) {
        setSelectedTag(savedTag);
        setSelectedDocument(matchedDoc);
        setSelectedDocumentId(matchedDoc._id);
        setSelectedID(selectedTagID);
      }
      localStorage.removeItem("selectedTag");
      localStorage.removeItem("selectedDocumentId");
    }
  }, [documents]);

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

            <div className="flex items-center space-x-4 mt-4 lg:mt-8  justify-between z-[-1]">
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
                    onClick={() => handleTabClick("Tags")}
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
                    data={data}
                    selectedID={selectedID}
                    selectedPolicyID={selectedPolicyID}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedDocument={selectedDocument}
                    setSelectedDocument={setSelectedDocument}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    handleTagClick={handleTagClick}
                    policy={policy}
                    AIPolicy={AIPolicy}
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
                    handleNavigateToTags={handleNavigateToTags}
                    isAuthenticated={isAuthenticated}
                  />
                );
              })()}
            {activeTab === "Tags" &&
              (() => {
                return (
                  <TagDetailsView
                    navigateToPOCTab={navigateToPOCTab}
                    selectedDocument={selectedDocument}
                    selectedTag={selectedTag || ""}
                    selectedLongDesc={selectedLongDesc || ""}
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
