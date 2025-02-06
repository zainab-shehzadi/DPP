const File = require("../models/File");

const pdf = require("pdf-parse");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();

// AWS SDK
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage"); // ✅ Better S3 file handling

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Helper function to upload files to S3 using @aws-sdk/lib-storage
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
    return result.Location; // Returns the uploaded file URL
  } catch (error) {
    console.error("AWS S3 Upload Error:", error);
    throw error;
  }
};

// ✅ Helper function to parse PDF content correctly
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

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    console.log("Email received:", email);
    console.log("File received:", req.file);

    // ✅ Step 1: Upload File to AWS S3
    const fileUrl = await uploadToS3(req.file);
    console.log("File uploaded to S3:", fileUrl);

    // ✅ Step 2: Parse the PDF Content
    const fileContent = await parsePdfContent(req.file.buffer);
    console.log("Extracted PDF Text:", fileContent);

    // ✅ Step 3: Extract tags and descriptions using regex
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

    let fileEntry = await File.findOne({ email });

    let documentId;
    if (fileEntry) {
      fileEntry.files.push({
        originalName: req.file.originalname,
        fileUrl, // Ensure this is correctly passed
        filePath: req.file.path || "", // ✅ Add filePath
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
          filePath: req.file.path || "", // ✅ Add filePath
          tags: tagsWithDescriptions,
          uploadedAt: new Date(),
        }],
      });
      documentId = fileEntry.files[0]._id;
    }
    

    console.log("Document ID:", documentId);
    console.log("Tags and descriptions extracted:", tagsWithDescriptions);

    // ✅ Step 5: Notify clients via WebSocket (if used)
    req.io.emit("documentUploaded", {
      message: `A new document "${req.file.originalname}" has been uploaded!`,
      documentName: req.file.originalname,
      documentId,
    });

    // ✅ Step 6: Respond to the client
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

// const uploadFile = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded." });
//     }

//     // Get the email from the request body
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: "Email is required." });
//     }

//     console.log("Email received:", email);
//     console.log("File received:", req.file);

//     // Step 1: Save the file in the server's file system
//     const uploadsDir = path.join(__dirname, "../uploads");
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir); // Create the uploads directory if it doesn't exist
//     }

//     const filePath = path.join(uploadsDir, req.file.originalname);
//     fs.renameSync(req.file.path, filePath); // Move the uploaded file to the uploads directory
//     console.log("File saved to:", filePath);

//     // Step 2: Parse the PDF content
//     const fileBuffer = fs.readFileSync(filePath); // Read file content as a buffer
//     const pdfData = await pdf(fileBuffer); // Parse the PDF content
//     const fileContent = pdfData.text; // Extract text from the PDF

//     // Step 3: Extract tags and descriptions using regex
//     const extractedTags = fileContent.match(/F \d{4}/g) || [];
//     const tagsWithDescriptions = [];
//     extractedTags.forEach((tag) => {
//       const tagIndex = fileContent.indexOf(tag);
//       if (tagIndex !== -1) {
//         const shortDescription = fileContent
//           .substring(tagIndex, tagIndex + 100)
//           .split(".")[0]
//           .trim();

//         const longDescriptionStartIndex = tagIndex + 100;
//         let longDescriptionEndIndex = fileContent.indexOf(
//           "(continued on next page)",
//           longDescriptionStartIndex
//         );
//         if (longDescriptionEndIndex === -1) {
//           longDescriptionEndIndex = fileContent.length;
//         }
//         const longDescription = fileContent
//           .substring(longDescriptionStartIndex, longDescriptionEndIndex)
//           .trim();

//         // Push tag and descriptions
//         tagsWithDescriptions.push({
//           tag,
//           shortDescription,
//           longDescription,
//         });
//       }
//     });

//     // Step 4: Save document and metadata in the database
//     let fileEntry = await File.findOne({ email });

//     let documentId; // To store the uploaded document ID
//     if (fileEntry) {
//       // Add new file to the existing email entry
//       const newFile = {
//         originalName: req.file.originalname,
//         filePath,
//         tags: tagsWithDescriptions,
//         uploadedAt: new Date(),
//       };
//       fileEntry.files.push(newFile);
//       await fileEntry.save();

//       // Get the document ID for the newly added file
//       documentId = fileEntry.files[fileEntry.files.length - 1]._id;
//     } else {
//       // Create a new entry for the email
//       fileEntry = await File.create({
//         email,
//         files: [
//           {
//             originalName: req.file.originalname,
//             filePath,
//             tags: tagsWithDescriptions,
//             uploadedAt: new Date(),
//           },
//         ],
//       });

