type ComparisonConfigProps = {
  fields: string[];
  selectedIdentifier: string;
  selectedFields: string[];
  onIdentifierChange: (field: string) => void;
  onFieldToggle: (field: string) => void;
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
  selectedFields,
  onIdentifierChange,
  onFieldToggle,
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

      <div className="config-field">
        <span className="config-label">Quais informações deseja comparar?</span>

        <div className="comparison-fields">
          {fields.map((field) => (
            <label className="comparison-field-option" key={field}>
              <input
                type="checkbox"
                checked={selectedFields.includes(field)}
                onChange={() => onFieldToggle(field)}
              />

              <span>{formatFieldLabel(field)}</span>
            </label>
          ))}
        </div>

        <p>
          Selecione as informações que devem ser verificadas entre os dois
          arquivos.
        </p>
      </div>

      <button
        type="button"
        onClick={onCompare}
        disabled={!selectedIdentifier || selectedFields.length === 0}
      >
        Comparar arquivos
      </button>
    </section>
  );
}

export default ComparisonConfig;
