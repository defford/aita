import OpenAI from 'openai';

// Allowed origins
const allowedOrigins = [
  'https://aita-eta.vercel.app',
  'https://aita-backend.vercel.app',
  'http://localhost:5173'
];

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*', // Will be updated based on origin
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
};

export default async function handler(req, res) {
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(204).end();
  }

  // Set CORS headers for actual request
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
  }
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: { message: 'Method not allowed', code: '405' } });
    }

    // Initialize OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ error: { message: 'OpenAI API key not configured', code: 'MISSING_API_KEY' } });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY.trim(),
      maxRetries: 3,
      timeout: 30000
    });

    // Validate request body
    const { story } = req.body;
    if (!story) {
      return res.status(400).json({ error: { message: 'Story is required', code: 'MISSING_STORY' } });
    }

    console.log('Sending request to OpenAI');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Analyze this story."
        },
        { role: "user", content: story }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    console.log('OpenAI request successful', {
      responseLength: JSON.stringify(completion).length,
      tokensUsed: completion.usage
    });

    return res.status(200).json({
      analysis: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Analysis error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      error: {
        message: error.message || 'A server error has occurred',
        code: error.code || '500'
      }
    });
  }
}
