const express = require("express");
const router = express.Router();
const upload = require("../config/multer"); // Import multer configuration
const { uploadFile,fetchTagsByEmail,getTagsWithDescriptions ,fetchDocuments, generateSolution,checkResponse,fetchTagsByEmail1,fetchTagsAndSolutionByEmail} = require("../controllers/fileController");

const File = require("../models/File"); // Import File model

// Route to fetch file names & IDs for a specific user
// Route to fetch file details for a specific user
router.get("/docs", async (req, res) => {
    try {
      const { email } = req.query;
  
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
  
      // Find user's files
      const userFiles = await File.findOne({ email });
  
      if (!userFiles || !userFiles.files || userFiles.files.length === 0) {
        return res.status(404).json({ error: "No files found for this user" });
      }
  
      // ✅ Include fileUrl in the response
      const fileData = userFiles.files.map(file => ({
        id: file._id,
        originalName: file.originalName, // ✅ Keep originalName
        fileUrl: file.fileUrl, // ✅ Ensure fileUrl is included
      }));
  
      res.status(200).json({ files: fileData });
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

router.post("/upload", upload.single("file"), uploadFile);
router.get("/tags", fetchTagsByEmail); // Route to fetch tags by a specific ID
router.get("/tags1", fetchTagsByEmail1); // Route to fetch tags by a specific ID
router.get("/tags-with-descriptions", getTagsWithDescriptions);
router.get("/tags2",fetchTagsAndSolutionByEmail ); // Route to fetch tags by a specific ID
router.post("/generatesol", generateSolution);
router.get('/check-response',  checkResponse);

module.exports = router;
