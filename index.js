import express from 'express';
import dotenv from 'dotenv'
import connecttomongodb from './config/db.js';
import authRoutes from './routes/auth.js'
import cors from 'cors'

dotenv.config();
connecttomongodb();

var app = express()
app.use(cors())

app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))


