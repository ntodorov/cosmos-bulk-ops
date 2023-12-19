const { bulkDeleteFromQuery, bulkDeleteFromFile } = require('./bulk-delete');
const { BulkOperationType } = require('@azure/cosmos');
const fs = require('fs');
const utils = require('./utils');

// Mock the necessary modules and functions
jest.mock('fs');
jest.mock('@azure/cosmos');
jest.mock('./utils');

// Define a container mock object and setup default behavior
const containerMock = {
  read: jest.fn(),
  items: {
    query: jest.fn(),
    bulk: jest.fn(),
  },
};

// Setup the environment variable
process.env.MAX_CONCURRENT_OPERATIONS = '5';

// Reset the mocks before each test
beforeEach(() => {
  jest.resetAllMocks();
});

describe('bulkDeleteFromQuery', () => {
  it('deletes documents from a query successfully', async () => {
    // Arrange
    const mockQuery = 'SELECT * FROM c';
    utils.formatTime.mockReturnValue('formatted time');
    containerMock.read.mockResolvedValue({
      resource: { partitionKey: { paths: ['/id'] } },
    });

    const mockQueryIterator = {
      hasMoreResults: jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false),
      fetchNext: jest
        .fn()
        .mockResolvedValue({ resources: [{ id: '1', value: 'test' }] }),
    };

    containerMock.items.query.mockResolvedValue(mockQueryIterator);

    const mockBulkOperationResult = [{ statusCode: 204 }];
    containerMock.items.bulk.mockResolvedValue(mockBulkOperationResult);

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Act
    await bulkDeleteFromQuery(containerMock, mockQuery);

    // Assert
    expect(containerMock.items.query).toHaveBeenCalledWith(mockQuery, {
      maxItemCount: process.env.MAX_CONCURRENT_OPERATIONS,
    });
    expect(containerMock.items.bulk).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith('STARTING bulk Delete process:');
    expect(consoleLogSpy).toHaveBeenCalledWith('END of bulk Delete process');
    expect(consoleLogSpy).toHaveBeenCalledWith('Total Records: 1');

    consoleLogSpy.mockRestore();
  });

  it('handles errors from bulk operation', async () => {
    // Arrange
    const mockQuery = 'SELECT * FROM c';
    utils.formatTime.mockReturnValue('formatted time');
    containerMock.read.mockResolvedValue({
      resource: { partitionKey: { paths: ['/id'] } },
    });

    const mockQueryIterator = {
      hasMoreResults: jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false),
      fetchNext: jest
        .fn()
        .mockResolvedValue({ resources: [{ id: '1', value: 'test' }] }),
    };

    containerMock.items.query.mockResolvedValue(mockQueryIterator);

    const mockBulkOperationResult = [{ statusCode: 429 }];
    containerMock.items.bulk.mockResolvedValue(mockBulkOperationResult);

    // Act
    await bulkDeleteFromQuery(containerMock, mockQuery);

    // Assert
    expect(containerMock.items.query).toHaveBeenCalledWith(mockQuery, {
      maxItemCount: process.env.MAX_CONCURRENT_OPERATIONS,
    });
    expect(containerMock.items.bulk).toHaveBeenCalled();
    expect(utils.logErrors).toHaveBeenCalledWith([
      {
        operation: { operationType: 'Delete', id: '1', partitionKey: '1' },
        error: { statusCode: 429 },
      },
    ]);
  });

  // Additional test cases...
});

describe('bulkDeleteFromFile', () => {
  it('reads query from file and calls bulkDeleteFromQuery with correct parameters', async () => {
    // Arrange
    const mockQueryFile = 'query.txt';
    const mockQuery = 'SELECT * FROM c';
    fs.readFileSync.mockReturnValue(mockQuery);
    utils.formatTime.mockReturnValue('formatted time');
    containerMock.read.mockResolvedValue({
      resource: { partitionKey: { paths: ['/id'] } },
    });

    const mockQueryIterator = {
      hasMoreResults: jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false),
      fetchNext: jest
        .fn()
        .mockResolvedValue({ resources: [{ id: '1', value: 'test' }] }),
    };

    containerMock.items.query.mockResolvedValue(mockQueryIterator);

    const mockBulkOperationResult = [{ statusCode: 204 }];
    containerMock.items.bulk.mockResolvedValue(mockBulkOperationResult);

    // Act
    await bulkDeleteFromFile(containerMock, mockQueryFile);

    // Assert
    expect(fs.readFileSync).toHaveBeenCalledWith(mockQueryFile, 'utf8');
    expect(containerMock.items.query).toHaveBeenCalledWith(mockQuery, {
      maxItemCount: process.env.MAX_CONCURRENT_OPERATIONS,
    });
    expect(containerMock.items.bulk).toHaveBeenCalled();
  });

  // Additional test cases...
});
