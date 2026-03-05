import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import {
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

type Financial = {
  totalGross: number
  totalCommission: number
  totalNet: number
  totalPaid: number
  totalPending: number
}

type Partner = {
  id: number
  name: string
  contact?: string
  email?: string
  isActive: boolean
  financial?: Financial
}

type Settlement = {
  id: number
  gross: number
  commission: number
  net: number
  status: 'PENDING' | 'PAID'
  createdAt: string
}

export default function AdminPartners() {

  const [partners, setPartners] = useState<Partner[]>([])
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [settlements, setSettlements] = useState<Settlement[]>([])

  useEffect(() => {
    loadPartners()
  }, [])

  async function loadPartners() {
    try {
      const { data } = await api.get('/admin/partners')
      setPartners(data)
    } catch {
      toast.error("Erro ao carregar parceiros")
    }
  }

  async function generateSettlement(id: number) {
    try {
      await api.post(`/admin/partners/${id}/generate-settlement`)
      toast.success("Settlement gerado")
      loadPartners()
    } catch {
      toast.error("Erro ao gerar settlement")
    }
  }

  async function loadSettlements(id: number) {
    try {
      const { data } = await api.get(`/admin/partner-settlements/${id}`)
      setSettlements(data)
    } catch {
      toast.error("Erro ao carregar settlements")
    }
  }

  async function markPaid(id: number) {
    try {
      await api.patch(`/admin/partners/settlement/${id}/pay`)
      toast.success("Marcado como pago")
      if (selectedPartner) loadSettlements(selectedPartner.id)
      loadPartners()
    } catch {
      toast.error("Erro ao marcar pagamento")
    }
  }

  function formatMoney(value?: number) {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA"
    }).format(value ?? 0)
  }

  return (
    <div className="p-10 space-y-10">

      <div>
        <h1 className="text-2xl font-semibold text-white">
          Partners Finance Control
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Gestão institucional de comissões e settlements
        </p>
      </div>

      <div className="space-y-8">

        {partners.map((p) => {

          const financial = p.financial ?? {
            totalGross: 0,
            totalCommission: 0,
            totalNet: 0,
            totalPaid: 0,
            totalPending: 0,
          }

          return (
            <div
              key={p.id}
              className="
                bg-[#14171A]
                border border-[#1E2329]
                rounded-2xl
                p-8
                hover:bg-[#181C21]
                transition
              "
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {p.name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {p.email || p.contact}
                  </p>
                </div>

                <span
                  className={`
                    px-4 py-1 rounded-full text-xs font-medium
                    ${p.isActive
                      ? 'bg-green-900/40 text-green-400'
                      : 'bg-red-900/40 text-red-400'}
                  `}
                >
                  {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              {/* METRICS */}
              <div className="grid md:grid-cols-5 gap-6 text-sm">

                <Metric
                  icon={<DollarSign size={16} />}
                  label="Gross"
                  value={formatMoney(financial.totalGross)}
                  accent="white"
                />

                <Metric
                  icon={<FileText size={16} />}
                  label="Commission"
                  value={formatMoney(financial.totalCommission)}
                  accent="blue"
                />

                <Metric
                  icon={<DollarSign size={16} />}
                  label="Net"
                  value={formatMoney(financial.totalNet)}
                  accent="yellow"
                />

                <Metric
                  icon={<CheckCircle size={16} />}
                  label="Paid"
                  value={formatMoney(financial.totalPaid)}
                  accent="green"
                />

                <Metric
                  icon={<Clock size={16} />}
                  label="Pending"
                  value={formatMoney(financial.totalPending)}
                  accent="orange"
                />
              </div>

              {/* ACTIONS */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => generateSettlement(p.id)}
                  className="
                    px-5 py-2
                    bg-[#FCD535]
                    text-black
                    rounded-lg
                    hover:scale-105
                    transition
                  "
                >
                  Generate Settlement
                </button>

                <button
                  onClick={() => {
                    setSelectedPartner(p)
                    loadSettlements(p.id)
                  }}
                  className="
                    px-5 py-2
                    bg-[#1E2329]
                    text-white
                    rounded-lg
                    hover:bg-[#252B33]
                    transition
                  "
                >
                  View Settlements
                </button>
              </div>

            </div>
          )
        })}
      </div>

      {/* MODAL */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">

          <div className="
            bg-[#14171A]
            border border-[#1E2329]
            rounded-2xl
            w-[900px]
            max-h-[80vh]
            overflow-y-auto
            p-8
            space-y-6
          ">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Settlements — {selectedPartner.name}
              </h2>

              <button
                onClick={() => setSelectedPartner(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <table className="w-full text-sm text-gray-300">
              <thead className="bg-[#1A1F24] text-gray-400">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Gross</th>
                  <th className="p-3 text-left">Commission</th>
                  <th className="p-3 text-left">Net</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Ação</th>
                </tr>
              </thead>

              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id} className="border-t border-[#1E2329]">
                    <td className="p-3">{s.id}</td>
                    <td className="p-3">{formatMoney(s.gross)}</td>
                    <td className="p-3">{formatMoney(s.commission)}</td>
                    <td className="p-3">{formatMoney(s.net)}</td>
                    <td className="p-3">
                      <span
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${s.status === 'PAID'
                            ? 'bg-green-900/40 text-green-400'
                            : 'bg-yellow-900/40 text-yellow-400'}
                        `}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {s.status === 'PENDING' && (
                        <button
                          onClick={() => markPaid(s.id)}
                          className="
                            px-4 py-1
                            bg-[#FCD535]
                            text-black
                            rounded-md
                            text-xs
                            hover:scale-105
                            transition
                          "
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      )}

    </div>
  )
}

function Metric({
  icon,
  label,
  value,
  accent,
}: {
  icon: any
  label: string
  value: string
  accent: string
}) {

  const colorMap: Record<string, string> = {
    white: "text-white",
    blue: "text-blue-400",
    yellow: "text-[#FCD535]",
    green: "text-green-400",
    orange: "text-orange-400"
  }

  return (
    <div className="
      bg-[#1A1F24]
      border border-[#1E2329]
      rounded-xl
      p-4
      space-y-2
      hover:bg-[#20252B]
      transition
    ">
      <div className="flex items-center gap-2 text-gray-400 text-xs">
        {icon}
        {label}
      </div>
      <div className={`font-semibold ${colorMap[accent]}`}>
        {value}
      </div>
    </div>
  )
}