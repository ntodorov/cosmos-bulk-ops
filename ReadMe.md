# CosmosDB Bulk Ops

Load JSON files with objects in array, and runs bulk operations on them - Create, Upsert, Delete.

## Installation

Clone the repository and install all dependencies with:
`npm install`

## Usage

To run the application, use the following command:
`node index.js --env dev --bulk-operation Upsert --data-folder ./data`

The following options are available:

- `-df, --data-folder <name>`: The full folder name where the JSON files are located (required).
- `-e, --env <name>`: The environment to run the bulk operation in (required). Valid values are `dev`, `tst`, `uat`, `prd`, and `sbx`.
- `-o, --bulk-operation <type>`: The type of bulk operation to run (required). Valid values are `Create`, `Upsert`, and `Delete`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
