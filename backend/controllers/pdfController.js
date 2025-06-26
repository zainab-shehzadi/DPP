// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");
// const FileModel = require("../models/File");

// const generatePOCPdf = async (req, res) => {
//   try {
//     const { documentId } = req.body;
//     const userId = req.user;
//     if (!userId) return res.status(401).json({ error: "Unauthorized" });

//     const file = await FileModel.findById(documentId);
//     if (!file) return res.status(404).json({ error: "Document not found" });

//     const allDeficiencies = [];

//     if (file.deficiencies.data && file.deficiencies.data.length > 0) {
//       for (let i = 0; i < file.deficiencies.data.length; i++) {
//         const item = file.deficiencies.data[i];

//         const tagText =
//           item.Tag || item.tag || item.tagId || item.TagId || `F${String(i + 1).padStart(3, '0')}`;
//         const deficiencyText =
//           item.Deficiency ||
//           item.deficiency ||
//           item.description ||
//           item.Description ||
//           `Deficiency ${i + 1}`;

//         let solutionText = "No solution provided";
//         if (
//           item.Solution ||
//           item.solution ||
//           item.planOfCorrection ||
//           item.PlanOfCorrection
//         ) {
//           const solution =
//             item.Solution ||
//             item.solution ||
//             item.planOfCorrection ||
//             item.PlanOfCorrection;
//           if (typeof solution === "string") {
//             solutionText = solution;
//           } else if (typeof solution === "object" && solution !== null) {
//             solutionText = Object.values(solution)
//               .filter((v) => typeof v === "string")
//               .join("\n");
//           }
//         }

//         allDeficiencies.push({
//           tagText: tagText || "N/A",
//           deficiencyText: deficiencyText || "N/A",
//           solutionText: solutionText || "N/A",
//         });
//       }
//     }

//     console.log("All deficiencies:", allDeficiencies);
//     if (allDeficiencies.length === 0) {
//       return res.status(400).json({
//         error: "No deficiencies found in document",
//         debug: {
//           fileId: documentId,
//           deficienciesArray: file.deficiencies.data,
//           fileKeys: Object.keys(file.toObject ? file.toObject() : file),
//         },
//       });
//     }

//     // Initialize PDF with exact A4 dimensions
//     const doc = new PDFDocument({ 
//       size: "A4", 
//       margin: 0,
//       bufferPages: true 
//     });
//     const buffers = [];

//     doc.on("data", (chunk) => buffers.push(chunk));
//     doc.on("end", () => {
//       const finalBuffer = Buffer.concat(buffers);
//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename=CMS-2567_Report.pdf`
//       );
//       res.send(finalBuffer);
//     });

//     const pageWidth = 595.28; 
//     const pageHeight = 841.89; 
//     const margin = 15;
//     const contentWidth = pageWidth - (margin * 2);

//     let currentY = margin;
//     let currentPageNumber = 1;

//     // Helper function to draw bordered rectangle
//     const drawRect = (x, y, width, height, fillColor = null) => {
//       if (fillColor) {
//         doc.rect(x, y, width, height).fillAndStroke(fillColor, '#000000');
//       } else {
//         doc.rect(x, y, width, height).stroke('#000000');
//       }
//     };

//     // Helper function to add text in a box
//     const addTextInBox = (text, x, y, width, height, options = {}) => {
//       const {
//         fontSize = 8,
//         font = 'Helvetica',
//         align = 'left',
//         valign = 'top',
//         padding = 2,
//         bold = false
//       } = options;

//       doc.font(bold ? 'Helvetica-Bold' : font).fontSize(fontSize);

//       let textY = y + padding;
//       if (valign === 'center') {
//         const textHeight = doc.heightOfString(text, { width: width - (padding * 2) });
//         textY = y + (height - textHeight) / 2;
//       }

//       doc.text(text, x + padding, textY, {
//         width: width - (padding * 2),
//         height: height - (padding * 2),
//         align: align,
//         ellipsis: true
//       });
//     };

//     // Helper function to draw the complete header
//   const drawHeader = () => {
//   let yPos = margin;

