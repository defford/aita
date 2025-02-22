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
app.use(cors({
  origin: ['https://aita-eta.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Initialize OpenAI
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} catch (error) {
  console.error('Failed to initialize OpenAI:', error);
}

// Story analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    // Debug environment and initialization state
    console.log('API Analysis Debug:', {
      environment: process.env.NODE_ENV,
      openAIKeyExists: !!process.env.OPENAI_API_KEY,
      openAIKeyLength: process.env.OPENAI_API_KEY?.length,
      openAIClientInitialized: !!openai,
      requestBody: {
        storyLength: req.body?.story?.length,
        hasStory: !!req.body?.story
      },
      memory: {
        heapUsed: process.memoryUsage().heapUsed / 1024 / 1024,
        heapTotal: process.memoryUsage().heapTotal / 1024 / 1024,
        external: process.memoryUsage().external / 1024 / 1024
      }
    });

    const { story } = req.body;
    
    if (!story) {
      return res.status(400).json({ 
        error: 'Story is required',
        code: 'MISSING_STORY'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        code: 'MISSING_API_KEY'
      });
    }

    if (!openai) {
      console.error('OpenAI client not initialized');
      return res.status(500).json({ 
        error: 'OpenAI client not initialized',
        code: 'CLIENT_NOT_INITIALIZED'
      });
    }

    try {
      // Test OpenAI connection
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Analyze this story."
          },
          { role: "user", content: story }
        ]
      });
      console.log('OpenAI API Response:', {
        status: 'success',
        responseLength: JSON.stringify(completion).length,
        tokensUsed: completion.usage
      });

      console.log('OpenAI test successful:', completion.choices[0].message);

      res.json({ 
        analysis: completion.choices[0].message.content 
      });
    } catch (openaiError) {
      console.error('OpenAI API Error:', {
        name: openaiError.name,
        message: openaiError.message,
        type: openaiError.type,
        status: openaiError.status,
        stack: openaiError.stack
      });
      throw openaiError;
    }
  } catch (error) {
    console.error('Analysis error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      error: 'Analysis failed',
      details: error.message,
      code: 'ANALYSIS_ERROR'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message,
    code: 'SERVER_ERROR'
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
