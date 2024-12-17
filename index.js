const express = require('express');
const dotenv = require('dotenv');
const connecttomongodb = require('./config/db');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const translaterouter = require('./routes/translation');
const summaryRouter = require('./routes/summary');
const pdfrouter = require('./routes/pdfOCR');
const handwritting = require('./routes/handwrittingOCR')

dotenv.config();
connecttomongodb();

var app = express()
app.use(cors())
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/translate',translaterouter)
app.use('/api/pdf', pdfrouter);
app.use('/api/summary',summaryRouter)
app.use('/api/handwritting',handwritting)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))


