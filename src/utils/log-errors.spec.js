const { logErrors } = require('./log-errors');
const fs = require('fs');
const path = require('path');
jest.mock('fs');

describe('logErrors', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should log errors and write them to a file', () => {
    const errors = ['error1', 'error2'];
    const writeFileSyncMock = jest.fn();
    fs.writeFileSync = writeFileSyncMock;

    logErrors(errors);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Errors during the operation - count:${errors.length}`
    );
    expect(writeFileSyncMock).toHaveBeenCalled();
    const filePath = writeFileSyncMock.mock.calls[0][0];
    expect(path.isAbsolute(filePath)).toBe(true);
    expect(filePath.includes('errors_')).toBe(true);
    expect(writeFileSyncMock.mock.calls[0][1]).toBe(
      JSON.stringify(errors, null, 2)
    );
  });

  it('should not log errors or write to a file when there are no errors', () => {
    const errors = [];
    const writeFileSyncMock = jest.fn();
    fs.writeFileSync = writeFileSyncMock;

    logErrors(errors);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(writeFileSyncMock).not.toHaveBeenCalled();
  });
});
