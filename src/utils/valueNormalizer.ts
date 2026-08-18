function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeName(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/0/g, 'o')
    .replace(/\s+/g, '')
    .toLowerCase()
    .trim();
}

function calculateLevenshteinDistance(first: string, second: string): number {
  const previousRow = Array.from(
    { length: second.length + 1 },
    (_, index) => index,
  );

  for (let i = 1; i <= first.length; i += 1) {
    const currentRow = [i];

    for (let j = 1; j <= second.length; j += 1) {
      const insertion = currentRow[j - 1] + 1;
      const deletion = previousRow[j] + 1;
      const substitution =
        previousRow[j - 1] + (first[i - 1] === second[j - 1] ? 0 : 1);

      currentRow.push(Math.min(insertion, deletion, substitution));
    }

    for (let j = 0; j < currentRow.length; j += 1) {
      previousRow[j] = currentRow[j];
    }
  }

  return previousRow[second.length];
}

function hasOcrSuspiciousCharacter(value: unknown): boolean {
  return /[01!]/.test(String(value ?? ''));
}

export function areNamesEquivalent(
  previous: unknown,
  current: unknown,
): boolean {
  const previousText = String(previous ?? '');
  const currentText = String(current ?? '');

  const normalizedPrevious = normalizeName(previousText);
  const normalizedCurrent = normalizeName(currentText);

  if (normalizedPrevious === normalizedCurrent) {
    return true;
  }

  /*
   * Só aplicamos tolerância adicional quando pelo menos
   * um dos nomes apresenta sinais típicos de conversão
   * de PDF/OCR.
   */
  if (
    !hasOcrSuspiciousCharacter(previousText) &&
    !hasOcrSuspiciousCharacter(currentText)
  ) {
    return false;
  }

  const distance = calculateLevenshteinDistance(
    normalizedPrevious,
    normalizedCurrent,
  );

  const maximumLength = Math.max(
    normalizedPrevious.length,
    normalizedCurrent.length,
  );

  if (maximumLength === 0) {
    return true;
  }

  const differenceRatio = distance / maximumLength;

  /*
   * Aceita pequenas diferenças quando existe indício
   * de erro de OCR/conversão.
   */
  return distance <= 3 && differenceRatio <= 0.12;
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

function normalizeCpf(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const cpf = String(value).replace(/\D/g, '');

  if (!cpf || /^0+$/.test(cpf)) {
    return '';
  }

  return cpf.padStart(11, '0');
}

function normalizeSex(value: unknown): string {
  const text = normalizeText(value);

  if (text === 'm' || text === 'masculino') {
    return 'm';
  }

  if (text === 'f' || text === 'feminino') {
    return 'f';
  }

  return text;
}

export function normalizeComparisonValue(
  value: unknown,
  field: string,
): string {
  if (field === 'admissionDate' || field === 'dismissalDate') {
    return normalizeDate(value);
  }

  if (field === 'cpf') {
    return normalizeCpf(value);
  }

  if (field === 'name') {
    return normalizeName(value);
  }

  if (field === 'sex' || field === 'sexo') {
    return normalizeSex(value);
  }

  if (field === 'value') {
    return normalizeNumber(value);
  }

  return normalizeText(value);
}
