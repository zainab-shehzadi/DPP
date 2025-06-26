// components/TagDetailsView.tsx
import Cookies from "js-cookie";
import { useState } from "react";
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
  // Extract tags from document data
  const derivedTags =
    Array.isArray(selectedDocument?.tags) && selectedDocument.tags.length > 0
      ? selectedDocument.tags
      : selectedDocument?.deficiencies?.data?.map((def: any) => ({
          id: def.id,
          tag: def.Tag,
          longDescription: def.Deficiency,
          solution: def.Solution,
        })) || [];

  console.log("derivedTags", derivedTags);
  const selectedTagObj = derivedTags?.find(
    (tag: any) => tag.tag === selectedTag
  );
  console.log("solution", selectedTagObj?.solution);
  const [loading, setLoading] = useState(false);
  const chunkText = (
    text: string,
    maxCharsPerChunk: number = 2000
  ): string[] => {
    if (!text || text.length <= maxCharsPerChunk) {
      return [text || ""];
    }

    const chunks: string[] = [];
    let currentPos = 0;

    while (currentPos < text.length) {
      let chunkEnd = currentPos + maxCharsPerChunk;

      if (chunkEnd < text.length) {
        // Find best break point
        const sentenceBreak = text.lastIndexOf(".", chunkEnd);
        const paragraphBreak = text.lastIndexOf("\n", chunkEnd);
        const spaceBreak = text.lastIndexOf(" ", chunkEnd);

        if (sentenceBreak > currentPos + maxCharsPerChunk * 0.7) {
          chunkEnd = sentenceBreak + 1;
        } else if (paragraphBreak > currentPos + maxCharsPerChunk * 0.7) {
          chunkEnd = paragraphBreak + 1;
        } else if (spaceBreak > currentPos + maxCharsPerChunk * 0.8) {
          chunkEnd = spaceBreak + 1;
        }
      }

      chunks.push(text.substring(currentPos, chunkEnd).trim());
      currentPos = chunkEnd;
    }

    return chunks;
  };

  // Generate the complete CMS-2567 form HTML
  const generateCMSFormHTML = () => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    // Process all tags and create chunks for pagination
    const processedTags: Array<{
      tag: string;
      chunk: string;
      chunkIndex: number;
      totalChunks: number;
      originalTag: any;
      solutionchunks?: string;
    }> = [];

    derivedTags.forEach((tag: any) => {
      const longDesc = tag.longDescription || "";

      const rawSolution = tag.solution || {};
      console.log("rawSolution", rawSolution);
      const solutionText = [
        rawSolution.question_1 && `Q1: ${rawSolution.question_1}`,
        rawSolution.answer_1 && `A1: ${rawSolution.answer_1}`,
        rawSolution.question_2 && `Q2: ${rawSolution.question_2}`,
        rawSolution.answer_2 && `A2: ${rawSolution.answer_2}`,
        rawSolution.question_3 && `Q3: ${rawSolution.question_3}`,
        rawSolution.answer_3 && `A3: ${rawSolution.answer_3}`,
        rawSolution.question_4 && `Q4: ${rawSolution.question_4}`,
        rawSolution.answer_4 && `A4: ${rawSolution.answer_4}`,
      ]
        .filter(Boolean)
        .join("\n");

      const chunks = chunkText(longDesc, 2000);
      const solutionChunks = chunkText(solutionText, 2000);

      chunks.forEach((chunk, index) => {
        processedTags.push({
          tag: tag.tag,
          chunk,
          chunkIndex: index,
          totalChunks: chunks.length,
          solutionchunks: solutionChunks[index] || "",
          originalTag: tag,
        });
      });
    });
    console.log("Processed Tags:", processedTags);
    const totalPages = processedTags.length + 1;

    // Generate header section that matches the official form
    const generateFormHeader = () => `
      <div class="form-header">
        <table class="header-table">
          <tr>
            <td class="header-left">
              <div class="header-title">
                DEPARTMENT OF HEALTH AND HUMAN SERVICES<br>
                CENTERS FOR MEDICARE & MEDICAID SERVICES
              </div>
            </td>
            <td class="header-right">
              <div class="print-info">
                PRINTED: ${currentDate}<br>
                FORM APPROVED<br>
                OMB NO. 0938-0391
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    // Generate main form table structure
    const generateMainTable = () => `
      <table class="main-form-table">
        <tr class="first-row">
          <td rowspan="2" class="statement-cell">
            <div class="statement-text">STATEMENT OF DEFICIENCIES<br>AND PLAN OF CORRECTION</div>
          </td>
          <td class="provider-id-cell">
            <div class="field-label">(X1) PROVIDER/SUPPLIER/CLIA<br>IDENTIFICATION NUMBER:</div>
            <div class="field-value">${
              selectedDocument?.providerId || "225644"
            }</div>
          </td>
          <td class="construction-cell">
            <div class="field-label">(X2) MULTIPLE CONSTRUCTION</div>
            <div class="construction-fields">
              A. BUILDING ________________<br>
              B. WING ___________________
            </div>
          </td>
          <td class="survey-date-cell">
            <div class="field-label">(X3) DATE SURVEY<br>COMPLETED</div>
            <div class="field-value">${
              selectedDocument?.surveyDate || "08/12/2024"
            }</div>
          </td>
        </tr>
        <tr class="second-row">
          <td colspan="3" class="provider-info-row">
            <table class="provider-table">
              <tr>
                <td class="provider-name-section">
                  <div class="field-label">NAME OF PROVIDER OR SUPPLIER</div>
                  <div class="provider-name">${
                    selectedDocument?.providerName || "SALEM REHAB CENTER"
                  }</div>
                </td>
                <td class="address-section">
                  <div class="field-label">STREET ADDRESS, CITY, STATE, ZIP CODE</div>
                  <div class="address-text">
                    ${selectedDocument?.address || "7 LORING HILLS AVENUE"}<br>
                    ${selectedDocument?.cityStateZip || "SALEM, MA 01970"}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    // Generate deficiency content for each tag
    const generateDeficiencyRows = (tagData: any) => {
      const { tag, chunk, chunkIndex, totalChunks, solutionchunks } = tagData;

      const isFirstChunk = chunkIndex === 0;
      const isContinuation = chunkIndex > 0;
      const hasMoreChunks = chunkIndex < totalChunks - 1;

      return `
        <table class="deficiency-table">
       
          <td class="header-col">(X4) ID<br>PREFIX<br>TAG</td>
          <td class="header-col">SUMMARY STATEMENT OF DEFICIENCIES<br>(EACH DEFICIENCY MUST BE PRECEDED BY FULL<br>REGULATORY OR LSC IDENTIFYING INFORMATION)</td>
          <td class="header-col">ID<br>PREFIX<br>TAG</td>
          <td class="header-col">PROVIDER'S PLAN OF CORRECTION<br>(EACH CORRECTIVE ACTION SHOULD BE<br>CROSS-REFERENCED TO THE APPROPRIATE<br>DEFICIENCY)</td>
          <td class="header-col">(X5)<br>COMPLETE<br>DATE</td>
    
          <tr class="deficiency-row">
            <td class="tag-column">
              <div class="tag-number">${tag}</div>
            </td>
            <td class="deficiency-column">
              ${
                isContinuation
                  ? '<div class="continuation-notice">...continued from previous page</div>'
                  : ""
              }
              <div class="deficiency-description">${chunk.replace(
                /\n/g,
                "<br>"
              )}</div>
              ${
                hasMoreChunks
                  ? '<div class="continuation-notice">continued on next page...</div>'
                  : ""
              }
            </td>
            <td class="tag-column">
              <div class="tag-number">${tag}</div>
            </td>
            <td class="correction-column">
         
              ${
                isContinuation
                  ? '<div class="continuation-notice">...continued from previous page</div>'
                  : ""
              }
              <div class="deficiency-description">${(
                solutionchunks || ""
              ).replace(/\n/g, "<br>")}</div>
              ${
                hasMoreChunks
                  ? '<div class="continuation-notice">continued on next page...</div>'
                  : ""
              }
            </td>
           
            <td class="date-column">
              <div class="completion-date">10/14/24</div>
            </td>
          </tr>
        </table>
      `;
    };

    // Generate plan of correction content
    const generateCorrectionPlan = (tag: string) => `
      <div class="correction-plan">
        <div class="correction-statement">
          This Plan of Correction is the center's credible allegation of compliance.
        </div>
        <div class="correction-disclaimer">
          Preparation and/or execution of this plan of correction does not constitute admission 
          or agreement by this provider to the facts alleged or conclusions set forth in the 
          statement of deficiencies. The plan of correction is prepared and/or executed solely 
          because it is required by the provisions of federal and state law.
        </div>
        <div class="correction-section">
          <strong>I. What corrective action(s) will be accomplished for those residents found 
          to have been affected by the deficient practice.</strong>
        </div>
        <div class="correction-details">
          No specific residents cited.
        </div>
        <div class="correction-section">
          <strong>II. How other residents having the potential to be affected by the same 
          deficient practice will be identified and what corrective action(s) will be taken.</strong>
        </div>
        <div class="correction-details">
          All residents have the potential to be affected by this deficient practice.
        </div>
      </div>
    `;

    const generateCorrectionContinuation = (tag: string) => `
      <div class="correction-continuation">
        [Plan of Correction continued from previous page for Tag ${tag}]
      </div>
    `;

    // Generate signature section for last page
    const generateSignatureSection = () => `
      <table class="signature-table">
        <tr class="signature-header">
          <td class="signature-field">LABORATORY DIRECTOR'S OR PROVIDER/SUPPLIER REPRESENTATIVE'S SIGNATURE</td>
          <td class="title-field">TITLE</td>
          <td class="date-field">(X6) DATE</td>
        </tr>
        <tr class="signature-line">
          <td class="signature-value">Electronically Signed</td>
          <td class="title-value"></td>
          <td class="date-value">${currentDate}</td>
        </tr>
      </table>
    `;

    // Generate footer that matches the official form
    const generateFooter = (
      pageNum: number,
      totalPages: number,
      isLastPage: boolean = false
    ) => `
      ${isLastPage ? generateSignatureSection() : ""}
      <div class="form-footer">
        <div class="footer-disclaimer">
          <strong>Any Deficiency statement ending with an asterisk (*) denotes a deficiency which the institution may be excused from correcting providing it is determined that other safeguards provide sufficient protection to the patients.</strong> (See instructions.) Except for nursing homes, the findings stated above are disclosable 90 days following the date of the survey whether or not a plan of correction is provided. For nursing homes, the above findings and plans of correction are disclosable 14 days following the date these documents are made available to the facility. If deficiencies are cited, an approved plan of correction is requisite to continued program participation.
        </div>
        <div class="footer-form-info">
          This form is a printed electronic version of the CMS 2567L. It contains all the information found on the standard document in much the same form. This electronic form once printed and signed by the facility administrator and appropriately posted will satisfy the CMS requirement to post survey information found on the CMS 2567L.
        </div>
        <div class="footer-metadata">
          <span>FORM CMS-2567(02-99) Previous Versions Obsolete</span>
          <span>Event ID: ${selectedDocument?.eventId || "C047171"}</span>
          <span>Facility ID: ${selectedDocument?.facilityId || "0968"}</span>
          <span>Page ${pageNum} of ${totalPages}</span>
        </div>
      </div>
    `;

    // Generate all pages
    let pagesHTML = "";

    // Cover page
    pagesHTML += `
      <div class="page">
        <div class="page-content">
          ${generateFormHeader()}
          ${generateMainTable()}
          <div class="cover-summary">
            <h2>Survey Summary</h2>
            <p><strong>Total Deficiencies:</strong> ${derivedTags.length}</p>
            <p><strong>Survey Date:</strong> ${
              selectedDocument?.surveyDate || "08/12/2024"
            }</p>
            <p><strong>Provider:</strong> ${
              selectedDocument?.providerName || "SALEM REHAB CENTER"
            }</p>
          </div>
          ${generateFooter(1, totalPages)}
        </div>
      </div>
    `;

    // Generate pages for each tag chunk
    processedTags.forEach((tagData, index) => {
      const pageNum = index + 2;
      const isLastPage = index === processedTags.length - 1;

      pagesHTML += `
        <div class="page">
          <div class="page-content">
            ${generateFormHeader()}
            ${generateMainTable()}
            ${generateDeficiencyRows(tagData)}
            ${generateFooter(pageNum, totalPages, isLastPage)}
          </div>
        </div>
      `;
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMS-2567 Statement of Deficiencies Form</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 10px;
            line-height: 1.1;
            background-color: #f5f5f5;
            color: black;
        }

        .page {
            width: 8.5in;
            height: 11in;
            margin: 0 auto 0.5in auto;
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            page-break-after: always;
            position: relative;
        }

        .page:last-child {
            page-break-after: avoid;
            margin-bottom: 0;
        }

        .page-content {
            width: 100%;
            height: 100%;
            border: 2px solid black;
            padding: 0.2in;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }

        /* Header Styles */
        .form-header {
            margin-bottom: 0;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid black;
            margin-bottom: 2px;
        }

        .header-left {
            width: 70%;
            text-align: center;
            vertical-align: middle;
            padding: 8px 4px;
        }

        .header-right {
            width: 30%;
            text-align: left;
            vertical-align: top;
            padding: 4px;
            border-left: 1px solid black;
        }

        .header-title {
            font-weight: bold;
            font-size: 12px;
            line-height: 1.2;
        }

        .print-info {
            font-weight: bold;
            font-size: 9px;
            line-height: 1.3;
        }

        /* Main Form Table */
        .main-form-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }

        .main-form-table td {
            border: 1px solid black;
            padding: 3px;
            vertical-align: top;
            font-size: 9px;
        }

        .statement-cell {
            width: 18%;
            text-align: center;
            font-weight: bold;
            font-size: 8px;
            vertical-align: middle;
        }

        .provider-id-cell {
            width: 20%;
            text-align: center;
        }

        .construction-cell {
            width: 22%;
            font-size: 8px;
        }

        .survey-date-cell {
            width: 15%;
            text-align: center;
        }

        .field-label {
            font-weight: bold;
            font-size: 7px;
            margin-bottom: 2px;
            line-height: 1.1;
        }

        .field-value {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            margin: 2px 0;
        }

        .construction-fields {
            font-size: 8px;
            line-height: 1.3;
        }

        .provider-info-row {
            padding: 0;
        }

        .provider-table {
            width: 100%;
            border-collapse: collapse;
        }

        .provider-table td {
            border: none;
            padding: 4px;
            vertical-align: top;
        }

        .provider-name-section {
            width: 50%;
            text-align: center;
        }

        .address-section {
            width: 50%;
            text-align: center;
            border-left: 1px solid black;
        }

        .provider-name {
            font-size: 11px;
            font-weight: bold;
            margin-top: 2px;
        }

        .address-text {
            font-size: 10px;
            margin-top: 2px;
        }

        .column-headers-row td {
            background-color: white;
            font-weight: bold;
            font-size: 7px;
            text-align: center;
            padding: 4px 2px;
            line-height: 1.1;
        }

        .header-col:nth-child(1) { width: 8%; }
        .header-col:nth-child(2) { width: 42%; }
        .header-col:nth-child(3) { width: 8%; }
        .header-col:nth-child(4) { width: 34%; }
        .header-col:nth-child(5) { width: 8%; }

        /* Cover Summary */
        .cover-summary {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
            text-align: center;
        }

        .cover-summary h2 {
            font-size: 16px;
            margin-bottom: 20px;
            font-weight: bold;
        }

        .cover-summary p {
            font-size: 12px;
            margin-bottom: 10px;
        }

        /* Deficiency Table */
        .deficiency-table {
            width: 100%;
            border-collapse: collapse;
            flex-grow: 1;
            
        }
            /* Remove bottom spacing from first column (X4) header */