//   // Top Header Row
//   drawRect(margin, yPos, 425, 25);
//   addTextInBox(
//     'DEPARTMENT OF HEALTH AND HUMAN SERVICES\nCENTERS FOR MEDICARE & MEDICAID SERVICES',
//     margin, yPos, 425, 25,
//     { fontSize: 9, bold: true, align: 'center', valign: 'center' }
//   );

//   drawRect(margin + 425, yPos, 155, 25);
//   addTextInBox(
//     'PRINTED: 09/13/2024\nFORM APPROVED\nOMB NO. 0938-0391',
//     margin + 425, yPos, 155, 25,
//     { fontSize: 7, align: 'right', valign: 'center' }
//   );

//   yPos += 25;

//   // Row 2
//   drawRect(margin, yPos, 120, 45);
//   addTextInBox(
//     'STATEMENT OF DEFICIENCIES\nAND PLAN OF CORRECTION',
//     margin, yPos, 120, 45,
//     { fontSize: 8, bold: true, align: 'center', valign: 'center' }
//   );

//   drawRect(margin + 120, yPos, 140, 45);
//   addTextInBox(
//     '(X1) PROVIDER/SUPPLIER/CLIA\nIDENTIFICATION NUMBER:\n',
//     margin + 120, yPos, 140, 25,
//     { fontSize: 7, align: 'left', valign: 'top' }
//   );
//   addTextInBox(
//     '225644',
//     margin + 120, yPos + 25, 140, 20,
//     { fontSize: 9, bold: true, align: 'left', valign: 'top' }
//   );

//   drawRect(margin + 260, yPos, 160, 45);
//   addTextInBox(
//     '(X2) MULTIPLE CONSTRUCTION\n\nA. BUILDING  ___________________\nB. WING  ___________________',
//     margin + 260, yPos, 160, 45,
//     { fontSize: 8, align: 'left', valign: 'top' }
//   );

//   drawRect(margin + 420, yPos, 160, 45);
//   addTextInBox(
//     '(X3) DATE SURVEY\nCOMPLETED\n',
//     margin + 420, yPos, 160, 25,
//     { fontSize: 7, align: 'left', valign: 'top' }
//   );
//   addTextInBox(
//     '08/12/2024',
//     margin + 420, yPos + 25, 160, 20,
//     { fontSize: 9, bold: true, align: 'left', valign: 'top' }
//   );

//   yPos += 45;

//   // Row 3
//   drawRect(margin, yPos, 290, 25);
//   addTextInBox(
//     'NAME OF PROVIDER OR SUPPLIER',
//     margin, yPos, 290, 10,
//     { fontSize: 7, align: 'left', valign: 'top' }
//   );
//   addTextInBox(
//     'SALEM REHAB CENTER',
//     margin, yPos + 10, 290, 15,
//     { fontSize: 9, bold: true, align: 'left', valign: 'top' }
//   );

//   drawRect(margin + 290, yPos, 290, 25);
//   addTextInBox(
//     'STREET ADDRESS, CITY, STATE, ZIP CODE',
//     margin + 290, yPos, 290, 10,
//     { fontSize: 7, align: 'left', valign: 'top' }
//   );
//   addTextInBox(
//     '7 LORING HILLS AVENUE\nSALEM, MA 01970',
//     margin + 290, yPos + 10, 290, 15,
//     { fontSize: 9, bold: true, align: 'left', valign: 'top' }
//   );

//   yPos += 25;

//   // Column Headers
//   const col1Width = 60;
//   const col2Width = 225;
//   const col3Width = 60;
//   const col4Width = 180;
//   const col5Width = 50;

//   drawRect(margin, yPos, col1Width, 60);
//   addTextInBox(
//     '(X4) ID\nPREFIX\nTAG',
//     margin, yPos, col1Width, 60,
//     { fontSize: 8, bold: true, align: 'center', valign: 'center' }
//   );

//   drawRect(margin + col1Width, yPos, col2Width, 60);
//   addTextInBox(
//     'SUMMARY STATEMENT OF DEFICIENCIES\n(EACH DEFICIENCY MUST BE PRECEDED BY FULL\nREGULATORY OR LSC IDENTIFYING INFORMATION)',
//     margin + col1Width, yPos, col2Width, 60,
//     { fontSize: 7, bold: true, align: 'center', valign: 'center' }
//   );

