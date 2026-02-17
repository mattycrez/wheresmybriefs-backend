const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow all origins (you can restrict this to your Netlify URL later)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));
app.use(express.json({ limit: '10mb' }));

// Handle preflight requests
app.options('/api/chat', cors());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Where\'s My Briefs? API is running!',
    timestamp: new Date().toISOString()
  });
});

// Proxy endpoint for Anthropic API
app.post('/api/chat', async (req, res) => {
  console.log('Received chat request');
  console.log('API Key present:', !!process.env.ANTHROPIC_API_KEY);
  console.log('API Key starts with:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 20) : 'MISSING');
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log('Anthropic response status:', response.status);
    console.log('Anthropic response:', JSON.stringify(data).substring(0, 200));
    
    res.json(data);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}`);
});
