import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"

interface PriceHistoryItem {
  id: number
  assetId: number
  oldBuy: string
  newBuy: string
  oldSell: string
  newSell: string
  adminId: number
  createdAt: string
}

interface PriceHistoryResponse {
  data: PriceHistoryItem[]
  page: number
  pages: number
  total: number
}

export default function OTCPriceHistory() {

  const [items, setItems] = useState<PriceHistoryItem[]>([])
  const [page] = useState(1)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res: PriceHistoryResponse =
        await AdminService.otcPriceHistory(page)

      setItems(res.data || [])
    } catch (error) {
      console.error("PRICE_HISTORY_ERROR", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page])

  if (loading)
    return (
      <div className="p-10 text-gray-400">
        Carregando histórico...
      </div>
    )

  return (
    <div className="p-10 space-y-8">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold text-white">
          Histórico de Preços OTC
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Registro de alterações realizadas nos ativos
        </p>
      </div>

      {/* TABLE CARD */}
      <div className="bg-[#14171A] border border-[#1E2329] rounded-2xl overflow-hidden">

        <table className="w-full text-sm text-gray-300">

          <thead className="bg-[#1A1F24] text-gray-400">
            <tr>
              <th className="px-6 py-4 text-left font-medium">Asset ID</th>
              <th className="px-6 py-4 text-left font-medium">Old Buy</th>
              <th className="px-6 py-4 text-left font-medium">New Buy</th>
              <th className="px-6 py-4 text-left font-medium">Old Sell</th>
              <th className="px-6 py-4 text-left font-medium">New Sell</th>
              <th className="px-6 py-4 text-left font-medium">Admin ID</th>
              <th className="px-6 py-4 text-left font-medium">Data</th>
            </tr>
          </thead>

          <tbody>

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Nenhum registro encontrado
                </td>
              </tr>
            )}

            {items.map((i) => (
              <tr
                key={i.id}
                className="
                  border-t border-[#1E2329]
                  hover:bg-[#181C21]
                  transition
                "
              >
                <td className="px-6 py-4">{i.assetId}</td>

                <td className="px-6 py-4 text-red-400">
                  {Number(i.oldBuy).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-green-400 font-medium">
                  {Number(i.newBuy).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-red-400">
                  {Number(i.oldSell).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-green-400 font-medium">
                  {Number(i.newSell).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-gray-400">
                  {i.adminId}
                </td>

                <td className="px-6 py-4 text-gray-400">
                  {new Date(i.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>
    </div>
  )
}