const { formatTime } = require('./format-time');

describe('formatTime', () => {
  it('should format time correctly', () => {
    const milliseconds = 3723000;
    const expected = '1h 2min 3s 0ms';

    const result = formatTime(milliseconds);

    expect(result).toBe(expected);
  });
});
