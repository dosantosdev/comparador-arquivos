import type { Employee } from '../types/comparison';

type ComparisonResultProps = {
  previousData: Employee[];
  currentData: Employee[];
};

const fieldLabels: Record<string, string> = {
  name: 'Nome',
  cpf: 'CPF',
  admissionDate: 'Data admissão',
  dismissalDate: 'Data demissão',
  plan: 'Plano',
  status: 'Situação',
  value: 'Valor',
};

function formatFieldLabel(field: string): string {
  return fieldLabels[field] ?? field;
}

function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  return String(value);
}

function ComparisonResult({
  previousData,
  currentData,
}: ComparisonResultProps) {
  const fields = Array.from(
    new Set([
      ...previousData.flatMap((employee) => Object.keys(employee)),
      ...currentData.flatMap((employee) => Object.keys(employee)),
    ]),
  );

  return (
    <section className="result-section">
      <h2>Dados encontrados</h2>

      <div className="result-files">
        <div>
          <strong>Arquivo anterior</strong>

          <p>{previousData.length} funcionários encontrados</p>
        </div>

        <div>
          <strong>Arquivo atual</strong>

          <p>{currentData.length} funcionários encontrados</p>
        </div>
      </div>

      <h3>Arquivo anterior</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field}>{formatFieldLabel(field)}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {previousData.map((employee, index) => (
              <tr key={`previous-${index}`}>
                {fields.map((field) => (
                  <td key={field}>{formatDisplayValue(employee[field])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Arquivo atual</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field}>{formatFieldLabel(field)}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentData.map((employee, index) => (
              <tr key={`current-${index}`}>
                {fields.map((field) => (
                  <td key={field}>{formatDisplayValue(employee[field])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ComparisonResult;
