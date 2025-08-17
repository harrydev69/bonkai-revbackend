"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type Props = { data?: number[] }

function TokenSparkline({ data }: Props) {
  if (!data || data.length < 2) return null

  const rows = data.map((v, i) => ({ t: i, v }))

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <XAxis dataKey="t" hide />
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Tooltip
            formatter={(value: number) =>
              value.toLocaleString(undefined, {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 8,
              })
            }
            labelFormatter={() => ""}
          />
          <Area type="monotone" dataKey="v" fill="#e5e7eb" stroke="#6b7280" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TokenSparkline
export { TokenSparkline } // <-- also export as a named symbol
