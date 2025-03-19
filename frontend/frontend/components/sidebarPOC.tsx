import React from "react";
import { UploadCloud } from "lucide-react";

const NewPlanOfCorrection = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          New <span className="text-blue-900">Plan Of Correction</span>
        </h2>
        <p className="text-gray-500 mb-6">Please Upload Your Document</p>

        {/* File Upload Box */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
          <UploadCloud className="text-blue-900 w-12 h-12 mb-4" />
          <p className="text-gray-500">Drag and drop file here or <span className="text-blue-900 cursor-pointer">browse file</span></p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button className="px-4 py-2 rounded-lg border border-blue-900 text-blue-900 font-semibold hover:bg-blue-100 transition">
            Cancel
          </button>
          <button className="px-4 py-2 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition">
            Review Deficiencies
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPlanOfCorrection;
