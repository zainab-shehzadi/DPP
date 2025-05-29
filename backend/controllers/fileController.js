const FormData = require("form-data");
const pdf = require("pdf-parse");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const uploadedAt = new Date();
// AWS SDK
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { Readable } = require("stream");
const File = require("../models/File");
const extractedInfo = require("../models/extractedInfo");
// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file) => {
  try {
    const fileName = `${uuidv4()}-${file.originalname}`;

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    const result = await upload.done();
    return result.Location;
  } catch (error) {
    console.error("AWS S3 Upload Error:", error);
    throw error;
  }
};

const approveSolution = async (req, res) => {
  try {
    const { documentId, tagId } = req.body;

    if (!documentId || !tagId) {
      return res.status(400).json({ error: "Missing documentId or tagId" });
    }

    const updatedFile = await File.findOneAndUpdate(
      { _id: documentId, "deficiencies._id": tagId },
      { $set: { "deficiencies.$.status": "approved" } },
      { new: true }
    );
    console.log("tag approved", updatedFile);
    if (!updatedFile) {
      return res.status(404).json({ error: "Document or tag not found" });
    }

    res.status(200).json({ message: "Tag approved", document: updatedFile });
  } catch (error) {
    console.error("Error approving tag:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fetchPolicy = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID missing." });
    }

    let { policyId } = req.params;

    console.log("Received policyId:", policyId);
    policyId = policyId?.trim().replace(/[^a-fA-F0-9]/g, "");

    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      return res.status(400).json({ message: "Invalid policyId format." });
    }

    const existingDocument = await extractedInfo.findById(policyId);

    if (!existingDocument) {
      return res.status(404).json({ message: "Policy document not found" });
    }

    res.status(200).json({
      success: true,
      policy: existingDocument,
    });
  } catch (error) {
    console.error("Error fetching policy by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { documentIds } = req.body;
    const userId = req.user?.id;
    console.log("Incoming request:", { documentIds, userId });
    if (!userId || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing user ID or document IDs." });
    }

    // Delete all files owned by the user and matching the IDs
    await File.deleteMany({
      _id: { $in: documentIds },
      userId,
    });

    // Fetch remaining documents for the user
    const remainingFiles = await File.find({ userId }).sort({ uploadedAt: -1 });

    res.status(200).json({
      message: "Documents deleted successfully.",
      documents: remainingFiles,
    });
  } catch (error) {
    console.error("Error deleting documents:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};
const getUserDocuments = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const documents = await File.find({ userId });
console.log("Documents:", documents);
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching user documents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const extractInfoApi = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID missing." });
    }

    const { text, Deficiency, FileId,tag } = req.body;
    console.log("Incoming request:", { text, Deficiency, FileId });
    if (!text || !Deficiency || !FileId) {
      return res
        .status(400)
        .json({ error: "Text, Deficiency, and File ID are required." });
    }

   
    let tags = [];
    let policies = [];
    let deficiencies = [];

    try {
      const response = await axios.post(
        `${process.env.NGROK_URL}/extract-info/`,
        { text }
      );
      tags = response.data.tags || [];
      policies = response.data.policies || [];
      deficiencies = [...(response.data.deficiencies || []), Deficiency];
    } catch (ngrokError) {
      console.error("NGROK API call failed:", ngrokError.message);
      return res.status(500).json({ error: "Failed to process input text." });
    }
    // ✅ Check for existing entry
    const existing = await extractedInfo.findOne({
      userId,
      fileId: FileId,
    
      // tags: { $all: tags },
      deficiencies: { $all: deficiencies },
    });

    if (existing) {
      return res.status(200).json({
        message: "Similar extraction already exists.",
        data: existing,
        tags: tag,
        isExisting: true,
      });
    }

    const savedInfo = await extractedInfo.create({
      userId,
      fileId: FileId,
      inputText: text,
      tags,
      policies,
      deficiencies,
    });

    res.status(201).json({
      message: "Extraction successful.",
      data: savedInfo,
      isExisting: false,
    });
  } catch (error) {
    console.error("Server error:", error.message);
    res
      .status(500)
      .json({ error: "Server error occurred.", details: error.message });
  }
};


