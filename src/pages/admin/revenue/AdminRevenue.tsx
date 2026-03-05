import { useEffect, useState } from "react"
import { AdminRevenueService } from "../../../services/admin.revenue.service"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

type RevenueStats = {
  totalRevenue: number
  totalCommission: number
  netRevenue: number
}

type MonthlyItem = {
  month: string
  revenue: number
}

export default function AdminRevenue() {

  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [monthly, setMonthly] = useState<MonthlyItem[]>([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [year])

  async function load() {
    try {
      setLoading(true)

      const [statsRes, monthlyRes] =
        await Promise.all([
          AdminRevenueService.stats(),
          AdminRevenueService.monthly(year)
        ])

      setStats(statsRes)
      setMonthly(monthlyRes ?? [])

    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <div className="p-10 text-gray-400">
        Carregando módulo Revenue...
      </div>
    )

  if (!stats)
    return (
      <div className="p-10 text-red-500">
        Erro ao carregar dados
      </div>
    )

  return (
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Revenue Control Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gestão institucional de receitas
          </p>
        </div>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="
            bg-[#14171A]
            border border-[#1E2329]
            text-white
            rounded-lg
            px-4 py-2
          "
        >
          {[2023, 2024, 2025].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-3 gap-6">

        <KpiCard
          title="Total Revenue"
          value={formatMoney(stats.totalRevenue)}
          color="text-green-400"
        />

        <KpiCard
          title="Total Commission"
          value={formatMoney(stats.totalCommission)}
          color="text-yellow-400"
        />

        <KpiCard
          title="Net Revenue"
          value={formatMoney(stats.netRevenue)}
          color="text-blue-400"
        />

      </div>

      {/* CHART */}
      <div className="
        bg-[#14171A]
        border border-[#1E2329]
        rounded-2xl
        p-8
      ">

        <h2 className="text-white font-semibold mb-6">
          Monthly Revenue
        </h2>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthly}>

            <CartesianGrid
              stroke="#1E2329"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              stroke="#6B7280"
            />

            <YAxis
              stroke="#6B7280"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1F24",
                border: "1px solid #2B3139",
                borderRadius: "12px",
                color: "#fff"
              }}
              formatter={(value: any) =>
                formatMoney(Number(value ?? 0))
              }
            />

            <Bar
              dataKey="revenue"
              radius={[6, 6, 0, 0]}
              fill="#FCD535"
            />

          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  )
}

/* ================= KPI CARD ================= */

function KpiCard({
  title,
  value,
  color
}: {
  title: string
  value: string
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

      <h2 className={`text-2xl font-semibold mt-3 ${color}`}>
        {value}
      </h2>
    </div>
  )
}

/* ================= FORMAT ================= */

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2
  }).format(Number(value ?? 0))
}