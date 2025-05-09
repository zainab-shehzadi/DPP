import React from "react";

interface LongDescriptionPanelProps {
  selectedTag: string | null;
  selectedLongDesc: string;
  scrollToCorrection: () => void;
  scrollToTopOfDesc: () => void;
  descRef: React.RefObject<HTMLDivElement>;
  correctionRef: React.RefObject<HTMLDivElement>;
}

const LongDescriptionPanel: React.FC<LongDescriptionPanelProps> = ({
  selectedTag,
  selectedLongDesc,
  scrollToCorrection,
  scrollToTopOfDesc,
  descRef,
  correctionRef,
}) => {
  return (
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

        <div
          className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] space-y-4"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {selectedLongDesc ? (
            selectedLongDesc
              .split(/(?<=\\.)\\s+/)
              .map((sentence, index) => {
                const isBulletPoint = /^[A-Z]\\.|^\\d+\\./.test(sentence.trim());
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
  );
};

export default LongDescriptionPanel;
