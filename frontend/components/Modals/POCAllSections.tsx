import React from "react";
import TagList from "./TagList";
import LongDescriptionPanel from "./LongDescriptionPanel";
import CorrectionPanel from "./CorrectionPanel";
import EditModal from "./EditModal";

const POCAllySection = ({
  activeTab,
  setActiveTab,
  selectedDocument,
  selectedTag,
  setSelectedTag,
  handleTagClick,
  selectedLongDesc,
  scrollToCorrection,
  scrollToTopOfDesc,
  descRef,
  correctionRef,
  tagData,
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
  handleApprove,
  handleNavigateToTags,
  isAuthenticated,
}) => {
  if (activeTab !== "POC AI Ally") return null;

  return (
    <>
      <div
        className="w-full border-t border-gray-300 mt-4"
        style={{ borderColor: "#E0E0E0" }}
      ></div>

      <div className="flex flex-col lg:flex-row justify-center mt-4 lg:mt-8 space-y-4 lg:space-y-0 lg:space-x-4">
        <TagList
          selectedDocument={selectedDocument}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          handleTagClick={handleTagClick}
        />

        <LongDescriptionPanel
          selectedTag={selectedTag}
          selectedLongDesc={selectedLongDesc}
          scrollToCorrection={scrollToCorrection}
          scrollToTopOfDesc={scrollToTopOfDesc}
          descRef={descRef}
          correctionRef={correctionRef}
        />
        <CorrectionPanel
          tagData={tagData}
          solution={solution}
          handleCopy={handleCopy}
          handleEdit={handleEdit}
          isSidebarOpen={isSidebarOpen}
          isSidebarLoading={isSidebarLoading} // ✅ renamed correctly
          loading={loading} // This can stay as the general loading state
          toggleSidebar={toggleSidebar}
          answer1={answer1}
          setAnswer1={setAnswer1}
          answer2={answer2}
          setAnswer2={setAnswer2}
          handleSubmit={handleSubmit}
          boxRef={boxRef}
          handleApprove={handleApprove}
          handleNavigateToTags={handleNavigateToTags}
          isAuthenticated={isAuthenticated}
          status={tagData?.status || "not assigned"} // or however you manage status
        />
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
