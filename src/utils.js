const fs = require('fs');
const path = require('path');

function loadJsonFileNames(dataFolder) {
  const files = fs.readdirSync(dataFolder);
  const jsonFileNames = files.filter((file) => path.extname(file) === '.json');
  // console.table(jsonFiles);
  console.log('Sorting files...');
  // Sort the filenames using the Array.prototype.sort method
  jsonFileNames.sort(alphaNumericSort);
  // console.table(jsonFiles);
  return jsonFileNames;
}

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
    s;
  } else {
    console.log('Validation DONE: All files have valid JSON');
  }
}

//function to only load the file and parse it to JSON to validate it.
//it returns the array of js objects
function loadFile(fullFileName) {
  // Load external JSON
  const jsonData = fs.readFileSync(fullFileName, {
    encoding: 'utf8',
  });
  // Parse the JSON into an array of documents
  try {
    const documents = JSON.parse(jsonData);
    return { documents, error: null };
  } catch (error) {
    // console.error(error);
    return { documents: [], error };
  }
}

function formatTime(milliseconds) {
  let hours = Math.floor(milliseconds / 3600000);
  milliseconds %= 3600000;
  let minutes = Math.floor(milliseconds / 60000);
  milliseconds %= 60000;
  let seconds = Math.floor(milliseconds / 1000);
  let ms = Math.floor(milliseconds % 1000);

  return `${hours}h ${minutes}min ${seconds}s ${ms}ms`;
}

function alphaNumericSort(a, b) {
  const regExp = /\d+/g;
  const aNum = Number(a.match(regExp)[0]);
  const bNum = Number(b.match(regExp)[0]);
  if (aNum === bNum) {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  } else {
    return aNum - bNum;
  }
}

function logErrors(errors) {
  if (errors.length > 0) {
    let date = new Date();
    let fileName =
      'errors_' +
      date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) + // Months are zero based
      ('0' + date.getDate()).slice(-2) +
      '_' +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2) +
      '.log';

    console.error(`Errors during the operation count:${errors.length}`);

    fileName = path.join(__dirname, fileName);
    console.error(`Saving errors to file: ${fileName}`);
    fs.writeFileSync(fileName, JSON.stringify(errors, null, 2));
  }
}

module.exports = {
  validateFiles,
  loadFile,
  formatTime,
  alphaNumericSort,
  loadJsonFileNames,
  logErrors,
};
