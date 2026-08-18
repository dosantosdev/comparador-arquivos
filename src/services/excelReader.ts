import { readSheet } from 'read-excel-file/browser';

import type { Employee, ParsedExcelFile } from '../types/comparison';

import { detectField } from '../utils/fieldDetector';

import { normalizeCpf, normalizeDate } from '../utils/normalizer';

import { inferHeaderlessFields } from '../utils/headerlessDetector';

export async function readExcelFile(file: File): Promise<ParsedExcelFile> {
  const rows = await readSheet(file);

  if (rows.length === 0) {
    return {
      employees: [],
      fieldLabels: {},
      hasHeader: false,
      structureDetected: false,
    };
  }

  const firstRow = rows[0];

  const detectedFields = firstRow
    .map((header) => detectField(header))
    .filter((field) => field);

  const knownFields = detectedFields.filter((field) =>
    [
      'name',
      'cpf',
      'admissionDate',
      'dismissalDate',
      'status',
      'plan',
      'value',
      'sex',
      'activity',
    ].includes(field),
  );

  const hasHeader = knownFields.length >= 2;

  /*
   * ------------------------------------------------------------
   * ARQUIVO COM CABEÇALHO
   * ------------------------------------------------------------
   */

  if (hasHeader) {
    const headers = firstRow;

    const fieldLabels: Record<string, string> = {};

    headers.forEach((header) => {
      const originalHeader = String(header ?? '').trim();

      if (!originalHeader) {
        return;
      }

      const field = detectField(originalHeader);

      if (!fieldLabels[field]) {
        fieldLabels[field] = originalHeader;
      }
    });

    const employees = rows
      .slice(1)
      .filter((row) => row.some((value) => value !== null && value !== ''))
      .map((row) => {
        const employee: Employee = {};

        headers.forEach((header, index) => {
          const field = detectField(header);
          const value = row[index];

          if (field === 'name') {
            employee.name = String(value ?? '').trim();

            return;
          }

          if (field === 'cpf') {
            employee.cpf = normalizeCpf(value);

            return;
          }

          if (field === 'admissionDate') {
            employee.admissionDate = normalizeDate(value);

            return;
          }

          if (field === 'dismissalDate') {
            employee.dismissalDate = normalizeDate(value);

            return;
          }

          employee[field] = value;
        });

        return employee;
      });

    return {
      employees,
      fieldLabels,
      hasHeader: true,
      structureDetected: employees.length > 0,
    };
  }

  /*
   * ------------------------------------------------------------
   * ARQUIVO SEM CABEÇALHO
   * ------------------------------------------------------------
   */

  const inferredFields = inferHeaderlessFields(rows);

  if (inferredFields.length === 0) {
    return {
      employees: [],
      fieldLabels: {},
      hasHeader: false,
      structureDetected: false,
    };
  }

  const fieldLabels: Record<string, string> = {};

  inferredFields.forEach(({ field }) => {
    const labels: Record<string, string> = {
      name: 'Nome',
      cpf: 'CPF',
      sex: 'Sexo',
      activity: 'Atividade',
    };

    fieldLabels[field] = labels[field] ?? field;
  });

  const employees = rows
    .filter((row) => row.some((value) => value !== null && value !== ''))
    .map((row) => {
      const employee: Employee = {};

      inferredFields.forEach(({ columnIndex, field }) => {
        const value = row[columnIndex];

        if (field === 'name') {
          employee.name = String(value ?? '').trim();

          return;
        }

        if (field === 'cpf') {
          employee.cpf = normalizeCpf(value);

          return;
        }

        employee[field] = value;
      });

      return employee;
    });

  return {
    employees,
    fieldLabels,
    hasHeader: false,
    structureDetected: employees.length > 0,
  };
}
