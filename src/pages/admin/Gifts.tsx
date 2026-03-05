import { useState } from "react"
import { api } from "../../services/api"
import { Gift, Copy, Check } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminGift() {

  const [amount, setAmount] = useState(100)
  const [days, setDays] = useState(7)
  const [quantity, setQuantity] = useState(1)

  const [codes, setCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  async function generate() {
    if (amount <= 0 || days <= 0 || quantity <= 0) {
      toast.error("Valores inválidos")
      return
    }

    try {
      setLoading(true)

      const res = await api.post("/gift/generate", {
        amount,
        expiresInDays: days,
        quantity
      })

      const list =
        res.data?.gifts?.map((g: any) => g.code) ||
        res.data?.map((g: any) => g.code) ||
        []

      setCodes(list)

      if (list.length > 0) {
        toast.success("Códigos gerados com sucesso")
      }

    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
        "Erro ao gerar códigos"
      )
    } finally {
      setLoading(false)
    }
  }

  async function copyOne(code: string) {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  async function copyAll() {
    await navigator.clipboard.writeText(codes.join("\n"))
    setCopied("ALL")
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-10">

      {/* HEADER */}
      <div className="flex items-center gap-5">
        <div className="bg-[#1A1F24] p-4 rounded-2xl border border-[#1E2329]">
          <Gift className="text-[#FCD535]" size={26} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-white">
            Gestão de Gift Codes
          </h1>
          <p className="text-gray-400 text-sm">
            Criação controlada de códigos promocionais
          </p>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-[#14171A] border border-[#1E2329] rounded-2xl p-8 space-y-6 transition hover:bg-[#181C21]">

        <Input
          label="Valor (AOA)"
          value={amount}
          onChange={v => setAmount(v)}
        />

        <Input
          label="Validade (dias)"
          value={days}
          onChange={v => setDays(v)}
        />

        <Input
          label="Quantidade"
          value={quantity}
          onChange={v => setQuantity(v)}
        />

        <button
          onClick={generate}
          disabled={loading}
          className="
            w-full h-12 rounded-xl font-semibold
            bg-[#FCD535] text-black
            hover:scale-[1.02]
            hover:brightness-95
            transition-all duration-200
            disabled:opacity-50
          "
        >
          {loading ? "Gerando..." : "Gerar Códigos"}
        </button>
      </div>

      {/* RESULT CARD */}
      {codes.length > 0 && (
        <div className="bg-[#14171A] border border-[#1E2329] rounded-2xl p-8 transition hover:bg-[#181C21]">

          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-white">
              Códigos Gerados
            </h3>

            <button
              onClick={copyAll}
              className="
                flex items-center gap-2 text-sm
                text-[#FCD535]
                hover:scale-105
                transition
              "
            >
              {copied === "ALL"
                ? <Check size={16} />
                : <Copy size={16} />
              }
              Copiar todos
            </button>
          </div>

          <div className="space-y-3">
            {codes.map(code => (
              <div
                key={code}
                className="
                  flex justify-between items-center
                  bg-[#1A1F24]
                  border border-[#1E2329]
                  px-5 py-4
                  rounded-xl
                  hover:bg-[#20252B]
                  transition
                "
              >
                <span className="font-mono text-sm tracking-wider text-gray-200">
                  {code}
                </span>

                <button
                  onClick={() => copyOne(code)}
                  className="
                    text-gray-400
                    hover:text-[#FCD535]
                    hover:scale-110
                    transition
                  "
                >
                  {copied === code
                    ? <Check size={18} />
                    : <Copy size={18} />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

/* =========================
    INPUT COMPONENT DARK
========================= */

function Input({
  label,
  value,
  onChange
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="text-sm text-gray-400">
        {label}
      </label>

      <input
        type="text"
        inputMode="numeric"
        className="
          mt-2 w-full
          bg-[#1A1F24]
          border border-[#1E2329]
          rounded-xl px-4 h-11
          text-white
          placeholder-gray-500
          focus:outline-none
          focus:border-[#2A2F36]
          transition
        "
        value={value}
        onChange={e =>
          onChange(
            Number(e.target.value.replace(/\D/g, "")) || 0
          )
        }
      />
    </div>
  )
}