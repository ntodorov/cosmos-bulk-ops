const { BulkOperationType } = require('@azure/cosmos');
const fs = require('fs');

const { formatTime, logErrors } = require('./utils');

const throttlingErrors = [];

async function bulkDeleteFromFile(container, queryFile) {
  const query = fs.readFileSync(queryFile, 'utf8');
  await bulkDeleteFromQuery(container, query);
}

async function bulkDeleteFromQuery(container, query) {
  const start = new Date().getTime();

  const { resource } = await container.read();

  const partitionKey = resource.partitionKey.paths[0].replace('/', '');
  // console.log('Partition Key:', partitionKey);

  const MAX_CONCURRENT_OPERATIONS = process.env.MAX_CONCURRENT_OPERATIONS || 5;
  const queryIterator = await container.items.query(query, {
    maxItemCount: MAX_CONCURRENT_OPERATIONS,
  });

  console.log('STARTING bulk Delete process:');
  let count = 0;
  while (queryIterator.hasMoreResults()) {
    const { resources: results } = await queryIterator.fetchNext();
    if (results != undefined) {
      count = count + results.length;

      const { operations, res } = await bulkDelete(
        results,
        container,
        partitionKey
      );

      for (let i = 0; i < res.length; i++) {
        const element = res[i];
        if (![204].includes(element.statusCode))
          throttlingErrors.push({
            operation: operations[i],
            error: element,
          });
      }
    }
  }

  const end = new Date().getTime();
  const time = end - start;
  const formattedTime = formatTime(time);
  console.log(`Total Execution time: ${formattedTime}`);
  console.log(`Total Records: ${count}`);
  console.log('END of bulk Delete process');

  logErrors(throttlingErrors);
}

async function bulkDelete(documents, container, partitionKey) {
  //map funciton that transforms the array of documents into an array of operations
  const operations = documents.map((doc) => {
    return {
      operationType: BulkOperationType.Delete,
      id: doc.id,
      partitionKey: doc[partitionKey],
    };
  });

  // console.dir(operations);

  //execute the bulk operation - continueOnError is set to true, so if there are any errors, they will be in the res
  const res = await container.items.bulk(operations, {
    continueOnError: true,
  });

  // console.dir(res);

  return { operations, res };
}

module.exports = { bulkDeleteFromQuery, bulkDeleteFromFile };
