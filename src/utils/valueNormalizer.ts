function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeDate(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return '';
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const text = String(value).trim();

  // DD/MM/YYYY
  const brazilianDate = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (brazilianDate) {
    const [, day, month, year] = brazilianDate;

    return `${year}-${month}-${day}`;
  }

  // DD/MM/YY
  const shortBrazilianDate = text.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);

  if (shortBrazilianDate) {
    const [, day, month, shortYear] = shortBrazilianDate;

    const year = Number(shortYear) >= 50 ? `19${shortYear}` : `20${shortYear}`;

    return `${year}-${month}-${day}`;
  }

  // YYYY-MM-DD
  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoDate) {
    return text;
  }

  return normalizeText(value);
}

export function normalizeComparisonValue(
  value: unknown,
  field: string,
): string {
  if (field === 'admissionDate' || field === 'dismissalDate') {
    return normalizeDate(value);
  }

  return normalizeText(value);
}
