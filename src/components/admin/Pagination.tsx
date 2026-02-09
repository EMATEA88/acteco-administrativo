type Props = {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <div className="flex gap-2 justify-end mt-4">
      <button
        className="btn"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Anterior
      </button>

      <span className="px-3 py-2 text-sm">
        {page} / {totalPages}
      </span>

      <button
        className="btn"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        Próxima
      </button>
    </div>
  )
}
