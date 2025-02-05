const multer = require("multer");

// ✅ Use memory storage to handle AWS S3 uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true); // ✅ Accept only PDF files
    } else {
      cb(new Error("Only PDF files are allowed!"), false); // ❌ Reject non-PDF files
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // ✅ Limit file size to 10MB
});

module.exports = upload;
