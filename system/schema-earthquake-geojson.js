function isValidGeoJsonEarthquake(thisData) {
  try {
    let attemptParse = JSON.parse(thisData);
    const validationResult = validateEarthquakesGeoJSON(attemptParse);
    if (validationResult) {
      return [true, "success"];
    } else {
      return [false, "Failed to validate this geojson."]
    }
  } catch (error) {
    return [false,"Failed to parse geojson earthquake file"];
  }
};

function validateEarthquakesGeoJSON(data) {
  try {
    const jsonData = data;

    // Validate the top-level properties
    if (
      jsonData.type !== 'FeatureCollection' ||
      !jsonData.metadata ||
      !jsonData.features ||
      !Array.isArray(jsonData.features)
    ) {
      return false;
    }

    // Validate the metadata properties
    const metadata = jsonData.metadata;
    if (typeof metadata.title !== 'string') {
      return false;
    }

    // Validate each feature in the array
    for (const feature of jsonData.features) {
      if (
        typeof feature !== 'object' ||
        typeof feature.properties !== 'object' ||
        typeof feature.properties.mag !== 'number' ||
        typeof feature.properties.place !== 'string' ||
        typeof feature.properties.time !== 'number'
      ) {
        return false;
      }
    }

    // All validations passed
    return true;
  } catch (error) {
    // JSON parsing error
    return false;
  }
};


module.exports = {
  validateEarthquakesGeoJSON,
  isValidGeoJsonEarthquake,
};