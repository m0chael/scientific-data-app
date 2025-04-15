const mime = require('mime-types');
const fs = require('fs');

const {
  MAX_FILE_INCOMING_SIZE,
  THESE_VALID_FILE_EXTENSIONS,
  MATCHING_MIMES_AND_EXTENSIONS
} = require('./config-loader.js');

function validateFileSize(filePath) {
  const maxFileSizeInBytes = MAX_FILE_INCOMING_SIZE * 1024 * 1024; // 20 MB

  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;

  if (fileSizeInBytes > maxFileSizeInBytes) {
    return false;
  } else {
    return true;
  }
};

function sanitizeIncomingData(data) {
  let sanitizedData = data.replace(/<script.*?>.*?<\/script>/gi, ''); // Remove script tags
  return sanitizedData;
};

function validateFileExtension(thisFileExtension) {
  return THESE_VALID_FILE_EXTENSIONS.includes(thisFileExtension);
};

function validatePreliminaryMimeAndExtensions(incomingPreliminary, associatedExtension) {
  let isFound = false;
  let returningExtension = null;

  for (let thisItem = 0; thisItem < MATCHING_MIMES_AND_EXTENSIONS.length; thisItem++) {
    if (MATCHING_MIMES_AND_EXTENSIONS[thisItem][0] == incomingPreliminary && MATCHING_MIMES_AND_EXTENSIONS[thisItem][1] == associatedExtension) {
      isFound = true;
      returningExtension = associatedExtension;
    }
  }
  return [isFound, returningExtension];
};

function readPreliminaryFileType(filePath){
  const mimeType = mime.lookup(filePath);

  if (mimeType == "application/geo+json" || mimeType == "text/csv" || mimeType == "application/json") {

    const fileContent = fs.readFileSync(filePath);
    
    // Detect the file type based on its content
    let mimeTypeContentBased = null;
    if (fileContent.toString().startsWith('{')) {
      try {
        JSON.parse(fileContent);
        mimeTypeContentBased = [true, 'application/geo+json'];
      } catch (error) {
        mimeTypeContentBased = [false, "error parsing content"];
      }
    } else if (fileContent.toString().includes(',')) {
      mimeTypeContentBased = [true, "text/csv"];
    } else {
      mimeTypeContentBased = [false, "error parsing content unknown"];
    }

    return mimeTypeContentBased;
  } else {
    return [false, "Not supported file mime type."];
  }
};


module.exports = {
  validateFileSize,
  readPreliminaryFileType,
  sanitizeIncomingData,
  validateFileExtension,
  validatePreliminaryMimeAndExtensions
};