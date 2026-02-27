import { useEffect, useState } from "react"
import { AdminRevenueService } from "../../../services/admin.revenue.service"

interface Revenue {
  id: number
  type: string
  amount: number
  reference?: string
  createdAt: string
}

export default function AdminRevenue() {

  const [data, setData] = useState<Revenue[]>([])
  const [stats, setStats] = useState<any>(null)
  const [monthly, setMonthly] = useState<any[]>([])
  const [typeFilter, setTypeFilter] = useState("")
  const [loading, setLoading] = useState(false)

  async function fetchData() {
    setLoading(true)

    const res =
      await AdminRevenueService.list({
        type: typeFilter || undefined
      })

    setData(res.data || [])
    setLoading(false)
  }

  async function fetchStats() {
    const res =
      await AdminRevenueService.stats()

    setStats(res)
  }

  async function fetchMonthly() {
    const year = new Date().getFullYear()

    const res =
      await AdminRevenueService.monthly(year)

    setMonthly(res)
  }

  useEffect(() => {
    fetchData()
    fetchStats()
    fetchMonthly()
  }, [typeFilter])

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Revenue Control
      </h1>

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm">
              Total Geral
            </p>
            <p className="text-3xl font-bold text-green-400">
              {(stats.total ?? 0).toFixed(2)} AOA
            </p>
          </div>

          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm">
              Tipos de Receita
            </p>
            <p className="text-xl font-bold text-blue-400">
              {stats.byType?.length ?? 0}
            </p>
          </div>

          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm">
              Registros
            </p>
            <p className="text-xl font-bold text-yellow-400">
              {data.length}
            </p>
          </div>

        </div>
      )}

      {/* FILTER */}
      <div>
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
          className="bg-gray-800 p-2 rounded border border-gray-700"
        >
          <option value="">Todos</option>
          <option value="SERVICE_COMMISSION">
            SERVICE_COMMISSION
          </option>
          <option value="INVESTMENT_PROFIT">
            INVESTMENT_PROFIT
          </option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 rounded-xl overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Valor</th>
              <th className="p-3 text-left">Referência</th>
              <th className="p-3 text-left">Data</th>
            </tr>
          </thead>

          <tbody>
            {data.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-800"
              >
                <td className="p-3">{r.id}</td>

                <td className="p-3">
                  <span className="px-2 py-1 rounded bg-blue-600 text-xs">
                    {r.type}
                  </span>
                </td>

                <td className="p-3 text-green-400 font-semibold">
                  {r.amount.toFixed(2)} AOA
                </td>

                <td className="p-3">
                  {r.reference || "-"}
                </td>

                <td className="p-3 text-gray-400">
                  {new Date(
                    r.createdAt
                  ).toLocaleString()}
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

      {/* MONTHLY SUMMARY */}
      <div className="bg-gray-900 p-5 rounded-xl border border-gray-700">
        <h2 className="text-lg font-bold mb-3">
          Receita Mensal
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">

          {monthly.map((m: any) => (
            <div
              key={m.month}
              className="bg-gray-800 p-3 rounded text-center"
            >
              <p className="text-sm text-gray-400">
                Mês {m.month}
              </p>
              <p className="text-green-400 font-bold">
                {Number(m.total).toFixed(2)} AOA
              </p>
            </div>
          ))}

        </div>
      </div>

    </div>
  )
}
