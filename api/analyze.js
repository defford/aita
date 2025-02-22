import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { story } = req.body;
    
    if (!story) {
      return res.status(400).json({ error: 'Story is required' });
    }

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

    res.status(200).json({ 
      analysis: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
}
