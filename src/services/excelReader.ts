import { readSheet } from 'read-excel-file/browser';

import type { Employee, ParsedExcelFile } from '../types/comparison';

import { detectField } from '../utils/fieldDetector';

import { normalizeCpf, normalizeDate } from '../utils/normalizer';

export async function readExcelFile(file: File): Promise<ParsedExcelFile> {
  const rows = await readSheet(file);

  if (rows.length === 0) {
    return {
      employees: [],
      fieldLabels: {},
    };
  }

  const headers = rows[0];

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
  };
}
