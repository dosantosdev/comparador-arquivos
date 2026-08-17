import { readSheet } from 'read-excel-file/browser';

import type { Employee } from '../types/comparison';
import { detectField } from '../utils/fieldDetector';
import {
  normalizeCpf,
  normalizeDate,
  normalizeText,
} from '../utils/normalizer';

export async function readExcelFile(file: File): Promise<Employee[]> {
  const rows = await readSheet(file);

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0];

  const employees: Employee[] = rows.slice(1).map((row) => {
    const employee: Employee = {};

    headers.forEach((header, index) => {
      const field = detectField(header);
      const value = row[index];

      if (field === 'name') {
        employee.name = normalizeText(value);
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

  return employees;
}