const getUserFiles = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User ID not found" });
    }

    const userFiles = await File.find({ userId });

    if (!userFiles || userFiles.length === 0) {
      return res.status(404).json({ error: "No files found for this user" });
    }

    return res.status(200).json(userFiles);
  } catch (error) {
    console.error("❌ Error fetching files:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const fetchPolicyById = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Policy ID is required in request body." });
    }
    console.log("id", id);
    const policy = await extractedInfo.findById(id);
    console.log(policy);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found." });
    }

    res.status(200).json({
      message: "Policy fetched successfully.",
      data: policy,
    });
  } catch (error) {
    console.error("Error fetching policy:", error.message);
    res.status(500).json({
      error: "Server error occurred while fetching the policy.",
      details: error.message,
    });
  }
};

const fetchTagsByEmail = async (req, res) => {
  const { email, id } = req.query;

  if (!email) {
    return res
      .status(400)
      .json({ error: "Email is required in query parameters" });
  }

  if (!id) {
    return res
      .status(400)
      .json({ error: "ID is required in query parameters" });
  }

  try {
    const files = await File.find({ email }, "files");

    if (!files || files.length === 0) {
      return res
        .status(404)
        .json({ error: `No files found for email ${email}` });
    }

    const matchingFiles = files.flatMap((file) =>
      file.files.filter((fileEntry) => fileEntry.id === id)
    );

    if (!matchingFiles || matchingFiles.length === 0) {
      return res.status(404).json({ error: `No file found for ID ${id}` });
    }

    const tags = matchingFiles.flatMap((fileEntry) =>
      fileEntry.tags.map((tagObj) => tagObj.tag)
    );

    const uniqueTags = [...new Set(tags)];
    res.status(200).json(uniqueTags);
  } catch (error) {
    console.error(
      `Error fetching tags for Email (${email}) and ID (${id}):`,
      error.message
    );
    res
      .status(500)
      .json({ error: "Failed to fetch tags", details: error.message });
  }
};

const regeneratePolicy = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID missing." });
    }

    const {
      tags = [],
      deficiencies = [],
      policies = [],
      extractedInfoId,
    } = req.body;

    if (!extractedInfoId) {
      return res.status(400).json({ error: "extractedInfoId is required." });
    }

    if (
      !Array.isArray(tags) ||
      !Array.isArray(deficiencies) ||
      !Array.isArray(policies)
    ) {
      return res.status(400).json({
        error: "tags, deficiencies, and policies must be arrays.",
      });
    }

    // Find the extractedInfo document
    const extractedInfoDoc = await extractedInfo.findById(extractedInfoId);

    if (!extractedInfoDoc) {
      return res.status(404).json({ error: "Extracted info record not found." });
    }

    // Always regenerate (overwrite if already exists)

    // Call external policy generation service
    let solutionPolicies = null;

    try {
      const response = await axios.post(
        `${process.env.NGROK_URL}/get-solution-policies/`,
        {
          tags,
          deficiencies,
          policies,
        }
      );

      solutionPolicies = response.data;
    } catch (apiError) {
      console.error("NGROK policy API call failed:", apiError.message);
      return res.status(500).json({
        error: "Failed to fetch solution policies from external service.",
      });
    }

    // Save the new solution object to MongoDB
    if (solutionPolicies?.solution_policies) {
      extractedInfoDoc.updatedPolicy = {
        solution_policies: solutionPolicies.solution_policies,
        supporting_references: solutionPolicies.supporting_references || [],
      };

      await extractedInfoDoc.save();

      return res.status(200).json({
        message: "Policy regeneration successful. Existing policy was replaced.",
        data: extractedInfoDoc.updatedPolicy,
        isExisting: false,
      });
    } else {
      return res.status(500).json({
        error: "Invalid response format from external policy service.",
      });
    }
  } catch (error) {
    console.error("Server error:", error.message);
    return res.status(500).json({
      error: "Server error occurred.",
      details: error.message,
    });
  }
};


