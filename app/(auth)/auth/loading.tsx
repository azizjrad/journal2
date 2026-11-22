export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-14 h-14 border-2 border-stone-200 border-t-slate-700 rounded-full animate-spin mx-auto"></div>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-6 max-w-sm mx-auto shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Authentication</h2>
          <p className="text-slate-600 text-sm">Preparing sign-in…</p>

          <div className="flex justify-center gap-1.5 mt-4">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
