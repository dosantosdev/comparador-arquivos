import type { IdentifierIssue } from '../types/comparison';

type IdentifierIssuesProps = {
  issues: IdentifierIssue[];
};

function IdentifierIssues({ issues }: IdentifierIssuesProps) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <section className="identifier-issues">
      <div className="identifier-issues-header">
        <span className="identifier-issues-icon">!</span>

        <div>
          <h2>Atenção</h2>

          <p>
            {issues.length === 1
              ? 'Foi encontrado 1 registro que não pôde ser comparado corretamente.'
              : `Foram encontrados ${issues.length} registros que não puderam ser comparados corretamente.`}
          </p>
        </div>
      </div>

      <div className="identifier-issues-list">
        {issues.map((issue, index) => (
          <div
            className="identifier-issue"
            key={`${issue.row}-${issue.reason}-${index}`}
          >
            <strong>Linha {issue.row}</strong>

            <span>
              {issue.reason === 'missing'
                ? 'Identificador não informado.'
                : 'Identificador duplicado.'}
            </span>
          </div>
        ))}
      </div>

      <p className="identifier-issues-help">
        Esses registros não foram considerados na comparação para evitar
        resultados incorretos.
      </p>
    </section>
  );
}

export default IdentifierIssues;
