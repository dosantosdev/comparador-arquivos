import type { ComparisonResult, Employee } from '../types/comparison';

type ComparisonDetailsProps = {
  comparison: ComparisonResult;
  previousFieldLabels: Record<string, string>;
  currentFieldLabels: Record<string, string>;
};

function formatDate(value: unknown): string {
  if (!value) {
    return '-';
  }

  const dateString = String(value);

  if (!dateString.includes('-')) {
    return dateString;
  }

  const [year, month, day] = dateString.split('-');

  return `${day}/${month}/${year}`;
}

function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    name: 'Nome',
    cpf: 'CPF',
    admissionDate: 'Data de admissão',
    dismissalDate: 'Data de demissão',
    status: 'Situação',
    plan: 'Plano',
    value: 'Valor',
  };

  return fieldNames[field] ?? field;
}

function getDisplayFieldName(
  field: string,
  previousFieldLabels: Record<string, string>,
  currentFieldLabels: Record<string, string>,
): string {
  return (
    currentFieldLabels[field] ??
    previousFieldLabels[field] ??
    formatFieldName(field)
  );
}

function formatValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (field === 'admissionDate' || field === 'dismissalDate') {
    return formatDate(value);
  }

  return String(value);
}

function EmployeeInfo({ employee }: { employee: Employee }) {
  return (
    <div className="employee-info">
      <strong>{employee.name ?? 'Nome não informado'}</strong>

      <span>CPF: {employee.cpf ?? 'Não informado'}</span>
    </div>
  );
}

function ComparisonDetails({
  comparison,
  previousFieldLabels,
  currentFieldLabels,
}: ComparisonDetailsProps) {
  return (
    <section className="comparison-details">
      <h2>Detalhes da comparação</h2>

      <section className="details-group added-group">
        <div className="details-header">
          <h3>Adicionados</h3>
          <span>{comparison.added.length}</span>
        </div>

        {comparison.added.length === 0 ? (
          <p className="empty-message">Nenhum funcionário foi adicionado.</p>
        ) : (
          <div className="employee-list">
            {comparison.added.map((employee, index) => (
              <article
                className="employee-card"
                key={`added-${employee.cpf}-${index}`}
              >
                <EmployeeInfo employee={employee} />

                <div className="employee-data">
                  <div>
                    <span>Data de admissão</span>
                    <strong>{formatDate(employee.admissionDate)}</strong>
                  </div>

                  <div>
                    <span>Data de demissão</span>
                    <strong>{formatDate(employee.dismissalDate)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="details-group removed-group">
        <div className="details-header">
          <h3>Removidos</h3>
          <span>{comparison.removed.length}</span>
        </div>

        {comparison.removed.length === 0 ? (
          <p className="empty-message">Nenhum funcionário foi removido.</p>
        ) : (
          <div className="employee-list">
            {comparison.removed.map((employee, index) => (
              <article
                className="employee-card"
                key={`removed-${employee.cpf}-${index}`}
              >
                <EmployeeInfo employee={employee} />

                <div className="employee-data">
                  <div>
                    <span>Data de admissão</span>
                    <strong>{formatDate(employee.admissionDate)}</strong>
                  </div>

                  <div>
                    <span>Data de demissão</span>
                    <strong>{formatDate(employee.dismissalDate)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="details-group modified-group">
        <div className="details-header">
          <h3>Alterados</h3>
          <span>{comparison.modified.length}</span>
        </div>

        {comparison.modified.length === 0 ? (
          <p className="empty-message">Nenhum funcionário teve alterações.</p>
        ) : (
          <div className="employee-list">
            {comparison.modified.map((modifiedEmployee, index) => (
              <article
                className="employee-card"
                key={`modified-${modifiedEmployee.employee.cpf}-${index}`}
              >
                <EmployeeInfo employee={modifiedEmployee.employee} />

                <div className="changes-list">
                  {modifiedEmployee.changes.map((change, changeIndex) => (
                    <div
                      className="change-item"
                      key={`${change.field}-${changeIndex}`}
                    >
                      <strong>
                        {getDisplayFieldName(
                          change.field,
                          previousFieldLabels,
                          currentFieldLabels,
                        )}
                      </strong>

                      <div className="change-values">
                        <div>
                          <span>Antes</span>

                          <strong>
                            {formatValue(change.field, change.oldValue)}
                          </strong>
                        </div>

                        <div>
                          <span>Depois</span>

                          <strong>
                            {formatValue(change.field, change.newValue)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default ComparisonDetails;
