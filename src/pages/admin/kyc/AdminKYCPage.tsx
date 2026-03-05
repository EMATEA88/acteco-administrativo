import { useEffect, useState } from "react"
import { KYCService } from "../../../services/kyc"
import toast from "react-hot-toast"

interface Verification {
  user: {
    id: number
    phone: string
  }
  frontImage: string
  backImage: string
  selfieImage: string
  status: "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED"
  rejectionReason?: string
}

export default function AdminKYCPage() {

  const [data, setData] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  async function load() {
    try {
      const res = await KYCService.list()
      setData(res.data.items ?? [])
    } catch {
      toast.error("Erro ao carregar verificações")
    } finally {
      setLoading(false)
    }
  }

  async function approve(userId: number) {
    try {
      setActionLoading(userId)
      await KYCService.approve(userId)
      toast.success("KYC aprovado")
      load()
    } catch {
      toast.error("Erro ao aprovar")
    } finally {
      setActionLoading(null)
    }
  }

  async function reject(userId: number) {
    const reason = prompt("Motivo da rejeição:")
    if (!reason) return

    try {
      setActionLoading(userId)
      await KYCService.reject(userId, reason)
      toast.success("KYC rejeitado")
      load()
    } catch {
      toast.error("Erro ao rejeitar")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading)
    return (
      <div className="p-10 text-gray-400">
        Carregando verificações...
      </div>
    )

  return (
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Verificações KYC
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Controle institucional de identidade e compliance
        </p>
      </div>

      {data.length === 0 && (
        <div className="text-gray-500">
          Nenhuma verificação encontrada.
        </div>
      )}

      {data.map((item) => (
        <div
          key={item.user.id}
          className="
            bg-[#14171A]
            border border-[#1E2329]
            rounded-2xl
            p-8
            space-y-6
            hover:bg-[#181C21]
            transition
          "
        >

          {/* TOP INFO */}
          <div className="flex justify-between items-center">

            <div>
              <p className="text-gray-400 text-sm">
                Usuário
              </p>
              <p className="text-white font-semibold">
                {item.user.phone}
              </p>
            </div>

            <StatusBadge status={item.status} />

          </div>

          {/* ACTIONS */}
          {item.status === "PENDING" && (
            <div className="flex gap-4">

              <button
                disabled={actionLoading === item.user.id}
                onClick={() => approve(item.user.id)}
                className="
                  bg-[#FCD535]
                  text-black
                  px-5 py-2
                  rounded-lg
                  text-sm
                  hover:scale-105
                  transition
                  disabled:opacity-50
                "
              >
                {actionLoading === item.user.id
                  ? "Processando..."
                  : "Aprovar"}
              </button>

              <button
                disabled={actionLoading === item.user.id}
                onClick={() => reject(item.user.id)}
                className="
                  bg-red-600
                  text-white
                  px-5 py-2
                  rounded-lg
                  text-sm
                  hover:scale-105
                  transition
                  disabled:opacity-50
                "
              >
                Rejeitar
              </button>

            </div>
          )}

          {/* IMAGES */}
          <div className="grid md:grid-cols-3 gap-6">

            <KycImage src={item.frontImage} label="Documento (Frente)" />
            <KycImage src={item.backImage} label="Documento (Verso)" />
            <KycImage src={item.selfieImage} label="Selfie" />

          </div>

          {/* REJECTION REASON */}
          {item.rejectionReason && (
            <div className="
              bg-red-900/40
              border border-red-800
              rounded-xl
              p-4
              text-red-400
              text-sm
            ">
              <strong>Motivo da Rejeição:</strong> {item.rejectionReason}
            </div>
          )}

        </div>
      ))}

    </div>
  )
}

/* ================= BADGE ================= */

function StatusBadge({
  status
}: {
  status: "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED"
}) {

  const map: Record<string, string> = {
    PENDING: "bg-yellow-900/40 text-yellow-400",
    IN_REVIEW: "bg-blue-900/40 text-blue-400",
    VERIFIED: "bg-green-900/40 text-green-400",
    REJECTED: "bg-red-900/40 text-red-400",
  }

  return (
    <span
      className={`
        px-4 py-1
        rounded-full
        text-xs
        font-medium
        ${map[status]}
      `}
    >
      {status}
    </span>
  )
}

/* ================= IMAGE ================= */

function KycImage({
  src,
  label
}: {
  src: string
  label: string
}) {

  return (
    <div className="space-y-2">

      <p className="text-gray-400 text-xs">
        {label}
      </p>

      <div className="
        bg-[#1A1F24]
        border border-[#1E2329]
        rounded-xl
        overflow-hidden
      ">
        <img
          src={src}
          alt={label}
          className="
            w-full
            h-48
            object-cover
            hover:scale-105
            transition
          "
        />
      </div>

    </div>
  )
}