import { Router } from 'express'
import { getUserData, isAuth, login, logout, register, resetPassword, sendResetOTP, sendVerifyOTP, updateProfile, verifyOTP, linkWallet, unlinkWallet, googleLogin } from '../controller/authController.js'
import userAuth from '../middleware/authMiddleware.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/send-verification-otp', userAuth, sendVerifyOTP)
router.post('/verify-otp', userAuth, verifyOTP)
router.post('/is-auth', userAuth, isAuth)
router.post('/send-reset-password', sendResetOTP)
router.post('/reset-password', resetPassword)
router.post('/get-user-data', userAuth, getUserData)
router.post('/updateProfile', userAuth, updateProfile)

// Wallet management
router.post('/link-wallet', userAuth, linkWallet)
router.post('/unlink-wallet', userAuth, unlinkWallet)

// Google Auth
router.post('/google-login', googleLogin)

export default router


//POST http://localhost:4000/api/auth/logout
//POST http://localhost:4000/api/auth/login
//POST http://localhost:4000/api/auth/register
//POST http://localhost:4000/api/auth/send-verification-otp
//POST http://localhost:4000/api/auth/verify-otp
//POST http://localhost:4000/api/auth/is-auth
//POST http://localhost:4000/api/auth/send-reset-password
//POST http://localhost:4000/api/auth/reset-password
//POST http://localhost:4000/api/auth/get-user-data
//POST http://localhost:4000/api/auth/updateProfile
//POST http://localhost:4000/api/auth/link-wallet
//POST http://localhost:4000/api/auth/unlink-wallet