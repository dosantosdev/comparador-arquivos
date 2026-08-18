import { useState } from 'react';
import './App.css';
import ComparisonResult from './components/ComparisonResult';
import ComparisonSummary from './components/ComparisonSummary';
import ComparisonDetails from './components/ComparisonDetails';
import ComparisonConfig from './components/ComparisonConfig';
import IdentifierIssues from './components/IdentifierIssues';
import { getAvailableFields } from './utils/fieldUtils';
import { readExcelFile } from './services/excelReader';
import { exportComparisonResult } from './services/exportService';
import { validateIdentifier } from './utils/comparisonValidator';
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [selectedIdentifier, setSelectedIdentifier] = useState('cpf');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  function handlePreviousFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setPreviousFile(file);
    setFileError(null);
  }

  function handleCurrentFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setCurrentFile(file);
    setFileError(null);
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

    setFileError(null);
    setValidationError(null);
    setShowResult(false);
    setComparison(null);

    try {
      const previousResult = await readExcelFile(previousFile);
      const currentResult = await readExcelFile(currentFile);

      if (previousResult.employees.length === 0) {
        setFileError(
          `O arquivo anterior "${previousFile.name}" não possui registros para comparação.`,
        );

        setShowConfig(false);

        return;
      }

      if (currentResult.employees.length === 0) {
        setFileError(
          `O arquivo atual "${currentFile.name}" não possui registros para comparação.`,
        );

        setShowConfig(false);

        return;
      }

      setPreviousData(previousResult.employees);
      setCurrentData(currentResult.employees);

      setPreviousFieldLabels(previousResult.fieldLabels);
      setCurrentFieldLabels(currentResult.fieldLabels);

      const fields = getAvailableFields(
        previousResult.employees,
        currentResult.employees,
      );

      if (fields.length === 0) {
        setFileError(
          'Não foi possível identificar campos válidos nos arquivos selecionados.',
        );

        setShowConfig(false);

        return;
      }

      setSelectedFields(fields);

      if (!fields.includes(selectedIdentifier)) {
        setSelectedIdentifier(fields[0] ?? '');
      }

      setShowConfig(true);
    } catch (error) {
      console.error('Erro ao preparar os arquivos:', error);

      setShowConfig(false);

      setFileError(
        'Não foi possível ler um dos arquivos selecionados. Verifique se os arquivos estão em um formato válido e tente novamente.',
      );
    }
  }

  function handleCompare() {
    const error = validateIdentifier(
      previousData,
      currentData,
      selectedIdentifier,
    );

    if (error) {
      setValidationError(error);
      setShowResult(false);
      setComparison(null);

      return;
    }

    setValidationError(null);

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

  function handleExport() {
    if (!comparison) {
      return;
    }

    exportComparisonResult(comparison, previousData, currentData);
  }

  function handleNewComparison() {
    setPreviousFile(null);
    setCurrentFile(null);

    setPreviousData([]);
    setCurrentData([]);

    setPreviousFieldLabels({});
    setCurrentFieldLabels({});

    setComparison(null);

    setValidationError(null);
    setFileError(null);

    setSelectedIdentifier('cpf');
    setSelectedFields([]);

    setShowConfig(false);
    setShowResult(false);
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

      {fileError && (
        <section className="file-error">
          <div className="file-error-icon">!</div>

          <div>
            <h3>Não foi possível preparar os arquivos</h3>

            <p>{fileError}</p>
          </div>
        </section>
      )}

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

      {validationError && (
        <section className="validation-error">
          <div className="validation-error-icon">!</div>

          <div>
            <h3>Não foi possível realizar a comparação</h3>

            <p>{validationError}</p>
          </div>
        </section>
      )}

      {showResult && comparison && (
        <>
          <div className="result-actions">
            <button
              type="button"
              className="export-button"
              onClick={handleExport}
            >
              Exportar resultado
            </button>

            <button
              type="button"
              className="new-comparison-button"
              onClick={handleNewComparison}
            >
              ↩ Fazer nova comparação
            </button>
          </div>

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
