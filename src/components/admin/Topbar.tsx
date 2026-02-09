import { Bell } from "lucide-react"

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <input
        placeholder="Pesquisar..."
        className="border rounded px-3 py-1 text-sm w-64"
      />

      <div className="flex items-center gap-4">
        <Bell className="text-gray-600" />
        <div className="text-sm font-medium">Admin</div>
      </div>
    </header>
  )
}