//       // Get the document ID for the newly created file
//       documentId = fileEntry.files[0]._id;
//     }
//     console.log("ID:",documentId );
//     console.log("Tags and descriptions extracted:", tagsWithDescriptions);


//     req.io.emit("documentUploaded", {
//       message: `A new document "${req.file.originalname}" has been uploaded!`,
//       documentName: req.file.originalname,
//       documentId,
//     });
//     // Step 5: Respond to the client
//     res.status(201).json({
//       message: "File uploaded and parsed successfully!",
//       documentId, // Include document ID in the response
//       tags: tagsWithDescriptions,
//     });
//   } catch (error) {
//     console.error("Error in file upload:", error.message);
//     res
//       .status(500)
//       .json({ error: "File upload failed.", details: error.message });
//   }
// };
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

    // Log the fetched tags for debugging
    console.log(`Fetched Tags for Email (${email}):`, tags);

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

    // Log the tags and solutions for debugging purposes
    console.log(`Fetched Tags and Solutions for Email (${email}):`);
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
// // Controller to fetch tags with descriptions for a specific email
// const getTagsWithDescriptions = async (req, res) => {
//   const { email } = req.query; // Extract email from query parameters

//   if (!email) {
//     return res.status(400).json({ error: "Email query parameter is required" });
//   }

//   try {
//     // Find files associated with the given email
//     const files = await File.find({ email });

//     if (!files || files.length === 0) {
//       return res.status(404).json({ error: `No files found for email ${email}` });
//     }

//     // Extract tags along with their descriptions
//     const tagsWithDescriptions = files.flatMap((file) =>
//       file.files.flatMap((fileEntry) =>
//         fileEntry.tags.map((tagObj) => ({
//           tag: tagObj.tag,
//           shortDesc: tagObj.shortDescription,
//           longDesc: tagObj.longDescription,
//         }))
//       )
//     );

//     // Send the tags with descriptions to the client
//     res.status(200).json(tagsWithDescriptions);
//   } catch (error) {
//     console.error(`Error fetching tags for email (${email}):`, error.message);
//     res.status(500).json({ error: "Failed to fetch tags", details: error.message });
//   }
// };

// // Controller to fetch tags with descriptions for a specific email
// const getTagsWithDescriptions = async (req, res) => {
//   const { email, id } = req.query; // Extract email and id from query parameters

//   // Log received parameters for debugging
//   console.log("Received email query parameter:", email);
//   console.log("Received id query parameter:", id);

//   if (!email) {
//     console.error("Error: Email query parameter is missing");
//     return res.status(400).json({ error: "Email query parameter is required" });
//   }

//   try {
//     // Log the start of the database query
//     console.log(`Searching for files associated with email: ${email}`);

//     // Find files associated with the given email
//     const files = await File.find({ email });

//     // Log the result of the file query
//     console.log(`Files found for email ${email}:`, files);

//     if (!files || files.length === 0) {
//       console.warn(`No files found for email ${email}`);
//       return res.status(404).json({ error: `No files found for email ${email}` });
//     }

//     // Extract tags along with their descriptions and IDs
//     console.log("Extracting tags with descriptions...");
//     const tagsWithDescriptions = files.flatMap((file) =>
//       file.files.flatMap((fileEntry) =>
//         fileEntry.tags.map((tagObj) => ({
//           id: tagObj._id, // MongoDB tag ID
//           tag: tagObj.tag,
//           shortDesc: tagObj.shortDescription, // Short description
//           longDesc: tagObj.longDescription, // Long description
//           solution: tagObj.response?.solution || [], // Solution from the response field
//         }))
//       )
//     );
    

//     // Log the tags with descriptions
//     console.log("Tags with descriptions extracted:", tagsWithDescriptions);

//     // Send the tags with descriptions and IDs to the client
//     res.status(200).json(tagsWithDescriptions);
//     console.log("Response sent to client with tags and descriptions.");
//   } catch (error) {
//     // Log the error if something goes wrong
//     console.error("Error fetching tags for email:", error.message);
//     res.status(500).json({ error: "Failed to fetch tags", details: error.message });
//   }
// };