.deficiency-table td.header-col {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
  line-height: 1 !important;
  vertical-align: top !important;
}


        .deficiency-table td {
            border: 1px solid black;
            vertical-align: top;
            padding: 4px;
        }

        .tag-column {
            width: 8%;
            text-align: center;
            font-weight: bold;
        }

        .tag-number {
            font-weight: bold;
            font-size: 10px;
        }

        .deficiency-column {
            width: 42%;
            font-size: 14px;
            line-height: 1.3;
        }

        .correction-column {
            width: 34%;
            font-size: 9px;
            line-height: 1.3;
        }

        .date-column {
            width: 8%;
            text-align: center;
            font-size: 14px;
        }

        .deficiency-description {
            text-align: justify;
            hyphens: auto;
            word-wrap: break-word;
            font-size: 12px;
            
  word-break: break-word;
        }

        .continuation-notice {
            font-style: italic;
            color: #606060;
            margin: 4px 0;
            font-size: 8px;
        }

        .correction-plan {
            text-align: justify;
        }

        .correction-statement {
            font-weight: bold;
            margin-bottom: 6px;
        }

        .correction-disclaimer {
            margin-bottom: 8px;
            font-size: 8px;
        }

        .correction-section {
            margin: 6px 0 3px 0;
            font-size: 8px;
        }

        .correction-details {
            margin-bottom: 6px;
            font-size: 8px;
        }

        .correction-continuation {
            font-style: italic;
            color: #606060;
            text-align: center;
            padding: 20px;
        }

        .completion-date {
            font-weight: bold;
            font-size: 9px;
        }

        /* Signature Section */
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            border-top: 2px solid black;
        }

        .signature-table td {
            border: 1px solid black;
            padding: 4px;
            font-size: 9px;
        }

        .signature-header td {
            font-weight: bold;
            text-align: center;
            background-color: white;
        }

        .signature-field { width: 60%; }
        .title-field { width: 25%; }
        .date-field { width: 15%; }

        .signature-line {
            height: 30px;
        }

        .signature-value {
            font-style: italic;
            text-align: center;
        }

        .date-value {
            text-align: center;
        }

        /* Footer Styles */
        .form-footer {
            margin-top: auto;
            border-top: 1px solid black;
            padding-top: 6px;
            font-size: 7px;
            line-height: 1.2;
        }

        .footer-disclaimer {
            margin-bottom: 6px;
            text-align: justify;
        }

        .footer-form-info {
            margin-bottom: 6px;
            text-align: justify;
        }

        .footer-metadata {
            display: flex;
            justify-content: space-between;
            font-size: 6px;
            font-weight: bold;
        }

        /* Print Styles */
        @media print {
            body {
                margin: 0;
                padding: 0;
                background-color: white;
            }
            
            .page {
                width: 8.5in;
                height: 11in;
                margin: 0;
                box-shadow: none;
                page-break-after: always;
            }
            
            .page:last-child {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    ${pagesHTML}
</body>
</html>`;
  };

  // Function to download and display the form
  const downloadPDF = async () => {
    try {
      setLoading(true);

      const htmlContent = generateCMSFormHTML();
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      // Open in new window for printing
      const newWindow = window.open(url, "_blank");
      if (newWindow) {
        newWindow.onload = () => {
          newWindow.document.title = `CMS-2567-${
            selectedDocument?.providerName || "form"
          }-${new Date().toISOString().split("T")[0]}`;

          setTimeout(() => {
            newWindow.print();
          }, 1000);

          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 5000);
        };
      }

      // Also provide download option
      const link = document.createElement("a");
      link.href = url;
      link.download = `CMS-2567-${selectedDocument?.providerName || "form"}-${
        new Date().toISOString().split("T")[0]
      }.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        "CMS-2567 form generated! Use Ctrl+P in the new window to print as PDF."
      );
    } catch (error) {
      console.error("Error generating form:", error);
      toast.error("Failed to generate form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="w-full border-t border-gray-300 mt-4"
        style={{ borderColor: "#E0E0E0" }}
      ></div>
      <div className="flex flex-col lg:flex-row justify-center items-start mt-4 lg:mt-8 gap-4">
        {/* Left container - Tag Details */}
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

        {/* Right container - All Tags */}
        <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full lg:w-1/2 flex flex-col h-[calc(90vh-140px)] overflow-auto">
          <h3 className="text-lg font-bold mb-12 text-gray-700">All Tags</h3>
          {derivedTags.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              No tags available.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {derivedTags.map((item: any, index: number) => {
                const deficiency = selectedDocument?.deficiencies?.data?.find(
                  (d: any) => d.Tag === item.tag
                );
                const isApproved = deficiency?.status === "approved";

                return (
                  <div
                    key={item.id || index}
                    className={`flex flex-col items-start justify-between rounded-lg px-4 py-2 shadow-sm cursor-pointer transition ${
                      isApproved
                        ? "bg-green-200 text-black"
                        : selectedTag === item.tag
                        ? "bg-blue-900 text-white"
                        : "bg-[#CCE2FF] hover:bg-blue-300 text-gray-700"
                    }`}
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
                    <span className="font-semibold mt-1">{item.tag}</span>
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
              onClick={downloadPDF}
              className={`font-semibold px-6 py-2 rounded shadow-md transition ${
                loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-900"
              } text-white`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 animate-spin mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate CMS-2567 Form"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TagDetailsView;
