import { OpenAI } from 'openai';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
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

    return new Response(
      JSON.stringify({
        status: 'ok',
        environment: process.env.VERCEL_ENV || 'development',
        openai: {
          status: openaiStatus,
          error: error,
          keyConfigured: !!process.env.OPENAI_API_KEY
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://aita-eta.vercel.app',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://aita-eta.vercel.app',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  }
}
