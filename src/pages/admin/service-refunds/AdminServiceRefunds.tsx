import { useEffect, useState } from "react"
import { AdminService } from "../../../services/admin.service"

interface ServiceRequest {
  id: number
  amount: number
  status: "IN_PROGRESS" | "COMPLETED" | "REJECTED"
  createdAt: string
  user: {
    id: number
    phone: string
    publicId: string
  }
  plan: {
    id: number
    name: string
    price: number
    partner: {
      id: number
      name: string
    }
  }
}

interface RefundStats {
  inProgress: number
  completed: number
  rejected: number
}

export default function AdminServiceRefunds() {

  const [data, setData] = useState<ServiceRequest[]>([])
  const [stats, setStats] = useState<RefundStats | null>(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      const res = await AdminService.getServiceRefunds({
        status: statusFilter || undefined
      })

      setData(res.data || [])
    } catch (err: any) {
      setError(err?.response?.data?.error || "Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await AdminService.getServiceRefundStats()
      setStats(res)
    } catch {
      setStats(null)
    }
  }

  async function handleRefund(id: number) {

    const confirmStep1 = window.confirm(
      "Tem certeza que deseja cancelar e reembolsar este serviço?"
    )

    if (!confirmStep1) return

    const confirmStep2 = window.confirm(
      "⚠ Esta operação é irreversível. Confirmar novamente?"
    )

    if (!confirmStep2) return

    try {
      setActionLoading(id)
      await AdminService.refundService(id)
      await fetchData()
      await fetchStats()
    } catch (err: any) {
      alert(err?.response?.data?.error || "Falha no reembolso")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [statusFilter])

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold text-white">
        Service Refund Management
      </h1>

      {error && (
        <div className="bg-red-900 border border-red-700 p-3 rounded text-red-300">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl">
            <p className="text-gray-300 text-sm">Em Andamento</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.inProgress}
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl">
            <p className="text-gray-300 text-sm">Concluídos</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.completed}
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl">
            <p className="text-gray-300 text-sm">
              Rejeitados / Reembolsados
            </p>
            <p className="text-2xl font-bold text-red-400">
              {stats.rejected}
            </p>
          </div>

        </div>
      )}

      <div>
        <select
          className="bg-gray-800 border border-gray-700 p-2 rounded text-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">

        <table className="w-full text-sm text-white">

          <thead className="bg-gray-800 text-gray-200">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Usuário</th>
              <th className="p-3 text-left">Parceiro</th>
              <th className="p-3 text-left">Plano</th>
              <th className="p-3 text-left">Valor</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Ação</th>
            </tr>
          </thead>

          <tbody>

            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}

            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-800 hover:bg-gray-800 transition"
              >

                <td className="p-3">{item.id}</td>

                <td className="p-3">
                  {item.user.phone}
                </td>

                <td className="p-3">
                  {item.plan.partner.name}
                </td>

                <td className="p-3">
                  {item.plan.name}
                </td>

                <td className="p-3">
                  {item.amount.toFixed(2)} AOA
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === "IN_PROGRESS"
                        ? "bg-yellow-600"
                        : item.status === "COMPLETED"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="p-3">
                  {item.status === "IN_PROGRESS" && (
                    <button
                      disabled={actionLoading === item.id}
                      onClick={() => handleRefund(item.id)}
                      className="bg-red-600 px-3 py-1 rounded text-xs hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {actionLoading === item.id
                        ? "Processando..."
                        : "Cancelar & Reembolsar"}
                    </button>
                  )}
                </td>

              </tr>
            ))}

          </tbody>
        </table>

        {loading && (
          <div className="p-4 text-center text-gray-400">
            Carregando...
          </div>
        )}

      </div>

    </div>
  )
}
