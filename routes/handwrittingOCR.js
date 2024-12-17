const express = require('express');
const fs = require('fs');
const axios = require('axios');
const router = express.Router();

// Load environment variables
const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT;
const AZURE_API_KEY = process.env.AZURE_API_KEY;

// Route for recognizing text from a local image
router.post('/', async (req, res) => {


  const { imagePath } = req.body;

  if (!imagePath) {
    return res.status(400).json({ error: 'Image path is required' });
  }

  try {
    // Read the image file as binary
    const imageBuffer = fs.readFileSync(imagePath);

    // Send the image buffer to Azure OCR
    const analyzeResponse = await axios.post(
      `${AZURE_ENDPOINT}/vision/v3.2/read/analyze`,
      imageBuffer,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_API_KEY,
          'Content-Type': 'application/octet-stream', 
        },
      }
    );

    const operationLocation = analyzeResponse.headers['operation-location'];
    let result;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
      result = await axios.get(operationLocation, {
        headers: { 'Ocp-Apim-Subscription-Key': AZURE_API_KEY },
      });
    } while (result.data.status === 'running');

    
    const readResults = result.data.analyzeResult.readResults;
    const recognizedText = readResults
      .map((page) =>
        page.lines.map((line) => line.text).join('\n')
      )
      .join('\n');

    res.json({ text: recognizedText });
  } catch (error) {
    console.error('Error during handwriting recognition:', error.message);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

module.exports = router;
