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

export const getHistoryTailColumns = (record, dateField) => {
  if (!record) return [];

  const columns = [];
  if ('checkBackup' in record) columns.push({ key: 'checkBackup', label: 'Check Backup' });

  if (dateField === 'historyDate') {
    if ('historyDate' in record) columns.push({ key: 'historyDate', label: 'History Date' });
    else if ('history_date' in record) columns.push({ key: 'history_date', label: 'History Date' });
  } else if (dateField === 'changeDate' && 'changeDate' in record) {
    columns.push({ key: 'changeDate', label: 'Change Date' });
  }

  return columns;
};
