import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"
import toast from "react-hot-toast"

type AdminOtcAsset = {
  id: number
  symbol: string
  buyPrice: number
  sellPrice: number
}

export default function OtcAssets() {

  const [assets, setAssets] = useState<AdminOtcAsset[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      setLoading(true)
      const res = await AdminService.otcAssets()
      setAssets(res)
    } catch (err) {
      toast.error("Erro ao carregar assets")
    } finally {
      setLoading(false)
    }
  }

  async function updateAsset(
    id: number,
    buy: number,
    sell: number
  ) {
    if (buy <= 0 || sell <= 0) return

    try {
      await AdminService.updateOtcAsset(id, buy, sell)
      toast.success("Preço atualizado")
      load()
    } catch {
      toast.error("Erro ao atualizar")
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading)
    return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Gestão de Preços OTC
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {assets.map(a => (
          <AssetCard
            key={a.id}
            asset={a}
            onUpdate={updateAsset}
          />
        ))}
      </div>

    </div>
  )
}

function AssetCard({
  asset,
  onUpdate
}: {
  asset: AdminOtcAsset
  onUpdate: (
    id: number,
    buy: number,
    sell: number
  ) => void
}) {

  const [buy, setBuy] = useState(asset.buyPrice)
  const [sell, setSell] = useState(asset.sellPrice)

  return (
    <div className="bg-white p-5 rounded-xl shadow space-y-3">
      <h3 className="font-bold">{asset.symbol}</h3>

      <input
        type="number"
        className="border p-2 w-full rounded"
        value={buy}
        onChange={e => setBuy(Number(e.target.value))}
      />

      <input
        type="number"
        className="border p-2 w-full rounded"
        value={sell}
        onChange={e => setSell(Number(e.target.value))}
      />

      <button
        onClick={() => onUpdate(asset.id, buy, sell)}
        className="bg-blue-600 text-white w-full py-2 rounded"
      >
        Atualizar
      </button>
    </div>
  )
}