const fs = require('fs');

//function to only load the file and parse it to JSON to validate it.
//it returns the array of js objects
function loadFile(fullFileName) {
  try {
    // Load external JSON
    const jsonData = fs.readFileSync(fullFileName, {
      encoding: 'utf8',
    });
    // Parse the JSON into an array of documents

    const documents = JSON.parse(jsonData);
    return { documents, error: null };
  } catch (error) {
    // console.error(error);
    return { documents: [], error };
  }
}

module.exports = {
  loadFile,
};
