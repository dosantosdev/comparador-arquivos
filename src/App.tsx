import { useState } from 'react';
import './App.css';
import ComparisonResult from './components/ComparisonResult';
import ComparisonSummary from './components/ComparisonSummary';
import ComparisonDetails from './components/ComparisonDetails';
import ComparisonConfig from './components/ComparisonConfig';
import IdentifierIssues from './components/IdentifierIssues';
import { getAvailableFields } from './utils/fieldUtils';
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

  const [previousFieldLabels, setPreviousFieldLabels] = useState<
    Record<string, string>
  >({});

  const [currentFieldLabels, setCurrentFieldLabels] = useState<
    Record<string, string>
  >({});

  const [comparison, setComparison] = useState<ComparisonResultType | null>(
    null,
  );

  const [selectedIdentifier, setSelectedIdentifier] = useState('cpf');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  function handlePreviousFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setPreviousFile(file);
  }

  function handleCurrentFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setCurrentFile(file);
  }

  function handleFieldToggle(field: string) {
    setSelectedFields((currentFields) => {
      if (currentFields.includes(field)) {
        return currentFields.filter((currentField) => currentField !== field);
      }

      return [...currentFields, field];
    });
  }

  async function handlePrepareComparison() {
    if (!previousFile || !currentFile) {
      return;
    }

    try {
      const previousResult = await readExcelFile(previousFile);
      const currentResult = await readExcelFile(currentFile);

      setPreviousData(previousResult.employees);
      setCurrentData(currentResult.employees);

      setPreviousFieldLabels(previousResult.fieldLabels);
      setCurrentFieldLabels(currentResult.fieldLabels);

      const fields = getAvailableFields(
        previousResult.employees,
        currentResult.employees,
      );

      setSelectedFields(fields);

      if (!fields.includes(selectedIdentifier)) {
        setSelectedIdentifier(fields[0] ?? '');
      }

      setShowConfig(true);
      setShowResult(false);
    } catch (error) {
      console.error('Erro ao preparar os arquivos:', error);
    }
  }

  function handleCompare() {
    if (
      previousData.length === 0 ||
      currentData.length === 0 ||
      !selectedIdentifier
    ) {
      return;
    }

    const result = compareEmployees(
      previousData,
      currentData,
      selectedIdentifier,
      selectedFields,
    );

    console.log('Resultado da comparação:', result);

    setComparison(result);
    setShowResult(true);
  }

  const availableFields = getAvailableFields(previousData, currentData);

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
        type="button"
        className="prepare-button"
        onClick={handlePrepareComparison}
        disabled={!previousFile || !currentFile}
      >
        Preparar comparação
      </button>

      {showConfig && availableFields.length > 0 && (
        <ComparisonConfig
          fields={availableFields}
          selectedIdentifier={selectedIdentifier}
          selectedFields={selectedFields}
          onIdentifierChange={setSelectedIdentifier}
          onFieldToggle={handleFieldToggle}
          onCompare={handleCompare}
        />
      )}

      {showResult && comparison && (
        <>
          <ComparisonSummary comparison={comparison} />

          <IdentifierIssues issues={comparison.identifierIssues} />

          <ComparisonDetails
            comparison={comparison}
            previousFieldLabels={previousFieldLabels}
            currentFieldLabels={currentFieldLabels}
          />

          <ComparisonResult
            previousData={previousData}
            currentData={currentData}
            previousFieldLabels={previousFieldLabels}
            currentFieldLabels={currentFieldLabels}
          />
        </>
      )}
    </main>
  );
}

export default App;
