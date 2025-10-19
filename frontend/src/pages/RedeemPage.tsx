export default function RedeemPage() {
  const rewards = [
    { id: 1, name: 'Tree Sapling Kit', points: 500, description: 'Plant your own tree with this starter kit' },
    { id: 2, name: 'Eco-Friendly Water Bottle', points: 300, description: 'Reusable stainless steel water bottle' },
    { id: 3, name: 'Solar Phone Charger', points: 800, description: 'Charge your devices with solar power' },
    { id: 4, name: 'Organic Seed Pack', points: 200, description: 'Grow your own organic vegetables' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Redeem Rewards</h1>
        <p className="text-gray-600">Exchange your carbon credits for eco-friendly rewards</p>
        <div className="mt-4 p-4 bg-leaf-50 rounded-lg">
          <span className="text-lg font-semibold text-leaf-700">Your Credits: 🌿 1,234 points</span>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {rewards.map((reward) => (
          <div key={reward.id} className="card">
            <div className="h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-400">{reward.name}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{reward.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-leaf-600">{reward.points} credits</span>
              <button 
                className={`px-4 py-2 rounded-lg font-medium ${
                  1234 >= reward.points 
                    ? 'bg-leaf-600 hover:bg-leaf-700 text-white' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={1234 < reward.points}
              >
                {1234 >= reward.points ? 'Redeem' : 'Not enough credits'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}