import { normalizeText } from './normalizer';

export type FieldName =
  'name' | 'cpf' | 'admissionDate' | 'dismissalDate' | string;

const fieldAliases: Record<string, FieldName> = {
  // Nome
  nome: 'name',
  'nome completo': 'name',
  funcionario: 'name',
  'funcionario completo': 'name',
  colaborador: 'name',
  'nome funcionario': 'name',
  'nome colaborador': 'name',

  // CPF
  cpf: 'cpf',
  'cpf funcionario': 'cpf',
  'cpf colaborador': 'cpf',
  'numero cpf': 'cpf',
  'numero do cpf': 'cpf',
  'cpf do funcionario': 'cpf',
  'cpf do colaborador': 'cpf',
  documento: 'cpf',
  'documento cpf': 'cpf',

  // Admissão
  admissao: 'admissionDate',
  'data admissao': 'admissionDate',
  'dt admissao': 'admissionDate',
  'data de admissao': 'admissionDate',
  'data da admissao': 'admissionDate',
  'data entrada': 'admissionDate',
  'data de entrada': 'admissionDate',

  // Demissão
  demissao: 'dismissalDate',
  'data demissao': 'dismissalDate',
  'dt demissao': 'dismissalDate',
  'data de demissao': 'dismissalDate',
  'data da demissao': 'dismissalDate',
  desligamento: 'dismissalDate',
  'data desligamento': 'dismissalDate',
  'data de desligamento': 'dismissalDate',
  'data saida': 'dismissalDate',
  'data de saida': 'dismissalDate',
};

export function detectField(header: unknown): FieldName {
  const normalizedHeader = normalizeText(header);

  const exactMatch = fieldAliases[normalizedHeader];

  if (exactMatch) {
    return exactMatch;
  }

  if (
    normalizedHeader.includes('cpf') ||
    normalizedHeader.includes('documento')
  ) {
    return 'cpf';
  }

  if (
    normalizedHeader.includes('nome') ||
    normalizedHeader.includes('funcionario') ||
    normalizedHeader.includes('colaborador')
  ) {
    return 'name';
  }

  if (
    normalizedHeader.includes('admissao') ||
    normalizedHeader.includes('entrada')
  ) {
    return 'admissionDate';
  }

  if (
    normalizedHeader.includes('demissao') ||
    normalizedHeader.includes('desligamento') ||
    normalizedHeader.includes('saida')
  ) {
    return 'dismissalDate';
  }

  return normalizedHeader;
}
