function formatTime(milliseconds) {
  let hours = Math.floor(milliseconds / 3600000);
  milliseconds %= 3600000;
  let minutes = Math.floor(milliseconds / 60000);
  milliseconds %= 60000;
  let seconds = Math.floor(milliseconds / 1000);
  let ms = Math.floor(milliseconds % 1000);

  return `${hours}h ${minutes}min ${seconds}s ${ms}ms`;
}

module.exports = {
  formatTime,
};
