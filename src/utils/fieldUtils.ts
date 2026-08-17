import type { Employee } from '../types/comparison';

export function getAvailableFields(
  previous: Employee[],
  current: Employee[],
): string[] {
  const fields = new Set<string>();

  previous.forEach((employee) => {
    Object.keys(employee).forEach((field) => {
      fields.add(field);
    });
  });

  current.forEach((employee) => {
    Object.keys(employee).forEach((field) => {
      fields.add(field);
    });
  });

  return Array.from(fields);
}
