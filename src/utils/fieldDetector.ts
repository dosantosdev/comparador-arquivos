import { normalizeText } from './normalizer';

export type FieldName =
  'name' | 'cpf' | 'admissionDate' | 'dismissalDate' | string;

const fieldAliases: Record<string, FieldName> = {
  nome: 'name',
  'nome completo': 'name',
  funcionario: 'name',
  colaborador: 'name',

  cpf: 'cpf',
  'cpf funcionario': 'cpf',
  'cpf colaborador': 'cpf',
  documento: 'cpf',

  'data admissao': 'admissionDate',
  'dt admissao': 'admissionDate',
  admissao: 'admissionDate',

  'data demissao': 'dismissalDate',
  'dt demissao': 'dismissalDate',
  demissao: 'dismissalDate',
};

export function detectField(header: unknown): FieldName {
  const normalizedHeader = normalizeText(header);

  return fieldAliases[normalizedHeader] ?? normalizedHeader;
}
