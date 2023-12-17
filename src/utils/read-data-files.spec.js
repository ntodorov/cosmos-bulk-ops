const fs = require('fs');
jest.mock('fs');
const { readJsonFileNames } = require('./read-data-files');

describe('readJsonFileNames', () => {
  it('should return an array of JSON file names sorted alphanumeric', () => {
    const dataFolder = '/path/to/data/folder';
    const expectedFileNames = ['file1.json', 'file2.json', 'file3.json'];
    fs.readdirSync.mockReturnValue([
      'file3.json',
      'file1.json',
      'file2.json',
      'file4.txt',
    ]);
    const result = readJsonFileNames(dataFolder);

    expect(result).toEqual(expectedFileNames);
    expect(fs.readdirSync).toHaveBeenCalledWith(dataFolder);
    expect(result).not.toBe(expectedFileNames); // Ensure a new array is returned
  });

  it('should return properly sorted array of more complex file names', () => {
    const dataFolder = '/path/to/data/folder';
    const expectedFileNames = [
      'Payload_Id ge 1 and Id le 1500_EAS14.json',
      'Payload_Id ge 1501 and Id le 3000_EAS14.json',
      'Payload_Id ge 3001 and Id le 4500_EAS14.json',
      'Payload_Id ge 4501 and Id le 6000_EAS14.json',
      'Payload_Id ge 6001 and Id le 7500_EAS14.json',
      'Payload_Id ge 7501 and Id le 9000_EAS14.json',
      'Payload_Id ge 9001 and Id le 10500_EAS14.json',
    ];

    fs.readdirSync.mockReturnValue([
      'Payload_Id ge 1501 and Id le 3000_EAS14.json',
      'Payload_Id ge 9001 and Id le 10500_EAS14.json',
      'Payload_Id ge 3001 and Id le 4500_EAS14.json',
      'Payload_Id ge 4501 and Id le 6000_EAS14.json',
      'Payload_Id ge 1 and Id le 1500_EAS14.json',
      'Payload_Id ge 6001 and Id le 7500_EAS14.json',
      'Payload_Id ge 7501 and Id le 9000_EAS14.json',
      'blebleh.txt',
    ]);

    const result = readJsonFileNames(dataFolder);

    expect(result).toEqual(expectedFileNames);
    expect(fs.readdirSync).toHaveBeenCalledWith(dataFolder);
    expect(result).not.toBe(expectedFileNames); // Ensure a new array is returned
  });

  it('should sorted numeric files too', () => {
    const dataFolder = '/path/to/data/folder';
    const expectedFileNames = ['1.json', '2.json', '3.json'];
    fs.readdirSync.mockReturnValue(['3.json', '1.json', '2.json', 'file4.txt']);
    const result = readJsonFileNames(dataFolder);

    expect(result).toEqual(expectedFileNames);
    expect(fs.readdirSync).toHaveBeenCalledWith(dataFolder);
    expect(result).not.toBe(expectedFileNames); // Ensure a new array is returned
  });

  it('should sort similar file names too', () => {
    const dataFolder = '/path/to/data/folder';
    const expectedFileNames = ['1.json', '2a.json', '2b.json', '3.json'];
    fs.readdirSync.mockReturnValue([
      '3.json',
      '1.json',
      '2b.json',
      'file4.txt',
      '2a.json',
    ]);
    const result = readJsonFileNames(dataFolder);

    expect(result).toEqual(expectedFileNames);
    expect(fs.readdirSync).toHaveBeenCalledWith(dataFolder);
    expect(result).not.toBe(expectedFileNames); // Ensure a new array is returned
  });
});
