export type Employee = {
  name?: string;
  cpf?: string;
  admissionDate?: string | null;
  dismissalDate?: string | null;
  status?: string;
  plan?: string;
  [key: string]: unknown;
};

export type ModifiedField = {
  field: string;
  oldValue: unknown;
  newValue: unknown;
};

export type ModifiedEmployee = {
  employee: Employee;
  changes: ModifiedField[];
};

export type ComparisonResult = {
  added: Employee[];
  removed: Employee[];
  modified: ModifiedEmployee[];
  unchanged: Employee[];
  identifierIssues: IdentifierIssue[];
};

export type IdentifierIssue = {
  row: number;
  employee: Employee;
  reason: 'missing' | 'duplicate';
};

export type ParsedExcelFile = {
  employees: Employee[];
  fieldLabels: Record<string, string>;
};
