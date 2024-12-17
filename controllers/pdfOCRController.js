const path = require('path');
const fs = require('fs');
const pdfparse = require('pdf-parse');

const processPDF = async (req, res) => {
    try {
        const filePath = req.file.path;
        console.log(filePath)

        const pdfBuffer = fs.readFileSync(filePath);

        const data = await pdfparse(pdfBuffer);

        const extractedText = data.text;

        res.status(200).json({ text: extractedText });

        fs.unlinkSync(filePath);

    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        res.status(500).json({ error: 'Failed to extract text from PDF' });
    }
};

module.exports = processPDF
