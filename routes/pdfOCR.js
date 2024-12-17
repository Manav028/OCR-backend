const express = require('express');
const multer = require('multer');
const processPDF = require('../controllers/pdfOCRController')

const pdfrouter = express.Router();

const upload = multer({ dest: 'uploads/' });

pdfrouter.post('/ocr', upload.single('file'), processPDF);

module.exports = pdfrouter;
