const { BulkOperationType } = require('@azure/cosmos');
const path = require('path');
const {
  validateFiles,
  loadFile,
  formatTime,
  loadJsonFileNames,
} = require('./utils');

const throttlingErrors = [];

//load json files from folder and excute the runForFile function
async function bulkUpsertFolder(container, dataFolder) {
  const start = new Date().getTime();
  let totalRecords = 0;

  const jsonFiles = loadJsonFileNames(dataFolder);

  validateFiles(jsonFiles, dataFolder);

  console.log('STARTING bulk Upsert process:');
  const fileCount = jsonFiles.length;
  let i = 1;
  for (const file of jsonFiles) {
    console.log(` file ${i} of ${fileCount}: "${file}"`);
    ++i;
    const fullFileName = path.join(dataFolder, file);
    const { documentCount, fileProcessTime } = await processFile(
      container,
      fullFileName
    );
    totalRecords += documentCount;
    console.log(`  done: ${documentCount} records for ${fileProcessTime}ms`);
  }

  const end = new Date().getTime();
  const time = end - start;
  const formattedTime = formatTime(time);
  console.log(`Total Execution time: ${formattedTime}`);
  console.log(`Total Records: ${totalRecords}`);
  console.log('END of bulk Upsert process');

  logErrors(throttlingErrors);
}

async function processFile(container, fullFileName) {
  // console.log('START: Loading the json file');
  // Load external JSON
  const { documents } = loadFile(fullFileName);
  const documentCount = documents.length;

  // to measure the total execution time
  const startFileTotal = new Date().getTime();

  const MAX_CONCURRENT_OPERATIONS = process.env.MAX_CONCURRENT_OPERATIONS || 5;
  // prepare the batches for bulk insert
  while (documents.length > 0) {
    // Determine the number of elements to remove
    let numElementsToRemove = Math.min(
      MAX_CONCURRENT_OPERATIONS,
      documents.length
    );

    // Remove the elements from the array
    let removedElements = documents.splice(0, numElementsToRemove);

    // console.log(`about to insert ${removedElements.length} documents`);
    // Pass the removed elements array to the function
    const { operations, res } = await bulkUpsert(removedElements, container);

    for (let i = 0; i < res.length; i++) {
      const element = res[i];
      if (![201, 200].includes(element.statusCode))
        throttlingErrors.push({
          fileName: fullFileName,
          operation: operations[i],
          error: element,
        });
    }

    // console.log(`inserted ${res.length} docs, ${documents.length} remaining`);
  }

  const endFileTotal = new Date().getTime();
  const fileProcessTime = endFileTotal - startFileTotal;
  // console.log(`--- File Execution time: ${fileProcessTime}ms`);

  return { documentCount, fileProcessTime };
}

//THE bulkInsert function - more than 5 documents was giving me throttling errors even in 10000 RU/s
async function bulkUpsert(documents, container) {
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

module.exports = { bulkUpsertFolder };
