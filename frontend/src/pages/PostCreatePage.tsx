import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { postsAPI } from '../api/client'
import toast from 'react-hot-toast'

interface PostForm {
  description: string
  customTag: string
}

const POPULAR_TAGS = [
  'tree-planting',
  'cleanup',
  'recycling',
  'energy-saving',
  'water-conservation',
  'community',
  'education',
  'composting',
  'sustainable-transport',
  'zero-waste'
]

export default function PostCreatePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostForm>()

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const addCustomTag = (customTag: string) => {
    const tag = customTag.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && !selectedTags.includes(tag) && !POPULAR_TAGS.includes(tag)) {
      setSelectedTags(prev => [...prev, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const onSubmit = async (data: PostForm) => {
    if (!selectedImage) {
      toast.error('Please select an image')
      return
    }

    if (selectedTags.length === 0) {
      toast.error('Please select at least one tag')
      return
    }

    try {
      setIsSubmitting(true)
      
      // Add custom tag if provided
      if (data.customTag.trim()) {
        addCustomTag(data.customTag)
      }

      const response = await postsAPI.createPost({
        image: selectedImage,
        description: data.description,
        tags: selectedTags
      })
      
      // Update user credits after successful post
      if (response.post && response.post.points) {
        updateUser({ carbon_credits: (user?.carbon_credits || 0) + response.post.points })
      }
      
      toast.success(`Post created successfully! +${response.post.points} credits earned!`)
      reset()
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedTags([])
      navigate('/')
    } catch (error: any) {
      console.error('Failed to create post:', error)
      // Error handled by API interceptor
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Eco Action</h1>
        <p className="text-gray-600 mb-8">Inspire others and earn carbon credits for your environmental efforts!</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo *
            </label>
            {!imagePreview ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-leaf-400 bg-leaf-50' 
                    : 'border-gray-300 hover:border-leaf-400'
                }`}
              >
                <input {...getInputProps()} />
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  {isDragActive ? 'Drop your image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, WEBP up to 10MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters'
                }
              })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-leaf-500 focus:border-leaf-500 resize-none"
              placeholder="Describe your eco-friendly action and its impact..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Tags Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags * (Select at least one)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-leaf-100 text-leaf-700 border-leaf-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected tags:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-leaf-100 text-leaf-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 h-3 w-3 text-leaf-500 hover:text-leaf-700"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Tag Input */}
            <div>
              <input
                {...register('customTag')}
                type="text"
                placeholder="Add custom tag (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-leaf-500 focus:border-leaf-500 text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-leaf-600 hover:bg-leaf-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-leaf-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Posting...
                </div>
              ) : (
                'Share Your Eco Action'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
