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

  'nome do funcionario': 'name',

  'nome do colaborador': 'name',

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

  'data contratacao': 'admissionDate',

  'data de contratacao': 'admissionDate',

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

  // Plano

  plano: 'plan',

  'plano saude': 'plan',

  'plano de saude': 'plan',

  convenio: 'plan',

  'convenio medico': 'plan',

  'convenio de saude': 'plan',

  // Situação

  situacao: 'status',

  status: 'status',

  'situacao funcionario': 'status',

  'situacao colaborador': 'status',

  'situacao do funcionario': 'status',

  'situacao do colaborador': 'status',

  'status funcionario': 'status',

  'status colaborador': 'status',

  'status do funcionario': 'status',

  'status do colaborador': 'status',

  // Valor

  valor: 'value',

  'valor plano': 'value',

  'valor do plano': 'value',

  'valor mensal': 'value',

  mensalidade: 'value',

  preco: 'value',

  custo: 'value',

  'valor convenio': 'value',

  'valor do convenio': 'value',
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
    normalizedHeader === 'funcionario' ||
    normalizedHeader === 'colaborador'
  ) {
    return 'name';
  }

  if (
    normalizedHeader.includes('admissao') ||
    normalizedHeader.includes('entrada') ||
    normalizedHeader.includes('contratacao')
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

  if (
    normalizedHeader.includes('plano') ||
    normalizedHeader.includes('convenio')
  ) {
    return 'plan';
  }

  if (
    normalizedHeader.includes('situacao') ||
    normalizedHeader.includes('status')
  ) {
    return 'status';
  }

  if (
    normalizedHeader.includes('valor') ||
    normalizedHeader.includes('mensalidade') ||
    normalizedHeader.includes('preco') ||
    normalizedHeader.includes('custo')
  ) {
    return 'value';
  }

  return normalizedHeader;
}
