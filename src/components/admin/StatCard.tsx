type Props = {
  title: string
  value: string | number
  color?: "primary" | "success" | "warning" | "danger"
}

const colorMap = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
}

export default function StatCard({ title, value, color = "primary" }: Props) {
  return (
    <div className="card">
      <p className="card-title">{title}</p>
      <p className={`card-value ${colorMap[color]}`}>{value}</p>
    </div>
  )
}
