import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"

interface Message {
  id: number
  content: string
  isAdmin: boolean
  createdAt: string
  type: string
}

interface Conversation {
  id: number
  user: {
    phone: string
  }
  messages: Message[]
  unreadUser: number
  unreadAdmin: number
}

export default function AdminSupport() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [active, setActive] = useState<Conversation | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const data = await AdminService.supportList()
    setConversations(data)
  }

  async function send() {
    if (!active || !message) return

    await AdminService.supportAdminSend({
      conversationId: active.id, message,
    })

    setMessage("")
    load()
  }

  return (
    <div className="flex h-[85vh] bg-white rounded-xl shadow overflow-hidden">

      {/* LEFT - Conversations */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 font-bold border-b">
          Conversas
        </div>

        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setActive(c)}
            className={`p-4 cursor-pointer border-b hover:bg-gray-100 ${
              active?.id === c.id ? "bg-gray-200" : ""
            }`}
          >
            <div className="font-medium">
              {c.user.phone}
            </div>

            {c.unreadAdmin > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                {c.unreadAdmin}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT - Chat */}
      <div className="flex-1 flex flex-col">

        {active ? (
          <>
            <div className="p-4 border-b font-semibold">
              {active.user.phone}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-xs p-2 rounded-lg ${
                    m.isAdmin
                      ? "ml-auto bg-green-500 text-white"
                      : "bg-white"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite mensagem..."
              />
              <button
                onClick={send}
                className="bg-green-600 text-white px-4 rounded"
              >
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Selecione uma conversa
          </div>
        )}
      </div>
    </div>
  )
}