import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

type FinanceData = {
  totalUsers: number
  totalRecharges: number
  totalWithdrawals: number
  totalBalance: number
  pendingWithdrawals: number
}

export default function AdminFinance() {

  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const res = await AdminService.finance()
      setData(res)
    } catch (err) {
      console.error("Finance error", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <div className="p-10 text-gray-400">
        Carregando módulo financeiro...
      </div>
    )

  if (!data)
    return (
      <div className="p-10 text-red-500">
        Erro ao carregar dados financeiros
      </div>
    )

  const chartData = [
    { name: "Recharges", value: data.totalRecharges ?? 0 },
    { name: "Withdrawals", value: data.totalWithdrawals ?? 0 }
  ]

  const netFlow =
    (data.totalRecharges ?? 0) -
    (data.totalWithdrawals ?? 0)

  return (
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Financial Control Center
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Monitoramento institucional de fluxo financeiro
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

        <Card title="Users" value={data.totalUsers} />

        <Card
          title="Total Balance"
          value={formatMoney(data.totalBalance)}
        />

        <Card
          title="Recharges"
          value={formatMoney(data.totalRecharges)}
          color="text-green-400"
        />

        <Card
          title="Withdrawals"
          value={formatMoney(data.totalWithdrawals)}
          color="text-red-400"
        />

        <Card
          title="Net Flow"
          value={formatMoney(netFlow)}
          highlight
          positive={netFlow >= 0}
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
          Financial Movement
        </h2>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>

            <CartesianGrid
              stroke="#1E2329"
              vertical={false}
            />

            <XAxis
              dataKey="name"
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
              dataKey="value"
              radius={[6, 6, 0, 0]}
              fill="#FCD535"
            />

          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  )
}

/* ================= CARD ================= */

function Card({
  title,
  value,
  color,
  highlight,
  positive
}: {
  title: string
  value: any
  color?: string
  highlight?: boolean
  positive?: boolean
}) {

  const border =
    highlight
      ? positive
        ? "border-green-500"
        : "border-red-500"
      : "border-[#1E2329]"

  return (
    <div className={`
      bg-[#14171A]
      border
      ${border}
      rounded-2xl
      p-6
      hover:bg-[#181C21]
      transition
    `}>
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h2 className={`
        text-2xl
        font-semibold
        mt-3
        ${color ?? "text-white"}
      `}>
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