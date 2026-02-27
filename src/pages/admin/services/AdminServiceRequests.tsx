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

export default function AdminServiceRequests() {

  const [data, setData] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  async function fetchData() {
    try {
      setLoading(true)
      const res = await AdminService.getServiceRequests()
      setData(res.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(id: number) {
    const confirmStep = window.confirm(
      "Confirmar conclusão do serviço?"
    )

    if (!confirmStep) return

    try {
      setActionLoading(id)
      await AdminService.completeService(id)
      await fetchData()
    } catch (error) {
      alert("Falha ao concluir serviço")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Service Requests
      </h1>

      <div className="bg-gray-900 rounded-xl overflow-x-auto">

        <table className="w-full text-sm text-white">

          <thead className="bg-gray-800 text-gray-200">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Partner</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
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

            {data.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-800 hover:bg-gray-800 transition"
              >

                <td className="p-3">{r.id}</td>

                <td className="p-3">
                  {r.user.phone}
                </td>

                <td className="p-3">
                  {r.plan.partner.name}
                </td>

                <td className="p-3">
                  {r.plan.name}
                </td>

                <td className="p-3">
                  {r.amount.toFixed(2)} AOA
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      r.status === "IN_PROGRESS"
                        ? "bg-yellow-600"
                        : r.status === "COMPLETED"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>

                <td className="p-3">
                  {r.status === "IN_PROGRESS" && (
                    <button
                      disabled={actionLoading === r.id}
                      onClick={() => handleComplete(r.id)}
                      className="bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {actionLoading === r.id
                        ? "Processando..."
                        : "Complete"}
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
