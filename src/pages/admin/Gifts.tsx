import { useState } from "react"
import { api } from "../../services/api"
import { Gift, Copy, Check } from "lucide-react"

export default function AdminGift() {

  const [amount, setAmount] = useState(100)
  const [days, setDays] = useState(7)
  const [quantity, setQuantity] = useState(1)

  const [codes, setCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  /* =========================
      GENERATE
  ========================= */

  const generate = async () => {
    try {

      setLoading(true)
      setSuccess(false)

      const res = await api.post("/gift/generate", {
        amount,
        expiresInDays: days,
        quantity
      })

      const list = res.data?.gifts?.map((g:any)=> g.code) || []

      setCodes(list)

      if(list.length > 0){
        setSuccess(true)
        setTimeout(()=> setSuccess(false), 4000)
      }

    } catch (err) {
      alert("Erro ao gerar gift")
    } finally {
      setLoading(false)
    }
  }

  /* =========================
      COPY
  ========================= */

  const copyOne = async (code:string)=>{
    await navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(()=> setCopied(null),2000)
  }

  const copyAll = async ()=>{
    await navigator.clipboard.writeText(codes.join("\n"))
    setCopied("ALL")
    setTimeout(()=> setCopied(null),2000)
  }

  /* =========================
      UI
  ========================= */

  return (
    <div className="p-8 max-w-2xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Gift className="text-blue-600" size={26}/>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gift Codes
          </h1>
          <p className="text-gray-500 text-sm">
            Gere códigos promocionais para utilizadores
          </p>
        </div>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
          ✅ Códigos gerados com sucesso
        </div>
      )}

      {/* CARD */}
      <div className="
        bg-white
        rounded-2xl
        shadow-md
        p-8
        transition
        hover:shadow-xl
        hover:scale-[1.01]
      ">

        {/* VALOR */}
        <div className="mb-5">
          <label className="text-sm text-gray-500">
            Valor (Kz)
          </label>

          <input
            type="text"
            inputMode="numeric"
            className="mt-1 w-full border rounded-xl px-4 h-11 outline-none focus:ring-2 focus:ring-blue-400"
            value={amount}
            onChange={e=> setAmount(Number(e.target.value.replace(/\D/g,"")))}
          />
        </div>

        {/* DIAS */}
        <div className="mb-5">
          <label className="text-sm text-gray-500">
            Validade (dias)
          </label>

          <input
            type="text"
            inputMode="numeric"
            className="mt-1 w-full border rounded-xl px-4 h-11 outline-none focus:ring-2 focus:ring-blue-400"
            value={days}
            onChange={e=> setDays(Number(e.target.value.replace(/\D/g,"")))}
          />
        </div>

        {/* QUANTIDADE */}
        <div className="mb-6">
          <label className="text-sm text-gray-500">
            Quantidade de códigos
          </label>

          <input
            type="text"
            inputMode="numeric"
            className="mt-1 w-full border rounded-xl px-4 h-11 outline-none focus:ring-2 focus:ring-blue-400"
            value={quantity}
            onChange={e=> setQuantity(Number(e.target.value.replace(/\D/g,"")))}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={generate}
          disabled={loading}
          className="
          w-full
          h-12
          rounded-xl
          font-semibold
          text-white
          tracking-wide
          bg-gradient-to-r
          from-blue-500
          to-blue-600
          shadow-lg
          shadow-blue-500/30
          transition-all
          duration-300
          hover:from-blue-600
          hover:to-blue-700
          hover:shadow-xl
          hover:shadow-blue-600/40
          active:scale-[0.98]
          disabled:opacity-50
          disabled:cursor-not-allowed
          "
        >
          {loading ? "Gerando..." : "Gerar Códigos"}
        </button>

      </div>

      {/* RESULT LIST */}
      {codes.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow">

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">
              ✨ Códigos Gerados
            </h3>

            <button
              onClick={copyAll}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {copied === "ALL"
                ? <Check size={16}/>
                : <Copy size={16}/>
              }
              Copiar todos
            </button>
          </div>

          <div className="space-y-2">
            {codes.map(code=>(
              <div
                key={code}
                className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg"
              >
                <span className="font-mono text-sm tracking-wide">
                  {code}
                </span>

                <button
                  onClick={()=> copyOne(code)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  {copied === code
                    ? <Check size={18}/>
                    : <Copy size={18}/>
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