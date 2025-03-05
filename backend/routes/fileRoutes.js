const express = require("express");
const router = express.Router();
const upload = require("../config/multer"); // Import multer configuration
const { uploadFile,fetchTagsByEmail, generateSolution,checkResponse,fetchTagsByEmail1,fetchTagsAndSolutionByEmail} = require("../controllers/fileController");
const mongoose = require("mongoose");
const File = require("../models/File"); 


router.post("/docs", async (req, res) => {
  try {
    // Extract email from request body (not query)
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userFiles = await File.find({ email });

    if (!userFiles || userFiles.length === 0) {
      return res.status(404).json({ error: "No files found for this user" });
    }

    // ✅ Ensure proper structure in the response
    const fileData = userFiles.flatMap(user =>
      user.files.map(file => ({
        _id: file._id,
        originalName: file.originalName,
        fileUrl: file.fileUrl
      }))
    );

    return res.status(200).json(fileData);
  } catch (error) {
    console.error("Error fetching files:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



router.post("/upload", upload.single("file"), uploadFile);
router.get("/tags", fetchTagsByEmail); 
router.post("/tags1", fetchTagsByEmail1); 

router.post("/tags-with-descriptions", async (req, res) => {
  try {
    const { email, id } = req.body;

    if (!email || !id) {
      return res.status(400).json({ error: "Email and ID are required" });
    }

    // Find the document by email and ID
    const document = await File.findOne({ email, "files._id": id }, { "files.$": 1 });

    if (!document || !document.files.length) {
      return res.status(404).json({ error: "Document not found" });
    }

    const file = document.files[0];

    // Ensure `tags` exist in the document
    if (!file.tags || file.tags.length === 0) {
      return res.status(200).json({ tags: [] });
    }

    res.status(200).json({ tags: file.tags });

  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tag-details", async (req, res) => {
  try {
    let { tagId, tagName } = req.body;

    
    if (!tagId || !tagName) {
      return res.status(400).json({ error: "Both tagId and tagName are required" });
    }

    if (mongoose.Types.ObjectId.isValid(tagId)) {
      tagId = new mongoose.Types.ObjectId(tagId);
    } else {
      console.error("❌ Invalid ObjectId format:", tagId);
      return res.status(400).json({ error: "Invalid tagId format" });
    }

    // ✅ Find the document containing the specific tag
    const document = await File.findOne(
      { "files.tags._id": tagId, "files.tags.tag": tagName }, // Ensure both tagId and tagName match
      { "files.$": 1 } // Return only the matching file
    );

    if (!document || !document.files.length) {
      console.error(`❌ No document found for tagId=${tagId} and tagName=${tagName}`);
      return res.status(404).json({ error: "Tag details not found" });
    }

    const file = document.files[0];

    const tagData = file.tags.find(t => t._id.toString() === tagId.toString() && t.tag === tagName);

    if (!tagData) {
      console.error(`❌ Tag ${tagName} with ID ${tagId} not found in document`);
      return res.status(404).json({ error: "Tag not found in document" });
    }
    const response = {
      tag: tagData.tag,
      shortDescription: tagData.shortDescription || "",
      longDescription: tagData.longDescription || "",
      solution: tagData.response?.solution || [],
      policies: tagData.response?.policies || [],
      task: tagData.response?.task || [],
      status: tagData.status
    };

    //console.log("✅ Found Tag Details:", response);
    res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error fetching tag details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/update-status", async (req, res) => {
  try {
    const { tagId, status } = req.body;

    if (!tagId || !status) {
      console.log("Validation Failed: Missing tagId or status");
      return res.status(400).json({ error: "Tag ID and status are required." });
    }

    const updatedFile = await File.findOneAndUpdate(
      { "files.tags._id": tagId }, 
      { $set: { "files.$[].tags.$[tag].status": status } },
      { new: true, arrayFilters: [{ "tag._id": tagId }] }
    );

    if (!updatedFile) {
      console.log("Update Failed: Tag not found");
      return res.status(404).json({ error: "Tag not found." });
    }
    res.status(200).json({
      message: "Status updated successfully.",
      status: status,
      updatedFile, 
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/delete-documents", async (req, res) => {
  try {
    const { email, documentIds } = req.body;

    console.log("Received email:", email);
    console.log("Received document IDs:", documentIds);

    // Validate request body
    if (!email || !documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      console.log("Validation Failed: Missing email or document IDs");
      return res.status(400).json({ error: "Email and Document IDs are required." });
    }

    // Find and update the document by pulling out the selected files
    const updatedFile = await File.findOneAndUpdate(
      { email },
      { $pull: { files: { _id: { $in: documentIds } } } }, // Remove matching files
      { new: true }
    );

    if (!updatedFile) {
      console.log("File Not Found");
      return res.status(404).json({ error: "No matching files found for this email." });
    }

    res.status(200).json({
      message: "Documents deleted successfully.",
      updatedFiles: updatedFile.files, // Return updated list of files
    });
  } catch (error) {
    console.error("Error deleting documents:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});





router.get("/tags2",fetchTagsAndSolutionByEmail ); 
router.post("/generatesol", generateSolution);
router.get('/check-response',  checkResponse);

module.exports = router;
