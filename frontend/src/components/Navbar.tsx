import { Link } from 'react-router-dom'
import { LeafyGreenIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <LeafyGreenIcon className="h-8 w-8 text-leaf-600" />
            <span className="text-xl font-bold text-gray-800">ReLeaf</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-leaf-600 transition-colors">
              Feed
            </Link>
            <Link to="/create" className="text-gray-600 hover:text-leaf-600 transition-colors">
              Create Post
            </Link>
            <Link to="/redeem" className="text-gray-600 hover:text-leaf-600 transition-colors">
              Redeem
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              🌿 Credits: <span className="font-semibold text-leaf-600">1,234</span>
            </span>
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}