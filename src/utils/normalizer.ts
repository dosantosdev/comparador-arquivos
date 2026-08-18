export function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function normalizeCpf(value: unknown): string {
  if (value === null || value === undefined || String(value).trim() === '') {
    return '';
  }

  return String(value).replace(/\D/g, '');
}

export function normalizeDate(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  return String(value).trim() || null;
}
