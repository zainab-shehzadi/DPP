import React from "react";

interface GeneratePOCSidebarProps {
  loading: boolean;
  answer1: string;
  answer2: string;
  setAnswer1: (val: string) => void;
  setAnswer2: (val: string) => void;
  toggleSidebar: () => void;
  handleSubmit: () => void;
}

const GeneratePOCSidebar: React.FC<GeneratePOCSidebarProps> = ({
  loading,
  answer1,
  answer2,
  setAnswer1,
  setAnswer2,
  toggleSidebar,
  handleSubmit,
}) => {
  return (
    <div className="fixed top-0 right-0 h-full bg-white shadow-lg p-6 sm:p-8 md:p-10 z-50 w-full max-w-lg overflow-y-auto">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-[#002F6C] text-lg sm:text-xl md:text-2xl font-bold mb-4">
            Generating Response...
          </p>
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="mt-6 overflow-y-auto max-h-40 text-sm text-gray-600 p-4 border border-gray-200 rounded-lg">
            <p>
              We are processing your request. This may take a few seconds.
              Please wait...
            </p>
          </div>
        </div>
      ) : (
        <>
          <h2 className="font-bold text-[#002F6C] mb-1 text-lg sm:text-xl md:text-2xl">
            Additional Questions (Optional)
          </h2>
          <p className="text-gray-900 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">
            Provide us with a little more details
          </p>

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
  );
};

export default GeneratePOCSidebar;
