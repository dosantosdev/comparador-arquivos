type ComparisonResultProps = {
  previousFile: File | null;
  currentFile: File | null;
};

function ComparisonResult({
  previousFile,
  currentFile,
}: ComparisonResultProps) {
  if (!previousFile || !currentFile) {
    return null;
  }

  return (
    <section className="result-section">
      <h2>Arquivos selecionados</h2>

      <div className="result-files">
        <div>
          <strong>Arquivo anterior:</strong>
          <p>{previousFile.name}</p>
        </div>

        <div>
          <strong>Arquivo atual:</strong>
          <p>{currentFile.name}</p>
        </div>
      </div>
    </section>
  );
}

export default ComparisonResult;
