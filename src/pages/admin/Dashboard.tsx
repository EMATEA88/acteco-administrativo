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

  if (loading)
    return (
      <div className="p-10 text-gray-400">
        Carregando dashboard...
      </div>
    )

  if (!data)
    return (
      <div className="p-10 text-red-500">
        Erro ao carregar dashboard
      </div>
    )

  return (
    <div className="p-10 space-y-12">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Financial Overview
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Painel institucional de métricas financeiras
        </p>
      </div>

      {/* ================= KPIs ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

        <KpiCard
          title="Total Usuários"
          value={data.totalUsers}
          accent="blue"
        />

        <KpiCard
          title="Total Depósitos"
          value={data.totalRecharges}
          money
          accent="green"
        />

        <KpiCard
          title="Total Levantamentos"
          value={data.totalWithdrawals}
          money
          accent="red"
        />

        <KpiCard
          title="Saldo Geral"
          value={data.totalBalance}
          money
          accent="yellow"
        />

        {data.totalInvested !== undefined && (
          <KpiCard
            title="Total Investido"
            value={data.totalInvested}
            money
            accent="purple"
          />
        )}

      </div>

      {/* ================= RESUMO FINANCEIRO ================= */}
      <div
        className="
          bg-[#14171A]
          border border-[#1E2329]
          rounded-2xl
          p-8
        "
      >

        <h2 className="text-lg font-semibold text-white mb-6">
          Resumo Financeiro
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <MiniCard
            label="Fluxo Entrada"
            value={data.totalRecharges}
            accent="green"
          />

          <MiniCard
            label="Fluxo Saída"
            value={data.totalWithdrawals}
            accent="red"
          />

          <MiniCard
            label="Capital Atual"
            value={data.totalBalance}
            accent="yellow"
          />

        </div>
      </div>

    </div>
  )
}

/* ================= KPI CARD ================= */

function KpiCard({
  title,
  value,
  money,
  accent
}: {
  title: string
  value: number
  money?: boolean
  accent?: "blue" | "green" | "red" | "yellow" | "purple"
}) {

  const accentMap: Record<string, string> = {
    blue: "text-blue-400",
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-[#FCD535]",
    purple: "text-purple-400"
  }

  return (
    <div
      className="
        bg-[#14171A]
        border border-[#1E2329]
        rounded-2xl
        p-6
        hover:bg-[#181C21]
        hover:scale-[1.02]
        transition
      "
    >
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h2 className={`text-3xl font-semibold mt-4 ${accentMap[accent || "blue"]}`}>
        {money ? formatMoney(value) : value}
      </h2>
    </div>
  )
}

/* ================= MINI CARD ================= */

function MiniCard({
  label,
  value,
  accent
}: {
  label: string
  value: number
  accent?: "green" | "red" | "yellow"
}) {

  const accentMap: Record<string, string> = {
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-[#FCD535]"
  }

  return (
    <div
      className="
        bg-[#1A1F24]
        border border-[#1E2329]
        rounded-xl
        p-6
        hover:bg-[#20252B]
        transition
      "
    >
      <p className="text-gray-400 text-sm">
        {label}
      </p>

      <p className={`text-xl font-semibold mt-3 ${accentMap[accent || "green"]}`}>
        {formatMoney(value)}
      </p>
    </div>
  )
}

/* ================= FORMAT ================= */

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2
  }).format(value ?? 0)
}