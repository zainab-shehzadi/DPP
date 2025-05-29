import React from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useDashboardStore } from "@/stores/useDashboardStore";

const SidebarUploadPanel = ({ handleFileDrop, handleFileSelect, handleFileUpload }) => {
  const {
    isSidebarOpen,
    toggleSidebar,
    uploadStatus,
    loading,
  } = useDashboardStore();

  if (!isSidebarOpen) return null;

  return (
    <>
      <div className="fixed top-0 right-0 h-full bg-white shadow-lg p-10 z-50 w-full max-w-md">
        <h2 className="font-bold text-blue-900 mb-2 text-2xl text-center">
          New Plan Of Correction
        </h2>
        <p className="mb-6 text-lg text-center">Please Upload Your Document</p>

        <div
          className="flex flex-col items-center justify-center border-2 border-gray-300 rounded-lg p-8 mb-8 w-full h-36"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          <FaCloudUploadAlt size={50} className="text-gray-600" />
          <p className="text-center text-gray-500">
            Drag and drop file here or{" "}
            <label
              htmlFor="fileInput"
              className="text-blue-900 cursor-pointer underline"
            >
              browse file
            </label>
          </p>
          <input
            id="fileInput"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {uploadStatus && (
          <p className="text-center mb-4 text-gray-700">{uploadStatus}</p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center w-full h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-900 mb-4"></div>
            <p className="text-sm text-gray-600 font-medium">Please wait...</p>
          </div>
        ) : (
          <div className="flex justify-end w-full space-x-4">
            <button
              onClick={toggleSidebar}
              className="font-semibold hover:bg-blue-100 border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              className="font-semibold bg-blue-900 text-white px-4 py-2 rounded-lg"
              onClick={handleFileUpload}
            >
              Review Deficiencies
            </button>
          </div>
        )}
      </div>
      <div
        className="fixed inset-0 bg-black opacity-50 z-40"
        onClick={toggleSidebar}
      ></div>
    </>
  );
};

export default SidebarUploadPanel;
