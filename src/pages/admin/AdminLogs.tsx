import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"
import type { AdminLogItem } from "../../services/admin.service"

export default function AdminLogs() {

  const [items, setItems] = useState<AdminLogItem[]>([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [actionFilter, setActionFilter] = useState("")
  const [entityFilter, setEntityFilter] = useState("")

  async function load() {
    try {
      setLoading(true)

      const res = await AdminService.logs(
        page,
        20,
        actionFilter || undefined,
        entityFilter || undefined
      )

      setItems(res.items)
      setTotalPages(res.totalPages)

    } catch (err) {
      console.error("Erro ao carregar logs", err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page])

  function applyFilters() {
    setPage(1)
    load()
  }

  if (loading) {
    return <div className="p-6 text-gray-500">Carregando logs...</div>
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Logs Administrativos
      </h1>

      {/* ================= FILTERS ================= */}

      <div className="flex gap-4">

        <input
          placeholder="Filtrar por ação"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />

        <input
          placeholder="Filtrar por entidade"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />

        <button
          onClick={applyFilters}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Aplicar
        </button>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Admin</th>
              <th className="p-3">Ação</th>
              <th className="p-3">Entidade</th>
              <th className="p-3">Data</th>
              <th className="p-3">Detalhes</th>
            </tr>
          </thead>

          <tbody>

            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Nenhum log encontrado
                </td>
              </tr>
            )}

            {items.map((log) => (
              <tr key={log.id} className="border-t hover:bg-gray-50">

                <td className="p-3">{log.id}</td>

                <td className="p-3">
                  {log.admin?.phone || "-"}
                </td>

                <td className="p-3 font-medium text-indigo-600">
                  {log.action}
                </td>

                <td className="p-3">
                  {log.entity || "-"}
                  {log.entityId && (
                    <span className="text-gray-500 ml-1">
                      #{log.entityId}
                    </span>
                  )}
                </td>

                <td className="p-3">
                  {new Date(log.createdAt).toLocaleString()}
                </td>

                <td className="p-3">
                  {log.metadata ? (
                    <pre className="text-xs bg-gray-100 p-2 rounded max-w-xs overflow-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  ) : (
                    "-"
                  )}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* ================= PAGINATION ================= */}

      <div className="flex justify-between items-center">

        <span className="text-sm text-gray-500">
          Página {page} de {totalPages}
        </span>

        <div className="flex gap-2">

          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Próxima
          </button>

        </div>

      </div>

    </div>
  )
}