export const formatHistoryBoolean = (value) => {
  if (value === true || (typeof value === 'string' && value.toLowerCase() === 'true')) return '1';
  if (value === false || (typeof value === 'string' && value.toLowerCase() === 'false')) return '0';
  return null;
};

export const isHighlightedChangeValue = (value) => {
  if (value === null || value === undefined || value === '' || value === '-') return false;
  const booleanValue = formatHistoryBoolean(value);
  if (booleanValue !== null) return booleanValue === '1';
  return !(typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))))
    || Number(value) !== 0;
};
