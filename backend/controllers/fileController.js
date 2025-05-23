const File = require("../models/File");

const pdf = require("pdf-parse");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();
const uploadedAt = new Date();
// AWS SDK
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage"); 

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
const parsePdfContent = async (fileBuffer) => {
  try {
    if (!Buffer.isBuffer(fileBuffer)) {
      throw new Error("PDF data is not a valid Buffer.");
    }
    const pdfData = await pdf(fileBuffer);
    return pdfData.text; // Extracted text from the PDF
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw error;
  }
};
const extractTagsFromContent = (fileContent) => {
  // Match all occurrences of tags in the format "Fxxx" or "F xxxx"
  const extractedTags = fileContent.match(/F\s?\d{3,4}/g) || [];
  
  // Use a Map to store unique tags and their summaries
  let uniqueTags = new Map();
   console.log(uniqueTags);
  let tagPositions = [];
  
  extractedTags.forEach(tag => {
    let standardizedTag = tag.replace(/\s/g, ''); // Normalize tag format (e.g., "F 554" → "F554")
    let tagKey = standardizedTag.substring(0, 4); // Consider first three digits for uniqueness

    let tagIndex = fileContent.indexOf(tag);
    
    tagPositions.push({ tag: standardizedTag, index: tagIndex });

    if (!uniqueTags.has(tagKey)) {
      uniqueTags.set(tagKey, {
        tag: standardizedTag,
        shortDescription: "",
        longDescription: ""
      });
    }
  });

  // Sort tags by their positions in the document
  tagPositions.sort((a, b) => a.index - b.index);

  // Extract summaries for each tag
  for (let i = 0; i < tagPositions.length; i++) {
    let currentTag = tagPositions[i].tag;
    let startIndex = tagPositions[i].index;
    let endIndex = i + 1 < tagPositions.length ? tagPositions[i + 1].index : fileContent.length;

    let summary = fileContent.substring(startIndex, endIndex).trim();

    let tagKey = currentTag.substring(0, 4);

    // Concatenate if the tag appears multiple times
    if (uniqueTags.has(tagKey)) {
      let existingEntry = uniqueTags.get(tagKey);
      existingEntry.longDescription += summary + " ";
      uniqueTags.set(tagKey, existingEntry);
    }
  }

  // Assign short descriptions (first 92 characters of long description)
  uniqueTags.forEach((value, key) => {
    value.shortDescription = value.longDescription.substring(0, 92).split(".")[0].trim();
  });

  return [...uniqueTags.values()];
};
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    let existingFileEntry = await File.findOne({ email, "files.originalName": req.file.originalname });

    if (existingFileEntry) {
      return res.status(400).json({
        error: "File already exists.",
        message: `A file named "${req.file.originalname}" has already been uploaded.`,
        existingFile: existingFileEntry.files.find(file => file.originalName === req.file.originalname),
      });
    }

    // Upload file to S3
    const fileUrl = await uploadToS3(req.file);

    // Extract and parse content from the PDF
    const fileContent = await parsePdfContent(req.file.buffer);

    // Extract tags using the new function
    const tagsWithDescriptions = extractTagsFromContent(fileContent);
    console.log(tagsWithDescriptions);

    let fileEntry = await File.findOne({ email });
    let documentId;
    const uploadedAt = new Date();

    if (fileEntry) {
      fileEntry.files.push({
        originalName: req.file.originalname,
        fileUrl,
        filePath: req.file.path || "",
        tags: tagsWithDescriptions,
        uploadedAt
      });
      await fileEntry.save();
      documentId = fileEntry.files[fileEntry.files.length - 1]._id;
    } else {
      fileEntry = await File.create({
        email,
        files: [{
          originalName: req.file.originalname,
          fileUrl,
          filePath: req.file.path || "",
          tags: tagsWithDescriptions,
          uploadedAt
        }],
      });
      documentId = fileEntry.files[0]._id;
    }

    req.io.emit("documentUploaded", {
      message: `A new document "${req.file.originalname}" has been uploaded!`,
      documentName: req.file.originalname,
      documentId,
    });

    res.status(201).json({
      message: "File uploaded to AWS S3 and parsed successfully!",
      documentId,
      fileUrl,
      tags: tagsWithDescriptions,
      uploadedAt
    });
  } catch (error) {
    console.error("Error in file upload:", error.message);
    res.status(500).json({ error: "File upload failed.", details: error.message });
  }
};
const fetchTagsByEmail = async (req, res) => {
  const { email, id } = req.query; 

  if (!email) {
    return res.status(400).json({ error: "Email is required in query parameters" });
  }

  if (!id) {
    return res.status(400).json({ error: "ID is required in query parameters" });
  }

  try {
    const files = await File.find({ email }, "files");

    if (!files || files.length === 0) {
      return res.status(404).json({ error: `No files found for email ${email}` });
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
    console.error(`Error fetching tags for Email (${email}) and ID (${id}):`, error.message);
    res.status(500).json({ error: "Failed to fetch tags", details: error.message });
  }
};
const fetchTagsByEmail1 = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required in query parameters" });
  }

  try {
    // Find all files associated with the given email
    const files = await File.find({ email }, "files.tags");

    if (!files || files.length === 0) {
      // If no files are found, return a 404 response
      return res.status(404).json({ error: `No files found for email ${email}` });
    }

    const tags = files.flatMap((file) =>
      file.files.flatMap((fileEntry) =>
        fileEntry.tags.map((tagObj) => tagObj.tag)
      )
    );
    res.status(200).json(tags);
  } catch (error) {
    console.error(`Error fetching tags for Email (${email}):`, error.message);
    res.status(500).json({ error: "Failed to fetch tags", details: error.message });
  }
};
const fetchTagsAndSolutionByEmail = async (req, res) => {
  const { email } = req.query; 

  if (!email) {
    return res.status(400).json({ error: "Email is required in query parameters" });
  }

  try {
    // Find all files associated with the given email, including tags and responses (solution)
    const files = await File.find({ email }, "files.tags files.solution");

    if (!files || files.length === 0) {
      // If no files are found, return a 404 response
      return res.status(404).json({ error: `No files found for email ${email}` });
    }

    // Extract tags and corresponding solutions from each file entry
    const tagsWithSolution = files.flatMap((file) =>
      file.files.flatMap((fileEntry) =>
        fileEntry.tags.map((tagObj) => {
          return {
            tag: tagObj.tag,
            solution: tagObj.response ? tagObj.response.solution : null // Extract solution from the tag's response field
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
    console.error(`Error fetching tags and solutions for Email (${email}):`, error.message);
    res.status(500).json({ error: "Failed to fetch tags and solutions", details: error.message });
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
      return res.status(404).json({ error: `No files found for email ${email}` });
    }

      const matchingFiles = files.flatMap((file) =>
      file.files.filter((fileEntry) => fileEntry.id === id) // Compare as strings
    );

    if (matchingFiles.length === 0) {
      console.warn(`No file entries found for ID: ${id}`);
      return res.status(404).json({ error: `No file entries found for ID: ${id}` });
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
      return res.status(404).json({ error: `No tag details found for ID ${id}` });
    }
    return res.status(200).json(tagDetails);
  } catch (error) {
    // Handle errors
    console.error("Error fetching tag details:", error.message);
    res.status(500).json({ error: "Failed to fetch tag details", details: error.message });
  }
};
const checkSolution = async (req, res) => {
  try {

    const { id } = req.params; 

    if (!id) {
      console.error('No Tag ID provided'); 
      return res.status(400).json({ error: 'Tag ID is required.' });
    }

   const file = await File.findOne({ "files.tags._id": id });

    if (!file) {
      console.error('File not found for Tag ID:', id); 
      return res.status(404).json({ error: 'Tag not found.' });
    }
    const tag = file.files[0].tags.id(id);

    if (!tag) {
      console.error('Tag not found within the file:', id); // Log tag not found error
      return res.status(404).json({ error: 'Tag not found within the file.' });
    }
    if (!tag.response || !tag.response.solution) {
      return res.status(200).json({ solution: null });
    }

    const solution = tag.response.solution; 
    res.status(200).json({ solution });

  } catch (error) {
    console.error('Error in checkSolution function:', error.message); 
    console.error('Error details:', error); 
    res.status(500).json({ error: 'Failed to check solution.', details: error.message });
  }
};
const generateSolution = async (req, res) => {
  try {
    const { query, id } = req.body; // Extract query and tag id

 console.log("Received Request - Query:", query);
 console.log("Received Request - ID:", id);
    // Validate required fields
    if (!query || !id) {
      console.error("Query or ID is missing.", req.body);
      return res.status(400).json({ error: "Query and ID are required." });
    }

    const apiEndpoint = `${process.env.NEXT_PUBLIC_AI_LINK}/get-answer/`;

    let externalResponse;
    try {
      externalResponse = await axios.post(apiEndpoint, { query });
    } catch (apiError) {
      console.error("Error calling external API:", apiError.message);
      return res.status(500).json({
        error: "External API call failed.",
        details: apiError.message,
      });
    }

    // Safely access data returned from the external API
    const { heading_sections, solution, supporting_references, Department, task, policies } = externalResponse.data || {};

    if (!solution) {
      console.error("Solution is missing from the external API response.");
      return res.status(500).json({
        error: "Solution generation failed. No solution returned from external API.",
      });
    }


    req.io.emit("solutionGenerated", {
      message: "A solution has been successfully generated.",
      solution,
    });
    let file;
    try {
      file = await File.findOne({ "files.tags._id": id });
    } catch (dbError) {
      console.error("Database query failed:", dbError.message);
      return res.status(500).json({ error: "Database query failed.", details: dbError.message });
    }

    if (!file) {
      console.error(`File not found for tag id: ${id}`);
      return res.status(404).json({ error: "File with the given tag ID not found." });
    }

    
    let updatedTag = null;

    try {
      for (const fileEntry of file.files) {
        const tag = fileEntry.tags.id(id);
        if (tag) {
          tag.response = {
            heading_sections: heading_sections || [],
            solution: solution || "No solution provided.",
            supporting_references: supporting_references || [],
            Department: Department || [],
            task: task || [],
            policies: policies || [],
          };
          updatedTag = tag;
          break; // No need to continue if the tag is found
        }
      }
    } catch (tagError) {
      console.error("Error updating tag:", tagError.message);
      return res.status(500).json({ error: "Failed to update tag.", details: tagError.message });
    }

    if (!updatedTag) {
      console.error(`Tag not found for ID: ${id}`);
      return res.status(404).json({ error: "Tag not found within the file." });
    }

    // Save the updated file document
    try {
      await file.save();
    } catch (saveError) {
      console.error("Error saving file:", saveError.message);
      return res.status(500).json({ error: "Failed to save the updated file.", details: saveError.message });
    }

    return res.status(200).json({
      message: "Solution generated and saved successfully!",
      tag: updatedTag,
    });
  } catch (error) {
    console.error("Error in generating solution:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to generate solution.",
      details: error.message,
    });
  }
};
const checkResponse = async (req, res) => {
  try {

    const { id, tag } = req.body;

    if (!id || !tag) {
      console.warn('Validation failed: Missing ID or tag'); 
      return res.status(400).json({ error: 'ID and tag are required.' });
    }
    const file = await File.findOne({ "files.tags._id": id });

    if (!file) {
      console.warn(`File not found for tag ID: ${id}`); 
      return res.status(404).json({ error: 'File not found.' });
    }
    const tagData = file.files[0].tags.id(id);

    if (!tagData) {
      console.warn(`Tag not found within file for ID: ${id}`); 
      return res.status(404).json({ error: 'Tag not found within the file.' });
    }


    if (tagData.response && tagData.response.solution) {
      return res.status(200).json({ exists: true, tag: tagData });
    }
    return res.status(200).json({ exists: false });
  } catch (error) {
    console.error('Error checking response:', error);
    res.status(500).json({ error: 'Failed to check response.', details: error.message });
  }
};
module.exports = { 
  uploadFile, 
  fetchTagsByEmail,
  getTagsWithDescriptions,
  generateSolution,
  checkSolution,
  fetchTagsByEmail1,
  fetchTagsAndSolutionByEmail,
  checkResponse };