// Controller to fetch tag details for a specific email and id
const getTagsWithDescriptions = async (req, res) => {
  const { email, id } = req.query; // Extract email and id from query parameters

  // Log received parameters for debugging
  console.log("Received email query parameter:", email);
  console.log("Received id query parameter:", id);

  // Validate email and id
  if (!email) {
    console.error("Error: Email query parameter is missing");
    return res.status(400).json({ error: "Email query parameter is required" });
  }

  if (!id) {
    console.error("Error: ID query parameter is missing");
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    // Log the start of the database query
    console.log(`Searching for files associated with email: ${email}`);

    // Step 1: Find files associated with the given email
    const files = await File.find({ email });

    if (!files || files.length === 0) {
      console.warn(`No files found for email ${email}`);
      return res.status(404).json({ error: `No files found for email ${email}` });
    }

    // Step 2: Filter specific tag details using the provided ID
    console.log(`Filtering tag details for ID: ${id}`);

    // Flatten files and filter file entries matching the provided ID
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

    // Check if tagDetails are empty after mapping
    if (!tagDetails || tagDetails.length === 0) {
      console.warn(`No tag details found for ID ${id}`);
      return res.status(404).json({ error: `No tag details found for ID ${id}` });
    }

    // Log and return the tag details
    console.log("Filtered tag details:", tagDetails);
    return res.status(200).json(tagDetails);
  } catch (error) {
    // Handle errors
    console.error("Error fetching tag details:", error.message);
    res.status(500).json({ error: "Failed to fetch tag details", details: error.message });
  }
};

const checkSolution = async (req, res) => {
  try {
    console.log('Received request to check solution'); // Log request initiation

    const { id } = req.params; // Extract the tag ID from the request params
    console.log('Tag ID received:', id); // Log the received tag ID

    if (!id) {
      console.error('No Tag ID provided'); // Log missing ID error
      return res.status(400).json({ error: 'Tag ID is required.' });
    }

    // Find the file that contains the tag with the given ID
    console.log('Searching for file containing the tag...');
    const file = await File.findOne({ "files.tags._id": id });

    if (!file) {
      console.error('File not found for Tag ID:', id); // Log file not found error
      return res.status(404).json({ error: 'Tag not found.' });
    }

    console.log('File found:', file._id); // Log the file ID found

    // Find the specific tag in the file
    console.log('Searching for tag in the file...');
    const tag = file.files[0].tags.id(id);

    if (!tag) {
      console.error('Tag not found within the file:', id); // Log tag not found error
      return res.status(404).json({ error: 'Tag not found within the file.' });
    }

    console.log('Tag found:', tag); // Log the tag object

    // Check if the tag has a solution in its response
    if (!tag.response || !tag.response.solution) {
      console.log('No solution found for Tag ID:', id); // Log absence of solution
      return res.status(200).json({ solution: null });
    }

    const solution = tag.response.solution; // Store the solution in a variable
    console.log('Solution found for Tag ID:', id); // Log the presence of a solution
    console.log('Solution:', solution); // Log the actual solution
    res.status(200).json({ solution }); // Return the solution

  } catch (error) {
    console.error('Error in checkSolution function:', error.message); // Log the error message
    console.error('Error details:', error); // Log detailed error for debugging
    res.status(500).json({ error: 'Failed to check solution.', details: error.message });
  }
};


const generateSolution = async (req, res) => {
  try {
    const { query, id } = req.body; // Extract query and tag id

    // Validate required fields
    if (!query || !id) {
      console.error("Query or ID is missing.", req.body);
      return res.status(400).json({ error: "Query and ID are required." });
    }

    console.log("Received request with ID:", id, "and Query:", query);

    // External API endpoint
    // const apiEndpoint = "https://45de-173-208-156-111.ngrok-free.app/get-answer/";
    const apiEndpoint = `${process.env.NEXT_PUBLIC_AI_LINK}/get-answer/`;

    // Call the external API
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
    console.log('Received request to check response:', req.body); // Log the incoming request

    const { id, tag } = req.body;

    // Validate input
    if (!id || !tag) {
      console.warn('Validation failed: Missing ID or tag'); // Log validation failure
      return res.status(400).json({ error: 'ID and tag are required.' });
    }

    console.log(`Checking for file with tag ID: ${id}`); // Log the ID being checked

    // Find the file and tag by ID
    const file = await File.findOne({ "files.tags._id": id });

    if (!file) {
      console.warn(`File not found for tag ID: ${id}`); // Log file not found
      return res.status(404).json({ error: 'File not found.' });
    }

    console.log(`File found. Searching for tag within file for ID: ${id}`); // Log successful file search

    const tagData = file.files[0].tags.id(id);

    if (!tagData) {
      console.warn(`Tag not found within file for ID: ${id}`); // Log tag not found
      return res.status(404).json({ error: 'Tag not found within the file.' });
    }

    console.log(`Tag found for ID: ${id}. Checking for existing response.`); // Log successful tag search

    // Check if the response already exists
    if (tagData.response && tagData.response.solution) {
      console.log(`Response already exists for tag ID: ${id}`); // Log existing response
      return res.status(200).json({ exists: true, tag: tagData });
    }

    console.log(`No existing response found for tag ID: ${id}`); // Log no response found
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
