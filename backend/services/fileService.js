const File = require('../models/File');
const gptService = require('../utils/gptService');
const pdfParse = require('pdf-parse');
const path = require('path');
const fs = require('fs');

const processFile = async (file, userId) => {
  const filePath = path.join(__dirname, '../../uploads', file.filename);

  // Parse PDF
  const fileBuffer = fs.readFileSync(filePath);
  const parsedContent = await pdfParse(fileBuffer);

  // Process with GPT
  const gptResponse = await gptService.processWithGPT(parsedContent.text);

  // Save to Database
  const fileDoc = new File({
    originalName: file.originalname,
    filePath,
    uploadedBy: userId,
    processedData: gptResponse,
  });
  await fileDoc.save();

  return { message: 'File processed successfully', file: fileDoc };
};

module.exports = { processFile };
