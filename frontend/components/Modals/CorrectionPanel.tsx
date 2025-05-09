import React, { useEffect } from "react";
import { FaFileAlt } from "react-icons/fa";
import GeneratePOCSidebar from "./GeneratePOCSidebar";

interface CorrectionPanelProps {
  tagData: any;
  solution: string[];
  handleCopy: () => void;
  handleEdit: () => void;
  isSidebarOpen: boolean;
  loading: boolean;
  isSidebarLoading: boolean; // ✅ ADD THIS

  toggleSidebar: () => void;
  answer1: string;
  setAnswer1: (text: string) => void;
  answer2: string;
  setAnswer2: (text: string) => void;
  handleSubmit: () => void;
  boxRef: React.RefObject<HTMLDivElement>;
  handleApprove: () => void;
  handleNavigateToTags: () => void;
  isAuthenticated: () => void;
  status: string;
}

const CorrectionPanel: React.FC<CorrectionPanelProps> = ({
  tagData,
  solution,
  handleCopy,
  handleEdit,
  isSidebarOpen,
  loading,
  isSidebarLoading, // ✅ DESTRUCTURE HERE

  toggleSidebar,
  answer1,
  setAnswer1,
  answer2,
  setAnswer2,
  handleSubmit,
  boxRef,
  handleApprove,
  handleNavigateToTags,
  isAuthenticated,
  status,
}) => {
  useEffect(() => {
    console.log("Sidebar Open:", isSidebarOpen, "Loading:", loading);
  }, [isSidebarOpen, loading]);

  const hasSolution =
    Array.isArray(tagData?.response?.solution) &&
    tagData.response.solution.length > 0;

  return (
    <div
      className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between"
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
          {hasSolution ? (
            tagData.response.solution.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))
          ) : (
            <li>No solution available.</li>
          )}
        </ul>
      </div>

      {/* Generate POC Button */}
      {!hasSolution && (
        <div className="flex items-center justify-center mt-10">
          <button
            onClick={toggleSidebar}
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

      {/* Action Buttons */}
      {hasSolution && (
        <div className="flex justify-end space-x-4 mt-4">
          {status !== "assigned" && (
            <>
              <button
                onClick={isAuthenticated}
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
                {loading ? "Assigning..." : "Assign Task"}
              </button>

              {status === "approved" ? (
                <button
                  disabled
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-md cursor-not-allowed"
                >
                  ✅ Approved
                </button>
              ) : (
                <button
                  onClick={handleApprove}
                  className="bg-[#002F6C] text-white px-4 py-2 rounded-lg text-sm shadow-md hover:bg-blue-800 transition"
                >
                  Approve
                </button>
              )}
            </>
          )}

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
