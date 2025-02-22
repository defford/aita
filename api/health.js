import { OpenAI } from 'openai';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY.trim(),
      maxRetries: 1,
      timeout: 5000
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.warn('OPENAI_API_KEY not found in environment');
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

export default async function handler(req, res) {
  console.log('Health check request received:', {
    method: req.method,
    headers: req.headers,
    url: req.url
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

    // Check OpenAI setup
    let openaiStatus = 'not_configured';
    let error = null;

    if (openai) {
      try {
        console.log('Testing OpenAI connection...');
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: "test" }],
          max_tokens: 5
        });
        console.log('OpenAI test successful:', completion.choices[0].message);
        openaiStatus = 'ok';
      } catch (e) {
        console.error('OpenAI test failed:', e);
        openaiStatus = 'error';
        error = e.message;
      }
    }

    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || 'development',
      openai: {
        status: openaiStatus,
        error: error,
        keyConfigured: !!process.env.OPENAI_API_KEY
      }
    };

    console.log('Health check response:', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Health check error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message
    });
  }
}
