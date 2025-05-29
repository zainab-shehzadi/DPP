import React, { useEffect, useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import GeneratePOCSidebar from "./GeneratePOCSidebar";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface CorrectionPanelProps {
  data: any;
  selectedTag: string | null;
  selectedDocument: any;
  solution: string[];
  handleCopy: () => void;
  handleEdit: () => void;
  isSidebarOpen: boolean;
  loading: boolean;
  isSidebarLoading: boolean;
  policy: string[];
  AIPolicy: string[];
  toggleSidebar: () => void;
  answer1: string;
  setAnswer1: (text: string) => void;
  answer2: string;
  setAnswer2: (text: string) => void;
  handleSubmit: () => void;
  boxRef: React.RefObject<HTMLDivElement>;
  setSelectedDocument: (doc: any) => void;
  handleNavigateToTags: () => void;
  isAuthenticated: () => void;
}

const CorrectionPanel: React.FC<CorrectionPanelProps> = ({
  data,
  selectedDocument,
  setSelectedDocument,
  selectedTag,
  solution,
  handleCopy,
  handleEdit,
  isSidebarOpen,
  isSidebarLoading,
  loading,
  toggleSidebar,
  answer1,
  setAnswer1,
  answer2,
  setAnswer2,
  handleSubmit,
  boxRef,
  handleNavigateToTags,
  isAuthenticated,
  policy,
  AIPolicy,
}) => {
  const router = useRouter();
  const [userRole, setUserRole] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [assignLoading, setAssignLoading] = React.useState(false);
  const matchingDeficiency = selectedDocument?.deficiencies?.find(
    (def) => def.Tag === selectedTag
  );
  const status = matchingDeficiency?.status;

  const handlePOCClick = () => {
    const hasPolicy = policy && policy.length > 0;
    const hasAIPolicy = AIPolicy && AIPolicy.length > 0;

    if (hasPolicy || hasAIPolicy) {
      toggleSidebar();
    } else {
      toggleSidebar();
      // toast.error("Firstly generate policy for Plan of Correction.");
    }
  };

  const handleApprove = async () => {
    try {
      const token = Cookies.get("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/approve-tag`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            documentId: selectedDocument._id,
            tagId: selectedDocument?.deficiencies?.find(
              (d) => d.Tag === selectedTag
            )?._id,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to approve tag");
      }

      toast.success("Tag approved successfully!");
      setSelectedDocument((prev) => {
        const updatedDefs = prev.deficiencies.map((d) =>
          d.Tag === selectedTag ? { ...d, status: "approved" } : d
        );
        return { ...prev, deficiencies: updatedDefs };
      });
    } catch (error) {
      toast.error("Could not approve tag.");
      console.error("Approve error:", error);
    }
  };

  const assignTask = async () => {
    const token = Cookies.get("token");
    setAssignLoading(true);

    const rawSolution =
      matchingDeficiency?.Solution &&
      typeof matchingDeficiency.Solution === "object"
        ? matchingDeficiency.Solution
        : data?.find((d: any) => d.Tag === selectedTag)?.Solution;

    if (!rawSolution || Object.keys(rawSolution).length === 0) {
      toast.error("No solution available to assign.");
      setAssignLoading(false);
      return;
    }

    const valuesOnly = Object.entries(rawSolution)
      .map(([_, value]) => value)
      .filter((text: any) => text && !text.trim().endsWith("?"));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/assign-task-api`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            solution: valuesOnly,
            documentId: selectedDocument._id,
            documentName: selectedDocument.originalName,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.taskGroupId) {
        throw new Error(result.message || "Failed to assign task");
      }

      toast.success("Task assigned successfully.");
     
      localStorage.setItem("selectedDocumentId", selectedDocument._id);
      router.push("/TaskListPage");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
      console.error("Assign Task Error:", error);
    } finally {
      setAssignLoading(false); 
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );

        const data = await res.json();
        if (res.ok) {
          setUserRole(data.user.role); // assuming `role` is inside `user`
        } else {
          console.error("Failed to get user info:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div
      className=" border shadow-lg rounded-lg p-4 sm:p-6 flex flex-col justify-between h-[calc(90vh-140px)] overflow-auto"
      ref={boxRef}
    >
      {/* Header */}
      <div>
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55]">
            Plan of Correction
          </h4>
          <div className="flex space-x-4">
            <button
              onClick={handleCopy}
              className="relative group p-2 rounded-lg hover:bg-gray-200 transition"
              title="Copy"
            >
              <img src="/assets/copy.png" alt="Copy" className="w-5 h-5" />
            </button>

            <button
              onClick={handleEdit}
              className="relative group p-2 rounded-lg hover:bg-gray-200 transition"
              title="Edit"
            >
              <img src="/assets/edit.png" alt="Edit" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Solution List */}
        <ul
          className="list-disc list-inside text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mt-6"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {(() => {
            const fallbackDeficiency = data?.find(
              (d: any) => d.Tag === selectedTag
            );
            const solutionToRender =
              matchingDeficiency?.Solution &&
              typeof matchingDeficiency.Solution === "object"
                ? matchingDeficiency.Solution
                : fallbackDeficiency?.Solution &&
                  typeof fallbackDeficiency.Solution === "object"
                ? fallbackDeficiency.Solution
                : null;

            if (solutionToRender) {
              return Object.entries(solutionToRender).map(
                ([key, value]: [any, any], index: number) => (
                  <li
                    key={index}
                    className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E]"
                  >
                    <strong>
                      {key
                        .replace(/_/g, " ")
                        .replace(/^\w/, (c) => c.toUpperCase())}
                      :
                    </strong>{" "}
                    {value}
                  </li>
                )
              );
            }

            return (
              <li className="list-none text-sm sm:text-base lg:text-md font-light text-[#33343E]">
                Deficiency description will appear here once you generate Plan
                of Correction...
              </li>
            );
          })()}
        </ul>
      </div>

      {/* Generate POC Button */}
      {!(
        (matchingDeficiency?.Solution &&
          Object.keys(matchingDeficiency.Solution).length > 0) ||
        (data?.find((d: any) => d.Tag === selectedTag)?.Solution &&
          Object.keys(data.find((d: any) => d.Tag === selectedTag)!.Solution)
            .length > 0)
      ) && (
        <div className="flex items-center justify-center mt-10">
          <button
            onClick={handlePOCClick}
            className="flex items-center justify-center bg-[#002F6C] text-white w-[160px] h-[40px] rounded-lg text-sm shadow-md transition-colors duration-300"
          >
            <FaFileAlt className="mr-2" />
            <span>Generate POC</span>
          </button>
        </div>
      )}

      {isSidebarOpen && (
        <>
          <GeneratePOCSidebar
            loading={isSidebarLoading}
            answer1={answer1}
            answer2={answer2}
            setAnswer1={setAnswer1}
            setAnswer2={setAnswer2}
            toggleSidebar={toggleSidebar}
            handleSubmit={handleSubmit}
          />

          {!loading && (
            <div
              className="fixed inset-0 bg-black opacity-50 z-40"
              onClick={toggleSidebar}
            ></div>
          )}
        </>
      )}
      {((matchingDeficiency?.Solution &&
        Object.keys(matchingDeficiency.Solution).length > 0) ||
        (data?.find((d: any) => d.Tag === selectedTag)?.Solution &&
          Object.keys(data.find((d: any) => d.Tag === selectedTag)!.Solution)
            .length > 0)) && (
        <div className="flex justify-end space-x-4 mt-4">
          {status === "approved" &&
            !userLoading &&
            ["Facility Admin", "Regional Admin"].includes(userRole) && (
              <button
                onClick={assignTask}
                className={`flex items-center justify-center border border-[#002F6C] text-[#002F6C] px-4 py-2 rounded-lg text-sm shadow-md transition-colors duration-300 ${
                  loading
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-gray-100"
                }`}
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553 4.553-4.553 4.553m-6-9L4.447 14.553 9 19"
                  />
                </svg>
                {assignLoading ? "Assigning..." : "Assign Task"}
              </button>
            )}

          {status === "approved" ? (
            <button
              disabled
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-md cursor-not-allowed"
            >
              ✅ Approved
            </button>
          ) : status !== "assigned" ? (
            <button
              onClick={handleApprove}
              disabled={loading}
              className={`bg-[#002F6C] text-white px-4 py-2 rounded-lg text-sm shadow-md transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-800"
              }`}
            >
              {loading ? "Approving..." : "Approve"}
            </button>
          ) : null}

          {/* Optional: still show Assigned tag if needed */}
          {status === "assigned" && (
            <button
              onClick={handleNavigateToTags}
              className={`flex items-center justify-center border border-[#002F6C] text-[#002F6C] px-4 py-2 rounded-lg text-sm shadow-md transition-colors duration-300 ${
                loading ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100"
              }`}
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.553 4.553-4.553 4.553m-6-9L4.447 14.553 9 19"
                />
              </svg>
              Assigned
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CorrectionPanel;
