#!/usr/bin/env node
const dotenv = require('dotenv');
const { Command, Option } = require('commander');
const { CosmosClient, BulkOperationType } = require('@azure/cosmos');
const fs = require('fs');
const path = require('path');

const { bulkUpsertFolder } = require('./src/bulk-upsert');
const { exit } = require('process');

//get command line arguments
const program = new Command();
program
  .name('CosmosDB Bulk Ops')
  .description(
    'Load JSON files with objects in array, and runs bulk operations on them - Create, Upsert, Delete.'
  )
  .version('1.0.0')
  .requiredOption(
    '-df, --data-folder <name>',
    'the full folder name where the JSON files are located'
  )
  .addOption(
    new Option('-e, --env <name>', 'environment')
      .choices(['dev', 'tst', 'uat', 'prd', 'sbx'])
      .makeOptionMandatory()
  )
  .addOption(
    new Option('-o, --bulk-operation <type>', 'what bulk operation to run')
      .choices(['Create', 'Upsert', 'Delete'])
      .makeOptionMandatory()
  );

program.parse();

// console.dir(program.opts());

//Initialize Environment
function initEnv(env) {
  // load environment variables from .env.dev file
  dotenv.config({ path: `.env.${env}` });
  //get environment variables
  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;
  const databaseId = process.env.DATABASE_NAME;
  const containerId = process.env.CONTAINER_NAME;

  const client = new CosmosClient({
    endpoint: endpoint,
    key: key,
  });

  return { client, databaseId, containerId };
}
const querySpec = {
  query: 'SELECT VALUE COUNT(1) FROM c',
  parameters: [],
};

async function main() {
  try {
    // Initialize environment
    const { client, databaseId, containerId } = initEnv(program.opts().env);

    const container = client.database(databaseId).container(containerId);
    // check how many records are in the container
    const res = await container.items.query(querySpec).fetchAll();
    console.log(
      `${res.resources} Existing records in container ${containerId} `
    );

    switch (program.opts().bulkOperation) {
      case 'Create':
        console.warn('Create is not implemented yet');
        break;
      case 'Upsert':
        await bulkUpsertFolder(container, program.opts().dataFolder);
        break;
      case 'Delete':
        console.warn('Delete is not implemented yet');
        break;
      default:
        console.error('Invalid bulk operation');
    }

    const res2 = await container.items.query(querySpec).fetchAll();
    console.log(`${res2.resources} records after the operation `);
  } catch (error) {
    console.error(error);
  }
}

//!!! START THE MAIN FUNCTION !!! =>>>
main().catch((error) => {
  console.error('Error occurred:', error.message);
  exit(1);
});
