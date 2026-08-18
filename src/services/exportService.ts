import * as XLSX from 'xlsx';

import type {
  ComparisonResult,
  Employee,
  ModifiedEmployee,
} from '../types/comparison';

function formatValue(value: unknown): string | number {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('pt-BR');
  }

  return String(value);
}

function formatEmployee(employee: Employee): Record<string, string | number> {
  const formatted: Record<string, string | number> = {};

  Object.entries(employee).forEach(([field, value]) => {
    formatted[field] = formatValue(value);
  });

  return formatted;
}

function createEmployeeSheet(employees: Employee[]) {
  if (employees.length === 0) {
    return XLSX.utils.aoa_to_sheet([['Nenhum registro']]);
  }

  const data = employees.map(formatEmployee);

  return XLSX.utils.json_to_sheet(data);
}

function createModifiedSheet(modified: ModifiedEmployee[]) {
  const rows = modified.flatMap((item) =>
    item.changes.map((change) => ({
      Nome: formatValue(item.employee.name),
      CPF: formatValue(item.employee.cpf),
      Campo: change.field,
      'Valor anterior': formatValue(change.oldValue),
      'Valor atual': formatValue(change.newValue),
    })),
  );

  if (rows.length === 0) {
    return XLSX.utils.aoa_to_sheet([['Nenhuma alteração']]);
  }

  return XLSX.utils.json_to_sheet(rows);
}

function createIdentifierIssuesSheet(
  issues: ComparisonResult['identifierIssues'],
) {
  const rows = issues.map((issue) => ({
    Linha: issue.row,
    Nome: formatValue(issue.employee.name),
    CPF: formatValue(issue.employee.cpf),
    Problema:
      issue.reason === 'missing'
        ? 'Identificador não informado'
        : 'Identificador duplicado',
  }));

  if (rows.length === 0) {
    return XLSX.utils.aoa_to_sheet([['Nenhum problema encontrado']]);
  }

  return XLSX.utils.json_to_sheet(rows);
}

export function exportComparisonResult(
  comparison: ComparisonResult,
  previousData: Employee[],
  currentData: Employee[],
) {
  const workbook = XLSX.utils.book_new();

  /*
   * RESUMO
   */
  const summaryData = [
    ['RESUMO DA COMPARAÇÃO'],
    [],
    ['Categoria', 'Quantidade'],
    ['Adicionados', comparison.added.length],
    ['Removidos', comparison.removed.length],
    ['Alterados', comparison.modified.length],
    ['Sem alteração', comparison.unchanged.length],
    ['Problemas de identificação', comparison.identifierIssues.length],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

  /*
   * ARQUIVO ANTERIOR
   */
  const previousSheet = createEmployeeSheet(previousData);

  XLSX.utils.book_append_sheet(workbook, previousSheet, 'Arquivo anterior');

  /*
   * ARQUIVO ATUAL
   */
  const currentSheet = createEmployeeSheet(currentData);

  XLSX.utils.book_append_sheet(workbook, currentSheet, 'Arquivo atual');

  /*
   * ADICIONADOS
   */
  const addedSheet = createEmployeeSheet(comparison.added);

  XLSX.utils.book_append_sheet(workbook, addedSheet, 'Adicionados');

  /*
   * REMOVIDOS
   */
  const removedSheet = createEmployeeSheet(comparison.removed);

  XLSX.utils.book_append_sheet(workbook, removedSheet, 'Removidos');

  /*
   * ALTERADOS
   */
  const modifiedSheet = createModifiedSheet(comparison.modified);

  XLSX.utils.book_append_sheet(workbook, modifiedSheet, 'Alterados');

  /*
   * PROBLEMAS DE IDENTIFICAÇÃO
   */
  const identifierIssuesSheet = createIdentifierIssuesSheet(
    comparison.identifierIssues,
  );

  XLSX.utils.book_append_sheet(workbook, identifierIssuesSheet, 'Problemas');

  /*
   * DOWNLOAD
   */
  XLSX.writeFile(workbook, 'resultado-comparacao.xlsx');
}
