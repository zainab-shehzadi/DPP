
  
const File = require("../models/File");
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const axios = require("axios");

const { v4: uuidv4 } = require("uuid");

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config(); // Load AWS credentials from .env

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Get the email from the request body
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const fileName = `${uuidv4()}-${req.file.originalname}`; // Unique file name
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME, 
      Key: fileName, 
      Body: req.file.buffer, 
      ContentType: req.file.mimetype, 
    };

    const uploadCommand = new PutObjectCommand(uploadParams);
    await s3.send(uploadCommand);

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Step 2: Parse the PDF Content
    const pdfData = await pdf(req.file.buffer);
    const fileContent = pdfData.text;

    // Step 3: Extract tags and descriptions using regex
    const extractedTags = fileContent.match(/F \d{4}/g) || [];
    const tagsWithDescriptions = extractedTags.map((tag) => {
      const tagIndex = fileContent.indexOf(tag);
      const shortDescription = fileContent.substring(tagIndex, tagIndex + 100).split(".")[0].trim();
      
      const longDescriptionStartIndex = tagIndex + 100;
      let longDescriptionEndIndex = fileContent.indexOf("(continued on next page)", longDescriptionStartIndex);
      if (longDescriptionEndIndex === -1) longDescriptionEndIndex = fileContent.length;
      const longDescription = fileContent.substring(longDescriptionStartIndex, longDescriptionEndIndex).trim();

      return { tag, shortDescription, longDescription };
    });

    // Step 4: Save document and metadata in the database
    let fileEntry = await File.findOne({ email });

    let documentId;
    if (fileEntry) {
      fileEntry.files.push({
        originalName: req.file.originalname,
        fileUrl,
        tags: tagsWithDescriptions,
        uploadedAt: new Date(),
      });
      await fileEntry.save();
      documentId = fileEntry.files[fileEntry.files.length - 1]._id;
    } else {
      fileEntry = await File.create({
        email,
        files: [{
          originalName: req.file.originalname,
          fileUrl,
          tags: tagsWithDescriptions,
          uploadedAt: new Date(),
        }],
      });
      documentId = fileEntry.files[0]._id;
    }


    req.io.emit("documentUploaded", {
      message: `A new document "${req.file.originalname}" has been uploaded!`,
      documentName: req.file.originalname,
      documentId,
    });

    // Step 6: Respond to the client
    res.status(201).json({
      message: "File uploaded to AWS S3 and parsed successfully!",
      documentId,
      fileUrl,
      tags: tagsWithDescriptions,
    });
  } catch (error) {
    console.error("Error in file upload:", error.message);
    res.status(500).json({ error: "File upload failed.", details: error.message });
  }
};


const fetchTagsByEmail = async (req, res) => {
  const { email, id } = req.query; // Extract the email and id from the query parameters

  if (!email) {
    return res.status(400).json({ error: "Email is required in query parameters" });
  }

  if (!id) {
    return res.status(400).json({ error: "ID is required in query parameters" });
  }

  try {
    // Find files associated with the given email
    const files = await File.find({ email }, "files");

    if (!files || files.length === 0) {
      // If no files are found, return a 404 response
      return res.status(404).json({ error: `No files found for email ${email}` });
    }

    // Find the file entry by the given id
    const matchingFiles = files.flatMap((file) =>
      file.files.filter((fileEntry) => fileEntry.id === id)
    );

    if (!matchingFiles || matchingFiles.length === 0) {
      // If no matching file is found by id, return a 404 response
      return res.status(404).json({ error: `No file found for ID ${id}` });
    }

    // Extract all tags from the matching file entries
    const tags = matchingFiles.flatMap((fileEntry) =>
      fileEntry.tags.map((tagObj) => tagObj.tag)
    );

    // Remove duplicates using a Set
    const uniqueTags = [...new Set(tags)];

    // Log the fetched tags for debugging
    console.log(`Fetched Unique Tags for Email (${email}) and ID (${id}):`, uniqueTags);

    // Send the unique tags to the client
    res.status(200).json(uniqueTags);
  } catch (error) {
    console.error(`Error fetching tags for Email (${email}) and ID (${id}):`, error.message);
    res.status(500).json({ error: "Failed to fetch tags", details: error.message });
  }
};
const fetchTagsByEmail1 = async (req, res) => {
  const { email } = req.query; // Extract the email from the query parameters

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

    // Extract all tags across all files
    const tags = files.flatMap((file) =>
      file.files.flatMap((fileEntry) =>
        fileEntry.tags.map((tagObj) => tagObj.tag)
      )
    );

    // Send the tags to the client
    res.status(200).json(tags);
  } catch (error) {
    console.error(`Error fetching tags for Email (${email}):`, error.message);
    res.status(500).json({ error: "Failed to fetch tags", details: error.message });
  }
};
const fetchTagsAndSolutionByEmail = async (req, res) => {
  const { email } = req.query; // Extract email from query parameters

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

    // Flatten the array of arrays (tagsWithSolution contains arrays within arrays)
    const flattenedTagsWithSolution = tagsWithSolution.flat();
    flattenedTagsWithSolution.forEach((entry) => {
      console.log(`Tag: ${entry.tag}, Solution: ${entry.solution}`);
    });

    // Send the tags and solutions to the client
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

    // Map matching file entries to extract the required tag details
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
      return res.status(404).json({ error: 'Tag not found.' });
    }
    const tag = file.files[0].tags.id(id);

    if (!tag) {
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
    const { query, id } = req.body; 

    if (!query || !id) {
      console.error("Query or ID is missing.", req.body);
      return res.status(400).json({ error: "Query and ID are required." });
    }
 
    const apiEndpoint = "https://b57f-173-208-156-111.ngrok-free.app/get-answer/";

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

    console.log("External API response:", {
      heading_sections,
      solution,
      supporting_references,
      Department,
      task,
      policies,
    });
    req.io.emit("solutionGenerated", {
      message: "A solution has been successfully generated.",
      solution,
    });
    // Find the file containing the tag
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

    
    // Find the specific tag and update it
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

    console.log("Tag updated and file saved successfully.");

    // Respond with the updated tag
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
      console.warn('Validation failed: Missing ID or tag'); // Log validation failure
      return res.status(400).json({ error: 'ID and tag are required.' });
    }

    const file = await File.findOne({ "files.tags._id": id });

    if (!file) {
      console.warn(`File not found for tag ID: ${id}`); // Log file not found
      return res.status(404).json({ error: 'File not found.' });
    }
    const tagData = file.files[0].tags.id(id);

    if (!tagData) {
      console.warn(`Tag not found within file for ID: ${id}`); // Log tag not found
      return res.status(404).json({ error: 'Tag not found within the file.' });
    }
    // Check if the response already exists
    if (tagData.response && tagData.response.solution) {
      return res.status(200).json({ exists: true, tag: tagData });
    }
    return res.status(200).json({ exists: false });
  } catch (error) {
    console.error('Error checking response:', error); // Log the error
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
