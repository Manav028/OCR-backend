const express = require('express');
const axios = require('axios');

const translaterouter = express.Router();

translaterouter.post('/', async (req, res) => {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
        return res.status(400).json({ error: 'Text and targetLanguage are required' });
    }

    try {
        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2`,
            null,
            {
                params: {
                    key: process.env.GOOGLE_APPLICATION_KEY,
                    q: text,
                    target: targetLanguage,
                },
            }
        );

        const translatedText = response.data.data.translations[0].translatedText;

        res.status(200).json({
            original: text,
            translated: translatedText,
        });
    } catch (error) {
        console.error('Translation error:', error.message);
        res.status(500).json({ error: 'Failed to translate text' });
    }
});

module.exports = translaterouter;
