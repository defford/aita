import OpenAI from 'openai';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

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

    res.status(200).json({
      status: 'ok',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV
      },
      openai: {
        status: openaiStatus,
        error: error,
        keyConfigured: !!process.env.OPENAI_API_KEY
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}
