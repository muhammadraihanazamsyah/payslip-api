// src/utils/getWorkdays.js
module.exports = function getWorkdays(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let count = 0;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
};
