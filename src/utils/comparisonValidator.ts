import type { Employee } from '../types/comparison';

export function validateIdentifier(
  previousData: Employee[],
  currentData: Employee[],
  identifier: string,
): string | null {
  if (previousData.length === 0) {
    return 'O arquivo anterior não possui registros para comparar.';
  }

  if (currentData.length === 0) {
    return 'O arquivo atual não possui registros para comparar.';
  }

  if (!identifier) {
    return 'Selecione um identificador para realizar a comparação.';
  }

  const previousHasIdentifier = previousData.some((employee) => {
    const value = employee[identifier];

    return value !== null && value !== undefined && String(value).trim() !== '';
  });

  const currentHasIdentifier = currentData.some((employee) => {
    const value = employee[identifier];

    return value !== null && value !== undefined && String(value).trim() !== '';
  });

  if (!previousHasIdentifier) {
    return `O arquivo anterior não possui valores válidos para o identificador "${identifier}".`;
  }

  if (!currentHasIdentifier) {
    return `O arquivo atual não possui valores válidos para o identificador "${identifier}".`;
  }

  return null;
}
