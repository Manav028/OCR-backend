const express = require('express');
const { OpenAI } = require('openai');

const summaryRouter = express.Router();
summaryRouter.use(express.json());

const client = new OpenAI({
  apiKey: "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", 
});

const summarytext = async (req, res) => {
  console.log(req.body);
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required for summarization.' });
  }

  console.log("Received text for summarization:", text); 

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert summarizer. Provide a concise and clear summary for the given text.' },
        { role: 'user', content: `Summarize the following text: ${text}` },
      ],
    });

    const summary = response.choices[0]?.message?.content?.trim();
    if (!summary) {
      return res.status(500).json({ error: 'Failed to generate summary. Please try again.' });
    }

    console.log("Generated summary:", summary); 
    res.json({ summary });
  } catch (error) {
    console.error("Error from OpenAI API:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while generating the summary. Please try again later.' });
  }
}

summaryRouter.post('/', summarytext);

module.exports = summaryRouter;
