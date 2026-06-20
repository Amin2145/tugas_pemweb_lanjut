export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-coffee-600/30 border-t-accent animate-spin"></div>
      </div>
    </div>
  )
}