const fetchPolicyByTagAndDeficiency = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID missing." });
    }

    const { tag, deficiency, fileID } = req.body;

    if (!tag || !deficiency || !fileID) {
      return res.status(400).json({
        error: "Both tag and deficiency are required in request body.",
      });
    }

    const normalizedTag = tag.replace(/\s+/g, "").trim();
    const normalizedDef = deficiency;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const existing = await extractedInfo.find({
      userId: userObjectId,
      // tags: { $in: [normalizedTag] },
      fileId: fileID,
      deficiencies: { $in: [normalizedDef] },
    });


    if (!existing) {
      return res.status(404).json({
        error: `No policy found for Tag: "${tag}" and the provided Deficiency.`,
      });
    }

    return res.status(200).json({
      message: "Policy fetched successfully.",
      policy: existing,
      isExisting: true,
    });
  } catch (error) {
    console.error("Error fetching policy:", error.message);
    return res.status(500).json({
      error: "Server error occurred while fetching the policy.",
      details: error.message,
    });
  }
};

const updateSolution = async (req, res) => {
  try {
    const { documentId, tagId, solution } = req.body;
    const userId = req.user._id;

    if (!documentId || !tagId) {
      return res
        .status(400)
        .json({ error: "documentId and tagId are required." });
    }

    const file = await File.findOne({ _id: documentId, userId });

    if (!file) {
      return res.status(404).json({ error: "File not found for this user." });
    }

    const deficiency = file.deficiencies.find(
      (d) => d._id.toString() === tagId
    );

    if (!deficiency) {
      return res
        .status(404)
        .json({ error: "Deficiency not found in this file." });
    }

    // ✅ Properly assign the structured solution object
    deficiency.Solution =
      solution && typeof solution === "object" ? solution : null;

    await file.save();

    console.log("✅ updated solution:", deficiency.Solution);

    res.status(200).json({
      message: "Solution updated successfully.",
      updatedSolution: deficiency.Solution,
      updatedDeficiency: deficiency,
      updatedDocument: file,
    });
  } catch (error) {
    console.error("❌ Error updating solution:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPocApi = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      fileId,
      tags = [],
      deficiencies = [],
      solution_policies = [],
      policies = [],
      supporting_references = [],
    } = req.body;

    if (!userId)
      return res.status(401).json({ error: "Unauthorized: user ID missing." });
    if (!fileId) return res.status(400).json({ error: "fileId is required." });
    if (!Array.isArray(tags) || tags.length === 0)
      return res.status(400).json({ error: "tags must be a non-empty array." });

    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ error: "File not found." });

    let solutionData = {};
    try {
      const { data } = await axios.post(`${process.env.NGROK_URL}/get-poc/`, {
        tags,
        deficiencies,
        solution_policies,
        supporting_references,
      });
      solutionData = data;
    } catch (apiError) {
      console.error("NGROK policy API call failed:", apiError);
      return res.status(500).json({ error: "Failed to fetch solution." });
    }
    console.log("Solution data:", solutionData);
    const updatedDeficiencies = file.deficiencies.map((deficiency) => {
      if (tags.includes(deficiency.Tag)) {
        deficiency.Solution = solutionData; // Save full Q&A object
      }
      return deficiency;
    });

    file.deficiencies = updatedDeficiencies;
    const updatedFile = await file.save();
    console.log("Updated file:", updatedFile);
    return res.status(200).json({
      message: "Deficiencies updated with solutions.",
      data: updatedFile.deficiencies,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Server error occurred.",
      details: error.message,
    });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID missing." });
    }

    // ✅ Check for existing file with same name for same user
    const existingFile = await File.findOne({
      userId,
      originalName: req.file.originalname,
    });

    if (existingFile) {
      return res.status(400).json({
        error: "File already exists.",
        existingFileId: existingFile._id,
      });
    }

    // ⬇️ Continue as normal
    const fileUrl = await uploadToS3(req.file);

    const formData = new FormData();
    const fileStream = new Readable();
    fileStream.push(req.file.buffer);
    fileStream.push(null);

    formData.append("file", fileStream, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    let extractedDeficiencies = [];
    try {
      const tagApiResponse = await axios.post(
        `${process.env.NGROK_URL}/extract-ftags/`,
        formData,
        { headers: { ...formData.getHeaders() } }
      );
      extractedDeficiencies = tagApiResponse.data || [];
    } catch (tagError) {
      console.error(
        "Error extracting deficiencies from ngrok API:",
        tagError.message
      );
    }

    const fileEntry = await File.create({
      userId,
      originalName: req.file.originalname,
      fileUrl,
      filePath: req.file.path || "",
      deficiencies: extractedDeficiencies,
      uploadedAt: new Date(),
    });

    res.status(201).json({
      message: "File uploaded and processed successfully!",
      documentId: fileEntry._id,
      fileUrl,
      deficiencies: extractedDeficiencies,
      uploadedAt: fileEntry.uploadedAt,
    });
  } catch (error) {
    console.error("Error in file upload:", error.message);
    res
      .status(500)
      .json({ error: "File upload failed.", details: error.message });
  }
};
const fetchTagsByEmail1 = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ error: "Email is required in query parameters" });
  }

  try {
    // Find all files associated with the given email
    const files = await File.find({ email }, "files.tags");

    if (!files || files.length === 0) {
      // If no files are found, return a 404 response
      return res
        .status(404)
        .json({ error: `No files found for email ${email}` });
    }

    const tags = files.flatMap((file) =>
      file.files.flatMap((fileEntry) =>
        fileEntry.tags.map((tagObj) => tagObj.tag)
      )
    );
    res.status(200).json(tags);
  } catch (error) {
    console.error(`Error fetching tags for Email (${email}):`, error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch tags", details: error.message });
  }
};

const fetchTagsAndSolutionByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res
      .status(400)
      .json({ error: "Email is required in query parameters" });
  }

  try {
    // Find all files associated with the given email, including tags and responses (solution)
    const files = await File.find({ email }, "files.tags files.solution");

    if (!files || files.length === 0) {
      // If no files are found, return a 404 response
      return res
        .status(404)
        .json({ error: `No files found for email ${email}` });
    }

    // Extract tags and corresponding solutions from each file entry
    const tagsWithSolution = files.flatMap((file) =>
      file.files.flatMap((fileEntry) =>
        fileEntry.tags.map((tagObj) => {
          return {
            tag: tagObj.tag,
            solution: tagObj.response ? tagObj.response.solution : null, // Extract solution from the tag's response field
          };
        })
      )
    );

    const flattenedTagsWithSolution = tagsWithSolution.flat();

    flattenedTagsWithSolution.forEach((entry) => {
      console.log(`Tag: ${entry.tag}, Solution: ${entry.solution}`);
    });

    res.status(200).json(flattenedTagsWithSolution);
  } catch (error) {
    console.error(
      `Error fetching tags and solutions for Email (${email}):`,
      error.message
    );
    res.status(500).json({
      error: "Failed to fetch tags and solutions",
      details: error.message,
    });
  }
};

const getTagsWithDescriptions = async (req, res) => {
  const { email, id } = req.query; // Extract email and id from query parameters

  if (!email) {
    console.error("Error: Email query parameter is missing");
    return res.status(400).json({ error: "Email query parameter is required" });
  }

  if (!id) {
    console.error("Error: ID query parameter is missing");
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const files = await File.find({ email });

    if (!files || files.length === 0) {
      console.warn(`No files found for email ${email}`);
      return res
        .status(404)
        .json({ error: `No files found for email ${email}` });
    }

    const matchingFiles = files.flatMap(
      (file) => file.files.filter((fileEntry) => fileEntry.id === id) // Compare as strings
    );

    if (matchingFiles.length === 0) {
      console.warn(`No file entries found for ID: ${id}`);
      return res
        .status(404)
        .json({ error: `No file entries found for ID: ${id}` });
    }

    const tagDetails = matchingFiles.flatMap((fileEntry) =>
      fileEntry.tags.map((tagObj) => ({
        id: tagObj._id, // Tag ID
        tag: tagObj.tag || "Unknown Tag",
        shortDesc: tagObj.shortDescription || "No short description available.",
        longDesc: tagObj.longDescription || "No long description available.",
        solution: tagObj.response?.solution || [],
        policies: tagObj.response?.policies || [],
        task: tagObj.response?.task || [],
      }))
    );

    if (!tagDetails || tagDetails.length === 0) {
      console.warn(`No tag details found for ID ${id}`);
      return res
        .status(404)
        .json({ error: `No tag details found for ID ${id}` });
    }
    return res.status(200).json(tagDetails);
  } catch (error) {
    // Handle errors
    console.error("Error fetching tag details:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch tag details", details: error.message });
  }
};

