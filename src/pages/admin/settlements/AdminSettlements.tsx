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
    new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 2
    }).format(value ?? 0)

  async function fetchData() {
    try {
      setLoading(true)
      const res = await AdminService.getSettlements({
        status: statusFilter || undefined
      })
      setData(res.data ?? [])
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
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Partner Settlements
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Controle institucional de pagamentos a parceiros
        </p>
      </div>

      {/* ================= STATS ================= */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          <StatCard
            title="Pendentes"
            value={stats.pendingCount}
            color="text-yellow-400"
          />

          <StatCard
            title="Total Pendentes"
            value={formatMoney(stats.totalPendingAmount)}
            color="text-yellow-400"
          />

          <StatCard
            title="Pagos"
            value={stats.paidCount}
            color="text-green-400"
          />

          <StatCard
            title="Total Pago"
            value={formatMoney(stats.totalPaidAmount)}
            color="text-green-400"
          />

        </div>
      )}

      {/* ================= FILTER ================= */}
      <div>
        <select
          className="
            bg-[#14171A]
            border border-[#1E2329]
            text-white
            px-4 py-2
            rounded-lg
            focus:outline-none
          "
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendentes</option>
          <option value="PAID">Pagos</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="
        bg-[#14171A]
        border border-[#1E2329]
        rounded-2xl
        overflow-x-auto
      ">

        <table className="w-full text-sm text-white">

          <thead className="border-b border-[#1E2329] text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-5 text-left">ID</th>
              <th className="p-5 text-left">Partner</th>
              <th className="p-5 text-left">Service</th>
              <th className="p-5 text-left">Gross</th>
              <th className="p-5 text-left">Commission</th>
              <th className="p-5 text-left">Net</th>
              <th className="p-5 text-left">Status</th>
              <th className="p-5 text-left">Ação</th>
            </tr>
          </thead>

          <tbody>

            {data.map((s) => (
              <tr
                key={s.id}
                className="
                  border-b border-[#1E2329]
                  hover:bg-[#181C21]
                  transition
                "
              >
                <td className="p-5 font-semibold">{s.id}</td>

                <td className="p-5">
                  <div className="font-medium">
                    {s.partner.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {s.partner.email}
                  </div>
                </td>

                <td className="p-5 text-gray-300">
                  {s.service.name}
                </td>

                <td className="p-5 text-gray-200">
                  {formatMoney(s.grossAmount)}
                </td>

                <td className="p-5 text-red-400 font-semibold">
                  {formatMoney(s.commission)}
                </td>

                <td className="p-5 text-green-400 font-semibold">
                  {formatMoney(s.netAmount)}
                </td>

                <td className="p-5">
                  <StatusBadge status={s.status} />
                </td>

                <td className="p-5">
                  {s.status === "PENDING" && (
                    <button
                      onClick={() => handlePay(s.id)}
                      className="
                        bg-[#FCD535]
                        text-black
                        px-4 py-1.5
                        rounded-lg
                        text-xs
                        font-semibold
                        hover:scale-105
                        transition
                      "
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

/* ================= COMPONENTS ================= */

function StatCard({
  title,
  value,
  color
}: {
  title: string
  value: any
  color: string
}) {
  return (
    <div className="
      bg-[#14171A]
      border border-[#1E2329]
      rounded-2xl
      p-6
      hover:bg-[#181C21]
      transition
    ">
      <p className="text-gray-400 text-sm">
        {title}
      </p>
      <p className={`text-2xl font-semibold mt-3 ${color}`}>
        {value}
      </p>
    </div>
  )
}

function StatusBadge({
  status
}: {
  status: "PENDING" | "PAID"
}) {

  const map: Record<string, string> = {
    PENDING: "bg-yellow-900/40 text-yellow-400",
    PAID: "bg-green-900/40 text-green-400"
  }

  return (
    <span className={`
      px-3 py-1
      rounded-full
      text-xs
      font-medium
      ${map[status]}
    `}>
      {status}
    </span>
  )
}