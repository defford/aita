import { OpenAI } from 'openai';

export default async function handler(req, res) {
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://aita-eta.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  // Set CORS headers for the actual request
  res.setHeader('Access-Control-Allow-Origin', 'https://aita-eta.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY.trim(),
      maxRetries: 3,
      timeout: 30000
    });

    if (!req.body || !req.body.story) {
      throw new Error('No story provided');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI that analyzes stories and determines if the author was in the wrong. Be direct and honest in your assessment."
        },
        {
          role: "user",
          content: req.body.story
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return res.status(200).json({
      analysis: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      error: error.message
    });
  }
}
