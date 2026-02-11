import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowDownUp,
  Box,
  Bell,
  Settings,
  Repeat,
  Gift,
  Landmark,
} from "lucide-react"

const linkClass =
  "flex items-center gap-3 px-4 py-2 rounded hover:bg-white/10 transition"

export default function Sidebar() {
  return (
    <aside className="w-64 bg-secondary text-white flex flex-col">
      <div className="p-6 text-xl font-bold">ACTECO</div>

      <nav className="flex flex-col gap-1 px-2">
        <NavLink to="/admin" className={linkClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/admin/users" className={linkClass}>
          <Users size={18} /> Utilizadores
        </NavLink>

        <NavLink to="/admin/recharges" className={linkClass}>
          <CreditCard size={18} /> Depósitos
        </NavLink>

        <NavLink to="/admin/withdrawals" className={linkClass}>
          <ArrowDownUp size={18} /> Levantamentos
        </NavLink>

        <NavLink to="/admin/banks" className={linkClass}>
          <Landmark size={18} /> Bancos
        </NavLink>

        <NavLink to="/admin/products" className={linkClass}>
          <Box size={18} /> Produtos
        </NavLink>

        <NavLink to="/admin/transactions" className={linkClass}>
          <Repeat size={18} /> Transações
        </NavLink>

        <NavLink to="/admin/commissions" className={linkClass}>
          <Repeat size={18} /> Comissões
        </NavLink>

        <NavLink to="/admin/gift" className={linkClass}>
          <Gift size={18} /> Gift
        </NavLink>

        <NavLink to="/admin/notifications" className={linkClass}>
          <Bell size={18} /> Notificações
        </NavLink>

        <NavLink to="/admin/settings" className={linkClass}>
          <Settings size={18} /> Configurações
        </NavLink>
      </nav>
    </aside>
  )
}
