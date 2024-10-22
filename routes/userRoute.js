import express from 'express'
import { loginUser, registerUser, forgotPassword, verifyOTP, getUserDetails, updateUserDetails, resetPassword } from '../controllers/userController.js'
import {rateLimit} from 'express-rate-limit'

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 3
})

const router = express.Router()

router.post('/signup', limiter, registerUser)

router.post('/forgotpassword', limiter, forgotPassword)

router.post('/verify_otp', limiter, verifyOTP)

router.post('/reset_password', limiter, resetPassword);

router.post('/signin', limiter, loginUser)

router.patch('/update-profile', updateUserDetails)

router.get('/:name', getUserDetails)

export default router