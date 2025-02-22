import { OpenAI } from 'openai';

let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY.trim(),
      maxRetries: 3,
      timeout: 30000
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.warn('OPENAI_API_KEY not found in environment');
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

export default async function handler(req, res) {
  console.log('Analyze request received:', {
    method: req.method,
    headers: req.headers,
    url: req.url,
    body: req.body
  });

  try {
    // Set CORS headers
    const origin = req.headers.origin || 'https://aita-eta.vercel.app';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return res.status(204).end();
    }

    // Validate OpenAI setup
    if (!openai) {
      console.error('OpenAI client not initialized');
      throw new Error('OpenAI client not initialized');
    }

    // Validate request body
    if (!req.body || !req.body.story) {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({
        error: 'No story provided',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Sending request to OpenAI...');
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

    console.log('OpenAI response received:', {
      usage: completion.usage,
      model: completion.model,
      responseLength: completion.choices[0].message.content.length
    });

    return res.status(200).json({
      analysis: completion.choices[0].message.content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analysis error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    return res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
      code: error.code || '500'
    });
  }
}
