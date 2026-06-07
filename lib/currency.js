// Currency formatting for Moroccan Dirham (MAD).
//
// Uses French/Moroccan number conventions:
//   - Space as the thousands separator
//   - Comma as the decimal separator
//   - "MAD" suffix
//
// Examples:
//   fmtMAD(89.99)      → "89,99 MAD"
//   fmtMAD(1299)       → "1 299,00 MAD"
//   fmtMAD(1299.99)    → "1 299,99 MAD"
//   fmtMAD(1234567.5)  → "1 234 567,50 MAD"

export const CURRENCY_LABEL = 'MAD';

export const fmtMAD = (value, { decimals = 2, suffix = true } = {}) => {
  const num = Number(value);
  if (!isFinite(num)) return suffix ? '0,00 MAD' : '0,00';

  const fixed = num.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');

  // Insert non-breaking spaces every 3 digits from the right for the integer part.
  // U+202F (narrow no-break space) reads as a thin, premium separator and avoids
  // mid-number line breaks.
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');

  const body = decPart !== undefined ? `${withSpaces},${decPart}` : withSpaces;
  return suffix ? `${body}\u00A0MAD` : body;
};

// Plain text variant (regular spaces) for use inside URL query strings,
// emails, or anywhere narrow-space characters might not survive encoding.
export const fmtMADPlain = (value, { decimals = 2 } = {}) => {
  const num = Number(value);
  if (!isFinite(num)) return '0,00 MAD';
  const fixed = num.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${withSpaces},${decPart} MAD`;
};
