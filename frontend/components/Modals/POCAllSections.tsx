import React from "react";
import TagList from "./TagList";
import LongDescriptionPanel from "./LongDescriptionPanel";
import CorrectionPanel from "./CorrectionPanel";
import EditModal from "./EditModal";

const POCAllySection = ({
  data,
  activeTab,
  selectedPolicyID,
  selectedDocument,
    setActiveTab, // ✅ ADD THIS
  selectedTag,
  selectedID,
  setSelectedTag,
  handleTagClick,
  policy,
  solution,
  handleCopy,
  handleEdit,
  isSidebarOpen,
  loading,
  toggleSidebar,
  answer1,
  setAnswer1,
  answer2,
  setAnswer2,
  handleSubmit,
  isModalOpen,
  setIsModalOpen,
  editedText,
  setEditedText,
  handleSaveChanges,
  boxRef,
  isSidebarLoading,
  setSelectedDocument,
  handleNavigateToTags,
  isAuthenticated,
  AIPolicy,
}) => {
  if (activeTab !== "POC AI Ally") return null;
 
  return (
    <>
      <div
        className="w-full border-t border-gray-300 mt-4"
        style={{ borderColor: "#E0E0E0" }}
      ></div>

      <div className="flex flex-col lg:flex-row mt-4 lg:mt-8 gap-4 ">

        <div className="w-full lg:w-[180px] flex-shrink-0">
          <TagList
            selectedDocument={selectedDocument}
            selectedID={selectedID}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            handleTagClick={handleTagClick}
            selectedPolicyID={selectedPolicyID}
            policy={policy || []}
            AIPolicy={AIPolicy || []}
          />
        </div>

        <div className="w-full lg:flex-1">
          <LongDescriptionPanel
            selectedDocument={selectedDocument}
            selectedTag={selectedTag}
          />
        </div>

        <div className="w-full lg:flex-1">
          <CorrectionPanel
            data={data}
            selectedDocument={selectedDocument}
            setSelectedDocument={setSelectedDocument}
            selectedTag={selectedTag}
            policy={policy || []}
            AIPolicy={AIPolicy || []}
            solution={solution}
            handleCopy={handleCopy}
            handleEdit={handleEdit}
            isSidebarOpen={isSidebarOpen}
            isSidebarLoading={isSidebarLoading}
            loading={loading}
            toggleSidebar={toggleSidebar}
            answer1={answer1}
            setAnswer1={setAnswer1}
            answer2={answer2}
            setAnswer2={setAnswer2}
            handleSubmit={handleSubmit}
            boxRef={boxRef}
            handleNavigateToTags={handleNavigateToTags}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      {isModalOpen && (
        <EditModal
          setIsModalOpen={setIsModalOpen}
          editedText={editedText}
          setEditedText={setEditedText}
          handleSaveChanges={handleSaveChanges}
        />
      )}
    </>
  );
};

export default POCAllySection;
