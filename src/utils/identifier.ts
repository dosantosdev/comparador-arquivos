export function normalizeIdentifier(value: unknown, field: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  const normalizedValue = String(value).trim();

  if (!normalizedValue) {
    return '';
  }

  if (field === 'cpf') {
    const cpf = normalizedValue.replace(/\D/g, '');

    if (!cpf || /^0+$/.test(cpf)) {
      return '';
    }

    return cpf.padStart(11, '0');
  }

  return normalizedValue
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
