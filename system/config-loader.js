const MAX_FILE_INCOMING_SIZE = 20;
const THESE_VALID_FILE_EXTENSIONS = [
  ".geojson",
  ".csv"
];
// Must also update file-helpers because they contain hardcoded values for these too.
const MATCHING_MIMES_AND_EXTENSIONS = [
  ["application/geo+json", ".geojson"],
  ["application/json", ".json"],
  ["text/csv", ".csv"]
];

module.exports = {
  MAX_FILE_INCOMING_SIZE,
  THESE_VALID_FILE_EXTENSIONS,
  MATCHING_MIMES_AND_EXTENSIONS
};