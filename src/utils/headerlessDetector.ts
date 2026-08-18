import { normalizeText } from './normalizer';
import type { FieldName } from './fieldDetector';

export type InferredField = {
  columnIndex: number;
  field: FieldName;
  confidence: number;
};

function getDigits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

function isCpfCandidate(value: unknown): boolean {
  const original = String(value ?? '').trim();

  if (!original) {
    return false;
  }

  const digits = getDigits(value);

  if (digits.length < 9 || digits.length > 11) {
    return false;
  }

  return true;
}

function isSexValue(value: unknown): boolean {
  const normalized = normalizeText(value);

  return (
    normalized === 'm' ||
    normalized === 'f' ||
    normalized === 'masculino' ||
    normalized === 'feminino'
  );
}

function isDateLike(value: unknown): boolean {
  if (value instanceof Date) {
    return true;
  }

  const text = String(value ?? '').trim();

  if (!text) {
    return false;
  }

  return (
    /^\d{2}\/\d{2}\/\d{4}$/.test(text) ||
    /^\d{2}\/\d{2}\/\d{2}$/.test(text) ||
    /^\d{4}-\d{2}-\d{2}$/.test(text)
  );
}

function isTextValue(value: unknown): boolean {
  const text = String(value ?? '').trim();

  if (!text) {
    return false;
  }

  if (isCpfCandidate(value)) {
    return false;
  }

  if (isSexValue(value)) {
    return false;
  }

  if (isDateLike(value)) {
    return false;
  }

  return /[a-zA-ZÀ-ÿ]/.test(text);
}

function getColumnValues(rows: unknown[][], columnIndex: number): unknown[] {
  return rows
    .map((row) => row[columnIndex])
    .filter((value) => value !== null && value !== undefined && value !== '');
}

function getColumnCount(rows: unknown[][]): number {
  return rows.reduce((maximum, row) => Math.max(maximum, row.length), 0);
}

function getCpfScore(values: unknown[]): number {
  if (values.length === 0) {
    return 0;
  }

  const matches = values.filter(isCpfCandidate).length;

  return matches / values.length;
}

function getSexScore(values: unknown[]): number {
  if (values.length === 0) {
    return 0;
  }

  const matches = values.filter(isSexValue).length;

  return matches / values.length;
}

function getNameScore(values: unknown[]): number {
  if (values.length === 0) {
    return 0;
  }

  const textValues = values.filter(isTextValue);

  if (textValues.length === 0) {
    return 0;
  }

  const textRatio = textValues.length / values.length;

  const multiWordValues = textValues.filter((value) => {
    const text = String(value).trim();

    return text.split(/\s+/).length >= 2;
  });

  const multiWordRatio = multiWordValues.length / textValues.length;

  const reasonableLengthValues = textValues.filter((value) => {
    const text = String(value).trim();

    return text.length >= 6;
  });

  const lengthRatio = reasonableLengthValues.length / textValues.length;

  return textRatio * 0.5 + multiWordRatio * 0.35 + lengthRatio * 0.15;
}

function getActivityScore(values: unknown[]): number {
  if (values.length === 0) {
    return 0;
  }

  const textValues = values.filter(isTextValue);

  if (textValues.length === 0) {
    return 0;
  }

  return textValues.length / values.length;
}

function findBestColumn(
  rows: unknown[][],
  scoreFunction: (values: unknown[]) => number,
  excludedColumns: Set<number>,
): { columnIndex: number; score: number } | null {
  const columnCount = getColumnCount(rows);

  let bestColumn: number | null = null;
  let bestScore = 0;

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    if (excludedColumns.has(columnIndex)) {
      continue;
    }

    const values = getColumnValues(rows, columnIndex);
    const score = scoreFunction(values);

    if (score > bestScore) {
      bestScore = score;
      bestColumn = columnIndex;
    }
  }

  if (bestColumn === null) {
    return null;
  }

  return {
    columnIndex: bestColumn,
    score: bestScore,
  };
}

export function inferHeaderlessFields(rows: unknown[][]): InferredField[] {
  const dataRows = rows
    .filter((row) =>
      row.some(
        (value) => value !== null && value !== undefined && value !== '',
      ),
    )
    .slice(0, 50);

  if (dataRows.length === 0) {
    return [];
  }

  const inferredFields: InferredField[] = [];
  const usedColumns = new Set<number>();

  // CPF
  const cpfColumn = findBestColumn(dataRows, getCpfScore, usedColumns);

  if (cpfColumn && cpfColumn.score >= 0.75) {
    inferredFields.push({
      columnIndex: cpfColumn.columnIndex,
      field: 'cpf',
      confidence: cpfColumn.score,
    });

    usedColumns.add(cpfColumn.columnIndex);
  }

  // Sexo
  const sexColumn = findBestColumn(dataRows, getSexScore, usedColumns);

  if (sexColumn && sexColumn.score >= 0.75) {
    inferredFields.push({
      columnIndex: sexColumn.columnIndex,
      field: 'sex',
      confidence: sexColumn.score,
    });

    usedColumns.add(sexColumn.columnIndex);
  }

  // Nome
  const nameColumn = findBestColumn(dataRows, getNameScore, usedColumns);

  if (nameColumn && nameColumn.score >= 0.65) {
    inferredFields.push({
      columnIndex: nameColumn.columnIndex,
      field: 'name',
      confidence: nameColumn.score,
    });

    usedColumns.add(nameColumn.columnIndex);
  }

  // Atividade
  const activityColumn = findBestColumn(
    dataRows,
    getActivityScore,
    usedColumns,
  );

  if (activityColumn && activityColumn.score >= 0.6) {
    inferredFields.push({
      columnIndex: activityColumn.columnIndex,
      field: 'activity',
      confidence: activityColumn.score,
    });

    usedColumns.add(activityColumn.columnIndex);
  }

  const hasIdentifier = inferredFields.some(
    (field) => field.field === 'cpf' || field.field === 'name',
  );

  if (!hasIdentifier) {
    return [];
  }

  return inferredFields;
}
