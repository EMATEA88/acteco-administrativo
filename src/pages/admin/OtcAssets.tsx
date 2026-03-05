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
    } catch {
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
    if (buy <= 0 || sell <= 0) {
      toast.error("Valores inválidos")
      return
    }

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
    return (
      <div className="p-10 text-gray-400">
        Carregando ativos...
      </div>
    )

  return (
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Gestão de Preços OTC
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Controle institucional dos preços de compra e venda
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
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

/* =========================
   CARD PROFISSIONAL
========================= */

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
    <div
      className="
        bg-[#14171A]
        border border-[#1E2329]
        rounded-2xl
        p-6
        space-y-5
        transition
        hover:bg-[#181C21]
        hover:scale-[1.02]
        duration-200
      "
    >
      <h3 className="text-lg font-semibold text-white">
        {asset.symbol}
      </h3>

      <div className="space-y-4">

        <div>
          <label className="text-xs text-gray-400">
            Buy Price
          </label>
          <input
            type="number"
            value={buy}
            onChange={e => setBuy(Number(e.target.value))}
            className="
              mt-1 w-full
              bg-[#1A1F24]
              border border-[#1E2329]
              rounded-xl px-4 h-11
              text-green-400
              focus:outline-none
              focus:border-green-600
              transition
            "
          />
        </div>

        <div>
          <label className="text-xs text-gray-400">
            Sell Price
          </label>
          <input
            type="number"
            value={sell}
            onChange={e => setSell(Number(e.target.value))}
            className="
              mt-1 w-full
              bg-[#1A1F24]
              border border-[#1E2329]
              rounded-xl px-4 h-11
              text-red-400
              focus:outline-none
              focus:border-red-600
              transition
            "
          />
        </div>

      </div>

      <button
        onClick={() => onUpdate(asset.id, buy, sell)}
        className="
          w-full h-11 rounded-xl font-semibold
          bg-[#FCD535] text-black
          hover:scale-[1.02]
          hover:brightness-95
          transition-all duration-200
        "
      >
        Atualizar
      </button>
    </div>
  )
}