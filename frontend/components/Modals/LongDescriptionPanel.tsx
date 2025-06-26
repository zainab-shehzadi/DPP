import React, { useRef } from "react";

interface DeficiencyType {
  _id: string;
  Tag: string;
  Description: string;
  Deficiency: string;
}

interface DocumentType {
  deficiencies?: {
    data: DeficiencyType[];
  };
}


interface LongDescriptionPanelProps {
  selectedDocument: DocumentType | null;
  selectedTag: string | null;
}

const LongDescriptionPanel: React.FC<LongDescriptionPanelProps> = ({
  selectedDocument,
  selectedTag,
}) => {
  const matchingDeficiency = selectedDocument?.deficiencies?.data?.find(
    (def) => def.Tag === selectedTag
  );
  const descRef = useRef<HTMLDivElement>(null);
  const correctionRef = useRef<HTMLDivElement>(null);
  const scrollToCorrection = () => {
    correctionRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToTopOfDesc = () => {
    descRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="border shadow-lg rounded-lg p-4 sm:p-6  flex flex-col justify-between h-[calc(90vh-140px)] overflow-auto">
      <div ref={descRef}>
        <div className="flex justify-between items-center mb-4 lg:mb-6">
          <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55]">
            {selectedTag || "Select a Tag"}
          </h4>

          {matchingDeficiency && (
            <button
              onClick={scrollToCorrection}
              className="bg-gray-100 border p-2 rounded-full shadow"
              title="Scroll Down"
            >
              ⬇️
            </button>
          )}
        </div>
        <div
          className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] space-y-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {matchingDeficiency ? (
            matchingDeficiency.Deficiency.split(/(?<=\.)\s+/).map(
              (sentence, index) => {
                const isBulletPoint = /^[A-Z]\.|^\d+\./.test(sentence.trim());

                return isBulletPoint ? (
                  <ul key={index} className="list-disc pl-6">
                    <li className="mb-2">{sentence.trim()}</li>
                  </ul>
                ) : (
                  <p key={index} className="mb-2">
                    {sentence.trim()}
                  </p>
                );
              }
            )
          ) : (
            <p>
              Deficiency description will appear here once you select a tag.
            </p>
          )}
        </div>

        <div ref={correctionRef} className="mt-12">
          {matchingDeficiency && (
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
  );
};

export default LongDescriptionPanel;
