import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"

export default function OtcStats() {

  const [data, setData] = useState<any>(null)

  useEffect(() => {
    AdminService.otcStats().then(setData)
  }, [])

  if (!data) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">

      <Card title="Total Orders" value={data.totalOrders} />
      <Card title="Pendentes" value={data.pending} />
      <Card title="Concluídas" value={data.completed} />
      <Card title="Lucro OTC" value={`${data.totalProfit} AOA`} />

    </div>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white shadow rounded-xl p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  )
}
