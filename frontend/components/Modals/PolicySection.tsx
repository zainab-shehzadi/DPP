import React from "react";

interface PolicySectionProps {
  selectedTag: string | null;
  selectedLongDesc: string | null;
  selectedPolicy: string[]; // assuming policy is an array of strings
}

const PolicySection: React.FC<PolicySectionProps> = ({
  selectedTag,
  selectedLongDesc,
  selectedPolicy,
}) => {
  return (
    <>
      <div
        className="w-full border-t border-gray-300 mt-4"
        style={{ borderColor: "#E0E0E0" }}
      ></div>

      <div className="flex flex-col lg:flex-row justify-center mt-4 lg:mt-8 space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Left Panel */}
        <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55] mb-4 lg:mb-12">
              {selectedTag || "Select a Tag"}
            </h4>
            <p
              className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {selectedLongDesc ||
                "Long description will appear here once you select a tag."}
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col">
          <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#002F6C] mb-4">
            Policy
          </h4>

          <ul
            className="list-disc list-inside text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mt-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {Array.isArray(selectedPolicy) && selectedPolicy.length > 0 ? (
              selectedPolicy.map((policy, index) => (
                <li key={index}>{policy}</li>
              ))
            ) : (
              <li>No policies available.</li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default PolicySection;