//   drawRect(margin + col1Width + col2Width, yPos, col3Width, 60);
//   addTextInBox(
//     'ID\nPREFIX\nTAG',
//     margin + col1Width + col2Width, yPos, col3Width, 60,
//     { fontSize: 8, bold: true, align: 'center', valign: 'center' }
//   );

//   drawRect(margin + col1Width + col2Width + col3Width, yPos, col4Width, 60);
//   addTextInBox(
//     'PROVIDER\'S PLAN OF CORRECTION\n(EACH CORRECTIVE ACTION SHOULD BE\nCROSS-REFERENCED TO THE APPROPRIATE\nDEFICIENCY)',
//     margin + col1Width + col2Width + col3Width, yPos, col4Width, 60,
//     { fontSize: 7, bold: true, align: 'center', valign: 'center' }
//   );

//   drawRect(margin + col1Width + col2Width + col3Width + col4Width, yPos, col5Width, 60);
//   addTextInBox(
//     '(X5)\nCOMPLETE\nDATE',
//     margin + col1Width + col2Width + col3Width + col4Width, yPos, col5Width, 60,
//     { fontSize: 7, bold: true, align: 'center', valign: 'center' }
//   );

//   return yPos + 60;
// };


//     // Helper function to add footer
//     const addFooter = (pageNum, totalPageCount) => {
//   const footerY = pageHeight - 25;

//   doc.fontSize(8).font('Helvetica');

//   // Left
//   doc.text(
//     'FORM CMS-2567(02-99) Previous Versions Obsolete',
//     margin,
//     footerY,
//     { width: 200, align: 'left' }
//   );

//   // Center
//   doc.text(
//     'Event ID: CGH711    Facility ID: 0968',
//     margin + 200,
//     footerY,
//     { width: 200, align: 'center' }
//   );

//   // Right
//   doc.text(
//     `If continuation sheet Page ${pageNum} of ${totalPageCount}`,
//     margin + 400,
//     footerY,
//     { width: 180, align: 'right' }
//   );

//   // Optional: Draw line above footer
//   doc.moveTo(margin, footerY - 5).lineTo(pageWidth - margin, footerY - 5).stroke();
// };


//     // Draw content rows
//     const drawContentRow = (deficiency, yPos) => {
//       const col1Width = 60;
//       const col2Width = 225;
//       const col3Width = 60;
//       const col4Width = 180;
//       const col5Width = 50;

//       // Calculate row height based on content
//       const deficiencyHeight = Math.max(
//         doc.heightOfString(deficiency.deficiencyText, { 
//           width: col2Width - 4, 
//           fontSize: 8 
//         }) + 10,
//         40
//       );
      
//       const solutionHeight = Math.max(
//         doc.heightOfString(deficiency.solutionText, { 
//           width: col4Width - 4, 
//           fontSize: 8 
//         }) + 10,
//         40
//       );

//       const rowHeight = Math.max(deficiencyHeight, solutionHeight, 40);

//       // Draw cells
//       drawRect(margin, yPos, col1Width, rowHeight);
//       addTextInBox(
//         deficiency.tagText,
//         margin, yPos, col1Width, rowHeight,
//         { fontSize: 9, align: 'center', valign: 'center', bold: true }
//       );

//       drawRect(margin + col1Width, yPos, col2Width, rowHeight);
//       addTextInBox(
//         deficiency.deficiencyText,
//         margin + col1Width, yPos, col2Width, rowHeight,
//         { fontSize: 8, align: 'left', valign: 'top' }
//       );

//       drawRect(margin + col1Width + col2Width, yPos, col3Width, rowHeight);
//       addTextInBox(
//         deficiency.tagText,
//         margin + col1Width + col2Width, yPos, col3Width, rowHeight,
//         { fontSize: 9, align: 'center', valign: 'center', bold: true }
//       );

