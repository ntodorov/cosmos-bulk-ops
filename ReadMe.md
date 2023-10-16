# `cbops` - CosmosDB Bulk Operations

CLI for bulk operations on CosmosDB container.
Supports - Create, Upsert and Delete operations.

TODO: finish the documentation!

## Installation

Clone the repository and install all dependencies with:
`npm install`

## Usage

To run the application, use the following command:

```bash
npx cbops upsert ./data --env dev
```

Delete operation example:

```bash
npx cbops delete --query "SELECT c.id, c.yourPartitionKeyField FROM c WHERE c.yourPartitionKeyField = 'SOME VALUE'"
npx cbops delete --queryFile ./del.json
```

## Parameters

The following command line parameters are available:

### subcommands

- `upsert <folderName>`: Bulk operation `Upsert` (Insert if does not exist or Update if exists). Required arqument the full path and name of the folder that contains \*.json file(s). The JSON file must be representing array with object that you want upserted.
- `delete`: subcommand to run `Delete` bulk operation on given results from query that you need to provide.
- `  -q, --query <simple query>`: A simple query that returns the records to be deleted. Example: `SELECT c.id, c.yourPartitionKeyField FROM c WHERE c.id = "1"`. Required only for Delete operation and only one of `-q` and `-qf` should be used.
- `  -qf, --queryFile <fullQueryFileName>`: The file name with full path to the file with the query that returns the records to be deleted. `-q` takes precedence over `-qf`. If both provided, `-qf` will be ignored.

- `-e, --env <name>`: Optional environment name like dev, qa, prod. You need to have `.env.<name>` file in the root folder, so dotenv can load it. If not provided the tool will load the `.env` file.

## Configuration

The following environment variables need to be set in order to run the application:

- `COSMOS_DB_ENDPOINT`: The endpoint URL of your Cosmos DB account.
- `COSMOS_DB_KEY`: The primary key of your Cosmos DB account.
- `DATABASE_NAME`: The name of the database to use.
- `CONTAINER_NAME`: The name of the container to use.

The following environment variable is optional:

- `MAX_CONCURRENT_OPERATIONS`: The maximum number of concurrent operations to run. The default value is 50. It is fitting for a Cosmos DB account with 10000 RU/s throughput.
  NOTE: the default throupghput for a Cosmos DB container is 400 RU/s, so if you have not changed it, you should set this value to 5.

To simplify local work, the tools is using dotenv to load the environment variables from a file. The file name is `.env` by default, but you can change it by providing the `--env` command line parameter.
For example if you need to run it from the same folder, but with different environment, you can create `.env.dev` and `.env.qa` files and run the tool with `--env dev` or `--env qa` parameter.
The use of .env file(s) is optional. If you prefer to set the environment variables directly, you can do it.

## Error reporting

if there are some operational errors during the bulk operation, they will be logged in file with name `errors_<timestamp>.log`.

NOTE: if you want to save all console output to a file, use the redirect output operator `>` for example:

`npx cbops upsert --data-folder ./data > output.log`

##TODO

- [ ] add tests
- [ ] handle throttling errors, by retrying the operations configurable number of times
- [ ] add support bulk operation "Create"

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
