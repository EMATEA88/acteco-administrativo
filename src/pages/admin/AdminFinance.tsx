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

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  if (!data) {
    return <div className="p-6 text-red-500">Erro ao carregar dados</div>
  }

  const chartData = [
    {
      name: "Recharges",
      value: data.totalRecharges
    },
    {
      name: "Withdrawals",
      value: data.totalWithdrawals
    }
  ]

  const netFlow = data.totalRecharges - data.totalWithdrawals

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-bold">
        Finance Overview
      </h1>

      {/* ===== CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

        <Card title="Users" value={data.totalUsers} />

        <Card title="Balance Total" value={formatMoney(data.totalBalance)} />

        <Card title="Recharges" value={formatMoney(data.totalRecharges)} />

        <Card title="Withdrawals" value={formatMoney(data.totalWithdrawals)} />

        <Card
          title="Net Flow"
          value={formatMoney(netFlow)}
          highlight={netFlow >= 0}
        />

      </div>

      {/* ===== CHART ===== */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="font-semibold mb-4">
          Financial Movement
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: any) =>
                formatMoney(Number(value ?? 0))
              }
            />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  )
}

function Card({
  title,
  value,
  highlight
}: {
  title: string
  value: any
  highlight?: boolean
}) {
  return (
    <div
      className={`bg-white shadow rounded-xl p-5 ${
        highlight !== undefined
          ? highlight
            ? "border-l-4 border-green-500"
            : "border-l-4 border-red-500"
          : ""
      }`}
    >
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold mt-2">
        {value}
      </h2>
    </div>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA"
  }).format(value)
}