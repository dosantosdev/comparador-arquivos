import { useState } from 'react';
import './App.css';
import ComparisonResult from './components/ComparisonResult';
import ComparisonSummary from './components/ComparisonSummary';
import ComparisonDetails from './components/ComparisonDetails';
import { readExcelFile } from './services/excelReader';
import type {
  ComparisonResult as ComparisonResultType,
  Employee,
} from './types/comparison';
import { compareEmployees } from './services/comparator';

function App() {
  const [previousFile, setPreviousFile] = useState<File | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [previousData, setPreviousData] = useState<Employee[]>([]);
  const [currentData, setCurrentData] = useState<Employee[]>([]);
  const [comparison, setComparison] = useState<ComparisonResultType | null>(
    null,
  );

  function handlePreviousFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setPreviousFile(file);
  }

  function handleCurrentFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setCurrentFile(file);
  }

  async function handleCompare() {
    if (!previousFile || !currentFile) {
      return;
    }

    try {
      const previousRows = await readExcelFile(previousFile);
      const currentRows = await readExcelFile(currentFile);

      const result = compareEmployees(previousRows, currentRows);

      setPreviousData(previousRows);
      setCurrentData(currentRows);
      setComparison(result);
      setShowResult(true);
    } catch (error) {
      console.error('Erro ao comparar os arquivos:', error);
    }
  }

  return (
    <main className="app">
      <header className="header">
        <h1>Comparador de Arquivos</h1>

        <p>
          Compare dois arquivos e identifique o que foi adicionado, removido ou
          alterado.
        </p>
      </header>

      <section className="upload-section">
        <div className="file-card">
          <h2>Arquivo anterior</h2>

          <p>Selecione o arquivo utilizado anteriormente.</p>

          <input
            id="previous-file"
            type="file"
            accept=".xlsx,.csv"
            onChange={handlePreviousFile}
            hidden
          />

          <label htmlFor="previous-file" className="file-button">
            Selecionar arquivo
          </label>

          {previousFile && (
            <p className="selected-file">📄 {previousFile.name}</p>
          )}
        </div>

        <div className="file-card">
          <h2>Arquivo atual</h2>

          <p>Selecione o arquivo que deseja comparar.</p>

          <input
            id="current-file"
            type="file"
            accept=".xlsx,.csv"
            onChange={handleCurrentFile}
            hidden
          />

          <label htmlFor="current-file" className="file-button">
            Selecionar arquivo
          </label>

          {currentFile && (
            <p className="selected-file">📄 {currentFile.name}</p>
          )}
        </div>
      </section>

      <button
        className="compare-button"
        type="button"
        disabled={!previousFile || !currentFile}
        onClick={handleCompare}
      >
        Comparar arquivos
      </button>

      {showResult && comparison && (
        <>
          <ComparisonSummary comparison={comparison} />

          <ComparisonDetails comparison={comparison} />

          <ComparisonResult
            previousData={previousData}
            currentData={currentData}
          />
        </>
      )}
    </main>
  );
}

export default App;
