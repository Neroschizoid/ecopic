export default function UserProfilePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-leaf-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🌱</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EcoWarrior123</h1>
            <p className="text-gray-600">Passionate about making a difference</p>
            <p className="text-leaf-600 font-semibold mt-1">🌿 Total Credits: 2,450</p>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Eco Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                <span className="text-gray-400">Action {i}</span>
              </div>
              <p className="text-sm text-gray-600">My eco action #{i}</p>
              <span className="text-sm font-semibold text-leaf-600">+{200 + i * 100} credits</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}