//       drawRect(margin + col1Width + col2Width + col3Width, yPos, col4Width, rowHeight);
//       addTextInBox(
//         deficiency.solutionText,
//         margin + col1Width + col2Width + col3Width, yPos, col4Width, rowHeight,
//         { fontSize: 8, align: 'left', valign: 'top' }
//       );

//       drawRect(margin + col1Width + col2Width + col3Width + col4Width, yPos, col5Width, rowHeight);
//       // Empty complete date column

//       return rowHeight;
//     };

//     // Calculate total pages
//     const totalPages = Math.ceil(allDeficiencies.length / 8) + 1;

//     // Start with first page
//     currentY = drawHeader(true);

//     // Process deficiencies
//     for (let i = 0; i < allDeficiencies.length; i++) {
//       const deficiency = allDeficiencies[i];
      
//       // Check if we need a new page (leave space for footer)
//       const estimatedRowHeight = Math.max(
//         doc.heightOfString(deficiency.deficiencyText, { width: 226, fontSize: 8 }) + 20,
//         50
//       );

//       if (currentY + estimatedRowHeight > pageHeight - 60) {
//         // Add footer to current page
//         addFooter(currentPageNumber, totalPages);
        
//         // Start new page
//         doc.addPage();
//         currentPageNumber++;
//         currentY = drawHeader(false);
//       }

//       // Draw the deficiency row
//       const rowHeight = drawContentRow(deficiency, currentY);
//       currentY += rowHeight;
//     }

//     // Add footer to final page
//     addFooter(currentPageNumber, totalPages);

//     // Finalize the PDF
//     doc.end();

//   } catch (err) {
//     console.error("PDF generation error:", err);
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: err.message });
//   }
// };

// module.exports = { generatePOCPdf };




const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const FileModel = require("../models/File");

