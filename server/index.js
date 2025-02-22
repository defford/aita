import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';

const app = express();

// Debug logging
console.log('Starting server with environment:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set'
});

// Enable CORS for all routes
const corsOptions = {
  origin: ['https://aita-eta.vercel.app', 'https://aita-backend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Handle preflight requests
app.options('*', cors(corsOptions));

// Enable CORS for all routes
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    path: req.path,
    headers: req.headers
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    }
  });
});

// Test endpoint
app.post('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Initialize OpenAI with better error handling
let openai;
try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY.trim(),
    maxRetries: 3,
    timeout: 30000
  });
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Failed to initialize OpenAI:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });
  openai = null;
}

// Story analysis endpoint
app.post('/api/analyze', async (req, res, next) => {
  const log = (level, message, data = {}) => {
    const logData = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    });
    console.log(logData);
  };

  try {
    log('info', 'Starting analysis request', {
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      openAIKeyExists: !!process.env.OPENAI_API_KEY,
      openAIKeyLength: process.env.OPENAI_API_KEY?.length,
      openAIClientInitialized: !!openai
    });

    const { story } = req.body;
    
    if (!story) {
      return res.status(400).json({ 
        error: {
          message: 'Story is required',
          code: 'MISSING_STORY'
        }
      });
    }

    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    log('info', 'Sending request to OpenAI');
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

    log('info', 'OpenAI request successful', {
      responseLength: JSON.stringify(completion).length,
      tokensUsed: completion.usage
    });

    res.json({ 
      analysis: completion.choices[0].message.content 
    });
  } catch (error) {
    log('error', 'Analysis endpoint error', {
      name: error.name,
      message: error.message,
      type: error.type,
      stack: error.stack
    });
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  
  res.status(500).json({
    error: {
      message: 'A server error has occurred',
      code: '500',
      type: err.name
    }
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
