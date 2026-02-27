import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"

export default function OTCPriceHistory() {

  const [items, setItems] = useState<any[]>([])
  const [page] = useState(1)

  async function load() {
    const res = await AdminService.otcPriceHistory(undefined, page)
    setItems(res.items)
  }

  useEffect(() => {
    load()
  }, [page])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Histórico de Preços OTC
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Old Buy</th>
            <th>New Buy</th>
            <th>Old Sell</th>
            <th>New Sell</th>
            <th>Admin</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.asset.symbol}</td>
              <td>{i.oldBuy}</td>
              <td>{i.newBuy}</td>
              <td>{i.oldSell}</td>
              <td>{i.newSell}</td>
              <td>{i.admin?.phone}</td>
              <td>{new Date(i.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
