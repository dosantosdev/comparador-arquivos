import type { Employee } from '../types/comparison';

type ComparisonResultProps = {
  previousData: Employee[];
  currentData: Employee[];
};

function ComparisonResult({
  previousData,
  currentData,
}: ComparisonResultProps) {
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
              <th>Nome</th>
              <th>CPF</th>
              <th>Data admissão</th>
              <th>Data demissão</th>
            </tr>
          </thead>

          <tbody>
            {previousData.map((employee, index) => (
              <tr key={`previous-${index}`}>
                <td>{employee.name ?? '-'}</td>
                <td>{employee.cpf ?? '-'}</td>
                <td>{employee.admissionDate ?? '-'}</td>
                <td>{employee.dismissalDate ?? '-'}</td>
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
              <th>Nome</th>
              <th>CPF</th>
              <th>Data admissão</th>
              <th>Data demissão</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((employee, index) => (
              <tr key={`current-${index}`}>
                <td>{employee.name ?? '-'}</td>
                <td>{employee.cpf ?? '-'}</td>
                <td>{employee.admissionDate ?? '-'}</td>
                <td>{employee.dismissalDate ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ComparisonResult;
