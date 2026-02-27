import { useEffect, useState } from "react"
import { AdminService } from "../../../services/admin.service"

interface Settlement {
  id: number
  grossAmount: number
  commission: number
  netAmount: number
  status: "PENDING" | "PAID"
  createdAt: string
  paidAt?: string
  partner: {
    id: number
    name: string
    email?: string
  }
  service: {
    id: number
    name: string
  }
}

interface SettlementStats {
  pendingCount: number
  paidCount: number
  totalPendingAmount: number
  totalPaidAmount: number
}

export default function AdminSettlements() {

  const [data, setData] = useState<Settlement[]>([])
  const [stats, setStats] = useState<SettlementStats | null>(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(false)

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)

  async function fetchData() {
    try {
      setLoading(true)
      const res = await AdminService.getSettlements({
        status: statusFilter || undefined
      })
      setData(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    const res = await AdminService.getSettlementStats()
    setStats(res)
  }

  async function handlePay(id: number) {
    if (!confirm("Confirmar pagamento deste settlement?")) return
    await AdminService.paySettlement(id)
    await fetchData()
    await fetchStats()
  }

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [statusFilter])

  return (
    <div className="p-6 space-y-6 text-white">

      <h1 className="text-3xl font-bold tracking-tight">
        Partner Settlements
      </h1>

      {/* ================= STATS ================= */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg">
            <p className="text-gray-400 text-sm">Pendentes</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">
              {stats.pendingCount}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg">
            <p className="text-gray-400 text-sm">Total Pendentes</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">
              {formatMoney(stats.totalPendingAmount ?? 0)} AOA
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg">
            <p className="text-gray-400 text-sm">Pagos</p>
            <p className="text-3xl font-bold text-green-400 mt-1">
              {stats.paidCount}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg">
            <p className="text-gray-400 text-sm">Total Pago</p>
            <p className="text-3xl font-bold text-green-400 mt-1">
              {formatMoney(stats.totalPaidAmount ?? 0)} AOA
            </p>
          </div>

        </div>
      )}

      {/* ================= FILTER ================= */}
      <div>
        <select
          className="bg-gray-900 border border-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendentes</option>
          <option value="PAID">Pagos</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-x-auto shadow-xl">

        <table className="w-full text-sm text-white">

          <thead className="bg-gray-900 text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Partner</th>
              <th className="p-4 text-left">Service</th>
              <th className="p-4 text-left">Gross</th>
              <th className="p-4 text-left text-red-400">Commission</th>
              <th className="p-4 text-left text-green-400">Net</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>

            {data.map((s) => (
              <tr
                key={s.id}
                className="border-b border-gray-800 hover:bg-gray-800/40 transition duration-150"
              >
                <td className="p-4 font-semibold">{s.id}</td>
                <td className="p-4 font-medium text-white">
                  {s.partner.name}
                </td>
                <td className="p-4 text-gray-300">
                  {s.service.name}
                </td>

                <td className="p-4 text-gray-200">
                  {formatMoney(s.grossAmount)} AOA
                </td>

                <td className="p-4 text-red-400 font-semibold">
                  {formatMoney(s.commission)} AOA
                </td>

                <td className="p-4 text-green-400 font-semibold">
                  {formatMoney(s.netAmount)} AOA
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      s.status === "PENDING"
                        ? "bg-yellow-600 text-white"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>

                <td className="p-4">
                  {s.status === "PENDING" && (
                    <button
                      onClick={() => handlePay(s.id)}
                      className="bg-blue-600 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      Pagar
                    </button>
                  )}
                </td>
              </tr>
            ))}

          </tbody>
        </table>

        {loading && (
          <div className="p-6 text-center text-gray-400">
            Carregando...
          </div>
        )}

      </div>

    </div>
  )
}
