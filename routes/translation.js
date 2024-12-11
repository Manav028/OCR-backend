import express from 'express'
import {translateText} from '../config/googletranslationconfig'
import manav from '../translate-google-json.json'

const translaterouter = express.Router();

router.post('/', async (req, res) => {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
        return res.status(400).json({ error: 'Text and targetLanguage are required' });
    }

    try {
        const translation = await translateText(text, targetLanguage);
        res.status(200).json({ original: text, translated: translation });
    } catch (error) {
        console.error('Translation error:', error.message);
        res.status(500).json({ error: 'Failed to translate text' });
    }
});

export default translaterouter;