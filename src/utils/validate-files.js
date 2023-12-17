const path = require('path');
const { loadFile } = require('./load-files');

//validate list of files
function validateFiles(jsonFiles, dataFolder) {
  console.log(`STARTING validation of JSON files in ${dataFolder}:`);
  const errors = [];
  let i = 1;
  for (const file of jsonFiles) {
    console.log(`  validating ${i} of ${jsonFiles.length}: ${file}`);
    ++i;
    const fullFileName = path.join(dataFolder, file);
    const { error } = loadFile(fullFileName);
    if (error) {
      errors.push({ file, error });
    }
  }
  if (errors.length > 0) {
    console.error('Errors occurred while loading files:');
    console.error(errors);
    throw new Error('Stopping the process because of the JSON Errors');
  } else {
    console.log('Validation DONE: All files have valid JSON');
  }
}

module.exports = {
  validateFiles,
};
