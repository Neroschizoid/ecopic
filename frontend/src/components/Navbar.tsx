import { Link, useNavigate, useLocation } from 'react-router-dom'
import { SparklesIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api/client'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Force re-render when user changes in store
  const credits = user?.carbon_credits ?? 0

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      logout()
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      logout() // Force logout even if API call fails
      toast.success('Logged out')
      navigate('/')
    }
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <SparklesIcon className="h-8 w-8 text-leaf-600" />
            <span className="text-xl font-bold text-gray-800">ReLeaf</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <Link 
                  to="/" 
                  className={`transition-colors ${
                    location.pathname === '/' 
                      ? 'text-leaf-600 font-semibold' 
                      : 'text-gray-600 hover:text-leaf-600'
                  }`}
                >
                  Your Feed
                </Link>
                <Link 
                  to="/feed" 
                  className={`transition-colors ${
                    location.pathname === '/feed' 
                      ? 'text-leaf-600 font-semibold' 
                      : 'text-gray-600 hover:text-leaf-600'
                  }`}
                >
                  Discover
                </Link>
              </>
            )}
            {!isAuthenticated && (
              <Link to="/feed" className="text-gray-600 hover:text-leaf-600 transition-colors">
                Feed
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/create" className="text-gray-600 hover:text-leaf-600 transition-colors">
                Create Post
              </Link>
            )}
            <Link to="/redeem" className="text-gray-600 hover:text-leaf-600 transition-colors">
              Redeem
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <>
                <span className="text-sm text-gray-600">
                  🌿 Credits: <span className="font-semibold text-leaf-600">{credits.toLocaleString()}</span>
                </span>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-leaf-600 py-2">
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="hidden md:block">{user.username}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to={`/profile/${user.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-gray-600 hover:text-leaf-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
