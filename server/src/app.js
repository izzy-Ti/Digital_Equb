import express from 'express'
import { connectDB } from './config/db.js';
import cors from 'cors'
import auth from './route/authRoutes.js'

await connectDB()

const app = express()


app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));

app.use('/auth', auth)

export default app