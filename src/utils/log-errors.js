const fs = require('fs');
const path = require('path');

function logErrors(errors) {
  if (errors.length > 0) {
    let date = new Date();
    let fileName =
      'errors_' +
      date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) + // Months are zero based
      ('0' + date.getDate()).slice(-2) +
      '_' +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2) +
      '.log';

    console.error(`Errors during the operation - count:${errors.length}`);

    fileName = path.join(__dirname, fileName);
    console.error(`Saving errors to file: ${fileName}`);
    fs.writeFileSync(fileName, JSON.stringify(errors, null, 2));
  }
}

module.exports = {
  logErrors,
};
