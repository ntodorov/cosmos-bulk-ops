const { CosmosClient, BulkOperationType } = require('@azure/cosmos');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

require('dotenv').config();

const throttlingErrors = [];

let jsonFolder;

//load json files from folder and excute the runForFile function
async function bulkUpsertFolder(container, dataFolder) {
  const start = new Date().getTime();
  let totalRecords = 0;
  const regExp = /\d+/g;

  jsonFolder = dataFolder;
  const files = fs.readdirSync(jsonFolder);
  const jsonFiles = files.filter((file) => path.extname(file) === '.json');
  // console.table(jsonFiles);
  console.log('Sorting files...');
  // Sort the filenames using the Array.prototype.sort method
  jsonFiles.sort((a, b) => {
    let startA = Number(a.match(regExp)[0]); // Extract the start number from filename a
    let startB = Number(b.match(regExp)[0]); // Extract the start number from filename b
    return startA - startB; // Perform a numerical sort
  });
  // console.table(jsonFiles);

  validateFiles(jsonFiles);

  console.log('Starting the bulk insert...');
  const fileCount = jsonFiles.length;
  let i = 1;
  for (const file of jsonFiles) {
    console.log(`START ${i} of ${fileCount}: ${file}`);
    ++i;
    let recordCount = await runForFile(container, file);
    totalRecords += recordCount;
    console.log('END: ' + file + ' - ' + recordCount + ' records');
  }

  const end = new Date().getTime();
  const time = end - start;
  const formattedTime = formatTime(time);
  console.log(`Total Execution time: ${formattedTime}`);
  console.log(`Total Records: ${totalRecords}`);
}

const MAX_CONCURRENT_TASKS = 50;

async function runForFile(container, fileName) {
  // console.log('START: Loading the json file');
  // Load external JSON
  const { documents } = loadFile(fileName);
  const documentCount = documents.length;

  // to measure the total execution time
  const startTotal = new Date().getTime();

  // prepare the batches for bulk insert
  while (documents.length > 0) {
    // Determine the number of elements to remove
    let numElementsToRemove = Math.min(MAX_CONCURRENT_TASKS, documents.length);

    // Remove the elements from the array
    let removedElements = documents.splice(0, numElementsToRemove);

    // console.log(`about to insert ${removedElements.length} documents`);
    // Pass the removed elements array to the function
    const { operations, res } = await bulkInsert(removedElements, container);

    res.forEach((element) => {
      if (![201, 200].includes(element.statusCode))
        throttlingErrors.push({ fileName, element });
    });

    // console.log(`inserted ${res.length} docs, ${documents.length} remaining`);
  }

  const endTotal = new Date().getTime();
  const timeTotal = endTotal - startTotal;
  console.log(`--- File Execution time: ${timeTotal}ms`);

  return documentCount;
}

//THE bulkInsert function - more than 5 documents was giving me throttling errors even in 10000 RU/s
async function bulkInsert(documents, container) {
  //map funciton that transforms the array of documents into an array of operations
  const operations = documents.map((doc) => {
    return {
      operationType: BulkOperationType.Upsert,
      resourceBody: doc,
    };
  });

  //execute the bulk operation - continueOnError is set to true, so if there are any errors, they will be in the res
  const res = await container.items.bulk(operations, { continueOnError: true });

  return { operations, res };
}

//validate list of files
function validateFiles(jsonFiles) {
  const errors = [];
  let i = 1;
  for (const file of jsonFiles) {
    console.log(`validating ${i} of ${jsonFiles.length}: ${file}`);
    ++i;
    const { error } = loadFile(file);
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
    console.log('All files have valid JSON');
  }
}

//function to only load the file and parse it to JSON to validate it.
//it returns the array of js objects
function loadFile(fileName) {
  // Load external JSON
  const jsonData = fs.readFileSync(path.join(jsonFolder, fileName), {
    encoding: 'utf8',
  });
  // Parse the JSON into an array of documents
  try {
    const documents = JSON.parse(jsonData);
    return { documents, error: null };
  } catch (error) {
    console.error(error);
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

module.exports = { bulkUpsertFolder };