const checkSolution = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      console.error("No Tag ID provided");
      return res.status(400).json({ error: "Tag ID is required." });
    }

    const file = await File.findOne({ "files.tags._id": id });

    if (!file) {
      console.error("File not found for Tag ID:", id);
      return res.status(404).json({ error: "Tag not found." });
    }
    const tag = file.files[0].tags.id(id);

    if (!tag) {
      console.error("Tag not found within the file:", id); // Log tag not found error
      return res.status(404).json({ error: "Tag not found within the file." });
    }
    if (!tag.response || !tag.response.solution) {
      return res.status(200).json({ solution: null });
    }

    const solution = tag.response.solution;
    res.status(200).json({ solution });
  } catch (error) {
    console.error("Error in checkSolution function:", error.message);
    console.error("Error details:", error);
    res
      .status(500)
      .json({ error: "Failed to check solution.", details: error.message });
  }
};

const generateSolution = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { documentId, tagId } = req.body;

    if (!userId || !documentId || !tagId) {
      return res
        .status(400)
        .json({ error: "Missing user, document, or tag ID." });
    }

    // ✅ Step 1: Find the document for this user
    const document = await File.findOne({ _id: documentId, userId });

    if (!document) {
      return res
        .status(404)
        .json({ error: "Document not found or unauthorized." });
    }

    // ✅ Step 2: Get the tag inside this document
    const tag = document.tags.id(tagId);
    if (!tag) {
      return res.status(404).json({ error: "Tag not found in this document." });
    }

    // ✅ Step 3: Construct query using tag info
    const query = `I belong to Tag ${tag.tag}, "${tag.longDescription}"`;

    // ✅ Step 4: Call external AI API
    const apiEndpoint = `${process.env.NEXT_PUBLIC_AI_LINK}/get-answer/`;
    let aiResponse;
    try {
      aiResponse = await axios.post(apiEndpoint, { query });
    } catch (apiError) {
      console.error("External API error:", apiError.message);
      return res.status(500).json({
        error: "Failed to call external API",
        details: apiError.message,
      });
    }

    const {
      heading_sections,
      solution,
      supporting_references,
      Department,
      task,
      policies,
    } = aiResponse.data || {};

    if (!solution) {
      return res
        .status(500)
        .json({ error: "No solution returned from AI API." });
    }

    // ✅ Step 5: Update tag response
    tag.response = {
      heading_sections: heading_sections || [],
      solution: Array.isArray(solution) ? solution : [solution],
      supporting_references: supporting_references || [],
      Department: Department || [],
      task: task || [],
      policies: policies || [],
    };

    // ✅ Step 6: Save updated document
    await document.save();

    // ✅ Emit socket event (optional)
    req.io?.emit("solutionGenerated", {
      message: "A solution has been successfully generated.",
      solution,
    });

    return res.status(200).json({
      message: "Solution generated and saved successfully!",
      document,
      tagId,
    });
  } catch (error) {
    console.error("Generate solution error:", error.message);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

const checkResponse = async (req, res) => {
  try {
    const { id, tag } = req.body;

    if (!id || !tag) {
      console.warn("Validation failed: Missing ID or tag");
      return res.status(400).json({ error: "ID and tag are required." });
    }
    const file = await File.findOne({ "files.tags._id": id });

    if (!file) {
      console.warn(`File not found for tag ID: ${id}`);
      return res.status(404).json({ error: "File not found." });
    }
    const tagData = file.files[0].tags.id(id);

    if (!tagData) {
      console.warn(`Tag not found within file for ID: ${id}`);
      return res.status(404).json({ error: "Tag not found within the file." });
    }

    if (tagData.response && tagData.response.solution) {
      return res.status(200).json({ exists: true, tag: tagData });
    }
    return res.status(200).json({ exists: false });
  } catch (error) {
    console.error("Error checking response:", error);
    res
      .status(500)
      .json({ error: "Failed to check response.", details: error.message });
  }
};

module.exports = {
  getUserFiles,
  uploadFile,
  fetchTagsByEmail,
  getTagsWithDescriptions,
  generateSolution,
  checkSolution,
  fetchTagsByEmail1,
  fetchTagsAndSolutionByEmail,
  checkResponse,
  extractInfoApi,
  fetchPolicyById,
  regeneratePolicy,
  fetchPolicy,
  getPocApi,
  fetchPolicyByTagAndDeficiency,
  deleteFile,
  approveSolution,
  updateSolution,
   getUserDocuments,
};
