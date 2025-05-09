import React from "react";

interface TagListProps {
  selectedDocument: any;
  selectedTag: string | null;
  setSelectedTag: (tag: string) => void;
  handleTagClick: (tag: string, id: string) => void;
}

const TagList: React.FC<TagListProps> = ({
  selectedDocument,
  selectedTag,
  setSelectedTag,
  handleTagClick,
}) => {
  return (
    <div className="bg-white shadow-lg p-4 sm:p-6 flex flex-col justify-between w-full lg:w-[350px] h-auto rounded-lg border border-[#E0E0E0] mx-auto">
      <div>
        <h4 className="font-bold text-blue-900 text-lg mb-4">Tags</h4>
        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg shadow-md p-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
          <ul className="flex flex-col gap-2">
            {!selectedDocument || selectedDocument.tags.length === 0 ? (
              <p className="text-xs text-gray-500 text-center p-2">
                All tags will be shown here after selecting a specific document.
              </p>
            ) : (
              selectedDocument.tags.map((item: any, index: number) => (
                <li
                  key={item._id || index}
                  className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-all duration-300 flex items-center gap-2 ${
                    selectedTag === item.tag
                      ? "bg-blue-900 text-white shadow-lg"
                      : "bg-white hover:bg-blue-100"
                  }`}
                  onClick={() => {
                    setSelectedTag(item.tag);
                    handleTagClick(item.tag, item._id);
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-900"></span>
                  <strong>{item.tag}</strong>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TagList;
