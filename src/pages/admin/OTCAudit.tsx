import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"

export default function OtcAuditoria() {

  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const res = await AdminService.otcAudit()
    setLogs(res.items || [])
  }

  return (
    <div className="p-6">

      <h2 className="text-xl font-bold mb-4">
        Auditoria OTC
      </h2>

      <table className="w-full bg-white shadow rounded-xl text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3 text-left">Data</th>
            <th className="p-3 text-left">Admin</th>
            <th className="p-3 text-left">Ação</th>
            <th className="p-3 text-left">Entidade</th>
            <th className="p-3 text-left">ID</th>
          </tr>
        </thead>

        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-b">
              <td className="p-3">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="p-3">
                {log.admin?.phone || "Sistema"}
              </td>
              <td className="p-3">
                {log.action}
              </td>
              <td className="p-3">
                {log.entity}
              </td>
              <td className="p-3">
                {log.entityId}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}