export default function FeedPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Eco Action Feed</h1>
        <p className="text-gray-600">Discover amazing eco-friendly actions from the community</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder posts */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card">
            <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-400">Post Image {i}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Eco Action #{i}</h3>
            <p className="text-gray-600 text-sm mb-3">
              This is a sample description of an eco-friendly action performed by a community member.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-leaf-100 text-leaf-700 px-2 py-1 rounded-full">
                  tree-planting
                </span>
                <span className="text-xs bg-earth-100 text-earth-700 px-2 py-1 rounded-full">
                  community
                </span>
              </div>
              <span className="text-sm font-semibold text-leaf-600">+{150 + i * 50} credits</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}