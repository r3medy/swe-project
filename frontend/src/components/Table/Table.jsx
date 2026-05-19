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
          {/* (rendering-conditional-render) Ternary instead of && */}
          {rows?.length > 0 ? (
            rows.map((row, rowIndex) => {
              const rowId = row?.id ?? rowIndex;
              const cells = Array.isArray(row) ? row : row?.cells ?? [];
              return (
                <tr key={rowId}>
                  {cells.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={headers?.length || 1}
                className="table-empty-cell"
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
