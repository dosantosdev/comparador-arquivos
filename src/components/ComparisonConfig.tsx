type ComparisonConfigProps = {
  fields: string[];
  selectedIdentifier: string;
  onIdentifierChange: (field: string) => void;
  onCompare: () => void;
};

const fieldLabels: Record<string, string> = {
  name: 'Nome',
  cpf: 'CPF',
  admissionDate: 'Data de admissão',
  dismissalDate: 'Data de demissão',
  plan: 'Plano',
  status: 'Situação',
  value: 'Valor',
};

function formatFieldLabel(field: string): string {
  return fieldLabels[field] ?? field;
}

function ComparisonConfig({
  fields,
  selectedIdentifier,
  onIdentifierChange,
  onCompare,
}: ComparisonConfigProps) {
  return (
    <section className="comparison-config">
      <h2>Configuração da comparação</h2>

      <div className="config-field">
        <label htmlFor="identifier-field">
          Qual campo identifica cada funcionário?
        </label>

        <select
          id="identifier-field"
          value={selectedIdentifier}
          onChange={(event) => onIdentifierChange(event.target.value)}
        >
          {fields.map((field) => (
            <option key={field} value={field}>
              {formatFieldLabel(field)}
            </option>
          ))}
        </select>

        <p>
          O campo selecionado será usado para identificar o mesmo funcionário
          nos dois arquivos.
        </p>
      </div>

      <button type="button" onClick={onCompare} disabled={!selectedIdentifier}>
        Comparar arquivos
      </button>
    </section>
  );
}

export default ComparisonConfig;
