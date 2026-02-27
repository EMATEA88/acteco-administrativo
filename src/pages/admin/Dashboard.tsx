import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"

type DashboardData = {
  totalUsers: number
  totalRecharges: number
  totalWithdrawals: number
  totalBalance: number
  totalInvested?: number
}

export default function AdminDashboard() {

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const res = await AdminService.dashboard()

      setData({
        totalUsers: res.totalUsers ?? 0,
        totalRecharges: res.totalRecharges ?? 0,
        totalWithdrawals: res.totalWithdrawals ?? 0,
        totalBalance: res.totalBalance ?? 0,
        totalInvested: res.totalInvested ?? 0
      })

    } catch (err) {
      console.error("Dashboard error", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Carregando dashboard...</div>
  }

  if (!data) {
    return <div className="p-6 text-red-500">Erro ao carregar dashboard</div>
  }

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-bold text-white">
        Admin Financial Overview
      </h1>

      {/* ================= KPIs ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

        <KpiCard
          title="Total Usuários"
          value={data.totalUsers}
          color="text-blue-400"
        />

        <KpiCard
          title="Total Depósitos"
          value={data.totalRecharges}
          money
          color="text-green-400"
        />

        <KpiCard
          title="Total Levantamentos"
          value={data.totalWithdrawals}
          money
          color="text-red-400"
        />

        <KpiCard
          title="Saldo Geral"
          value={data.totalBalance}
          money
          color="text-yellow-400"
        />

        {data.totalInvested !== undefined && (
          <KpiCard
            title="Total Investido"
            value={data.totalInvested}
            money
            color="text-purple-400"
          />
        )}

      </div>

      {/* ================= RESUMO FINANCEIRO ================= */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">

        <h2 className="text-lg font-semibold mb-4 text-gray-300">
          Resumo Financeiro
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <MiniCard
            label="Fluxo Entrada"
            value={data.totalRecharges}
            color="text-green-400"
          />

          <MiniCard
            label="Fluxo Saída"
            value={data.totalWithdrawals}
            color="text-red-400"
          />

          <MiniCard
            label="Capital Atual"
            value={data.totalBalance}
            color="text-yellow-400"
          />

        </div>
      </div>

    </div>
  )
}

/* ================= COMPONENTES ================= */

function KpiCard({
  title,
  value,
  money,
  color
}: {
  title: string
  value: number
  money?: boolean
  color?: string
}) {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
      <p className="text-sm text-gray-400">{title}</p>
      <h2 className={`text-2xl font-bold mt-3 ${color}`}>
        {money ? formatMoney(value) : value}
      </h2>
    </div>
  )
}

function MiniCard({
  label,
  value,
  color
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-xl font-semibold mt-2 ${color}`}>
        {formatMoney(value)}
      </p>
    </div>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2
  }).format(value ?? 0)
}