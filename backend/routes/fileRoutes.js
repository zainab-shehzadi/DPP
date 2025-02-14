const express = require("express");
const router = express.Router();
const upload = require("../config/multer"); // Import multer configuration
const { uploadFile,fetchTagsByEmail,getTagsWithDescriptions ,fetchDocuments, generateSolution,checkResponse,fetchTagsByEmail1,fetchTagsAndSolutionByEmail} = require("../controllers/fileController");
const mongoose = require("mongoose");
const File = require("../models/File"); // Import File model

// Route to fetch file names & IDs for a specific user
// Route to fetch file details for a specific user
router.get("/docs", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user's files (Using find() to get all documents related to the user)
    const userFiles = await File.find({ email });

    if (!userFiles || userFiles.length === 0) {
      return res.status(404).json({ error: "No files found for this user" });
    }

    // ✅ Ensure proper structure in the response
    const fileData = userFiles.flatMap(user => 
      user.files.map(file => ({
        _id: file._id, // ✅ Use _id for consistency
        originalName: file.originalName, // ✅ Keep original file name
        fileUrl: file.fileUrl, // ✅ Ensure file URL is included
      }))
    );

    return res.status(200).json(fileData);
  } catch (error) {
    console.error("Error fetching files:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/upload", upload.single("file"), uploadFile);
router.get("/tags", fetchTagsByEmail); // Route to fetch tags by a specific ID
router.get("/tags1", fetchTagsByEmail1); // Route to fetch tags by a specific ID
//router.get("/tags-with-descriptions", getTagsWithDescriptions);
router.get("/tags-with-descriptions", async (req, res) => {
  try {
    const { email, id } = req.query;

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

router.get("/tag-details", async (req, res) => {
  try {
    let { tagId, tagName } = req.query;

    // ✅ Ensure both tagId and tagName are provided
    if (!tagId || !tagName) {
      return res.status(400).json({ error: "Both tagId and tagName are required" });
    }

    console.log(`🔍 Received API Request: tagId=${tagId}, tagName=${tagName}`);

    // ✅ Convert tagId to ObjectId if it's a valid format
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

    // ✅ Find the correct tag using both `tagId` and `tagName`
    const tagData = file.tags.find(t => t._id.toString() === tagId.toString() && t.tag === tagName);

    if (!tagData) {
      console.error(`❌ Tag ${tagName} with ID ${tagId} not found in document`);
      return res.status(404).json({ error: "Tag not found in document" });
    }

    // ✅ Extract tag details
    const response = {
      tag: tagData.tag,
      shortDescription: tagData.shortDescription || "",
      longDescription: tagData.longDescription || "",
      solution: tagData.response?.solution || [],
      policies: tagData.response?.policies || [],
      task: tagData.response?.task || [],
    };

    console.log("✅ Found Tag Details:", response);
    res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error fetching tag details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tags2",fetchTagsAndSolutionByEmail ); // Route to fetch tags by a specific ID
router.post("/generatesol", generateSolution);
router.get('/check-response',  checkResponse);

module.exports = router;
