//generate index file from this folder
// Path: src/utils/index.js

const { logErrors } = require('./log-errors');
const { formatTime } = require('./format-time');
const { readJsonFileNames } = require('./read-data-files');
const { loadFile } = require('./load-files');

module.exports = {
  logErrors,
  formatTime,
  readJsonFileNames,
  loadFile,
};
