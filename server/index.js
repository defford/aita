import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();

// Configure CORS to allow Vercel domains and localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://aita-defford.vercel.app',
  'https://aita-git-main-defford.vercel.app',
  'https://aita.vercel.app',
  'https://aita-oyu2jksx0-daniel-effords-projects.vercel.app',
  'https://aita-mvxjgiui7-daniel-effords-projects.vercel.app',
  'https://aita-h7ao65vmc-daniel-effords-projects.vercel.app'
];

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { story } = req.body;
    
    if (!story) {
      return res.status(400).json({ error: 'Story is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    const personalities = {
      traditionalist: "You are a traditionalist who values conventional wisdom and established norms.",
      free_spirit: "You are a free spirit who believes in personal freedom and unconventional solutions.",
      pragmatist: "You are a pragmatist who focuses on practical outcomes rather than ideological positions.",
      peace_keeper: "You are a peace keeper who seeks harmony and understanding between conflicting parties.",
      tough_love: "You are a tough love advocate who believes in hard truths and personal responsibility.",
      optimist: "You are an optimist who looks for the best in people and situations.",
      skeptic: "You are a skeptic who questions assumptions and looks for hidden motives.",
      justice_seeker: "You are a justice seeker who prioritizes fairness and equality.",
      nurturer: "You are a nurturer who emphasizes emotional well-being and personal growth.",
      straight_shooter: "You are a straight shooter who values direct communication and honesty."
    };

    const results = {};
    
    for (const [key, persona] of Object.entries(personalities)) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `${persona} Analyze this AITA (Am I The Asshole) story and provide your judgment. Your response should be in this format: {"verdict": "YTA/NTA/UNDECIDED", "explanation": "your explanation here"}`
          },
          { role: "user", content: story }
        ]
      });

      try {
        results[key] = JSON.parse(completion.choices[0].message.content);
      } catch (e) {
        console.error(`Failed to parse response for ${key}:`, e);
        results[key] = {
          verdict: "UNDECIDED",
          explanation: "Failed to analyze from this perspective."
        };
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
