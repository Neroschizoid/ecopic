import express from 'express'
import multer from 'multer'
import path from 'path'
import pool from '../utils/database'
import { authenticateToken } from '../utils/auth'
import Joi from 'joi'
import axios from 'axios'

const router = express.Router()

// Configure multer for file uploads (temporary - you'd use S3 in production)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed') as any, false)
    }
  }
})

// Validation schema
const createPostSchema = Joi.object({
  description: Joi.string().min(10).max(1000).required(),
  tags: Joi.array().items(Joi.string().min(1).max(50)).min(1).required()
})

// Get personalized feed (followed users and tags)
router.get('/home/feed', async (req, res): Promise<any> => {
  try {
    const userId = req.query.userId as string
    const limit = parseInt(req.query.limit as string) || 20
    const offset = parseInt(req.query.offset as string) || 0
    
    if (!userId) {
      return res.status(400).json({ message: 'userId query parameter is required' })
    }
    
    // Get posts from followed users and followed tags
    const query = `
      SELECT DISTINCT p.id, p.user_id, p.image_url, p.description, p.tags, p.points, p.status, p.created_at, p.updated_at,
             u.username, u.avatar_url 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.status = 'PUBLISHED' AND (
        -- Posts from followed users
        p.user_id IN (
          SELECT following_id FROM user_follows WHERE follower_id = $1
        )
        OR
        -- Posts with followed tags
        EXISTS (
          SELECT 1 FROM tag_follows 
          WHERE user_id = $1 AND tag = ANY(p.tags)
        )
      )
      ORDER BY p.created_at DESC 
      LIMIT $2 OFFSET $3
    `
    
    try {
      const result = await pool.query(query, [userId, limit, offset])
      
      // Transform the data
      const posts = result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        image_url: row.image_url,
        description: row.description,
        tags: row.tags,
        points: row.points,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user: {
          username: row.username,
          avatar_url: row.avatar_url
        }
      }))
      
      res.json(posts)
    } catch (queryError) {
      console.error('Database query error in home feed:', queryError)
      // Return empty array if query fails (user may not have follows yet)
      res.json([])
    }
  } catch (error) {
    console.error('Get home feed error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get all posts (feed)
router.get('/', async (req, res): Promise<any> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20
    const offset = parseInt(req.query.offset as string) || 0
    const tag = req.query.tag as string
    const username = req.query.username as string
    const tags = req.query.tags as string // comma-separated tags
    
    let query = `
      SELECT p.id, p.user_id, p.image_url, p.description, p.tags, p.points, p.status, p.created_at, p.updated_at,
             u.username, u.avatar_url 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.status = 'PUBLISHED'
    `
    const values = []
    let paramCount = 1
    
    // Single tag filter (legacy)
    if (tag) {
      query += ` AND $${paramCount} = ANY(p.tags)`
      values.push(tag)
      paramCount++
    }
    
    // Multiple tags filter
    if (tags) {
      const tagsArray = tags.split(',')
      query += ` AND (
        ${tagsArray.map((_, i) => `$${paramCount + i} = ANY(p.tags)`).join(' OR ')}
      )`
      values.push(...tagsArray)
      paramCount += tagsArray.length
    }
    
    // Username/user search filter (case-insensitive partial match)
    if (username) {
      query += ` AND (u.username ILIKE $${paramCount} OR u.bio ILIKE $${paramCount})`
      values.push(`%${username}%`)
      paramCount++
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    values.push(limit, offset)
    
    const result = await pool.query(query, values)
    
    // Transform the data to match frontend expectations
    const posts = result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      image_url: row.image_url,
      description: row.description,
      tags: row.tags,
      points: row.points,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        username: row.username,
        avatar_url: row.avatar_url
      }
    }))
    
    res.json(posts)
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get single post
router.get('/:id', async (req, res): Promise<any> => {
  try {
    const { id } = req.params
    
    const result = await pool.query(
      `SELECT p.*, u.username, u.avatar_url 
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = $1`,
      [id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Get post error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Create new post
router.post('/', authenticateToken, upload.single('image'), async (req, res): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' })
    }
    
    // Parse tags if they come as JSON string
    let parsedData
    try {
      parsedData = {
        description: req.body.description,
        tags: typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags
      }
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid tags format' })
    }
    
    // Validate input
    const { error, value } = createPostSchema.validate(parsedData)
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details[0].message 
      })
    }
    
    const { description, tags } = value
    const imageUrl = `/uploads/${req.file.filename}` // In production, this would be S3 URL
    
    // Create post with PENDING_POINTS status
    const result = await pool.query(
      `INSERT INTO posts (user_id, image_url, description, tags, status) 
       VALUES ($1, $2, $3, $4, 'PENDING_POINTS') 
       RETURNING *`,
      [req.user!.userId, imageUrl, description, tags]
    )
    
    const post = result.rows[0]
    
    // Call middleware to calculate points (async)
    try {
      const middlewareUrl = process.env.MIDDLEWARE_URL || 'http://localhost:8000'
      const pointsResponse = await axios.post(`${middlewareUrl}/api/reward/`, {
        post_id: post.id,
        user_id: post.user_id,
        tags: tags,
        description: description,
        image_url: imageUrl
      }, { timeout: 10000 })
      
      const points = (pointsResponse.data as any)?.points || 200 // Default points if calculation fails
      
      // Update post with points and set status to PUBLISHED
      await pool.query(
        'UPDATE posts SET points = $1, status = $2 WHERE id = $3',
        [points, 'PUBLISHED', post.id]
      )
      
      // Update user's carbon credits
      await pool.query(
        'UPDATE users SET carbon_credits = carbon_credits + $1 WHERE id = $2',
        [points, req.user!.userId]
      )
      
      // Return updated post
      const updatedPost = await pool.query(
        `SELECT p.*, u.username, u.avatar_url 
         FROM posts p 
         JOIN users u ON p.user_id = u.id 
         WHERE p.id = $1`,
        [post.id]
      )
      
      res.status(201).json({
        message: 'Post created successfully',
        post: updatedPost.rows[0]
      })
      
    } catch (middlewareError) {
      console.error('Middleware error:', middlewareError)
      
      // Fallback: assign default points if middleware fails
      const fallbackPoints = 200
      await pool.query(
        'UPDATE posts SET points = $1, status = $2 WHERE id = $3',
        [fallbackPoints, 'PUBLISHED', post.id]
      )
      
      await pool.query(
        'UPDATE users SET carbon_credits = carbon_credits + $1 WHERE id = $2',
        [fallbackPoints, req.user!.userId]
      )
      
      const updatedPost = await pool.query(
        `SELECT p.*, u.username, u.avatar_url 
         FROM posts p 
         JOIN users u ON p.user_id = u.id 
         WHERE p.id = $1`,
        [post.id]
      )
      
      res.status(201).json({
        message: 'Post created successfully (points calculated with fallback)',
        post: updatedPost.rows[0]
      })
    }
    
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Delete post (only by owner)
router.delete('/:id', authenticateToken, async (req, res): Promise<any> => {
  try {
    const { id } = req.params
    
    // Check if post exists and user owns it
    const postResult = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [id]
    )
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' })
    }
    
    const post = postResult.rows[0]
    
    if (post.user_id !== req.user!.userId) {
      return res.status(403).json({ message: 'Can only delete your own posts' })
    }
    
    // Delete post
    await pool.query('DELETE FROM posts WHERE id = $1', [id])
    
    // Deduct points from user if post was published
    if (post.status === 'PUBLISHED' && post.points > 0) {
      await pool.query(
        'UPDATE users SET carbon_credits = GREATEST(carbon_credits - $1, 0) WHERE id = $2',
        [post.points, req.user!.userId]
      )
    }
    
    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router