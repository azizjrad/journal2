export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        {/* Admin-specific loading animation */}
        <div className="relative mb-8">
          <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-red-500 rounded-full animate-spin mx-auto"
            style={{
              animationDirection: "reverse",
              animationDuration: "1.5s",
            }}
          ></div>
        </div>

        {/* Admin Dashboard Text */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-sm mx-auto">
          <h2 className="text-xl font-bold text-white mb-2">Admin Dashboard</h2>
          <p className="text-gray-300 text-sm">Loading admin panel...</p>

          {/* Loading dots */}
          <div className="flex justify-center gap-1 mt-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
