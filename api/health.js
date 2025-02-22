import { OpenAI } from 'openai';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export const config = {
  runtime: 'nodejs'
};

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
    // Check OpenAI setup
    let openaiStatus = 'not_configured';
    let error = null;

    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY.trim(),
          maxRetries: 1,
          timeout: 5000
        });

        // Test the API key with a simple request
        await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: "test" }],
          max_tokens: 5
        });

        openaiStatus = 'ok';
      } catch (e) {
        openaiStatus = 'error';
        error = e.message;
      }
    }

    return res.status(200).json({
      status: 'ok',
      environment: process.env.VERCEL_ENV || 'development',
      openai: {
        status: openaiStatus,
        error: error,
        keyConfigured: !!process.env.OPENAI_API_KEY
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}
