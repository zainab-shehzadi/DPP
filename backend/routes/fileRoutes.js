const express = require("express");
const router = express.Router();
const upload = require("../config/multer"); 
const {
  uploadFile,
  getUserFiles,
  fetchTagsByEmail,
  extractInfoApi,
  generateSolution,
  checkResponse,
  fetchTagsByEmail1,
  fetchPolicyById,
  fetchTagsAndSolutionByEmail,
  regeneratePolicy,
  fetchPolicyByTagAndDeficiency,
  fetchPolicy,
  getPocApi,
  deleteFile,
  approveSolution,
  updateSolution,
   getUserDocuments,
} = require("../controllers/fileController");
const mongoose = require("mongoose");
const File = require("../models/File");
const { protect } = require("../middlewares/authMiddleware");
router.post("/user-docs",  getUserDocuments);
router.post("/upload", protect, upload.single("file"), uploadFile);
router.post("/extract-info", protect, extractInfoApi);
router.post("/docs", protect, getUserFiles);
router.get("/tags", fetchTagsByEmail);
router.post("/tags1", fetchTagsByEmail1);
router.post("/fetch-policy-by-tag", protect, fetchPolicyByTagAndDeficiency);
router.post("/regenerate-policies", protect, regeneratePolicy);
router.post("/fetchpolicy", fetchPolicyById);
router.get("/policy-detail/:policyId", protect, fetchPolicy);
router.post("/get-poc-api",protect,  getPocApi)
router.post("/delete-documents",protect, deleteFile);
router.put("/approve-tag", protect, approveSolution);
  
router.post("/tags-with-descriptions", async (req, res) => {
  try {
    const { email, id } = req.body;

    if (!email || !id) {
      return res.status(400).json({ error: "Email and ID are required" });
    }

    // Find the document by email and ID
    const document = await File.findOne(
      { email, "files._id": id },
      { "files.$": 1 }
    );

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



router.post("/update-status", async (req, res) => {
  const { docId, tagId, status, email } = req.body;

  if (!docId || !tagId || !status || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const updated = await File.findOneAndUpdate(
      {
        email: email,
        "files._id": docId,
        "files.tags._id": tagId,
      },
      {
        $set: {
          "files.$[file].tags.$[tag].pocStatus": status,
        },
      },
      {
        arrayFilters: [{ "file._id": docId }, { "tag._id": tagId }],
        new: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.json({ message: "Tag status updated", updated });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/updateSolution", protect, updateSolution);

router.put("/updateSolution1", async (req, res) => {
  try {
    const { email, id, tagId, solution } = req.body;

    console.log("📥 Received Data:", { email, id, tagId, solution });

    // ✅ Ensure required fields are provided, but allow null solutions
    if (!email || !id || !tagId) {
      return res
        .status(400)
        .json({ error: "Email, ID, and tagId are required" });
    }

    // ✅ Find the document containing the file
    const document = await File.findOne({ email, "files._id": id });

    if (!document) {
      return res
        .status(404)
        .json({ error: "Document not found for the given email and ID" });
    }

    // ✅ Find the specific file inside `files` array
    const file = document.files.find((f) => f._id.toString() === id);
    if (!file) {
      return res.status(404).json({ error: "File not found in the document" });
    }

    // ✅ Find the specific tag inside the file's `tags` array
    const tagToUpdate = file.tags.find((tag) => tag._id.toString() === tagId);
    if (!tagToUpdate) {
      return res.status(404).json({ error: "Tag not found in this file" });
    }

    if (!tagToUpdate.response) {
      tagToUpdate.response = {};
    }

    tagToUpdate.response.solution =
      solution && solution.length > 0
        ? Array.isArray(solution)
          ? solution
          : [solution]
        : null;

    await document.save();

    console.log(
      "Solution Updated Successfully:",
      tagToUpdate.response.solution
    );

    res.status(200).json({
      message: "Solution updated successfully",
      updatedSolution: tagToUpdate.response.solution,
      updatedTag: tagToUpdate,
    });
  } catch (error) {
    console.error("❌ Error updating solution:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tag-details", async (req, res) => {
  try {
    let { tagId, tagName } = req.body;

    console.log("🔹 Incoming request:", { tagId, tagName });

    if (!tagId || !tagName) {
      console.error("❌ Missing tagId or tagName in request");
      return res
        .status(400)
        .json({ error: "Both tagId and tagName are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(tagId)) {
      console.error("❌ Invalid ObjectId format:", tagId);
      return res.status(400).json({ error: "Invalid tagId format" });
    }

    tagId = new mongoose.Types.ObjectId(tagId);

    // Retry mechanism for transient failures
    let document;
    let attempts = 3;
    while (attempts > 0) {
      try {
        document = await File.findOne(
          { "files.tags._id": tagId, "files.tags.tag": tagName },
          { "files.$": 1 }
        );
        break; // Exit loop if successful
      } catch (err) {
        console.error(
          `⚠️ MongoDB Query Failed. Attempts left: ${attempts - 1}`,
          err
        );
        attempts--;
        if (attempts === 0) {
          throw err; // Throw error after exhausting attempts
        }
      }
    }

    if (!document || !document.files.length) {
      console.error(
        `❌ No document found for tagId=${tagId} and tagName=${tagName}`
      );
      return res.status(404).json({ error: "Tag details not found" });
    }

    const file = document.files[0];

    const tagData = file.tags.find(
      (t) => t._id.toString() === tagId.toString() && t.tag === tagName
    );

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
      status: tagData.status,
    };

    console.log("✅ Found Tag Details:", response);
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




router.post("/tagDescriptions", async (req, res) => {
  try {
    const { email, id, tagId } = req.body;

    if (!email || !id || !tagId) {
      console.log("❌ Missing parameters:", { email, id, tagId });
      return res
        .status(400)
        .json({ error: "Email, document ID, and tag ID are required" });
    }

    console.log("🔍 Searching for document with:", { email, id, tagId });

    // Find the document by email and document ID
    const document = await File.findOne(
      { email, "files._id": id },
      { "files.$": 1 } // Returns only matching file
    );

    if (!document || !document.files.length) {
      console.log("❌ Document not found for:", { email, id });
      return res.status(404).json({ error: "Document not found" });
    }

    const file = document.files[0];

    // Ensure tags exist in the document
    if (!file.tags || file.tags.length === 0) {
      console.log("❌ No tags found in document:", file);
      return res.status(404).json({ error: "No tags found in this document" });
    }

    // Find the specific tag by tagId
    const tag = file.tags.find((tag) => tag._id.toString() === tagId);

    if (!tag) {
      console.log("❌ Tag not found for tagId:", tagId);
      return res.status(404).json({ error: "Tag not found in this document" });
    }

    console.log("✅ Tag found:", tag);

    const solution = tag.response?.solution || [];

    res.status(200).json({ tag, solution }); // ✅ Send tag and solution separately
  } catch (error) {
    console.error("❌ Error fetching tag details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tags2", fetchTagsAndSolutionByEmail);
router.post("/generatesol", protect, generateSolution);
router.get("/check-response", checkResponse);

module.exports = router;
