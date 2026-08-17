import type {
  ComparisonResult,
  Employee,
  ModifiedEmployee,
} from '../types/comparison';

function normalizeValue(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function getCpf(employee: Employee): string {
  return String(employee.cpf ?? '').replace(/\D/g, '');
}

function compareFields(previous: Employee, current: Employee) {
  const changes = [];

  const fields = new Set([...Object.keys(previous), ...Object.keys(current)]);

  fields.forEach((field) => {
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
): ComparisonResult {
  const previousMap = new Map<string, Employee>();
  const currentMap = new Map<string, Employee>();

  previous.forEach((employee) => {
    const cpf = getCpf(employee);

    if (cpf) {
      previousMap.set(cpf, employee);
    }
  });

  current.forEach((employee) => {
    const cpf = getCpf(employee);

    if (cpf) {
      currentMap.set(cpf, employee);
    }
  });

  const added: Employee[] = [];
  const removed: Employee[] = [];
  const modified: ModifiedEmployee[] = [];
  const unchanged: Employee[] = [];

  currentMap.forEach((currentEmployee, cpf) => {
    const previousEmployee = previousMap.get(cpf);

    if (!previousEmployee) {
      added.push(currentEmployee);
      return;
    }

    const changes = compareFields(previousEmployee, currentEmployee);

    if (changes.length > 0) {
      modified.push({
        employee: currentEmployee,
        changes,
      });
    } else {
      unchanged.push(currentEmployee);
    }
  });

  previousMap.forEach((previousEmployee, cpf) => {
    if (!currentMap.has(cpf)) {
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
