// components/TagDetailsView.tsx

interface TagDetailsViewProps {
  selectedTag: string;
  selectedLongDesc: string | null;
  tagsData: any[];
  handleTagClick: (tag: string, id: string) => void;
  setDropdownOpen2: (open: boolean) => void;
}

const TagDetailsView: React.FC<TagDetailsViewProps> = ({
  selectedTag,
  selectedLongDesc,
  tagsData,
  handleTagClick,
  setDropdownOpen2,
}) => {
  return (
    <>
      <div
        className="w-full border-t border-gray-300 mt-4"
        style={{ borderColor: "#E0E0E0" }}
      ></div>

      <div className="flex flex-col lg:flex-row justify-center mt-4 lg:mt-8 space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Center Container */}
        <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55] mb-4 lg:mb-12">
              {selectedTag || "Select a Tag"}
            </h4>

            <div
              className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] space-y-4 mb-8 md:mb-16 lg:mb-32"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {selectedLongDesc ? (
                selectedLongDesc.split(/(?<=\.)\s+/).map((sentence, index) => {
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
                })
              ) : (
                <p>Long description will appear here once you select a tag.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
          <h3 className="text-lg font-bold mb-4 text-gray-700">All Tags</h3>

          {tagsData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              No tags available.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {tagsData.map((item, index) => (
                <div
                  key={item.id || index}
                  className={`flex flex-col items-start justify-between rounded-lg px-4 py-2 shadow-sm cursor-pointer transition ${
                    item.status === "approved"
                      ? "bg-green-200"
                      : "bg-[#CCE2FF] hover:bg-blue-300"
                  }`}
                  onClick={() => {
                    console.log("Clicked Tag Data:", item); 
                    handleTagClick(item.tag, item.id);
                    setDropdownOpen2(false);
                  }}
                >
                  <span className="font-semibold text-gray-700">
                    {item.tag}
                  </span>
                  {item.shortDescription && (
                    <span className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {item.shortDescription}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TagDetailsView;
