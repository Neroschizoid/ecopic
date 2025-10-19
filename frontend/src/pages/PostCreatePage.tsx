export default function PostCreatePage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Share Your Eco Action</h1>
        <div className="space-y-4">
          <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Upload Image (Coming Soon)</span>
          </div>
          <textarea 
            placeholder="Describe your eco action..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={4}
          />
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-leaf-100 text-leaf-700 px-2 py-1 rounded-full">
              tree-planting
            </span>
            <span className="text-xs bg-earth-100 text-earth-700 px-2 py-1 rounded-full">
              cleanup
            </span>
          </div>
          <button className="btn-primary w-full">Post Action</button>
        </div>
      </div>
    </div>
  )
}