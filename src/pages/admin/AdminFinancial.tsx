import { useEffect, useState } from "react"
import { api } from "../../services/api"

export default function AdminFinancial(){

  const [data,setData] = useState<any>(null)

  useEffect(()=>{
    api.get("/admin/dashboard/financial")
      .then(r=>setData(r.data))
  },[])

  if(!data) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-4 gap-4">

      <Card title="Pendentes" value={data.pending} />
      <Card title="Aprovados" value={data.approved} />
      <Card title="Rejeitados" value={data.rejected} />
      <Card title="Hoje (KZ)" value={data.todayAmount} />

    </div>
  )
}

function Card({title,value}:{title:string,value:any}){
  return(
    <div className="bg-white p-5 rounded-xl shadow">
      <div className="text-sm opacity-60">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
