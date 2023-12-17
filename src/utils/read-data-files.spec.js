const fs = require('fs');
jest.mock('fs');
const { readJsonFileNames } = require('./read-data-files');
// jest.mock('path');

describe('readJsonFileNames', () => {
  it('should return an array of JSON file names sorted alphabetically', () => {
    const dataFolder = '/path/to/data/folder';
    const expectedFileNames = ['file1.json', 'file2.json', 'file3.json'];
    fs.readdirSync.mockReturnValue([
      'file3.json',
      'file1.json',
      'file2.json',
      'file4.txt',
    ]);

    // path.extname.mockReturnValue('.json');

    const result = readJsonFileNames(dataFolder);

    expect(result).toEqual(expectedFileNames);
    expect(fs.readdirSync).toHaveBeenCalledWith(dataFolder);
    expect(result).not.toBe(expectedFileNames); // Ensure a new array is returned
  });

  // Add more test cases if needed
});
