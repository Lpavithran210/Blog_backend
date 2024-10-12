import express from 'express'
import { addPost, deletePost, getAllPosts, getUserPosts, viewPost } from '../controllers/blogController.js'
import protect from '../middlewares/authMiddleware.js'
import upload from '../middlewares/upload.js'

const router = express.Router()

router.post('/create-post', protect, upload.single('banner'), addPost)

router.get('/posts', protect, getAllPosts)

router.get('/personal-posts/:id', protect, getUserPosts)

router.route('/:id').get(protect, viewPost).delete(protect, deletePost)


export default router