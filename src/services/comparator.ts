import type {
  ComparisonResult,
  Employee,
  ModifiedEmployee,
  ModifiedField,
} from '../types/comparison';

function normalizeValue(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function getIdentifier(employee: Employee, identifierField: string): string {
  const value = employee[identifierField];

  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function compareFields(
  previous: Employee,
  current: Employee,
  comparisonFields: string[],
): ModifiedField[] {
  const changes: ModifiedField[] = [];

  comparisonFields.forEach((field) => {
    const oldValue = normalizeValue(previous[field]);
    const newValue = normalizeValue(current[field]);

    if (oldValue !== newValue) {
      changes.push({
        field,
        oldValue: previous[field],
        newValue: current[field],
      });
    }
  });

  return changes;
}

export function compareEmployees(
  previous: Employee[],
  current: Employee[],
  identifierField: string,
  comparisonFields: string[],
): ComparisonResult {
  const previousMap = new Map<string, Employee>();
  const currentMap = new Map<string, Employee>();

  previous.forEach((employee) => {
    const identifier = getIdentifier(employee, identifierField);

    if (identifier) {
      previousMap.set(identifier, employee);
    }
  });

  current.forEach((employee) => {
    const identifier = getIdentifier(employee, identifierField);

    if (identifier) {
      currentMap.set(identifier, employee);
    }
  });

  const added: Employee[] = [];
  const removed: Employee[] = [];
  const modified: ModifiedEmployee[] = [];
  const unchanged: Employee[] = [];

  currentMap.forEach((currentEmployee, identifier) => {
    const previousEmployee = previousMap.get(identifier);

    if (!previousEmployee) {
      added.push(currentEmployee);
      return;
    }

    const changes = compareFields(
      previousEmployee,
      currentEmployee,
      comparisonFields,
    );

    if (changes.length > 0) {
      modified.push({
        employee: currentEmployee,
        changes,
      });
    } else {
      unchanged.push(currentEmployee);
    }
  });

  previousMap.forEach((previousEmployee, identifier) => {
    if (!currentMap.has(identifier)) {
      removed.push(previousEmployee);
    }
  });

  return {
    added,
    removed,
    modified,
    unchanged,
  };
}
