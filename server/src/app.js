import express from 'express'
import { connectDB } from './config/db.js';

const app = express()

await connectDB()



export default app