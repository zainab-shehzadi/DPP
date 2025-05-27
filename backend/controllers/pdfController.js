const PDFDocument = require("pdfkit");
const FileModel = require("../models/File");

const generatePOCPdf = async (req, res) => {
  try {
    const { documentId } = req.body;
    const userId = req.user;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const file = await FileModel.findById(documentId);
    if (!file) return res.status(404).json({ error: "Document not found" });

    const allApproved = file.deficiencies.every((d) => d.status === "approved");
    if (!allApproved)
      return res.status(400).json({ error: "All tags must be approved." });

    console.log("=== DEBUG: Full File Object ===");
    console.log("File deficiencies:", JSON.stringify(file.deficiencies, null, 2));

    // TEMPORARY: Process ALL deficiencies without filtering to see what we get
    const allDeficiencies = [];
    
    if (file.deficiencies && file.deficiencies.length > 0) {
      for (let i = 0; i < file.deficiencies.length; i++) {
        const item = file.deficiencies[i];
        console.log(`\n=== Processing deficiency ${i} ===`);
        console.log("Raw item:", JSON.stringify(item, null, 2));
        
        // Try multiple possible field names
        const tagText = item.Tag || item.tag || item.tagId || item.TagId || `Tag ${i+1}`;
        const deficiencyText = item.Deficiency || item.deficiency || item.description || item.Description || `Deficiency ${i+1}`;
        
        let solutionText = "No solution provided";
        if (item.Solution || item.solution || item.planOfCorrection || item.PlanOfCorrection) {
          const solution = item.Solution || item.solution || item.planOfCorrection || item.PlanOfCorrection;
          if (typeof solution === 'string') {
            solutionText = solution;
          } else if (typeof solution === 'object' && solution !== null) {
            // Try to extract meaningful text from object
            solutionText = JSON.stringify(solution, null, 2);
          }
        }

        console.log("Extracted:", { tagText, deficiencyText, solutionText: solutionText.substring(0, 100) });

        // Add ALL items for debugging
        allDeficiencies.push({ 
          tagText: tagText || "N/A", 
          deficiencyText: deficiencyText || "N/A", 
          solutionText: solutionText || "N/A" 
        });
      }
    }

    console.log("\n=== FINAL RESULT ===");
    console.log("Total deficiencies to process:", allDeficiencies.length);

    // If still no deficiencies, there's a fundamental data issue
    if (allDeficiencies.length === 0) {
      return res.status(400).json({ 
        error: "No deficiencies found in document",
        debug: {
          fileId: documentId,
          deficienciesArray: file.deficiencies,
          fileKeys: Object.keys(file.toObject ? file.toObject() : file)
        }
      });
    }

    // Create PDF with ALL data (for debugging)
    const doc = new PDFDocument({ size: "A4", margin: 30 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {
      const finalBuffer = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=POC_Report_Debug.pdf`);
      res.send(finalBuffer);
    });

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidths = [80, 240, 80, pageWidth - 80 - 240 - 80];
    const headers = ["Tag", "Deficiency", "Tag", "Plan of Correction"];
    const headerHeight = 30;

    const drawCell = (text, x, y, width, height, bold = false) => {
      doc.rect(x, y, width, height).stroke();
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9);
      doc.text(text, x + 5, y + 5, {
        width: width - 10,
        height: height - 10,
        align: "left",
        continued: false,
        ellipsis: true
      });
    };

    const getTextHeight = (text, width, fontSize = 9) => {
      return doc.heightOfString(text, { width: width - 10, align: "left", fontSize });
    };

    const drawTableHeader = (yPosition) => {
      const xStart = doc.page.margins.left;
      let x = xStart;
      headers.forEach((title, i) => {
        doc.rect(x, yPosition, colWidths[i], headerHeight).stroke();
        doc.font("Helvetica-Bold").fontSize(10).text(title, x + 5, yPosition + 8, { 
          width: colWidths[i] - 10, align: "center", continued: false
        });
        x += colWidths[i];
      });
      return yPosition + headerHeight;
    };

    // Title
    doc.fontSize(16).font("Helvetica-Bold")
       .text("CMS-2567 Deficiency and Plan of Correction Report (DEBUG)", { align: "center" });
    
    let currentY = doc.y + 20;
    currentY = drawTableHeader(currentY);

    // Process ALL deficiencies
    for (let i = 0; i < allDeficiencies.length; i++) {
      const { tagText, deficiencyText, solutionText } = allDeficiencies[i];

      const heights = [
        getTextHeight(tagText, colWidths[0]) + 10,
        getTextHeight(deficiencyText, colWidths[1]) + 10,
        getTextHeight(tagText, colWidths[2]) + 10,
        getTextHeight(solutionText, colWidths[3]) + 10,
      ];
      const rowHeight = Math.max(...heights, 30);

      const pageBottom = doc.page.height - doc.page.margins.bottom;
      if (currentY + rowHeight > pageBottom) {
        doc.addPage();
        currentY = doc.page.margins.top;
        currentY = drawTableHeader(currentY);
      }

      let x = doc.page.margins.left;
      drawCell(tagText, x, currentY, colWidths[0], rowHeight);
      x += colWidths[0];
      drawCell(deficiencyText, x, currentY, colWidths[1], rowHeight);
      x += colWidths[1];
      drawCell(tagText, x, currentY, colWidths[2], rowHeight);
      x += colWidths[2];
      drawCell(solutionText, x, currentY, colWidths[3], rowHeight);

      currentY += rowHeight;
    }

    doc.end();

  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

module.exports = { generatePOCPdf };