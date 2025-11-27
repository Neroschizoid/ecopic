import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { postsAPI, userAPI } from '../api/client'
import { Post } from '../types'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export default function DiscoverFeedPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [followedTags, setFollowedTags] = useState<string[]>([])
  
  // Filter states
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchUsername, setSearchUsername] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  const [showFilters, setShowFilters] = useState(false)
  
  const popularTags = ['tree-planting', 'cleanup', 'recycling', 'energy-saving', 'community', 'composting', 'water-saving']

  useEffect(() => {
    fetchPosts()
    if (user) {
      fetchFollowedTags()
    }
  }, [selectedTags, searchUsername, sortBy])

  const fetchFollowedTags = async () => {
    if (!user) return
    try {
      const tags = await userAPI.getFollowedTags(user.id)
      setFollowedTags(tags)
    } catch (error) {
      console.error('Failed to fetch followed tags:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: 20,
        offset: 0
      }
      
      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(',')
      }
      
      if (searchUsername) {
        params.username = searchUsername
      }
      
      const fetchedPosts = await postsAPI.getPosts(params)
      
      // Sort by popularity if selected
      let sorted = [...fetchedPosts]
      if (sortBy === 'popular') {
        sorted.sort((a, b) => b.points - a.points)
      }
      
      setPosts(sorted)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleFollowTag = async (tag: string, isFollowed: boolean) => {
    if (!user) {
      navigate('/login')
      return
    }
    
    try {
      if (isFollowed) {
        await userAPI.unfollowTag(tag)
        setFollowedTags(followedTags.filter(t => t !== tag))
        toast.success(`Unfollowed #${tag}`)
      } else {
        await userAPI.followTag(tag)
        setFollowedTags([...followedTags, tag])
        toast.success(`Followed #${tag}`)
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Eco Actions</h1>
        <p className="text-gray-600">Explore all eco-friendly actions from the community</p>
      </div>

      {/* Filter Controls */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-700 font-semibold hover:text-leaf-600 transition-colors"
        >
          <span>Filters & Search</span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
            {/* Username Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by Username</label>
              <input
                type="text"
                placeholder="Search for a user..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-500 focus:border-transparent"
              />
            </div>

            {/* Sort Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'recent'
                      ? 'bg-leaf-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Most Recent
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'popular'
                      ? 'bg-leaf-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Most Popular
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedTags.length > 0 || searchUsername) && (
              <button
                onClick={() => {
                  setSelectedTags([])
                  setSearchUsername('')
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {selectedTags.length > 0 && (
        <div className="mb-6 p-3 bg-leaf-50 rounded-lg border border-leaf-200">
          <p className="text-sm text-gray-700 mb-2">Filtering by tags:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-leaf-300 rounded-full hover:bg-red-50 transition-colors"
              >
                <span className="text-leaf-600">#{tag}</span>
                <span className="text-gray-400">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tag Filter Grid */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-gray-700 mb-3">Popular Tags</p>
        <div className="flex flex-wrap gap-2">
          {popularTags.map(tag => {
            const isSelected = selectedTags.includes(tag)
            const isFollowed = followedTags.includes(tag)
            
            return (
              <div key={tag} className="flex items-center gap-2">
                <button
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    isSelected
                      ? 'bg-leaf-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  #{tag}
                </button>
                
                {user && (
                  <button
                    onClick={() => handleFollowTag(tag, isFollowed)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      isFollowed
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-leaf-100 text-leaf-600 hover:bg-leaf-200'
                    }`}
                    title={isFollowed ? 'Unfollow this tag' : 'Follow this tag'}
                  >
                    {isFollowed ? '✓' : '+'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-3"></div>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600">
            {selectedTags.length > 0 || searchUsername ? 'Try adjusting your filters' : 'Be the first to share an eco action!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <div
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                {post.image_url ? (
                  <img
                    src={`http://localhost:3001${post.image_url}`}
                    alt="Eco action"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-leaf-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-leaf-600 font-semibold text-sm">
                    {post.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/profile/${post.user_id}`)
                    }}
                    className="font-semibold text-gray-900 text-sm hover:text-leaf-600 transition-colors truncate"
                  >
                    {post.user?.username || 'Anonymous'}
                  </button>
                  <p className="text-gray-500 text-xs">{formatDate(post.created_at)}</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {post.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-wrap">
                  {post.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-leaf-100 text-leaf-700 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="text-xs text-gray-500">+{post.tags.length - 2}</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-leaf-600">+{post.points} credits</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
