type Column<T> = {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
}

/* =========================
   NESTED VALUE HELPER
========================= */

function getNestedValue(obj: any, path: string) {
  return path.split(".").reduce((acc, part) => acc?.[part], obj)
}

export default function DataTable<T>({
  columns,
  data,
}: Props<T>) {
  return (
    <div className="card overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {columns.map(c => (
              <th key={String(c.key)}>{c.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map(c => (
                <td key={String(c.key)}>
                  {c.render
                    ? c.render(row)
                    : getNestedValue(row, String(c.key))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}