const fs = require('fs');
const csv = require('csv-parser');
const {isValidGeoJsonEarthquake} = require('./schema-earthquake-geojson.js');
const {sanitizeIncomingData} = require("./file-helpers.js");
const {sendErrorRes} = require('./dialog-helpers.js');

function returnAndReadCsv(res, filePath) {
  let csvResults = [];
  fs.createReadStream(filePath)
    .pipe(csv({ headers: false }))
    .on('data', (data) => {
      let rowValues = Object.values(data);
      csvResults.push(rowValues);
    })
    .on('end', () => {
      res.json({ success: true, type: ".csv", file: csvResults });
    }).on('error', (error) => {
      return sendErrorRes(res, "Broken or invalid csv.");
    });;
};

function returnAndReadEarthquakeGeoJson(res, filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return sendErrorRes(res, "Failed to read the file");
    }
    
    let thisSanitizedJsonTypeItem = sanitizeIncomingData(data);
    let isThisValidGeoEarthquake = isValidGeoJsonEarthquake(thisSanitizedJsonTypeItem);
    if (isThisValidGeoEarthquake[0]) {
      res.json({ success: true, variant: "earthquake", type: ".geojson", file: thisSanitizedJsonTypeItem });
    } else {
      return sendErrorRes(res, "Unknown geoJson item.");
    }
  });
};


module.exports = {
  returnAndReadCsv,
  returnAndReadEarthquakeGeoJson
};