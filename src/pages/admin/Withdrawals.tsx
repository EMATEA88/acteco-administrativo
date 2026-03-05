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

  const filtered = items.filter((i) => {
    if (!search) return true

    const s = search.toLowerCase()

    return (
      String(i.id).includes(s) ||
      String(i.userPhone || "").toLowerCase().includes(s) ||
      String(i.iban || "").toLowerCase().includes(s)
    )
  })

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
    return (
      <div className="p-8 text-gray-400">
        Carregando saques...
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Saques
        </h1>

        <button
          onClick={exportPDF}
          className="
            bg-emerald-600
            hover:bg-emerald-700
            text-white
            px-5 py-2
            rounded-xl
            text-sm
            font-semibold
            transition
          "
        >
          Exportar PDF
        </button>
      </div>

      {/* SEARCH */}
      <div>
        <input
          placeholder="Pesquisar por ID, Telefone ou IBAN"
          className="
            bg-gray-900
            border border-gray-800
            px-4 py-2
            rounded-xl
            w-96
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-500
            transition
          "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE CARD */}
      <div className="
        bg-gray-950
        border border-gray-800
        rounded-2xl
        shadow-xl
        overflow-hidden
      ">
        <DataTable
          data={filtered}
          columns={[
            {
              key: "id",
              label: "ID",
              render: (r: Withdrawal) => (
                <span className="text-gray-400 text-xs">
                  #{r.id}
                </span>
              )
            },

            {
              key: "userPhone",
              label: "Utilizador",
              render: (r: Withdrawal) =>
                <span className="font-semibold">
                  {r.userPhone}
                </span>
            },

            { key: "iban", label: "IBAN" },

            {
              key: "amount",
              label: "Valor",
              render: (r: Withdrawal) =>
                <span className="text-yellow-400 font-semibold">
                  {formatMoney(r.amount)}
                </span>
            },

            {
              key: "fee",
              label: "Taxa",
              render: (r: Withdrawal) =>
                <span className="text-red-400 text-sm">
                  {formatMoney(r.fee)}
                </span>
            },

            {
              key: "liquid",
              label: "Líquido",
              render: (r: Withdrawal) =>
                <span className="text-emerald-400 font-semibold">
                  {formatMoney(
                    r.liquid !== undefined
                      ? r.liquid
                      : r.amount - r.fee
                  )}
                </span>
            },

            {
              key: "status",
              label: "Estado",
              render: (r: Withdrawal) =>
                <StatusBadge status={r.status} />
            },

            {
              key: "actions",
              label: "Ações",
              render: (r: Withdrawal) =>
                r.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      disabled={processingId === r.id}
                      className="
                        bg-emerald-600
                        hover:bg-emerald-700
                        disabled:opacity-50
                        text-white
                        px-3 py-1
                        rounded-lg
                        text-xs
                        transition
                      "
                      onClick={() => approve(r.id)}
                    >
                      Aprovar
                    </button>

                    <button
                      disabled={processingId === r.id}
                      className="
                        bg-red-600
                        hover:bg-red-700
                        disabled:opacity-50
                        text-white
                        px-3 py-1
                        rounded-lg
                        text-xs
                        transition
                      "
                      onClick={() => reject(r.id)}
                    >
                      Rejeitar
                    </button>
                  </div>
                )
            },
          ]}
        />
      </div>
    </div>
  )
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: string }) {

  const styles: Record<string, string> = {
    PENDING: "bg-yellow-600/20 text-yellow-400",
    APPROVED: "bg-emerald-600/20 text-emerald-400",
    REJECTED: "bg-red-600/20 text-red-400",
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-600/20 text-gray-400"}`}>
      {status}
    </span>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value ?? 0)
}