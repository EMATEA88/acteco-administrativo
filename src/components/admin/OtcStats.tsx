import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"

interface OtcStatsResponse {
  totalOrders: number
  pending: number
  paid: number
  released: number
  cancelled: number
  expired: number
  disputed: number
}

export default function OtcStats() {

  const [data, setData] = useState<OtcStatsResponse | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await AdminService.otcStats()
        setData(res)
      } catch (error) {
        console.error("OTC_STATS_ERROR", error)
      }
    }

    load()
  }, [])

  if (!data)
    return (
      <div className="p-10 text-gray-400">
        Carregando estatísticas...
      </div>
    )

  return (
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold text-white">
          Estatísticas OTC
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Visão geral do módulo OTC
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">

        <StatCard title="Total Orders" value={data.totalOrders} />

        <StatCard
          title="Pendentes"
          value={data.pending}
          color="yellow"
        />

        <StatCard
          title="Pagas"
          value={data.paid}
          color="blue"
        />

        <StatCard
          title="Liberadas"
          value={data.released}
          color="green"
        />

        <StatCard
          title="Canceladas"
          value={data.cancelled}
          color="red"
        />

        <StatCard
          title="Expiradas"
          value={data.expired}
          color="gray"
        />

        <StatCard
          title="Disputas"
          value={data.disputed}
          color="orange"
        />

      </div>
    </div>
  )
}

/* =========================
   CARD PROFISSIONAL
========================= */

function StatCard({
  title,
  value,
  color = "default"
}: {
  title: string
  value: number
  color?: string
}) {

  const colorMap: Record<string, string> = {
    default: "text-white",
    yellow: "text-yellow-400",
    blue: "text-blue-400",
    green: "text-green-400",
    red: "text-red-400",
    gray: "text-gray-400",
    orange: "text-orange-400"
  }

  return (
    <div
      className="
        bg-[#14171A]
        border border-[#1E2329]
        rounded-2xl
        p-6
        transition
        hover:bg-[#181C21]
        hover:scale-[1.02]
        duration-200
      "
    >
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h2
        className={`text-3xl font-semibold mt-3 ${colorMap[color]}`}
      >
        {value}
      </h2>
    </div>
  )
}