import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"

export default function OtcAuditoria() {

  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    try {
      setLoading(true)
      const res = await AdminService.otcAudit()
      setLogs(res.logs || [])
    } catch (error) {
      console.error("Erro ao carregar auditoria:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10 space-y-8">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold text-white">
          Auditoria OTC
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Histórico de ações administrativas no módulo OTC
        </p>
      </div>

      {/* TABLE CARD */}
      <div className="bg-[#14171A] border border-[#1E2329] rounded-2xl overflow-hidden">

        {loading ? (
          <div className="p-10 text-gray-400">
            Carregando auditoria...
          </div>
        ) : (
          <table className="w-full text-sm text-gray-300">

            <thead className="bg-[#1A1F24] text-gray-400">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Data</th>
                <th className="px-6 py-4 text-left font-medium">Admin</th>
                <th className="px-6 py-4 text-left font-medium">Ação</th>
                <th className="px-6 py-4 text-left font-medium">Entidade</th>
                <th className="px-6 py-4 text-left font-medium">ID</th>
              </tr>
            </thead>

            <tbody>

              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Nenhum log encontrado
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="
                      border-t border-[#1E2329]
                      hover:bg-[#181C21]
                      transition
                    "
                  >
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      {log.admin?.phone || (
                        <span className="text-gray-500">
                          Sistema
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <ActionBadge action={log.action} />
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {log.entity || "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {log.entityId || "-"}
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        )}

      </div>
    </div>
  )
}

/* =========================
   BADGE PROFISSIONAL
========================= */

function ActionBadge({ action }: { action: string }) {

  const base =
    "px-3 py-1 text-xs rounded-full font-medium"

  if (!action)
    return (
      <span className={`${base} bg-[#1A1F24] text-gray-400`}>
        -
      </span>
    )

  if (action.toLowerCase().includes("create"))
    return (
      <span className={`${base} bg-green-900/40 text-green-400`}>
        {action}
      </span>
    )

  if (action.toLowerCase().includes("update"))
    return (
      <span className={`${base} bg-yellow-900/40 text-yellow-400`}>
        {action}
      </span>
    )

  if (action.toLowerCase().includes("delete"))
    return (
      <span className={`${base} bg-red-900/40 text-red-400`}>
        {action}
      </span>
    )

  return (
    <span className={`${base} bg-[#1A1F24] text-gray-300`}>
      {action}
    </span>
  )
}