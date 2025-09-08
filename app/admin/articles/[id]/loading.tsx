export default function AdminArticleDetailsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        {/* Loading Spinner */}
        <div className="w-16 h-16 bg-red-600 rounded-full mb-6 animate-pulse shadow-lg relative">
          <div className="absolute inset-0 w-16 h-16 bg-red-500 rounded-full animate-ping"></div>
          <div className="absolute inset-2 w-12 h-12 bg-red-700 rounded-full animate-pulse"></div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Loading Article
        </h2>
        <p className="text-gray-500">
          Please wait while we load the article details...
        </p>

        {/* Loading Dots */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-red-700 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
