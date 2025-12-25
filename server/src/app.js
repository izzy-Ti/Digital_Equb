import express from 'express'
import { connectDB } from './config/db.js';
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Import routes
import authRoutes from './route/authRoutes.js'
import equbRoutes from './route/equbRoutes.js'
import memberRoutes from './route/memberRoutes.js'
import contributionRoutes from './route/contributionRoutes.js'
import winnerRoutes from './route/winnerRoutes.js'
import adminRoutes from './route/adminRoutes.js'

// Import blockchain event listeners
import { startEventListeners } from './utils/eventListeners.js'

await connectDB()

const app = express()

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/equb', equbRoutes)
app.use('/api/member', memberRoutes)
app.use('/api/contribution', contributionRoutes)
app.use('/api/winner', winnerRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' })
})

// Start blockchain event listeners if contract address is configured
if (process.env.CONTRACT_ADDRESS) {
    try {
        startEventListeners(process.env.CONTRACT_ADDRESS);
        console.log('Blockchain event listeners started');
    } catch (error) {
        console.error('Failed to start event listeners:', error.message);
    }
}

export default app