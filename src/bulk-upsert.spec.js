const { bulkUpsertFolder } = require('./bulk-upsert');

const { BulkOperationType } = require('@azure/cosmos');
const path = require('path');
const utils = require('./utils');

// Mock the necessary modules and functions
jest.mock('@azure/cosmos');
jest.mock('path');
jest.mock('./utils', () => ({
  validateFiles: jest.fn(),
  loadFile: jest.fn(),
  formatTime: jest.fn((time) => `Formatted ${time}`),
  readJsonFileNames: jest.fn(),
  logErrors: jest.fn(),
}));

// Define the mocked functions behavior
const mockContainer = {
  items: {
    bulk: jest.fn(),
  },
};

// Reset the mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('bulkUpsertFolder', () => {
  it('calls readJsonFileNames, validateFiles, and logs start and end messages', async () => {
    // Arrange
    utils.readJsonFileNames.mockReturnValue([]);
    utils.formatTime.mockReturnValue('formatted time');

    // Setup global console log spying to verify output
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Act
    await bulkUpsertFolder(mockContainer, 'dummy/folder');

    // Assert
    expect(utils.readJsonFileNames).toHaveBeenCalledWith('dummy/folder');
    expect(utils.validateFiles).toHaveBeenCalledWith([], 'dummy/folder');
    expect(consoleLogSpy).toHaveBeenCalledWith('STARTING bulk Upsert process:');
    expect(consoleLogSpy).toHaveBeenCalledWith('END of bulk Upsert process');
  });

  it('correctly processes files and accumulates document counts', async () => {
    // Arrange
    const mockJsonFiles = ['file1', 'file2'];
    utils.readJsonFileNames.mockReturnValue(mockJsonFiles);
    utils.loadFile
      .mockReturnValue({ documents: [{ id: 1 }, { id: 2 }] }) // file1
      .mockReturnValueOnce({ documents: [{ id: 3 }, { id: 4 }] }); // file2, it is needed because the function splice the documents object and affects the mockReturnValue

    const mockBulkResponseSuccess = {
      statusCode: 200,
    };

    mockContainer.items.bulk.mockResolvedValue(
      Array(2).fill(mockBulkResponseSuccess)
    );

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Act
    await bulkUpsertFolder(mockContainer, 'dummy/folder');

    // Assert
    expect(mockContainer.items.bulk).toHaveBeenCalledTimes(2); // Assuming each file has less or equal documents than MAX_CONCURRENT_OPERATIONS
    expect(consoleLogSpy).toHaveBeenCalledWith(` file 1 of 2: "file1"`);
    expect(consoleLogSpy).toHaveBeenCalledWith(` file 2 of 2: "file2"`);
    expect(consoleLogSpy).toHaveBeenCalledWith('Total Records: 4'); // 2 documents per file, 2 files
  });

  it('correctly logs throttlingErrors ', async () => {
    // Arrange
    const mockJsonFiles = ['11x-file'];
    utils.readJsonFileNames.mockReturnValue(mockJsonFiles);
    utils.loadFile.mockReturnValue({ documents: [{ id: 1 }, { id: 2 }] });

    const mockBulkResponseSuccess = {
      statusCode: 429,
    };

    mockContainer.items.bulk.mockResolvedValue(
      Array(2).fill(mockBulkResponseSuccess)
    );

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Act
    await bulkUpsertFolder(mockContainer, 'dummy/folder');

    // Assert
    expect(mockContainer.items.bulk).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalled();
    expect(utils.logErrors).toHaveBeenCalledWith([
      {
        operation: { operationType: 'Upsert', resourceBody: { id: 1 } },
        error: { statusCode: 429 },
      },
      {
        operation: { operationType: 'Upsert', resourceBody: { id: 2 } },
        error: { statusCode: 429 },
      },
    ]);
  });

  // More tests need to be written for edge cases, error situations, etc...
});
