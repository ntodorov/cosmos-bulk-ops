const { loadFile } = require('./load-files');
const fs = require('fs');
jest.mock('fs');

describe('loadFile', () => {
  it('should load and parse a valid JSON file', () => {
    const validJson = '[{"valid": "json"}]';
    fs.readFileSync = jest.fn().mockReturnValue(validJson);

    const result = loadFile('valid.json');

    expect(result).toEqual({
      documents: JSON.parse(validJson),
      error: null,
    });
    expect(fs.readFileSync).toHaveBeenCalledWith('valid.json', { encoding: 'utf8' });
  });

  it('should return an error if the JSON file is invalid', () => {
    const invalidJson = 'invalid json';
    fs.readFileSync = jest.fn().mockReturnValue(invalidJson);

    const result = loadFile('invalid.json');

    expect(result).toEqual({
      documents: [],
      error: expect.any(Error),
    });
    expect(fs.readFileSync).toHaveBeenCalledWith('invalid.json', { encoding: 'utf8' });
  });

  it('should return an error if the file does not exist', () => {
    fs.readFileSync = jest.fn().mockImplementation(() => {
      throw new Error('File not found');
    });

    const result = loadFile('nonexistent.json');

    expect(result).toEqual({
      documents: [],
      error: expect.any(Error),
    });
    expect(fs.readFileSync).toHaveBeenCalledWith('nonexistent.json', { encoding: 'utf8' });
  });
});