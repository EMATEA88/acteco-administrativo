import { useEffect, useState, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { Send } from "lucide-react"
import { AdminService } from "../../services/admin.service"
import {
  connectAdminSocket,
  disconnectAdminSocket
} from "../../services/socket"

export default function OtcOrdemDetalhe() {

  const { id } = useParams()
  const orderId = Number(id)

  const [order, setOrder] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [typing, setTyping] = useState(false)
  const [online, setOnline] = useState(false)
  const [loading, setLoading] = useState(true)

  const chatRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)
  const typingTimeout = useRef<any>(null)

  /* LOAD */

  const load = useCallback(async () => {
    try {
      const data = await AdminService.otcOrderDetail(orderId)
      setOrder(data)
    } catch {
      toast.error("Erro ao carregar ordem")
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
  if (!orderId) return
  load()
}, [load, orderId])

/* SOCKET */

useEffect(() => {

  if (!orderId) return

  const token = localStorage.getItem("token")
  if (!token) return

  const socket = connectAdminSocket(token)

  socketRef.current = socket

  socket.emit("admin:join-otc", orderId)

  /* PRESENCE */

  socket.on("presence:update", (data: any) => {
    if (data.userId === order?.user?.id) {
      setOnline(data.isOnline)
    }
  })

  /* NEW MESSAGE */

  socket.on("otc:new-message", (msg: any) => {
    setOrder((prev: any) => ({
      ...prev,
      conversation: {
        ...prev.conversation,
        messages: [...prev.conversation.messages, msg]
      }
    }))
  })

  /* STATUS UPDATE */

  socket.on("otc:status-update", (data: any) => {
    if (data.orderId === orderId) {
      setOrder((prev: any) => ({
        ...prev,
        status: data.status
      }))
    }
  })

  /* TYPING */

  socket.on("otc:typing", (data: any) => {
    if (data.role !== "ADMIN") {
      setTyping(true)
    }
  })

  socket.on("otc:stop-typing", () => {
    setTyping(false)
  })

  /* CLEANUP */

  return () => {
    socket.off("presence:update")
    socket.off("otc:new-message")
    socket.off("otc:status-update")
    socket.off("otc:typing")
    socket.off("otc:stop-typing")
    disconnectAdminSocket()
  }

}, [orderId, order?.user?.id])

  /* AUTO SCROLL */

  useEffect(() => {
    if (!chatRef.current) return
    chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [order?.conversation?.messages])

  /* SEND */

  function send() {
    if (!message.trim()) return

    socketRef.current.emit("otc:message", {
      orderId,
      message: message.trim()
    })

    setMessage("")
  }

  function handleTyping(value: string) {
    setMessage(value)

    socketRef.current.emit("otc:typing", orderId)

    clearTimeout(typingTimeout.current)

    typingTimeout.current = setTimeout(() => {
      socketRef.current.emit("otc:stop-typing", orderId)
    }, 1200)
  }

  async function handleRelease() {
    try {
      await AdminService.releaseOtcOrder(order.id)
      toast.success("Fundos liberados")
      load()
    } catch {
      toast.error("Erro ao liberar ordem")
    }
  }

  function statusBadge(status: string) {
    switch (status) {
      case "CREATED":
        return "bg-gray-600/20 text-gray-300"
      case "PAID":
        return "bg-yellow-600/20 text-yellow-400"
      case "RELEASED":
        return "bg-emerald-600/20 text-emerald-400"
      case "CANCELLED":
        return "bg-red-600/20 text-red-400"
      default:
        return "bg-gray-600/20 text-gray-300"
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Carregando...</div>
  if (!order) return null

  return (
    <div className="flex h-screen bg-gray-950 text-white">

      {/* LEFT PANEL */}
      <div className="w-96 bg-gray-900 border-r border-gray-800 flex flex-col">

        <div className="p-6 border-b border-gray-800 space-y-4">
          <h2 className="text-xl font-semibold">
            Ordem #{order.id}
          </h2>

          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="p-6 space-y-6 text-sm">

          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider">
              Utilizador
            </p>
            <p className="font-medium mt-1">
              {order.user?.phone}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider">
              Asset
            </p>
            <div className="flex items-center gap-2 mt-1">
  <p className="font-medium">
    {order.user?.phone}
  </p>
  <span
    className={`text-xs ${
      online ? "text-emerald-400" : "text-gray-500"
    }`}
  >
    {online ? "Online" : "Offline"}
  </span>
</div>
          </div>

          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider">
              Total
            </p>
            <p className="text-emerald-400 text-xl font-semibold mt-1">
              {order.totalAoa} Kz
            </p>
          </div>

        </div>

        {order.status === "PAID" && (
          <div className="m-6 p-5 bg-emerald-600/10 border border-emerald-600/30 rounded-2xl">
            <p className="text-sm text-emerald-400">
              Pagamento confirmado
            </p>

            <button
              onClick={handleRelease}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition"
            >
              Liberar Fundos
            </button>
          </div>
        )}

      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col bg-gray-950">

        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="font-semibold text-sm">
            Chat da negociação
          </h3>
          {typing && (
            <p className="text-xs text-gray-500 mt-1">
              Cliente está digitando...
            </p>
          )}
        </div>

        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {order.conversation?.messages.map((m: any) => (
            <div
              key={m.id}
              className={`flex ${m.isAdmin ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-sm px-4 py-3 rounded-2xl text-sm
                  ${m.isAdmin
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-gray-800 border border-gray-700 rounded-bl-sm"
                  }`}
              >
                {m.content}
                <div className="text-[10px] opacity-50 mt-2 text-right">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-3">
          <input
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Digite uma mensagem..."
          />
          <button
            onClick={send}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition"
          >
            <Send size={18} />
          </button>
        </div>

      </div>

    </div>
  )
}