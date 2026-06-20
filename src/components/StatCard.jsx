export default function StatCard({ title, value, icon, color = 'bg-coffee-800', textColor = 'text-white' }) {
  return (
    <div className={`${color} rounded-2xl p-5 shadow-lg border border-white/5 hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-coffee-300 uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl font-extrabold mt-1 font-[Outfit] ${textColor}`}>{value}</h3>
        </div>
        {icon && <div className="p-3 rounded-xl bg-white/10 text-white">{icon}</div>}
      </div>
    </div>
  )
}
