/**
 * Prototype-only encoder/decoder for UTR-shaped demo references: [Y][DDD][R][XXXXXXX]
 * Y: Last digit of year (e.g. 6 for 2026)
 * DDD: Julian day of year (001 to 366)
 * R: Bank settlement batch / routing code
 * XXXXXXX: 7-digit unique sequence
 * Real UTR formats vary by bank and are not validated by this encoding.
 */

function getJulianDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function decodeUtrJulianDate(utr) {
  if (!utr || typeof utr !== 'string') return null;
  const cleanUtr = utr.trim();
  if (cleanUtr.length < 4) return null;

  const yearDigit = parseInt(cleanUtr.substring(0, 1), 10);
  const julianDayStr = cleanUtr.substring(1, 4);
  const julianDay = parseInt(julianDayStr, 10);

  const currentYear = new Date().getFullYear();
  const currentDecade = Math.floor(currentYear / 10) * 10;
  let estimatedYear = currentDecade + yearDigit;
  if (estimatedYear > currentYear + 1) {
    estimatedYear -= 10;
  }

  let decodedDate = null;
  let isValidDay = false;
  if (julianDay >= 1 && julianDay <= 366) {
    isValidDay = true;
    decodedDate = new Date(estimatedYear, 0);
    decodedDate.setDate(julianDay);
  }

  return {
    cleanUtr,
    yearDigit,
    estimatedYear,
    julianDay,
    isValidDay,
    decodedDate,
    batchCode: cleanUtr.length >= 5 ? cleanUtr.substring(4, 5) : null,
    sequence: cleanUtr.length > 5 ? cleanUtr.substring(5) : null,
  };
}

function generateAuthenticUtr(targetDate = new Date()) {
  const yearDigit = targetDate.getFullYear() % 10;
  const julianDay = String(getJulianDayOfYear(targetDate)).padStart(3, '0');
  const routing = Math.floor(Math.random() * 9 + 1);
  const seq = String(Math.floor(Math.random() * 9000000 + 1000000));
  return `${yearDigit}${julianDay}${routing}${seq}`;
}

module.exports = {
  getJulianDayOfYear,
  decodeUtrJulianDate,
  generateAuthenticUtr,
};
