import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

import { useRouter } from "next/navigation";

interface TagListProps {
  selectedDocument: any;
  selectedID: string | null;
  selectedTag: string | null;
  setSelectedTag: (tag: string) => void;
  handleTagClick: (tag: string, id: string) => void;
  policy: string[];
  AIPolicy: string[];
  selectedPolicyID: string | null;
}

const TagList: React.FC<TagListProps> = ({
  selectedDocument,
  selectedTag,
  setSelectedTag,
  handleTagClick,
  selectedID,
  policy,
  selectedPolicyID,
  AIPolicy,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const derivedTags =
    Array.isArray(selectedDocument?.tags) && selectedDocument.tags.length > 0
      ? selectedDocument.tags
      : selectedDocument?.deficiencies?.map((def: any) => ({
          _id: def._id,
          tag: def.Tag,
          longDescription: def.Deficiency,
          solution: def.Solution,
        })) || [];
  const selectedDeficiency = selectedDocument?.deficiencies?.find(
    (def: any) => def.Tag === selectedTag
  );

  const status = selectedDeficiency?.status;
  const router = useRouter();
  const handleGeneratePolicy = async () => {
    if (!selectedDeficiency || !selectedTag) return;

    const token = Cookies.get("token");
    const combinedText = `${selectedTag} ${selectedDeficiency.Description} ${selectedDeficiency.Deficiency}`;
    const Deficiency = selectedDeficiency.Deficiency;
    const FileId = selectedDocument._id;
    const tag = selectedTag;

    try {
      setIsGenerating(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/extract-info`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: combinedText, Deficiency, FileId, tag }),
        }
      );

      const data = await res.json();
      console.log("extracted info", data);
      if (!res.ok) throw new Error(data.message || "Failed to generate policy");

      localStorage.setItem("policyID", JSON.stringify(data.data._id));
      localStorage.setItem("selectedTag", selectedTag);
      localStorage.setItem("selectedDocumentId", selectedDocument?._id || "");
      localStorage.setItem("selectedTagID", selectedID || "");
      router.push(`/PolicyGenerator/${data.data._id}`);

      console.log("Policy generated:", data);
    } catch (error) {
      console.error("Error generating policy:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="shadow-lg p-4 sm:p-6 flex flex-col justify-between  rounded-lg border border-[#E0E0E0] h-[calc(90vh-140px)] overflow-auto">
      <div>
        <h4 className="font-bold text-blue-900 text-lg mb-4">Tags</h4>

        <div
          className="w-full bg-gray-50 border border-gray-200 rounded-lg shadow-md p-2"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          <ul className="flex flex-col gap-1">
            {derivedTags.length > 0 ? (
              derivedTags.map((item: any, index: number) => {
                const isSelected = selectedTag === item.tag;

                // Only get status if selected
                const selectedDeficiency = isSelected
                  ? selectedDocument?.deficiencies?.find(
                      (d: any) => d.Tag === item.tag
                    )
                  : null;

                const isApproved = selectedDeficiency?.status === "approved";

                return (
                  <li
                    key={item._id || index}
                    className={`w-full px-2 py-2 rounded-md text-sm cursor-pointer transition-all duration-200 ${
                      isApproved
                        ? "bg-green-200 text-black"
                        : isSelected
                        ? "bg-blue-900 text-white shadow"
                        : "bg-white text-black hover:bg-blue-100"
                    }`}
                    onClick={() => {
                      setSelectedTag(item.tag);
                      handleTagClick(item.tag, item._id);
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full inline-block ${
                          isApproved ? "bg-green-600" : "bg-blue-900"
                        }`}
                      ></span>
                      <span className="font-semibold">{item.tag}</span>
                    </span>
                  </li>
                );
              })
            ) : (
              <p className="text-xs text-gray-500 text-center p-2">
                No tags found for the selected document.
              </p>
            )}
          </ul>
        </div>

        {selectedDeficiency && (
          <div className="mt-4 text-sm text-[#33343E]">
            <p className="font-bold mb-2 text-lg">Description:</p>
            <p className="mb-2">{selectedDeficiency.Description}</p>
          </div>
        )}
      </div>

      {selectedDeficiency?.Deficiency && (
        <div className="mt-6 flex justify-center">
          {AIPolicy.length > 0 || (policy.length > 0 && selectedPolicyID) ? (
            <button
              onClick={() => {
                localStorage.setItem("selectedTag", selectedTag || "");
                localStorage.setItem(
                  "selectedDocumentId",
                  selectedDocument?._id || ""
                );
                router.push(`/PolicyGenerator/${selectedPolicyID}`);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg self-end mt-4 text-sm"
            >
              View Policy
            </button>
          ) : (
            <button
              onClick={handleGeneratePolicy}
              disabled={isGenerating}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg self-end mt-4 text-sm disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Policy"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TagList;
