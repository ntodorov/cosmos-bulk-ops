# CosmosDB Bulk Ops

Load JSON files with objects in array, and runs bulk operations on them - Create, Upsert, Delete.

## Installation

Clone the repository and install all dependencies with:
`npm install`

## Usage

To run the application, use the following command:
`node index.js --env dev --bulk-operation Upsert --data-folder ./data`

Delete operation example:
`node index.js --env dev --bulk-operation Upsert --data-folder ./data --query "SELECT c.id, c.yourPartitionKeyField FROM c WHERE c.yourPartitionKeyField = 'SOME VALUE'"`

## Parameters

The following command line parameters are available:

- `-e, --env <name>`: The environment to use. Required. Valid values are `dev`, `tst`, `uat`, `prd`, and `sbx`.
- `-o, --bulk-operation <type>`: The bulk operation to run. Required. Valid values are `Create`, `Upsert`, and `Delete`.
- `-q, --query <simple query>`: A simple query that returns the records to be deleted. Example: `SELECT c.id, c.yourPartitionKeyField FROM c WHERE c.id = "1"`. Required only for Delete operation and only one of `-q` and `-qf` should be used.
- `-qf, --queryFile <fullQueryFileName>`: The file name with full path to the file with the query that returns the records to be deleted. `-q` takes precedence over `-qf`. If both provided, `-qf` will be ignored.
- `-df, --data-folder <name>`: The full folder name where the JSON files are located. Required for the `Upsert` operation.

## Configuration

The following environment variables need to be set in order to run the application:

- `COSMOS_DB_ENDPOINT`: The endpoint URL of your Cosmos DB account.
- `COSMOS_DB_KEY`: The primary key of your Cosmos DB account.
- `DATABASE_NAME`: The name of the database to use.
- `CONTAINER_NAME`: The name of the container to use.

The following environment variable is optional:

- `MAX_CONCURRENT_OPERATIONS`: The maximum number of concurrent operations to run. The default value is 50. It is fitting for a Cosmos DB account with 10000 RU/s throughput.
  NOTE: the default throupghput for a Cosmos DB container is 400 RU/s, so if you have not changed it, you should set this value to 5.

## Error reporting

if there are some operational errors during the bulk operation, they will be logged in file with name `errors_<timestamp>.log`.

NOTE: if you want to save all console output to a file, use the redirect output operator `>` for example:

`node index.js --env dev --bulk-operation Upsert --data-folder ./data > output.log`

##TODO

- [x] FIX the hardcoded partition key value in the Delete operation
- [ ] handle throttling errors, by retrying the operations configurable number of times
- [ ] add support bulk operation "Create"
- [ ] add tests
- [ ] make it npm package
- [ ] support for nested partition key fields, example: `address.city`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
