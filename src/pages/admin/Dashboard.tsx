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
      setData(res)
    } catch (err) {
      console.error("Dashboard error", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Carregando dashboard...</div>
  }

  if (!data) {
    return <div className="p-6">Erro ao carregar dashboard</div>
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Dashboard Admin
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

        <Card title="Usuários" value={data.totalUsers} />

        <Card title="Recharges" value={data.totalRecharges} money />

        <Card title="Withdrawals" value={data.totalWithdrawals} money />

        <Card title="Balance Total" value={data.totalBalance} money />

        {data.totalInvested !== undefined && (
          <Card title="Investido" value={data.totalInvested} money />
        )}

      </div>

    </div>
  )
}

function Card({
  title,
  value,
  money
}: {
  title: string
  value: number
  money?: boolean
}) {
  return (
    <div className="bg-white shadow rounded-xl p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold mt-2">
        {money ? formatMoney(value) : value}
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
