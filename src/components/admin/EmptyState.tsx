type Props = { message?: string }

export default function EmptyState({ message = "Sem dados" }: Props) {
  return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      {message}
    </div>
  )
}
