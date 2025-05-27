const express = require("express");
const router = express.Router();
const { generatePOCPdf } = require("../controllers/pdfController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/generate-pdf", protect, generatePOCPdf);

module.exports = router;
