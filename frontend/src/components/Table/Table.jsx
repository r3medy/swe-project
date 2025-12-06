import "./Table.css";

function Table({ headers, rows, ...props }) {
  return (
    <div className="table-container">
      <table className="table" {...props}>
        <thead>
          <tr>
            {headers?.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.length > 0 ? (
            rows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {Array.isArray(row)
                  ? row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))
                  : null}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers?.length || 1}
                style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
