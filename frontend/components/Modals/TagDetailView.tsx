// components/TagDetailsView.tsx

import Cookies from "js-cookie";
import { toast } from "react-toastify";

interface TagDetailsViewProps {
  selectedDocument: any;
  selectedTag: string;
  selectedLongDesc: string | null;
  handleTagClick: (tag: string, id: string) => void;
  setDropdownOpen2: (open: boolean) => void;
  navigateToPOCTab: (tag: string, def: string, data: any) => void;
}

const TagDetailsView: React.FC<TagDetailsViewProps> = ({
  selectedDocument,
  selectedTag,
  handleTagClick,
  setDropdownOpen2,
  navigateToPOCTab,
}) => {
  const derivedTags =
    Array.isArray(selectedDocument?.tags) && selectedDocument.tags.length > 0
      ? selectedDocument.tags
      : selectedDocument?.deficiencies?.map((def: any) => ({
          _id: def._id,
          tag: def.Tag,
          longDescription: def.Deficiency,
        })) || [];

  const selectedTagObj = derivedTags?.find(
    (tag: any) => tag.tag === selectedTag
  );

  const downloadPDF = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        console.error("Access token not found!");
        return;
      }
      const documentId = selectedDocument._id;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pdf/generate-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // make sure token is in 'Bearer xxx' format
          },
          body: JSON.stringify({ documentId }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "POC_Report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      // toast.error("Error generating PDF:", error.message);
      toast.error(
        error.message || "Something went wrong while generating the PDF."
      );
    }
  };

  return (
    <>
      <div
        className="w-full  border-t border-gray-300 mt-4 "
        style={{ borderColor: "#E0E0E0" }}
      ></div>

      <div className="flex flex-col lg:flex-row justify-center items-start mt-4 lg:mt-8 gap-4">
        {/* Left container */}
        <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full lg:w-1/2 h-[calc(90vh-140px)] overflow-auto flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55] mb-4 lg:mb-12">
              {selectedTag || "Select a Tag"}
            </h4>

            <div
              className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] space-y-4 mb-8 md:mb-16 lg:mb-32"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {selectedTagObj?.longDescription ? (
                selectedTagObj.longDescription
                  .split(/(?<=\.)\s+/)
                  .map((sentence, index) => {
                    const isBulletPoint = /^[A-Z]\.|^\d+\./.test(
                      sentence.trim()
                    );
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

        {/* Right container */}
        <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full lg:w-1/2 flex flex-col h-[calc(90vh-140px)] overflow-auto">
          <h3 className="text-lg font-bold mb-12 text-gray-700">All Tags</h3>

          {derivedTags.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              No tags available.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {derivedTags.map((item: any, index: number) => {
                const deficiency = selectedDocument?.deficiencies?.find(
                  (d: any) => d.Tag === item.tag
                );
                const isApproved = deficiency?.status === "approved";

                return (
                  <div
                    key={item.id || index}
                    className={`flex flex-col items-start justify-between rounded-lg px-4 py-2 shadow-sm cursor-pointer transition
  ${
    isApproved
      ? "bg-green-200 text-[#e5edf8] "
      : selectedTag === item.tag
      ? "bg-blue-900  "
      : "bg-[#CCE2FF] hover:bg-blue-300 "
  }
`}
                    onClick={() => {
                      handleTagClick(item.tag, item.id);
                      setDropdownOpen2(false);
                      navigateToPOCTab(
                        item.tag,
                        item.longDescription,
                        selectedDocument
                      );
                    }}
                  >
                    <span
                      className={`font-semibold mt-1 ${
                        isApproved || selectedTag === item.tag
                          ? "text-black"
                          : "text-gray-700"
                      }`}
                    >
                      {item.tag}
                    </span>
                    {item.shortDescription && (
                      <span className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {item.shortDescription}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-auto pt-6 flex justify-center">
            <button
              onClick={() => {
                downloadPDF();
              }}
              className="bg-blue-900 text-white font-semibold px-6 py-2 rounded shadow-md transition"
            >
              Generate PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TagDetailsView;
