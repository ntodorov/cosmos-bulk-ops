#!/usr/bin/env node

const { Command, Option } = require('commander');
const { CosmosClient, BulkOperationType } = require('@azure/cosmos');
const { bulkUpsertFolder } = require('./src/bulk-upsert');
const { exit } = require('process');
const {
  bulkDeleteFromQuery,
  bulkDeleteFromFile,
} = require('./src/bulk-delete');

//Initialize Environment
function initEnv(env) {
  if (!env) {
    console.debug('Initializing... using .env file');
    require('dotenv').config();
  } else {
    console.debug(
      `Initializing... Environment name ${env} - using .env.${env} file`
    );
    // load environment variables from .env.dev file
    require('dotenv').config({ path: `.env.${env}` });
  }
  //get environment variables
  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;
  const databaseId = process.env.DATABASE_NAME;
  const containerId = process.env.CONTAINER_NAME;

  if (!endpoint)
    throw new Error('Environment variable COSMOS_DB_ENDPOINT is required!');
  if (!key) throw new Error('Environment variable COSMOS_DB_KEY is required!');
  if (!databaseId)
    throw new Error('Environment variable DATABASE_NAME is required!');
  if (!containerId)
    throw new Error('Environment variable CONTAINER_NAME is required!');

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

const upsertOp = async (dataFolder) => {
  // Initialize environment
  const { client, databaseId, containerId } = initEnv(program.opts().env);
  const container = client.database(databaseId).container(containerId);

  // check how many records are in the container
  const res = await container.items.query(querySpec).fetchAll();
  console.log(`${res.resources} Existing records in container ${containerId} `);

  //UPsert data from folder
  await bulkUpsertFolder(container, dataFolder);

  const res2 = await container.items.query(querySpec).fetchAll();
  console.log(`${res2.resources} records after the operation `);
};

const deleteOp = async ({ query, queryFile }) => {
  try {
    if (!query && !queryFile)
      throw new Error(
        'delete operation to work -q or -qf must be provided! run "cbops delete --help" for more info'
      );

    // Initialize environment
    const { client, databaseId, containerId } = initEnv(program.opts().env);
    const container = client.database(databaseId).container(containerId);

    // check how many records are in the container
    const res = await container.items.query(querySpec).fetchAll();
    console.log(
      `${res.resources} Existing records in container ${containerId} `
    );

    if (query) await bulkDeleteFromQuery(container, query);
    else await bulkDeleteFromFile(container, queryFile);

    const res2 = await container.items.query(querySpec).fetchAll();
    console.log(`${res2.resources} records after the operation `);
  } catch (error) {
    console.error(error.message);
    exit(1);
  }
};

//get command line arguments
const program = new Command();
program
  .name('cbops')
  .description(
    'Executes bulk operations - Create, Upsert on provided folder with JSON files, and Delete on provided query.'
  )
  .version('1.0.0')
  .option(
    '-e, --env <name>',
    'environment name like dev, qa, prod. You need to have .env.<name> file in the root folder. If no name provided the tool will use .env file'
  );

program
  .command('delete')
  .option(
    '-q, --query <simple query>',
    'A simple query that returs the records to be deleted. Example: SELECT * FROM c WHERE c.id = "1"'
  )
  .option(
    '-qf, --queryFile <fullQueryFileName>',
    'fileName with full path to file with query that returs the records to be deleted. -q takes precedence over -qf'
  )
  .action(deleteOp);

program
  .command('upsert')
  .argument(
    '<data-folder>',
    'the full folder name where the JSON files are located'
  )
  .action(upsertOp);

program.parse();

// console.dir(program.opts());
// console.dir(program.args);

// the Delete operation requires query or queryFile
// if (
//   program.opts().bulkOperation === 'Delete' &&
//   !(program.opts().query || program.opts().queryFile)
// ) {
//   console.error('Option -q or -qf is required when -o is Delete');
//   process.exit(1);
// }
