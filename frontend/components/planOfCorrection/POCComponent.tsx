// components/POCAIAllyView.tsx
"use client";
import React from "react";
import { FaFileAlt } from "react-icons/fa";

interface POCAIAllyViewProps {
  selectedDocument: string;
  tagsData: any[];
  selectedTag: string | null;
  selectedLongDesc: string | null;
  solution: string[];
  isSidebarOpen: boolean;
  loading: boolean;
  isModalOpen: boolean;
  editedText: string;
  descRef: React.RefObject<HTMLDivElement>;
  correctionRef: React.RefObject<HTMLDivElement>;
  boxRef: React.RefObject<HTMLDivElement>;
  onTagClick: (tag: string, id: string) => void;
  onScrollToCorrection: () => void;
  onScrollToTop: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onSaveChanges: () => void;
  toggleSidebar: () => void;
  onSubmit: (e: any) => void;
  answer1: string;
  answer2: string;
  setAnswer1: (val: string) => void;
  setAnswer2: (val: string) => void;
  setEditedText: (text: string) => void;
  setIsModalOpen: (open: boolean) => void;
  setSelectedTag: (tag: string) => void;
}

const POCAIAllyView: React.FC<POCAIAllyViewProps> = ({
  selectedDocument,
  tagsData,
  selectedTag,
  selectedLongDesc,
  solution,
  isSidebarOpen,
  loading,
  isModalOpen,
  editedText,
  descRef,
  correctionRef,
  boxRef,
  onTagClick,
  onScrollToCorrection,
  onScrollToTop,
  onCopy,
  onEdit,
  onSaveChanges,
  toggleSidebar,
  onSubmit,
  answer1,
  answer2,
  setAnswer1,
  setAnswer2,
  setEditedText,
  setIsModalOpen,
  setSelectedTag,
}) => {
  const handleTagClick = async (tagName, tagId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tag-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tagId, tagName }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error - Status: ${response.status}`);
      }

      const result = await response.json();

      let newSolution = result.solution || [];
      let newPolicies = result.policies || [];
      let newTasks = result.task || [];

      if (!Array.isArray(newSolution)) newSolution = [newSolution];
      if (!Array.isArray(newPolicies)) newPolicies = [newPolicies];
      if (!Array.isArray(newTasks)) newTasks = [newTasks];

      setStatus(result.status);
      setSelectedTag(tagName);
      setSelectedID(tagId);
      setSelectedTask(newTasks);
      setSelectedPPolicy(newPolicies);
      setSelectedDescription(
        result.shortDescription || "No short description available"
      );
      setSelectedLongDesc(
        result.longDescription || "No long description available"
      );
      setSolution(newSolution);
    } catch (error) {
      console.error("❌ Error fetching tag details:", error);
      toast.error(`Error`);
    }
  };
  return (
    <div>
      <>
        <div
          className="w-full border-t border-gray-300 mt-4"
          style={{ borderColor: "#E0E0E0" }}
        ></div>

        <div className="flex flex-col lg:flex-row justify-center mt-4 lg:mt-8 space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Left Container */}
          <div className="bg-white shadow-lg p-4 sm:p-6 flex flex-col justify-between w-full lg:w-[350px] h-auto rounded-lg border border-[#E0E0E0] mx-auto">
            <div>
              <h4 className="font-bold text-blue-900 text-lg mb-4">Tags</h4>
              <div>
                <div
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg shadow-md p-2"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  <ul className="flex flex-col gap-2">
                    {!selectedDocument ||
                    (selectedDocument &&
                      tagsData[selectedDocument]?.length === 0) ? (
                      <p className="text-xs text-gray-500 text-center p-2">
                        All tags will be shown here after selecting specific
                        document.
                      </p>
                    ) : null}

                    {tagsData.map((item, index) => (
                      <li
                        key={item.id || index}
                        className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-all duration-300 flex items-center gap-2
              ${
                selectedTag === item.tag
                  ? "bg-blue-900 text-white shadow-lg"
                  : "bg-white hover:bg-blue-100"
              }`}
                        onClick={() => {
                          setSelectedTag(item.tag);
                          handleTagClick(item.tag, item.id);
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-900"></span>
                        <strong>{item.tag}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* {selectedDescription && (
                          <div
                            className="mt-4 text-[14px] leading-[17.64px] font-light"
                            style={{
                              color: "#33343E",
                              fontFamily: "Plus Jakarta Sans, sans-serif",
                            }}
                          >
                            {selectedDescription}
                          </div>
                        )} */}
              </div>
            </div>
          </div>

          {/* Center Container */}
          <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
            <div ref={descRef}>
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55]">
                  {selectedTag || "Select a Tag"}
                </h4>

                {selectedLongDesc && (
                  <button
                    onClick={scrollToCorrection}
                    className="bg-gray-100 border p-2 rounded-full shadow"
                    title="Scroll Down"
                  >
                    ⬇️
                  </button>
                )}
              </div>

              {/* Long Description */}
              <div
                className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] space-y-4"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {selectedLongDesc ? (
                  selectedLongDesc
                    .split(/(?<=\.)\s+/)
                    .map((sentence, index) => {
                      const isBulletPoint = /^[A-Z]\.|^\d+\./.test(
                        sentence.trim()
                      );
                      return isBulletPoint ? (
                        <ul key={index} className="list-disc pl-6">
                          <li className="mb-2">{sentence.trim()}</li>
                        </ul>
                      ) : (
                        <p key={index} className="mb-2">
                          {sentence.trim()}
                        </p>
                      );
                    })
                ) : (
                  <p>
                    Long description will appear here once you select a tag.
                  </p>
                )}
              </div>

              <div ref={correctionRef} className="mt-12">
                {selectedLongDesc && (
                  <div className="flex justify-end">
                    <button
                      onClick={scrollToTopOfDesc}
                      className="bg-gray-100 border p-2 rounded-full shadow"
                      title="Scroll Up"
                    >
                      ⬆️
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between"
            ref={boxRef}
          >
            <div>
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55]">
                  Plan of Correction
                </h4>
                <div className="flex space-x-4">
                  {/* Copy Button */}
                  <button
                    onClick={handleCopy}
                    className="relative group p-2 rounded-lg hover:bg-gray-200 transition"
                    title="Copy"
                  >
                    <img
                      src="/assets/copy.png"
                      alt="Copy"
                      className="w-5 h-5"
                    />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={handleEdit}
                    className="relative group p-2 rounded-lg hover:bg-gray-200 transition"
                    title="Edit"
                  >
                    <img
                      src="/assets/edit.png"
                      alt="Edit"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              </div>

              <ul
                className="list-disc list-inside text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mt-6"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {Array.isArray(solution) && solution.length > 0 ? (
                  solution.map((policy, index) => <li key={index}>{policy}</li>)
                ) : (
                  <li>No solution available.</li>
                )}
              </ul>
            </div>

            {!solution || solution.length === 0 ? (
              <div className="flex items-center justify-center mt-10">
                <button
                  onClick={() => toggleSidebar()}
                  className="flex items-center justify-center bg-[#002F6C] text-white w-[160px] h-[40px] rounded-lg text-sm shadow-md transition-colors duration-300"
                >
                  <FaFileAlt className="mr-2" />
                  <span>Generate POC</span>
                </button>
              </div>
            ) : null}

            {(isSidebarOpen || loading) &&
              (!solution || solution.length === 0) && (
                <>
                  <div className="fixed top-0 right-0 h-full bg-white shadow-lg p-6 sm:p-8 md:p-10 z-50 w-full max-w-lg overflow-y-auto">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-[#002F6C] text-lg sm:text-xl md:text-2xl font-bold mb-4">
                          Generating Response...
                        </p>
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="mt-6 overflow-y-auto max-h-40 text-sm text-gray-600 p-4 border border-gray-200 rounded-lg">
                          <p>
                            We are processing your request. This may take a few
                            seconds. Please wait...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Title */}
                        <h2 className="font-bold text-[#002F6C] mb-1 text-lg sm:text-xl md:text-2xl">
                          Additional Questions (Optional)
                        </h2>
                        <p className="text-gray-900 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">
                          Provide us with a little more details
                        </p>

                        {/* Question 1 */}
                        <div className="mb-6">
                          <label className="block font-medium mb-2 whitespace-nowrap text-sm sm:text-base md:text-lg">
                            What has been done to address this?
                          </label>
                          <textarea
                            className="w-full h-[60px] sm:h-[70px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-900 text-xs sm:text-sm md:text-base"
                            placeholder="Enter your answer here..."
                            value={answer1}
                            onChange={(e) => setAnswer1(e.target.value)}
                          ></textarea>
                        </div>

                        {/* Question 2 */}
                        <div className="mb-12">
                          <label className="block font-medium mb-2 whitespace-nowrap text-sm sm:text-base md:text-lg">
                            Anything else we should know?
                          </label>
                          <textarea
                            className="w-full h-[60px] sm:h-[70px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-900 text-xs sm:text-sm md:text-base"
                            placeholder="Enter additional details..."
                            value={answer2}
                            onChange={(e) => setAnswer2(e.target.value)}
                          ></textarea>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-4 mb-10">
                          <button
                            onClick={toggleSidebar}
                            className="flex items-center justify-center text-black w-full sm:w-[191px] h-[40px] sm:h-[56px] rounded-lg text-xs sm:text-sm md:text-base font-semibold shadow-md transition-colors duration-300 border border-gray-300 hover:bg-gray-200"
                            disabled={loading}
                          >
                            Back
                          </button>
                          <button
                            onClick={handleSubmit}
                            className="flex items-center justify-center bg-[#002F6C] text-white w-full sm:w-[191px] h-[40px] sm:h-[56px] rounded-lg text-xs sm:text-sm md:text-base font-semibold shadow-md transition-colors duration-300 hover:bg-blue-800"
                            disabled={loading}
                          >
                            {loading ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Prevent clicking outside when sidebar is open (and not loading) */}
                  {!loading && (
                    <div
                      className="fixed inset-0 bg-black opacity-50 z-40"
                      onClick={toggleSidebar}
                    ></div>
                  )}
                </>
              )}
          </div>
          {isModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="bg-white p-6 rounded-lg shadow-lg w-[600px] h-[400px] max-h-screen flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">
                  Edit Plan of Correction
                </h2>

                <textarea
                  className="w-full flex-grow border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500 resize-none"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                ></textarea>

                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-5 py-2 bg-[#002f6c] text-white rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    </div>
  );
};

export default POCAIAllyView;
