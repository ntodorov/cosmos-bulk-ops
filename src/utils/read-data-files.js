const fs = require('fs');
const path = require('path');

function readJsonFileNames(dataFolder) {
  const files = fs.readdirSync(dataFolder);
  const jsonFileNames = files.filter((file) => path.extname(file) === '.json');
  // Sort the filenames using the Array.prototype.sort method
  jsonFileNames.sort(alphaNumericSort);

  return jsonFileNames;
}

function alphaNumericSort(a, b) {
  const regExp = /\d+/g;
  const aNum = Number(a.match(regExp)[0]);
  const bNum = Number(b.match(regExp)[0]);
  if (aNum === bNum) {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  } else {
    return aNum - bNum;
  }
}

module.exports = {
  readJsonFileNames,
};
