const { validateFiles } = require('./validate-files');
const { loadFile } = require('./load-files');
const path = require('path');
jest.mock('./load-files');

describe('validateFiles', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should validate all files and log a success message when there are no errors', () => {
    const jsonFiles = ['file1.json', 'file2.json'];
    const dataFolder = 'data';
    loadFile.mockImplementation(() => ({ error: null }));

    expect(() => validateFiles(jsonFiles, dataFolder)).not.toThrow();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Validation DONE: All files have valid JSON'
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    jsonFiles.forEach((file, i) => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `  validating ${i + 1} of ${jsonFiles.length}: ${file}`
      );
      expect(loadFile).toHaveBeenCalledWith(path.join(dataFolder, file));
    });
  });

  it('should log an error message and throw an error when there are errors', () => {
    const jsonFiles = ['file1.json', 'file2.json'];
    const dataFolder = 'data';
    const error = new Error('Invalid JSON');
    loadFile.mockImplementation(() => ({ error }));

    expect(() => validateFiles(jsonFiles, dataFolder)).toThrow(
      'Stopping the process because of the JSON Errors'
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Errors occurred while loading files:'
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith([
      { file: 'file1.json', error },
      { file: 'file2.json', error },
    ]);
    jsonFiles.forEach((file, i) => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `  validating ${i + 1} of ${jsonFiles.length}: ${file}`
      );
      expect(loadFile).toHaveBeenCalledWith(path.join(dataFolder, file));
    });
  });
});
