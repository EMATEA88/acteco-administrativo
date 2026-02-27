import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import DataTable from "../../components/admin/DataTable"
import { AdminService } from "../../services/admin.service"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Withdrawal {
  id: number
  userPhone: string
  iban: string
  amount: number
  fee: number
  liquid?: number
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export default function Withdrawals() {

  const [items, setItems] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)

      const res = await AdminService.withdrawals()

      const list = Array.isArray(res)
        ? res
        : res?.items ?? []

      setItems(list)

    } catch {
      toast.error("Erro ao carregar saques")
    } finally {
      setLoading(false)
    }
  }

  // ================= ACTIONS =================

  async function approve(id: number) {
    try {
      setProcessingId(id)
      await AdminService.approveWithdrawal(id)
      toast.success("Saque aprovado")
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao aprovar")
    } finally {
      setProcessingId(null)
    }
  }

  async function reject(id: number) {
    try {
      setProcessingId(id)
      await AdminService.rejectWithdrawal(id)
      toast.success("Saque rejeitado")
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao rejeitar")
    } finally {
      setProcessingId(null)
    }
  }

  // ================= SEARCH =================

  const filtered = items.filter((i) => {
    if (!search) return true

    const s = search.toLowerCase()

    return (
      String(i.id).includes(s) ||
      String(i.userPhone || "").toLowerCase().includes(s) ||
      String(i.iban || "").toLowerCase().includes(s)
    )
  })

  // ================= EXPORT PDF =================

  async function exportPDF() {
    try {
      const pending = items.filter(i => i.status === "PENDING")

      if (pending.length === 0) {
        toast.error("Nenhum saque pendente")
        return
      }

      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text("Lista de Saques Pendentes", 14, 15)

      const rows = pending.map((w) => {
        const amount = Number(w.amount || 0)
        const fee = Number(w.fee || 0)
        const liquid =
          w.liquid !== undefined
            ? Number(w.liquid)
            : amount - fee

        return [
          w.userPhone || "-",
          w.iban || "-",
          formatMoney(amount),
          formatMoney(fee),
          formatMoney(liquid),
        ]
      })

      autoTable(doc, {
        head: [["Utilizador", "IBAN", "Valor", "Taxa", "Líquido"]],
        body: rows,
        startY: 20,
      })

      doc.save("withdrawals-pendentes.pdf")

      toast.success("PDF exportado com sucesso")

    } catch {
      toast.error("Erro ao exportar PDF")
    }
  }

  if (loading) {
    return <div className="p-6">Carregando saques...</div>
  }

  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">
        <input
          placeholder="Pesquisar por ID, Telefone ou IBAN"
          className="border px-3 py-2 rounded w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={exportPDF}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          Exportar PDF
        </button>
      </div>

      <DataTable
        data={filtered}
        columns={[
          { key: "id", label: "ID" },
          { key: "userPhone", label: "Utilizador" },
          { key: "iban", label: "IBAN" },

          {
            key: "amount",
            label: "Valor",
            render: (r: Withdrawal) => formatMoney(r.amount),
          },

          {
            key: "fee",
            label: "Taxa",
            render: (r: Withdrawal) => formatMoney(r.fee),
          },

          {
            key: "liquid",
            label: "Líquido",
            render: (r: Withdrawal) =>
              formatMoney(
                r.liquid !== undefined
                  ? r.liquid
                  : r.amount - r.fee
              ),
          },

          {
            key: "status",
            label: "Estado",
            render: (r: Withdrawal) => (
              <StatusBadge status={r.status} />
            ),
          },

          {
            key: "actions",
            label: "Ações",
            render: (r: Withdrawal) =>
              r.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    disabled={processingId === r.id}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded"
                    onClick={() => approve(r.id)}
                  >
                    Aprovar
                  </button>

                  <button
                    disabled={processingId === r.id}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1 rounded"
                    onClick={() => reject(r.id)}
                  >
                    Rejeitar
                  </button>
                </div>
              ),
          },
        ]}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {

  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value)
}
