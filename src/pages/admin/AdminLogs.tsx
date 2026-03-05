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
    return (
      <div className="p-8 text-gray-400">
        Carregando logs...
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 text-white">

      <h1 className="text-3xl font-bold tracking-tight">
        Logs Administrativos
      </h1>

      {/* ================= FILTERS ================= */}

      <div className="flex flex-wrap gap-4">

        <input
          placeholder="Filtrar por ação"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="
            bg-gray-900
            border border-gray-700
            px-4 py-2
            rounded-lg
            w-64
            focus:outline-none
            focus:border-emerald-500
          "
        />

        <input
          placeholder="Filtrar por entidade"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="
            bg-gray-900
            border border-gray-700
            px-4 py-2
            rounded-lg
            w-64
            focus:outline-none
            focus:border-emerald-500
          "
        />

        <button
          onClick={applyFilters}
          className="
            bg-emerald-600
            hover:bg-emerald-700
            text-white
            px-5 py-2
            rounded-lg
            transition
          "
        >
          Aplicar
        </button>

      </div>

      {/* ================= TABLE ================= */}

      <div className="
        bg-gray-950
        border border-gray-800
        rounded-2xl
        shadow-xl
        overflow-x-auto
      ">

        <table className="w-full text-sm">

          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Admin</th>
              <th className="p-4 text-left">Ação</th>
              <th className="p-4 text-left">Entidade</th>
              <th className="p-4 text-left">Data</th>
              <th className="p-4 text-left">Detalhes</th>
            </tr>
          </thead>

          <tbody>

            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Nenhum log encontrado
                </td>
              </tr>
            )}

            {items.map((log) => (
              <tr
                key={log.id}
                className="
                  border-t border-gray-800
                  hover:bg-gray-800/40
                  transition duration-200
                "
              >

                <td className="p-4 text-gray-400 text-xs">
                  #{log.id}
                </td>

                <td className="p-4 font-medium">
                  {log.admin?.phone || "-"}
                </td>

                <td className="p-4">
                  <span className="
                    px-3 py-1 rounded-full
                    text-xs font-semibold
                    bg-indigo-600/20 text-indigo-400
                  ">
                    {log.action}
                  </span>
                </td>

                <td className="p-4 text-gray-300">
                  {log.entity || "-"}
                  {log.entityId && (
                    <span className="text-gray-500 ml-2 text-xs">
                      #{log.entityId}
                    </span>
                  )}
                </td>

                <td className="p-4 text-gray-500 text-xs">
                  {new Date(log.createdAt).toLocaleString("pt-AO")}
                </td>

                <td className="p-4">
                  {log.metadata ? (
                    <pre className="
                      text-xs
                      bg-gray-900
                      border border-gray-800
                      p-3
                      rounded-xl
                      max-w-xs
                      overflow-auto
                      text-gray-400
                    ">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* ================= PAGINATION ================= */}

      <div className="
        flex justify-between items-center
        text-sm text-gray-400
      ">

        <span>
          Página {page} de {totalPages}
        </span>

        <div className="flex gap-3">

          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="
              px-4 py-2
              rounded-lg
              bg-gray-900
              hover:bg-gray-800
              disabled:opacity-40
              transition
            "
          >
            Anterior
          </button>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="
              px-4 py-2
              rounded-lg
              bg-gray-900
              hover:bg-gray-800
              disabled:opacity-40
              transition
            "
          >
            Próxima
          </button>

        </div>

      </div>

    </div>
  )
}