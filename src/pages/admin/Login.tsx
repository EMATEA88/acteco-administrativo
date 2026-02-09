import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../services/api"

export default function AdminLogin() {
  const navigate = useNavigate()

  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      const { data } = await api.post("/auth/login", {
        phone,
        password,
      })

      // esperado backend:
      // { token, user }

      if (data.user.role !== "ADMIN") {
        setError("Conta não é ADMIN")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.user.role)

      navigate("/admin")
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        "Erro ao autenticar"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-6 text-center">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}

        <input
          placeholder="Telefone"
          className="w-full border p-2 mb-3 rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          placeholder="Senha"
          type="password"
          className="w-full border p-2 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  )
}
