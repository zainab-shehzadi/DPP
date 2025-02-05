const express = require("express");
const router = express.Router();
const upload = require("../config/multer"); // Import multer configuration
const { uploadFile,fetchTagsByEmail,getTagsWithDescriptions ,generateSolution,checkResponse,fetchTagsByEmail1,fetchTagsAndSolutionByEmail} = require("../controllers/fileController");


router.post("/upload", upload.single("file"), uploadFile);
router.get("/tags", fetchTagsByEmail); // Route to fetch tags by a specific ID
router.get("/tags1", fetchTagsByEmail1); // Route to fetch tags by a specific ID
router.get("/tags-with-descriptions", getTagsWithDescriptions);
router.get("/tags2",fetchTagsAndSolutionByEmail ); // Route to fetch tags by a specific ID
router.post("/generatesol", generateSolution);
router.get('/check-response',  checkResponse);

module.exports = router;
