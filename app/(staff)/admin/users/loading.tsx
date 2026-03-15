export default function AdminUsersLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 max-w-xs mx-auto">
          <h3 className="text-lg font-semibold text-white mb-1">
            Loading Users
          </h3>
          <p className="text-gray-300 text-sm">Fetching user data...</p>
        </div>
      </div>
    </div>
  );
}
