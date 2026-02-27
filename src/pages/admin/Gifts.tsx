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

  /* =========================
      GENERATE
  ========================= */

  const generate = async () => {
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

  /* =========================
      COPY
  ========================= */

  const copyOne = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(codes.join("\n"))
    setCopied("ALL")
    setTimeout(() => setCopied(null), 2000)
  }

  /* =========================
      UI
  ========================= */

  return (
    <div className="p-8 max-w-2xl mx-auto">

      <div className="flex items-center gap-4 mb-8">
        <div className="bg-indigo-100 p-3 rounded-xl">
          <Gift className="text-indigo-600" size={26} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestão de Gift Codes
          </h1>
          <p className="text-gray-500 text-sm">
            Criação controlada de códigos promocionais
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">

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
            w-full h-12 rounded-xl font-semibold text-white
            bg-indigo-600 hover:bg-indigo-700
            transition disabled:opacity-50
          "
        >
          {loading ? "Gerando..." : "Gerar Códigos"}
        </button>
      </div>

      {codes.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow">

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">
              Códigos Gerados
            </h3>

            <button
              onClick={copyAll}
              className="flex items-center gap-2 text-sm text-indigo-600"
            >
              {copied === "ALL"
                ? <Check size={16} />
                : <Copy size={16} />
              }
              Copiar todos
            </button>
          </div>

          <div className="space-y-2">
            {codes.map(code => (
              <div
                key={code}
                className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg"
              >
                <span className="font-mono text-sm tracking-wide">
                  {code}
                </span>

                <button
                  onClick={() => copyOne(code)}
                  className="text-gray-500 hover:text-indigo-600"
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
    INPUT COMPONENT
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
      <label className="text-sm text-gray-500">
        {label}
      </label>

      <input
        type="text"
        inputMode="numeric"
        className="
          mt-1 w-full border rounded-xl px-4 h-11
          focus:ring-2 focus:ring-indigo-400
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
