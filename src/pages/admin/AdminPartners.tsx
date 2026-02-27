import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import {
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
} from 'lucide-react'

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
    const { data } = await api.get('/admin/partners')
    setPartners(data)
  }

  async function generateSettlement(id: number) {
    await api.post(`/admin/partners/${id}/generate-settlement`)
    loadPartners()
  }

  async function loadSettlements(id: number) {
    const { data } = await api.get(`/admin/partner-settlements/${id}`)
    setSettlements(data)
  }

  async function markPaid(id: number) {
    await api.patch(`/admin/partners/settlement/${id}/pay`)
    if (selectedPartner) loadSettlements(selectedPartner.id)
    loadPartners()
  }

  function formatMoney(value?: number) {
    return (value ?? 0).toLocaleString('pt-AO') + ' Kz'
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Partners Finance Control</h1>

      <div className="grid gap-6">

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
              className="bg-white rounded-2xl shadow p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  <p className="text-sm text-gray-500">
                    {p.email || p.contact}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    p.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-4 text-sm">

                <Metric
                  icon={<DollarSign size={16} />}
                  label="Gross"
                  value={formatMoney(financial.totalGross)}
                />

                <Metric
                  icon={<FileText size={16} />}
                  label="Commission (5%)"
                  value={formatMoney(financial.totalCommission)}
                />

                <Metric
                  icon={<DollarSign size={16} />}
                  label="Net"
                  value={formatMoney(financial.totalNet)}
                />

                <Metric
                  icon={<CheckCircle size={16} />}
                  label="Paid"
                  value={formatMoney(financial.totalPaid)}
                />

                <Metric
                  icon={<Clock size={16} />}
                  label="Pending"
                  value={formatMoney(financial.totalPending)}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => generateSettlement(p.id)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  Generate Settlement
                </button>

                <button
                  onClick={() => {
                    setSelectedPartner(p)
                    loadSettlements(p.id)
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition"
                >
                  View Settlements
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {selectedPartner && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

          <div className="bg-white rounded-2xl w-[800px] p-6 space-y-4">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Settlements — {selectedPartner.name}
              </h2>

              <button
                onClick={() => setSelectedPartner(null)}
                className="text-sm text-gray-500"
              >
                Close
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th>ID</th>
                  <th>Gross</th>
                  <th>Commission</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td>{s.id}</td>
                    <td>{formatMoney(s.gross)}</td>
                    <td>{formatMoney(s.commission)}</td>
                    <td>{formatMoney(s.net)}</td>
                    <td>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          s.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td>
                      {s.status === 'PENDING' && (
                        <button
                          onClick={() => markPaid(s.id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-md text-xs"
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
}: {
  icon: any
  label: string
  value: string
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 space-y-1">
      <div className="flex items-center gap-2 text-gray-500 text-xs">
        {icon}
        {label}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}