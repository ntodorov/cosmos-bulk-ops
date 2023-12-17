const { bulkUpsertFolder } = require('./bulk-upsert');
const { CosmosClient } = require('@azure/cosmos');
jest.mock('@azure/cosmos');

describe('bulkUpsertFolder', () => {
  let container;
  const dataFolder = './test-data';

  beforeEach(() => {
    container = {
      items: {
        bulk: jest.fn().mockResolvedValue({}),
      },
    };

    CosmosClient.mockImplementation(() => {
      return {
        database: jest.fn().mockReturnValue({
          container: jest.fn().mockReturnValue(container),
        }),
      };
    });
  });

  it('should bulk upsert all JSON files in the data folder', async () => {
    const result = await bulkUpsertFolder(container, dataFolder);
    expect(result).toBeInstanceOf(Object);
    expect(result).toHaveProperty('totalRecords');
    expect(typeof result.totalRecords).toBe('number');
    expect(result).toHaveProperty('executionTime');
    expect(typeof result.executionTime).toBe('number');
  });
});