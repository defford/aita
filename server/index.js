import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('Available environment variables:', {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set',
  OPENAI_KEY: process.env.OPENAI_KEY ? 'Set' : 'Not set'
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.OPENAI_API_KEY_EXPORTED
});

if (!openai.apiKey) {
  console.error('No OpenAI API key found. Please set OPENAI_API_KEY environment variable.');
  process.exit(1);
}

const PERSONALITIES = {
  traditionalist: "I'm a firm believer in traditional values, respect, and doing things the 'right' way. Family values and social etiquette are very important to me. I tend to judge situations based on whether they follow established norms and show proper respect for traditions and authority.",
  
  free_spirit: "I believe life is too short for rigid rules. I value personal freedom, self-expression, and living authentically above social conventions. I judge situations based on whether people are being true to themselves and respecting others' freedom to do the same.",
  
  pragmatist: "I focus on practical outcomes and efficiency. I don't care much for drama or emotional arguments - what matters is what works. I judge situations based on their practical consequences and whether people are being sensible.",
  
  peace_keeper: "I hate conflict and believe harmony is the most important thing. I always try to see both sides and find middle ground. I judge situations based on whether people are making an effort to get along and avoid unnecessary drama.",
  
  tough_love: "I believe people need to hear the hard truth and toughen up. Life isn't fair, and coddling people doesn't help them grow. I judge situations based on whether people are taking responsibility and handling things like adults.",
  
  optimist: "I believe in giving people the benefit of the doubt and looking for the best in every situation. Most conflicts are just misunderstandings that can be resolved with good communication. I judge situations based on people's intentions rather than just their actions.",
  
  skeptic: "I question everything and don't take things at face value. People often have hidden motives, and there's usually more to the story. I judge situations by looking for what might not be said and considering alternative explanations.",
  
  justice_seeker: "I have a strong sense of fairness and believe everyone should be treated equally. I can't stand double standards or people taking advantage of others. I judge situations based on whether everyone is being treated fairly and getting what they deserve.",
  
  nurturer: "I believe in supporting and caring for others, especially those who are vulnerable or struggling. Empathy and understanding are crucial. I judge situations based on how people's emotional needs are being considered and met.",
  
  straight_shooter: "I tell it like it is and don't sugarcoat things. I value honesty and directness over politeness. I judge situations based on whether people are being straightforward and honest with each other."
};

app.post('/api/analyze', async (req, res) => {
  const { story } = req.body;
  
  if (!story) {
    return res.status(400).json({ error: 'No story provided' });
  }

  try {
    const responses = {};
    
    for (const [personality, perspective] of Object.entries(PERSONALITIES)) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { 
              role: "system", 
              content: `${perspective}

You are analyzing an AITA (Am I The Asshole?) story. Provide your analysis in this exact format:

[USER: YTA/NTA/UNDECIDED]
[OTHERS: YTA/NTA/UNDECIDED]

Then provide a brief 2-3 sentence explanation that MUST align with your verdicts:
- If USER is YTA, explain why their actions were wrong
- If USER is NTA, explain why their actions were reasonable
- If OTHERS are YTA, explain why their actions were wrong
- If OTHERS are NTA, explain why their actions were reasonable
- Use UNDECIDED only when there's truly insufficient information

Example 1:
[USER: YTA]
[OTHERS: NTA]
The user's actions were clearly inappropriate and harmful. Their behavior showed a complete disregard for others' feelings and property.

Example 2:
[USER: NTA]
[OTHERS: YTA]
The user's response was completely reasonable given the situation. The other party's actions were inconsiderate and violated basic social norms.`
            },
            { role: "user", content: story }
          ]
        });
        
        const response = completion.choices[0].message.content;
        
        // Extract verdicts using regex
        const userMatch = response.match(/\[USER: (YTA|NTA|UNDECIDED)\]/);
        const othersMatch = response.match(/\[OTHERS: (YTA|NTA|UNDECIDED)\]/);
        
        // Get the content after removing the verdict tags
        const content = response
          .replace(/\[USER: (YTA|NTA|UNDECIDED)\]/, '')
          .replace(/\[OTHERS: (YTA|NTA|UNDECIDED)\]/, '')
          .trim();

        responses[personality] = {
          content,
          verdicts: {
            user: userMatch ? userMatch[1] : 'UNDECIDED',
            others: othersMatch ? othersMatch[1] : 'UNDECIDED'
          }
        };
      } catch (error) {
        console.error(`Error with ${personality}:`, error);
        responses[personality] = {
          content: `Error getting ${personality}'s perspective: ${error.message}`,
          verdicts: {
            user: 'UNDECIDED',
            others: 'UNDECIDED'
          }
        };
      }
    }

    res.json(responses);
  } catch (error) {
    console.error('General error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
