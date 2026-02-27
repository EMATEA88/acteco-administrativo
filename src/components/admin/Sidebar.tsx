import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowDownUp,
  Repeat,
  Gift,
  Bell,
  BarChart3,
  FileText,
  Activity,
  LineChart,
  DollarSign,
  Building2,
  ShieldCheck,
  Folder
} from "lucide-react"

const linkClass =
  "flex items-center gap-3 px-4 py-2 rounded hover:bg-white/10 transition"

const sectionTitle =
  "px-4 pt-4 pb-2 text-xs uppercase text-gray-400 tracking-wider"

export default function Sidebar() {
  return (
    <aside className="w-64 bg-secondary text-white h-screen flex flex-col">

      <div className="p-6 text-xl font-bold border-b border-white/10">
        ACTECO
      </div>

      <nav className="flex-1 overflow-y-auto flex flex-col px-2 py-4">

        {/* ================= CORE ================= */}
        <div className={sectionTitle}>Core</div>

        <NavLink to="/admin" className={linkClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/admin/users" className={linkClass}>
          <Users size={18} /> Utilizadores
        </NavLink>

        <NavLink to="/admin/logs" className={linkClass}>
          <FileText size={18} /> Logs
        </NavLink>

        <NavLink to="/admin/notifications" className={linkClass}>
          <Bell size={18} /> Notificações
        </NavLink>

        {/* ================= FINANCEIRO ================= */}
        <div className={sectionTitle}>Financeiro</div>

        <NavLink to="/admin/banks" className={linkClass}>
          <Building2 size={18} /> Bancos
        </NavLink>

        <NavLink to="/admin/recharges" className={linkClass}>
          <CreditCard size={18} /> Depósitos
        </NavLink>

        <NavLink to="/admin/withdrawals" className={linkClass}>
          <ArrowDownUp size={18} /> Levantamentos
        </NavLink>

        <NavLink to="/admin/transactions" className={linkClass}>
          <Repeat size={18} /> Transações
        </NavLink>

        <NavLink to="/admin/commissions" className={linkClass}>
          <Repeat size={18} /> Comissões
        </NavLink>

        {/* ✅ NOVO: INVESTIMENTOS */}
        <NavLink to="/admin/applications" className={linkClass}>
          <LineChart size={18} /> Investimentos
        </NavLink>

        <NavLink to="/admin/settlements" className={linkClass}>
          <Folder size={18} /> Partner Settlements
        </NavLink>

        <NavLink to="/admin/revenue" className={linkClass}>
          <DollarSign size={18} /> Revenue Control
        </NavLink>

        <NavLink to="/admin/finance" className={linkClass}>
          <BarChart3 size={18} /> Finance Dashboard
        </NavLink>

        {/* ================= SERVIÇOS ================= */}
        <div className={sectionTitle}>Serviços</div>

        <NavLink to="/admin/services" className={linkClass}>
          Service Requests
        </NavLink>

        <NavLink to="/admin/kyc" className={linkClass}>
          <ShieldCheck size={18} /> KYC Verification
        </NavLink>

        <NavLink to="/admin/service-refunds" className={linkClass}>
          Service Refunds
        </NavLink>

        <NavLink to="/admin/support" className={linkClass}>
          Support Chat
        </NavLink>

        <NavLink to="/admin/partners" className={linkClass}>
          Partners
        </NavLink>

        {/* ================= OTC ================= */}
        <div className={sectionTitle}>OTC</div>

        <NavLink to="/admin/otc" className={linkClass}>
          <BarChart3 size={18} /> OTC Dashboard
        </NavLink>

        <NavLink to="/admin/otc/orders" className={linkClass}>
          OTC Orders
        </NavLink>

        <NavLink to="/admin/otc/assets" className={linkClass}>
          OTC Assets
        </NavLink>

        <NavLink to="/admin/otc/stats" className={linkClass}>
          OTC Stats
        </NavLink>

        <NavLink to="/admin/otc/audit" className={linkClass}>
          <Activity size={18} /> OTC Auditoria
        </NavLink>

        <NavLink to="/admin/otc/price-history" className={linkClass}>
          <LineChart size={18} /> Histórico Preços
        </NavLink>

        {/* ================= OUTROS ================= */}
        <div className={sectionTitle}>Outros</div>

        <NavLink to="/admin/gift" className={linkClass}>
          <Gift size={18} /> Gift
        </NavLink>

      </nav>
    </aside>
  )
}