const generatePOCPdf = async (req, res) => {
  try {
    const { documentId } = req.body;
    const userId = req.user;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const file = await FileModel.findById(documentId);
    if (!file) return res.status(404).json({ error: "Document not found" });

    const allDeficiencies = [];

    if (file.deficiencies.data && file.deficiencies.data.length > 0) {
      for (let i = 0; i < file.deficiencies.data.length; i++) {
        const item = file.deficiencies.data[i];

        const tagText =
          item.Tag || item.tag || item.tagId || item.TagId || `F${String(i + 1).padStart(3, '0')}`;
        const deficiencyText =
          item.Deficiency ||
          item.deficiency ||
          item.description ||
          item.Description ||
          `Deficiency ${i + 1}`;

        let solutionText = "No solution provided";
        if (
          item.Solution ||
          item.solution ||
          item.planOfCorrection ||
          item.PlanOfCorrection
        ) {
          const solution =
            item.Solution ||
            item.solution ||
            item.planOfCorrection ||
            item.PlanOfCorrection;
          if (typeof solution === "string") {
            solutionText = solution;
          } else if (typeof solution === "object" && solution !== null) {
            solutionText = Object.values(solution)
              .filter((v) => typeof v === "string")
              .join("\n");
          }
        }

        allDeficiencies.push({
          tagText: tagText || "N/A",
          deficiencyText: deficiencyText || "N/A",
          solutionText: solutionText || "N/A",
        });
      }
    }

    if (allDeficiencies.length === 0) {
      return res.status(400).json({
        error: "No deficiencies found in document",
        debug: {
          fileId: documentId,
          deficienciesArray: file.deficiencies.data,
          fileKeys: Object.keys(file.toObject ? file.toObject() : file),
        },
      });
    }

    const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {
      const finalBuffer = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=CMS-2567_Report.pdf`);
      res.send(finalBuffer);
    });

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 15;
    const footerHeight = 30;
    const contentBottomY = pageHeight - footerHeight;

    let currentY = margin;
    let currentPageNumber = 1;

    const drawRect = (x, y, width, height, fillColor = null) => {
      if (fillColor) {
        doc.rect(x, y, width, height).fillAndStroke(fillColor, '#000000');
      } else {
        doc.rect(x, y, width, height).stroke('#000000');
      }
    };

    const addTextInBox = (text, x, y, width, height, options = {}) => {
      const {
        fontSize = 8,
        font = 'Helvetica',
        align = 'left',
        valign = 'top',
        padding = 2,
        bold = false
      } = options;

      doc.font(bold ? 'Helvetica-Bold' : font).fontSize(fontSize);

      let textY = y + padding;
      if (valign === 'center') {
        const textHeight = doc.heightOfString(text, { width: width - (padding * 2) });
        textY = y + (height - textHeight) / 2;
      }

      doc.text(text, x + padding, textY, {
        width: width - (padding * 2),
        height: height - (padding * 2),
        align: align,
        ellipsis: true
      });
    };

    const drawHeader = () => {
      let yPos = margin;
      // ... (Header drawing code same as before)
      return yPos + 60;
    };

    const addFooter = (pageNum, totalPageCount) => {
      const footerY = pageHeight - footerHeight + 10;

      doc.fontSize(8).font('Helvetica');
      doc.moveTo(margin, footerY - 5).lineTo(pageWidth - margin, footerY - 5).stroke();

      doc.text(
        'FORM CMS-2567(02-99) Previous Versions Obsolete',
        margin,
        footerY,
        { width: 200, align: 'left' }
      );
      doc.text(
        'Event ID: CGH711    Facility ID: 0968',
        pageWidth / 2 - 100,
        footerY,
        { width: 200, align: 'center' }
      );
      doc.text(
        `If continuation sheet Page ${pageNum} of ${totalPageCount}`,
        pageWidth - margin - 180,
        footerY,
        { width: 180, align: 'right' }
      );
    };

    const drawContentRow = (deficiency, yPos) => {
      const col1Width = 60;
      const col2Width = 225;
      const col3Width = 60;
      const col4Width = 180;
      const col5Width = 50;

      const deficiencyHeight = Math.max(
        doc.heightOfString(deficiency.deficiencyText, { width: col2Width - 4, fontSize: 8 }) + 10,
        40
      );
      const solutionHeight = Math.max(
        doc.heightOfString(deficiency.solutionText, { width: col4Width - 4, fontSize: 8 }) + 10,
        40
      );

      const rowHeight = Math.max(deficiencyHeight, solutionHeight, 40);

      drawRect(margin, yPos, col1Width, rowHeight);
      addTextInBox(deficiency.tagText, margin, yPos, col1Width, rowHeight, {
        fontSize: 9, align: 'center', valign: 'center', bold: true
      });

      drawRect(margin + col1Width, yPos, col2Width, rowHeight);
      addTextInBox(deficiency.deficiencyText, margin + col1Width, yPos, col2Width, rowHeight, {
        fontSize: 8, align: 'left', valign: 'top'
      });

      drawRect(margin + col1Width + col2Width, yPos, col3Width, rowHeight);
      addTextInBox(deficiency.tagText, margin + col1Width + col2Width, yPos, col3Width, rowHeight, {
        fontSize: 9, align: 'center', valign: 'center', bold: true
      });

      drawRect(margin + col1Width + col2Width + col3Width, yPos, col4Width, rowHeight);
      addTextInBox(deficiency.solutionText, margin + col1Width + col2Width + col3Width, yPos, col4Width, rowHeight, {
        fontSize: 8, align: 'left', valign: 'top'
      });

      drawRect(margin + col1Width + col2Width + col3Width + col4Width, yPos, col5Width, rowHeight);

      return rowHeight;
    };

    const totalPages = Math.ceil(allDeficiencies.length / 8) + 1;
    currentY = drawHeader();

    for (let i = 0; i < allDeficiencies.length; i++) {
      const deficiency = allDeficiencies[i];
      const estimatedRowHeight = Math.max(
        doc.heightOfString(deficiency.deficiencyText, { width: 226, fontSize: 8 }) + 20,
        50
      );

      if (currentY + estimatedRowHeight > contentBottomY) {
        addFooter(currentPageNumber, totalPages);
        doc.addPage();
        currentPageNumber++;
        currentY = drawHeader();
      }

      const rowHeight = drawContentRow(deficiency, currentY);
      currentY += rowHeight;
    }

    addFooter(currentPageNumber, totalPages);
    doc.end();

  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

module.exports = { generatePOCPdf };