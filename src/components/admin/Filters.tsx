type Props = {
  status?: string
  onStatusChange?: (v: string) => void
}

export default function Filters({ status, onStatusChange }: Props) {
  return (
    <div className="flex gap-4 mb-4">
      {onStatusChange && (
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendente</option>
          <option value="APPROVED">Aprovado</option>
          <option value="SUCCESS">Sucesso</option>
        </select>
      )}
    </div>
  )
}
