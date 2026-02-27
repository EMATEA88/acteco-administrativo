import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../services/api"
import toast from "react-hot-toast"
import { ShieldCheck } from "lucide-react"

export default function AdminLogin() {

  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  function normalizePhone(value: string) {
    if (!value) return value

    // se for email não mexe
    if (value.includes("@")) return value

    // remove espaços
    const clean = value.replace(/\s+/g, "")

    if (clean.startsWith("+244")) return clean
    if (clean.startsWith("244")) return `+${clean}`

    return `+244${clean}`
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)

      const loginIdentifier = normalizePhone(identifier)

      const { data } = await api.post("/auth/login", {
        identifier: loginIdentifier,
        password,
      })

      if (data.user.role !== "ADMIN") {
        toast.error("Acesso restrito a administradores")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.user.role)

      toast.success("Login efetuado com sucesso")

      navigate("/admin")

    } catch (err: any) {

      toast.error(
        err?.response?.data?.error ||
        "Credenciais inválidas"
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">

      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          <div className="flex flex-col items-center mb-6">
            <div className="bg-indigo-100 p-3 rounded-full mb-3">
              <ShieldCheck className="text-indigo-600 w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              Painel Administrativo
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Acesso exclusivo
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <label className="text-sm text-gray-600">
                Telefone ou Email
              </label>
              <input
                type="text"
                placeholder="+244 9xx xxx xxx ou email"
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 mt-1 outline-none transition"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Palavra-passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 mt-1 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition"
            >
              {loading ? "Autenticando..." : "Entrar"}
            </button>

          </form>

        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} EMATEA FINTECH
        </p>

      </div>
    </div>
  )
}