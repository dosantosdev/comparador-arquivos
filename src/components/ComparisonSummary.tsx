import type { ComparisonResult } from '../types/comparison';

type ComparisonSummaryProps = {
  comparison: ComparisonResult;
};

function ComparisonSummary({ comparison }: ComparisonSummaryProps) {
  return (
    <div className="comparison-summary">
      <div className="summary-card added">
        <span className="summary-icon">+</span>
        <strong>{comparison.added.length}</strong>
        <span>Adicionados</span>
      </div>

      <div className="summary-card removed">
        <span className="summary-icon">−</span>
        <strong>{comparison.removed.length}</strong>
        <span>Removidos</span>
      </div>

      <div className="summary-card modified">
        <span className="summary-icon">~</span>
        <strong>{comparison.modified.length}</strong>
        <span>Alterados</span>
      </div>

      <div className="summary-card unchanged">
        <span className="summary-icon">✓</span>
        <strong>{comparison.unchanged.length}</strong>
        <span>Sem alteração</span>
      </div>
    </div>
  );
}

export default ComparisonSummary;
