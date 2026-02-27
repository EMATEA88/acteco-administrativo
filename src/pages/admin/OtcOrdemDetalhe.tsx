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
  const typingTimeout = useRef<any>(null)

  /* ================= LOAD ================= */

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

  /* ================= SOCKET ================= */

  useEffect(() => {

    if (!orderId) return

    const token = localStorage.getItem("token")
    if (!token) return

    const socket = connectAdminSocket(token)

    socket.emit("admin:join-otc", orderId)

    socket.on("otc:new-message", (msg: any) => {
      setOrder((prev: any) => ({
        ...prev,
        conversation: {
          ...prev.conversation,
          messages: [...prev.conversation.messages, msg]
        }
      }))

      socket.emit("otc:mark-read", orderId)
    })

    socket.on("otc:status-update", (data: any) => {
      if (data.orderId === orderId) {
        setOrder((prev: any) => ({
          ...prev,
          status: data.status
        }))
      }
    })

    socket.on("otc:typing", (data: any) => {
      if (!data?.role || data.role === "ADMIN") return
      setTyping(true)
    })

    socket.on("otc:stop-typing", () => {
      setTyping(false)
    })

    socket.on("presence:update", (data: any) => {
      if (data.userId === order?.user?.id) {
        setOnline(data.isOnline)
      }
    })

    return () => {
      disconnectAdminSocket()
    }

  }, [orderId, order?.user?.id])

  /* ================= SCROLL ================= */

  useEffect(() => {
    if (!chatRef.current) return
    chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [order?.conversation?.messages])

  /* ================= SEND ================= */

  function send() {
    if (!message.trim()) return

    const socket = connectAdminSocket(
      localStorage.getItem("token") as string
    )

    socket.emit("otc:message", {
      orderId,
      message: message.trim()
    })

    setMessage("")
  }

  function handleTyping(value: string) {
    setMessage(value)

    const socket = connectAdminSocket(
      localStorage.getItem("token") as string
    )

    socket.emit("otc:typing", orderId)

    clearTimeout(typingTimeout.current)

    typingTimeout.current = setTimeout(() => {
      socket.emit("otc:stop-typing", orderId)
    }, 1200)
  }

  if (loading) return <div className="p-6">Carregando...</div>
  if (!order) return null

  return (
    <div className="flex h-screen bg-gray-100">

      {/* LEFT PANEL */}
      <div className="w-80 bg-white border-r p-6 space-y-4">
        <h2 className="text-xl font-bold">
          Ordem #{order.id}
        </h2>

        <div className="text-sm space-y-2">
          <p><strong>Status:</strong> {order.status}</p>
          <p>
            <strong>Utilizador:</strong> {order.user?.phone}
            <span className={`ml-2 text-xs ${online ? "text-green-500" : "text-gray-400"}`}>
              {online ? "Online" : "Offline"}
            </span>
          </p>
          <p><strong>Asset:</strong> {order.asset?.symbol}</p>
          <p><strong>Total:</strong> {order.totalAoa} Kz</p>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">

        <div className="bg-white border-b p-4 font-semibold">
          Chat OTC
          {typing && (
            <span className="ml-3 text-xs text-gray-400">
              escrevendo...
            </span>
          )}
        </div>

        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50"
        >
          {order.conversation?.messages.map((m: any) => (
            <div
              key={m.id}
              className={`flex ${m.isAdmin ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow
                ${m.isAdmin ? "bg-blue-600 text-white" : "bg-white border"}`}
              >
                {m.type === "IMAGE"
                  ? <img src={m.content} className="rounded-xl max-w-full" />
                  : m.content}

                <div className="text-[10px] opacity-60 mt-1 text-right">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border-t p-4 flex gap-2">
          <input
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 border rounded-full px-4 py-2 text-sm"
            placeholder="Digite mensagem..."
          />
          <button
            onClick={send}
            className="bg-blue-600 text-white p-3 rounded-full"
          >
            <Send size={18} />
          </button>
        </div>

      </div>
    </div>
  )
}