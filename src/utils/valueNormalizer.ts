function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,]/g, '')
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

function normalizeNumber(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return '';
    }

    return String(value);
  }

  let text = String(value).trim();

  if (!text) {
    return '';
  }

  text = text.replace(/R\$/gi, '').replace(/\s/g, '');

  const hasComma = text.includes(',');
  const hasDot = text.includes('.');

  if (hasComma && hasDot) {
    // Exemplo: 1.234,56
    text = text.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    // Exemplo: 1234,56
    text = text.replace(',', '.');
  } else if (hasDot) {
    // Exemplo: 1234.56
    const decimalPlaces = text.split('.')[1]?.length ?? 0;

    if (decimalPlaces > 2) {
      // Exemplo: 1.234 → interpreta como milhar
      text = text.replace(/\./g, '');
    }
  }

  const number = Number(text);

  if (Number.isNaN(number)) {
    return normalizeText(value);
  }

  return String(number);
}

export function normalizeComparisonValue(
  value: unknown,
  field: string,
): string {
  if (field === 'admissionDate' || field === 'dismissalDate') {
    return normalizeDate(value);
  }

  if (field === 'name') {
    return normalizeText(value);
  }

  if (field === 'value') {
    return normalizeNumber(value);
  }

  return normalizeText(value);
}
